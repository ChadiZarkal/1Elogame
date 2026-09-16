-- =============================================================================
-- 023_croissance_quotidienne.sql
-- Tableau de bord d'administration — série d'activité, jour par jour
--
-- ATTENTION : vise le projet Supabase PRINCIPAL (jcrtkvoxizrfttzerhfp), celui
-- de tous les jeux sauf « C'est un 10 mais… ». Voir 024 pour l'autre base.
-- =============================================================================
--
-- POURQUOI UNE FONCTION ET PAS DES REQUÊTES
--   PostgREST ne sait pas grouper. Sans fonction, il faudrait rapatrier les
--   12 594 dates de vote pour les compter côté serveur Node — et l'API coupe
--   par défaut à mille lignes, ce qui rendrait le compte silencieusement faux.
--   Ici, une ligne par jour part sur le réseau, et le compte est exact quel que
--   soit le volume.
--
-- LES JOURS VIDES SONT RENDUS À ZÉRO
--   `generate_series` fabrique le calendrier avant la jointure. Sans cela, un
--   jour sans activité disparaîtrait de la série, et la courbe relierait les
--   deux jours voisins en ligne droite — une panne de vingt-quatre heures y
--   ressemblerait à une journée normale.
--
-- FUSEAU
--   Les journées sont découpées à Paris et non en UTC : le public est français,
--   et une soirée de jeu doit compter pour le jour où elle a eu lieu.
-- =============================================================================

CREATE OR REPLACE FUNCTION croissance_quotidienne(p_jours INT DEFAULT 180)
RETURNS TABLE (jour DATE, votes BIGINT, oracle BIGINT, sessions BIGINT)
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
      FROM votes WHERE created_at >= (SELECT depuis FROM bornes) GROUP BY 1
  ),
  o AS (
    SELECT (created_at AT TIME ZONE 'Europe/Paris')::DATE AS j, COUNT(*) AS n
      FROM flagornot_submissions WHERE created_at >= (SELECT depuis FROM bornes) GROUP BY 1
  ),
  s AS (
    SELECT (created_at AT TIME ZONE 'Europe/Paris')::DATE AS j, COUNT(*) AS n
      FROM analytics_sessions WHERE created_at >= (SELECT depuis FROM bornes) GROUP BY 1
  )
  SELECT j.jour, COALESCE(v.n, 0), COALESCE(o.n, 0), COALESCE(s.n, 0)
    FROM jours j
    LEFT JOIN v ON v.j = j.jour
    LEFT JOIN o ON o.j = j.jour
    LEFT JOIN s ON s.j = j.jour
   ORDER BY j.jour;
$$;
