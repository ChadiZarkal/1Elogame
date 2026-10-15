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
    // Le joueur met 4 en moyenne ; la cohorte retire 1 point, soit 9.
    expect(comparaison!.mine).toBe(4);
    expect(comparaison!.theirs).toBe(9);
    expect(comparaison!.gap).toBe(-5);
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
    // La cohorte retire 3 points : elle met 7.
    const comparaison = compareToCohort(rounds, ids.map((id) => stat(id, -3, 20)));
    expect(comparaison!.gap).toBeGreaterThan(2);
  });
});

describe('compareToCohort — notes de la mécanique actuelle', () => {
  it('préfère la vraie note de la cohorte à l’estimation des anciens votes', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const rounds = [manche([4, 4, 4, 4, 4], ids)];
    // Anciens votes : la cohorte retirerait 1 point (note 9). Ses vraies notes
    // disent 6 : c'est ce chiffre qui compte.
    const stats = ids.map((id) => ({ ...stat(id, -1, 20), notes: 10, avg_note: 6 }));
    const comparaison = compareToCohort(rounds, stats);

    expect(comparaison!.theirs).toBe(6);
    expect(comparaison!.gap).toBe(-2);
    expect(comparaison!.votes).toBe(50);
  });

  it('compte un énoncé que la cohorte n’a noté que dans la nouvelle mécanique', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const rounds = [manche([12, 12, 12, 12, 12], ids)];
    const stats = ids.map((id) => ({ statement_id: id, votes: 0, avg_delta: 0, elimination_rate: 0, notes: 6, avg_note: 13 }));
    expect(compareToCohort(rounds, stats)!.theirs).toBe(13);
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
