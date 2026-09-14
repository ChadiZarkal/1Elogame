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

function stat(id: string, avg: number): CohortStat {
  return { statement_id: id, votes: 20, avg_delta: avg, elimination_rate: 10 };
}

describe('statementIdsOf', () => {
  it('rassemble les identifiants vus, sans doublon', () => {
    const rounds = [manche([8, 6], ['a', 'b']), manche([7, 5], ['b', 'c'])];
    expect(statementIdsOf(rounds).sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('compareToCohort', () => {
  // Même seuil que la sévérité générale : sous quatre phrases, l'écart tient
  // au tirage bien plus qu'au tempérament.
  it('ne conclut pas sur moins de quatre phrases comparables', () => {
    const rounds = [manche([8, 6], ['a', 'b'])];
    expect(compareToCohort(rounds, [stat('a', -1), stat('b', -1)])).toBeNull();
  });

  it('ignore les phrases que la cohorte ne couvre pas', () => {
    const rounds = [manche([8, 6, 4, 2, 0], ['a', 'b', 'c', 'd', 'e'])];
    const comparaison = compareToCohort(rounds, ['a', 'b', 'c', 'd'].map((id) => stat(id, -1)));

    expect(comparaison).not.toBeNull();
    expect(comparaison!.sample).toBe(4);
    // Les quatre premières révélations coûtent 2 points chacune.
    expect(comparaison!.mine).toBe(-2);
    expect(comparaison!.theirs).toBe(-1);
    expect(comparaison!.gap).toBe(-1);
  });

  it('rend un écart positif quand le joueur est plus tendre', () => {
    const rounds = [manche([10, 10, 9, 9], ['a', 'b', 'c', 'd'])];
    const comparaison = compareToCohort(rounds, ['a', 'b', 'c', 'd'].map((id) => stat(id, -3)));
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
