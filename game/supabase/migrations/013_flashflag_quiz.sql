-- Migration: Flash Flag timed quiz game
-- Date: 23 juin 2026
-- Description: standard quizzes, timed sessions, and answer logs

CREATE TABLE IF NOT EXISTS flashflag_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_standard BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashflag_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES flashflag_tests(id) ON DELETE CASCADE,
  position INT NOT NULL,
  question_text TEXT NOT NULL,
  time_limit_sec INT NOT NULL DEFAULT 8 CHECK (time_limit_sec BETWEEN 3 AND 30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(test_id, position)
);

CREATE TABLE IF NOT EXISTS flashflag_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES flashflag_questions(id) ON DELETE CASCADE,
  position INT NOT NULL,
  option_text TEXT NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(question_id, position)
);

CREATE TABLE IF NOT EXISTS flashflag_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code TEXT UNIQUE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('local', 'link')),
  source_type TEXT NOT NULL CHECK (source_type IN ('standard', 'custom')),
  test_id UUID REFERENCES flashflag_tests(id) ON DELETE SET NULL,
  custom_payload JSONB,
  subject_sex TEXT NOT NULL CHECK (subject_sex IN ('homme', 'femme', 'autre')),
  subject_age INT NOT NULL CHECK (subject_age BETWEEN 16 AND 99),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  total_score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 0,
  answered_count INT NOT NULL DEFAULT 0,
  timed_out_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashflag_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES flashflag_sessions(id) ON DELETE CASCADE,
  question_index INT NOT NULL,
  question_text TEXT NOT NULL,
  selected_option TEXT,
  selected_score INT NOT NULL DEFAULT 0 CHECK (selected_score BETWEEN 0 AND 2),
  timed_out BOOLEAN NOT NULL DEFAULT false,
  time_spent_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, question_index)
);

CREATE INDEX IF NOT EXISTS idx_flashflag_tests_active ON flashflag_tests(is_active, is_standard);
CREATE INDEX IF NOT EXISTS idx_flashflag_questions_test ON flashflag_questions(test_id, position);
CREATE INDEX IF NOT EXISTS idx_flashflag_options_question ON flashflag_options(question_id, position);
CREATE INDEX IF NOT EXISTS idx_flashflag_sessions_code ON flashflag_sessions(access_code);
CREATE INDEX IF NOT EXISTS idx_flashflag_sessions_status ON flashflag_sessions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flashflag_answers_session ON flashflag_answers(session_id, question_index);

CREATE OR REPLACE FUNCTION set_flashflag_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_flashflag_tests_updated_at ON flashflag_tests;
CREATE TRIGGER trg_flashflag_tests_updated_at
  BEFORE UPDATE ON flashflag_tests
  FOR EACH ROW
  EXECUTE FUNCTION set_flashflag_updated_at();
