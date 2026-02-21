/**
 * @file analytics-session.test.ts
 * @description Tests for GET/POST /api/analytics/session
 * Covers: session storage, deduplication, max sessions cap, GET retrieval.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('/api/analytics/session', () => {
  beforeEach(() => {
    vi.resetModules();
    globalThis.__analyticsSessions = [];
  });

  const makeSessionBody = (overrides = {}) => ({
    sessionId: 'sess-1',
    startedAt: Date.now(),
    duration: 120000,
    pageViews: ['/'],
    gameEntries: [{ game: 'duel', at: Date.now() }],
    votes: 5,
    aiRequests: 1,
    choicesBeforeQuit: 3,
    category: 'love',
    sex: 'homme',
    age: '19-22',
    flushedAt: Date.now(),
    ...overrides,
  });

  describe('POST', () => {
    it('enregistre une session analytics', async () => {
      const { POST } = await import('@/app/api/analytics/session/route');
      const req = new NextRequest('http://localhost/api/analytics/session', {
        method: 'POST',
        body: JSON.stringify(makeSessionBody()),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(globalThis.__analyticsSessions).toHaveLength(1);
      expect(globalThis.__analyticsSessions![0].sessionId).toBe('sess-1');
    });

    it('déduplique par sessionId', async () => {
      const { POST } = await import('@/app/api/analytics/session/route');

      // First submission
      const req1 = new NextRequest('http://localhost/api/analytics/session', {
        method: 'POST',
        body: JSON.stringify(makeSessionBody({ votes: 5 })),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(req1);

      // Same sessionId, updated data
      const req2 = new NextRequest('http://localhost/api/analytics/session', {
        method: 'POST',
        body: JSON.stringify(makeSessionBody({ votes: 10 })),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(req2);

      expect(globalThis.__analyticsSessions).toHaveLength(1);
      expect(globalThis.__analyticsSessions![0].votes).toBe(10);
    });

    it('limite à 500 sessions maximum', async () => {
      const { POST } = await import('@/app/api/analytics/session/route');

      // Fill 501 sessions
      for (let i = 0; i < 501; i++) {
        const req = new NextRequest('http://localhost/api/analytics/session', {
          method: 'POST',
          body: JSON.stringify(makeSessionBody({ sessionId: `sess-${i}` })),
          headers: { 'Content-Type': 'application/json' },
        });
        await POST(req);
      }

      expect(globalThis.__analyticsSessions!.length).toBeLessThanOrEqual(500);
    });

    it('gère un body malformé', async () => {
      const { POST } = await import('@/app/api/analytics/session/route');
      const req = new NextRequest('http://localhost/api/analytics/session', {
        method: 'POST',
        body: 'not json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INTERNAL_ERROR');
    });

    it('utilise des valeurs par défaut pour les champs manquants', async () => {
      const { POST } = await import('@/app/api/analytics/session/route');
      const req = new NextRequest('http://localhost/api/analytics/session', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(globalThis.__analyticsSessions![0].sessionId).toBe('unknown');
      expect(globalThis.__analyticsSessions![0].votes).toBe(0);
      expect(globalThis.__analyticsSessions![0].category).toBeNull();
    });
  });

  describe('GET', () => {
    it('retourne les sessions stockées', async () => {
      const { POST, GET } = await import('@/app/api/analytics/session/route');

      // Add 2 sessions
      for (const id of ['sess-a', 'sess-b']) {
        const req = new NextRequest('http://localhost/api/analytics/session', {
          method: 'POST',
          body: JSON.stringify(makeSessionBody({ sessionId: id })),
          headers: { 'Content-Type': 'application/json' },
        });
        await POST(req);
      }

      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.sessions).toHaveLength(2);
      expect(json.data.count).toBe(2);
    });

    it('retourne un tableau vide si aucune session', async () => {
      const { GET } = await import('@/app/api/analytics/session/route');
      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.sessions).toHaveLength(0);
      expect(json.data.count).toBe(0);
    });
  });
});
