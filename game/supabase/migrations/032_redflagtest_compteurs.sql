-- =============================================================================
-- 032_redflagtest_compteurs.sql
-- Red Flag Test — des compteurs à la place des recomptages
--
-- Projet Supabase PRINCIPAL (jcrtkvoxizrfttzerhfp).
-- =============================================================================
--
-- POURQUOI
--   Le 2026-10-23, la base est tombée sous un pic d'environ 3 300 parties par
--   heure. `rft_parts_reponses` joignait `rft_run_answers` sur `question_id` :
--   chaque fin de partie relisait TOUTES les réponses de TOUTES les parties. Son
--   temps est passé de 254 à 607 ms en trois heures, à trafic à peu près
--   constant, jusqu'à saturer la machine. `rft_stats_publiques` a le même
--   défaut, et `rft_cohortes` parcourt toute la table des parties à chaque appel.
--
-- CE QUE FAIT CETTE MIGRATION
--   1. `rft_answer_counts` : par réponse, combien l'ont choisie, au total, chez
--      les hommes et chez les femmes. Le total d'une question est la somme de
--      ses réponses : il n'est pas stocké, pour ne jamais diverger.
--   2. Des déclencheurs qui tiennent ces compteurs à jour, à l'écriture.
--   3. `rft_recompter()`, qui reconstruit tout depuis les parties. Elle sert au
--      remplissage initial, et à réparer si l'on doute un jour des chiffres.
--   4. `rft_distribution()` : les parties regroupées par (sexe, âge, score).
--      Quelques centaines de lignes au plus, d'où le serveur tire les
--      classements de toutes les cohortes, et qu'il garde une minute en cache.
--
--   Les anciennes fonctions restent : un serveur pas encore redéployé continue
--   de les appeler, et le nouveau code y revient si cette migration manque.
--
-- VÉRIFIER APRÈS COUP
--   SELECT sum(choix) FROM rft_answer_counts;   -- = SELECT count(*) FROM rft_run_answers;
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS rft_answer_counts (
  answer_id   UUID   PRIMARY KEY REFERENCES rft_answers(id)   ON DELETE CASCADE,
  question_id UUID   NOT NULL    REFERENCES rft_questions(id) ON DELETE CASCADE,
  choix       BIGINT NOT NULL DEFAULT 0,
  choix_h     BIGINT NOT NULL DEFAULT 0,
  choix_f     BIGINT NOT NULL DEFAULT 0
);

COMMENT ON TABLE rft_answer_counts IS
  'Choix de chaque reponse, tenus a jour par declencheur sur rft_run_answers.';

-- Même fermeture que le reste du test : RLS sans politique, service_role seul.
ALTER TABLE rft_answer_counts ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Les déclencheurs
-- ---------------------------------------------------------------------------
-- Au niveau de l'instruction, pas de la ligne : une partie insère ses trente
-- réponses en une fois, et les compteurs sont mis à jour en une seule requête.
--
-- Le sexe vient de `rft_runs`, insérée juste avant ses réponses et jamais
-- modifiée ensuite.
--
-- L'ORDER BY n'est pas décoratif. Deux parties simultanées verrouillent les
-- mêmes lignes de compteurs ; si elles les prenaient dans un ordre différent,
-- elles pourraient s'attendre l'une l'autre pour toujours. Triées par
-- identifiant, elles font la queue au lieu de se bloquer.

CREATE OR REPLACE FUNCTION rft_compter_ajouts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO rft_answer_counts AS c (answer_id, question_id, choix, choix_h, choix_f)
  SELECT n.answer_id,
         n.question_id,
         count(*),
         count(*) FILTER (WHERE r.sex = 'homme'),
         count(*) FILTER (WHERE r.sex = 'femme')
    FROM nouvelles n
    LEFT JOIN rft_runs r ON r.id = n.run_id
   GROUP BY n.answer_id, n.question_id
   ORDER BY n.answer_id
  ON CONFLICT (answer_id) DO UPDATE
     SET choix   = c.choix   + EXCLUDED.choix,
         choix_h = c.choix_h + EXCLUDED.choix_h,
         choix_f = c.choix_f + EXCLUDED.choix_f;
  RETURN NULL;
END;
$$;

