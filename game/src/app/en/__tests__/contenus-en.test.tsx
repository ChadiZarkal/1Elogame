/**
 * @file contenus-en.test.tsx
 * @description Les pages éditoriales en anglais (`/en/guide`, `/en/red-flags`,
 * `/en/articles`, `/en/methodologie`, `/en/a-propos`, `/en/sources`) et les
 * notes anglaises : rendues en anglais, sans phrase française oubliée, avec
 * des liens qui restent dans l'anglais.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { construireBarometre, type ElementBarometre } from '@/lib/barometre';
import { ARTICLES, ARTICLES_EN } from '@/content/articles';
import { METERS } from '@/config/meters-data';
import * as NOTES_FR from '@/content/page-notes';
import { NOTES_TRADUITES, notesPour } from '@/content/page-notes-en';
import { OUTILS_EN, RESSOURCES_EN } from '@/content/outils-en';
import { PageNotes } from '@/components/content/PageNotes';
import { PageGuide } from '@/app/guide/PageGuide';
import { GUIDE_FAQ, GUIDE_FAQ_EN } from '@/app/guide/faq';
import PageArticleEn from '@/app/en/articles/[slug]/page';
import PageArticlesEn from '@/app/en/articles/page';
import RedFlagsEnPage from '@/app/en/red-flags/page';
import MethodologieEnPage from '@/app/en/methodologie/page';
import AProposEnPage from '@/app/en/a-propos/page';
import SourcesEnPage from '@/app/en/sources/page';

const getBarometre = vi.hoisted(() => vi.fn());
vi.mock('@/lib/barometre', async (original) => ({
  ...(await original<typeof import('@/lib/barometre')>()),
  getBarometre,
}));
vi.mock('@/lib/leaderboard', () => ({ getLeaderboardPage: async () => ({ totalElements: 266 }) }));

/**
 * Les noms propres français qui restent en français dans le texte anglais :
 * organismes, associations, lignes d'aide, noms d'origine des outils.
 */
const NOMS_PROPRES = [
  'Défenseur des droits', 'Violences Femmes Info', 'Allô Enfance en Danger', 'Viols Femmes Informations',
  'Non au harcèlement', 'Net Écoute', 'Face à l’inceste', 'Mémoire Traumatique et Victimologie',
  'Mémoire Traumatique', 'Centre Hubertine Auclert', 'Île-de-France', 'En Avant Toute(s)',
  'Seine-Saint-Denis', 'violentomètre', 'consentomètre', 'SOS Racisme', 'SOS Homophobie',
  ...METERS.map((m) => m.name),
];

/** Des mots et signes qui ne s'écrivent pas en anglais. */
const FRANCAIS = /\b(les|des|une|est|pour|avec|dans|qui|pas|sur|du|aux|et|ou|selon|cette|mais|vous|tu|nous|ton|ta|tes)\b|[«»éèêàçùœ]|\bd'|\bl'|\bqu'/gi;

/** Le français qui traîne dans un élément, hors `lang="fr"` et noms propres. */
function francaisRestant(el: Element): string[] {
  const copie = el.cloneNode(true) as Element;
  copie.querySelectorAll('[lang="fr"], script').forEach((n) => n.remove());
  let texte = copie.textContent ?? '';
  for (const nom of NOMS_PROPRES) texte = texte.split(nom).join(' ');
  return [...texte.matchAll(FRANCAIS)].map((m) => {
    const i = m.index ?? 0;
    return texte.slice(Math.max(0, i - 30), i + 30);
  });
}

/** Les liens internes d'une page anglaise restent sous `/en` (« C'est un 10 mais… » compris, depuis le 2026-11-14). */
function liensHorsAnglais(): string[] {
  return Array.from(document.querySelectorAll('a'))
    .map((a) => a.getAttribute('href') ?? '')
    .filter((h) => h.startsWith('/') && !/^\/en(\/|$)/.test(h));
}

