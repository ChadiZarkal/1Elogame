-- =============================================================================
-- 022_participations_segmentees_rattrapage.sql
-- « Le pire des deux » — réparer les compteurs et débloquer l'ELO
--
-- ATTENTION : cette migration vise le projet Supabase PRINCIPAL
-- (jcrtkvoxizrfttzerhfp), celui de tous les jeux sauf « C'est un 10 mais… ».
-- Les migrations 017 à 021 visent l'autre projet. Le dossier est commun, pas
-- les bases.
-- =============================================================================
--
-- CONSTAT
--   Depuis le 14 juillet 2026, aucun vote ne modifie plus rien : ni l'ELO, ni
--   les compteurs de participation. 3 547 votes — 28 % du total — n'ont eu
--   aucun effet, et 37 éléments actifs sont restés à leur ELO de départ, 1000.
--   Côté joueur, cela se voit à l'écran de résultat : une proposition qui a
--   reçu des dizaines de votes affiche « 1 vote », parce que l'affichage rend
--   `nb_participations + 1` et que le compteur en base vaut toujours zéro.
--
-- CAUSE
--   La migration 004 ajoutait sept colonnes de participation par segment. Elle
--   n'a jamais été jouée sur cette base. Le code, lui, les écrit : jusqu'en
--   juillet il le faisait dans une requête séparée, qui échouait seule, sans
--   emporter le reste. Le correctif du 14 juillet a fusionné toutes les
--   écritures en une seule requête — et depuis, la colonne inexistante fait
--   rejeter l'ensemble, ELO global et compteur compris.
--
--   L'échec n'a jamais été vu parce que le résultat de cette requête n'est pas
--   lu : les promesses partent dans un `Promise.all` dont on ignore la valeur.
--
-- CE QUE FAIT CETTE MIGRATION
--   1. crée les sept colonnes manquantes, comme 004 aurait dû le faire ;
--   2. recalcule les compteurs par segment depuis la table `votes` ;
--   3. recalcule `nb_participations`, qui accusait 7 160 participations de
--      retard — les 2 644 perdues depuis juillet, et le reste accumulé avant
--      par des écritures concurrentes qui s'écrasaient l'une l'autre.
--
-- CE QU'ELLE NE FAIT PAS
--   Elle ne reconstruit pas l'ELO. Le rejouer demanderait de repasser les
--   12 588 votes dans l'ordre, ce qui redistribuerait tout le classement
--   public : c'est une décision de produit, pas une réparation de bug.
--
-- Idempotent : relancée, elle recalcule les mêmes valeurs.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Les sept colonnes que le code écrit depuis février 2026
-- ---------------------------------------------------------------------------
ALTER TABLE elements
  ADD COLUMN IF NOT EXISTS nb_participations_homme   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nb_participations_femme   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nb_participations_autre   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nb_participations_16_18   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nb_participations_19_22   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nb_participations_23_26   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nb_participations_27plus  INTEGER DEFAULT 0;

-- ---------------------------------------------------------------------------
-- 2. Recalcul depuis les votes
--
--    Un élément participe à un duel qu'il le gagne ou le perde : les deux
--    colonnes de `votes` comptent. Une seule passe, dépliée puis agrégée,
--    plutôt que sept sous-requêtes corrélées par ligne comme en 004 — la table
--    compte aujourd'hui 12 588 votes pour 298 éléments.
-- ---------------------------------------------------------------------------
WITH participations AS (
  SELECT element_id,
         COUNT(*)                                                      AS total,
         COUNT(*) FILTER (WHERE sexe_votant = 'homme')                 AS homme,
         COUNT(*) FILTER (WHERE sexe_votant = 'femme')                 AS femme,
         COUNT(*) FILTER (WHERE sexe_votant NOT IN ('homme', 'femme'))  AS autre,
         COUNT(*) FILTER (WHERE age_votant = '16-18')                  AS a16_18,
         COUNT(*) FILTER (WHERE age_votant = '19-22')                  AS a19_22,
         COUNT(*) FILTER (WHERE age_votant = '23-26')                  AS a23_26,
         COUNT(*) FILTER (WHERE age_votant = '27+')                    AS a27plus
    FROM (
      SELECT element_gagnant_id AS element_id, sexe_votant, age_votant FROM votes
      UNION ALL
      SELECT element_perdant_id,                sexe_votant, age_votant FROM votes
    ) v
   GROUP BY element_id
)
UPDATE elements e SET
  nb_participations        = COALESCE(p.total,   0),
  nb_participations_homme  = COALESCE(p.homme,   0),
  nb_participations_femme  = COALESCE(p.femme,   0),
  nb_participations_autre  = COALESCE(p.autre,   0),
  nb_participations_16_18  = COALESCE(p.a16_18,  0),
  nb_participations_19_22  = COALESCE(p.a19_22,  0),
  nb_participations_23_26  = COALESCE(p.a23_26,  0),
  nb_participations_27plus = COALESCE(p.a27plus, 0)
  FROM (SELECT id FROM elements) ids
  LEFT JOIN participations p ON p.element_id = ids.id
 WHERE e.id = ids.id;

-- ---------------------------------------------------------------------------
-- 3. Contrôle
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_compteurs BIGINT; v_reels BIGINT; v_incoherents INT;
BEGIN
  SELECT SUM(nb_participations) INTO v_compteurs FROM elements;
  SELECT COUNT(*) * 2 INTO v_reels FROM votes;

  SELECT COUNT(*) INTO v_incoherents FROM elements
   WHERE nb_participations <> nb_participations_homme + nb_participations_femme + nb_participations_autre;

  RAISE NOTICE 'APRES : % participations comptees pour % reelles', v_compteurs, v_reels;

  IF v_compteurs <> v_reels THEN
    RAISE EXCEPTION 'Abandon : % participations comptees contre % reelles', v_compteurs, v_reels;
  END IF;
  IF v_incoherents > 0 THEN
    RAISE EXCEPTION 'Abandon : % element(s) dont la somme par sexe ne fait pas le total', v_incoherents;
  END IF;
END $$;

COMMIT;
