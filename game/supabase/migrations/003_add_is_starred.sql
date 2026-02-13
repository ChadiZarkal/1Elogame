-- Migration: Add is_starred column to elements table
-- This enables the admin "star" feature for highlighting notable red flags

ALTER TABLE elements ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;

-- Create index for quick starred element queries
CREATE INDEX IF NOT EXISTS idx_elements_is_starred ON elements(is_starred) WHERE is_starred = TRUE;

-- Update the sexe_votant CHECK constraint to remove 'nonbinaire'
-- Note: In PostgreSQL, you need to drop and recreate the constraint
-- First check if the constraint exists, then update it
-- This is safe because existing 'nonbinaire' votes remain in the database
-- but new votes can only use 'homme', 'femme', or 'autre'

-- ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_sexe_votant_check;
-- ALTER TABLE votes ADD CONSTRAINT votes_sexe_votant_check CHECK (sexe_votant IN ('homme', 'femme', 'autre'));
-- ^ Uncomment above if you want to enforce at DB level. 
-- Be careful: existing rows with 'nonbinaire' would violate the new constraint.
-- Recommended: keep the DB constraint loose and enforce in application layer (Zod).
