/**
 * @file admin-login.test.ts
 * @description POST /api/admin/login — le mot de passe d'`ADMIN_PASSWORD`,
 * la porte fermée sans lui, la validation et la limite de débit.
 */

import { afterEach, describe, it, expect, vi, beforeEach } from 'vitest';
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

const requete = (body: Record<string, unknown>) =>
  new NextRequest('http://localhost/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

async function connexion(body: Record<string, unknown>) {
  const { POST } = await import('@/app/api/admin/login/route');
  const response = await POST(requete(body));
  return { status: response.status, json: await response.json() };
}

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_MOCK_MODE', 'false');
    vi.stubEnv('ADMIN_TOKEN_SECRET', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('délivre un jeton valide avec le bon mot de passe', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'cheval-agrafe-batterie');
    const { status, json } = await connexion({ password: 'cheval-agrafe-batterie' });

    expect(status).toBe(200);
    const { validateAdminToken } = await import('@/lib/adminAuth');
    expect(validateAdminToken(json.data.token)).toBe(true);
  });

  it('refuse un mauvais mot de passe', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'cheval-agrafe-batterie');
    const { status, json } = await connexion({ password: 'admin' });

    expect(status).toBe(401);
    expect(json.success).toBe(false);
  });

  it('reste fermé, et le dit, sans ADMIN_PASSWORD', async () => {
    vi.stubEnv('ADMIN_PASSWORD', '');
    const { status, json } = await connexion({ password: 'nimporte' });

    expect(status).toBe(503);
    expect(json.error.message).toMatch(/ADMIN_PASSWORD/);
  });

  it('accepte « admin » en développement local, en mode démo', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_MOCK_MODE', 'true');
    vi.stubEnv('ADMIN_PASSWORD', '');
    const { status } = await connexion({ password: 'admin' });

    expect(status).toBe(200);
  });

  it('rejette un corps sans mot de passe', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'secret');
    const { status } = await connexion({});

    expect(status).toBe(400);
  });

  it('retourne 429 quand la limite de débit est atteinte', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'secret');
    const { checkRateLimit } = await import('@/lib/rateLimit');
    const { NextResponse } = await import('next/server');
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      NextResponse.json({ error: 'Rate limited' }, { status: 429 }),
    );

    const { status } = await connexion({ password: 'secret' });
    expect(status).toBe(429);
  });
});
