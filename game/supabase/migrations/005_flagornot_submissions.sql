-- Migration: Flag or Not Community Submissions
-- Date: 21 février 2026
-- Description: Crée la table pour enregistrer les soumissions communautaires
--              du jeu Flag or Not (dernières demandes jugées par l'IA)

-- =============================================
-- TABLE: flagornot_submissions
-- Stores community submissions from Flag or Not game
-- =============================================

CREATE TABLE IF NOT EXISTS flagornot_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('red', 'green')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT text_not_empty CHECK (LENGTH(TRIM(text)) > 0),
  CONSTRAINT text_max_length CHECK (LENGTH(text) <= 280)
);

-- =============================================
-- Indexes for performance
-- =============================================

-- Index for fetching recent submissions
CREATE INDEX idx_flagornot_created_at ON flagornot_submissions(created_at DESC);

-- Index for filtering by verdict
CREATE INDEX idx_flagornot_verdict ON flagornot_submissions(verdict);

-- =============================================
-- RLS Policies (Row Level Security)
-- =============================================

-- Enable RLS
ALTER TABLE flagornot_submissions ENABLE ROW LEVEL SECURITY;

-- Public can read all submissions
CREATE POLICY "Public can read submissions" ON flagornot_submissions
  FOR SELECT TO anon, authenticated
  USING (true);

-- Public can insert new submissions (anonymous users)
CREATE POLICY "Anyone can insert submissions" ON flagornot_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Service role can do everything
CREATE POLICY "Service role can do all on submissions" ON flagornot_submissions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Comments for documentation
-- =============================================

COMMENT ON TABLE flagornot_submissions IS 'Community submissions from Flag or Not game - stores user situations judged by AI';
COMMENT ON COLUMN flagornot_submissions.text IS 'The situation/behavior submitted by user (max 280 chars)';
COMMENT ON COLUMN flagornot_submissions.verdict IS 'AI judgment: red (red flag) or green (green flag)';
