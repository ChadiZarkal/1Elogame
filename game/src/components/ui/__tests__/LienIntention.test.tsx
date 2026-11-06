/**
 * @file LienIntention.test.tsx
 * @description Le lien ne précharge rien tant que le visiteur ne montre pas
 * d'intention (toucher, survol, focus) ; ensuite, il rend la main au
 * comportement par défaut de Next.
 */

import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const { appels } = vi.hoisted(() => ({ appels: [] as unknown[] }));

vi.mock('next/link', () => ({
  default: ({ prefetch, children, ...props }: { prefetch?: unknown; children: React.ReactNode; [k: string]: unknown }) => {
    appels.push(prefetch);
    return <a {...props}>{children}</a>;
  },
}));

import LienIntention from '../LienIntention';

const dernier = () => appels[appels.length - 1];

describe('LienIntention', () => {
  it('ne précharge pas à l’affichage', () => {
    render(<LienIntention href="/jeu">Jouer</LienIntention>);
    expect(dernier()).toBe(false);
  });

  it.each([
    ['toucher', (el: HTMLElement) => fireEvent.touchStart(el)],
    ['survol', (el: HTMLElement) => fireEvent.mouseEnter(el)],
    ['focus', (el: HTMLElement) => fireEvent.focus(el)],
  ])('précharge dès l’intention (%s)', (_, geste) => {
    render(<LienIntention href="/jeu">Jouer</LienIntention>);
    geste(screen.getByText('Jouer'));
    // `null` : le comportement par défaut de Next, qui précharge.
    expect(dernier()).toBeNull();
  });

  it('garde les gestionnaires passés par l’appelant', () => {
    const survol = vi.fn();
    render(<LienIntention href="/jeu" onMouseEnter={survol}>Jouer</LienIntention>);
    fireEvent.mouseEnter(screen.getByText('Jouer'));
    expect(survol).toHaveBeenCalledOnce();
  });

  it('respecte un prefetch explicite', () => {
    render(<LienIntention href="/jeu" prefetch>Jouer</LienIntention>);
    expect(dernier()).toBe(true);
  });
});
