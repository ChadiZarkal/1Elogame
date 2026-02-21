/**
 * @file admin-login.test.ts
 * @description Tests for POST /api/admin/login
 * Covers: mock mode auth, production bcrypt auth, rate limiting, validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock rate limit to allow all requests by default
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

// Mock adminAuth
vi.mock('@/lib/adminAuth', () => ({
  generateAdminToken: vi.fn().mockReturnValue({
    token: 'test-token-123',
    expiresIn: 14400,
  }),
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const makeRequest = (body: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

  describe('mock mode', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    });

    it('accepte "admin" comme mot de passe en mock mode', async () => {
      const { POST } = await import('@/app/api/admin/login/route');
      const response = await POST(makeRequest({ password: 'admin' }));
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.token).toBe('test-token-123');
      expect(json.data.expiresIn).toBe(14400);
    });

    it('rejette un mauvais mot de passe en mock mode', async () => {
      const { POST } = await import('@/app/api/admin/login/route');
      const response = await POST(makeRequest({ password: 'wrong' }));
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
    });
  });

  describe('production mode', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'false';
    });

    it('authentifie avec bcrypt en production', async () => {
      process.env.ADMIN_PASSWORD_HASH = '$2a$10$hashvalue';
      const bcrypt = await import('bcryptjs');
      (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const { POST } = await import('@/app/api/admin/login/route');
      const response = await POST(makeRequest({ password: 'correct-password' }));
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.token).toBeDefined();
    });

    it('rejette un mot de passe incorrect en production', async () => {
      process.env.ADMIN_PASSWORD_HASH = '$2a$10$hashvalue';
      const bcrypt = await import('bcryptjs');
      (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { POST } = await import('@/app/api/admin/login/route');
      const response = await POST(makeRequest({ password: 'wrong' }));

      expect(response.status).toBe(401);
    });

    it('retourne 500 si ADMIN_PASSWORD_HASH non configuré', async () => {
      delete process.env.ADMIN_PASSWORD_HASH;

      const { POST } = await import('@/app/api/admin/login/route');
      const response = await POST(makeRequest({ password: 'test' }));

      expect(response.status).toBe(500);
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    });

    it('rejette un body sans mot de passe', async () => {
      const { POST } = await import('@/app/api/admin/login/route');
      const response = await POST(makeRequest({}));

      expect(response.status).toBe(400);
    });

    it('rejette un body vide', async () => {
      const { POST } = await import('@/app/api/admin/login/route');
      const req = new NextRequest('http://localhost/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
    });
  });

  describe('rate limiting', () => {
    it('retourne 429 quand rate limited', async () => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
      const { checkRateLimit } = await import('@/lib/rateLimit');
      const { NextResponse } = await import('next/server');
      (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        NextResponse.json({ error: 'Rate limited' }, { status: 429 })
      );

      const { POST } = await import('@/app/api/admin/login/route');
      const response = await POST(makeRequest({ password: 'admin' }));

      expect(response.status).toBe(429);
    });
  });
});
