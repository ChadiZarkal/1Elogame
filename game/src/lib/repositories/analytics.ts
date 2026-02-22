/**
 * @module repositories/analytics
 * Analytics session storage.
 * - Mock mode: in-memory globalThis (no DB required for local dev)
 * - Production mode: Supabase `analytics_sessions` table (persistent across restarts)
 */

import type { AnalyticsSessionData } from '@/types/analytics';
import { MAX_ANALYTICS_SESSIONS } from '@/config/constants';
import { isMockMode } from '@/lib/apiHelpers';

// ─── In-memory store (mock / fallback) ────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __analyticsSessions: AnalyticsSessionData[] | undefined;
}

function getMemoryStore(): AnalyticsSessionData[] {
  if (!globalThis.__analyticsSessions) {
    globalThis.__analyticsSessions = [];
  }
  return globalThis.__analyticsSessions;
}

// ─── Supabase row ↔ AnalyticsSessionData mapping ──────────────────────────────

type AnalyticsRow = {
  session_id: string;
  started_at: number;
  flushed_at: number;
  duration: number;
  page_views: string[];
  game_entries: { game: string; at: number }[];
  votes: number;
  ai_requests: number;
  choices_before_quit: number;
  category: string | null;
  sex: string | null;
  age: string | null;
};

function toRow(s: AnalyticsSessionData): AnalyticsRow {
  return {
    session_id: s.sessionId,
    started_at: s.startedAt,
    flushed_at: s.flushedAt,
    duration: s.duration,
    page_views: s.pageViews,
    game_entries: s.gameEntries,
    votes: s.votes,
    ai_requests: s.aiRequests,
    choices_before_quit: s.choicesBeforeQuit,
    category: s.category,
    sex: s.sex,
    age: s.age,
  };
}

function fromRow(row: AnalyticsRow): AnalyticsSessionData {
  return {
    sessionId: row.session_id,
    startedAt: row.started_at,
    flushedAt: row.flushed_at,
    duration: row.duration,
    pageViews: row.page_views ?? [],
    gameEntries: row.game_entries ?? [],
    votes: row.votes,
    aiRequests: row.ai_requests,
    choicesBeforeQuit: row.choices_before_quit,
    category: row.category,
    sex: row.sex,
    age: row.age,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Save an analytics session.
 * Production: upsert into Supabase (durable). Mock: in-memory.
 */
export async function saveAnalyticsSession(session: AnalyticsSessionData): Promise<void> {
  if (isMockMode()) {
    // In-memory fallback for local dev
    const store = getMemoryStore();
    const idx = store.findIndex((s) => s.sessionId === session.sessionId);
    if (idx >= 0) store[idx] = session;
    else store.push(session);
    if (store.length > MAX_ANALYTICS_SESSIONS) store.splice(0, store.length - MAX_ANALYTICS_SESSIONS);
    return;
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('analytics_sessions')
    .upsert(toRow(session), { onConflict: 'session_id' });

  if (error) {
    // Non-fatal: log and swallow — analytics must not break the game
    console.error('[analytics] Failed to save session:', error.message);
  }
}

/**
 * Retrieve analytics sessions.
 * Production: last MAX_ANALYTICS_SESSIONS rows from Supabase, sorted by start time desc.
 * Mock: from in-memory store.
 */
export async function getAnalyticsSessions(): Promise<AnalyticsSessionData[]> {
  if (isMockMode()) {
    return getMemoryStore();
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('analytics_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(MAX_ANALYTICS_SESSIONS);

  if (error) {
    console.error('[analytics] Failed to fetch sessions:', error.message);
    return [];
  }
  return (data as AnalyticsRow[]).map(fromRow);
}

