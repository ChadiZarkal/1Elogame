import { describe, expect, it } from 'vitest';
import type { Ending } from '../endings';
import {
  buildReport,
  categorySentence,
  eliminationSentence,
  flatten,
  greenFlagSentence,
  severitySentence,
  type PlayedRound,
} from '../report';

const FIN: Ending = { key: 'couperet', title: 'LE COUPERET', subtitle: '…', tone: 'brutal' };

/**
 * Une manche de test. `ratings` porte la note après chaque révélation ; les
 * écarts en découlent, comme dans le jeu.
 */
function manche(
  ratings: number[],
  options: {
    community?: (number | null)[];
    communityElim?: (number | null)[];
    types?: ('positive' | 'negative')[];
    categories?: string[];
    name?: string;
  } = {},
): PlayedRound {
  const played = ratings.map((_, i) => ({
    id: `${options.name ?? 'x'}-${i}`,
    text: `Révélation ${i + 1}`,
    type: options.types?.[i] ?? ('negative' as const),
    category: options.categories?.[i] ?? 'caractere',
  }));

  return {
    profileNumber: 1,
    name: options.name ?? 'Lucas',
    age: 24,
    played,
    ratings,
    deltas: ratings.map((r, i) => r - (i === 0 ? 10 : ratings[i - 1])),
    community: options.community ?? played.map(() => null),
    communityElim: options.communityElim ?? played.map(() => null),
    final: ratings.at(-1) ?? 10,
    eliminated: ratings.at(-1) === 0,
    ending: FIN,
  };
}

describe('flatten', () => {
  it('déplie les manches en révélations et calcule l’écart à la communauté', () => {
    const judgments = flatten([manche([7, 4], { community: [-2, -1] })]);

    expect(judgments).toHaveLength(2);
    expect(judgments[0].delta).toBe(-3);
    expect(judgments[0].deviation).toBe(-1);
    expect(judgments[1].deviation).toBe(-2);
  });

  it('laisse l’écart indéterminé quand la phrase n’est pas assez votée', () => {
    const [judgment] = flatten([manche([7], { community: [null] })]);
    expect(judgment.deviation).toBeNull();
  });

  it('marque la révélation fatale', () => {
    const judgments = flatten([manche([6, 0])]);
    expect(judgments.map((j) => j.fatal)).toEqual([false, true]);
  });
});

describe('buildReport — compteurs', () => {
  it('compte les profils, les éliminations et la note moyenne', () => {
    const report = buildReport([manche([8, 6]), manche([4, 0]), manche([9, 9])]);

    expect(report.profiles).toBe(3);
    expect(report.judgments).toBe(6);
    expect(report.eliminated).toBe(1);
    expect(report.survivalRate).toBeCloseTo(66.7, 0);
    expect(report.avgFinal).toBeCloseTo(5, 5);
  });

  it('retient le meilleur et le pire profil', () => {
    const report = buildReport([
      manche([9, 8], { name: 'Emma' }),
      manche([3, 1], { name: 'Hugo' }),
    ]);

    expect(report.best).toEqual({ name: 'Emma', score: 8 });
    expect(report.worst).toEqual({ name: 'Hugo', score: 1 });
  });
});

describe('buildReport — sévérité', () => {
  // Sous quatre révélations comparables, l'écart tient au tirage.
  it('ne conclut pas sur un échantillon trop court', () => {
    expect(buildReport([manche([8, 6], { community: [-1, -1] })]).severity).toBeNull();
  });

  it('mesure l’écart sur les seules révélations votées', () => {
    const report = buildReport([
      manche([7, 4], { community: [-3, -3] }),
      manche([7, 4], { community: [-3, -3] }),
      manche([7, 4], { community: [-3, null] }),
    ]);

    expect(report.severity).not.toBeNull();
    expect(report.severity!.sample).toBe(5);
    expect(report.severity!.mine).toBe(-3);
    expect(report.severity!.theirs).toBe(-3);
    expect(report.severity!.gap).toBe(0);
  });

  it('rend un écart négatif quand le joueur punit plus fort', () => {
    const report = buildReport([
      manche([6, 2], { community: [-1, -1] }),
      manche([6, 2], { community: [-1, -1] }),
    ]);
    expect(report.severity!.gap).toBeLessThan(-2);
  });
});

describe('buildReport — éliminations', () => {
  it('compare par révélation, comme la statistique de la communauté', () => {
    const report = buildReport([
      manche([5, 0], { communityElim: [10, 40] }),
      manche([8, 7], { communityElim: [10, 20] }),
    ]);

    // Une révélation fatale sur quatre.
    expect(report.elimination.mine).toBe(25);
    expect(report.elimination.theirs).toBe(20);
  });
});

