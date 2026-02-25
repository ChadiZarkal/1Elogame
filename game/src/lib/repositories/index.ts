/**
 * @module repositories
 * Data access layer barrel exports.
 * Routes import from here instead of knowing about mock/Supabase internals.
 */

export { getActiveElements, getElementsByIds, getAllElements, getAllElementsEnriched, updateElement, createElement, deleteElement, getStarredPairs, getLeaderboard } from './elements';
export { processVote } from './votes';
export type { VoteResultData } from './votes';
export { upsertFeedback } from './feedback';
export { getPublicStats, getAdminStats } from './stats';
export { getRecentSubmissions, saveSubmission, getGlobalVerdictCounts } from './community';
export { saveAnalyticsSession, getAnalyticsSessions } from './analytics';
