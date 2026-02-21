/**
 * @file CompactResult.test.tsx
 * @description Tests for CompactResult duel history component.
 * Covers: winner/loser display, percentage computation, correct/wrong indicator, streak.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompactResult } from '@/components/game/CompactResult';
import type { Duel, VoteResult } from '@/types/game';

const makeDuel = (): Duel => ({
  elementA: { id: 'a', texte: 'Être gentil', categorie: 'lifestyle' },
  elementB: { id: 'b', texte: 'Ghoster quelqu\'un', categorie: 'sexe' },
});

const makeResult = (winnerPercentage = 65, streak = 0): VoteResult => ({
  winner: { id: 'a', percentage: winnerPercentage, participations: 10 },
  loser: { id: 'b', percentage: 100 - winnerPercentage, participations: 8 },
  streak: { matched: true, current: streak },
});

describe('CompactResult', () => {
  it('affiche les deux éléments du duel', () => {
    render(<CompactResult duel={makeDuel()} result={makeResult()} index={0} />);
    expect(screen.getByText('Être gentil')).toBeDefined();
    expect(screen.getByText(/Ghoster/)).toBeDefined();
  });

  it('affiche les pourcentages', () => {
    render(<CompactResult duel={makeDuel()} result={makeResult(65)} index={0} />);
    expect(screen.getByText('65%')).toBeDefined();
    expect(screen.getByText('35%')).toBeDefined();
  });

  it('indique "Bien deviné" quand le joueur a raison (>= 50%)', () => {
    render(<CompactResult duel={makeDuel()} result={makeResult(65)} index={0} />);
    expect(screen.getByText(/Bien deviné/)).toBeDefined();
  });

  it('indique "Raté" quand le joueur a tort (< 50%)', () => {
    render(<CompactResult duel={makeDuel()} result={makeResult(45)} index={0} />);
    expect(screen.getByText(/Raté/)).toBeDefined();
  });

  it('affiche le streak si > 0', () => {
    render(<CompactResult duel={makeDuel()} result={makeResult(65, 5)} index={0} />);
    expect(screen.getByText(/Streak: 5/)).toBeDefined();
  });

  it('n\'affiche pas le streak si 0', () => {
    render(<CompactResult duel={makeDuel()} result={makeResult(65, 0)} index={0} />);
    expect(screen.queryByText(/Streak/)).toBeNull();
  });

  it('affiche VS entre les éléments', () => {
    render(<CompactResult duel={makeDuel()} result={makeResult()} index={0} />);
    expect(screen.getByText('VS')).toBeDefined();
  });
});
