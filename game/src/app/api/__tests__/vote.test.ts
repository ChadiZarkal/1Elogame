/**
 * @file vote.test.ts
 * @description Tests for POST /api/vote
 * Covers: Zod validation, mock mode ELO updates, participation counts,
 * segmented ELO (sex/age), streak matching, rate limiting.
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

const mockWinner = {
  id: 'w1', texte: 'Winner', categorie: 'love', actif: true,
  elo_global: 1050, elo_homme: 1040, elo_femme: 1060, elo_autre: 1000,
  elo_16_18: 1030, elo_19_22: 1050, elo_23_26: 1070, elo_27plus: 1020,
  nb_participations: 10,
  nb_part_homme: 5, nb_part_femme: 3, nb_part_autre: 2,
  nb_part_16_18: 2, nb_part_19_22: 4, nb_part_23_26: 3, nb_part_27plus: 1,
  niveau_provocation: 2, created_at: '', updated_at: '',
};

const mockLoser = {
  id: 'l1', texte: 'Loser', categorie: 'social', actif: true,
  elo_global: 950, elo_homme: 940, elo_femme: 960, elo_autre: 1000,
  elo_16_18: 930, elo_19_22: 950, elo_23_26: 970, elo_27plus: 920,
  nb_participations: 8,
  nb_part_homme: 4, nb_part_femme: 2, nb_part_autre: 2,
  nb_part_16_18: 2, nb_part_19_22: 3, nb_part_23_26: 2, nb_part_27plus: 1,
  niveau_provocation: 1, created_at: '', updated_at: '',
};

vi.mock('@/lib/mockData', () => ({
  getMockElement: vi.fn().mockImplementation((id: string) => {
    if (id === 'w1') return { ...mockWinner };
    if (id === 'l1') return { ...mockLoser };
    return undefined;
  }),
  updateMockElo: vi.fn(),
  recordMockVote: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(),
  typedInsert: vi.fn(),
  typedUpdate: vi.fn(),
}));

describe('POST /api/vote', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
  });

  const makeRequest = (body: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/vote', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

  const validBody = {
    winnerId: 'w1',
    loserId: 'l1',
    sexe: 'homme',
    age: '19-22',
  };

  describe('mock mode', () => {
    it('enregistre un vote et retourne les pourcentages', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest(validBody));
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.winner).toBeDefined();
      expect(json.data.loser).toBeDefined();
      expect(json.data.winner.id).toBe('w1');
      expect(json.data.loser.id).toBe('l1');
      expect(json.data.winner.percentage).toBeGreaterThan(50);
      expect(json.data.loser.percentage).toBeLessThan(50);
      expect(json.data.winner.percentage + json.data.loser.percentage).toBe(100);
    });

    it('incrémente les participations', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest(validBody));
      const json = await response.json();

      expect(json.data.winner.participations).toBe(11); // 10 + 1
    });

    it('appelle updateMockElo et recordMockVote', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const { updateMockElo, recordMockVote } = await import('@/lib/mockData');

      await POST(makeRequest(validBody));

      expect(updateMockElo).toHaveBeenCalledWith('w1', 'l1', expect.any(Number), expect.any(Number));
      expect(recordMockVote).toHaveBeenCalledWith('mock-session', 'w1', 'l1');
    });

    it('retourne le résultat de streak', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest(validBody));
      const json = await response.json();

      expect(json.data.streak).toBeDefined();
      expect(json.data.streak).toHaveProperty('matched');
      expect(json.data.streak).toHaveProperty('current');
    });

    it('gère sexe=femme', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest({
        ...validBody,
        sexe: 'femme',
      }));
      const json = await response.json();

      expect(json.success).toBe(true);
    });

    it('gère sexe=autre', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest({
        ...validBody,
        sexe: 'autre',
      }));
      const json = await response.json();

      expect(json.success).toBe(true);
    });

    it('gère différentes tranches d\'âge', async () => {
      const { POST } = await import('@/app/api/vote/route');
      
      for (const age of ['16-18', '19-22', '23-26', '27+']) {
        vi.resetModules();
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_MOCK_MODE = 'true';

        const mod = await import('@/app/api/vote/route');
        const response = await mod.POST(makeRequest({ ...validBody, age }));
        const json = await response.json();

        expect(json.success).toBe(true);
      }
    });

    it('retourne 404 si un élément n\'existe pas', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest({
        winnerId: 'nonexistent',
        loserId: 'l1',
        sexe: 'homme',
        age: '19-22',
      }));

      expect(response.status).toBe(404);
    });
  });

  describe('validation', () => {
    it('rejette un body sans winnerId', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest({
        loserId: 'l1',
        sexe: 'homme',
        age: '19-22',
      }));

      expect(response.status).toBe(400);
    });

    it('rejette un body sans sexe', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest({
        winnerId: 'w1',
        loserId: 'l1',
        age: '19-22',
      }));

      expect(response.status).toBe(400);
    });

    it('rejette un body sans age', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest({
        winnerId: 'w1',
        loserId: 'l1',
        sexe: 'homme',
      }));

      expect(response.status).toBe(400);
    });

    it('rejette un body complètement vide', async () => {
      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest({}));

      expect(response.status).toBe(400);
    });
  });

  describe('rate limiting', () => {
    it('retourne 429 quand rate limited', async () => {
      const { checkRateLimit } = await import('@/lib/rateLimit');
      const { NextResponse } = await import('next/server');
      (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        NextResponse.json({ error: 'Rate limited' }, { status: 429 })
      );

      const { POST } = await import('@/app/api/vote/route');
      const response = await POST(makeRequest(validBody));

      expect(response.status).toBe(429);
    });
  });
});
