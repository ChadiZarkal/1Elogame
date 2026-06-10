-- Migration: Add gender column to flagornot_submissions
-- Date: 10 juin 2026
-- Description: Store the user's gender alongside each Oracle submission for gender-based stats

ALTER TABLE flagornot_submissions ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('homme', 'femme', 'autre'));

-- Index for gender-based queries
CREATE INDEX IF NOT EXISTS idx_flagornot_gender ON flagornot_submissions(gender);