-- Une réponse de partie effacée directement. Celles qu'emporte la suppression
-- de leur partie sont décomptées avant, par `rft_decompter_partie` : à ce
-- stade la partie n'est déjà plus visible, et la jointure les ignore — d'où
-- l'absence de double décompte. Celles qu'emporte la suppression d'une réponse
-- du questionnaire n'ont plus de compteur : il est parti avec elle, en cascade.
CREATE OR REPLACE FUNCTION rft_compter_retraits()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE rft_answer_counts c
     SET choix   = c.choix   - d.n,
         choix_h = c.choix_h - d.h,
         choix_f = c.choix_f - d.f
    FROM (
      SELECT a.answer_id,
             count(*)                                AS n,
             count(*) FILTER (WHERE r.sex = 'homme') AS h,
             count(*) FILTER (WHERE r.sex = 'femme') AS f
        FROM anciennes a
        JOIN rft_runs r ON r.id = a.run_id
       GROUP BY a.answer_id
    ) d
   WHERE c.answer_id = d.answer_id;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION rft_decompter_partie()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE rft_answer_counts c
     SET choix   = c.choix - 1,
         -- `IS NOT DISTINCT FROM` et non `=` : une partie sans sexe donnerait
         -- NULL, et le compteur avec lui.
         choix_h = c.choix_h - (OLD.sex IS NOT DISTINCT FROM 'homme')::INT,
         choix_f = c.choix_f - (OLD.sex IS NOT DISTINCT FROM 'femme')::INT
    FROM rft_run_answers ra
   WHERE ra.run_id = OLD.id
     AND c.answer_id = ra.answer_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS rft_compter_ajouts ON rft_run_answers;
CREATE TRIGGER rft_compter_ajouts
  AFTER INSERT ON rft_run_answers
  REFERENCING NEW TABLE AS nouvelles
  FOR EACH STATEMENT EXECUTE FUNCTION rft_compter_ajouts();

DROP TRIGGER IF EXISTS rft_compter_retraits ON rft_run_answers;
CREATE TRIGGER rft_compter_retraits
  AFTER DELETE ON rft_run_answers
  REFERENCING OLD TABLE AS anciennes
  FOR EACH STATEMENT EXECUTE FUNCTION rft_compter_retraits();

DROP TRIGGER IF EXISTS rft_decompter_partie ON rft_runs;
CREATE TRIGGER rft_decompter_partie
  BEFORE DELETE ON rft_runs
  FOR EACH ROW EXECUTE FUNCTION rft_decompter_partie();

-- ---------------------------------------------------------------------------
-- La reconstruction
-- ---------------------------------------------------------------------------
-- Le verrou empêche une partie de s'écrire entre l'effacement et le recomptage :
-- elle serait comptée deux fois, ou pas du tout. Il bloque les fins de partie
-- le temps du recomptage, une seconde ou deux.

CREATE OR REPLACE FUNCTION rft_recompter()
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
  total BIGINT;
BEGIN
  LOCK TABLE rft_run_answers IN SHARE ROW EXCLUSIVE MODE;
  DELETE FROM rft_answer_counts;
  INSERT INTO rft_answer_counts (answer_id, question_id, choix, choix_h, choix_f)
  SELECT ra.answer_id,
         ra.question_id,
         count(*),
         count(*) FILTER (WHERE r.sex = 'homme'),
         count(*) FILTER (WHERE r.sex = 'femme')
    FROM rft_run_answers ra
    LEFT JOIN rft_runs r ON r.id = ra.run_id
   GROUP BY ra.answer_id, ra.question_id;
  SELECT coalesce(sum(choix), 0) INTO total FROM rft_answer_counts;
  RETURN total;
END;
$$;

COMMENT ON FUNCTION rft_recompter IS
  'Reconstruit rft_answer_counts depuis rft_run_answers. Rend le nombre de choix comptes.';

SELECT rft_recompter();

-- ---------------------------------------------------------------------------
-- La distribution des scores
-- ---------------------------------------------------------------------------

-- Un seul document JSON plutôt qu'une table : PostgREST tronque à mille lignes
-- ce qu'une fonction rend en lignes, et quatre sexes × cinq âges × des scores
-- de 0 à 150 en font déjà trois mille. Chaque élément est
-- [sexe, âge, score, effectif].
DROP FUNCTION IF EXISTS rft_distribution();
CREATE FUNCTION rft_distribution()
RETURNS JSONB
LANGUAGE sql STABLE AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_array(sex, age, score, n)), '[]'::jsonb)
    FROM (
      SELECT sex, age, score, count(*) AS n
        FROM rft_runs
       GROUP BY sex, age, score
    ) d;
$$;

COMMENT ON FUNCTION rft_distribution IS
  'Parties par (sexe, age, score), en [sexe, age, score, effectif] : les cohortes se calculent a partir de la.';

-- Le jeu les appelle en service_role ; personne d'autre n'en a l'usage.
REVOKE ALL ON FUNCTION rft_recompter()   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION rft_distribution() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION rft_recompter()    TO service_role;
GRANT EXECUTE ON FUNCTION rft_distribution() TO service_role;

COMMIT;
