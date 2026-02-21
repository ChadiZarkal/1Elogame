/**
 * @file AllDuelsExhausted.test.tsx
 * @description Tests for AllDuelsExhausted end-of-game component.
 * Covers: rendering, duel count, reset callback, share, navigation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AllDuelsExhausted } from '@/components/game/AllDuelsExhausted';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('AllDuelsExhausted', () => {
  const onReset = vi.fn();

  it('affiche le nombre de duels joués', () => {
    render(<AllDuelsExhausted duelCount={42} onReset={onReset} />);
    expect(screen.getByText(/42 duels/)).toBeDefined();
  });

  it('affiche le titre de félicitations', () => {
    render(<AllDuelsExhausted duelCount={10} onReset={onReset} />);
    expect(screen.getByText('Incroyable !')).toBeDefined();
  });

  it('appelle onReset quand on clique Recommencer', () => {
    render(<AllDuelsExhausted duelCount={10} onReset={onReset} />);
    fireEvent.click(screen.getByText(/Recommencer/));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('navigue vers le classement', () => {
    render(<AllDuelsExhausted duelCount={10} onReset={onReset} />);
    fireEvent.click(screen.getByText(/classement/i));
    expect(mockPush).toHaveBeenCalledWith('/classement');
  });

  it('affiche le bouton de partage', () => {
    render(<AllDuelsExhausted duelCount={10} onReset={onReset} />);
    expect(screen.getByText(/Partager/)).toBeDefined();
  });

  it('copie dans le presse-papier si Web Share non disponible', () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: writeMock } });

    render(<AllDuelsExhausted duelCount={5} onReset={onReset} />);
    fireEvent.click(screen.getByText(/Partager/));

    expect(writeMock).toHaveBeenCalled();
  });
});
