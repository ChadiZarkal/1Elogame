-- Migration: Reduce to 3 categories (sexe, quotidien, metiers)
-- Date: 27 mai 2026
-- 
-- Changes:
-- 1. Reassign 'lifestyle' elements to 'quotidien'
-- 2. Rename 'bureau' to 'metiers'
-- 3. Update the CHECK constraint

-- Step 1: Reassign lifestyle → quotidien
UPDATE elements SET categorie = 'quotidien', updated_at = NOW() WHERE categorie = 'lifestyle';

-- Step 2: Rename bureau → metiers
UPDATE elements SET categorie = 'metiers', updated_at = NOW() WHERE categorie = 'bureau';

-- Step 3: Drop old constraint and add new one
ALTER TABLE elements DROP CONSTRAINT IF EXISTS elements_categorie_check;
ALTER TABLE elements ADD CONSTRAINT elements_categorie_check 
  CHECK (categorie IN ('sexe', 'quotidien', 'metiers'));

-- Verify
SELECT categorie, COUNT(*) as count FROM elements GROUP BY categorie ORDER BY count DESC;
