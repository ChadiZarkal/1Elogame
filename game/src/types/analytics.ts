/**
 * @module types/analytics
 * Analytics and session tracking types — single source of truth
 * used by both analytics/session route and admin/demographics route.
 */

/** Data sent by the client when flushing an analytics session. */
export interface AnalyticsSessionData {
  sessionId: string;
  startedAt: number;
  duration: number;
  pageViews: string[];
  gameEntries: { game: string; at: number }[];
  votes: number;
  aiRequests: number;
  choicesBeforeQuit: number;
  category: string | null;
  sex: string | null;
  age: string | null;
  flushedAt: number;
}

/** Community submission for "Flag or Not" game. */
export interface CommunitySubmission {
  id: string;
  text: string;
  verdict: 'red' | 'green';
  timestamp: number;
}


