-- ===========================================================================
-- 025 — Red Flag Test, version 1
--
-- CE QUE CETTE MIGRATION REMPLACE
--   La migration 019 avait posé douze tables `rft_*` pour un moteur très
--   ambitieux : versions de quiz publiées une à une, branchements entre
--   questions, questions-pièges, réponses rédhibitoires forçant un verdict,
--   barèmes interchangeables. Rien n'a jamais été saisi dedans — onze des douze
--   tables sont restées vides, et elles le sont encore au moment où ceci
--   s'exécute (vérifié avant de l'écrire).
--
--   Le modèle retenu est incomparablement plus simple, et c'est volontaire :
--   une réponse vaut un nombre de points, un point vaut un point de
--   pourcentage, et le score est leur somme. Rien à normaliser, rien à
--   pondérer, rien à expliquer. Garder les colonnes de 019 aurait laissé un
--   schéma deux fois trop grand dont la moitié ne veut plus rien dire.
--
--   `rft_tags` est la seule table conservée : elle contient déjà les cinq
--   catégories (Communication, Respect, Confiance, Contrôle, Égoïsme), et sa
--   forme convient telle quelle.
--
-- CE QU'ELLE NE TOUCHE PAS
--   Aucune table des autres jeux. `elements`, `votes`, `analytics_sessions`,
--   `flagornot_submissions`, `profiles`, `confessions` et le reste sont hors
--   de portée : tout ici est préfixé `rft_`.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Table rase — sauf les tags
-- ---------------------------------------------------------------------------
-- L'ordre n'a pas d'importance grâce à CASCADE, mais les enfants viennent
-- d'abord pour que la lecture suive les dépendances.

DROP TABLE IF EXISTS rft_run_answers     CASCADE;
DROP TABLE IF EXISTS rft_runs            CASCADE;
DROP TABLE IF EXISTS rft_answer_tags     CASCADE;
DROP TABLE IF EXISTS rft_answers         CASCADE;
DROP TABLE IF EXISTS rft_question_tags   CASCADE;
DROP TABLE IF EXISTS rft_questions       CASCADE;
DROP TABLE IF EXISTS rft_brackets        CASCADE;
DROP TABLE IF EXISTS rft_scoring_configs CASCADE;
DROP TABLE IF EXISTS rft_quiz_fields     CASCADE;
DROP TABLE IF EXISTS rft_quiz_versions   CASCADE;
DROP TABLE IF EXISTS rft_quizzes         CASCADE;

-- ---------------------------------------------------------------------------
-- 2. Le contenu
-- ---------------------------------------------------------------------------

CREATE TABLE rft_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Rang d'affichage. Non unique : un glisser-déposer réécrit toutes les
  -- positions d'un coup, et une contrainte d'unicité refuserait l'état
  -- intermédiaire où deux lignes portent le même rang.
  position    INT  NOT NULL DEFAULT 0,
  text        TEXT NOT NULL CHECK (length(trim(text)) > 0),
  -- Deuxième ligne facultative, plus petite et grise sous l'énoncé.
  helper_text TEXT,
  -- Une question retirée du jeu sans être effacée : ses parties passées
  -- restent lisibles, ce qu'une suppression rendrait impossible.
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE rft_questions IS
  'Questions du Red Flag Test. Le barème vit sur les réponses, pas ici.';

CREATE INDEX rft_questions_ordre ON rft_questions (is_active, position);

