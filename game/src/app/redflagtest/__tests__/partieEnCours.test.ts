import { beforeEach, describe, expect, it } from 'vitest';
import {
  DUREE_DE_VIE_MS,
  enregistrer,
  oublier,
  reprendre,
  reprendreA,
  REPRISE_MINIMUM,
} from '@/app/redflagtest/partieEnCours';
import type { QuestionPublique } from '@/lib/rft/types';

function question(id: string, reponses: string[]): QuestionPublique {
  return {
    id,
    texte: `Énoncé ${id}`,
    precision: null,
    reponses: reponses.map((r) => ({ id: r, texte: r, indice: 1 as const })),
  };
}

const QUESTIONS = [
  question('q1', ['a1', 'a2']),
  question('q2', ['b1', 'b2']),
  question('q3', ['c1', 'c2']),
  question('q4', ['d1', 'd2']),
  question('q5', ['e1', 'e2']),
];

const MAINTENANT = 1_800_000_000_000;

function partie(choix: Array<[string, string]>, maj = MAINTENANT) {
  enregistrer({
    choix: choix.map(([questionId, answerId]) => ({ questionId, answerId })),
    debut: maj - 60_000,
    maj,
  });
}

describe('reprendre', () => {
  beforeEach(() => {
    oublier();
  });

  it('ne rend rien quand rien n’a été enregistré', () => {
    expect(reprendre(QUESTIONS, MAINTENANT)).toBeNull();
  });

  it('rend les réponses enregistrées', () => {
    partie([['q1', 'a1'], ['q2', 'b2'], ['q3', 'c1']]);
    expect(reprendre(QUESTIONS, MAINTENANT)?.choix).toHaveLength(3);
  });

  // Reprendre une partie de deux questions coûte un écran de plus pour
  // économiser quatre secondes.
  it('ne propose rien en dessous du minimum', () => {
    partie([['q1', 'a1'], ['q2', 'b2']]);
    expect(REPRISE_MINIMUM).toBe(3);
    expect(reprendre(QUESTIONS, MAINTENANT)).toBeNull();
  });

  it('oublie une partie trop ancienne', () => {
    partie([['q1', 'a1'], ['q2', 'b2'], ['q3', 'c1']], MAINTENANT - DUREE_DE_VIE_MS - 1);
    expect(reprendre(QUESTIONS, MAINTENANT)).toBeNull();
    // Et l'efface, pour ne pas la réexaminer à chaque chargement.
    expect(reprendre(QUESTIONS, MAINTENANT - DUREE_DE_VIE_MS)).toBeNull();
  });

  it('garde une partie de la veille', () => {
    partie([['q1', 'a1'], ['q2', 'b2'], ['q3', 'c1']], MAINTENANT - 24 * 60 * 60 * 1000);
    expect(reprendre(QUESTIONS, MAINTENANT)?.choix).toHaveLength(3);
  });

  // Le questionnaire change : Chadi modifie et supprime des questions depuis
  // l'administration. Une sauvegarde citant une réponse disparue ne doit pas
  // faire reprendre une partie dans un état impossible.
  it('écarte les réponses qui n’existent plus', () => {
    partie([['q1', 'a1'], ['q2', 'b2'], ['q3', 'c1'], ['qX', 'zz'], ['q4', 'INCONNUE']]);
    const repris = reprendre(QUESTIONS, MAINTENANT);

    expect(repris?.choix.map((c) => c.questionId)).toEqual(['q1', 'q2', 'q3']);
  });

  it('abandonne si le nettoyage ne laisse plus assez de réponses', () => {
    partie([['q1', 'a1'], ['qX', 'zz'], ['qY', 'yy'], ['qZ', 'ww']]);
    expect(reprendre(QUESTIONS, MAINTENANT)).toBeNull();
  });

  it('résiste à un contenu illisible', () => {
    window.localStorage.setItem('rft_partie_en_cours', 'pas du json');
    expect(reprendre(QUESTIONS, MAINTENANT)).toBeNull();

    window.localStorage.setItem('rft_partie_en_cours', JSON.stringify({ n: 'importe quoi' }));
    expect(reprendre(QUESTIONS, MAINTENANT)).toBeNull();
  });

  it('conserve l’horodatage de départ, pour que la durée reste juste', () => {
    partie([['q1', 'a1'], ['q2', 'b2'], ['q3', 'c1']]);
    expect(reprendre(QUESTIONS, MAINTENANT)?.debut).toBe(MAINTENANT - 60_000);
  });
});

describe('reprendreA', () => {
  it('reprend à la première question sans réponse', () => {
    const choix = [
      { questionId: 'q1', answerId: 'a1' },
      { questionId: 'q2', answerId: 'b1' },
    ];
    expect(reprendreA(QUESTIONS, choix)).toBe(2);
  });

  // Une question supprimée depuis la sauvegarde décale tout : reprendre au rang
  // du NOMBRE de réponses ferait sauter une question sans que personne ne s'en
  // aperçoive.
  it('ne se fie pas au nombre de réponses', () => {
    const choix = [
      { questionId: 'q1', answerId: 'a1' },
      { questionId: 'q3', answerId: 'c1' },
      { questionId: 'q4', answerId: 'd1' },
    ];
    // Trois réponses, mais c'est q2 qui manque : on y retourne.
    expect(reprendreA(QUESTIONS, choix)).toBe(1);
  });

  it('rend la fin quand tout a été répondu', () => {
    const choix = QUESTIONS.map((q) => ({ questionId: q.id, answerId: q.reponses[0].id }));
    expect(reprendreA(QUESTIONS, choix)).toBe(QUESTIONS.length);
  });
});
