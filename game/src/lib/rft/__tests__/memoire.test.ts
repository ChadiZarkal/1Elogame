import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DELAI_APRES_ECHEC_MS, memoriser } from '@/lib/rft/memoire';

describe('memoriser', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ne relit pas la source avant la fin de la période', async () => {
    const charger = vi.fn().mockResolvedValue('questionnaire');
    const lire = memoriser(60_000, charger);

    expect(await lire()).toBe('questionnaire');
    vi.advanceTimersByTime(59_000);
    await lire();
    expect(charger).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2_000);
    await lire();
    expect(charger).toHaveBeenCalledTimes(2);
  });

  // Sous un pic, cent joueurs qui finissent dans la même seconde ne doivent
  // déclencher qu'une lecture.
  it('fait partager une seule lecture aux appels simultanés', async () => {
    const charger = vi.fn().mockResolvedValue(42);
    const lire = memoriser(60_000, charger);

    const valeurs = await Promise.all(Array.from({ length: 100 }, () => lire()));
    expect(valeurs.every((v) => v === 42)).toBe(true);
    expect(charger).toHaveBeenCalledTimes(1);
  });

  it("resert l'ancienne valeur si la relecture échoue", async () => {
    const charger = vi.fn()
      .mockResolvedValueOnce('v1')
      .mockRejectedValueOnce(new Error('base injoignable'))
      .mockResolvedValueOnce('v2');
    const lire = memoriser(1_000, charger);

    expect(await lire()).toBe('v1');
    vi.advanceTimersByTime(1_001);
    expect(await lire()).toBe('v1');

    // Pas de nouvelle tentative avant le délai : une base en panne ne reçoit
    // pas une requête par joueur.
    await lire();
    expect(charger).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(DELAI_APRES_ECHEC_MS + 1);
    expect(await lire()).toBe('v2');
  });

  it("fait remonter l'erreur quand il n'y a rien à resservir, puis retente après le délai", async () => {
    const charger = vi.fn()
      .mockRejectedValueOnce(new Error('base injoignable'))
      .mockResolvedValueOnce('enfin');
    const lire = memoriser(60_000, charger);

    await expect(lire()).rejects.toThrow('base injoignable');
    await expect(lire()).rejects.toThrow('base injoignable');
    expect(charger).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(DELAI_APRES_ECHEC_MS + 1);
    expect(await lire()).toBe('enfin');
  });

  it("relit la source après un oubli, et n'installe pas une lecture d'avant l'oubli", async () => {
    let finir: (v: string) => void = () => {};
    const charger = vi.fn()
      .mockImplementationOnce(() => new Promise<string>((r) => { finir = r; }))
      .mockResolvedValueOnce('après');
    const lire = memoriser(60_000, charger);

    const avant = lire();
    lire.oublier();
    finir('avant');
    expect(await avant).toBe('avant');

    expect(await lire()).toBe('après');
    expect(charger).toHaveBeenCalledTimes(2);
  });
});
