/**
 * @file flagornot-community.test.ts
 * @description Tests for GET/POST /api/flagornot/community
 * Covers: mock mode in-memory store, deduplication, limit, validation, emoji mapping.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(),
  typedInsert: vi.fn(),
}));

vi.mock('@/lib/sanitize', () => ({
  sanitizeText: vi.fn().mockImplementation((text: string, maxLen: number) =>
    text.slice(0, maxLen).trim()
  ),
}));

describe('/api/flagornot/community', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
  });

  const makePostRequest = (body: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/flagornot/community', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

  const makeGetRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/flagornot/community');
    for (const [key, val] of Object.entries(params)) {
      url.searchParams.set(key, val);
    }
    return new NextRequest(url.toString());
  };

  describe('POST', () => {
    it('enregistre une soumission en mock mode', async () => {
      const { POST, GET } = await import('@/app/api/flagornot/community/route');
      const response = await POST(makePostRequest({
        text: 'Être gentil',
        verdict: 'green',
      }));
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.saved).toBe(true);

      // Verify stored via GET
      const getResponse = await GET(makeGetRequest());
      const getJson = await getResponse.json();
      expect(getJson.data.submissions).toHaveLength(1);
    });

    it('stocke les soumissions avec le même texte séparément', async () => {
      const { POST, GET } = await import('@/app/api/flagornot/community/route');

      await POST(makePostRequest({ text: 'Être gentil', verdict: 'green' }));
      await POST(makePostRequest({ text: 'Être gentil', verdict: 'red' }));

      const getResponse = await GET(makeGetRequest());
      const getJson = await getResponse.json();
      expect(getJson.data.submissions).toHaveLength(2);
    });

    it('rejette un texte vide', async () => {
      const { POST } = await import('@/app/api/flagornot/community/route');
      const response = await POST(makePostRequest({ text: '', verdict: 'green' }));

      expect(response.status).toBe(400);
    });

    it('rejette un verdict invalide', async () => {
      const { POST } = await import('@/app/api/flagornot/community/route');
      const response = await POST(makePostRequest({
        text: 'Test',
        verdict: 'yellow',
      }));

      expect(response.status).toBe(400);
    });

    it('rejette un body sans texte', async () => {
      const { POST } = await import('@/app/api/flagornot/community/route');
      const response = await POST(makePostRequest({ verdict: 'green' }));

      expect(response.status).toBe(400);
    });

    it('limite le store à 100 entrées', async () => {
      const { POST } = await import('@/app/api/flagornot/community/route');
      const { getRecentSubmissions } = await import('@/lib/repositories');

      for (let i = 0; i < 105; i++) {
        await POST(makePostRequest({
          text: `Texte unique ${i}`,
          verdict: i % 2 === 0 ? 'red' : 'green',
        }));
      }

      const all = await getRecentSubmissions(200);
      expect(all.length).toBeLessThanOrEqual(100);
    });
  });

  describe('GET', () => {
    it('retourne les soumissions récentes', async () => {
      const { POST, GET } = await import('@/app/api/flagornot/community/route');

      await POST(makePostRequest({ text: 'Texte A', verdict: 'red' }));
      await POST(makePostRequest({ text: 'Texte B', verdict: 'green' }));

      const response = await GET(makeGetRequest());
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.submissions).toHaveLength(2);
      expect(json.data.total).toBe(2);
    });

    it('respecte la limite demandée', async () => {
      const { POST, GET } = await import('@/app/api/flagornot/community/route');

      for (let i = 0; i < 10; i++) {
        await POST(makePostRequest({ text: `Texte ${i}`, verdict: 'green' }));
      }

      const response = await GET(makeGetRequest({ limit: '3' }));
      const json = await response.json();

      expect(json.data.submissions).toHaveLength(3);
    });

    it('inclut emoji 🚩 pour red et 🟢 pour green', async () => {
      const { POST, GET } = await import('@/app/api/flagornot/community/route');

      await POST(makePostRequest({ text: 'Red text', verdict: 'red' }));
      await POST(makePostRequest({ text: 'Green text', verdict: 'green' }));

      const response = await GET(makeGetRequest());
      const json = await response.json();

      const redSub = json.data.submissions.find((s: { text: string }) => s.text === 'Red text');
      const greenSub = json.data.submissions.find((s: { text: string }) => s.text === 'Green text');

      expect(redSub.emoji).toBe('🚩');
      expect(greenSub.emoji).toBe('🟢');
    });

    it('inclut un champ timeAgo', async () => {
      const { POST, GET } = await import('@/app/api/flagornot/community/route');
      await POST(makePostRequest({ text: 'Texte', verdict: 'green' }));

      const response = await GET(makeGetRequest());
      const json = await response.json();

      expect(json.data.submissions[0].timeAgo).toBeDefined();
      expect(typeof json.data.submissions[0].timeAgo).toBe('string');
    });

    it('retourne un tableau vide si aucune soumission', async () => {
      const { GET } = await import('@/app/api/flagornot/community/route');
      const response = await GET(makeGetRequest());
      const json = await response.json();

      expect(json.data.submissions).toHaveLength(0);
      expect(json.data.total).toBe(0);
    });
  });
});
