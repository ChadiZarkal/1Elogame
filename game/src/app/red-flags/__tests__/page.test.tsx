/**
 * @file page.test.tsx
 * @description `/red-flags` — le baromètre, rendu côté serveur.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { construireBarometre, type ElementBarometre } from '@/lib/barometre';

const getBarometre = vi.hoisted(() => vi.fn());
vi.mock('@/lib/barometre', async (original) => ({
  ...(await original<typeof import('@/lib/barometre')>()),
  getBarometre,
}));

import RedFlagsPage from '@/app/red-flags/page';

function elements(): ElementBarometre[] {
  const base = ['Avoir mauvaise haleine', 'Couper la parole', 'Être radin', 'Chanter sous la douche'];
  const liste = base.map((texte, i) => ({
    texte, tags: [], elo_global: 1400 - i * 100, elo_homme: 1400 - i * 100, elo_femme: 1400 - i * 100, nb_participations: 120,
  }));
  // Huit comportements du même thème, pour ouvrir une section.
  for (let i = 0; i < 8; i++) {
    liste.push({ texte: `Argent ${i}`, tags: ['argent'], elo_global: 1150 - i, elo_homme: 1150 - i, elo_femme: 1150 - i, nb_participations: 80 });
  }
  return liste;
}

describe('Les pires red flags', () => {
  beforeEach(() => {
    getBarometre.mockReset();
    getBarometre.mockResolvedValue(construireBarometre(elements(), 13000));
  });

  it('porte « red flags » dans son titre principal', async () => {
    render(await RedFlagsPage());
    expect(screen.getByRole('heading', { level: 1, name: /pires red flags/i })).toBeDefined();
  });

  it('écrit ce que les chiffres montrent, en toutes lettres', async () => {
    render(await RedFlagsPage());
    expect(screen.getByText(/« Avoir mauvaise haleine » arrive en tête/)).toBeDefined();
    expect(screen.getByText(/13\s?000 duels tranchés/)).toBeDefined();
  });

  it('ouvre une section par thème assez fourni', async () => {
    render(await RedFlagsPage());
    expect(screen.getByRole('heading', { level: 3, name: /Argent/ })).toBeDefined();
  });

  it('balise le top comme une liste ordonnée', async () => {
    const { container } = render(await RedFlagsPage());
    const blocs = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => JSON.parse(s.textContent ?? '{}'));
    const liste = blocs.flatMap((b) => b['@graph'] ?? [b]).find((x) => x['@type'] === 'ItemList');
    expect(liste.itemListElement[0]).toMatchObject({ position: 1, name: 'Avoir mauvaise haleine' });
  });

  it('dit que la base ne répond pas plutôt que d’afficher des listes vides', async () => {
    getBarometre.mockRejectedValue(new Error('base injoignable'));
    render(await RedFlagsPage());
    expect(screen.getByRole('heading', { level: 2, name: /momentanément indisponible/ })).toBeDefined();
    expect(screen.queryByText(/arrive en tête/)).toBeNull();
  });
});
