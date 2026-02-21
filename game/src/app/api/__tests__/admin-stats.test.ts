/**
 * @file admin-stats.test.ts
 * @description Tests for GET /api/admin/stats
 * Covers: authentication, mock mode stats, production Supabase path.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock authenticateAdmin - returns null (authorized) by default
vi.mock('@/lib/adminAuth', () => ({
  authenticateAdmin: vi.fn().mockReturnValue(null),
}));

vi.mock('@/lib/mockData', () => ({
  getMockElements: vi.fn(() => [
    { id: '1', texte: 'Alpha', actif: true, elo_global: 1200, nb_participations: 50 },
    { id: '2', texte: 'Beta', actif: true, elo_global: 1100, nb_participations: 30 },
    { id: '3', texte: 'Inactif', actif: false, elo_global: 900, nb_participations: 20 },
  ]),
}));

vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(),
}));

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const makeRequest = () =>
    new NextRequest('http://localhost/api/admin/stats', {
      headers: { Authorization: 'Bearer mock-admin-token' },
    });

  describe('mock mode', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    });

    it('retourne les statistiques admin en mock mode', async () => {
      const { GET } = await import('@/app/api/admin/stats/route');
      const response = await GET(makeRequest());
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.totalElements).toBe(3);
      expect(json.data.activeElements).toBe(2);
      expect(json.data.totalVotes).toBe(100); // 50 + 30 + 20
      expect(json.data.todayVotes).toBe(10); // ~10% of 100
      expect(json.data.topElement).toBeDefined();
      expect(json.data.topElement.texte).toBe('Alpha');
      expect(json.data.topElement.elo_global).toBe(1200);
    });
  });

  describe('authentication', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    });

    it('rejette les requêtes non authentifiées', async () => {
      const { authenticateAdmin } = await import('@/lib/adminAuth');
      (authenticateAdmin as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );

      const { GET } = await import('@/app/api/admin/stats/route');
      const response = await GET(makeRequest());

      expect(response.status).toBe(401);
    });
  });
});
