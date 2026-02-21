/**
 * @module lib
 * @description Barrel exports for all library/utility modules.
 */

// Auth
export { generateAdminToken, validateAdminToken, revokeAdminToken, extractBearerToken, authenticateAdmin } from './adminAuth';

// Algorithm
export { selectDuelPair, selectStrategy, shuffleArray, isPairSeen, filterByAntiRepeat, findCloseEloPairs, findCrossCategoryPairs, findRandomPairs, toElementDTO, getTotalPossibleDuels, allDuelsExhausted } from './algorithm';
export type { AntiRepeatContext } from './algorithm';

// Algorithm Config
export { getAlgorithmConfig, setAlgorithmConfig, resetAlgorithmConfig, DEFAULT_ALGORITHM_CONFIG } from './algorithmConfig';
export type { StrategyConfig, AlgorithmConfig } from './algorithmConfig';

// Analytics
export { trackPageView, trackGameEntry, trackAIRequest, trackVote, trackProfile, trackCategoryChange, getStoredEvents, getSessionDuration, getCurrentSessionStats, flushSessionToAPI } from './analytics';

// ELO
export { DEFAULT_ELO, calculateNewELO, estimatePercentage, getEloDifference, isCloseElo, getKFactor, didMatchMajority, getEloFieldForSex, getEloFieldForAge, getParticipationFieldForSex, getParticipationFieldForAge } from './elo';

// Gemini
export { judgeWithGemini } from './gemini';

// Hooks
export { useReducedMotion, useHaptics } from './hooks';

// Mock Data
export { mockElements, getMockElements, getMockElement, getSeenPairs, recordMockVote, updateMockElo } from './mockData';

// Rate Limit
export { RATE_LIMITS, checkRateLimit, resetRateLimitStore } from './rateLimit';

// Sanitize
export { sanitizeText } from './sanitize';

// Session
export { isLocalStorageAvailable, getSession, initSession, saveSession, clearSession, hasProfile, getProfile, markDuelAsSeen, getSeenDuels, getSeenDuelsString, getRecentElementIds, getElementAppearances, getRecentElementIdsString, getElementAppearancesString, getStreak, updateStreak, getDuelCount, getStreakEmoji, getAdminToken, setAdminToken, clearAdminToken } from './session';

// Supabase
export { getSupabaseClient, createServerClient, typedInsert, typedUpdate } from './supabase';

// Utils
export { cn, formatNumber, createApiError, createApiSuccess, getPairKey } from './utils';

// Validations
export { categorieSchema, sexeVotantSchema, ageVotantSchema, feedbackTypeSchema, playerProfileSchema, elementCreateSchema, elementUpdateSchema, voteSchema, feedbackSchema, adminLoginSchema, duelQuerySchema, elementsQuerySchema, rankingsQuerySchema } from './validations';
export type { PlayerProfileInput, ElementCreateInput, ElementUpdateInput, VoteInput, FeedbackInput, AdminLoginInput } from './validations';
