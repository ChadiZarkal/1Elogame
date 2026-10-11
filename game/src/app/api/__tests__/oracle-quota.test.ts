/**
 * @file oracle-quota.test.ts
 * @description Les protections de l'Oracle contre le spam : limite par
 * adresse, plafond quotidien d'appels à l'IA, et la décision rendue par la
 * base quand elle répond.
 */

import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(null),
  resetRateLimitStore: vi.fn(),
}));

const { judgeWithGemini, rpc } = vi.hoisted(() => ({
  judgeWithGemini: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock('@/lib/gemini', () => ({ judgeWithGemini }));
vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(() => ({
    rpc,
    from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }),
  })),
}));

const requete = (ip = '203.0.113.7') =>
  new NextRequest('http://localhost/api/flagornot/judge', {
    method: 'POST',
    body: JSON.stringify({ text: 'Il répond en trois jours', private: true }),
    headers: { 'Content-Type': 'application/json', 'x-real-ip': ip },
  });

async function juger(ip?: string) {
  const { POST } = await import('@/app/api/flagornot/judge/route');
  const response = await POST(requete(ip));
  return { status: response.status, json: await response.json() };
}

describe('Oracle — quotas en mémoire (mode démo, ou base injoignable)', () => {
  beforeEach(() => {
    vi.resetModules();
    judgeWithGemini.mockReset().mockResolvedValue({ verdict: 'red', justification: 'Non.' });
    vi.stubEnv('NEXT_PUBLIC_MOCK_MODE', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('refuse la sixième demande d’une même adresse dans la minute', async () => {
    for (let i = 0; i < 5; i++) expect((await juger()).status).toBe(200);
    const refus = await juger();
    expect(refus.status).toBe(429);
    expect(refus.json.error.message).toMatch(/souffler/);
    expect(judgeWithGemini).toHaveBeenCalledTimes(5);
  });

  it('ne pénalise pas une autre adresse', async () => {
    for (let i = 0; i < 5; i++) await juger('198.51.100.1');
    expect((await juger('198.51.100.2')).status).toBe(200);
  });

  // Le plafond global borne la facture : passé, plus aucun appel payant, mais
  // l'Oracle répond toujours.
  it('passe au juge local, sans appeler l’IA, une fois le plafond du jour atteint', async () => {
    vi.stubEnv('ORACLE_PLAFOND_IA_JOUR', '2');
    await juger('192.0.2.1');
    await juger('192.0.2.2');
    const troisieme = await juger('192.0.2.3');

    expect(troisieme.status).toBe(200);
    expect(troisieme.json.provider).toBe('local');
    expect(['red', 'green']).toContain(troisieme.json.verdict);
    expect(judgeWithGemini).toHaveBeenCalledTimes(2);
  });

  it('se règle par variables d’environnement', async () => {
    vi.stubEnv('ORACLE_LIMITE_PAR_MINUTE', '1');
    expect((await juger()).status).toBe(200);
    expect((await juger()).status).toBe(429);
  });
});

describe('Oracle — décision rendue par la base', () => {
  beforeEach(() => {
    vi.resetModules();
    judgeWithGemini.mockReset().mockResolvedValue({ verdict: 'green', justification: 'Oui.' });
    rpc.mockReset();
    vi.stubEnv('NEXT_PUBLIC_MOCK_MODE', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('suit la base : refus, juge local, ou IA', async () => {
    rpc.mockResolvedValueOnce({ data: 'refuse', error: null });
    expect((await juger()).status).toBe(429);

    rpc.mockResolvedValueOnce({ data: 'local', error: null });
    expect((await juger()).json.provider).toBe('local');

    rpc.mockResolvedValueOnce({ data: 'ia', error: null });
    expect((await juger()).json.provider).toBe('gemini');

    expect(judgeWithGemini).toHaveBeenCalledTimes(1);
  });

  it('n’envoie à la base qu’une empreinte de l’adresse, jamais l’IP', async () => {
    rpc.mockResolvedValueOnce({ data: 'ia', error: null });
    await juger('203.0.113.99');
    const [nom, params] = rpc.mock.calls[0];
    expect(nom).toBe('oracle_consommer');
    expect(params.p_empreinte).toMatch(/^[0-9a-f]{32}$/);
    expect(JSON.stringify(params)).not.toContain('203.0.113.99');
  });

  it('retombe sur la mémoire quand la base échoue, sans s’ouvrir', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'function does not exist' } });
    const erreurs = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 5; i++) expect((await juger()).status).toBe(200);
    expect((await juger()).status).toBe(429);
    expect(erreurs).toHaveBeenCalled();
    erreurs.mockRestore();
  });
});
