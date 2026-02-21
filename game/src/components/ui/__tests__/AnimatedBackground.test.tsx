/**
 * @file AnimatedBackground.test.tsx
 * @description Tests for AnimatedBackground — aria-hidden, variants, className.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

describe('AnimatedBackground', () => {
  it('est caché pour les lecteurs d\'écran (aria-hidden)', () => {
    const { container } = render(<AnimatedBackground />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('est un élément non-interactif (pointer-events-none)', () => {
    const { container } = render(<AnimatedBackground />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('pointer-events-none');
  });

  it('accepte un className personnalisé', () => {
    const { container } = render(<AnimatedBackground className="custom-bg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('custom-bg');
  });

  it('rend 3 orbs de gradient (+ noise overlay)', () => {
    const { container } = render(<AnimatedBackground />);
    const root = container.firstChild as HTMLElement;
    // 3 motion.div orbs + 1 noise div = 4 children
    expect(root.children.length).toBe(4);
  });

  it('accepte les variants subtle, default, intense', () => {
    // Just ensure no crash on each variant
    const { unmount: u1 } = render(<AnimatedBackground variant="subtle" />);
    u1();
    const { unmount: u2 } = render(<AnimatedBackground variant="intense" />);
    u2();
    const { container } = render(<AnimatedBackground variant="default" />);
    expect(container.firstChild).toBeDefined();
  });
});
