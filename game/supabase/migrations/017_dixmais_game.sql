-- =============================================================================
-- 017_dixmais_game.sql
-- "C'est un 10 mais..." game — statements pool, votes, and seed data
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Statements pool
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dixmais_statements (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  text         TEXT    NOT NULL,
  type         TEXT    NOT NULL CHECK (type IN ('positive', 'negative')),
  category     TEXT    NOT NULL DEFAULT 'general',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  is_approved  BOOLEAN NOT NULL DEFAULT true,
  -- Aggregated stats (updated atomically on each recorded vote)
  votes_count       INT     NOT NULL DEFAULT 0,
  total_delta       NUMERIC NOT NULL DEFAULT 0,
  elimination_count INT     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. Individual votes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dixmais_votes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id   UUID NOT NULL REFERENCES dixmais_statements(id) ON DELETE CASCADE,
  session_id     TEXT,
  previous_score INT  NOT NULL CHECK (previous_score BETWEEN 0 AND 10),
  new_score      INT  NOT NULL CHECK (new_score BETWEEN 0 AND 10),
  delta          INT  NOT NULL,
  is_elimination BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_dixmais_stmts_active   ON dixmais_statements(is_active, is_approved);
CREATE INDEX IF NOT EXISTS idx_dixmais_stmts_type     ON dixmais_statements(type);
CREATE INDEX IF NOT EXISTS idx_dixmais_stmts_category ON dixmais_statements(category);
CREATE INDEX IF NOT EXISTS idx_dixmais_stmts_avgdelta ON dixmais_statements(total_delta, votes_count);
CREATE INDEX IF NOT EXISTS idx_dixmais_votes_stmt     ON dixmais_votes(statement_id);
CREATE INDEX IF NOT EXISTS idx_dixmais_votes_session  ON dixmais_votes(session_id);

-- ---------------------------------------------------------------------------
-- 4. RLS policies
-- ---------------------------------------------------------------------------
ALTER TABLE dixmais_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dixmais_votes      ENABLE ROW LEVEL SECURITY;

-- Public: read active + approved statements only
DROP POLICY IF EXISTS "dixmais_stmts_public_read"   ON dixmais_statements;
CREATE POLICY "dixmais_stmts_public_read" ON dixmais_statements
  FOR SELECT USING (is_active = true AND is_approved = true);

-- Service role: full access
DROP POLICY IF EXISTS "dixmais_stmts_service_all"   ON dixmais_statements;
CREATE POLICY "dixmais_stmts_service_all" ON dixmais_statements
  FOR ALL USING (auth.role() = 'service_role');

-- Public: insert votes
DROP POLICY IF EXISTS "dixmais_votes_public_insert" ON dixmais_votes;
CREATE POLICY "dixmais_votes_public_insert" ON dixmais_votes
  FOR INSERT WITH CHECK (true);

-- Service role: full access on votes
DROP POLICY IF EXISTS "dixmais_votes_service_all"   ON dixmais_votes;
CREATE POLICY "dixmais_votes_service_all" ON dixmais_votes
  FOR ALL USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- 5. Rankings view (computed avg_delta + elimination_rate)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW dixmais_statement_rankings AS
SELECT
  s.*,
  CASE WHEN s.votes_count > 0
    THEN ROUND(s.total_delta::NUMERIC / s.votes_count, 2)
    ELSE 0
  END AS avg_delta,
  CASE WHEN s.votes_count > 0
    THEN ROUND(s.elimination_count::NUMERIC / s.votes_count * 100, 1)
    ELSE 0
  END AS elimination_rate
FROM dixmais_statements s
WHERE s.is_active = true AND s.is_approved = true;

-- ---------------------------------------------------------------------------
-- 6. Atomic vote recording RPC
--    Records the vote row and updates statement stats in one transaction.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_dixmais_vote(
  p_statement_id   UUID,
  p_session_id     TEXT,
  p_previous_score INT,
  p_new_score      INT,
  p_delta          INT,
  p_is_elimination BOOLEAN
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Insert the vote record
  INSERT INTO dixmais_votes (statement_id, session_id, previous_score, new_score, delta, is_elimination)
  VALUES (p_statement_id, p_session_id, p_previous_score, p_new_score, p_delta, p_is_elimination);

  -- Update aggregated stats on the statement
  UPDATE dixmais_statements SET
    votes_count       = votes_count + 1,
    total_delta       = total_delta + p_delta,
    elimination_count = elimination_count + CASE WHEN p_is_elimination THEN 1 ELSE 0 END
  WHERE id = p_statement_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. Seed data — 70 initial statements
-- ---------------------------------------------------------------------------

-- NEGATIVE statements (red flags)
INSERT INTO dixmais_statements (text, type, category) VALUES
  -- Politique
  ('Il vote Marine Le Pen',                             'negative', 'politique'),
  ('Il est complotiste',                                'negative', 'politique'),
  ('Il ne croit pas au changement climatique',          'negative', 'politique'),
  ('Il est de droite extrême',                          'negative', 'politique'),
  ('Il pense que le féminisme va trop loin',            'negative', 'politique'),

  -- Caractère
  ('Il est souvent violent',                            'negative', 'caractere'),
  ('Il est jaloux maladif',                             'negative', 'caractere'),
  ('Il est manipulateur',                               'negative', 'caractere'),
  ('Il est misogyne',                                   'negative', 'caractere'),
  ('Il n''a aucune empathie',                           'negative', 'caractere'),
  ('Il ne supporte pas la critique',                    'negative', 'caractere'),
  ('Il fait des crises en public',                      'negative', 'caractere'),
  ('Il est hyper radin',                                'negative', 'caractere'),
  ('Il ment facilement',                                'negative', 'caractere'),
  ('Il est narcissique',                                'negative', 'caractere'),
  ('Il ne dit jamais merci ni pardon',                  'negative', 'caractere'),
  ('Il ne respecte pas les files d''attente',           'negative', 'caractere'),

  -- Dating & relations
  ('Il a trompé ses 3 dernières copines',               'negative', 'dating'),
  ('Il parle de son ex constamment',                    'negative', 'dating'),
  ('Il envoie des SMS à 3h du matin',                   'negative', 'dating'),
  ('Il est "je t''aime mais pas de relation officielle"','negative', 'dating'),
  ('Il a un enfant qu''il ne voit presque jamais',      'negative', 'dating'),
  ('Il ment sur son statut amoureux',                   'negative', 'dating'),
  ('Il est ghosteur chronique',                         'negative', 'dating'),
  ('Il fait du love bombing puis disparaît',            'negative', 'dating'),

  -- Lifestyle
  ('Il ne fait jamais la vaisselle',                    'negative', 'lifestyle'),
  ('Il ne range jamais chez lui',                       'negative', 'lifestyle'),
  ('Il ne sait pas cuisiner du tout',                   'negative', 'lifestyle'),
  ('Il vit encore chez ses parents à 30 ans sans économiser', 'negative', 'lifestyle'),
  ('Il fume un paquet par jour',                        'negative', 'lifestyle'),
  ('Il boit beaucoup tous les week-ends',               'negative', 'lifestyle'),
  ('Il est accro aux jeux vidéo',                       'negative', 'lifestyle'),
  ('Il ne fait aucune activité physique',               'negative', 'lifestyle'),
  ('Il regarde Netflix 6h par jour',                    'negative', 'lifestyle'),
  ('Il ne lit jamais',                                  'negative', 'lifestyle'),
  ('Il passe ses soirées à scroller TikTok',            'negative', 'lifestyle'),
  ('Il met le lait avant les céréales',                 'negative', 'lifestyle'),

  -- Social
  ('Il n''aime pas les animaux',                        'negative', 'social'),
  ('Il est homophobe',                                  'negative', 'social'),
  ('Il est raciste "parfois"',                          'negative', 'social'),
  ('Il couvre ses potes charos',                        'negative', 'social'),
  ('Il laisse des pourboires ridicules',                'negative', 'social'),
  ('Il klaxonne constamment dans les embouteillages',   'negative', 'social'),
  ('Il prend des photos à table avant de manger',       'negative', 'social'),
  ('Il interrompt tout le monde en parlant',            'negative', 'social'),

  -- Argent & travail
  ('Il a des dettes cachées importantes',               'negative', 'argent'),
  ('Il demande toujours de l''argent',                  'negative', 'argent'),
  ('Il n''a aucune ambition professionnelle',           'negative', 'travail'),
  ('Il parle de son salaire en public tout le temps',   'negative', 'argent'),

  -- Santé
  ('Il ne va jamais chez le médecin',                   'negative', 'sante'),
  ('Il prend des stéroïdes',                            'negative', 'sante'),

ON CONFLICT DO NOTHING;

-- POSITIVE statements (green flags)
INSERT INTO dixmais_statements (text, type, category) VALUES
  -- Caractère
  ('Il est hyper drôle et créatif',                    'positive', 'caractere'),
  ('Il est très attentionné',                           'positive', 'caractere'),
  ('Il écoute toujours avec attention',                 'positive', 'caractere'),
  ('Il sait s''excuser sincèrement',                    'positive', 'caractere'),
  ('Il est ambitieux sans être agressif',               'positive', 'caractere'),
  ('Il respecte toujours ses engagements',              'positive', 'caractere'),
  ('Il prend soin de sa santé mentale',                 'positive', 'caractere'),

  -- Dating & relations
  ('Il paye toujours les dîners',                       'positive', 'dating'),
  ('Il est très proche de sa famille',                  'positive', 'dating'),
  ('Il adore les enfants',                              'positive', 'dating'),
  ('Il a de super amis fidèles',                        'positive', 'dating'),

  -- Lifestyle
  ('Il cuisine très bien',                              'positive', 'lifestyle'),
  ('Il voyage souvent et découvre le monde',            'positive', 'lifestyle'),
  ('Il lit beaucoup',                                   'positive', 'lifestyle'),
  ('Il fait du sport régulièrement',                    'positive', 'lifestyle'),

  -- Social & valeurs
  ('Il donne beaucoup aux associations',                'positive', 'social'),
  ('Il se dit féministe et l''est vraiment',            'positive', 'social'),
  ('Il aide ses amis sans jamais compter',              'positive', 'social'),
  ('Il adore les animaux',                              'positive', 'social'),

  -- Argent & travail
  ('Il gagne 8 000€ par mois',                          'positive', 'argent'),
  ('Il est chef cuisinier étoilé',                      'positive', 'travail'),
  ('Il est passionné par son métier',                   'positive', 'travail'),

  -- Santé
  ('Il parle à son psy régulièrement',                  'positive', 'sante'),
  ('Il est mannequin',                                  'positive', 'sante')

ON CONFLICT DO NOTHING;
