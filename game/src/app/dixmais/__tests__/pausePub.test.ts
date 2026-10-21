import { describe, expect, it } from 'vitest';
import { DIXMAIS_PAUSE, DIXMAIS_VERDICT, pauseDixmaisDue } from '@/config/ads';

describe('publicité de « C’est un 10 mais… »', () => {
  // Depuis le 2026-10-21 : le carré sur chaque verdict, plus de pause.
  it('affiche l’encart natif sur chaque verdict', () => {
    expect(DIXMAIS_VERDICT.enabled).toBe(true);
    expect(DIXMAIS_VERDICT.containerId).toMatch(/^container-/);
    expect(DIXMAIS_VERDICT.src).toMatch(/^https:\/\//);
  });

  it('n’ouvre plus la pause tous les cinq profils', () => {
    expect(DIXMAIS_PAUSE.enabled).toBe(false);
    expect([0, 5, 10, 15].some(pauseDixmaisDue)).toBe(false);
  });
});
