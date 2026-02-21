/**
 * @file Shimmer.test.tsx
 * @description Tests for Shimmer skeleton loading component.
 * Covers: rendering, aria attributes, custom dimensions, className.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Shimmer } from '@/components/ui/Shimmer';

describe('Shimmer', () => {
  it('rend un élément avec role status', () => {
    render(<Shimmer />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('affiche le label de chargement pour accessibilité', () => {
    render(<Shimmer />);
    expect(screen.getByLabelText('Chargement...')).toBeDefined();
  });

  it('accepte des dimensions personnalisées', () => {
    const { container } = render(<Shimmer width="200px" height="50px" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('50px');
  });

  it('accepte un className personnalisé', () => {
    const { container } = render(<Shimmer className="custom-class" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('custom-class');
  });
});
