/**
 * @file page.test.tsx
 * @description Accueil — la vitrine des jeux et le contenu éditorial sous elle.
 *
 * Ces tests portent sur ce qui doit rester vrai : la page possède un titre de
 * niveau 1, elle expose *tous* les jeux, et elle le fait sans interaction ni
 * hydratation.
 *
 * Ce dernier point n'est plus seulement une question d'indexation. La version
 * précédente était un carrousel : un seul jeu sur quatre était rendu, les
 * autres derrière un onglet. Le test correspondant passait quand même, parce
 * qu'il se contentait de chercher les intitulés d'onglets — et il est passé
 * tout du long alors que Flash Flag, un jeu bien réel, n'était atteignable
 * depuis l'accueil par aucun chemin. D'où l'assertion sur les `href` : c'est
 * elle, et non la présence d'un texte, qui dit qu'un jeu est joignable.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import { HOME_NOTES } from '@/content/page-notes';

vi.mock('sonner', () => ({
  toast: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Accueil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { totalVotes: 1234, estimatedPlayers: 56 } }),
    }) as unknown as typeof fetch;
  });

  it('expose un titre de niveau 1', () => {
    const { container } = render(<HomePage />);
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1!.textContent || h1!.querySelector('img')?.getAttribute('alt') || '')
      .toMatch(/Red or Green/i);
  });

  it("nomme les cinq jeux, sans qu'il faille toucher à quoi que ce soit", () => {
    render(<HomePage />);
    for (const titre of [
      'RED FLAG TEST',
      'LE PIRE DES DEUX',
      "C'EST UN 10 MAIS…",
      'FLASH FLAG',
      "L'ORACLE",
    ]) {
      expect(screen.getByRole('heading', { level: 3, name: titre })).toBeDefined();
    }
  });

  it('mène à chacun des cinq jeux', () => {
    render(<HomePage />);
    const liens = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    for (const href of ['/jeu', '/dixmais', '/flashflag', '/flagornot']) {
      expect(liens).toContain(href);
    }
    // Le Red Flag Test est encore servi par l'application d'origine.
    expect(liens.some((h) => h?.includes('redflagtest'))).toBe(true);
  });

  it('expose les repères et les ressources sans tiroir à ouvrir', () => {
    render(<HomePage />);
    const links = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    // `/ressources` vivait derrière la feuille « Safe zone » : il fallait
    // deviner qu'un bouclier cachait des liens pour l'atteindre.
    for (const href of ['/classement', '/ressources', '/guide', '/observatoire']) {
      expect(links).toContain(href);
    }
  });

  it('rend la présentation du site sans interaction', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 2, name: HOME_NOTES.title })).toBeDefined();
    for (const block of HOME_NOTES.blocks) {
      expect(screen.getByRole('heading', { level: 3, name: block.heading })).toBeDefined();
    }
  });

  it('rend chaque question de la FAQ, celles-là mêmes qui sont balisées', () => {
    render(<HomePage />);
    for (const item of HOME_NOTES.faq) {
      expect(screen.getByRole('heading', { level: 4, name: item.question })).toBeDefined();
    }
  });

  it('ne fait aucun appel réseau au montage', () => {
    // L'accueil appelait `/api/stats/public` à chaque visite pour un résultat
    // qu'aucun élément ne lisait — la barre de statistiques avait disparu avec
    // la refonte, l'appel était resté. C'est la page la plus visitée du site.
    render(<HomePage />);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
