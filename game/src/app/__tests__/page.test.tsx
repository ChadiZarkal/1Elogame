/**
 * @file page.test.tsx
 * @description Accueil — la vitrine des jeux, ce que les votes ont donné, et
 * le contenu éditorial sous le tout.
 *
 * Ces tests portent sur ce qui doit rester vrai : la page possède un titre de
 * niveau 1, elle expose tous les jeux qu'elle met en avant, et elle le fait
 * sans interaction ni hydratation.
 *
 * Ce dernier point n'est pas qu'une question d'indexation. La version d'avant
 * était un carrousel : un seul jeu sur quatre était rendu, les autres derrière
 * un onglet. Le test correspondant passait quand même, parce qu'il se
 * contentait de chercher des intitulés d'onglets — et il est passé tout du
 * long alors que Flash Flag, un jeu bien réel, n'était atteignable depuis
 * l'accueil par aucun chemin. D'où l'assertion sur les `href` : c'est elle, et
 * non la présence d'un texte, qui dit qu'un jeu est joignable.
 *
 * La base est simulée ici. Ce qui est testé n'est pas ce qu'elle contient,
 * mais que la page se rende entière quand elle ne répond pas — c'est le seul
 * mode de défaillance qui laisserait l'accueil cassé en production.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import { HOME_NOTES } from '@/content/page-notes';

const getPublicStats = vi.hoisted(() => vi.fn());
const getLeaderboardPage = vi.hoisted(() => vi.fn());

vi.mock('@/lib/repositories', () => ({ getPublicStats }));
vi.mock('@/lib/leaderboard', () => ({ getLeaderboardPage }));

vi.mock('sonner', () => ({ toast: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

const PIRES = [
  { rank: 1, texte: 'Il lit mes conversations', nb_participations: 1204 },
  { rank: 2, texte: 'Elle refuse de rencontrer mes amis', nb_participations: 980 },
  { rank: 3, texte: 'Il ne dit jamais pardon', nb_participations: 877 },
];

describe('Accueil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPublicStats.mockResolvedValue({
      totalVotes: 128394,
      totalElements: 412,
      estimatedPlayers: 8559,
    });
    getLeaderboardPage.mockResolvedValue({ rankings: PIRES, totalElements: 412 });
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  it('expose un titre de niveau 1', async () => {
    const { container } = render(await HomePage());
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1!.textContent || h1!.querySelector('img')?.getAttribute('alt') || '')
      .toMatch(/Red or Green/i);
  });

  it("nomme chaque jeu mis en avant, sans qu'il faille toucher à quoi que ce soit", async () => {
    render(await HomePage());
    for (const titre of ['RED FLAG TEST', "C'EST UN 10 MAIS…", "L'ORACLE", 'LE PIRE DES DEUX']) {
      expect(screen.getByRole('heading', { level: 3, name: titre })).toBeDefined();
    }
  });

  it('mène à chacun des jeux mis en avant', async () => {
    render(await HomePage());
    const liens = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    for (const href of ['/jeu', '/dixmais', '/flagornot']) {
      expect(liens).toContain(href);
    }
    // Le Red Flag Test est encore servi par l'application d'origine.
    expect(liens.some((h) => h?.includes('redflagtest'))).toBe(true);
  });

  it('expose les repères et les ressources sans tiroir à ouvrir', async () => {
    render(await HomePage());
    const liens = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    // `/ressources` vivait derrière la feuille « Safe zone » : il fallait
    // deviner qu'un bouclier cachait des liens pour l'atteindre.
    for (const href of ['/classement', '/ressources', '/guide', '/observatoire']) {
      expect(liens).toContain(href);
    }
  });

  it('montre les comportements les plus mal jugés, et non une promesse', async () => {
    render(await HomePage());
    for (const pire of PIRES) {
      expect(screen.getByText(pire.texte)).toBeDefined();
    }
    expect(screen.getByText(/128\s?394 votes/)).toBeDefined();
  });

  it('se rend entière quand la base ne répond pas', async () => {
    getPublicStats.mockRejectedValue(new Error('base injoignable'));
    getLeaderboardPage.mockRejectedValue(new Error('base injoignable'));

    render(await HomePage());

    // Les jeux, les repères et la présentation restent là.
    expect(screen.getByRole('heading', { level: 3, name: 'LE PIRE DES DEUX' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: HOME_NOTES.title })).toBeDefined();
    // Et rien n'affiche un zéro à la place d'un chiffre.
    expect(screen.queryByText(/0 votes/)).toBeNull();
    expect(screen.queryByRole('heading', { name: /Les pires/i })).toBeNull();
  });

  it('rend la présentation du site sans interaction', async () => {
    render(await HomePage());
    expect(screen.getByRole('heading', { level: 2, name: HOME_NOTES.title })).toBeDefined();
    for (const block of HOME_NOTES.blocks) {
      expect(screen.getByRole('heading', { level: 3, name: block.heading })).toBeDefined();
    }
  });

  it('rend chaque question de la FAQ, celles-là mêmes qui sont balisées', async () => {
    render(await HomePage());
    for (const item of HOME_NOTES.faq) {
      expect(screen.getByRole('heading', { level: 4, name: item.question })).toBeDefined();
    }
  });

  it('ne fait aucun appel réseau au montage', async () => {
    // L'accueil appelait `/api/stats/public` à chaque visite pour un résultat
    // qu'aucun élément ne lisait. C'est la page la plus visitée du site : les
    // chiffres viennent maintenant du serveur, en props, régénérés toutes les
    // cinq minutes — le navigateur ne demande rien.
    render(await HomePage());
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
