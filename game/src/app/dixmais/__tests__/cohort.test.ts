import { describe, expect, it } from 'vitest';
import {
  cohortDative,
  cohortLabel,
  cohortSentence,
  compareToCohort,
  statementIdsOf,
  type CohortStat,
} from '../cohort';
import { profilJuge } from './fixtures';

/** Un profil jugé sur les phrases `ids`. */
const manche = (notes: number[], ids: string[]) => profilJuge(notes, { ids });

/** Les notes d'une cohorte sur une phrase. */
function stat(id: string, moyenne: number, notes = 5): CohortStat {
  return { statement_id: id, notes, avg_note: moyenne };
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
    expect(compareToCohort(rounds, ['a', 'b', 'c', 'd'].map((id) => stat(id, 9, 40)))).toBeNull();
  });

  // Le garde-fou qui compte vraiment : la cohorte peut couvrir beaucoup de
  // phrases avec très peu de monde derrière.
  it('ne conclut pas quand la cohorte pèse moins de quinze notes', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const rounds = [manche([9, 8, 7, 6, 5, 4], ids)];
    expect(compareToCohort(rounds, ids.map((id) => stat(id, 9, 2)))).toBeNull();
    expect(compareToCohort(rounds, ids.map((id) => stat(id, 9, 3)))).not.toBeNull();
  });

  it('compare la note du joueur à la note moyenne de la cohorte', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const rounds = [manche([8, 6, 4, 2, 0], ['a', 'b', 'c', 'd', 'e'])];
    const comparaison = compareToCohort(rounds, ids.map((id) => stat(id, 9, 4)));

    expect(comparaison).not.toBeNull();
    // Cinq phrases jouées : la sixième statistique ne concerne rien de vu.
    expect(comparaison!.sample).toBe(5);
    expect(comparaison!.votes).toBe(20);
    expect(comparaison!.mine).toBe(4);
    expect(comparaison!.theirs).toBe(9);
    expect(comparaison!.gap).toBe(-5);
  });

  it('ignore une phrase que la cohorte n’a pas notée', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const rounds = [manche([4, 4, 4, 4, 4], ids)];
    const stats = [...ids.map((id) => stat(id, 6, 5)), stat('z', 1, 0)];
    expect(compareToCohort(rounds, stats)!.theirs).toBe(6);
  });

  it('rend un écart positif quand le joueur est plus tendre, au-delà de 10', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const rounds = [manche([14, 13, 12, 12, 14], ids)];
    expect(compareToCohort(rounds, ids.map((id) => stat(id, 9, 5)))!.gap).toBeGreaterThan(3);
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
    cohortSentence({ gap, mine: 5, theirs: 5 - gap, sample: 10, votes: 80 }, profil);

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
