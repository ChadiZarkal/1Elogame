/**
 * LocalStorage Session Management
 * 
 * Handles all client-side session data:
 * - Player profile (sex, age)
 * - Seen duels (to avoid repetition)
 * - Streak count
 * - Duel count
 */

import { GameSession, PlayerProfile } from '@/types/game';
import { getPairKey } from '@/lib/utils';

// Storage keys
const STORAGE_KEYS = {
  SESSION: 'rog_session',
  ADMIN_TOKEN: 'rog_admin_token',
} as const;

// Maximum seen duels to store (cleanup threshold)
const MAX_SEEN_DUELS = 200;

/**
 * Check if LocalStorage is available.
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current game session from LocalStorage.
 * Returns null if no session exists.
 */
export function getSession(): GameSession | null {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!stored) return null;
    
    const session = JSON.parse(stored) as GameSession;
    
    // Validate session structure
    if (!session.profile || !session.profile.sex || !session.profile.age) {
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * Initialize a new game session with the given profile.
 */
export function initSession(profile: PlayerProfile): GameSession {
  const session: GameSession = {
    profile,
    seenDuels: [],
    streak: 0,
    duelCount: 0,
  };
  
  saveSession(session);
  return session;
}

/**
 * Save the session to LocalStorage.
 */
export function saveSession(session: GameSession): void {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Clear the current session.
 */
export function clearSession(): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/**
 * Check if a profile exists.
 */
export function hasProfile(): boolean {
  const session = getSession();
  return session !== null && session.profile !== null;
}

/**
 * Get the player profile from the session.
 */
export function getProfile(): PlayerProfile | null {
  const session = getSession();
  return session?.profile ?? null;
}

/**
 * @deprecated Use getPairKey from '@/lib/utils' instead.
 * Kept for backward compatibility.
 */
export function getDuelPairKey(idA: string, idB: string): string {
  return getPairKey(idA, idB);
}

/**
 * Check if a duel pair has been seen.
 */
export function hasSeenDuel(idA: string, idB: string): boolean {
  const session = getSession();
  if (!session) return false;
  
  const key = getDuelPairKey(idA, idB);
  return session.seenDuels.includes(key);
}

/**
 * Mark a duel as seen and update the session.
 * Also tracks individual element appearances for anti-repeat.
 */
export function markDuelAsSeen(idA: string, idB: string): void {
  const session = getSession();
  if (!session) return;
  
  const key = getDuelPairKey(idA, idB);
  
  if (!session.seenDuels.includes(key)) {
    session.seenDuels.push(key);
    session.duelCount++;
    
    // Cleanup if too many duels stored
    if (session.seenDuels.length > MAX_SEEN_DUELS) {
      // Remove oldest half
      session.seenDuels = session.seenDuels.slice(MAX_SEEN_DUELS / 2);
    }
  }
  
  // Track element appearances for anti-repeat
  if (!session.elementAppearances) session.elementAppearances = {};
  session.elementAppearances[idA] = (session.elementAppearances[idA] || 0) + 1;
  session.elementAppearances[idB] = (session.elementAppearances[idB] || 0) + 1;
  
  // Track recent elements (circular buffer, keep last 20)
  if (!session.recentElementIds) session.recentElementIds = [];
  session.recentElementIds.push(idA, idB);
  if (session.recentElementIds.length > 20) {
    session.recentElementIds = session.recentElementIds.slice(-20);
  }
  
  saveSession(session);
}

/**
 * Get the list of seen duel pair keys.
 */
export function getSeenDuels(): string[] {
  const session = getSession();
  return session?.seenDuels ?? [];
}

/**
 * Get seen duels as a comma-separated string for API calls.
 */
export function getSeenDuelsString(): string {
  return getSeenDuels().join(',');
}

/**
 * Get the recent element IDs (for cooldown anti-repeat).
 */
export function getRecentElementIds(): string[] {
  const session = getSession();
  return session?.recentElementIds ?? [];
}

/**
 * Get element appearance counts (for max-appearances anti-repeat).
 */
export function getElementAppearances(): Record<string, number> {
  const session = getSession();
  return session?.elementAppearances ?? {};
}

/**
 * Get recent element IDs as a comma-separated string for API calls.
 */
export function getRecentElementIdsString(): string {
  return getRecentElementIds().join(',');
}

/**
 * Get element appearances as a compact string for API calls.
 * Format: "id1:count1,id2:count2,..."
 */
export function getElementAppearancesString(): string {
  const appearances = getElementAppearances();
  return Object.entries(appearances)
    .map(([id, count]) => `${id}:${count}`)
    .join(',');
}

/**
 * Get the current streak count.
 */
export function getStreak(): number {
  const session = getSession();
  return session?.streak ?? 0;
}

/**
 * Update the streak based on whether the player matched the majority.
 */
export function updateStreak(matched: boolean): number {
  const session = getSession();
  if (!session) return 0;
  
  if (matched) {
    session.streak++;
  } else {
    session.streak = 0;
  }
  
  saveSession(session);
  return session.streak;
}

/**
 * Get the total duel count for this session.
 */
export function getDuelCount(): number {
  const session = getSession();
  return session?.duelCount ?? 0;
}

/**
 * Get the streak fire emoji based on streak count.
 */
export function getStreakEmoji(streak: number): string {
  if (streak >= 20) return '🔥🔥🔥';
  if (streak >= 10) return '🔥🔥';
  if (streak >= 5) return '🔥';
  return '';
}

// Admin token management
export function getAdminToken(): string | null {
  if (!isLocalStorageAvailable()) return null;
  return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
}

export function setAdminToken(token: string): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
}

export function clearAdminToken(): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
}
