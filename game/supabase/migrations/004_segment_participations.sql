-- Migration: Add per-segment participation counters
-- This allows showing accurate participation counts per demographic segment
-- (e.g., "6 votes from women" vs "10 votes from men" for the same element)

-- Add segment-specific participation counters to elements table
ALTER TABLE elements ADD COLUMN IF NOT EXISTS nb_participations_homme INTEGER DEFAULT 0;
ALTER TABLE elements ADD COLUMN IF NOT EXISTS nb_participations_femme INTEGER DEFAULT 0;
ALTER TABLE elements ADD COLUMN IF NOT EXISTS nb_participations_autre INTEGER DEFAULT 0;
ALTER TABLE elements ADD COLUMN IF NOT EXISTS nb_participations_16_18 INTEGER DEFAULT 0;
ALTER TABLE elements ADD COLUMN IF NOT EXISTS nb_participations_19_22 INTEGER DEFAULT 0;
ALTER TABLE elements ADD COLUMN IF NOT EXISTS nb_participations_23_26 INTEGER DEFAULT 0;
ALTER TABLE elements ADD COLUMN IF NOT EXISTS nb_participations_27plus INTEGER DEFAULT 0;

-- Backfill existing data from votes table
-- Count participations per element per sex (both as winner and loser)
UPDATE elements e SET
  nb_participations_homme = (
    SELECT COUNT(*) FROM votes v 
    WHERE (v.element_gagnant_id = e.id OR v.element_perdant_id = e.id) 
    AND v.sexe_votant = 'homme'
  ),
  nb_participations_femme = (
    SELECT COUNT(*) FROM votes v 
    WHERE (v.element_gagnant_id = e.id OR v.element_perdant_id = e.id) 
    AND v.sexe_votant = 'femme'
  ),
  nb_participations_autre = (
    SELECT COUNT(*) FROM votes v 
    WHERE (v.element_gagnant_id = e.id OR v.element_perdant_id = e.id) 
    AND v.sexe_votant NOT IN ('homme', 'femme')
  ),
  nb_participations_16_18 = (
    SELECT COUNT(*) FROM votes v 
    WHERE (v.element_gagnant_id = e.id OR v.element_perdant_id = e.id) 
    AND v.age_votant = '16-18'
  ),
  nb_participations_19_22 = (
    SELECT COUNT(*) FROM votes v 
    WHERE (v.element_gagnant_id = e.id OR v.element_perdant_id = e.id) 
    AND v.age_votant = '19-22'
  ),
  nb_participations_23_26 = (
    SELECT COUNT(*) FROM votes v 
    WHERE (v.element_gagnant_id = e.id OR v.element_perdant_id = e.id) 
    AND v.age_votant = '23-26'
  ),
  nb_participations_27plus = (
    SELECT COUNT(*) FROM votes v 
    WHERE (v.element_gagnant_id = e.id OR v.element_perdant_id = e.id) 
    AND v.age_votant = '27+'
  );
