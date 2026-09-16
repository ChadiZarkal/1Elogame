import { describe, expect, it } from 'vitest';
import type { Ending } from '../endings';
import type { PlayedRound } from '../report';
import {
  cohortDative,
  cohortLabel,
  cohortSentence,
  compareToCohort,
  statementIdsOf,
  type CohortStat,
} from '../cohort';

const FIN: Ending = { key: 'couperet', title: 'LE COUPERET', subtitle: '…', tone: 'brutal' };

function manche(ratings: number[], ids: string[]): PlayedRound {
  const played = ids.map((id) => ({
    id,
    text: `Phrase ${id}`,
    type: 'negative' as const,
    category: 'caractere',
  }));

  return {
    profileNumber: 1,
    name: 'Lucas',
    age: 24,
    played,
    ratings,
    deltas: ratings.map((r, i) => r - (i === 0 ? 10 : ratings[i - 1])),
    community: played.map(() => null),
    communityElim: played.map(() => null),
    final: ratings.at(-1) ?? 10,
    eliminated: ratings.at(-1) === 0,
    ending: FIN,
  };
}

function stat(id: string, avg: number, votes = 20): CohortStat {
  return { statement_id: id, votes, avg_delta: avg, elimination_rate: 10 };
}

describe('statementIdsOf', () => {
  it('rassemble les identifiants vus, sans doublon', () => {
    const rounds = [manche([8, 6], ['a', 'b']), manche([7, 5], ['b', 'c'])];
    expect(statementIdsOf(rounds).sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('compareToCohort', () => {
  it('ne conclut pas sur moins de cinq phrases comparables', () => {
    const rounds = [manche([8, 6, 4, 2], ['a', 'b', 'c', 'd'])];
    const stats = ['a', 'b', 'c', 'd'].map((id) => stat(id, -1, 40));
    expect(compareToCohort(rounds, stats)).toBeNull();
  });

  // Le garde-fou qui compte vraiment : la cohorte peut couvrir beaucoup
  // d'énoncés avec très peu de monde derrière.
  it('ne conclut pas quand la cohorte pèse trop peu de votes', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const rounds = [manche([9, 8, 7, 6, 5, 4], ids)];
    expect(compareToCohort(rounds, ids.map((id) => stat(id, -1, 2)))).toBeNull();
  });

  it('ignore les phrases que la cohorte ne couvre pas', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const rounds = [manche([8, 6, 4, 2, 0], ['a', 'b', 'c', 'd', 'e'])];
    const comparaison = compareToCohort(rounds, ids.map((id) => stat(id, -1, 20)));

    expect(comparaison).not.toBeNull();
    // Cinq révélations jouées, la sixième statistique ne concerne rien de vu.
    expect(comparaison!.sample).toBe(5);
    expect(comparaison!.votes).toBe(100);
    expect(comparaison!.mine).toBe(-2);
    expect(comparaison!.theirs).toBe(-1);
    expect(comparaison!.gap).toBe(-1);
  });

  // Ce que l'ancien seuil rendait impossible : sur les données réelles, aucun
  // énoncé n'atteignait huit votes dans une cohorte, et le bloc ne pouvait
  // jamais s'afficher.
  it('conclut avec un ou deux votes par énoncé, si le total suffit', () => {
    const ids = Array.from({ length: 20 }, (_, i) => `s${i}`);
    const rounds = [
      manche([8, 6, 4, 2, 0], ids.slice(0, 5)),
      manche([8, 6, 4, 2, 0], ids.slice(5, 10)),
      manche([8, 6, 4, 2, 0], ids.slice(10, 15)),
      manche([8, 6, 4, 2, 0], ids.slice(15, 20)),
    ];
    const comparaison = compareToCohort(rounds, ids.map((id) => stat(id, -1, 2)));

    expect(comparaison).not.toBeNull();
    expect(comparaison!.sample).toBe(20);
    expect(comparaison!.votes).toBe(40);
  });

  it('rend un écart positif quand le joueur est plus tendre', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const rounds = [manche([10, 10, 9, 9, 9], ids)];
    const comparaison = compareToCohort(rounds, ids.map((id) => stat(id, -3, 20)));
    expect(comparaison!.gap).toBeGreaterThan(2);
  });
});

describe('cohortLabel', () => {
  it('accorde le libellé au profil', () => {
    expect(cohortLabel({ sex: 'femme', age: '19-22' })).toBe('les femmes de 19-22 ans');
    expect(cohortLabel({ sex: 'homme', age: '27+' })).toBe('les hommes de 27 ans et plus');
    expect(cohortLabel({ sex: 'autre', age: '16-18' })).toBe('les joueurs de 16-18 ans');
  });
});

describe('cohortSentence', () => {
  const profil = { sex: 'femme', age: '19-22' } as const;
  const dire = (gap: number) =>
    cohortSentence({ gap, mine: -3, theirs: -3 - gap, sample: 10 }, profil);

  it('nomme la cohorte dans chaque palier', () => {
    expect(dire(-2.5)).toContain('extrêmement sévère par rapport aux femmes de 19-22 ans');
    expect(dire(-1)).toContain('plus sévère que les femmes de 19-22 ans');
    expect(dire(0)).toContain('exactement comme les femmes de 19-22 ans');
    expect(dire(1)).toContain('plus indulgent');
    expect(dire(2)).toContain('bien plus tendre');
  });
});

describe('accord des articles', () => {
  // « par rapport à les femmes » : le français ne contracte pas de la même
  // façon selon la préposition, et une seule chaîne toute faite ne pouvait pas
  // servir les deux tournures.
  it('contracte après « face » et « par rapport »', () => {
    expect(cohortDative({ sex: 'femme', age: '19-22' })).toBe('aux femmes de 19-22 ans');
    expect(cohortLabel({ sex: 'femme', age: '19-22' })).toBe('les femmes de 19-22 ans');
  });
});
