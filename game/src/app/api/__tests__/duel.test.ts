/**
 * @file duel.test.ts
 * @description Tests for GET /api/duel
 * Covers: mock mode pair selection, seen duels, category filter, anti-repeat,
 * param validation, insufficient elements, exhausted duels.
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

const mockElements = [
  { id: '1', texte: 'Elem A', categorie: 'love', actif: true, elo_global: 1000, elo_homme: 1000, elo_femme: 1000, elo_16_18: 1000, elo_19_22: 1000, elo_23_26: 1000, elo_27plus: 1000, nb_participations: 10, niveau_provocation: 2, created_at: '', updated_at: '' },
  { id: '2', texte: 'Elem B', categorie: 'social', actif: true, elo_global: 1050, elo_homme: 1050, elo_femme: 1050, elo_16_18: 1050, elo_19_22: 1050, elo_23_26: 1050, elo_27plus: 1050, nb_participations: 20, niveau_provocation: 3, created_at: '', updated_at: '' },
  { id: '3', texte: 'Elem C', categorie: 'love', actif: true, elo_global: 950, elo_homme: 950, elo_femme: 950, elo_16_18: 950, elo_19_22: 950, elo_23_26: 950, elo_27plus: 950, nb_participations: 5, niveau_provocation: 1, created_at: '', updated_at: '' },
];

vi.mock('@/lib/mockData', () => ({
  getMockElements: vi.fn().mockReturnValue(mockElements),
}));

vi.mock('@/lib/algorithm', () => ({
  selectDuelPair: vi.fn().mockImplementation((elements: typeof mockElements) => {
    if (elements.length < 2) return null;
    return [elements[0], elements[1]];
  }),
  toElementDTO: vi.fn().mockImplementation((el: typeof mockElements[0]) => ({
    id: el.id,
    texte: el.texte,
    categorie: el.categorie,
    elo_global: el.elo_global,
  })),
}));

vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(),
}));

describe('GET /api/duel', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
  });

  const makeRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/duel');
    for (const [key, val] of Object.entries(params)) {
      url.searchParams.set(key, val);
    }
    return new NextRequest(url.toString());
  };

  it('retourne une paire de duel en mock mode', async () => {
    const { GET } = await import('@/app/api/duel/route');
    const response = await GET(makeRequest());
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.elementA).toBeDefined();
    expect(json.data.elementB).toBeDefined();
    expect(json.data.allExhausted).toBe(false);
  });

  it('filtre par catégorie', async () => {
    const { GET } = await import('@/app/api/duel/route');
    const { selectDuelPair } = await import('@/lib/algorithm');

    const response = await GET(makeRequest({ category: 'love' }));
    const json = await response.json();

    // selectDuelPair should have been called with filtered elements
    expect(selectDuelPair).toHaveBeenCalled();
    const calledElements = (selectDuelPair as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calledElements.every((e: typeof mockElements[0]) => e.categorie === 'love')).toBe(true);
  });

  it('passe les seenDuels au sélecteur', async () => {
    const { GET } = await import('@/app/api/duel/route');
    const { selectDuelPair } = await import('@/lib/algorithm');

    await GET(makeRequest({ seenDuels: '1-2,2-3' }));

    const calledSeenDuels = (selectDuelPair as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(calledSeenDuels).toBeInstanceOf(Set);
    expect(calledSeenDuels.size).toBe(2);
  });

  it('passe le contexte anti-repeat', async () => {
    const { GET } = await import('@/app/api/duel/route');
    const { selectDuelPair } = await import('@/lib/algorithm');

    await GET(makeRequest({
      recentElements: '1,2',
      appearances: '1:5,2:3',
    }));

    const antiRepeatCtx = (selectDuelPair as ReturnType<typeof vi.fn>).mock.calls[0][2];
    expect(antiRepeatCtx.recentElementIds).toEqual(['1', '2']);
    expect(antiRepeatCtx.elementAppearances).toEqual({ '1': 5, '2': 3 });
  });

  it('rejette les paramètres trop longs', async () => {
    const { GET } = await import('@/app/api/duel/route');
    const longParam = 'a'.repeat(11_000);

    const response = await GET(makeRequest({ seenDuels: longParam }));
    expect(response.status).toBe(400);
  });

  it('retourne allExhausted quand pas de paire disponible', async () => {
    const { selectDuelPair } = await import('@/lib/algorithm');
    (selectDuelPair as ReturnType<typeof vi.fn>).mockReturnValueOnce(null);

    const { GET } = await import('@/app/api/duel/route');
    const response = await GET(makeRequest());
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.allExhausted).toBe(true);
    expect(json.data.elementA).toBeNull();
    expect(json.data.elementB).toBeNull();
  });

  it('retourne 400 si pas assez d\'éléments (< 2)', async () => {
    const { getMockElements } = await import('@/lib/mockData');
    (getMockElements as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      mockElements[0], // only 1 element
    ]);

    // Need to filter to category with 1 element
    const { GET } = await import('@/app/api/duel/route');
    // Since getMockElements returns only 1 element, should 400
    const { selectDuelPair } = await import('@/lib/algorithm');
    (selectDuelPair as ReturnType<typeof vi.fn>).mockImplementationOnce(() => null);

    // Actually the check is elements.length < 2
    (getMockElements as ReturnType<typeof vi.fn>).mockReturnValueOnce([mockElements[0]]);
    // Need to reimport to pick up the new mock
    vi.resetModules();
    const mod = await import('@/app/api/duel/route');
    const { getMockElements: gme } = await import('@/lib/mockData');
    (gme as ReturnType<typeof vi.fn>).mockReturnValueOnce([mockElements[0]]);

    const response = await mod.GET(makeRequest());
    expect(response.status).toBe(400);
  });

  describe('rate limiting', () => {
    it('retourne 429 quand rate limited', async () => {
      const { checkRateLimit } = await import('@/lib/rateLimit');
      const { NextResponse } = await import('next/server');
      (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        NextResponse.json({ error: 'Rate limited' }, { status: 429 })
      );

      const { GET } = await import('@/app/api/duel/route');
      const response = await GET(makeRequest());

      expect(response.status).toBe(429);
    });
  });
});
