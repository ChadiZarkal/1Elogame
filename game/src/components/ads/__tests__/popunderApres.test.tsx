/**
 * @file popunderApres.test.tsx
 * @description Le pop-under des jeux ne se charge qu'à partir du nombre de
 * tours voulu, y compris sur `/jeu/jouer`, route exclue des encarts.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

let pathname = '/flagornot';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

import { JEUX_POPUNDER, POPUNDER_APRES } from '@/config/ads';
import { usePopunderApres } from '../usePopunderApres';

function popunderCharge() {
  return document.querySelectorAll(`script[src="${JEUX_POPUNDER.src}"]`).length;
}

describe('usePopunderApres', () => {
  afterEach(() => {
    document.querySelectorAll(`script[src="${JEUX_POPUNDER.src}"]`).forEach((s) => s.remove());
    pathname = '/flagornot';
  });

  it('ne charge rien avant le seuil, puis arme le pop-under', () => {
    const { rerender } = renderHook(({ tours }) => usePopunderApres(tours, POPUNDER_APRES.oracle), {
      initialProps: { tours: POPUNDER_APRES.oracle - 1 },
    });
    expect(popunderCharge()).toBe(0);

    rerender({ tours: POPUNDER_APRES.oracle });
    expect(popunderCharge()).toBe(1);
  });

  it('se désarme quand le compteur retombe (nouvelle partie)', () => {
    const { rerender } = renderHook(({ tours }) => usePopunderApres(tours, 3), {
      initialProps: { tours: 3 },
    });
    expect(popunderCharge()).toBe(1);

    rerender({ tours: 0 });
    expect(popunderCharge()).toBe(0);
  });

  it('s’arme aussi sur l’écran des duels, exclu des encarts', () => {
    pathname = '/jeu/jouer';
    renderHook(() => usePopunderApres(10, POPUNDER_APRES.pireDesDeux));
    expect(popunderCharge()).toBe(1);
  });

  it('garde les seuils demandés : Oracle 4, Pire des deux 10, 10 mais 3', () => {
    expect(POPUNDER_APRES).toEqual({ oracle: 4, pireDesDeux: 10, dixmais: 3 });
  });
});
