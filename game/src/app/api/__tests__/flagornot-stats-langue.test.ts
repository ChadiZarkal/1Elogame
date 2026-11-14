/**
 * @file flagornot-stats-langue.test.ts
 * @description GET /api/flagornot/stats — les constats en anglais avec
 * `?lang=en`, inchangés sans.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { getGenderStats } = vi.hoisted(() => ({ getGenderStats: vi.fn() }));
vi.mock('@/lib/repositories/community', () => ({ getGenderStats }));

const STATS = {
  total: 30,
  byGender: [
    { gender: 'homme', total: 20, red: 12, green: 8, redPercent: 60 },
    { gender: 'femme', total: 10, red: 3, green: 7, redPercent: 30 },
  ],
  insights: ['🚩 Les hommes reçoivent 30% plus de Red Flags que les femmes'],
};

async function lire(url: string) {
  const { GET } = await import('@/app/api/flagornot/stats/route');
  const response = await GET(new NextRequest(url));
  return (await response.json()).data;
}

describe('GET /api/flagornot/stats — langue', () => {
  beforeEach(() => {
    vi.resetModules();
    getGenderStats.mockReset().mockResolvedValue(STATS);
  });

  it('sans paramètre : la réponse française, telle quelle', async () => {
    expect(await lire('http://localhost/api/flagornot/stats')).toEqual(STATS);
  });

  it('avec `?lang=en` : mêmes chiffres, constats en anglais', async () => {
    const data = await lire('http://localhost/api/flagornot/stats?lang=en');
    expect(data.byGender).toEqual(STATS.byGender);
    expect(data.insights).toEqual([
      '🚩 Men get 30% more Red Flags than women',
      '♂️ Men use the Oracle 2x more than women',
      '🟢 Women get 70% Green Flags vs 40% for men',
    ]);
  });

  it('avec `?lang=en` et trop peu de données : le constat d’attente en anglais', async () => {
    getGenderStats.mockResolvedValueOnce({ total: 2, byGender: [{ gender: 'homme', total: 2, red: 1, green: 1, redPercent: 50 }], insights: ['📊 Pas assez'] });
    const data = await lire('http://localhost/api/flagornot/stats?lang=en');
    expect(data.insights).toEqual(['📊 Not enough data for insights yet (we need at least 3 answers per gender)']);
  });
});
