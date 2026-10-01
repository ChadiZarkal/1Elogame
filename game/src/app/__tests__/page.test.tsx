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
 * contentait de chercher des intitulés d'onglets. D'où l'assertion sur les
 * `href` : c'est elle, et non la présence d'un texte, qui dit qu'un jeu est
 * joignable.
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
    for (const href of ['/redflagtest', '/jeu', '/dixmais', '/flagornot']) {
      expect(liens).toContain(href);
    }
  });

  it('met en tête les deux jeux phares, chacun avec son bouton', async () => {
    render(await HomePage());
    const phares = screen.getByRole('region', { name: 'Les deux jeux phares' });
    const liens = Array.from(phares.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(liens).toEqual(['/redflagtest', '/dixmais']);
    expect(phares.textContent).toMatch(/Faire le test/);
    expect(phares.textContent).toMatch(/Noter un profil/);
  });

  it("garde les jeux d'appoint visibles, sans onglet à ouvrir", async () => {
    render(await HomePage());
    const autres = screen.getByRole('region', { name: 'Et aussi' });
    const liens = Array.from(autres.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(liens).toEqual(['/flagornot', '/jeu']);
  });

  it('place Le pire des deux en dernier', async () => {
    render(await HomePage());
    const titres = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    const jeux = titres.filter((t) =>
      ['RED FLAG TEST', "C'EST UN 10 MAIS…", "L'ORACLE", 'LE PIRE DES DEUX'].includes(t ?? ''),
    );
    expect(jeux.at(-1)).toBe('LE PIRE DES DEUX');
  });

  it('mène aux articles, que la barre de menu absente de l’accueil ne montre pas', async () => {
    render(await HomePage());
    const section = screen.getByRole('region', { name: 'À lire' });
    const liens = Array.from(section.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(liens).toContain('/articles');
    expect(liens.filter((h) => h?.startsWith('/articles/')).length).toBeGreaterThan(0);
  });

  it('ne promet pas « sans pub » : le site sert des annonces', async () => {
    render(await HomePage());
    expect(screen.queryByText(/sans pub/i)).toBeNull();
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

  it('fait défiler les deux bouts du classement, lus dans la base', async () => {
    const rangs = (prefixe: string) =>
      Array.from({ length: 8 }, (_, i) => ({ rank: i + 1, texte: `${prefixe} ${i + 1}`, nb_participations: 10 }));
    getLeaderboardPage.mockImplementation(async ({ sort }: { sort: string }) => ({
      rankings: sort === 'asc' ? rangs('Anodin') : rangs('Grave'),
      totalElements: 412,
    }));

    render(await HomePage());

    const rouges = screen.getByRole('list', { name: 'Jugés les plus graves' });
    const verts = screen.getByRole('list', { name: 'Jugés les moins graves' });
    expect(rouges.querySelectorAll('li')).toHaveLength(8);
    expect(verts.textContent).toMatch(/Anodin 1/);
    // La seconde copie, qui sert la boucle, n'est lue qu'une fois.
    expect(document.querySelectorAll('ul[aria-hidden="true"]')).toHaveLength(2);
    // Le podium ne garde que les trois premiers.
    expect(screen.getByRole('heading', { level: 3, name: 'Les trois pires' })).toBeDefined();
  });

  it("n'affiche jamais un même comportement dans les deux rangées", async () => {
    const memes = Array.from({ length: 5 }, (_, i) => ({
      rank: i + 1, texte: `Comportement ${i + 1}`, nb_participations: 10,
    }));
    getLeaderboardPage.mockResolvedValue({ rankings: memes, totalElements: 5 });

    render(await HomePage());

    // Classement court : les deux bouts se rejoignent, la rangée verte se vide
    // et disparaît plutôt que de répéter la rouge.
    expect(screen.getByRole('list', { name: 'Jugés les plus graves' })).toBeDefined();
    expect(screen.queryByRole('list', { name: 'Jugés les moins graves' })).toBeNull();
  });

  it('garde le podium quand seul le compteur de votes tombe', async () => {
    getPublicStats.mockRejectedValue(new Error('compteur injoignable'));

    render(await HomePage());

    expect(screen.getByRole('heading', { level: 2, name: /Le verdict des joueurs/ })).toBeDefined();
    expect(screen.queryByText(/votes ·/)).toBeNull();
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
    expect(screen.queryByRole('heading', { name: /Le verdict des joueurs/i })).toBeNull();
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
