/**
 * @file duel-anglais.test.ts
 * @description GET /api/duel?lang=en : les deux comportements arrivent en
 * anglais, avec les identifiants de la base (les votes sont communs aux deux
 * langues). Sans `lang`, le français est renvoyé tel quel.
 *
 * Mode maquette, vraie maquette locale (`lib/mockData`) : c'est elle que l'on
 * joue en local avec `NEXT_PUBLIC_MOCK_MODE=true`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getMockElements } from '@/lib/mockData';
import { traduireElement } from '@/lib/jeu/traduction';

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

vi.mock('@/lib/supabase', () => ({ createServerClient: vi.fn() }));

const requete = (params: Record<string, string>) => {
  const url = new URL('http://localhost/api/duel');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
};

describe('GET /api/duel — langue', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
  });

  it('renvoie les comportements en anglais avec ?lang=en', async () => {
    const { GET } = await import('@/app/api/duel/route');
    const parId = new Map(getMockElements().map((e) => [e.id, e.texte]));

    for (let i = 0; i < 10; i++) {
      const json = await (await GET(requete({ lang: 'en', category: 'quotidien' }))).json();
      expect(json.success).toBe(true);
      for (const e of [json.data.elementA, json.data.elementB]) {
        const fr = parId.get(e.id)!;
        expect(fr).toBeDefined();
        expect(e.texte).toBe(traduireElement(fr, 'en'));
        expect(e.texte).not.toBe(fr);
      }
    }
  });

  it('renvoie le français tel quel sans paramètre de langue', async () => {
    const { GET } = await import('@/app/api/duel/route');
    const parId = new Map(getMockElements().map((e) => [e.id, e.texte]));
    const json = await (await GET(requete({ category: 'quotidien' }))).json();
    expect(json.data.elementA.texte).toBe(parId.get(json.data.elementA.id));
    expect(json.data.elementB.texte).toBe(parId.get(json.data.elementB.id));
  });
});
