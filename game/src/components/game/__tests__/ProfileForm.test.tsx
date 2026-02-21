/**
 * @file ProfileForm.test.tsx
 * @description Tests for ProfileForm — sex/age selection, validation, store mutation, navigation.
 * Covers: sex buttons, age buttons, validation error, submit, navigation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileForm } from '@/components/game/ProfileForm';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/jeu',
  useSearchParams: () => new URLSearchParams(),
}));

const mockSetProfile = vi.fn();
vi.mock('@/stores/gameStore', () => ({
  useGameStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setProfile: mockSetProfile }),
}));

vi.mock('@/components/ui/AnimatedBackground', () => ({
  AnimatedBackground: () => null,
}));

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche les 3 options de sexe', () => {
    render(<ProfileForm />);
    expect(screen.getByLabelText('Homme')).toBeDefined();
    expect(screen.getByLabelText('Femme')).toBeDefined();
    expect(screen.getByLabelText('Autre')).toBeDefined();
  });

  it('affiche les 4 options d\'âge', () => {
    render(<ProfileForm />);
    expect(screen.getByLabelText('16-18 ans')).toBeDefined();
    expect(screen.getByLabelText('19-22 ans')).toBeDefined();
    expect(screen.getByLabelText('23-26 ans')).toBeDefined();
    expect(screen.getByLabelText('27+ ans')).toBeDefined();
  });

  it('affiche une erreur si on soumet sans sélectionner de sexe', () => {
    render(<ProfileForm />);
    fireEvent.click(screen.getByText(/Sélectionne sexe/));
    expect(screen.getByText(/Sélectionne ton sexe/)).toBeDefined();
  });

  it('affiche une erreur si on soumet sans sélectionner d\'âge', () => {
    render(<ProfileForm />);
    // Select sex first
    fireEvent.click(screen.getByLabelText('Homme'));
    // Button still says "Sélectionne sexe + âge" since age is not selected
    fireEvent.click(screen.getByText(/Sélectionne sexe/));
    expect(screen.getByText(/Sélectionne ton âge/)).toBeDefined();
  });

  it('appelle setProfile et navigue quand le formulaire est valide', () => {
    render(<ProfileForm />);
    fireEvent.click(screen.getByLabelText('Femme'));
    fireEvent.click(screen.getByLabelText('19-22 ans'));
    fireEvent.click(screen.getByText(/C'EST PARTI/));

    expect(mockSetProfile).toHaveBeenCalledWith({ sex: 'femme', age: '19-22' });
    expect(mockPush).toHaveBeenCalledWith('/jeu/jouer');
  });

  it('navigue vers l\'accueil au clic sur le bouton retour', () => {
    render(<ProfileForm />);
    fireEvent.click(screen.getByText(/Accueil/));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('affiche le CTA "C\'EST PARTI" quand sexe et âge sont sélectionnés', () => {
    render(<ProfileForm />);
    fireEvent.click(screen.getByLabelText('Homme'));
    fireEvent.click(screen.getByLabelText('23-26 ans'));
    expect(screen.getByText(/C'EST PARTI/)).toBeDefined();
  });

  it('affiche les instructions "Comment ça marche"', () => {
    render(<ProfileForm />);
    expect(screen.getByText(/Comment ça marche/)).toBeDefined();
    expect(screen.getByText('Choisis')).toBeDefined();
    expect(screen.getByText('Compare')).toBeDefined();
    expect(screen.getByText('Enchaîne')).toBeDefined();
  });
});
