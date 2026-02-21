/**
 * @file admin-algorithm.test.ts
 * @description Tests for GET/POST /api/admin/algorithm
 * Covers: authentication, get config, update config, reset config, validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/adminAuth', () => ({
  authenticateAdmin: vi.fn().mockReturnValue(null),
}));

vi.mock('@/lib/algorithmConfig', () => {
  const DEFAULT_ALGORITHM_CONFIG = {
    strategies: {
      elo_close: { enabled: true, weight: 40 },
      cross_category: { enabled: true, weight: 20 },
      starred: { enabled: true, weight: 15 },
      random: { enabled: true, weight: 25 },
    },
    elo: { kFactorBase: 32, kFactorMin: 16 },
    antiRepeat: { recentWindow: 10, maxAppearances: 3 },
  };

  let currentConfig = { ...DEFAULT_ALGORITHM_CONFIG };

  return {
    DEFAULT_ALGORITHM_CONFIG,
    getAlgorithmConfig: vi.fn(() => ({ ...currentConfig })),
    setAlgorithmConfig: vi.fn((config: typeof DEFAULT_ALGORITHM_CONFIG) => {
      currentConfig = { ...config };
      return { success: true };
    }),
    resetAlgorithmConfig: vi.fn(() => {
      currentConfig = { ...DEFAULT_ALGORITHM_CONFIG };
    }),
  };
});

describe('/api/admin/algorithm', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    delete (globalThis as Record<string, unknown>).__algorithmConfig;
  });

  const makeGetRequest = () =>
    new NextRequest('http://localhost/api/admin/algorithm', {
      headers: { Authorization: 'Bearer mock-admin-token' },
    });

  const makePostRequest = (body: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/admin/algorithm', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-admin-token',
      },
    });

  describe('GET', () => {
    it('retourne la configuration actuelle', async () => {
      const { GET } = await import('@/app/api/admin/algorithm/route');
      const response = await GET(makeGetRequest());
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.config).toBeDefined();
      expect(json.data.config.strategies).toBeDefined();
      expect(json.data.defaults).toBeDefined();
    });

    it('rejette sans authentification', async () => {
      const { authenticateAdmin } = await import('@/lib/adminAuth');
      (authenticateAdmin as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );

      const { GET } = await import('@/app/api/admin/algorithm/route');
      const response = await GET(makeGetRequest());

      expect(response.status).toBe(401);
    });
  });

  describe('POST - update', () => {
    const validConfig = {
      strategies: {
        elo_close: { enabled: true, weight: 50 },
        cross_category: { enabled: true, weight: 20 },
        starred: { enabled: true, weight: 10 },
        random: { enabled: true, weight: 20 },
      },
      elo: { kFactorBase: 32, kFactorMin: 16 },
      antiRepeat: { recentWindow: 10, maxAppearances: 3 },
    };

    it('met à jour la configuration', async () => {
      const { POST } = await import('@/app/api/admin/algorithm/route');
      const response = await POST(makePostRequest({
        action: 'update',
        config: validConfig,
      }));
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.message).toContain('succès');
    });

    it('rejette une configuration invalide (stratégie manquante)', async () => {
      const { POST } = await import('@/app/api/admin/algorithm/route');
      const response = await POST(makePostRequest({
        action: 'update',
        config: { strategies: {} },
      }));

      expect(response.status).toBe(400);
    });

    it('rejette un weight hors limites', async () => {
      const { POST } = await import('@/app/api/admin/algorithm/route');
      const badConfig = {
        ...validConfig,
        strategies: {
          ...validConfig.strategies,
          elo_close: { enabled: true, weight: 999 },
        },
      };
      const response = await POST(makePostRequest({
        action: 'update',
        config: badConfig,
      }));

      expect(response.status).toBe(400);
    });

    it('rejette sans config ELO', async () => {
      const { POST } = await import('@/app/api/admin/algorithm/route');
      const response = await POST(makePostRequest({
        action: 'update',
        config: {
          strategies: validConfig.strategies,
          antiRepeat: validConfig.antiRepeat,
        },
      }));

      expect(response.status).toBe(400);
    });
  });

  describe('POST - reset', () => {
    it('réinitialise la configuration', async () => {
      const { POST } = await import('@/app/api/admin/algorithm/route');
      const response = await POST(makePostRequest({ action: 'reset' }));
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.isDefault).toBe(true);
    });
  });

  describe('POST - invalid action', () => {
    it('rejette une action invalide', async () => {
      const { POST } = await import('@/app/api/admin/algorithm/route');
      const response = await POST(makePostRequest({ action: 'explode' }));

      expect(response.status).toBe(400);
    });
  });
});
