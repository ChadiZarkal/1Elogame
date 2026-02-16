/**
 * @file analytics.test.ts
 * @description Tests unitaires pour le système d'analytics client-side
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trackPageView,
  trackGameEntry,
  trackVote,
  trackAIRequest,
  trackProfile,
  trackCategoryChange,
  getStoredEvents,
  getSessionDuration,
  getCurrentSessionStats,
  flushSessionToAPI,
} from '@/lib/analytics';

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe('trackPageView', () => {
  it('enregistre une page vue', () => {
    trackPageView('/test');
    const stats = getCurrentSessionStats();
    expect(stats.pageViews).toContain('/test');
  });

  it('ne duplique pas les pages', () => {
    trackPageView('/test');
    trackPageView('/test');
    const stats = getCurrentSessionStats();
    expect(stats.pageViews.filter(p => p === '/test')).toHaveLength(1);
  });

  it('stocke un événement dans localStorage', () => {
    trackPageView('/home');
    const events = getStoredEvents();
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events.some(e => e.type === 'page_view' && e.page === '/home')).toBe(true);
  });
});

describe('trackGameEntry', () => {
  it('enregistre une entrée de jeu', () => {
    trackGameEntry('redflag');
    const stats = getCurrentSessionStats();
    expect(stats.gameEntries).toHaveLength(1);
    expect(stats.gameEntries[0].game).toBe('redflag');
  });

  it('permet plusieurs entrées', () => {
    trackGameEntry('redflag');
    trackGameEntry('flagornot');
    const stats = getCurrentSessionStats();
    expect(stats.gameEntries).toHaveLength(2);
  });
});

describe('trackVote', () => {
  it('incrémente le compteur de votes', () => {
    trackVote();
    trackVote();
    const stats = getCurrentSessionStats();
    expect(stats.votes).toBe(2);
    expect(stats.choicesBeforeQuit).toBe(2);
  });

  it('enregistre la catégorie', () => {
    trackVote('sexe');
    const stats = getCurrentSessionStats();
    expect(stats.category).toBe('sexe');
  });
});

describe('trackAIRequest', () => {
  it('incrémente le compteur de requêtes AI', () => {
    trackAIRequest();
    trackAIRequest();
    const stats = getCurrentSessionStats();
    expect(stats.aiRequests).toBe(2);
  });
});

describe('trackProfile', () => {
  it('enregistre le sexe et l\'âge', () => {
    trackProfile('homme', '19-22');
    const stats = getCurrentSessionStats();
    expect(stats.sex).toBe('homme');
    expect(stats.age).toBe('19-22');
  });
});

describe('trackCategoryChange', () => {
  it('met à jour la catégorie', () => {
    trackCategoryChange('bureau');
    const stats = getCurrentSessionStats();
    expect(stats.category).toBe('bureau');
  });
});

describe('getSessionDuration', () => {
  it('retourne une durée positive', () => {
    const duration = getSessionDuration();
    expect(duration).toBeGreaterThanOrEqual(0);
  });
});

describe('getCurrentSessionStats', () => {
  it('retourne un objet session valide', () => {
    const stats = getCurrentSessionStats();
    expect(stats).toHaveProperty('sessionId');
    expect(stats).toHaveProperty('startedAt');
    expect(stats).toHaveProperty('pageViews');
    expect(stats).toHaveProperty('gameEntries');
    expect(stats).toHaveProperty('votes');
    expect(stats).toHaveProperty('aiRequests');
    expect(stats.votes).toBe(0);
  });
});

describe('getStoredEvents', () => {
  it('retourne un tableau vide au début', () => {
    expect(getStoredEvents()).toEqual([]);
  });

  it('accumule les événements', () => {
    trackPageView('/a');
    trackVote('sexe');
    trackAIRequest();
    const events = getStoredEvents();
    expect(events.length).toBe(3);
  });
});

describe('flushSessionToAPI', () => {
  it('appelle sendBeacon si disponible', () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', {
      value: sendBeacon,
      writable: true,
      configurable: true,
    });

    trackProfile('femme', '23-26');
    flushSessionToAPI();

    expect(sendBeacon).toHaveBeenCalledWith(
      '/api/analytics/session',
      expect.any(String)
    );
    
    // Verify the payload is valid JSON
    const payload = JSON.parse(sendBeacon.mock.calls[0][1] as string);
    expect(payload.sex).toBe('femme');
    expect(payload.age).toBe('23-26');
    expect(payload.duration).toBeGreaterThanOrEqual(0);
  });
});
