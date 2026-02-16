/**
 * Client-side analytics tracking for Red Flag Games v3.7
 * Tracks: page views, game entries, session duration, votes, AI requests, choices before quit
 */

// Session-level analytics state
interface AnalyticsSession {
  sessionId: string;
  startedAt: number;
  pageViews: string[];
  gameEntries: { game: string; at: number }[];
  votes: number;
  aiRequests: number;
  choicesBeforeQuit: number;
  category: string | null;
  sex: string | null;
  age: string | null;
}

const SESSION_KEY = 'rfg_analytics_session';
const EVENTS_KEY = 'rfg_analytics_events';

function generateSessionId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getSession(): AnalyticsSession {
  if (typeof window === 'undefined') {
    return createNewSession();
  }
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch { /* ignore */ }
  return createNewSession();
}

function createNewSession(): AnalyticsSession {
  const session: AnalyticsSession = {
    sessionId: generateSessionId(),
    startedAt: Date.now(),
    pageViews: [],
    gameEntries: [],
    votes: 0,
    aiRequests: 0,
    choicesBeforeQuit: 0,
    category: null,
    sex: null,
    age: null,
  };
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

function saveSession(session: AnalyticsSession): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

// ═══════════════════════════════════════
// Public tracking functions
// ═══════════════════════════════════════

/**
 * Track a page view. Deduplicates within the same session.
 * @param page - The page path (e.g., '/jeu', '/classement')
 */
export function trackPageView(page: string): void {
  const session = getSession();
  if (!session.pageViews.includes(page)) {
    session.pageViews.push(page);
  }
  saveSession(session);
  storeEvent({ type: 'page_view', page, sessionId: session.sessionId });
}

/**
 * Track a game entry event.
 * @param game - The game identifier ('redflag', 'flagornot', 'redflagtest')
 */
export function trackGameEntry(game: 'redflag' | 'flagornot' | 'redflagtest'): void {
  const session = getSession();
  session.gameEntries.push({ game, at: Date.now() });
  saveSession(session);
  storeEvent({ type: 'game_entry', game, sessionId: session.sessionId });
}

/**
 * Track a vote event, incrementing vote count and choices-before-quit.
 * @param category - Optional category name for the vote
 */
export function trackVote(category?: string | null): void {
  const session = getSession();
  session.votes += 1;
  session.choicesBeforeQuit += 1;
  if (category) session.category = category;
  saveSession(session);
  storeEvent({ type: 'vote', sessionId: session.sessionId, category: category || null });
}

/** Track an AI judge request (Flag or Not game). */
export function trackAIRequest(): void {
  const session = getSession();
  session.aiRequests += 1;
  saveSession(session);
  storeEvent({ type: 'ai_request', sessionId: session.sessionId });
}

/**
 * Track player profile data for demographic analytics.
 * @param sex - Player's sex ('homme', 'femme', 'autre')
 * @param age - Player's age bracket ('16-18', '19-22', '23-26', '27+')
 */
export function trackProfile(sex: string, age: string): void {
  const session = getSession();
  session.sex = sex;
  session.age = age;
  saveSession(session);
  storeEvent({ type: 'profile', sessionId: session.sessionId, sex, age });
}

/**
 * Track a game category change.
 * @param category - The new category ('sexe', 'lifestyle', 'quotidien', 'bureau')
 */
export function trackCategoryChange(category: string): void {
  const session = getSession();
  session.category = category;
  saveSession(session);
  storeEvent({ type: 'category_change', sessionId: session.sessionId, category });
}

// ═══════════════════════════════════════
// Event storage (localStorage-based for mock mode)
// ═══════════════════════════════════════

interface AnalyticsEvent {
  type: string;
  sessionId: string;
  timestamp?: number;
  [key: string]: unknown;
}

function storeEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  
  event.timestamp = Date.now();
  
  try {
    const stored = localStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
    events.push(event);
    // Keep last 2000 events max
    if (events.length > 2000) events.splice(0, events.length - 2000);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch { /* ignore quota errors */ }
}

// ═══════════════════════════════════════
// Aggregation functions (for admin dashboard)
// ═══════════════════════════════════════

/** Retrieve all stored analytics events from localStorage. */
export function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(EVENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

/** Get the current session duration in seconds. */
export function getSessionDuration(): number {
  const session = getSession();
  return Math.round((Date.now() - session.startedAt) / 1000);
}

/** Get current session stats for display/debugging. */
export function getCurrentSessionStats(): AnalyticsSession {
  return getSession();
}

/**
 * Flush session data to the analytics API endpoint.
 * Uses navigator.sendBeacon for reliable delivery on page unload.
 * Falls back to fetch with keepalive.
 */
export function flushSessionToAPI(): void {
  const session = getSession();
  if (!session) return; // Nothing to flush if no session exists
  
  const duration = getSessionDuration();
  
  // Use navigator.sendBeacon for reliable delivery on page unload
  const payload = JSON.stringify({
    ...session,
    duration,
    flushedAt: Date.now(),
  });
  
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/session', payload);
  } else {
    fetch('/api/analytics/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}
