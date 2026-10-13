import { describe, expect, it } from 'vitest';
import {
  choisirFin,
  construireBilan,
  formatNote,
  moyenneDe,
  moyenneDesAutres,
  noteDesAutres,
  phraseSeverite,
  poidsDansLaMoyenne,
  type ContexteFin,
} from '../moyenne';
import { profilJuge } from './fixtures';

function contexte(notes: number[], moyenneCommunaute: number | null = null): ContexteFin {
  return {
    propositions: notes.map((_, i) => ({ id: `p${i}`, text: `Phrase ${i + 1}`, type: 'negative', category: 'caractere' })),
    notes,
    moyenne: moyenneDe(notes),
    moyenneCommunaute,
    pronom: 'il',
  };
}

describe('la note du profil', () => {
  it('est la moyenne exacte des cinq notes', () => {
    expect(moyenneDe([2, 5, 8, 10, 0])).toBe(5);
    expect(moyenneDe([7, 7, 6, 6, 6])).toBeCloseTo(6.4);
  });

  it("s'écrit avec une décimale à la française, sans « ,0 »", () => {
    expect(formatNote(6.4)).toBe('6,4');
    expect(formatNote(5)).toBe('5');
    expect(formatNote(6.96)).toBe('7');
  });

  it("mesure ce qu'une note retire à la moyenne", () => {
    // Sans le 0, la moyenne des quatre autres vaut 8 ; avec, 6,4.
    expect(poidsDansLaMoyenne([8, 8, 8, 8, 0], 4)).toBeCloseTo(1.6);
  });
});

describe('la note des autres', () => {
  it('ramène le coût moyen d’une phrase à une note sur 10', () => {
    expect(noteDesAutres({ votes_count: 20, total_delta: -60 })).toBe(7);
    expect(noteDesAutres({ votes_count: 20, total_delta: -60, avg_delta: -4.5 })).toBe(5.5);
  });

  it('reste entre 0 et 15', () => {
    expect(noteDesAutres({ votes_count: 10, total_delta: -140 })).toBe(0);
    expect(noteDesAutres({ votes_count: 10, total_delta: 30 })).toBe(13);
    expect(noteDesAutres({ votes_count: 10, total_delta: 90 })).toBe(15);
  });

  it('se tait sous cinq votes', () => {
    expect(noteDesAutres({ votes_count: 4, total_delta: -8 })).toBeNull();
  });

  it("n'est citée pour un profil qu'à partir de trois phrases mesurables", () => {
    expect(moyenneDesAutres([6, null, 4, null, null])).toBeNull();
    expect(moyenneDesAutres([6, null, 4, 5, null])).toBe(5);
  });
});

describe('la fin d’un profil', () => {
  it('salue un sans-faute', () => {
    expect(choisirFin(contexte([10, 10, 10, 10, 10])).key).toBe('sans-faute');
    expect(choisirFin(contexte([10, 12, 10, 11, 10])).key).toBe('sans-faute');
  });

  it('sort du barème au-delà de 12,5 de moyenne', () => {
    const fin = choisirFin(contexte([15, 14, 12, 13, 11]));
    expect(fin.key).toBe('hors-bareme');
    expect(fin.subtitle).toContain('13/10');
  });

  it('dit « mieux qu’un 10 » quand les qualités ont plus que compensé', () => {
    expect(choisirFin(contexte([8, 14, 9, 13, 9])).key).toBe('mieux-qu-un-10');
  });

  it('raconte un profil sauvé par ses qualités', () => {
    const c = contexte([2, 15, 3, 14, 4]);
    c.propositions[1].type = 'positive';
    c.propositions[3].type = 'positive';
    const fin = choisirFin(c);
    expect(fin.key).toBe('sauve-par-ses-qualites');
    expect(fin.subtitle).toContain('Phrase 2');
  });

  it('remarque des qualités qui ne rapportent rien', () => {
    const c = contexte([4, 10, 5, 10, 6]);
    c.propositions[1].type = 'positive';
    c.propositions[3].type = 'positive';
    expect(choisirFin(c).key).toBe('qualites-ignorees');
  });

  it('nomme la tolérance zéro', () => {
    expect(choisirFin(contexte([0, 0, 0, 0, 0])).key).toBe('tolerance-zero');
  });

  // Le cœur de la nouvelle règle : un 0 ne met plus fin à rien.
  it('raconte un 0 qui n’empêche pas de passer la moyenne', () => {
    const fin = choisirFin(contexte([0, 8, 9, 7, 8]));
    expect(fin.key).toBe('redhibitoire-en-theorie');
    expect(fin.subtitle).toContain('6,4');
  });

  it('chiffre le coup fatal', () => {
    const fin = choisirFin(contexte([0, 6, 3, 4, 2]));
    expect(fin.key).toBe('coup-fatal');
    expect(fin.subtitle).toContain('Phrase 1');
  });

  it('isole le seul vrai défaut', () => {
    const fin = choisirFin(contexte([9, 9, 2, 8, 10]));
    expect(fin.key).toBe('un-seul-defaut');
    expect(fin.subtitle).toContain('Phrase 3');
  });

  it('compare aux autres quand l’écart est net', () => {
    expect(choisirFin(contexte([2, 3, 2, 3, 2], 6)).key).toBe('tu-l-as-acheve');
    expect(choisirFin(contexte([9, 8, 9, 8, 9], 5)).key).toBe('tu-l-as-sauve');
  });

  it('retombe sur le palier de la moyenne', () => {
    expect(choisirFin(contexte([6, 7, 6, 7, 6])).key).toBe('bareme');
    expect(choisirFin(contexte([4, 6, 5, 7, 4])).key).toBe('a-tes-risques');
    expect(choisirFin(contexte([1, 3, 2, 4, 3])).key).toBe('fuis');
  });

  it('évite une fin qui vient de sortir quand une autre du palier convient', () => {
    // Éligible à trois fins précises : rédhibitoire en théorie, seul vrai
    // défaut, et sauvé par rapport aux autres.
    const c = contexte([10, 10, 0, 10, 10], 4);
    const premiere = choisirFin(c);
    const seconde = choisirFin(c, [premiere.key]);
    expect(seconde.key).not.toBe(premiere.key);
  });
});

