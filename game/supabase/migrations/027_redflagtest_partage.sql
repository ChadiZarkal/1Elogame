-- ===========================================================================
-- 027 — Red Flag Test : le partage, les archétypes, les ressources, les stats
--
-- Quatre ajouts qui ne se recoupent pas, mais qui arrivent ensemble :
--
--   · un code de partage sur chaque partie, pour qu'un résultat ait une adresse ;
--   · une table d'archétypes, pour que le récap nomme une personne et pas un palier ;
--   · de quoi accrocher une ressource d'aide à une catégorie, avec son seuil ;
--   · une fonction d'agrégation publique, pour la page de statistiques.
--
-- Aucune table des autres jeux n'est touchée.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Le code de partage
-- ---------------------------------------------------------------------------
-- Une partie partagée doit pouvoir être rejouée depuis son adresse. Rien n'est
-- stocké en plus du code : le résultat se RECALCULE depuis les réponses déjà
-- enregistrées. Figer un résultat voudrait dire qu'un lien partagé afficherait
-- éternellement des pourcentages de cohorte périmés, calculés sur la population
-- d'un jour donné.
--
-- Le code est nullable : les parties déjà enregistrées n'en ont pas, et leur en
-- fabriquer un a posteriori créerait des adresses que personne n'a jamais
-- partagées.

ALTER TABLE rft_runs ADD COLUMN IF NOT EXISTS share_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS rft_runs_share_code
  ON rft_runs (share_code) WHERE share_code IS NOT NULL;

COMMENT ON COLUMN rft_runs.share_code IS
  'Adresse publique de la partie. Le resultat est recalcule, jamais fige.';

-- ---------------------------------------------------------------------------
-- 2. Les archétypes
-- ---------------------------------------------------------------------------
-- « ÇA SE VOIT DE LOIN » décrit un score. « LE CONTRÔLEUR AFFECTUEUX » décrit
-- une personne — et c'est cela qu'on met en story. L'archétype se lit sur les
-- DEUX axes dominants du radar, pas sur le total.
--
-- La paire est non ordonnée et normalisée par la contrainte `tag_a < tag_b` :
-- sans elle, « Emprise + Loyauté » et « Loyauté + Emprise » seraient deux
-- lignes différentes, et la recherche dépendrait de l'ordre de tri des axes.
--
-- `tag_b` peut être nul : c'est l'archétype de quelqu'un dont un seul axe se
-- détache vraiment.

CREATE TABLE IF NOT EXISTS rft_archetypes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_a      UUID NOT NULL REFERENCES rft_tags(id) ON DELETE CASCADE,
  tag_b      UUID          REFERENCES rft_tags(id) ON DELETE CASCADE,
  emoji      TEXT,
  title      TEXT NOT NULL CHECK (length(trim(title)) > 0),
  subtitle   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rft_archetypes_paire_normalisee CHECK (tag_b IS NULL OR tag_a < tag_b),
  -- NULLS NOT DISTINCT : sans cela, deux archétypes « Emprise seule »
  -- passeraient tous les deux, puisque Postgres tient deux NULL pour
  -- différents.
  CONSTRAINT rft_archetypes_paire_unique UNIQUE NULLS NOT DISTINCT (tag_a, tag_b)
);

COMMENT ON TABLE rft_archetypes IS
  'Nom donne au profil, choisi sur les deux axes dominants du radar.';

CREATE INDEX IF NOT EXISTS rft_archetypes_par_tag ON rft_archetypes (tag_a, tag_b);

-- ---------------------------------------------------------------------------
-- 3. Les ressources d'aide
-- ---------------------------------------------------------------------------
-- Au-delà d'un certain niveau sur une catégorie, le jeu doit cesser de faire de
-- l'humour et proposer quelque chose. C'est ce qui sépare ce test d'un quiz de
-- magazine, et c'est la chose à faire quand quelqu'un vient de cocher « oui » à
-- la violence.
--
-- Le seuil vit sur la catégorie parce que c'est elle qui sait de quoi elle
-- parle : un seuil global sur le score total déclencherait un texte sur la
-- violence pour quelqu'un de simplement déloyal.

ALTER TABLE rft_tags ADD COLUMN IF NOT EXISTS resource_seuil INT
  CHECK (resource_seuil IS NULL OR resource_seuil BETWEEN 1 AND 100);
ALTER TABLE rft_tags ADD COLUMN IF NOT EXISTS resource_texte TEXT;
ALTER TABLE rft_tags ADD COLUMN IF NOT EXISTS resource_lien  TEXT;

COMMENT ON COLUMN rft_tags.resource_seuil IS
  'Pourcentage de l''axe au-dela duquel la ressource est proposee. NULL = jamais.';

-- ---------------------------------------------------------------------------
-- 4. Les statistiques publiques
-- ---------------------------------------------------------------------------
-- « 80 % ont répondu oui ; 70 % chez les hommes, 90 % chez les femmes. »
--
-- Le dénominateur est le nombre de parties ayant RÉPONDU À CETTE QUESTION, et
-- il est recalculé par sexe : comparer un pourcentage d'hommes au total général
-- donnerait des parts qui ne somment pas à cent et des écarts inventés.
--
-- Les réponses jamais choisies sortent quand même, à zéro : une réponse que
-- personne ne prend est une information, et la faire disparaître de la page
-- laisserait croire qu'elle n'existe pas.

CREATE OR REPLACE FUNCTION rft_stats_publiques()
RETURNS TABLE (
  question_id UUID,
  answer_id   UUID,
  choix       BIGINT,
  choix_h     BIGINT,
  choix_f     BIGINT,
  total       BIGINT,
  total_h     BIGINT,
  total_f     BIGINT
)
LANGUAGE sql STABLE AS $$
  WITH donnees AS (
    SELECT ra.question_id, ra.answer_id, r.sex
      FROM rft_run_answers ra
      JOIN rft_runs r ON r.id = ra.run_id
  ),
  denominateurs AS (
    SELECT question_id,
           count(*)                                AS total,
           count(*) FILTER (WHERE sex = 'homme')   AS total_h,
           count(*) FILTER (WHERE sex = 'femme')   AS total_f
      FROM donnees
     GROUP BY question_id
  )
  SELECT
    a.question_id,
    a.id,
    count(d.answer_id),
    count(*) FILTER (WHERE d.sex = 'homme'),
    count(*) FILTER (WHERE d.sex = 'femme'),
    coalesce(n.total,   0),
    coalesce(n.total_h, 0),
    coalesce(n.total_f, 0)
  FROM rft_answers a
  LEFT JOIN donnees       d ON d.answer_id   = a.id
  LEFT JOIN denominateurs n ON n.question_id = a.question_id
  GROUP BY a.question_id, a.id, n.total, n.total_h, n.total_f;
$$;

COMMENT ON FUNCTION rft_stats_publiques IS
  'Choix de chaque reponse, au total et par sexe, avec leurs denominateurs.';
