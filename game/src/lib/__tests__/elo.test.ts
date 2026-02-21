import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ELO,
  calculateNewELO,
  estimatePercentage,
  getEloDifference,
  isCloseElo,
  getKFactor,
  didMatchMajority,
  getEloFieldForSex,
  getEloFieldForAge,
  getParticipationFieldForSex,
  getParticipationFieldForAge,
} from '@/lib/elo';

describe('Constantes ELO', () => {
  it('ELO par défaut est 1000', () => {
    expect(DEFAULT_ELO).toBe(1000);
  });
});

describe('estimatePercentage (wraps calculateExpectedScore)', () => {
  it('ELO identiques → 50%', () => {
    expect(estimatePercentage(1000, 1000)).toBe(50);
  });

  it('ELO supérieur → > 50%', () => {
    expect(estimatePercentage(1200, 1000)).toBeGreaterThan(50);
  });

  it('ELO inférieur → < 50%', () => {
    expect(estimatePercentage(800, 1000)).toBeLessThan(50);
  });

  it('résultat entre 0 et 100', () => {
    const pct = estimatePercentage(500, 2000);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  it('est symétrique : pct(A,B) + pct(B,A) ≈ 100', () => {
    const pA = estimatePercentage(1200, 1000);
    const pB = estimatePercentage(1000, 1200);
    expect(pA + pB).toBe(100);
  });
});

describe('calculateNewELO', () => {
  it('le gagnant gagne des points', () => {
    const { newWinnerELO } = calculateNewELO(1000, 1000);
    expect(newWinnerELO).toBeGreaterThan(1000);
  });

  it('le perdant perd des points', () => {
    const { newLoserELO } = calculateNewELO(1000, 1000);
    expect(newLoserELO).toBeLessThan(1000);
  });

  it('respecte le floor ELO de 100', () => {
    const { newLoserELO } = calculateNewELO(2000, 100, 64);
    expect(newLoserELO).toBeGreaterThanOrEqual(100);
  });

  it('la somme des changements est nulle pour des ELO égaux', () => {
    const { newWinnerELO, newLoserELO } = calculateNewELO(1000, 1000);
    const winnerDelta = newWinnerELO - 1000;
    const loserDelta = newLoserELO - 1000;
    expect(Math.abs(winnerDelta + loserDelta)).toBeLessThanOrEqual(1); // Rounding
  });

  it('utilise le K-factor fourni', () => {
    const low = calculateNewELO(1000, 1000, 8);
    const high = calculateNewELO(1000, 1000, 64);
    expect(high.newWinnerELO - 1000).toBeGreaterThan(low.newWinnerELO - 1000);
  });
});

describe('getEloDifference', () => {
  it('renvoie la valeur absolue', () => {
    expect(getEloDifference(1200, 1000)).toBe(200);
    expect(getEloDifference(1000, 1200)).toBe(200);
  });

  it('0 pour des ELO identiques', () => {
    expect(getEloDifference(1000, 1000)).toBe(0);
  });
});

describe('isCloseElo', () => {
  it('200 est dans la plage [50, 300]', () => {
    expect(isCloseElo(200)).toBe(true);
  });

  it('30 est en dessous de la plage', () => {
    expect(isCloseElo(30)).toBe(false);
  });

  it('400 est au-dessus de la plage', () => {
    expect(isCloseElo(400)).toBe(false);
  });

  it('50 est la borne inférieure (inclus)', () => {
    expect(isCloseElo(50)).toBe(true);
  });

  it('300 est la borne supérieure (inclus)', () => {
    expect(isCloseElo(300)).toBe(true);
  });

  it('accepte des bornes personnalisées', () => {
    expect(isCloseElo(10, 5, 15)).toBe(true);
    expect(isCloseElo(20, 5, 15)).toBe(false);
  });
});

describe('getKFactor', () => {
  it('< 30 participations → K=40', () => {
    expect(getKFactor(0)).toBe(40);
    expect(getKFactor(29)).toBe(40);
  });

  it('30-99 participations → K=32', () => {
    expect(getKFactor(30)).toBe(32);
    expect(getKFactor(99)).toBe(32);
  });

  it('>= 100 participations → K=24', () => {
    expect(getKFactor(100)).toBe(24);
    expect(getKFactor(1000)).toBe(24);
  });
});

describe('didMatchMajority', () => {
  it('true quand le gagnant a un ELO plus élevé', () => {
    expect(didMatchMajority(1200, 1000)).toBe(true);
  });

  it('true quand les ELO sont égaux', () => {
    expect(didMatchMajority(1000, 1000)).toBe(true);
  });

  it('false quand le gagnant a un ELO plus bas', () => {
    expect(didMatchMajority(800, 1000)).toBe(false);
  });
});

describe('getEloFieldForSex', () => {
  it('homme → elo_homme', () => {
    expect(getEloFieldForSex('homme')).toBe('elo_homme');
  });

  it('femme → elo_femme', () => {
    expect(getEloFieldForSex('femme')).toBe('elo_femme');
  });

  it('autre → elo_autre', () => {
    expect(getEloFieldForSex('autre')).toBe('elo_autre');
  });
});

describe('getEloFieldForAge', () => {
  it('mappe correctement chaque tranche d\'âge', () => {
    expect(getEloFieldForAge('16-18')).toBe('elo_16_18');
    expect(getEloFieldForAge('19-22')).toBe('elo_19_22');
    expect(getEloFieldForAge('23-26')).toBe('elo_23_26');
    expect(getEloFieldForAge('27+')).toBe('elo_27plus');
  });
});

describe('getParticipationFieldForSex', () => {
  it('mappe correctement', () => {
    expect(getParticipationFieldForSex('homme')).toBe('nb_participations_homme');
    expect(getParticipationFieldForSex('femme')).toBe('nb_participations_femme');
    expect(getParticipationFieldForSex('autre')).toBe('nb_participations_autre');
  });
});

describe('getParticipationFieldForAge', () => {
  it('mappe correctement', () => {
    expect(getParticipationFieldForAge('16-18')).toBe('nb_participations_16_18');
    expect(getParticipationFieldForAge('19-22')).toBe('nb_participations_19_22');
    expect(getParticipationFieldForAge('23-26')).toBe('nb_participations_23_26');
    expect(getParticipationFieldForAge('27+')).toBe('nb_participations_27plus');
  });
});
