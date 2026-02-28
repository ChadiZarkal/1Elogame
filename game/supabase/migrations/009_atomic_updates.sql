-- Migration: Atomic ELO updates and feedback upsert
-- Fixes race conditions on concurrent votes and feedback

-- ─── Atomic feedback upsert ───
-- Instead of SELECT → UPDATE, use INSERT ... ON CONFLICT UPDATE
CREATE OR REPLACE FUNCTION increment_feedback(
  p_element_a_id UUID,
  p_element_b_id UUID,
  p_column TEXT
)
RETURNS TABLE(stars_count INT, thumbs_up_count INT, thumbs_down_count INT)
LANGUAGE plpgsql AS $$
BEGIN
  -- Ensure sorted pair key
  IF p_element_a_id > p_element_b_id THEN
    -- Swap
    DECLARE tmp UUID := p_element_a_id;
    BEGIN
      p_element_a_id := p_element_b_id;
      p_element_b_id := tmp;
    END;
  END IF;

  IF p_column = 'stars_count' THEN
    INSERT INTO duel_feedback (element_a_id, element_b_id, stars_count, thumbs_up_count, thumbs_down_count)
    VALUES (p_element_a_id, p_element_b_id, 1, 0, 0)
    ON CONFLICT (element_a_id, element_b_id)
    DO UPDATE SET stars_count = duel_feedback.stars_count + 1;
  ELSIF p_column = 'thumbs_up_count' THEN
    INSERT INTO duel_feedback (element_a_id, element_b_id, stars_count, thumbs_up_count, thumbs_down_count)
    VALUES (p_element_a_id, p_element_b_id, 0, 1, 0)
    ON CONFLICT (element_a_id, element_b_id)
    DO UPDATE SET thumbs_up_count = duel_feedback.thumbs_up_count + 1;
  ELSIF p_column = 'thumbs_down_count' THEN
    INSERT INTO duel_feedback (element_a_id, element_b_id, stars_count, thumbs_up_count, thumbs_down_count)
    VALUES (p_element_a_id, p_element_b_id, 0, 0, 1)
    ON CONFLICT (element_a_id, element_b_id)
    DO UPDATE SET thumbs_down_count = duel_feedback.thumbs_down_count + 1;
  END IF;

  RETURN QUERY
    SELECT df.stars_count, df.thumbs_up_count, df.thumbs_down_count
    FROM duel_feedback df
    WHERE df.element_a_id = p_element_a_id AND df.element_b_id = p_element_b_id;
END;
$$;

-- ─── Atomic ELO update ───
-- Applies deltas instead of absolute values to avoid lost updates
CREATE OR REPLACE FUNCTION apply_elo_delta(
  p_element_id UUID,
  p_elo_global_delta FLOAT,
  p_seg_field TEXT,
  p_seg_delta FLOAT,
  p_part_field_sex TEXT,
  p_part_field_age TEXT
)
RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
  -- Use dynamic SQL to handle variable column names for segmented fields
  EXECUTE format(
    'UPDATE elements SET
      elo_global = elo_global + $1,
      %I = %I + $2,
      nb_participations = nb_participations + 1,
      %I = COALESCE(%I, 0) + 1,
      %I = COALESCE(%I, 0) + 1,
      updated_at = NOW()
    WHERE id = $3',
    p_seg_field, p_seg_field,
    p_part_field_sex, p_part_field_sex,
    p_part_field_age, p_part_field_age
  )
  USING p_elo_global_delta, p_seg_delta, p_element_id;
END;
$$;

-- Ensure unique constraint exists on duel_feedback for ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'duel_feedback_pair_unique'
  ) THEN
    ALTER TABLE duel_feedback ADD CONSTRAINT duel_feedback_pair_unique 
      UNIQUE (element_a_id, element_b_id);
  END IF;
END;
$$;
