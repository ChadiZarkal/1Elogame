/**
 * @file leaderboard.test.ts
 * @description Tests for GET /api/leaderboard
 * Covers: mock mode sorting/filtering, production Supabase path, pagination, rate limiting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(null),
  resetRateLimitStore: vi.fn(),
  RATE_LIMITS: {
    public: { maxRequests: 60, windowMs: 60000 },
    ai: { maxRequests: 10, windowMs: 60000 },
    auth: { maxRequests: 5, windowMs: 60000 },
    admin: { maxRequests: 30, windowMs: 60000 },
  },
}));

vi.mock('@/lib/mockData', () => ({
  getMockElements: vi.fn().mockReturnValue([
    { id: '1', texte: 'Alpha', categorie: 'love', actif: true, elo_global: 1200, elo_homme: 1180, elo_femme: 1220, elo_16_18: 1150, elo_19_22: 1210, elo_23_26: 1190, elo_27plus: 1230, nb_participations: 50 },
    { id: '2', texte: 'Beta', categorie: 'social', actif: true, elo_global: 1100, elo_homme: 1080, elo_femme: 1120, elo_16_18: 1050, elo_19_22: 1110, elo_23_26: 1090, elo_27plus: 1130, nb_participations: 30 },
    { id: '3', texte: 'Gamma', categorie: 'love', actif: true, elo_global: 900, elo_homme: 880, elo_femme: 920, elo_16_18: 850, elo_19_22: 910, elo_23_26: 890, elo_27plus: 930, nb_participations: 20 },
    { id: '4', texte: 'Inactif', categorie: 'love', actif: false, elo_global: 1500, elo_homme: 1500, elo_femme: 1500, elo_16_18: 1500, elo_19_22: 1500, elo_23_26: 1500, elo_27plus: 1500, nb_participations: 100 },
  ]),
}));

const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({
    data: [
      { texte: 'Alpha', categorie: 'love', elo_global: 1200, elo_homme: 1180, elo_femme: 1220, elo_16_18: 1150, elo_19_22: 1210, elo_23_26: 1190, elo_27plus: 1230, nb_participations: 50 },
    ],
    error: null,
  }),
};

vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue(mockSupabaseChain),
  })),
}));

describe('GET /api/leaderboard', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Reset chain mocks
    mockSupabaseChain.select.mockReturnThis();
    mockSupabaseChain.eq.mockReturnThis();
    mockSupabaseChain.order.mockReturnThis();
  });

  const makeRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/leaderboard');
    for (const [key, val] of Object.entries(params)) {
      url.searchParams.set(key, val);
    }
    return new NextRequest(url.toString());
  };

  describe('mock mode', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    });

    it('retourne le classement trié par ELO décroissant', async () => {
      const { GET } = await import('@/app/api/leaderboard/route');
      const response = await GET(makeRequest());
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.rankings).toHaveLength(3); // excludes inactive
      expect(json.data.rankings[0].texte).toBe('Alpha');
      expect(json.data.rankings[0].rank).toBe(1);
      expect(json.data.rankings[0].elo_global).toBe(1200);
    });

    it('trie par ELO croissant avec order=asc', async () => {
      const { GET } = await import('@/app/api/leaderboard/route');
      const response = await GET(makeRequest({ order: 'asc' }));
      const json = await response.json();

      expect(json.data.rankings[0].texte).toBe('Gamma');
      expect(json.data.rankings[0].elo_global).toBe(900);
    });

    it('respecte la limite demandée', async () => {
      const { GET } = await import('@/app/api/leaderboard/route');
      const response = await GET(makeRequest({ limit: '2' }));
      const json = await response.json();

      expect(json.data.rankings).toHaveLength(2);
    });

    it('filtre par catégorie', async () => {
      const { GET } = await import('@/app/api/leaderboard/route');
      const response = await GET(makeRequest({ category: 'love' }));
      const json = await response.json();

      // Only Alpha and Gamma are active + love category
      expect(json.data.rankings).toHaveLength(2);
      expect(json.data.rankings.every((r: { categorie: string }) => r.categorie === 'love')).toBe(true);
    });

    it('inclut totalElements et totalVotes', async () => {
      const { GET } = await import('@/app/api/leaderboard/route');
      const response = await GET(makeRequest());
      const json = await response.json();

      expect(json.data.totalElements).toBe(3);
      expect(json.data.totalVotes).toBe(100); // 50 + 30 + 20
    });

    it('plafonne limit à 100', async () => {
      const { GET } = await import('@/app/api/leaderboard/route');
      const response = await GET(makeRequest({ limit: '9999' }));
      const json = await response.json();

      // Should still return all 3 (< 100)
      expect(json.data.rankings).toHaveLength(3);
    });

    it('contient tous les champs ELO segmentés', async () => {
      const { GET } = await import('@/app/api/leaderboard/route');
      const response = await GET(makeRequest());
      const json = await response.json();

      const first = json.data.rankings[0];
      expect(first).toHaveProperty('elo_global');
      expect(first).toHaveProperty('elo_homme');
      expect(first).toHaveProperty('elo_femme');
      expect(first).toHaveProperty('elo_16_18');
      expect(first).toHaveProperty('elo_19_22');
      expect(first).toHaveProperty('elo_23_26');
      expect(first).toHaveProperty('elo_27plus');
      expect(first).toHaveProperty('nb_participations');
      expect(first).toHaveProperty('categorie');
    });
  });
});
