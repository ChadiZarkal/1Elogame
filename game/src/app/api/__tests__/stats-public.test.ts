/**
 * @file stats-public.test.ts
 * @description Tests for GET /api/stats/public
 * Covers: mock mode aggregation, production Supabase path, error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/mockData', () => ({
  getMockElements: vi.fn().mockReturnValue([
    { id: '1', texte: 'Test1', actif: true, nb_participations: 30, elo_global: 1050 },
    { id: '2', texte: 'Test2', actif: true, nb_participations: 20, elo_global: 950 },
    { id: '3', texte: 'Inactif', actif: false, nb_participations: 10, elo_global: 1000 },
  ]),
}));

const mockSupabaseFrom = vi.fn();
vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}));

describe('GET /api/stats/public', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe('mock mode', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    });

    it('retourne les statistiques agrégées en mode mock', async () => {
      const { GET } = await import('@/app/api/stats/public/route');
      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(true);
      // Only 2 active elements: 30 + 20 = 50 votes
      expect(json.data.totalVotes).toBe(50);
      expect(json.data.totalElements).toBe(2);
      // estimatedPlayers = max(12, floor(50/15)) = max(12, 3) = 12
      expect(json.data.estimatedPlayers).toBe(12);
    });

    it('exclut les éléments inactifs du comptage', async () => {
      const { GET } = await import('@/app/api/stats/public/route');
      const response = await GET();
      const json = await response.json();

      // 3 elements but only 2 active
      expect(json.data.totalElements).toBe(2);
    });
  });

  describe('production mode', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'false';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    });

    it('retourne les stats depuis Supabase', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { nb_participations: 100 },
              { nb_participations: 200 },
            ],
            error: null,
          }),
        }),
      });

      const { GET } = await import('@/app/api/stats/public/route');
      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.totalVotes).toBe(300);
      expect(json.data.totalElements).toBe(2);
      expect(json.data.estimatedPlayers).toBe(Math.max(1, Math.floor(300 / 15)));
    });

    it('gère les erreurs Supabase gracieusement', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('DB error'),
          }),
        }),
      });

      const { GET } = await import('@/app/api/stats/public/route');
      const response = await GET(new NextRequest('http://localhost/api/stats/public'));
      const json = await response.json();

      expect(response.status).toBe(500);
    });

    it('gère une liste vide', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const { GET } = await import('@/app/api/stats/public/route');
      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.totalVotes).toBe(0);
      expect(json.data.totalElements).toBe(0);
    });
  });
});
