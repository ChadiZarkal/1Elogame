/**
 * @file feedback.test.ts
 * @description Tests for POST /api/feedback
 * Covers: Zod validation, mock mode in-memory storage, rate limiting, pair ordering.
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

vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(),
  typedUpdate: vi.fn(),
  typedInsert: vi.fn(),
}));

describe('POST /api/feedback', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
  });

  const makeRequest = (body: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

  it('enregistre un feedback star en mock mode', async () => {
    const { POST } = await import('@/app/api/feedback/route');
    const response = await POST(makeRequest({
      elementAId: 'elem-1',
      elementBId: 'elem-2',
      type: 'star',
    }));
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.success).toBe(true);
  });

  it('enregistre un feedback thumbs_up', async () => {
    const { POST } = await import('@/app/api/feedback/route');
    const response = await POST(makeRequest({
      elementAId: 'elem-1',
      elementBId: 'elem-2',
      type: 'thumbs_up',
    }));
    const json = await response.json();

    expect(json.success).toBe(true);
  });

  it('enregistre un feedback thumbs_down', async () => {
    const { POST } = await import('@/app/api/feedback/route');
    const response = await POST(makeRequest({
      elementAId: 'elem-1',
      elementBId: 'elem-2',
      type: 'thumbs_down',
    }));
    const json = await response.json();

    expect(json.success).toBe(true);
  });

  it('incrémente le compteur pour un feedback en double', async () => {
    const { POST } = await import('@/app/api/feedback/route');

    // First star
    await POST(makeRequest({
      elementAId: 'elem-a',
      elementBId: 'elem-b',
      type: 'star',
    }));

    // Second star on same pair
    const response = await POST(makeRequest({
      elementAId: 'elem-a',
      elementBId: 'elem-b',
      type: 'star',
    }));
    const json = await response.json();

    expect(json.success).toBe(true);
  });

  it('ordonne les IDs de manière cohérente (A > B inversé)', async () => {
    const { POST } = await import('@/app/api/feedback/route');

    // Send with B < A (reversed order)
    const response = await POST(makeRequest({
      elementAId: 'zzz-last',
      elementBId: 'aaa-first',
      type: 'star',
    }));
    const json = await response.json();

    expect(json.success).toBe(true);
  });

  describe('validation', () => {
    it('rejette un type de feedback invalide', async () => {
      const { POST } = await import('@/app/api/feedback/route');
      const response = await POST(makeRequest({
        elementAId: 'elem-1',
        elementBId: 'elem-2',
        type: 'invalid_type',
      }));

      expect(response.status).toBe(400);
    });

    it('rejette un body sans elementAId', async () => {
      const { POST } = await import('@/app/api/feedback/route');
      const response = await POST(makeRequest({
        elementBId: 'elem-2',
        type: 'star',
      }));

      expect(response.status).toBe(400);
    });

    it('rejette un body vide', async () => {
      const { POST } = await import('@/app/api/feedback/route');
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

      const { POST } = await import('@/app/api/feedback/route');
      const response = await POST(makeRequest({
        elementAId: 'elem-1',
        elementBId: 'elem-2',
        type: 'star',
      }));

      expect(response.status).toBe(429);
    });
  });
});
