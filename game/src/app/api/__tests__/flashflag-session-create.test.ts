import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/repositories', () => ({
  createFlashFlagSession: vi.fn().mockResolvedValue({
    sessionCode: 'ABCD1234',
    playUrl: 'http://localhost/flashflag/session/ABCD1234',
  }),
}));

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(null),
  RATE_LIMITS: {
    public: { maxRequests: 60, windowMs: 60000 },
    ai: { maxRequests: 10, windowMs: 60000 },
    auth: { maxRequests: 5, windowMs: 60000 },
    admin: { maxRequests: 30, windowMs: 60000 },
  },
}));

describe('POST /api/flashflag/session', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('cree une session standard valide', async () => {
    const { POST } = await import('@/app/api/flashflag/session/route');

    const req = new NextRequest('http://localhost/api/flashflag/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'link',
        sourceType: 'standard',
        standardTestId: '550e8400-e29b-41d4-a716-446655440000',
        subjectSex: 'homme',
        subjectAge: 27,
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.sessionCode).toBe('ABCD1234');
  });

  it('rejette un payload incomplet', async () => {
    const { POST } = await import('@/app/api/flashflag/session/route');

    const req = new NextRequest('http://localhost/api/flashflag/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'link', sourceType: 'standard' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
