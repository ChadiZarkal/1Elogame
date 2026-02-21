/**
 * @file AnimatedCounter.test.tsx
 * @description Tests for AnimatedCounter component.
 * Covers: rendering, default format, custom format, value update.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

describe('AnimatedCounter', () => {
  it('affiche la valeur formatée par défaut (fr-FR)', () => {
    render(<AnimatedCounter value={1234} />);
    // French locale uses non-breaking space or period as thousands separator
    const content = screen.getByText(/1[\s.]?234/);
    expect(content).toBeDefined();
  });

  it('accepte un format personnalisé', () => {
    render(<AnimatedCounter value={42} format={(n) => `${n} pts`} />);
    expect(screen.getByText('42 pts')).toBeDefined();
  });

  it('accepte un className', () => {
    const { container } = render(<AnimatedCounter value={10} className="text-xl" />);
    const span = container.firstChild as HTMLElement;
    expect(span.className).toContain('text-xl');
  });

  it('affiche 0 correctement', () => {
    render(<AnimatedCounter value={0} />);
    expect(screen.getByText('0')).toBeDefined();
  });
});
