-- Migration: Add justification column to flagornot_submissions
-- Date: 27 mai 2026
-- Description: Store the AI justification alongside each verdict for admin review

ALTER TABLE flagornot_submissions ADD COLUMN IF NOT EXISTS justification TEXT;

-- Index for full-text search in admin
CREATE INDEX IF NOT EXISTS idx_flagornot_text_search ON flagornot_submissions USING gin(to_tsvector('french', text));
