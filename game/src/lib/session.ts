/** LocalStorage session management — profile, seen duels, streak. */

import { GameSession, PlayerProfile } from '@/types/game';
import { getPairKey } from '@/lib/utils';

const STORAGE_KEYS = {
  SESSION: 'rog_session',
  ADMIN_TOKEN: 'rog_admin_token',
} as const;

const MAX_SEEN_DUELS = 200;
/** Max tracked elements in appearance map (prevents oversized API params). */
const MAX_ELEMENT_APPEARANCES = 150;

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

export function getSession(): GameSession | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!stored) return null;
    const session = JSON.parse(stored) as GameSession;
    if (!session.profile || !session.profile.sex || !session.profile.age) return null;
    return session;
  } catch {
    return null;
  }
}

export function initSession(profile: PlayerProfile): GameSession {
  const session: GameSession = { profile, seenDuels: [], streak: 0, duelCount: 0 };
  saveSession(session);
  return session;
}

export function saveSession(session: GameSession): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function clearSession(): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function hasProfile(): boolean {
  const session = getSession();
  return session !== null && session.profile !== null;
}

export function getProfile(): PlayerProfile | null {
  return getSession()?.profile ?? null;
}

/**
 * Enregistre le profil sans détruire le reste de la session.
 *
 * `initSession` repart d'une session vide : appelé depuis « C'est un 10
 * mais… », où le profil est demandé en cours de partie et non à l'entrée, il
 * effacerait les duels déjà vus et la série en cours de l'autre jeu, qui
 * partage ce même enregistrement.
 */
export function saveProfile(profile: PlayerProfile): void {
  if (!isLocalStorageAvailable()) return;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    const existing = stored ? (JSON.parse(stored) as Partial<GameSession>) : null;
    const session: GameSession = {
      seenDuels: existing?.seenDuels ?? [],
      streak: existing?.streak ?? 0,
      duelCount: existing?.duelCount ?? 0,
      recentElementIds: existing?.recentElementIds,
      elementAppearances: existing?.elementAppearances,
      profile,
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch {
    /* stockage indisponible ou enregistrement illisible */
  }
}

export function markDuelAsSeen(idA: string, idB: string): void {
  const session = getSession();
  if (!session) return;

  const key = getPairKey(idA, idB);

  if (!session.seenDuels.includes(key)) {
    session.seenDuels.push(key);
    session.duelCount++;
    if (session.seenDuels.length > MAX_SEEN_DUELS) {
      session.seenDuels = session.seenDuels.slice(MAX_SEEN_DUELS / 2);
    }
  }

  if (!session.elementAppearances) session.elementAppearances = {};
  session.elementAppearances[idA] = (session.elementAppearances[idA] || 0) + 1;
  session.elementAppearances[idB] = (session.elementAppearances[idB] || 0) + 1;

  // Cap appearance map size to prevent oversized query params
  if (Object.keys(session.elementAppearances).length > MAX_ELEMENT_APPEARANCES) {
    const sorted = Object.entries(session.elementAppearances).sort((a, b) => a[1] - b[1]);
    const trimmed: Record<string, number> = {};
    for (const [id, count] of sorted.slice(sorted.length - MAX_ELEMENT_APPEARANCES)) {
      trimmed[id] = count;
    }
    session.elementAppearances = trimmed;
  }

  if (!session.recentElementIds) session.recentElementIds = [];
  session.recentElementIds.push(idA, idB);
  if (session.recentElementIds.length > 20) {
    session.recentElementIds = session.recentElementIds.slice(-20);
  }

  saveSession(session);
}

export function getSeenDuels(): string[] {
  return getSession()?.seenDuels ?? [];
}

export function getSeenDuelsString(): string {
  return getSeenDuels().join(',');
}

export function getRecentElementIds(): string[] {
  return getSession()?.recentElementIds ?? [];
}

export function getElementAppearances(): Record<string, number> {
  return getSession()?.elementAppearances ?? {};
}

export function getRecentElementIdsString(): string {
  return getRecentElementIds().join(',');
}

export function getElementAppearancesString(): string {
  return Object.entries(getElementAppearances())
    .map(([id, count]) => `${id}:${count}`)
    .join(',');
}

export function getStreak(): number {
  return getSession()?.streak ?? 0;
}

export function updateStreak(matched: boolean): number {
  const session = getSession();
  if (!session) return 0;
  session.streak = matched ? session.streak + 1 : 0;
  saveSession(session);
  return session.streak;
}

export function getDuelCount(): number {
  return getSession()?.duelCount ?? 0;
}

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
