-- =============================================================================
-- 031_dixmais_cohorte_sans_soi.sql
-- « C'est un 10 mais… » — la cohorte, sans le joueur lui-même
--
-- ATTENTION : projet Supabase DÉDIÉ au jeu (egdqxyykjhgkmpdzdzwy).
-- =============================================================================
--
-- POURQUOI
--   Le bilan compare le joueur aux gens de son sexe et de son âge. Il le fait
--   à la fin de la partie, quand ses propres notes sont déjà enregistrées —
--   et il fait partie de sa cohorte. Tant que les notes de la mécanique
--   actuelle sont peu nombreuses, il se comparait donc surtout à lui-même, et
--   le bilan lui répondait « tu notes exactement comme les gens comme toi ».
--
-- CE QUE FAIT CETTE MIGRATION
--   Ajoute à `dixmais_cohort_notes` un paramètre `p_exclude_session` : les
--   notes de cette session ne comptent pas dans la moyenne de la cohorte.
--
--   DROP puis CREATE : ajouter un paramètre change la signature, et
--   CREATE OR REPLACE créerait une seconde fonction du même nom — PostgREST ne
--   saurait plus laquelle appeler. Le nouveau paramètre a une valeur par
--   défaut : un appel à trois arguments, d'un serveur pas encore redéployé,
--   continue de fonctionner (sans l'exclusion).
-- =============================================================================

BEGIN;

DROP FUNCTION IF EXISTS dixmais_cohort_notes(UUID[], TEXT, TEXT);

CREATE OR REPLACE FUNCTION dixmais_cohort_notes(
  p_statement_ids   UUID[],
  p_sex             TEXT DEFAULT NULL,
  p_age             TEXT DEFAULT NULL,
  p_exclude_session TEXT DEFAULT NULL
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
     AND (p_exclude_session IS NULL OR n.session_id IS DISTINCT FROM p_exclude_session)
   GROUP BY n.statement_id;
$$;

COMMIT;
