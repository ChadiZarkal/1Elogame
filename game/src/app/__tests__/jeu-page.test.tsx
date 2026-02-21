/**
 * @file jeu-page.test.tsx
 * @description Tests for JeuPage — renders ProfileForm, clears profile on mount.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import JeuPage from '@/app/jeu/page';

const mockClearProfile = vi.fn();
const mockSetProfile = vi.fn();

const storeState = { clearProfile: mockClearProfile, setProfile: mockSetProfile };

vi.mock('@/stores/gameStore', () => ({
  useGameStore: (selector?: (s: Record<string, unknown>) => unknown) =>
    selector ? selector(storeState) : storeState,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/jeu',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/ui/AnimatedBackground', () => ({
  AnimatedBackground: () => null,
}));

describe('JeuPage', () => {
  it('affiche le formulaire de profil', () => {
    render(<JeuPage />);
    // ProfileForm renders sex and age selection
    expect(screen.getByText('Sexe')).toBeDefined();
    expect(screen.getByText('Âge')).toBeDefined();
  });

  it('appelle clearProfile au montage', () => {
    render(<JeuPage />);
    expect(mockClearProfile).toHaveBeenCalled();
  });

  it('affiche les options de sexe', () => {
    render(<JeuPage />);
    expect(screen.getByLabelText('Homme')).toBeDefined();
    expect(screen.getByLabelText('Femme')).toBeDefined();
    expect(screen.getByLabelText('Autre')).toBeDefined();
  });
});
