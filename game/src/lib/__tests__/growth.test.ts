import { describe, expect, it } from 'vitest';
import {
  byMonth,
  byWeek,
  formatVariation,
  movingAverage,
  summarize,
  tailSum,
  trendLine,
  variation,
  type DailyPoint,
} from '@/lib/growth';

/** Série de test : un jour, une valeur pour la source `votes`. */
function serie(depuis: string, votes: number[]): DailyPoint[] {
  const d = new Date(`${depuis}T00:00:00Z`);
  return votes.map((v, i) => {
    const jour = new Date(d);
    jour.setUTCDate(jour.getUTCDate() + i);
    return { jour: jour.toISOString().slice(0, 10), votes: v, oracle: 0, sessions: 0, dixmais: 0 };
  });
}

describe('movingAverage', () => {
  it('lisse sur la fenêtre demandée', () => {
    expect(movingAverage([1, 2, 3, 4], 2)).toEqual([null, 1.5, 2.5, 3.5]);
  });

  // Une moyenne calculée sur trois jours au milieu d'une courbe lissée sur sept
  // serait plus nerveuse que le reste et se lirait comme une vraie variation.
  it('ne rend rien tant que la fenêtre n’est pas pleine', () => {
    expect(movingAverage([5, 5, 5], 7)).toEqual([null, null, null]);
  });

  it('absorbe le cycle hebdomadaire', () => {
    // Deux semaines identiques : mêmes creux en semaine, mêmes pics le week-end.
    const semaine = [10, 10, 10, 10, 30, 40, 30];
    const lisse = movingAverage([...semaine, ...semaine], 7);
    // À partir du septième jour, la moyenne ne bouge plus d'un iota.
    const stables = lisse.slice(6).filter((v): v is number => v !== null);
    expect(new Set(stables.map((v) => v.toFixed(6))).size).toBe(1);
  });
});

describe('tailSum', () => {
  it('somme la fin de la série', () => {
    expect(tailSum([1, 2, 3, 4, 5], 2)).toBe(9);
  });

  it('sait reculer d’une période', () => {
    expect(tailSum([1, 2, 3, 4, 5], 2, 2)).toBe(5);
  });

  it('ne déborde pas sur une série plus courte que la fenêtre', () => {
    expect(tailSum([4], 30)).toBe(4);
  });
});

describe('variation', () => {
  it('compare deux périodes', () => {
    expect(variation(120, 100)).toBe(20);
    expect(variation(80, 100)).toBeCloseTo(-20);
  });

  // Passer de zéro à trois n'est pas « +300 % » : c'est un démarrage, et le
  // premier jour d'un jeu afficherait sinon la plus belle croissance du tableau.
  it('se tait quand la période précédente est vide', () => {
    expect(variation(3, 0)).toBeNull();
  });
});

describe('summarize', () => {
  it('rend le rythme quotidien et les deux comparaisons', () => {
    // Sept jours à 10, sept jours à 20, puis la journée en cours — écartée.
    const points = serie('2026-09-01', [...Array(7).fill(10), ...Array(7).fill(20), 5]);
    const r = summarize(points, 'votes');

    expect(r.parJour7).toBe(20);
    expect(r.variation7).toBe(100);
    expect(r.total).toBe(215);
  });

  it('ne compare pas sur trente jours quand l’historique manque', () => {
    const r = summarize(serie('2026-09-01', [5, 5, 5]), 'votes');
    expect(r.variation30).toBeNull();
  });
});

describe('byWeek', () => {
  // Le 2026-09-07 est un lundi.
  it('regroupe du lundi au dimanche', () => {
    const points = serie('2026-09-07', Array(14).fill(1));
    const semaines = byWeek(points, 'votes');

    expect(semaines).toHaveLength(2);
    expect(semaines[0].debut).toBe('2026-09-07');
    expect(semaines[0].total).toBe(7);
    expect(semaines[1].debut).toBe('2026-09-14');
  });

  it('rattache un début de série au lundi qui le précède', () => {
    // 2026-09-10 est un jeudi : sa semaine commence le 7.
    const semaines = byWeek(serie('2026-09-10', [1, 1]), 'votes');
    expect(semaines[0].debut).toBe('2026-09-07');
  });

  it('compare chaque semaine à la précédente', () => {
    const points = [...serie('2026-09-07', Array(7).fill(1)), ...serie('2026-09-14', Array(7).fill(2))];
    const semaines = byWeek(points, 'votes');
    expect(semaines[0].variation).toBeNull();
    expect(semaines[1].variation).toBe(100);
  });

  // Une semaine entamée est forcément plus basse : la marquer évite de lire
  // une chute chaque lundi matin.
  it('marque la dernière semaine comme en cours', () => {
    const semaines = byWeek(serie('2026-09-07', Array(10).fill(1)), 'votes');
    expect(semaines.at(-1)!.enCours).toBe(true);
    expect(semaines[0].enCours).toBe(false);
  });
});

describe('byMonth', () => {
  it('regroupe par mois calendaire et nomme le mois', () => {
    const points = [...serie('2026-08-30', [1, 1]), ...serie('2026-09-01', [2, 2, 2])];
    const mois = byMonth(points, 'votes');

    expect(mois).toHaveLength(2);
    expect(mois[0].label).toBe('août');
    expect(mois[0].total).toBe(2);
    expect(mois[1].label).toBe('septembre');
    expect(mois[1].total).toBe(6);
    expect(mois[1].variation).toBe(200);
    expect(mois[1].enCours).toBe(true);
  });
});

describe('formatVariation', () => {
  it('signe, arrondit, et sait dire qu’il ne sait pas', () => {
    expect(formatVariation(12.4)).toBe('+12 %');
    expect(formatVariation(-4.6)).toBe('−5 %');
    expect(formatVariation(0.2)).toBe('stable');
    expect(formatVariation(null)).toBe('—');
  });
});

describe('journée en cours', () => {
  // Au milieu de l'après-midi, le jour courant vaut la moitié d'une journée
  // normale : le compter tirerait la moyenne vers le bas et inventerait un
  // recul. D'autant plus visible que le trafic réel va de 0 à 136 votes.
  it('n’entre pas dans les moyennes', () => {
    // Huit jours pleins à 10, puis une journée en cours à 1.
    const points = serie('2026-09-08', [...Array(8).fill(10), 1]);
    const r = summarize(points, 'votes');

    expect(r.parJour7).toBe(10);
    // Le total, lui, compte tout ce qui est arrivé.
    expect(r.total).toBe(81);
  });

  it('ne fait pas plonger la ligne de tendance', () => {
    const valeurs = [...Array(8).fill(10), 0];
    const ligne = trendLine(valeurs);

    expect(ligne.at(-1)).toBeNull();
    expect(ligne.at(-2)).toBe(10);
  });

  it('invente un recul si on l’oublie', () => {
    // Le même jeu de données, journée en cours comprise : la démonstration de
    // ce que le garde-fou évite.
    const valeurs = [...Array(8).fill(10), 1];
    expect(movingAverage(valeurs).at(-1)).toBeLessThan(10);
  });
});
