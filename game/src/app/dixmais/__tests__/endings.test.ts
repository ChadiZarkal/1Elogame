import { describe, expect, it } from 'vitest';
import {
  computeEnding,
  readTrajectory,
  severityGap,
  severityLine,
  type EndingContext,
  type PlayedStatement,
} from '../endings';

/** Fabrique un contexte de fin à partir des seules notes posées. */
function ctx(
  ratings: number[],
  options: {
    types?: ('positive' | 'negative')[];
    categories?: string[];
    community?: (number | null)[];
    ids?: string[];
  } = {},
): EndingContext {
  const played: PlayedStatement[] = ratings.map((_, i) => ({
    id: options.ids?.[i] ?? `s${i}`,
    text: `Phrase numéro ${i + 1}`,
    type: options.types?.[i] ?? 'negative',
    category: options.categories?.[i] ?? 'caractere',
  }));

  const deltas = ratings.map((r, i) => r - (i === 0 ? 10 : ratings[i - 1]));

  return {
    traj: readTrajectory(ratings),
    played,
    deltas,
    community: options.community ?? played.map(() => null),
  };
}

describe('computeEnding — variété', () => {
  // Le reproche fait à l'ancien écran : la manche se termine à zéro très
  // souvent, et « LE COUPERET » sortait alors systématiquement.
  it('ne resert pas la même fin sur deux éliminations consécutives de même forme', () => {
    const premiere = ctx([8, 6, 4, 0]);
    const seconde = ctx([8, 6, 4, 0], { ids: ['a', 'b', 'c', 'd'] });

    const une = computeEnding(premiere, []);
    const deux = computeEnding(seconde, [une.key]);

    expect(deux.key).not.toBe(une.key);
  });

  // Forme volontairement quelconque — deux phrases, chute de six points : elle
  // ne déclenche aucune observation précise et tombe donc sur les replis, ceux
  // qui produisaient la répétition.
  it('garde trois replis d’élimination, de quoi tourner sans se répéter', () => {
    const manche = ctx([6, 0]);
    const une = computeEnding(manche, []);
    const deux = computeEnding(manche, [une.key]);
    const trois = computeEnding(manche, [une.key, deux.key]);

    expect(new Set([une.key, deux.key, trois.key]).size).toBe(3);
  });

  // Sans graine stable, le titre changerait à chaque rendu de l'écran — et cet
  // écran se redessine, ne serait-ce qu'au retour des confettis.
  it('rend la même fin pour la même manche', () => {
    const manche = ctx([7, 3, 0]);
    expect(computeEnding(manche, []).key).toBe(computeEnding(manche, []).key);
  });
});

describe('computeEnding — la forme de l’élimination', () => {
  it('reconnaît une exécution à la première phrase', () => {
    expect(computeEnding(ctx([0]), []).key).toBe('execution-sommaire');
  });

  it('reconnaît une chute brutale depuis une note haute', () => {
    const fin = computeEnding(ctx([9, 0]), []);
    expect(fin.key).toBe('trappe');
    expect(fin.subtitle).toContain('9/10');
  });

  it('reconnaît la goutte d’eau — longue résistance, petite chute finale', () => {
    expect(computeEnding(ctx([8, 6, 4, 2, 0]), []).key).toBe('goutte-eau');
  });

  it('reconnaît une élimination sur un green flag', () => {
    const fin = computeEnding(ctx([5, 3, 0], { types: ['negative', 'negative', 'positive'] }), [
      'descente',
    ]);
    expect(fin.key).toBe('trop-tard');
  });

  it('relève l’élimination que la communauté ne partage pas', () => {
    const fin = computeEnding(ctx([6, 0], { community: [-2, -0.5] }), []);
    expect(fin.key).toBe('seul-au-monde');
    expect(fin.subtitle).toContain('0,5');
  });
});

