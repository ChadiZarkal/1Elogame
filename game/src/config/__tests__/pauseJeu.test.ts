/**
 * @file pauseJeu.test.ts
 * @description « Le pire des deux » : la pause publicitaire tombe tous les cinq
 * duels, et jamais sur le dernier d'une partie, qui mène au récap (lui-même
 * porteur d'un encart).
 */

import { describe, it, expect } from 'vitest';
import { JEU_PAUSE_TOUS_LES, pauseJeuDue } from '@/config/ads';

describe('pauseJeuDue', () => {
  it('tombe tous les cinq duels', () => {
    expect(JEU_PAUSE_TOUS_LES).toBe(5);
    const pauses = Array.from({ length: 20 }, (_, i) => i + 1).filter((n) => pauseJeuDue(n));
    expect(pauses).toEqual([5, 10, 15, 20]);
  });

  it('ne tombe pas avant le premier duel', () => {
    expect(pauseJeuDue(0)).toBe(false);
  });

  it('saute le dernier duel de la partie', () => {
    // Partie de 10 : pause après le 5e, pas après le 10e (le récap suit).
    expect(pauseJeuDue(5, 10)).toBe(true);
    expect(pauseJeuDue(10, 10)).toBe(false);
  });
});
