/**
 * @file traduction.test.ts
 * @description « Le pire des deux » en anglais, côté serveur.
 *
 * Ce qu'il faut tenir : tous les comportements actifs de la base de production
 * (relevé du 2026-11-14, `elementsBase.json`) et toute la maquette locale ont
 * leur traduction ; un texte inconnu reste en français plutôt que de
 * disparaître ; le français n'est jamais touché ; la route du duel et le
 * classement traduisent ce qu'ils renvoient, et la recherche anglaise porte sur
 * le texte anglais.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nonTraduits, traduireElement, traduireTextes, normaliserRecherche } from '../traduction';
import { ELEMENTS_EN } from '../elementsEn';
import elementsBase from './elementsBase.json';

const getLeaderboard = vi.hoisted(() => vi.fn());
vi.mock('@/lib/repositories', () => ({ getLeaderboard }));

import { getLeaderboardPage, getObservatoryData } from '@/lib/leaderboard';

/** Des mots qui trahiraient un comportement resté en français. */
const FRANCAIS = /\b(son|sa|ses|les|des|une|avec|quand|pendant|toujours|jamais|être|faire|avoir)\b/i;

describe('Le pire des deux — dictionnaire', () => {
  it('traduit tous les comportements actifs de la base de production, relevés le 2026-11-14', () => {
    // 183 « Quotidien » et 87 « Amour & Sexe ». Un comportement ajouté depuis
    // s'affiche en français tant qu'il n'est pas dans le dictionnaire : le
    // relever de nouveau ici le dira.
    const textes = [...elementsBase.quotidien, ...elementsBase.sexe];
    expect(textes).toHaveLength(270);
    expect(nonTraduits(textes)).toEqual([]);
  });

  it('traduit toute la maquette locale (mode mock)', async () => {
    const { getMockElements } = await vi.importActual<typeof import('@/lib/mockData')>('@/lib/mockData');
    const textes = getMockElements().map((e) => e.texte);
    expect(textes.length).toBeGreaterThan(100);
    expect(nonTraduits(textes)).toEqual([]);
  });

  it('ne laisse aucune traduction vide ni visiblement française', () => {
    for (const [fr, en] of Object.entries(ELEMENTS_EN)) {
      expect(en.trim(), fr).not.toBe('');
      expect(en, fr).not.toMatch(FRANCAIS);
      expect(en, fr).not.toBe(fr);
    }
  });

  it('confond apostrophes droites et typographiques, et les espaces', () => {
    expect(traduireElement("Applaudir à l'atterrissage", 'en')).toBe('Clapping when the plane lands');
    expect(traduireElement('Applaudir à l’atterrissage', 'en')).toBe('Clapping when the plane lands');
    expect(traduireElement('  Roter   à table ', 'en')).toBe('Burping at the table');
  });

  it('laisse en français un comportement qu’il ne connaît pas', () => {
    expect(traduireElement('Une proposition ajoutée hier', 'en')).toBe('Une proposition ajoutée hier');
  });

  it('ne touche jamais au français', () => {
    expect(traduireElement('Roter à table', 'fr')).toBe('Roter à table');
    const lignes = [{ texte: 'Roter à table', n: 1 }];
    expect(traduireTextes(lignes, 'fr')).toBe(lignes);
    expect(traduireTextes(lignes, 'en')).toEqual([{ texte: 'Burping at the table', n: 1 }]);
  });

  it('normalise la recherche : casse, accents, apostrophes', () => {
    expect(normaliserRecherche('  Café’S ')).toBe("cafe's");
  });
});

const ligne = (id: string, texte: string, elo = 1000, extra: Record<string, number> = {}) => ({
  id, texte, categorie: 'quotidien', tags: [],
  elo_global: elo, elo_homme: elo, elo_femme: elo,
  elo_16_18: elo, elo_19_22: elo, elo_23_26: elo, elo_27plus: elo,
  nb_participations: 50,
  ...extra,
});

describe('Le pire des deux — classement et Observatoire en anglais', () => {
  beforeEach(() => {
    getLeaderboard.mockReset();
  });

  it('rend le classement français tel quel', async () => {
    getLeaderboard.mockResolvedValue({ elements: [ligne('1', 'Roter à table')], total: 1 });
    const data = await getLeaderboardPage({ limit: 10 });
    expect(data.rankings[0].texte).toBe('Roter à table');
  });

  it('traduit les lignes du classement, scores et rangs inchangés', async () => {
    getLeaderboard.mockResolvedValue({ elements: [ligne('1', 'Roter à table', 1100)], total: 1 });
    const data = await getLeaderboardPage({ limit: 10, langue: 'en' });
    expect(data.rankings[0]).toMatchObject({ rank: 1, texte: 'Burping at the table', elo_global: 1100 });
  });

  it('cherche en anglais dans le texte traduit, et pagine elle-même', async () => {
    getLeaderboard.mockResolvedValue({
      elements: [
        ligne('1', 'Roter à table'),
        ligne('2', 'Péter en public'),
        ligne('3', 'Pisser dans la piscine'),
        ligne('4', 'Se gratter les parties intimes en public'),
      ],
      total: 4,
    });
    const data = await getLeaderboardPage({ limit: 1, offset: 1, search: 'PUBLIC', langue: 'en' });
    // La base est lue sans recherche (elle ne connaît que le français).
    expect(getLeaderboard).toHaveBeenCalledWith(expect.objectContaining({ search: null, offset: 0 }));
    expect(data.totalElements).toBe(2);
    expect(data.rankings).toHaveLength(1);
    expect(data.rankings[0]).toMatchObject({ rank: 2, texte: 'Scratching your crotch in public' });
    expect(data.hasMore).toBe(false);
  });

  it('en français, la recherche reste confiée à la base', async () => {
    getLeaderboard.mockResolvedValue({ elements: [], total: 0 });
    await getLeaderboardPage({ limit: 10, search: 'roter' });
    expect(getLeaderboard).toHaveBeenCalledWith(expect.objectContaining({ search: 'roter', limit: 10 }));
  });

  it('traduit les comportements de l’Observatoire', async () => {
    getLeaderboard.mockResolvedValue({
      elements: [
        ligne('1', 'Roter à table', 1000, { elo_homme: 1200, elo_femme: 900 }),
        ligne('2', 'Péter en public', 1000, { elo_16_18: 1150, elo_27plus: 950 }),
      ],
      total: 2,
    });
    const fr = await getObservatoryData(12);
    const en = await getObservatoryData(12, 'en');
    expect(fr.genderGaps[0].texte).toBe('Roter à table');
    expect(en.genderGaps[0].texte).toBe('Burping at the table');
    expect(en.genderGaps[0].gap).toBe(fr.genderGaps[0].gap);
    for (const e of [...en.genderGaps, ...en.ageGaps, ...en.mostContested, ...en.mostConsensual]) {
      expect(e.texte).not.toMatch(/à|é/);
    }
  });
});
