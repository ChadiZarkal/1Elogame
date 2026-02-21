/**
 * @module config/constants
 * All magic numbers, URLs, and configuration values in one place.
 * Import from here instead of hardcoding values in components/routes.
 */

// ---------------------------------------------------------------------------
// Game settings
// ---------------------------------------------------------------------------

/** Maximum text length for Flag or Not submissions. */
export const MAX_FLAGORNOT_TEXT_LENGTH = 280;

// ---------------------------------------------------------------------------
// API limits
// ---------------------------------------------------------------------------

/** Max analytics sessions stored in memory. */
export const MAX_ANALYTICS_SESSIONS = 500;

/** Max seen duels string length before rejecting. */
export const MAX_SEEN_DUELS_STRING_LENGTH = 10_000;
