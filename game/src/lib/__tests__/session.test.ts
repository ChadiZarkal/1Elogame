/**
 * @file session.test.ts
 * @description Tests unitaires pour la gestion de session localStorage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isLocalStorageAvailable,
  getSession,
  initSession,
  saveSession,
  clearSession,
  hasProfile,
  getProfile,
  getDuelPairKey,
  hasSeenDuel,
  markDuelAsSeen,
  getSeenDuels,
  getSeenDuelsString,
  getStreak,
  updateStreak,
  getDuelCount,
  getStreakEmoji,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
} from '@/lib/session';

beforeEach(() => {
  localStorage.clear();
});

describe('isLocalStorageAvailable', () => {
  it('retourne true dans jsdom', () => {
    expect(isLocalStorageAvailable()).toBe(true);
  });
});

describe('Session lifecycle', () => {
  it('getSession retourne null sans session', () => {
    expect(getSession()).toBeNull();
  });

  it('initSession crée une session valide', () => {
    const session = initSession({ sex: 'homme', age: '19-22' });
    expect(session.profile.sex).toBe('homme');
    expect(session.profile.age).toBe('19-22');
    expect(session.seenDuels).toEqual([]);
    expect(session.streak).toBe(0);
    expect(session.duelCount).toBe(0);
  });

  it('getSession retrouve la session sauvegardée', () => {
    initSession({ sex: 'femme', age: '23-26' });
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session!.profile.sex).toBe('femme');
  });

  it('clearSession supprime la session', () => {
    initSession({ sex: 'homme', age: '16-18' });
    clearSession();
    expect(getSession()).toBeNull();
  });
});

describe('Profile', () => {
  it('hasProfile retourne false sans session', () => {
    expect(hasProfile()).toBe(false);
  });

  it('hasProfile retourne true avec session', () => {
    initSession({ sex: 'autre', age: '27+' });
    expect(hasProfile()).toBe(true);
  });

  it('getProfile retourne le profil', () => {
    initSession({ sex: 'homme', age: '19-22' });
    expect(getProfile()).toEqual({ sex: 'homme', age: '19-22' });
  });

  it('getProfile retourne null sans session', () => {
    expect(getProfile()).toBeNull();
  });
});

describe('getDuelPairKey', () => {
  it('trie alphabétiquement les IDs', () => {
    expect(getDuelPairKey('b', 'a')).toBe('a-b');
    expect(getDuelPairKey('a', 'b')).toBe('a-b');
  });
});

describe('Seen duels', () => {
  beforeEach(() => {
    initSession({ sex: 'homme', age: '19-22' });
  });

  it('hasSeenDuel retourne false par défaut', () => {
    expect(hasSeenDuel('a', 'b')).toBe(false);
  });

  it('markDuelAsSeen marque le duel', () => {
    markDuelAsSeen('a', 'b');
    expect(hasSeenDuel('a', 'b')).toBe(true);
    expect(hasSeenDuel('b', 'a')).toBe(true); // Ordre inversé
  });

  it('markDuelAsSeen incrémente le compteur', () => {
    markDuelAsSeen('a', 'b');
    expect(getDuelCount()).toBe(1);
    markDuelAsSeen('c', 'd');
    expect(getDuelCount()).toBe(2);
  });

  it('ne duplique pas un duel déjà vu', () => {
    markDuelAsSeen('a', 'b');
    markDuelAsSeen('a', 'b');
    expect(getSeenDuels()).toHaveLength(1);
    expect(getDuelCount()).toBe(1);
  });

  it('getSeenDuels retourne la liste', () => {
    markDuelAsSeen('a', 'b');
    markDuelAsSeen('c', 'd');
    expect(getSeenDuels()).toEqual(['a-b', 'c-d']);
  });

  it('getSeenDuelsString retourne un CSV', () => {
    markDuelAsSeen('a', 'b');
    markDuelAsSeen('c', 'd');
    expect(getSeenDuelsString()).toBe('a-b,c-d');
  });
});

describe('Streak', () => {
  beforeEach(() => {
    initSession({ sex: 'femme', age: '23-26' });
  });

  it('streak commence à 0', () => {
    expect(getStreak()).toBe(0);
  });

  it('updateStreak(true) incrémente', () => {
    expect(updateStreak(true)).toBe(1);
    expect(updateStreak(true)).toBe(2);
    expect(updateStreak(true)).toBe(3);
  });

  it('updateStreak(false) remet à 0', () => {
    updateStreak(true);
    updateStreak(true);
    expect(updateStreak(false)).toBe(0);
  });
});

describe('getStreakEmoji', () => {
  it('pas d\'emoji sous 5', () => {
    expect(getStreakEmoji(0)).toBe('');
    expect(getStreakEmoji(4)).toBe('');
  });

  it('1 feu entre 5 et 9', () => {
    expect(getStreakEmoji(5)).toBe('🔥');
    expect(getStreakEmoji(9)).toBe('🔥');
  });

  it('2 feux entre 10 et 19', () => {
    expect(getStreakEmoji(10)).toBe('🔥🔥');
  });

  it('3 feux à 20+', () => {
    expect(getStreakEmoji(20)).toBe('🔥🔥🔥');
    expect(getStreakEmoji(100)).toBe('🔥🔥🔥');
  });
});

describe('Admin token', () => {
  it('pas de token par défaut', () => {
    expect(getAdminToken()).toBeNull();
  });

  it('set et get fonctionnent', () => {
    setAdminToken('admin_123');
    expect(getAdminToken()).toBe('admin_123');
  });

  it('clearAdminToken supprime le token', () => {
    setAdminToken('admin_123');
    clearAdminToken();
    expect(getAdminToken()).toBeNull();
  });
});
