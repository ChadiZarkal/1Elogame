import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakDisplay } from '../StreakDisplay';

describe('StreakDisplay', () => {
  it('should render nothing when streak=0 and duelCount=0', () => {
    const { container } = render(
      <StreakDisplay streak={0} streakEmoji="" duelCount={0} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('should render duel counter for first duel', () => {
    render(<StreakDisplay streak={0} streakEmoji="" duelCount={0} />);
    // Returns null, so no duel counter displayed
    expect(screen.queryByText('#1')).not.toBeInTheDocument();
  });

  it('should render duel counter when duelCount > 0', () => {
    render(<StreakDisplay streak={0} streakEmoji="" duelCount={5} />);
    expect(screen.getByText('#6')).toBeInTheDocument();
  });

  it('should render streak badge when streak > 0', () => {
    render(<StreakDisplay streak={3} streakEmoji="🔥" duelCount={5} />);
    expect(screen.getByText('3 🔥')).toBeInTheDocument();
  });

  it('should not render streak badge when streak is 0 but duelCount > 0', () => {
    render(<StreakDisplay streak={0} streakEmoji="" duelCount={3} />);
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
    // But duel counter should show
    expect(screen.getByText('#4')).toBeInTheDocument();
  });

  it('should render both streak and counter', () => {
    render(<StreakDisplay streak={5} streakEmoji="⚡" duelCount={10} />);
    expect(screen.getByText('5 ⚡')).toBeInTheDocument();
    expect(screen.getByText('#11')).toBeInTheDocument();
  });
});
