/**
 * @file page.test.tsx
 * @description Tests for HomePage (HubPage) — game cards, stats, navigation, share.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import HubPage from '@/app/page';

vi.mock('sonner', () => ({
  toast: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Trophy: () => <span>Trophy</span>,
  Share2: () => <span>Share2</span>,
  ArrowRight: () => <span>→</span>,
  ExternalLink: () => <span>↗</span>,
  Shield: () => <span>Shield</span>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('HubPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { totalVotes: 1234, estimatedPlayers: 56 } }),
    }) as unknown as typeof fetch;
  });

  it('affiche le titre Red Flag Games', () => {
    const { container } = render(<HubPage />);
    const h1 = container.querySelector('h1');
    expect(h1).toBeDefined();
    expect(h1!.textContent).toContain('Red or Green');
    // "Le jeu qui divise" is in the subtitle <p>, not in h1
    expect(screen.getByText('Le jeu qui divise')).toBeDefined();
  });

  it('affiche les cartes de jeu', () => {
    render(<HubPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Red Flag Test' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Red or Green' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Oracle' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Flash Flag' })).toBeDefined();
  });

  it('affiche les descriptions des jeux', () => {
    render(<HubPage />);
    expect(screen.getByText(/lequel le pire/)).toBeDefined();
    expect(screen.getByText(/Soumets ta situation/)).toBeDefined();
    expect(screen.getByText(/Es-tu un red flag/)).toBeDefined();
  });

  it('affiche les boutons Classement et Violentomètre', () => {
    render(<HubPage />);
    expect(screen.getByText('Classement')).toBeDefined();
    expect(screen.getByText('Violentomètre')).toBeDefined();
  });

  it('expose un lien vers /classement', () => {
    render(<HubPage />);
    const classementLink = screen.getByRole('link', { name: /Voir le classement des red flags/i });
    expect(classementLink).toHaveAttribute('href', '/classement');
  });

  it('expose un lien vers /jeu pour Red or Green', () => {
    render(<HubPage />);
    const duelLink = screen.getByRole('link', { name: /Jouer à Red or Green/i });
    expect(duelLink).toHaveAttribute('href', '/jeu');
  });

  it('expose un lien vers /flagornot pour Oracle', () => {
    render(<HubPage />);
    const oracleLink = screen.getByRole('link', { name: /Jouer à Oracle/i });
    expect(oracleLink).toHaveAttribute('href', '/flagornot');
  });

  it('affiche le footer avec la version', () => {
    render(<HubPage />);
    expect(screen.getByText(/Red or Green — v3\.8/)).toBeDefined();
  });

  it('récupère les stats au montage', async () => {
    render(<HubPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stats/public');
    });
  });
});
