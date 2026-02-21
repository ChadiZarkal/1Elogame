import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DuelInterface } from '../DuelInterface';

const mockElementA = { id: 'a1', texte: 'Ghoster après le date', categorie: 'sexe' };
const mockElementB = { id: 'b1', texte: 'Jouer aux jeux 10h', categorie: 'lifestyle' };

describe('DuelInterface', () => {
  it('renders both element texts', () => {
    render(
      <DuelInterface elementA={mockElementA} elementB={mockElementB} onVote={vi.fn()} />
    );
    expect(screen.getByText('Ghoster après le date')).toBeInTheDocument();
    expect(screen.getByText('Jouer aux jeux 10h')).toBeInTheDocument();
  });

  it('renders category labels from config', () => {
    render(
      <DuelInterface elementA={mockElementA} elementB={mockElementB} onVote={vi.fn()} />
    );
    // CategoryBadge renders labelFr from categories config
    expect(screen.getByText('Sexe & Kinks')).toBeInTheDocument();
    expect(screen.getByText('Lifestyle')).toBeInTheDocument();
  });

  it('renders VS divider', () => {
    render(
      <DuelInterface elementA={mockElementA} elementB={mockElementB} onVote={vi.fn()} />
    );
    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('calls onVote with A as winner after delay', async () => {
    vi.useFakeTimers();
    const onVote = vi.fn();
    render(
      <DuelInterface elementA={mockElementA} elementB={mockElementB} onVote={onVote} />
    );

    fireEvent.click(screen.getByText('Ghoster après le date'));
    expect(onVote).not.toHaveBeenCalled();

    vi.advanceTimersByTime(350);
    expect(onVote).toHaveBeenCalledWith('a1', 'b1');

    vi.useRealTimers();
  });

  it('calls onVote with B as winner after delay', async () => {
    vi.useFakeTimers();
    const onVote = vi.fn();
    render(
      <DuelInterface elementA={mockElementA} elementB={mockElementB} onVote={onVote} />
    );

    fireEvent.click(screen.getByText('Jouer aux jeux 10h'));
    vi.advanceTimersByTime(350);
    expect(onVote).toHaveBeenCalledWith('b1', 'a1');

    vi.useRealTimers();
  });

  it('does not call onVote when disabled', () => {
    const onVote = vi.fn();
    render(
      <DuelInterface elementA={mockElementA} elementB={mockElementB} onVote={onVote} disabled />
    );

    fireEvent.click(screen.getByText('Ghoster après le date'));
    expect(onVote).not.toHaveBeenCalled();
  });

  it('renders two buttons', () => {
    render(
      <DuelInterface elementA={mockElementA} elementB={mockElementB} onVote={vi.fn()} />
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('disables buttons when disabled prop is true', () => {
    render(
      <DuelInterface elementA={mockElementA} elementB={mockElementB} onVote={vi.fn()} disabled />
    );
    screen.getAllByRole('button').forEach(btn => expect(btn).toBeDisabled());
  });
});