describe('le bilan de session', () => {
  it('classe les profils du mieux au moins bien noté', () => {
    const bilan = construireBilan([
      profilJuge([4, 4, 4, 4, 4], { nom: 'Lucas', numero: 1 }),
      profilJuge([9, 8, 9, 8, 9], { nom: 'Emma', numero: 2 }),
      profilJuge([6, 6, 6, 6, 6], { nom: 'Hugo', numero: 3 }),
    ]);
    expect(bilan.classement.map((p) => p.nom)).toEqual(['Emma', 'Hugo', 'Lucas']);
    expect(bilan.jugements).toBe(15);
    expect(bilan.noteMoyenne).toBeCloseTo((20 + 43 + 30) / 15);
  });

  it('ne conclut pas sur la sévérité sans quatre phrases mesurables', () => {
    const bilan = construireBilan([profilJuge([3, 3, 3, 3, 3], { communaute: [6, 6, 6, null, null] })]);
    expect(bilan.severite).toBeNull();
  });

  it('mesure la sévérité par rapport aux autres', () => {
    const bilan = construireBilan([profilJuge([3, 3, 3, 3, 3], { communaute: [6, 6, 6, 6, null] })]);
    expect(bilan.severite).toMatchObject({ moi: 3, autres: 6, ecart: -3, echantillon: 4 });
    expect(bilan.archetype.key).toBe('procureur');
    expect(phraseSeverite(bilan.severite)).toContain('extrêmement sévère');
  });

  it('relève les rédhibitoires et la part de zéros', () => {
    const bilan = construireBilan([profilJuge([0, 1, 5, 7, 9])]);
    expect(bilan.redhibitoires.map((j) => j.note)).toEqual([0, 1]);
    expect(bilan.zeros).toBe(20);
  });

  it('reconnaît le joueur binaire', () => {
    const bilan = construireBilan([
      profilJuge([0, 15, 0, 14, 15], { nom: 'A' }),
      profilJuge([15, 0, 13, 0, 9], { nom: 'B' }),
    ]);
    expect(bilan.archetype.key).toBe('binaire');
  });

  it('sépare ce que valent les red flags et les green flags', () => {
    const bilan = construireBilan([profilJuge([4, 13, 6, 14, 2], { verts: [1, 3] })]);
    expect(bilan.moyenneRouge).toBe(4);
    expect(bilan.moyenneVerte).toBe(13.5);
    expect(bilan.coupsDeCoeur.map((j) => j.note)).toEqual([14, 13]);
  });

  it('reconnaît le cœur d’artichaut et l’insensible au vert', () => {
    expect(construireBilan([profilJuge([5, 14, 6, 15, 5], { verts: [1, 3] })]).archetype.key).toBe('coeur-d-artichaut');
    const froid = construireBilan([
      profilJuge([5, 10, 6, 10, 5], { verts: [1, 3], nom: 'A' }),
      profilJuge([6, 10, 5, 10, 6], { verts: [1, 3], nom: 'B', numero: 2 }),
    ]);
    expect(froid.archetype.key).toBe('insensible-au-vert');
  });

  it('pointe l’intransigeance et l’angle mort', () => {
    const bilan = construireBilan([
      profilJuge([1, 9, 5, 5, 5], { communaute: [7, 3, 5, 5, 5] }),
    ]);
    expect(bilan.intransigeance?.note).toBe(1);
    expect(bilan.angleMort?.note).toBe(9);
  });

  it('range les catégories de la plus dure à la plus douce', () => {
    const bilan = construireBilan([
      profilJuge([2, 3, 8, 9, 5], { categories: ['politique', 'politique', 'dating', 'dating', 'argent'] }),
    ]);
    expect(bilan.categories.map((c) => c.category)).toEqual(['politique', 'dating']);
  });
});