describe('le détecteur de français', () => {
  it('trouve bien le français quand il y en a', () => {
    const { container } = render(<PageGuide langue="fr" />);
    expect(francaisRestant(container).length).toBeGreaterThan(20);
  });
});

describe('guide en anglais', () => {
  it('se rend en anglais, sans français oublié, avec des liens anglais', () => {
    const { container } = render(<PageGuide langue="en" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Red flag: meaning and examples' })).toBeDefined();
    expect(francaisRestant(container)).toEqual([]);
    expect(liensHorsAnglais()).toEqual([]);
    // Les exemples sont dans le HTML, même repliés.
    expect(screen.getByText('Controls who you spend time with')).toBeDefined();
  });

  it('a autant de questions que la FAQ française', () => {
    expect(GUIDE_FAQ_EN).toHaveLength(GUIDE_FAQ.length);
  });
});

describe('articles en anglais', () => {
  it('existent pour chaque article français, à la même adresse', () => {
    expect(ARTICLES_EN.map((a) => a.slug).sort()).toEqual(ARTICLES.map((a) => a.slug).sort());
  });

  it.each(ARTICLES_EN.map((a) => [a.slug]))('%s se rend en anglais', async (slug) => {
    const article = ARTICLES_EN.find((a) => a.slug === slug)!;
    const { container } = render(await PageArticleEn({ params: Promise.resolve({ slug }) }));
    expect(screen.getByRole('heading', { level: 1, name: article.titre })).toBeDefined();
    expect(screen.getByText(/published September 29, 2026/)).toBeDefined();
    // Le corps et la suite ; les titres des sources sont ceux, français, des publications.
    const corps = container.querySelector('.article-corps')!;
    expect(francaisRestant(corps)).toEqual([]);
    expect(francaisRestant(container.querySelector('.article-chapo')!)).toEqual([]);
    expect(liensHorsAnglais()).toEqual([]);
    const ld = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => JSON.parse(s.textContent ?? '{}'))
      .flatMap((b) => b['@graph'] ?? [b]);
    expect(ld.find((x) => x['@type'] === 'Article')).toMatchObject({ inLanguage: 'en-US' });
  });

  it("l'article sans source se lit entièrement en anglais", async () => {
    const { container } = render(
      await PageArticleEn({ params: Promise.resolve({ slug: 'red-flags-hommes-femmes-presque-d-accord' }) }),
    );
    expect(francaisRestant(container)).toEqual([]);
  });

  it('chaque outil et chaque ressource propre a son anglais', () => {
    for (const m of METERS) {
      expect(OUTILS_EN[m.slug], m.slug).toBeDefined();
      const communes = METERS[0].resources.filter((r) => METERS.every((x) => x.resources.some((y) => y.name === r.name)));
      for (const r of m.resources) {
        if (!communes.some((c) => c.name === r.name)) expect(RESSOURCES_EN[r.name], r.name).toBeDefined();
      }
    }
  });

  it('la liste renvoie à chaque article anglais', () => {
    render(<PageArticlesEn />);
    const liens = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    for (const a of ARTICLES_EN) expect(liens).toContain(`/en/articles/${a.slug}`);
  });
});

