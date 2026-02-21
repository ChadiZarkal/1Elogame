/**
 * @module repositories/analytics
 * In-memory analytics session storage.
 * Both mock and production share this implementation (server-side only).
 */

import type { AnalyticsSessionData } from '@/types/analytics';
import { MAX_ANALYTICS_SESSIONS } from '@/config/constants';

// Declare global store
declare global {
  // eslint-disable-next-line no-var
  var __analyticsSessions: AnalyticsSessionData[] | undefined;
}

function getStore(): AnalyticsSessionData[] {
  if (!globalThis.__analyticsSessions) {
    globalThis.__analyticsSessions = [];
  }
  return globalThis.__analyticsSessions;
}

/** Save an analytics session, with deduplication by sessionId. */
export function saveAnalyticsSession(session: AnalyticsSessionData): void {
  const store = getStore();

  // Deduplicate: update existing session if same sessionId
  const existingIdx = store.findIndex((s) => s.sessionId === session.sessionId);
  if (existingIdx >= 0) {
    store[existingIdx] = session;
  } else {
    store.push(session);
  }

  // Trim to max size
  if (store.length > MAX_ANALYTICS_SESSIONS) {
    store.splice(0, store.length - MAX_ANALYTICS_SESSIONS);
  }
}

/** Get all stored analytics sessions. */
export function getAnalyticsSessions(): AnalyticsSessionData[] {
  return getStore();
}
