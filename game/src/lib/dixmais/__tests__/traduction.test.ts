/**
 * @file traduction.test.ts
 * @description « C'est un 10 mais… » en anglais, côté serveur.
 *
 * Ce qu'il faut tenir : tous les énoncés actifs et approuvés de la base de
 * production (relevé du 2026-11-14, `enoncesBase.json`) et tout le jeu de
 * départ du mode simulé ont leur traduction ; un texte inconnu reste en
 * français plutôt que de disparaître ; le français n'est jamais touché ; la
 * route du tirage et le classement traduisent ce qu'ils renvoient.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { nonTraduits, traduireEnonce, traduireEnonces } from '../traduction';
import { ENONCES_EN } from '../enoncesEn';
import enoncesBase from './enoncesBase.json';
import { getDixMaisLeaderboard, getRandomStatements } from '@/lib/repositories/dixmais';

/** Des mots qui trahiraient un énoncé resté en français. */
const FRANCAIS = /\b(Il|Elle|est|son|sa|ses|les|des|une|avec|quand|jamais|toujours|tout|pas|qui|fait)\b/;

describe('C’est un 10 mais… — dictionnaire', () => {
  it('traduit tous les énoncés actifs et approuvés de la base de production, relevés le 2026-11-14', () => {
    // 120 red flags et 52 green flags. Un énoncé ajouté depuis s'affiche en
    // français tant qu'il n'est pas dans le dictionnaire : le relever de
    // nouveau ici le dira.
    expect(enoncesBase.negative).toHaveLength(120);
    expect(enoncesBase.positive).toHaveLength(52);
    expect(nonTraduits([...enoncesBase.negative, ...enoncesBase.positive])).toEqual([]);
  });

  it('traduit tout le jeu de départ du mode simulé', async () => {
    const avant = process.env.NEXT_PUBLIC_MOCK_MODE;
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    try {
      const lignes = await getDixMaisLeaderboard(100);
      expect(lignes.length).toBeGreaterThanOrEqual(30);
      expect(nonTraduits(lignes.map((l) => l.text))).toEqual([]);
    } finally {
      process.env.NEXT_PUBLIC_MOCK_MODE = avant;
    }
  });

  it('ne laisse aucune traduction vide ni visiblement française', () => {
    for (const [fr, en] of Object.entries(ENONCES_EN)) {
      expect(en.trim(), fr).not.toBe('');
      expect(en, fr).not.toMatch(FRANCAIS);
      expect(en, fr).not.toMatch(/[àâçéèêëîïôûùœ«»€]/i);
      expect(en, fr).not.toBe(fr);
    }
  });

  it('confond apostrophes droites et typographiques, et les espaces', () => {
    expect(traduireEnonce("Il n'a aucune empathie", 'en')).toBe('He has zero empathy');
    expect(traduireEnonce('Il n’a aucune empathie', 'en')).toBe('He has zero empathy');
    expect(traduireEnonce('  Il   ment facilement ', 'en')).toBe('He lies easily');
  });

  it('laisse en français un énoncé qu’il ne connaît pas', () => {
    expect(traduireEnonce('Il a été ajouté hier', 'en')).toBe('Il a été ajouté hier');
  });

  it('ne touche jamais au français', () => {
    expect(traduireEnonce('Il ment facilement', 'fr')).toBe('Il ment facilement');
    const lignes = [{ id: 'x', text: 'Il ment facilement', type: 'negative' }];
    expect(traduireEnonces(lignes, 'fr')).toBe(lignes);
    expect(traduireEnonces(lignes, 'en')).toEqual([{ id: 'x', text: 'He lies easily', type: 'negative' }]);
  });
});

describe('C’est un 10 mais… — routes en anglais (mode simulé)', () => {
  let avant: string | undefined;
  beforeEach(() => {
    avant = process.env.NEXT_PUBLIC_MOCK_MODE;
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
  });
  afterEach(() => {
    process.env.NEXT_PUBLIC_MOCK_MODE = avant;
  });

  const appeler = async (route: { GET: (req: NextRequest) => Promise<Response> }, adresse: string) => {
    const res = await route.GET(new NextRequest(`http://localhost${adresse}`));
    return (await res.json()).data as { id: string; text: string; type: string }[];
  };

  it('tire un profil en anglais avec `?lang=en`, en français sans', async () => {
    const route = await import('@/app/api/dixmais/statements/route');
    const en = await appeler(route, '/api/dixmais/statements?count=7&verts=2&lang=en');
    expect(en).toHaveLength(7);
    for (const s of en) expect(s.text).toMatch(/^He\b/);

    const fr = await appeler(route, '/api/dixmais/statements?count=7&verts=2');
    for (const s of fr) expect(s.text).toMatch(/^Il\b/);
  });

  it('traduit le classement, identifiants et notes inchangés', async () => {
    const route = await import('@/app/api/dixmais/leaderboard/route');
    const fr = await appeler(route, '/api/dixmais/leaderboard?limit=100');
    const en = await appeler(route, '/api/dixmais/leaderboard?limit=100&lang=en');
    expect(en.map((l) => l.id)).toEqual(fr.map((l) => l.id));
    expect(en.map((l) => l.type)).toEqual(fr.map((l) => l.type));
    for (const l of en) expect(l.text).not.toMatch(FRANCAIS);
    expect(fr.some((l) => l.text === 'Il ment facilement' || l.text.startsWith('Il '))).toBe(true);
  });

  it('le dépôt lui-même reste en français', async () => {
    const lignes = await getRandomStatements(7, [], { verts: 2 });
    for (const s of lignes) expect(s.text).toMatch(/^Il\b/);
  });
});
