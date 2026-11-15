-- =============================================================================
-- 034_dixmais_traductions.sql
-- Les traductions anglaises saisies dans l'administration
--
-- ATTENTION : projet Supabase DÉDIÉ à « C'est un 10 mais… » (egdqxyykjhgkmpdzdzwy).
-- =============================================================================
--
-- POURQUOI
--   Le site anglais (/en) traduit le contenu de la base à la sortie des API,
--   avec des dictionnaires écrits dans le code et indexés par le texte
--   français. Un contenu ajouté ou réécrit dans l'admin s'affichait en
--   français sous /en jusqu'au déploiement suivant. Cette table permet de
--   saisir l'anglais depuis l'admin (zone « Traduction » de chaque panneau).
--
-- COMMENT C'EST LU
--   Le serveur cherche d'abord ici, puis dans le dictionnaire du code, puis
--   garde le français. Indexée par le texte français normalisé, comme les
--   dictionnaires : un texte réécrit perd sa traduction et retombe en français
--   plutôt que d'afficher un anglais qui ne lui correspond plus.
--
-- SANS RISQUE
--   Une table nouvelle, rien d'autre ne change. Le code tolère son absence
--   (dictionnaire seul, et l'admin le signale).
--
-- VÉRIFIER APRÈS COUP
--   select count(*) from public.traductions;   -- 0, puis ce que l'admin saisit
-- =============================================================================

create table if not exists public.traductions (
  -- Le jeu : 'dixmais' (« C'est un 10 mais… »).
  source      text        not null check (source in ('dixmais')),
  -- Le texte français, normalisé (apostrophes, espaces) : la clé de lecture.
  cle         text        not null,
  -- Le texte français tel qu'il était à l'enregistrement, pour l'affichage.
  texte_fr    text        not null,
  texte_en    text        not null check (length(trim(texte_en)) > 0),
  modifie_le  timestamptz not null default now(),
  primary key (source, cle)
);

-- Seul le serveur (clé service_role) lit et écrit : aucune politique pour
-- anon ni authenticated.
alter table public.traductions enable row level security;
