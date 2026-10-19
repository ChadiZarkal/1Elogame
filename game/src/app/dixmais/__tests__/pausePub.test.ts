import { describe, expect, it } from 'vitest';
import { DIXMAIS_PAUSE, DIXMAIS_PAUSE_TOUS_LES, pauseDixmaisDue } from '@/config/ads';

describe('pause publicitaire de « C’est un 10 mais… »', () => {
  it('tombe tous les cinq profils, jamais avant', () => {
    expect(DIXMAIS_PAUSE_TOUS_LES).toBe(5);
    expect([0, 1, 2, 3, 4].some(pauseDixmaisDue)).toBe(false);
    expect(pauseDixmaisDue(5)).toBe(true);
    expect([6, 7, 8, 9].some(pauseDixmaisDue)).toBe(false);
    expect(pauseDixmaisDue(10)).toBe(true);
  });

  it('utilise l’encart natif', () => {
    expect(DIXMAIS_PAUSE.containerId).toMatch(/^container-/);
    expect(DIXMAIS_PAUSE.src).toMatch(/^https:\/\//);
  });
});
