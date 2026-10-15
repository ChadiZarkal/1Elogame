-- =============================================================================
-- 030_dixmais_notes_isolees.sql
-- « C'est un 10 mais… » — les notes de la nouvelle mécanique
--
-- ATTENTION : cette migration vise le projet Supabase DÉDIÉ au jeu
-- (egdqxyykjhgkmpdzdzwy), comme 017 à 021 — pas le projet principal.
-- =============================================================================
--
-- POURQUOI UNE TABLE À PART
--   Depuis la v2 du jeu, chaque info se note seule, de 0 à 15 (un green flag
--   peut dépasser 10), et la personne reçoit la moyenne des cinq. Un vote de
--   l'ancienne mécanique, lui, mesurait ce qu'une révélation retirait à une
--   note cumulée, bornée à 10. Les deux ne se mélangent pas :
--     - `dixmais_votes.new_score` est contraint entre 0 et 10 ;
--     - une note isolée de 4 et un « −6 sur une note de 10 » ne disent pas la
--       même chose, et les additionner fausserait toutes les moyennes.
--   Les anciens votes restent intacts : ils servent d'estimation tant que la
--   nouvelle mécanique n'a pas assez de notes sur un énoncé.
--
-- CE QUE FAIT CETTE MIGRATION
--   1. crée `dixmais_notes` (une ligne par note, profil facultatif) ;
--   2. ajoute deux compteurs à `dixmais_statements` : `notes_count`,
--      `notes_total` — la moyenne s'en déduit sans relire les notes ;
--   3. crée `record_dixmais_note`, qui enregistre une note et met à jour les
--      compteurs dans la même transaction (pas de course entre deux joueurs) ;
--   4. crée `dixmais_cohort_notes`, la moyenne d'une cohorte énoncé par énoncé ;
--   5. reconstruit la vue du classement avec la note moyenne `avg_note`.
--
-- SANS RISQUE POUR LE JEU EN LIGNE
--   Le code tolère l'absence de cette migration (aucune note enregistrée,
--   estimation conservée) comme sa présence. Elle peut être jouée à tout
--   moment, et rejouée : chaque étape est idempotente.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Les notes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dixmais_notes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID        NOT NULL REFERENCES dixmais_statements(id) ON DELETE CASCADE,
  session_id   TEXT,
  note         SMALLINT    NOT NULL CHECK (note BETWEEN 0 AND 15),
  sex          TEXT        CHECK (sex IS NULL OR sex IN ('homme', 'femme', 'autre')),
  age          TEXT        CHECK (age IS NULL OR age IN ('16-18', '19-22', '23-26', '27+')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dixmais_notes_statement ON dixmais_notes (statement_id);
-- La cohorte se lit toujours « ce sexe, cet âge, ces énoncés ».
CREATE INDEX IF NOT EXISTS idx_dixmais_notes_cohorte   ON dixmais_notes (sex, age, statement_id);

-- Aucune politique publique : seul le serveur, avec la clé service role, lit
-- et écrit cette table, et cette clé traverse la RLS. L'activer sans politique
-- ferme la table à la clé anon.
ALTER TABLE dixmais_notes ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. Les compteurs sur les énoncés
-- ---------------------------------------------------------------------------
ALTER TABLE dixmais_statements
  ADD COLUMN IF NOT EXISTS notes_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes_total INT NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- 3. Enregistrer une note
--
--    Insertion et compteurs dans la même fonction, donc la même transaction :
--    deux joueurs qui notent le même énoncé au même instant ne s'écrasent pas
--    (`notes_count + 1` est calculé par la base, pas lu puis réécrit).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_dixmais_note(
  p_statement_id UUID,
  p_session_id   TEXT,
  p_note         INT,
  p_sex          TEXT DEFAULT NULL,
  p_age          TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO dixmais_notes (statement_id, session_id, note, sex, age)
  VALUES (p_statement_id, p_session_id, p_note, p_sex, p_age);

  UPDATE dixmais_statements SET
    notes_count = notes_count + 1,
    notes_total = notes_total + p_note
  WHERE id = p_statement_id;
END;
$$;

-- Le serveur seul : rien ne justifie qu'un visiteur appelle la fonction en
-- direct avec la clé anon, en contournant la validation de l'API.
REVOKE ALL ON FUNCTION record_dixmais_note(UUID, TEXT, INT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION record_dixmais_note(UUID, TEXT, INT, TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION record_dixmais_note(UUID, TEXT, INT, TEXT, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- 4. Moyenne d'une cohorte, énoncé par énoncé
--
--    Sur les seuls énoncés demandés — ceux que le joueur a vus — pour que la
--    comparaison porte sur le même panier de phrases (voir 021).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION dixmais_cohort_notes(
  p_statement_ids UUID[],
  p_sex           TEXT DEFAULT NULL,
  p_age           TEXT DEFAULT NULL
) RETURNS TABLE (
  statement_id UUID,
  notes        BIGINT,
  avg_note     NUMERIC
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT n.statement_id,
         COUNT(*)                          AS notes,
         ROUND(AVG(n.note)::NUMERIC, 2)    AS avg_note
    FROM dixmais_notes n
   WHERE n.statement_id = ANY (p_statement_ids)
     AND (p_sex IS NULL OR n.sex = p_sex)
     AND (p_age IS NULL OR n.age = p_age)
   GROUP BY n.statement_id;
$$;

-- ---------------------------------------------------------------------------
-- 5. Le classement, avec la note moyenne
--
--    DROP puis CREATE, et non CREATE OR REPLACE : `s.*` a été figé à la
--    création de la vue, et les deux colonnes ajoutées plus haut s'y
--    inséreraient au milieu — PostgreSQL refuse de renommer ou de déplacer une
--    colonne de vue existante.
-- ---------------------------------------------------------------------------
DROP VIEW IF EXISTS dixmais_statement_rankings;

CREATE VIEW dixmais_statement_rankings AS
SELECT
  s.*,
  CASE WHEN s.votes_count > 0
    THEN ROUND(s.total_delta::NUMERIC / s.votes_count, 2)
    ELSE 0
  END AS avg_delta,
  CASE WHEN s.votes_count > 0
    THEN ROUND(s.elimination_count::NUMERIC / s.votes_count * 100, 1)
    ELSE 0
  END AS elimination_rate,
  CASE WHEN s.notes_count > 0
    THEN ROUND(s.notes_total::NUMERIC / s.notes_count, 2)
  END AS avg_note
FROM dixmais_statements s
WHERE s.is_active = true AND s.is_approved = true;

-- Une vue supprimée puis recréée perd ses droits : on rend ceux qu'avait
-- l'ancienne, lue par le classement public.
GRANT SELECT ON dixmais_statement_rankings TO anon, authenticated, service_role;

COMMIT;
