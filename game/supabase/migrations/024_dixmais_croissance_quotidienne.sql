-- =============================================================================
-- 024_dixmais_croissance_quotidienne.sql
-- Tableau de bord d'administration — activité de « C'est un 10 mais… »
--
-- ATTENTION : vise le projet Supabase DÉDIÉ (egdqxyykjhgkmpdzdzwy), pas le
-- principal. Voir 023 pour la série des autres jeux.
-- =============================================================================
--
-- Le jeu vit sur sa propre base : sa courbe demande un second appel, et donc
-- une seconde fonction. Même découpage des journées qu'en 023 — à Paris, et
-- les jours creux rendus à zéro — pour que les deux séries puissent être
-- superposées sans décalage d'un jour.
-- =============================================================================

CREATE OR REPLACE FUNCTION dixmais_croissance_quotidienne(p_jours INT DEFAULT 180)
RETURNS TABLE (jour DATE, votes BIGINT)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH bornes AS (
    SELECT (CURRENT_DATE - (GREATEST(p_jours, 1) - 1)) AS depuis
  ),
  jours AS (
    SELECT generate_series((SELECT depuis FROM bornes), CURRENT_DATE, INTERVAL '1 day')::DATE AS jour
  ),
  v AS (
    SELECT (created_at AT TIME ZONE 'Europe/Paris')::DATE AS j, COUNT(*) AS n
      FROM dixmais_votes WHERE created_at >= (SELECT depuis FROM bornes) GROUP BY 1
  )
  SELECT j.jour, COALESCE(v.n, 0)
    FROM jours j LEFT JOIN v ON v.j = j.jour
   ORDER BY j.jour;
$$;
