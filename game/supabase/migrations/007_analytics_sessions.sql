-- Migration: Persistent analytics sessions table
-- Date: 22 février 2026
-- Purpose: Replace in-memory globalThis store with durable Supabase storage
--          so demographics data survives server restarts and redeploys.

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      TEXT NOT NULL UNIQUE,
  started_at      BIGINT NOT NULL,          -- Unix ms timestamp
  flushed_at      BIGINT NOT NULL,          -- Unix ms timestamp
  duration        INTEGER NOT NULL DEFAULT 0, -- seconds
  page_views      TEXT[]  NOT NULL DEFAULT '{}',
  game_entries    JSONB   NOT NULL DEFAULT '[]', -- [{game, at}]
  votes           INTEGER NOT NULL DEFAULT 0,
  ai_requests     INTEGER NOT NULL DEFAULT 0,
  choices_before_quit INTEGER NOT NULL DEFAULT 0,
  category        TEXT    DEFAULT NULL,
  sex             TEXT    DEFAULT NULL CHECK (sex IN ('homme','femme','nonbinaire','autre') OR sex IS NULL),
  age             TEXT    DEFAULT NULL CHECK (age IN ('16-18','19-22','23-26','27+') OR age IS NULL),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for time-based queries (visitor evolution charts)
CREATE INDEX idx_analytics_started_at  ON analytics_sessions (started_at);
-- Index for demographic filters
CREATE INDEX idx_analytics_sex         ON analytics_sessions (sex);
CREATE INDEX idx_analytics_age         ON analytics_sessions (age);
-- Index for category breakdown
CREATE INDEX idx_analytics_category    ON analytics_sessions (category);

-- RLS: admins read all, service_role write, public cannot access
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access on analytics_sessions"
  ON analytics_sessions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Anon inserts (POST from browser via /api/analytics/session)
CREATE POLICY "Anon can insert analytics sessions"
  ON analytics_sessions FOR INSERT TO anon
  WITH CHECK (true);

-- Block anon reads — only service_role (server-side) can SELECT
CREATE POLICY "No anon read on analytics_sessions"
  ON analytics_sessions FOR SELECT TO anon
  USING (false);