-- Plusieurs tags par question : une question peut compter à la fois dans
-- « Contrôle » et dans « Confiance ». Ses points vont alors en entier dans
-- chacun des deux — ils ne sont pas partagés. Le score global, lui, ne les
-- compte qu'une fois.
CREATE TABLE rft_question_tags (
  question_id UUID NOT NULL REFERENCES rft_questions(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES rft_tags(id)      ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

CREATE INDEX rft_question_tags_par_tag ON rft_question_tags (tag_id);

CREATE TABLE rft_answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID NOT NULL REFERENCES rft_questions(id) ON DELETE CASCADE,
  position      INT  NOT NULL DEFAULT 0,
  text          TEXT NOT NULL CHECK (length(trim(text)) > 0),
  -- LE BARÈME, ET IL TIENT EN UNE COLONNE.
  -- Un point = un point de pourcentage ajouté au score. La somme peut dépasser
  -- 100 : c'est assumé, « 137 % red flag » est une meilleure chute qu'un score
  -- plafonné. Le négatif est permis pour qu'une réponse puisse racheter une
  -- autre ; la borne basse existe seulement pour arrêter une faute de frappe.
  points        INT  NOT NULL DEFAULT 0 CHECK (points BETWEEN -50 AND 50),
  -- La pique affichée dans les highlights du récap quand cette réponse est
  -- choisie. Facultative : sans elle, la réponse ne peut pas être retenue.
  humor_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN rft_answers.points IS
  'Points de pourcentage ajoutés au score. Jamais envoyés au navigateur.';

CREATE INDEX rft_answers_par_question ON rft_answers (question_id, position);

-- ---------------------------------------------------------------------------
-- 3. Les verdicts
-- ---------------------------------------------------------------------------
-- Des paliers ouverts vers le haut : celui qui s'applique est le plus haut
-- `min_score` inférieur ou égal au score. Pas de borne supérieure, parce qu'un
-- score n'en a pas non plus — le dernier palier attrape tout ce qui dépasse.

CREATE TABLE rft_verdicts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_score  INT  NOT NULL UNIQUE,
  emoji      TEXT,
  title      TEXT NOT NULL CHECK (length(trim(title)) > 0),
  subtitle   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE rft_verdicts IS
  'Paliers de fin de partie, choisis par le plus haut min_score atteint.';

-- ---------------------------------------------------------------------------
-- 4. Les parties
-- ---------------------------------------------------------------------------

CREATE TABLE rft_runs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score       INT NOT NULL,
  -- Mêmes valeurs que partout ailleurs sur le site : c'est ce qui permettra un
  -- jour de croiser les jeux sans table de correspondance.
  sex         TEXT CHECK (sex IN ('homme', 'femme', 'autre')),
  age         TEXT CHECK (age IN ('16-18', '19-22', '23-26', '27+')),
  duration_ms INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Les classements par cohorte lisent toujours par (sexe, score) ou (âge, score).
CREATE INDEX rft_runs_par_sexe ON rft_runs (sex, score);
CREATE INDEX rft_runs_par_age  ON rft_runs (age, score);
CREATE INDEX rft_runs_par_date ON rft_runs (created_at DESC);

CREATE TABLE rft_run_answers (
  run_id      UUID NOT NULL REFERENCES rft_runs(id)      ON DELETE CASCADE,
  -- Les réponses gardent leur lien : une question effacée emporte les réponses
  -- qu'on lui avait données, sinon le dénominateur des pourcentages compterait
  -- des choix devenus impossibles.
  question_id UUID NOT NULL REFERENCES rft_questions(id) ON DELETE CASCADE,
  answer_id   UUID NOT NULL REFERENCES rft_answers(id)   ON DELETE CASCADE,
  PRIMARY KEY (run_id, question_id)
);

CREATE INDEX rft_run_answers_par_reponse ON rft_run_answers (answer_id);
CREATE INDEX rft_run_answers_par_question ON rft_run_answers (question_id);

-- ---------------------------------------------------------------------------
-- 5. Les agrégats
-- ---------------------------------------------------------------------------
-- PostgREST ne sait pas grouper, et il tronque à mille lignes ce qu'on
-- essaierait de compter côté Node. Ces deux fonctions font le comptage là où
-- sont les données.

-- Pour chaque cohorte : combien de parties, et combien ont fait plus fort.
-- Le passage du rang au « Top X % » se fait en TypeScript, où il est testable.
CREATE OR REPLACE FUNCTION rft_cohortes(p_score INT, p_sex TEXT, p_age TEXT)
RETURNS TABLE (cohorte TEXT, effectif BIGINT, plus_hauts BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT 'tous'::TEXT, count(*), count(*) FILTER (WHERE score > p_score)
    FROM rft_runs
  UNION ALL
  SELECT 'sexe', count(*), count(*) FILTER (WHERE score > p_score)
    FROM rft_runs WHERE p_sex IS NOT NULL AND sex = p_sex
  UNION ALL
  SELECT 'age', count(*), count(*) FILTER (WHERE score > p_score)
    FROM rft_runs WHERE p_age IS NOT NULL AND age = p_age;
$$;

COMMENT ON FUNCTION rft_cohortes IS
  'Effectif et nombre de scores strictement supérieurs, par cohorte.';

-- Part des joueurs ayant choisi chacune des réponses données.
-- Le dénominateur est le nombre de parties ayant RÉPONDU À CETTE QUESTION, pas
-- le nombre total de parties : une question ajoutée hier afficherait sinon des
-- parts minuscules qui ne diraient rien d'autre que sa date de création.
CREATE OR REPLACE FUNCTION rft_parts_reponses(p_answer_ids UUID[])
RETURNS TABLE (answer_id UUID, choix BIGINT, total_question BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT
    a.id,
    count(ra.answer_id) FILTER (WHERE ra.answer_id = a.id),
    count(ra.answer_id)
  FROM rft_answers a
  LEFT JOIN rft_run_answers ra ON ra.question_id = a.question_id
  WHERE a.id = ANY(p_answer_ids)
  GROUP BY a.id;
$$;

COMMENT ON FUNCTION rft_parts_reponses IS
  'Choix de chaque réponse, sur le total des parties ayant vu sa question.';

-- ---------------------------------------------------------------------------
-- 6. Fermeture
-- ---------------------------------------------------------------------------
-- RLS activé, et AUCUNE politique : la clé anonyme ne lit ni n'écrit rien ici.
--
-- Ce n'est pas un oubli. Tout passe par les routes d'API du site, qui parlent
-- en `service_role` — lequel traverse RLS par construction. Le barème vit dans
-- `rft_answers.points` : une politique de lecture publique, même limitée aux
-- questions actives, le rendrait consultable par n'importe qui avec la clé
-- publique du site, et le test deviendrait truquable en une requête.

ALTER TABLE rft_questions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rft_question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE rft_answers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE rft_verdicts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE rft_runs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE rft_run_answers   ENABLE ROW LEVEL SECURITY;

-- `rft_tags` conserve la politique de lecture publique posée en 019 ; elle ne
-- dévoile rien qu'un joueur ne voie déjà sur le radar du récap.

-- ---------------------------------------------------------------------------
-- 7. Les verdicts de départ
-- ---------------------------------------------------------------------------
-- De quoi faire tourner le jeu dès la première question saisie. Ils sont
-- modifiables depuis l'admin comme le reste du contenu.

INSERT INTO rft_verdicts (min_score, emoji, title, subtitle) VALUES
  (0,   '🟢', 'SUSPECT DE NORMALITÉ', 'Soit tu vas bien, soit tu as menti avec application.'),
  (25,  '🟡', 'QUELQUES TRAVAUX',     'Rien d''irréparable. Deux ou trois choses à regarder en face.'),
  (50,  '🟠', 'ÇA SE VOIT DE LOIN',   'Tes proches le savent déjà. Toi, tu viens de l''apprendre.'),
  (75,  '🔴', 'LE DRAPEAU EST PLANTÉ', 'On ne va pas te mentir, on a relu le résultat deux fois.'),
  (100, '☢️', 'HORS BARÈME',          'Tu as dépassé le maximum prévu. Personne n''avait anticipé ça.')
ON CONFLICT (min_score) DO NOTHING;
