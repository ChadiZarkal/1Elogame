-- =============================================================================
-- 019_dixmais_suppression_doublons.sql
-- « C'est un 10 mais… » — supprimer les exemplaires surnuméraires
-- =============================================================================
--
-- CONSTAT
--   La migration 018 a cumulé les compteurs des doublons sur l'exemplaire
--   conservé, puis désactivé les autres plutôt que de les supprimer. Le jeu
--   est donc propre — il ne sert que des textes distincts — mais la table
--   compte toujours 311 lignes pour 161 textes. Le backoffice, lui, liste
--   toutes les lignes : Chadi peut éditer ou supprimer une copie inactive sans
--   le moindre effet visible dans le jeu. C'est ce qui donne l'impression que
--   le panneau d'administration ne fonctionne pas.
--
-- LES COMPTEURS SONT DÉJÀ CUMULÉS — NE PAS LES RECALCULER
--   018 a écrit la somme des trois exemplaires sur celui qui est conservé, mais
--   n'a pas remis à zéro ceux des copies désactivées. Re-sommer le groupe
--   compterait donc tout en double : mesuré avant l'opération, la somme des
--   trois exemplaires donne 3 589 votes pour 2 954 lignes de vote réelles,
--   alors que le seul exemplaire conservé en porte 2 951. C'est lui qui a
--   raison. Cette migration ne touche à aucun compteur : moyennes et classement
--   sont identiques avant et après.
--
-- POURQUOI LA SUPPRESSION EST POSSIBLE MAINTENANT
--   `dixmais_votes.statement_id` est en ON DELETE CASCADE : c'est ce qui avait
--   fait reculer 018. Les votes des copies sont donc repointés vers
--   l'exemplaire conservé *avant* la suppression. Rien n'est perdu, ni les
--   compteurs, ni l'historique brut des votes.
--
-- RÉVERSIBLE
--   Les lignes supprimées sont d'abord copiées dans
--   `sauvegarde.dixmais_doublons_20260914`, avec l'id de l'exemplaire vers
--   lequel leurs votes ont été déplacés. Le schéma `sauvegarde` n'est pas
--   exposé par PostgREST : la copie n'est pas lisible depuis l'API publique.
--
-- Idempotent : relancé, ce script ne trouve plus de doublon et ne fait rien.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. État avant opération
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_lignes INT; v_textes INT; v_votes INT;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT LOWER(BTRIM(REGEXP_REPLACE(text, '\s+', ' ', 'g'))))
    INTO v_lignes, v_textes FROM dixmais_statements;
  SELECT COUNT(*) INTO v_votes FROM dixmais_votes;
  RAISE NOTICE 'AVANT : % lignes pour % textes distincts, % lignes de vote',
    v_lignes, v_textes, v_votes;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Copie de sauvegarde, qui sert aussi de liste de travail
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS sauvegarde;

CREATE TABLE IF NOT EXISTS sauvegarde.dixmais_doublons_20260914 (
  LIKE dixmais_statements
);

ALTER TABLE sauvegarde.dixmais_doublons_20260914
  ADD COLUMN IF NOT EXISTS garde_id      UUID,
  ADD COLUMN IF NOT EXISTS sauvegarde_le TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- L'exemplaire conservé est `MIN(id::TEXT)`, comme en 018 et comme
-- `dedupeByText` côté applicatif : les trois doivent désigner la même ligne.
INSERT INTO sauvegarde.dixmais_doublons_20260914
       (id, text, type, category, is_active, is_approved,
        votes_count, total_delta, elimination_count, created_at, garde_id)
SELECT s.id, s.text, s.type, s.category, s.is_active, s.is_approved,
       s.votes_count, s.total_delta, s.elimination_count, s.created_at,
       g.garde_id::UUID
  FROM dixmais_statements s
  JOIN (
    SELECT LOWER(BTRIM(REGEXP_REPLACE(text, '\s+', ' ', 'g'))) AS cle,
           MIN(id::TEXT) AS garde_id
      FROM dixmais_statements
     GROUP BY 1
    HAVING COUNT(*) > 1
  ) g ON g.cle = LOWER(BTRIM(REGEXP_REPLACE(s.text, '\s+', ' ', 'g')))
 WHERE s.id::TEXT <> g.garde_id
   AND NOT EXISTS (SELECT 1 FROM sauvegarde.dixmais_doublons_20260914 b
                    WHERE b.id = s.id);

-- ---------------------------------------------------------------------------
-- 3. Garde-fous — on ne supprime que des lignes que le jeu ne sert jamais
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_actifs INT; v_gardes_inactives INT;
BEGIN
  SELECT COUNT(*) INTO v_actifs
    FROM sauvegarde.dixmais_doublons_20260914 WHERE is_active;
  IF v_actifs > 0 THEN
    RAISE EXCEPTION 'Abandon : % exemplaire(s) actif(s) dans la liste a supprimer', v_actifs;
  END IF;

  SELECT COUNT(DISTINCT b.garde_id) INTO v_gardes_inactives
    FROM sauvegarde.dixmais_doublons_20260914 b
    JOIN dixmais_statements s ON s.id = b.garde_id
   WHERE NOT (s.is_active AND s.is_approved);
  IF v_gardes_inactives > 0 THEN
    RAISE EXCEPTION 'Abandon : % exemplaire(s) conserve(s) hors du pool jouable', v_gardes_inactives;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Repointer les votes AVANT la suppression
--    Sans cette étape, le ON DELETE CASCADE effacerait leur historique.
-- ---------------------------------------------------------------------------
UPDATE dixmais_votes v
   SET statement_id = b.garde_id
  FROM sauvegarde.dixmais_doublons_20260914 b
 WHERE v.statement_id = b.id;

-- ---------------------------------------------------------------------------
-- 5. Supprimer les exemplaires surnuméraires
-- ---------------------------------------------------------------------------
DELETE FROM dixmais_statements s
 USING sauvegarde.dixmais_doublons_20260914 b
 WHERE s.id = b.id;

-- ---------------------------------------------------------------------------
-- 6. Contrôle final
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_lignes INT; v_textes INT; v_votes INT; v_orphelins INT;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT LOWER(BTRIM(REGEXP_REPLACE(text, '\s+', ' ', 'g'))))
    INTO v_lignes, v_textes FROM dixmais_statements;
  SELECT COUNT(*) INTO v_votes FROM dixmais_votes;
  SELECT COUNT(*) INTO v_orphelins
    FROM dixmais_votes v
   WHERE NOT EXISTS (SELECT 1 FROM dixmais_statements s WHERE s.id = v.statement_id);

  RAISE NOTICE 'APRES : % lignes pour % textes distincts, % lignes de vote, % orphelins',
    v_lignes, v_textes, v_votes, v_orphelins;

  IF v_lignes <> v_textes THEN
    RAISE EXCEPTION 'Abandon : il reste % doublon(s)', v_lignes - v_textes;
  END IF;
  IF v_orphelins > 0 THEN
    RAISE EXCEPTION 'Abandon : % vote(s) sans enonce', v_orphelins;
  END IF;
END $$;

COMMIT;
