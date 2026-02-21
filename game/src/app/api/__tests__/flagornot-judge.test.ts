/**
 * @file flagornot-judge.test.ts
 * @description Tests for POST /api/flagornot/judge
 * Covers: AI cascade (Gemini → OpenAI → local), input validation,
 * sanitization, rate limiting, provider fallback.
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

vi.mock('@/lib/gemini', () => ({
  judgeWithGemini: vi.fn(),
}));

vi.mock('@/lib/sanitize', () => ({
  sanitizeText: vi.fn().mockImplementation((text: string, maxLen: number) =>
    text.slice(0, maxLen).trim()
  ),
}));

vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  })),
}));

// Mock global fetch for OpenAI fallback
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('POST /api/flagornot/judge', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    delete process.env.OPENAI_API_KEY;
  });

  const makeRequest = (body: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/flagornot/judge', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

  it('retourne un verdict Gemini quand disponible', async () => {
    const { judgeWithGemini } = await import('@/lib/gemini');
    (judgeWithGemini as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      verdict: 'red',
      justification: 'C\'est toxique!',
    });

    const { POST } = await import('@/app/api/flagornot/judge/route');
    const response = await POST(makeRequest({ text: 'Ghoster quelqu\'un' }));
    const json = await response.json();

    expect(json.verdict).toBe('red');
    expect(json.justification).toBe('C\'est toxique!');
    expect(json.provider).toBe('gemini');
  });

  it('fallback vers le mode local si Gemini échoue et OpenAI non configuré', async () => {
    const { judgeWithGemini } = await import('@/lib/gemini');
    (judgeWithGemini as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Gemini down'));

    const { POST } = await import('@/app/api/flagornot/judge/route');
    const response = await POST(makeRequest({ text: 'Quelque chose' }));
    const json = await response.json();

    expect(json.provider).toBe('local');
    expect(['red', 'green']).toContain(json.verdict);
    expect(json.justification).toBeDefined();
  });

  it('fallback vers OpenAI si Gemini échoue et OpenAI configuré', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    
    const { judgeWithGemini } = await import('@/lib/gemini');
    (judgeWithGemini as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Gemini error'));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: '{"verdict":"green","justification":"C\'est cool!"}',
          },
        }],
      }),
    });

    const { POST } = await import('@/app/api/flagornot/judge/route');
    const response = await POST(makeRequest({ text: 'Être attentif' }));
    const json = await response.json();

    expect(json.provider).toBe('openai');
    expect(json.verdict).toBe('green');
  });

  it('tombe en fallback local si Gemini + OpenAI échouent', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    
    const { judgeWithGemini } = await import('@/lib/gemini');
    (judgeWithGemini as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Gemini error'));
    mockFetch.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('error') });

    const { POST } = await import('@/app/api/flagornot/judge/route');
    const response = await POST(makeRequest({ text: 'Test' }));
    const json = await response.json();

    expect(json.provider).toBe('local');
  });

  describe('validation', () => {
    it('rejette un body sans texte', async () => {
      const { POST } = await import('@/app/api/flagornot/judge/route');
      const response = await POST(makeRequest({}));

      expect(response.status).toBe(400);
    });

    it('rejette un texte vide', async () => {
      const { POST } = await import('@/app/api/flagornot/judge/route');
      const response = await POST(makeRequest({ text: '' }));

      expect(response.status).toBe(400);
    });

    it('rejette un texte trop long (> 500 caractères)', async () => {
      const { POST } = await import('@/app/api/flagornot/judge/route');
      const response = await POST(makeRequest({ text: 'a'.repeat(501) }));

      expect(response.status).toBe(400);
    });

    it('rejette un texte qui devient vide après sanitization', async () => {
      const { sanitizeText } = await import('@/lib/sanitize');
      (sanitizeText as ReturnType<typeof vi.fn>).mockReturnValueOnce('');

      const { POST } = await import('@/app/api/flagornot/judge/route');
      const response = await POST(makeRequest({ text: '<script>alert(1)</script>' }));

      expect(response.status).toBe(400);
    });
  });

  describe('local keyword analysis', () => {
    it('détecte les red flags par mots-clés', async () => {
      const { judgeWithGemini } = await import('@/lib/gemini');
      (judgeWithGemini as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('disabled'));

      const { POST } = await import('@/app/api/flagornot/judge/route');
      const response = await POST(makeRequest({ text: 'trompe et manipule toxique' }));
      const json = await response.json();

      expect(json.provider).toBe('local');
      expect(json.verdict).toBe('red');
    });

    it('détecte les green flags par mots-clés', async () => {
      const { judgeWithGemini } = await import('@/lib/gemini');
      (judgeWithGemini as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('disabled'));

      const { POST } = await import('@/app/api/flagornot/judge/route');
      const response = await POST(makeRequest({ text: 'écoute et cuisine surprise cadeau' }));
      const json = await response.json();

      expect(json.provider).toBe('local');
      expect(json.verdict).toBe('green');
    });
  });

  describe('rate limiting', () => {
    it('retourne 429 quand rate limited', async () => {
      const { checkRateLimit } = await import('@/lib/rateLimit');
      const { NextResponse } = await import('next/server');
      (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        NextResponse.json({ error: 'Rate limited' }, { status: 429 })
      );

      const { POST } = await import('@/app/api/flagornot/judge/route');
      const response = await POST(makeRequest({ text: 'test' }));

      expect(response.status).toBe(429);
    });
  });
});
