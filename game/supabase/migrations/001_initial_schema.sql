-- Red or Green Game - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: elements
-- Stores all game elements (propositions)
-- =============================================
CREATE TABLE elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  texte TEXT UNIQUE NOT NULL,
  categorie TEXT NOT NULL CHECK (categorie IN ('metier', 'comportement', 'trait', 'preference', 'absurde')),
  niveau_provocation INTEGER CHECK (niveau_provocation BETWEEN 1 AND 4) DEFAULT 2,
  actif BOOLEAN DEFAULT TRUE,
  
  -- ELO Scores (Global + Segmented)
  elo_global INTEGER DEFAULT 1000,
  elo_homme INTEGER DEFAULT 1000,
  elo_femme INTEGER DEFAULT 1000,
  elo_nonbinaire INTEGER DEFAULT 1000,
  elo_autre INTEGER DEFAULT 1000,
  elo_16_18 INTEGER DEFAULT 1000,
  elo_19_22 INTEGER DEFAULT 1000,
  elo_23_26 INTEGER DEFAULT 1000,
  elo_27plus INTEGER DEFAULT 1000,
  
  -- Statistics
  nb_participations INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_elements_elo_global ON elements(elo_global);
CREATE INDEX idx_elements_actif ON elements(actif);
CREATE INDEX idx_elements_categorie ON elements(categorie);

-- =============================================
-- TABLE: votes
-- Records each vote cast by players
-- =============================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_gagnant_id UUID NOT NULL REFERENCES elements(id),
  element_perdant_id UUID NOT NULL REFERENCES elements(id),
  sexe_votant TEXT CHECK (sexe_votant IN ('homme', 'femme', 'nonbinaire', 'autre')),
  age_votant TEXT CHECK (age_votant IN ('16-18', '19-22', '23-26', '27+')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for statistics
CREATE INDEX idx_votes_created ON votes(created_at);
CREATE INDEX idx_votes_gagnant ON votes(element_gagnant_id);
CREATE INDEX idx_votes_perdant ON votes(element_perdant_id);
CREATE INDEX idx_votes_segment ON votes(sexe_votant, age_votant);

-- =============================================
-- TABLE: duel_feedback
-- Stores star and thumbs feedback for duel pairs
-- =============================================
CREATE TABLE duel_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_a_id UUID NOT NULL REFERENCES elements(id),
  element_b_id UUID NOT NULL REFERENCES elements(id),
  stars_count INTEGER DEFAULT 0,
  thumbs_up_count INTEGER DEFAULT 0,
  thumbs_down_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique pair (sorted to avoid duplicates)
  UNIQUE(element_a_id, element_b_id),
  -- Ensure a < b to maintain consistent ordering
  CHECK (element_a_id < element_b_id)
);

CREATE INDEX idx_feedback_stars ON duel_feedback(stars_count DESC);

-- =============================================
-- RLS Policies (Row Level Security)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_feedback ENABLE ROW LEVEL SECURITY;

-- Elements: Public read, admin write
CREATE POLICY "Public can read active elements" ON elements
  FOR SELECT TO anon
  USING (actif = true);

CREATE POLICY "Service role can do all on elements" ON elements
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Votes: Public insert, no read (anonymous)
CREATE POLICY "Anyone can insert votes" ON votes
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Service role can do all on votes" ON votes
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Feedback: Public insert/update
CREATE POLICY "Anyone can insert feedback" ON duel_feedback
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update feedback counts" ON duel_feedback
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read feedback" ON duel_feedback
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Service role can do all on feedback" ON duel_feedback
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Insert sample elements for testing
INSERT INTO elements (texte, categorie, niveau_provocation) VALUES
  -- Métiers
  ('Être policier', 'metier', 2),
  ('Être influenceur', 'metier', 3),
  ('Être politicien', 'metier', 3),
  ('Être avocat fiscaliste', 'metier', 2),
  ('Être télévendeur', 'metier', 2),
  ('Être serveur dans un fast-food', 'metier', 1),
  ('Être agent immobilier', 'metier', 2),
  ('Être DJ de mariage', 'metier', 1),
  
  -- Comportements
  ('Aimer les pieds', 'comportement', 4),
  ('Manger ses crottes de nez', 'comportement', 3),
  ('Ne jamais tirer la chasse', 'comportement', 3),
  ('Roter à table', 'comportement', 2),
  ('Parler la bouche pleine', 'comportement', 2),
  ('Couper la parole tout le temps', 'comportement', 2),
  ('Ne jamais dire merci', 'comportement', 2),
  ('Mentir sur son âge', 'comportement', 2),
  
  -- Traits de caractère
  ('Être avare', 'trait', 2),
  ('Être jaloux', 'trait', 2),
  ('Être narcissique', 'trait', 3),
  ('Être toujours en retard', 'trait', 2),
  ('Être trop honnête', 'trait', 1),
  ('Être pessimiste', 'trait', 2),
  ('Être obsédé par les réseaux sociaux', 'trait', 3),
  ('Ne jamais s''excuser', 'trait', 3),
  
  -- Préférences
  ('Aimer l''ananas sur la pizza', 'preference', 1),
  ('Préférer les chats aux chiens', 'preference', 1),
  ('Aimer le café sans sucre', 'preference', 1),
  ('Dormir avec des chaussettes', 'preference', 1),
  ('Écouter de la country', 'preference', 2),
  ('Regarder la télé-réalité', 'preference', 2),
  ('Collectionner les figurines', 'preference', 1),
  ('Manger des céréales le soir', 'preference', 1),
  
  -- Absurde
  ('Être fan de sardines', 'absurde', 2),
  ('Parler à ses plantes', 'absurde', 1),
  ('Avoir un tatouage de dauphin', 'absurde', 2),
  ('Croire aux horoscopes', 'absurde', 2),
  ('Porter des Crocs', 'absurde', 2),
  ('Avoir un mullet', 'absurde', 3),
  ('Collectionner les timbres', 'absurde', 1),
  ('Aimer les films de requins', 'absurde', 1);

-- Verify insertion
SELECT COUNT(*) as total_elements FROM elements;
