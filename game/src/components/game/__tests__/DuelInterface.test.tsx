import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DuelInterface } from '../DuelInterface';

const mockElementA = { id: 'a1', texte: 'Ghoster après le date', categorie: 'sexe' };
const mockElementB = { id: 'b1', texte: 'Jouer aux jeux 10h', categorie: 'lifestyle' };

describe('DuelInterface', () => {
  it('should render both elements', () => {
    render(
      <DuelInterface
        elementA={mockElementA}
        elementB={mockElementB}
        onVote={vi.fn()}
      />
    );
    expect(screen.getByText('Ghoster après le date')).toBeInTheDocument();
    expect(screen.getByText('Jouer aux jeux 10h')).toBeInTheDocument();
  });

  it('should display categories', () => {
    render(
      <DuelInterface
        elementA={mockElementA}
        elementB={mockElementB}
        onVote={vi.fn()}
      />
    );
    expect(screen.getByText('sexe')).toBeInTheDocument();
    expect(screen.getByText('lifestyle')).toBeInTheDocument();
  });

  it('should render VS divider', () => {
    render(
      <DuelInterface
        elementA={mockElementA}
        elementB={mockElementB}
        onVote={vi.fn()}
      />
    );
    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('should call onVote with A as winner when clicking A', () => {
    const onVote = vi.fn();
    render(
      <DuelInterface
        elementA={mockElementA}
        elementB={mockElementB}
        onVote={onVote}
      />
    );

    fireEvent.click(screen.getByText('Ghoster après le date'));
    expect(onVote).toHaveBeenCalledWith('a1', 'b1');
  });

  it('should call onVote with B as winner when clicking B', () => {
    const onVote = vi.fn();
    render(
      <DuelInterface
        elementA={mockElementA}
        elementB={mockElementB}
        onVote={onVote}
      />
    );

    fireEvent.click(screen.getByText('Jouer aux jeux 10h'));
    expect(onVote).toHaveBeenCalledWith('b1', 'a1');
  });

  it('should not call onVote when disabled', () => {
    const onVote = vi.fn();
    render(
      <DuelInterface
        elementA={mockElementA}
        elementB={mockElementB}
        onVote={onVote}
        disabled
      />
    );

    fireEvent.click(screen.getByText('Ghoster après le date'));
    expect(onVote).not.toHaveBeenCalled();
  });

  it('should render two buttons', () => {
    render(
      <DuelInterface
        elementA={mockElementA}
        elementB={mockElementB}
        onVote={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('should disable buttons when disabled prop is true', () => {
    render(
      <DuelInterface
        elementA={mockElementA}
        elementB={mockElementB}
        onVote={vi.fn()}
        disabled
      />
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });
});
