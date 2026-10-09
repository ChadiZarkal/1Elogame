/**
 * @file redflagtest-submit.test.ts
 * @description POST /api/redflagtest/submit — le mode test traverse la route
 * jusqu'à l'enregistrement, et une partie de test ne laisse rien derrière elle.
 */

import { beforeEach, describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(null),
  resetRateLimitStore: vi.fn(),
}));

const { enregistrerPartie } = vi.hoisted(() => ({
  enregistrerPartie: vi.fn().mockResolvedValue({ score: 0 }),
}));
vi.mock('@/lib/rft/repository', () => ({ enregistrerPartie }));

const requete = (body: Record<string, unknown>) =>
  new NextRequest('http://localhost/api/redflagtest/submit', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const choix = [{ questionId: 'q-1', answerId: 'r-1a' }];

describe('POST /api/redflagtest/submit', () => {
  beforeEach(() => enregistrerPartie.mockClear());

  it('transmet le mode test à l’enregistrement', async () => {
    const { POST } = await import('@/app/api/redflagtest/submit/route');
    await POST(requete({ choix, sexe: 'homme', age: '23-26', test: true }));
    expect(enregistrerPartie).toHaveBeenCalledWith(expect.objectContaining({ test: true }));
  });

  it('compte une partie quand le client ne dit rien', async () => {
    const { POST } = await import('@/app/api/redflagtest/submit/route');
    await POST(requete({ choix, sexe: 'homme', age: '23-26' }));
    expect(enregistrerPartie).toHaveBeenCalledWith(expect.objectContaining({ test: false }));
  });
});

describe('une partie de test, en local', () => {
  it('donne le même résultat, sans lien de partage à relire', async () => {
    const fictif = await import('@/lib/rft/mock');
    const ctx = { questions: fictif.lireQuestions(), tags: fictif.lireTags(), verdicts: fictif.lireVerdicts(), archetypes: fictif.lireArchetypes() };
    const args = { ctx, choix: [], score: 42, profil: { sexe: 'homme', age: '23-26' } };

    const normale = fictif.resultat(args);
    const test = fictif.resultat({ ...args, test: true });

    expect(normale.codePartage).toBeTruthy();
    expect(test.codePartage).toBeNull();
    expect(test.score).toBe(normale.score);
  });
});