describe('computeEnding — hors élimination', () => {
  it('salue une note intacte', () => {
    expect(computeEnding(ctx([10, 10, 10]), []).key).toBe('pas-une-ride');
  });

  it('raconte la remontée', () => {
    expect(computeEnding(ctx([8, 3, 7]), []).key).toBe('remontada');
  });

  it('repère le joueur bien plus dur que les autres', () => {
    const fin = computeEnding(ctx([6, 3, 2], { community: [-1, -1, -0.5] }), []);
    expect(fin.key).toBe('sans-pitie');
  });

  it('repère le joueur bien plus tendre que les autres', () => {
    const fin = computeEnding(ctx([10, 10, 9], { community: [-3, -3, -2] }), []);
    expect(fin.key).toBe('avocat');
  });

  it('repère une notation mécanique', () => {
    expect(computeEnding(ctx([8, 6, 4]), []).key).toBe('metronome');
  });

  // Toute manche doit produire une fin : c'est le seul invariant dont l'écran
  // de verdict dépend.
  it('rend toujours une fin, quelle que soit la trajectoire', () => {
    for (let final = 0; final <= 10; final++) {
      for (const longueur of [1, 2, 3, 5]) {
        const ratings = Array.from({ length: longueur }, (_, i) =>
          i === longueur - 1 ? final : Math.max(final, 10 - i),
        );
        const fin = computeEnding(ctx(ratings), []);
        expect(fin.title.length).toBeGreaterThan(0);
        expect(fin.subtitle.length).toBeGreaterThan(0);
      }
    }
  });
});

/**
 * Le reproche d'origine tenait en une phrase : « on tombe souvent sur LE
 * COUPERET ». Ce test le transforme en seuil mesurable, sur des manches
 * ressemblant à de vraies parties — descente irrégulière, élimination
 * fréquente, cinq révélations au plus.
 */
describe('computeEnding — distribution sur une session simulée', () => {
  function jeuDeManches(nombre: number): number[][] {
    // Générateur à graine : le test doit échouer ou passer de la même façon à
    // chaque exécution.
    let graine = 12345;
    const alea = () => {
      graine = (graine * 1103515245 + 12345) % 2147483648;
      return graine / 2147483648;
    };

    const manches: number[][] = [];
    for (let m = 0; m < nombre; m++) {
      const ratings: number[] = [];
      let note = 10;
      for (let i = 0; i < 5; i++) {
        note = Math.max(0, note - Math.floor(alea() * 5));
        ratings.push(note);
        if (note === 0) break;
      }
      manches.push(ratings);
    }
    return manches;
  }

  it('ne laisse aucune fin dépasser un tiers des manches', () => {
    const compte = new Map<string, number>();
    let recentes: string[] = [];

    for (const [index, ratings] of jeuDeManches(240).entries()) {
      const fin = computeEnding(ctx(ratings, { ids: ratings.map((_, i) => `m${index}-${i}`) }), recentes);
      recentes = [...recentes, fin.key].slice(-2);
      compte.set(fin.key, (compte.get(fin.key) ?? 0) + 1);
    }

    const total = [...compte.values()].reduce((a, b) => a + b, 0);
    const plusFrequente = Math.max(...compte.values());

    expect(compte.size).toBeGreaterThanOrEqual(6);
    expect(plusFrequente / total).toBeLessThan(0.34);
  });

  it('ne sert jamais deux fois la même fin d’affilée', () => {
    let precedente = '';
    let recentes: string[] = [];

    for (const [index, ratings] of jeuDeManches(240).entries()) {
      const fin = computeEnding(ctx(ratings, { ids: ratings.map((_, i) => `m${index}-${i}`) }), recentes);
      expect(fin.key).not.toBe(precedente);
      precedente = fin.key;
      recentes = [...recentes, fin.key].slice(-2);
    }
  });
});

describe('severityGap', () => {
  it('ne conclut pas sur une seule phrase comparable', () => {
    expect(severityGap([-3], [-1])).toBeNull();
    expect(severityGap([-3, -2], [-1, null])).toBeNull();
  });

  it('mesure l’écart sur les seules phrases votées', () => {
    const g = severityGap([-4, -2, -8], [-2, -1, null]);
    expect(g).not.toBeNull();
    expect(g!.sample).toBe(2);
    expect(g!.mine).toBe(-3);
    expect(g!.theirs).toBe(-1.5);
    expect(g!.gap).toBe(-1.5);
  });
});

describe('severityLine', () => {
  it('qualifie les trois cas', () => {
    expect(severityLine([-4, -4], [-1, -1])).toContain('sévèrement');
    expect(severityLine([-1, -1], [-4, -4])).toContain('généreusement');
    expect(severityLine([-2, -2], [-2, -2])).toContain('comme la moyenne');
  });
});
