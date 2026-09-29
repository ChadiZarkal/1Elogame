/**
 * @file barometre.test.ts
 * @description Le calcul du baromètre des red flags (`/red-flags`).
 *
 * Chaque phrase de la page est tirée de ces chiffres : s'ils sont faux, la
 * page affirme des choses fausses. Les données sont synthétiques — le calcul
 * est éprouvé, pas le contenu de la base.
 */

import { describe, it, expect } from 'vitest';
import { construireBarometre, DUELS_MINIMUM, type ElementBarometre } from '@/lib/barometre';

function el(texte: string, elo: number, extra: Partial<ElementBarometre> = {}): ElementBarometre {
  return {
    texte,
    tags: [],
    elo_global: elo,
    elo_homme: elo,
    elo_femme: elo,
    nb_participations: 100,
    ...extra,
  };
}

describe('construireBarometre', () => {
  it('écarte les comportements sous le seuil de duels', () => {
    const b = construireBarometre(
      [el('A', 1300), el('B', 1200, { nb_participations: DUELS_MINIMUM - 1 }), el('C', 1100)],
      500,
    );
    expect(b.classes).toBe(2);
    expect(b.pires.map((e) => e.texte)).toEqual(['A', 'C']);
  });

  it('classe du plus grave au moins grave, et en tire la gravité relative', () => {
    const b = construireBarometre([el('Moyen', 1200), el('Pire', 1400), el('Anodin', 900)], 10);
    expect(b.pires.map((e) => [e.rang, e.texte, e.gravite])).toEqual([
      [1, 'Pire', 100],
      [2, 'Moyen', 50],
      [3, 'Anodin', 0],
    ]);
  });

  it('lit le bas du classement en commençant par le moins grave', () => {
    const elements = Array.from({ length: 15 }, (_, i) => el(`E${i}`, 1500 - i * 10));
    const b = construireBarometre(elements, 10, { moinsGraves: 3 });
    expect(b.moinsGraves.map((e) => e.texte)).toEqual(['E14', 'E13', 'E12']);
  });

  it('calcule les rangs chez les femmes et chez les hommes sur leurs propres votes', () => {
    const b = construireBarometre(
      [
        el('Jugé grave par les femmes', 1300, { elo_femme: 1500, elo_homme: 1000 }),
        el('Jugé grave par les hommes', 1250, { elo_femme: 1000, elo_homme: 1500 }),
      ],
      10,
    );
    const [a, c] = b.pires;
    expect([a.rangFemmes, a.rangHommes]).toEqual([1, 2]);
    expect([c.rangFemmes, c.rangHommes]).toEqual([2, 1]);
    expect(b.selonFemmes[0].texte).toBe('Jugé grave par les femmes');
    expect(b.selonHommes[0].texte).toBe('Jugé grave par les hommes');
  });

  it("désigne le groupe le plus sévère sur l'écart le plus marqué", () => {
    const b = construireBarometre(
      [
        el('Petit écart', 1200, { elo_femme: 1220, elo_homme: 1180 }),
        el('Grand écart', 1100, { elo_femme: 950, elo_homme: 1250 }),
      ],
      10,
    );
    expect(b.plusGrandEcart).toEqual({ texte: 'Grand écart', ecart: 300, plusSeveres: 'hommes' });
  });

  it("n'ouvre une section de thème qu'à partir de huit comportements", () => {
    const argent = Array.from({ length: 8 }, (_, i) => el(`Argent ${i}`, 1300 - i, { tags: ['argent'] }));
    const sport = Array.from({ length: 7 }, (_, i) => el(`Sport ${i}`, 1100 - i, { tags: ['sport'] }));
    const b = construireBarometre([...argent, ...sport], 10);
    expect(b.themes.map((t) => [t.id, t.total, t.entrees.length])).toEqual([['argent', 8, 5]]);
  });

  it('renvoie un baromètre vide plutôt que des zéros', () => {
    const b = construireBarometre([el('Trop récent', 1200, { nb_participations: 3 })], 42);
    expect(b.classes).toBe(0);
    expect(b.pires).toEqual([]);
    expect(b.duels).toBe(42);
  });
});
