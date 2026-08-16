/**
 * @file page.test.tsx
 * @description Accueil — sélecteur de jeu et contenu éditorial servi sous lui.
 *
 * Ces tests portent volontairement sur ce qui doit rester vrai : la page
 * possède un titre de niveau 1, elle expose les quatre jeux, et la présentation
 * du site est rendue sans interaction ni hydratation. C'est ce dernier point
 * qui compte pour l'indexation : le sélecteur ne rend qu'une carte à la fois,
 * donc l'essentiel du texte doit venir d'ailleurs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  // getAllByText : le jeu sélectionné apparaît deux fois — dans l'onglet du
  // sélecteur et dans le titre de la carte héro.
  it('propose les quatre jeux dans le sélecteur', () => {
    render(<HomePage />);
    for (const titre of ['REDFLAG TEST', 'LE PIRE DES DEUX', 'SOUMETS TON CAS', "C'est un 10 mais..."]) {
      expect(screen.getAllByText(titre).length).toBeGreaterThan(0);
    }
  });

  it('expose les liens vers le classement et les ressources', () => {
    render(<HomePage />);
    const links = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(links).toContain('/classement');
    expect(links).toContain('/ressources');
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

  it('récupère les statistiques publiques au montage', async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stats/public');
    });
  });
});
