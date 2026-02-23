-- Migration: Persistent algorithm configuration
-- Date: 23 février 2026
-- Purpose: Store admin algorithm config in Supabase for persistence across deploys.
--          Solves the problem where globalThis resets on every Vercel cold start.

CREATE TABLE IF NOT EXISTS algorithm_config (
  id              TEXT PRIMARY KEY DEFAULT 'current',
  config          JSONB NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by      TEXT DEFAULT 'admin'
);

-- RLS: service_role only (admin API routes use service key)
ALTER TABLE algorithm_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on algorithm_config"
  ON algorithm_config FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Block anon entirely
CREATE POLICY "No anon access on algorithm_config"
  ON algorithm_config FOR ALL TO anon
  USING (false) WITH CHECK (false);
