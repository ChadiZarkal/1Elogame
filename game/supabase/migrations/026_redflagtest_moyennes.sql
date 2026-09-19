-- ===========================================================================
-- 026 — Red Flag Test : la moyenne des cohortes, et la cohorte croisée
--
-- POURQUOI
--   « Top 39 % » est un rang, et un rang est abstrait : personne ne sait ce
--   qu'il faut faire pour passer de 39 à 20. « 12 points au-dessus de la
--   moyenne des hommes de ton âge » se comprend sans effort, et se répète à
--   voix haute — ce qu'un rang ne fait jamais.
--
--   La fonction rendait déjà l'effectif et le nombre de scores supérieurs. Elle
--   rend maintenant aussi la moyenne, et une quatrième cohorte croisant le sexe
--   et l'âge : c'est celle qui donne la phrase la plus juste, quand elle est
--   assez fournie pour être citée.
--
-- Le type de retour change, donc la fonction est supprimée avant d'être
-- recréée : CREATE OR REPLACE refuse de modifier la signature d'une fonction
-- qui rend une table.
-- ===========================================================================

DROP FUNCTION IF EXISTS rft_cohortes(INT, TEXT, TEXT);

CREATE FUNCTION rft_cohortes(p_score INT, p_sex TEXT, p_age TEXT)
RETURNS TABLE (cohorte TEXT, effectif BIGINT, plus_hauts BIGINT, moyenne NUMERIC)
LANGUAGE sql STABLE AS $$
  SELECT 'tous'::TEXT, count(*), count(*) FILTER (WHERE score > p_score), avg(score)
    FROM rft_runs
  UNION ALL
  SELECT 'sexe', count(*), count(*) FILTER (WHERE score > p_score), avg(score)
    FROM rft_runs WHERE p_sex IS NOT NULL AND sex = p_sex
  UNION ALL
  SELECT 'age', count(*), count(*) FILTER (WHERE score > p_score), avg(score)
    FROM rft_runs WHERE p_age IS NOT NULL AND age = p_age
  UNION ALL
  -- La cohorte croisée : la plus parlante, et la plus mince. C'est le code
  -- appelant qui décide si elle est assez fournie pour être citée.
  SELECT 'sexe_age', count(*), count(*) FILTER (WHERE score > p_score), avg(score)
    FROM rft_runs
   WHERE p_sex IS NOT NULL AND p_age IS NOT NULL AND sex = p_sex AND age = p_age;
$$;

COMMENT ON FUNCTION rft_cohortes IS
  'Effectif, scores strictement superieurs et moyenne, par cohorte.';
