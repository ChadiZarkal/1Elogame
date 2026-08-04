-- =============================================================================
-- 018_dixmais_dedupe_and_seed.sql
-- « C'est un 10 mais… » — consolide les énoncés en doublon, puis élargit le pool
-- =============================================================================
--
-- CONSTAT
--   La table sert ~204 lignes actives et approuvées pour seulement ~76 textes
--   distincts : la plupart des énoncés y figurent en trois exemplaires, sous
--   trois id différents. La liste d'exclusion du client raisonnant sur des id,
--   un doublon revenait indéfiniment sous un autre id sans jamais être filtré.
--   Le joueur voyait « Il est narcissique » trois fois par session et en
--   concluait que le catalogue était minuscule.
--
-- POURQUOI DÉSACTIVER ET NON SUPPRIMER
--   `dixmais_votes.statement_id` est déclaré ON DELETE CASCADE (migration 017,
--   ligne 28). Un DELETE sur un doublon effacerait donc **tous ses votes**.
--   Les compteurs sont ici cumulés sur l'exemplaire conservé, puis les autres
--   sont désactivés : rien n'est détruit, l'opération se défait d'un UPDATE, et
--   la vue `dixmais_statement_rankings` filtrant sur `is_active` les fait
--   disparaître du classement sans autre intervention.
--
-- CHOIX DE L'EXEMPLAIRE CONSERVÉ
--   `min(id::text)`, et non un tirage : le code applicatif retient lui aussi le
--   plus petit id sous sa forme texte (`dedupeByText`, lib/repositories/dixmais).
--   Les deux doivent désigner la même ligne, sinon les compteurs seraient
--   cumulés sur un énoncé que le jeu ne sert jamais.
--
-- NORMALISATION
--   Casse, espaces multiples et blancs de bord — identique à `textKey` côté
--   applicatif. Deux énoncés qui ne diffèrent que par cela sont un doublon.
--
-- Idempotent : relancer ce script ne produit aucun changement supplémentaire.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. État avant opération
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_lignes INT; v_textes INT;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT LOWER(BTRIM(REGEXP_REPLACE(text, '\s+', ' ', 'g'))))
    INTO v_lignes, v_textes
    FROM dixmais_statements WHERE is_active AND is_approved;
  RAISE NOTICE 'AVANT : % lignes actives, % textes distincts (% doublons)',
    v_lignes, v_textes, v_lignes - v_textes;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Cumuler les compteurs des doublons sur l'exemplaire conservé
--    Fait AVANT la désactivation : la source doit encore être visible.
-- ---------------------------------------------------------------------------
WITH norme AS (
  SELECT id, votes_count, total_delta, elimination_count,
         LOWER(BTRIM(REGEXP_REPLACE(text, '\s+', ' ', 'g'))) AS cle
    FROM dixmais_statements
   WHERE is_active AND is_approved
),
garde AS (
  SELECT cle, MIN(id::TEXT) AS garde_id FROM norme GROUP BY cle
),
cumul AS (
  SELECT cle,
         SUM(votes_count)       AS votes_count,
         SUM(total_delta)       AS total_delta,
         SUM(elimination_count) AS elimination_count
    FROM norme GROUP BY cle
)
UPDATE dixmais_statements s
   SET votes_count       = c.votes_count,
       total_delta       = c.total_delta,
       elimination_count = c.elimination_count
  FROM garde g
  JOIN cumul c ON c.cle = g.cle
 WHERE s.id::TEXT = g.garde_id
   AND (s.votes_count, s.total_delta, s.elimination_count)
       IS DISTINCT FROM (c.votes_count, c.total_delta, c.elimination_count);

-- ---------------------------------------------------------------------------
-- 3. Désactiver les exemplaires surnuméraires
-- ---------------------------------------------------------------------------
WITH norme AS (
  SELECT id, LOWER(BTRIM(REGEXP_REPLACE(text, '\s+', ' ', 'g'))) AS cle
    FROM dixmais_statements
   WHERE is_active AND is_approved
),
garde AS (
  SELECT cle, MIN(id::TEXT) AS garde_id FROM norme GROUP BY cle
)
UPDATE dixmais_statements s
   SET is_active = false
  FROM norme n
  JOIN garde g ON g.cle = n.cle
 WHERE s.id = n.id
   AND s.id::TEXT <> g.garde_id;

