/**
 * @file ResultDisplay.test.tsx
 * @description Tests for ResultDisplay — result percentages, feedback buttons, streak, auto-advance.
 * Covers: card rendering, star/thumbs/share buttons, streak display, VS divider.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ResultDisplay } from '@/components/game/ResultDisplay';
import type { VoteResult, Duel } from '@/types/game';

// Mock canvas-confetti (dynamic import)
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

// Mock formatNumber from utils
vi.mock('@/lib/utils', () => ({
  formatNumber: (n: number) => String(n),
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

const makeDuel = (): Duel => ({
  elementA: { id: 'a', texte: 'Être possessif', categorie: 'sexe' },
  elementB: { id: 'b', texte: 'Être jaloux', categorie: 'sexe' },
});

const makeResult = (winnerPct = 65): VoteResult => ({
  winner: { id: 'a', percentage: winnerPct, participations: 100 },
  loser: { id: 'b', percentage: 100 - winnerPct, participations: 80 },
  streak: { matched: true, current: 3 },
  isOptimistic: false,
});

describe('ResultDisplay', () => {
  const onNext = vi.fn();
  const onStar = vi.fn();
  const onThumbsUp = vi.fn();
  const onThumbsDown = vi.fn();

  const defaultProps = {
    duel: makeDuel(),
    result: makeResult(),
    streak: 3,
    streakEmoji: '🔥',
    onNext,
    onStar,
    onThumbsUp,
    onThumbsDown,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('affiche les textes des deux éléments', () => {
    render(<ResultDisplay {...defaultProps} />);
    expect(screen.getByText('Être possessif')).toBeDefined();
    expect(screen.getByText('Être jaloux')).toBeDefined();
  });

  it('affiche le séparateur VS', () => {
    render(<ResultDisplay {...defaultProps} />);
    expect(screen.getByText('VS')).toBeDefined();
  });

  it('affiche le badge PLUS RED FLAG pour le winner avec majority', () => {
    render(<ResultDisplay {...defaultProps} />);
    expect(screen.getByText('PLUS RED FLAG')).toBeDefined();
  });

  it('affiche le feedback après 400ms', () => {
    render(<ResultDisplay {...defaultProps} />);
    // Before timer
    expect(screen.queryByText(/Suivant/)).toBeNull();
    
    // Advance 400ms to show feedback
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByText(/Suivant/)).toBeDefined();
  });

  it('affiche les boutons star, thumbs up, thumbs down, partage', () => {
    render(<ResultDisplay {...defaultProps} />);
    act(() => { vi.advanceTimersByTime(400); });
    
    expect(screen.getByLabelText(/Voter pour ce duel/)).toBeDefined();
    expect(screen.getByLabelText(/J'aime ce duel/)).toBeDefined();
    expect(screen.getByLabelText(/Je n'aime pas ce duel/)).toBeDefined();
    expect(screen.getByLabelText(/Partager ce duel/)).toBeDefined();
  });

  it('appelle onStar au clic sur le bouton étoile', () => {
    render(<ResultDisplay {...defaultProps} />);
    act(() => { vi.advanceTimersByTime(400); });
    
    fireEvent.click(screen.getByLabelText(/Voter pour ce duel/));
    expect(onStar).toHaveBeenCalledTimes(1);
  });

  it('désactive le bouton star après un clic', () => {
    render(<ResultDisplay {...defaultProps} />);
    act(() => { vi.advanceTimersByTime(400); });
    
    fireEvent.click(screen.getByLabelText(/Voter pour ce duel/));
    fireEvent.click(screen.getByLabelText(/Duel déjà noté/));
    // Should only call once
    expect(onStar).toHaveBeenCalledTimes(1);
  });

  it('appelle onThumbsUp et onThumbsDown', () => {
    render(<ResultDisplay {...defaultProps} />);
    act(() => { vi.advanceTimersByTime(400); });
    
    fireEvent.click(screen.getByLabelText(/J'aime/));
    fireEvent.click(screen.getByLabelText(/Je n'aime pas/));
    expect(onThumbsUp).toHaveBeenCalledTimes(1);
    expect(onThumbsDown).toHaveBeenCalledTimes(1);
  });

  it('appelle onNext au clic sur Suivant', () => {
    render(<ResultDisplay {...defaultProps} />);
    act(() => { vi.advanceTimersByTime(400); });
    
    fireEvent.click(screen.getByText(/Suivant/));
    expect(onNext).toHaveBeenCalled();
  });

  it('affiche le streak quand > 0', () => {
    render(<ResultDisplay {...defaultProps} />);
    act(() => { vi.advanceTimersByTime(400); });
    
    expect(screen.getByText(/Streak: 3/)).toBeDefined();
  });

  it('auto-avance après 4 secondes', () => {
    render(<ResultDisplay {...defaultProps} />);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(onNext).toHaveBeenCalled();
  });

  it('affiche "Bien vu" pour une réponse correcte', () => {
    render(<ResultDisplay {...defaultProps} />);
    expect(screen.getByText(/Bien vu/)).toBeDefined();
  });

  it('affiche "Raté" pour une mauvaise réponse', () => {
    const wrongResult = makeResult(40); // user chose a, but a only has 40%
    render(<ResultDisplay {...defaultProps} result={wrongResult} />);
    expect(screen.getByText(/Raté/)).toBeDefined();
  });
});
