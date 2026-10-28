/**
 * @file popunderApres.test.tsx
 * @description Le pop-under des jeux ne se charge qu'à partir du nombre de
 * tours voulu, y compris sur `/jeu/jouer`, route exclue des encarts.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

let pathname = '/flagornot';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

const { garde } = vi.hoisted(() => ({ garde: { armements: 0 } }));
vi.mock('../gardePopunder', () => ({
  armerPopunder: () => { garde.armements += 1; },
  desarmerPopunder: () => {},
}));

import { DIXMAIS_POPUNDER_TOUS_LES, JEUX_POPUNDER, POPUNDER_APRES } from '@/config/ads';
import { usePopunderApres, usePopunderTousLes } from '../usePopunderApres';

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

  it('garde les seuils demandés : Oracle 4, Pire des deux 10, 10 mais tous les 2', () => {
    expect(POPUNDER_APRES).toEqual({ oracle: 4, pireDesDeux: 10 });
    expect(DIXMAIS_POPUNDER_TOUS_LES).toBe(2);
  });
});

describe('usePopunderTousLes', () => {
  beforeEach(() => {
    garde.armements = 0;
  });
  afterEach(() => {
    document.querySelectorAll(`script[src="${JEUX_POPUNDER.src}"]`).forEach((s) => s.remove());
    garde.armements = 0;
  });

  // « C'est un 10 mais… » : une pub au verdict du 2e profil, du 4e, du 6e.
  it('arme au 2e, au 4e et au 6e profil, pas entre', () => {
    const { rerender } = renderHook(({ tours }) => usePopunderTousLes(tours, 2), {
      initialProps: { tours: 0 },
    });
    const armementsApres: number[] = [];
    for (let profils = 1; profils <= 6; profils++) {
      rerender({ tours: profils });
      armementsApres.push(garde.armements);
    }
    // Profils 1 à 6 → armements cumulés.
    expect(armementsApres).toEqual([0, 1, 1, 2, 2, 3]);
    expect(popunderCharge()).toBe(1);
  });

  it('ne charge rien avant le 2e profil', () => {
    renderHook(() => usePopunderTousLes(1, 2));
    expect(popunderCharge()).toBe(0);
    expect(garde.armements).toBe(0);
  });
});