describe('pires red flags en anglais', () => {
  function elements(): ElementBarometre[] {
    const base = ['Avoir mauvaise haleine', 'Couper la parole', 'Être radin', 'Chanter sous la douche'];
    const liste = base.map((texte, i) => ({
      texte, tags: [], elo_global: 1400 - i * 100, elo_homme: 1400 - i * 90, elo_femme: 1400 - i * 110, nb_participations: 120,
    }));
    for (let i = 0; i < 8; i++) {
      liste.push({ texte: `Argent ${i}`, tags: ['argent'], elo_global: 1150 - i, elo_homme: 1150 - i, elo_femme: 1150 - i, nb_participations: 80 });
    }
    return liste;
  }

  beforeEach(() => {
    getBarometre.mockReset();
    getBarometre.mockResolvedValue(construireBarometre(elements(), 13000));
  });

  it('écrit en anglais, comportements traduits par le dictionnaire du jeu', async () => {
    const { container } = render(await RedFlagsEnPage());
    expect(screen.getByRole('heading', { level: 1, name: /worst red flags/i })).toBeDefined();
    expect(screen.getByText(/13,000 duels decided/)).toBeDefined();
    // Le dictionnaire du « pire des deux » est branché : plus d'avertissement.
    expect(screen.queryByText(/original French wording/)).toBeNull();
    expect(screen.getByRole('heading', { level: 3, name: /Money/ })).toBeDefined();
    // Les textes de la base sont en `lang="fr"` (citations exceptées) : le reste est anglais.
    const sansCitations = container.querySelector('main')!.cloneNode(true) as Element;
    sansCitations.querySelectorAll('p').forEach((p) => {
      if (/“/.test(p.textContent ?? '')) p.remove();
    });
    expect(francaisRestant(sansCitations)).toEqual([]);
    expect(liensHorsAnglais()).toEqual([]);
  });

  it('dit que la base ne répond pas', async () => {
    getBarometre.mockRejectedValue(new Error('base injoignable'));
    render(await RedFlagsEnPage());
    expect(screen.getByRole('heading', { level: 2, name: /temporarily unavailable/ })).toBeDefined();
  });
});

describe('méthodologie, à propos, sources en anglais', () => {
  it.each([
    ['methodologie', async () => MethodologieEnPage(), 'Methodology'],
    ['a-propos', async () => <AProposEnPage />, 'About'],
    ['sources', async () => <SourcesEnPage />, 'Sources'],
  ] as const)('%s', async (_, page, titre) => {
    const { container } = render(await page());
    expect(screen.getByRole('heading', { level: 1, name: titre })).toBeDefined();
    expect(francaisRestant(container)).toEqual([]);
    expect(liensHorsAnglais()).toEqual([]);
  });

  it('à propos mène à la version anglaise de « C’est un 10 mais… »', () => {
    render(<AProposEnPage />);
    const lien = Array.from(document.querySelectorAll('a')).find((a) => a.getAttribute('href') === '/en/dixmais');
    expect(lien?.parentElement?.textContent).not.toMatch(/\(in French\)/);
  });
});

describe('notes en anglais', () => {
  const constantes = Object.entries(NOTES_FR).filter(
    ([nom, valeur]) => nom.endsWith('_NOTES') && typeof valeur === 'object',
  ) as [string, NOTES_FR.PageNotes][];

  it('existent pour chaque constante française', () => {
    expect(constantes.length).toBeGreaterThan(0);
    for (const [nom, notes] of constantes) {
      expect(NOTES_TRADUITES.get(notes), nom).toBeDefined();
    }
  });

  it.each([...NOTES_TRADUITES.entries()].map(([fr, en]) => [fr.title, fr, en]))(
    '%s : même structure, en anglais, liens anglais',
    (_, fr, en) => {
      expect(notesPour('fr', fr)).toBe(fr);
      expect(notesPour('en', fr)).toBe(en);
      expect(en.blocks.map((b) => [b.body?.length, b.bullets?.length])).toEqual(
        fr.blocks.map((b) => [b.body?.length, b.bullets?.length]),
      );
      expect(en.faq).toHaveLength(fr.faq.length);
      expect(en.related).toHaveLength(fr.related.length);
      for (const l of en.related) expect(l.href).toMatch(/^\/en(\/|$)/);

      const { container } = render(<PageNotes notes={en} langue="en" />);
      expect(francaisRestant(container)).toEqual([]);
      if (en.faq.length) expect(screen.getByRole('heading', { level: 3, name: 'Frequently asked questions' })).toBeDefined();
      expect(screen.getByRole('navigation', { name: 'Related pages' })).toBeDefined();
    },
  );
});
