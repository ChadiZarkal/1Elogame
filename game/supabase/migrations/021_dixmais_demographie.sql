-- =============================================================================
-- 021_dixmais_demographie.sql
-- « C'est un 10 mais… » — qui vote, et comparaison par cohorte
-- =============================================================================
--
-- POURQUOI
--   Les autres jeux du site demandent le sexe et la tranche d'âge du joueur et
--   s'en servent pour leurs statistiques. « C'est un 10 mais… » enregistrait
--   ses votes sans rien de tout cela : impossible de dire à quelqu'un s'il est
--   plus sévère que les gens de son âge, alors que c'est précisément la
--   comparaison qui intéresse.
--
-- LES COLONNES SONT NULLABLES, ET C'EST VOULU
--   Un vote sans profil reste un vote : il compte dans la moyenne générale,
--   simplement pas dans une cohorte. Rendre le profil obligatoire aurait
--   transformé un jeu de soirée en formulaire.
--
-- LA COMPARAISON SE FAIT PHRASE PAR PHRASE
--   `dixmais_cohort_stats` ne rend pas la moyenne de la cohorte sur *tous* les
--   énoncés, mais sur ceux que le joueur a réellement vus. Comparer sa moyenne
--   à une moyenne calculée sur un autre panier d'énoncés donnerait un écart qui
--   ne mesure que la différence de tirage.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Qui a voté
-- ---------------------------------------------------------------------------
ALTER TABLE dixmais_votes
  ADD COLUMN IF NOT EXISTS sex TEXT,
  ADD COLUMN IF NOT EXISTS age TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dixmais_votes_sex_check'
  ) THEN
    ALTER TABLE dixmais_votes ADD CONSTRAINT dixmais_votes_sex_check
      CHECK (sex IS NULL OR sex IN ('homme', 'femme', 'autre'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dixmais_votes_age_check'
  ) THEN
    ALTER TABLE dixmais_votes ADD CONSTRAINT dixmais_votes_age_check
      CHECK (age IS NULL OR age IN ('16-18', '19-22', '23-26', '27+'));
  END IF;
END $$;

-- La cohorte se lit toujours « ce sexe, cet âge, ces énoncés ».
CREATE INDEX IF NOT EXISTS idx_dixmais_votes_cohorte
  ON dixmais_votes (sex, age, statement_id);

-- ---------------------------------------------------------------------------
-- 2. Enregistrement du vote, profil compris
--
--    DROP puis CREATE, et non CREATE OR REPLACE : ajouter des paramètres change
--    la signature, et PostgreSQL créerait une surcharge. Deux fonctions de même
--    nom, et PostgREST ne saurait plus laquelle appeler.
--
--    Les deux nouveaux paramètres ont une valeur par défaut : un client qui
--    n'envoie que les six premiers — un onglet ouvert avant le déploiement —
--    continue de fonctionner.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS record_dixmais_vote(UUID, TEXT, INT, INT, INT, BOOLEAN);

CREATE OR REPLACE FUNCTION record_dixmais_vote(
  p_statement_id   UUID,
  p_session_id     TEXT,
  p_previous_score INT,
  p_new_score      INT,
  p_delta          INT,
  p_is_elimination BOOLEAN,
  p_sex            TEXT DEFAULT NULL,
  p_age            TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO dixmais_votes
    (statement_id, session_id, previous_score, new_score, delta, is_elimination, sex, age)
  VALUES
    (p_statement_id, p_session_id, p_previous_score, p_new_score, p_delta, p_is_elimination,
     p_sex, p_age);

  UPDATE dixmais_statements SET
    votes_count       = votes_count + 1,
    total_delta       = total_delta + p_delta,
    elimination_count = elimination_count + CASE WHEN p_is_elimination THEN 1 ELSE 0 END
  WHERE id = p_statement_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Statistiques d'une cohorte, sur les énoncés demandés
--
--    `STABLE` et non `SECURITY DEFINER` : seul le serveur l'appelle, avec la
--    clé service role, qui traverse déjà la RLS. Une fonction en definer de
--    plus serait signalée par l'auditeur de sécurité sans rien apporter.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION dixmais_cohort_stats(
  p_statement_ids UUID[],
  p_sex           TEXT DEFAULT NULL,
  p_age           TEXT DEFAULT NULL
) RETURNS TABLE (
  statement_id     UUID,
  votes            BIGINT,
  avg_delta        NUMERIC,
  elimination_rate NUMERIC
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT v.statement_id,
         COUNT(*)                                                          AS votes,
         ROUND(AVG(v.delta)::NUMERIC, 2)                                   AS avg_delta,
         ROUND(AVG(CASE WHEN v.is_elimination THEN 1 ELSE 0 END) * 100, 1) AS elimination_rate
    FROM dixmais_votes v
   WHERE v.statement_id = ANY (p_statement_ids)
     AND (p_sex IS NULL OR v.sex = p_sex)
     AND (p_age IS NULL OR v.age = p_age)
   GROUP BY v.statement_id;
$$;

COMMIT;
