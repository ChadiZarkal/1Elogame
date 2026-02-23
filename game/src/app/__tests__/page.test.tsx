/**
 * @file page.test.tsx
 * @description Tests for HomePage (HubPage) — game cards, stats, navigation, share.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HubPage from '@/app/page';

vi.mock('sonner', () => ({
  toast: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Trophy: () => <span>Trophy</span>,
  Share2: () => <span>Share2</span>,
  ArrowRight: () => <span>→</span>,
  ExternalLink: () => <span>↗</span>,
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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
    expect(h1!.textContent).toContain('RED');
    expect(h1!.textContent).toContain('FLAG');
    // "Le jeu qui divise" is in the subtitle <p>, not in h1
    expect(screen.getByText('Le jeu qui divise')).toBeDefined();
  });

  it('affiche les 3 cartes de jeu', () => {
    render(<HubPage />);
    expect(screen.getByText('Red Flag')).toBeDefined();
    expect(screen.getByText('Flag or Not')).toBeDefined();
    expect(screen.getByText('Red Flag Test')).toBeDefined();
  });

  it('affiche les descriptions des jeux', () => {
    render(<HubPage />);
    expect(screen.getByText(/2 situations/)).toBeDefined();
    expect(screen.getByText(/IA juge/)).toBeDefined();
    expect(screen.getByText(/Es-tu un red flag/)).toBeDefined();
  });

  it('affiche les boutons Classement et Partager', () => {
    render(<HubPage />);
    expect(screen.getByText('Classement')).toBeDefined();
    expect(screen.getByLabelText('Partager le jeu')).toBeDefined();
  });

  it('navigue vers /classement au clic sur Classement', () => {
    render(<HubPage />);
    fireEvent.click(screen.getByText('Classement'));
    expect(mockPush).toHaveBeenCalledWith('/classement');
  });

  it('navigue vers /jeu au clic sur Red Flag', () => {
    render(<HubPage />);
    fireEvent.click(screen.getByLabelText('Jouer à Red Flag'));
    expect(mockPush).toHaveBeenCalledWith('/jeu');
  });

  it('navigue vers /flagornot au clic sur Flag or Not', () => {
    render(<HubPage />);
    fireEvent.click(screen.getByLabelText('Jouer à Flag or Not'));
    expect(mockPush).toHaveBeenCalledWith('/flagornot');
  });

  it('affiche le footer avec la version', () => {
    render(<HubPage />);
    expect(screen.getByText(/Red Flag Games/)).toBeDefined();
  });

  it('récupère les stats au montage', async () => {
    render(<HubPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stats/public');
    });
  });
});
