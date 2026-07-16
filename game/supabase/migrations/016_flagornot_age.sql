-- Migration 016: Add age column to flagornot_submissions
-- Date: 16 juillet 2026
-- Context: The Oracle game now collects age in addition to gender.
--          Apply AFTER migrations 011 and 012 if not already done.

-- If migrations 011 + 012 were never applied, run them first:
ALTER TABLE flagornot_submissions ADD COLUMN IF NOT EXISTS justification TEXT;
ALTER TABLE flagornot_submissions ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('homme', 'femme', 'autre'));
CREATE INDEX IF NOT EXISTS idx_flagornot_gender ON flagornot_submissions(gender);
CREATE INDEX IF NOT EXISTS idx_flagornot_text_search ON flagornot_submissions USING gin(to_tsvector('french', text));

-- Migration 016: Add age column
ALTER TABLE flagornot_submissions ADD COLUMN IF NOT EXISTS age TEXT CHECK (age IN ('16-18', '19-22', '23-26', '27+'));
CREATE INDEX IF NOT EXISTS idx_flagornot_age ON flagornot_submissions(age);

-- Verify the final schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'flagornot_submissions'
ORDER BY ordinal_position;