describe('buildReport — green flags et catégories', () => {
  it('mesure ce que les qualités rapportent', () => {
    const report = buildReport([
      manche([8, 9, 7], { types: ['negative', 'positive', 'negative'] }),
    ]);
    expect(report.greenFlagEffect).toBe(1);
    expect(report.greenFlagsIgnored).toBe(0);
  });

  it('compte les qualités restées sans effet', () => {
    const report = buildReport([
      manche([8, 8, 6], { types: ['negative', 'positive', 'positive'] }),
    ]);
    expect(report.greenFlagsIgnored).toBe(2);
  });

  it('classe les catégories de la plus punie à la moins punie', () => {
    const report = buildReport([
      manche([5, 4, 3, 2], {
        categories: ['politique', 'politique', 'lifestyle', 'lifestyle'],
      }),
    ]);

    expect(report.categories[0].category).toBe('politique');
    expect(report.categories[0].mine).toBe(-3);
    expect(report.categories[1].category).toBe('lifestyle');
  });

  it('ignore une catégorie vue une seule fois', () => {
    const report = buildReport([
      manche([9, 8, 7], { categories: ['politique', 'politique', 'argent'] }),
    ]);
    expect(report.categories.map((c) => c.category)).toEqual(['politique']);
  });
});

describe('buildReport — les deux moments', () => {
  it('isole l’intransigeance et l’angle mort', () => {
    const report = buildReport([
      manche([5, 4, 3, 3], { community: [-1, -1, -1, -3] }),
    ]);

    // −5 contre −1 : le plus gros écart vers le bas.
    expect(report.harshest!.delta).toBe(-5);
    // 0 contre −3 : le plus gros écart vers le haut.
    expect(report.blindSpot!.delta).toBe(0);
  });
});

describe('archétypes', () => {
  it('sacre le bourreau quand presque personne ne survit', () => {
    const rounds = [manche([4, 0]), manche([3, 0]), manche([5, 0]), manche([2, 0])];
    expect(buildReport(rounds).archetype.key).toBe('bourreau');
  });

  it('reconnaît l’avocat, bien plus tendre que la moyenne', () => {
    const rounds = [
      manche([10, 9], { community: [-4, -4] }),
      manche([10, 9], { community: [-4, -4] }),
    ];
    expect(buildReport(rounds).archetype.key).toBe('avocat');
  });

  it('reconnaît le comptable, aligné sur la moyenne', () => {
    const rounds = [
      manche([8, 6], { community: [-2, -2] }),
      manche([8, 6], { community: [-2, -2] }),
    ];
    expect(buildReport(rounds).archetype.key).toBe('comptable');
  });

  it('rend toujours un archétype, même sur une seule manche', () => {
    expect(buildReport([manche([7])]).archetype.title.length).toBeGreaterThan(0);
  });
});

describe('mise en mots', () => {
  it('gradue la sévérité en cinq paliers', () => {
    const dire = (gap: number) =>
      severitySentence({ gap, mine: -3, theirs: -3 - gap, sample: 10 });

    expect(dire(-2.5)).toContain('extrêmement sévère');
    expect(dire(-1.2)).toContain('plus sévère');
    expect(dire(-0.5)).toContain('un peu plus dur');
    expect(dire(0)).toContain('comme la moyenne');
    expect(dire(1)).toContain('plus indulgent');
    expect(dire(2)).toContain('aussi gentil');
  });

  it('se tait quand la sévérité n’est pas mesurable', () => {
    expect(severitySentence(null)).toBeNull();
  });

  it('se tait sur les éliminations quand la communauté est inconnue', () => {
    expect(eliminationSentence({ mine: 30, theirs: null })).toBeNull();
  });

  it('relève une gâchette deux fois plus rapide', () => {
    expect(eliminationSentence({ mine: 40, theirs: 15 })).toContain('deux fois plus vite');
  });

  it('dit quand aucune qualité n’a jamais rien rapporté', () => {
    const report = buildReport([
      manche([8, 8, 8], { types: ['negative', 'positive', 'positive'] }),
    ]);
    expect(greenFlagSentence(report)).toContain('ne se récompense pas');
  });

  it('nomme la catégorie qui coûte le plus cher', () => {
    const report = buildReport([
      manche([6, 2, 1, 1], { categories: ['politique', 'politique', 'argent', 'argent'] }),
    ]);
    expect(categorySentence(report.categories)).toContain('La politique te coûte');
  });

  it('se tait quand aucune catégorie ne coûte vraiment', () => {
    const report = buildReport([manche([10, 10, 10, 10])]);
    expect(categorySentence(report.categories)).toBeNull();
  });
});