-- ---------------------------------------------------------------------------
-- 4. Nouveaux énoncés
--
--    Le jeu tire 4 négatifs pour 1 positif par profil : c'est le stock de
--    négatifs qui borne la durée d'une session, d'où la proportion retenue.
--
--    Le WHERE NOT EXISTS rend l'insertion rejouable et protège contre le
--    problème que cette migration corrige : aucun texte déjà présent, à la
--    casse et aux espaces près, ne peut être réintroduit.
-- ---------------------------------------------------------------------------
INSERT INTO dixmais_statements (text, type, category)
SELECT v.text, v.type, v.category
  FROM (VALUES
    -- ── Négatifs : relationnel ───────────────────────────────────────────
    ('Il like les photos de son ex tous les jours',              'negative', 'dating'),
    ('Il ne présente jamais personne à ses amis',                'negative', 'dating'),
    ('Il répond « ok » à un message de dix lignes',              'negative', 'dating'),
    ('Il te fait systématiquement passer après ses potes',       'negative', 'dating'),
    ('Il garde son téléphone écran contre la table',             'negative', 'dating'),
    ('Il t''appelle par le prénom de son ex',                    'negative', 'dating'),
    ('Il refuse de mettre la moindre photo de vous',             'negative', 'dating'),
    ('Il dit « je suis pas comme les autres mecs »',             'negative', 'dating'),
    ('Il fait la gueule sans jamais dire pourquoi',              'negative', 'dating'),
    ('Il répond au bout de trois jours puis reproche ton silence','negative', 'dating'),
    ('Il flirte devant toi et appelle ça de l''humour',          'negative', 'dating'),
    ('Il oublie systématiquement les anniversaires',             'negative', 'dating'),
    ('Il annule toujours à la dernière minute',                  'negative', 'dating'),
    ('Il fouille dans ton téléphone',                            'negative', 'dating'),
    ('Il veut savoir où tu es en permanence',                    'negative', 'dating'),
    ('Il garde des captures de vos disputes',                    'negative', 'dating'),
    ('Il commente qui a liké tes photos',                        'negative', 'dating'),

    -- ── Négatifs : caractère ─────────────────────────────────────────────
    ('Il ne s''excuse jamais le premier',                        'negative', 'caractere'),
    ('Il hausse le ton dès qu''il perd un débat',                'negative', 'caractere'),
    ('Il se moque des gens devant eux en riant',                 'negative', 'caractere'),
    ('Il ne supporte pas de perdre à un jeu',                    'negative', 'caractere'),
    ('Il parle de lui deux heures sans poser une question',      'negative', 'caractere'),
    ('Il corrige tout le monde en public',                       'negative', 'caractere'),
    ('Il rit quand quelqu''un se fait humilier',                 'negative', 'caractere'),
    ('Il ne dit du bien de personne',                            'negative', 'caractere'),
    ('Il retourne toujours la faute sur les autres',             'negative', 'caractere'),
    ('Il fait des blagues racistes « pour rire »',               'negative', 'caractere'),
    ('Il se vexe pour un rien mais ne le dit pas',               'negative', 'caractere'),
    ('Il juge tout le monde sur son physique',                   'negative', 'caractere'),
    ('Il coupe les ponts au moindre désaccord',                  'negative', 'caractere'),
    ('Il parle mal à sa mère',                                   'negative', 'caractere'),

    -- ── Négatifs : argent ────────────────────────────────────────────────
    ('Il ne rembourse jamais ce qu''il emprunte',                'negative', 'argent'),
    ('Il calcule au centime près qui a pris quoi',               'negative', 'argent'),
    ('Il parie de l''argent chaque week-end',                    'negative', 'argent'),
    ('Il vit à découvert tous les mois',                         'negative', 'argent'),
    ('Il achète des vêtements à crédit',                         'negative', 'argent'),

    -- ── Négatifs : lifestyle ─────────────────────────────────────────────
    ('Il ne se lave pas les mains en sortant des toilettes',     'negative', 'lifestyle'),
    ('Il porte le même jean depuis trois semaines',              'negative', 'lifestyle'),
    ('Il conduit en regardant son téléphone',                    'negative', 'lifestyle'),
    ('Il laisse traîner sa vaisselle une semaine',               'negative', 'lifestyle'),
    ('Il fume dans l''appartement des autres',                   'negative', 'lifestyle'),
    ('Il ramène du monde chez toi sans prévenir',                'negative', 'lifestyle'),
    ('Il passe des appels visio en haut-parleur dans le métro',  'negative', 'lifestyle'),
    ('Il ne rend jamais les affaires qu''on lui prête',          'negative', 'lifestyle'),
    ('Il ne change ses draps qu''une fois par mois',             'negative', 'lifestyle'),

    -- ── Négatifs : social et valeurs ─────────────────────────────────────
    ('Il pense que la dépression c''est dans la tête',           'negative', 'social'),
    ('Il traite les serveurs comme des inférieurs',              'negative', 'social'),
    ('Il se moque de l''accent des gens',                        'negative', 'social'),
    ('Il ne croit pas aux violences conjugales',                 'negative', 'social'),
    ('Il parle de « vraie femme » et de « vrai homme »',         'negative', 'social'),
    ('Il partage n''importe quoi sans jamais vérifier',          'negative', 'social'),
    ('Il ne vote jamais et s''en vante',                         'negative', 'politique'),
    ('Il trouve que « c''était mieux avant » sur tout',          'negative', 'politique'),

    -- ── Négatifs : travail ───────────────────────────────────────────────
    ('Il enchaîne les jobs sans jamais rester',                  'negative', 'travail'),
    ('Il se plaint de son travail tous les jours',               'negative', 'travail'),
    ('Il ment sur son CV',                                       'negative', 'travail'),
    ('Il ne fait jamais sa part dans un travail de groupe',      'negative', 'travail'),

    -- ── Négatifs : santé ─────────────────────────────────────────────────
    ('Il refuse de parler de ses émotions',                      'negative', 'sante'),
    ('Il boit pour réussir à parler aux gens en soirée',         'negative', 'sante'),
    ('Il ne dort que quatre heures et s''en vante',              'negative', 'sante'),
    ('Il prend le volant après deux verres',                     'negative', 'sante'),

    -- ── Positifs ─────────────────────────────────────────────────────────
    ('Il demande comment tu vas et attend la réponse',           'positive', 'caractere'),
    ('Il dit clairement ce qu''il ressent',                      'positive', 'caractere'),
    ('Il retient les prénoms de tes amis',                       'positive', 'social'),
    ('Il range sans qu''on lui demande',                         'positive', 'lifestyle'),
    ('Il prend des nouvelles de ta famille',                     'positive', 'dating'),
    ('Il accepte de ne pas avoir raison',                        'positive', 'caractere'),
    ('Il apprend une langue juste pour le plaisir',              'positive', 'lifestyle'),
    ('Il tient ses promesses, même les petites',                 'positive', 'caractere'),
    ('Il défend les gens quand on les attaque',                  'positive', 'social'),
    ('Il sait rester seul sans s''effondrer',                    'positive', 'sante'),
    ('Il te laisse de l''espace sans se vexer',                  'positive', 'dating'),
    ('Il fait le premier pas après une dispute',                 'positive', 'dating'),
    ('Il paie sa part sans commentaire',                         'positive', 'argent'),
    ('Il rit facilement de lui-même',                            'positive', 'caractere'),
    ('Il s''occupe de son chien impeccablement',                 'positive', 'social'),
    ('Il a un vrai projet et il avance dessus',                  'positive', 'travail'),
    ('Il économise sans être radin',                             'positive', 'argent'),
    ('Il écoute ta journée en détail',                           'positive', 'dating'),
    ('Il connaît ses limites et sait les dire',                  'positive', 'sante'),
    ('Il rend service sans le rappeler ensuite',                 'positive', 'caractere'),
    ('Il reste calme quand tout part en vrille',                 'positive', 'caractere'),
    ('Il t''encourage dans ce que tu entreprends',               'positive', 'dating'),
    ('Il s''entend bien avec ses collègues',                     'positive', 'travail'),
    ('Il aide ses voisins spontanément',                         'positive', 'social')
  ) AS v(text, type, category)
 WHERE NOT EXISTS (
   SELECT 1 FROM dixmais_statements d
    WHERE LOWER(BTRIM(REGEXP_REPLACE(d.text, '\s+', ' ', 'g')))
        = LOWER(BTRIM(REGEXP_REPLACE(v.text, '\s+', ' ', 'g')))
 );

-- ---------------------------------------------------------------------------
-- 5. État après opération — doit afficher 0 doublon
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_lignes INT; v_textes INT; v_neg INT; v_pos INT;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT LOWER(BTRIM(REGEXP_REPLACE(text, '\s+', ' ', 'g'))))
    INTO v_lignes, v_textes
    FROM dixmais_statements WHERE is_active AND is_approved;

  SELECT COUNT(*) FILTER (WHERE type = 'negative'),
         COUNT(*) FILTER (WHERE type = 'positive')
    INTO v_neg, v_pos
    FROM dixmais_statements WHERE is_active AND is_approved;

  RAISE NOTICE 'APRES : % lignes actives, % textes distincts (% doublons)',
    v_lignes, v_textes, v_lignes - v_textes;
  RAISE NOTICE '        % negatifs / % positifs -> environ % profils par session',
    v_neg, v_pos, LEAST(v_neg / 4, v_pos);

  IF v_lignes <> v_textes THEN
    RAISE EXCEPTION 'Des doublons subsistent (% lignes pour % textes) : transaction annulee',
      v_lignes, v_textes;
  END IF;
END $$;

COMMIT;
