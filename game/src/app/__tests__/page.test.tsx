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
  HelpCircle: () => <span>HelpCircle</span>,
  X: () => <span>X</span>,
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

  it('affiche la plateforme et les quatre jeux disponibles depuis l’accueil', () => {
    render(<HubPage />);

    expect(screen.getByText(/red or green/i)).toBeDefined();
    expect(screen.getByText(/4 jeux disponibles/i)).toBeDefined();
    expect(screen.getByRole('heading', { name: /redflag test/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /le pire des deux/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /soumets ton cas/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /c'est un 10 mais/i })).toBeDefined();
  });

  it('propose des appels à l’action clairs vers chaque jeu', () => {
    render(<HubPage />);

    expect(screen.getByRole('link', { name: /faire le test/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /lancer le duel/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /lancer une analyse/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /jouer maintenant/i })).toBeDefined();
  });

  it('affiche le classement et les statuts de confiance', () => {
    render(<HubPage />);

    const leaderboardMatches = screen.getAllByText(/palmarès général|leaderboard/i);
    expect(leaderboardMatches.length).toBeGreaterThan(0);

    const safeZoneMatches = screen.getAllByText(/safe zone|espace safe zone/i);
    expect(safeZoneMatches.length).toBeGreaterThan(0);
  });

  it('récupère les stats au montage', async () => {
    render(<HubPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stats/public');
    });
  });
});
