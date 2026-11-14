/**
 * @file traduction.test.ts
 * @description Le Red Flag Test en anglais, côté serveur.
 *
 * Ce qu'il faut tenir : chaque légende que `score.ts` peut écrire a sa
 * traduction (la liste est fermée, on la parcourt toute) ; le contenu de la
 * maquette est entièrement traduit ; un texte inconnu reste en français plutôt
 * que de disparaître ; le français n'est jamais touché.
 */

import { describe, it, expect } from 'vitest';
import {
  avertissementEn, legendeCourteEn, legendeLongueEn, nonTraduits, traduire, traduireResultat,
} from '../traduction';
import { classement, legendeAgeCourte, legendeCohorte, legendeSexeCourte } from '../score';
import { lireArchetypes, lireQuestions, lireTags, lireVerdicts } from '../mock';
import contenuBase from './contenuBase.json';

const SEXES = ['homme', 'femme', 'autre', null];
const AGES = ['16-18', '19-22', '23-26', '27+', null];
const COHORTES = ['tous', 'sexe', 'age', 'sexe_age'] as const;

/** Des mots qui trahiraient une phrase restée en français. */
const FRANCAIS = /\b(des|de|ans|joueurs|hommes|femmes|tout|ton|âge|seulement|participants?)\b/;

describe('Red Flag Test — traduction des légendes', () => {
  it('traduit toutes les légendes courtes des classements', () => {
    const formes = new Set(['tous', ...SEXES.map(legendeSexeCourte), ...AGES.map(legendeAgeCourte)]);
    for (const fr of formes) {
      const en = legendeCourteEn(fr);
      expect(en, fr).not.toMatch(FRANCAIS);
      expect(en, fr).not.toBe('');
    }
    expect(legendeCourteEn('hommes')).toBe('men');
    expect(legendeCourteEn('23-26 ans')).toBe('23-26');
    expect(legendeCourteEn('27 ans +')).toBe('27+');
  });

  it('traduit toutes les légendes longues de la comparaison', () => {
    for (const cohorte of COHORTES) {
      for (const sexe of SEXES) {
        for (const age of AGES) {
          const fr = legendeCohorte(cohorte, { sexe, age });
          const en = legendeLongueEn(fr);
          expect(en, fr).not.toMatch(FRANCAIS);
        }
      }
    }
    expect(legendeLongueEn('des hommes de 23-26 ans')).toBe('men aged 23-26');
    expect(legendeLongueEn('des 27 ans et plus')).toBe('players 27 and over');
    expect(legendeLongueEn('de tout le monde')).toBe('everyone');
  });

  it('traduit l’avertissement des petites cohortes', () => {
    expect(avertissementEn(classement(1, 0, 'x')!.avertissement!)).toBe('only 1 player');
    expect(avertissementEn(classement(4, 0, 'x')!.avertissement!)).toBe('only 4 players');
  });
});

describe('Red Flag Test — traduction du contenu', () => {
  it('confond apostrophes droites et typographiques', () => {
    expect(traduire('Tu as un problème avec l’alcool ?', 'en')).toBe('Do you have a problem with alcohol?');
    expect(traduire("Tu as un problème avec l'alcool ?", 'en')).toBe('Do you have a problem with alcohol?');
  });

  it('laisse en français un texte qu’elle ne connaît pas', () => {
    expect(traduire('Une question ajoutée hier ?', 'en')).toBe('Une question ajoutée hier ?');
    expect(traduire(null, 'en')).toBeNull();
  });

  it('ne touche jamais au français', () => {
    expect(traduire('Oui', 'fr')).toBe('Oui');
  });

  it('traduit tout le contenu de la base de production, relevé le 2026-11-14', () => {
    // Relevé des textes actifs (questions, réponses, piques, verdicts, profils,
    // catégories). Une question ajoutée depuis s'affiche en français tant
    // qu'elle n'est pas dans le dictionnaire : la relever de nouveau ici le dira.
    expect(nonTraduits(contenuBase)).toEqual([]);
  });

  it('traduit tout le contenu de la maquette locale', () => {
    const textes = [
      ...lireQuestions().flatMap((q) => [
        q.texte, q.precision, ...q.reponses.flatMap((r) => [r.texte, r.pique]),
      ]),
      ...lireVerdicts().flatMap((v) => [v.titre, v.soustitre]),
      ...lireArchetypes().flatMap((a) => [a.titre, a.soustitre]),
      ...lireTags().flatMap((t) => [t.label, t.description, t.ressourceTexte]),
    ];
    expect(nonTraduits(textes)).toEqual([]);
  });

  it('traduit un résultat complet, et rend le français tel quel', () => {
    const fr = {
      score: 68,
      verdict: { id: 'v', minScore: 50, emoji: '🟠', titre: 'ÇA SE VOIT DE LOIN', soustitre: 'Tes proches le savent déjà. Toi, tu viens de l’apprendre.' },
      classements: {
        tous: classement(512, 46, 'tous', 42),
        sexe: classement(4, 1, legendeSexeCourte('homme'), 47),
        age: classement(80, 11, legendeAgeCourte('23-26'), 36),
      },
      axes: [{ tagId: 'a', label: 'Emprise', color: null, valeur: 82, points: 41, maximum: 50 }],
      pointNoir: { tagId: 'a', label: 'Emprise', color: null, valeur: 82, points: 41, maximum: 50 },
      comparaison: { cohorte: 'sexe_age' as const, legende: legendeCohorte('sexe_age', { sexe: 'homme', age: '23-26' }), ecart: 18, moyenne: 50, effectif: 40 },
      archetype: { id: 'x', tagA: 'a', tagB: null, emoji: '🔑', titre: 'LE PROPRIÉTAIRE', soustitre: 'Tu appelles ça de l’attention. Personne d’autre ne l’appelle comme ça.' },
      reponseDecisive: { question: 'Tu as déjà trompé ton ou ta partenaire ?', reponse: 'Oui', points: 9 },
      ressources: [],
      highlights: [{ question: 'Tu cuisines ?', reponse: 'Non', pique: 'Quelqu’un cuisine. La question est de savoir qui.', part: 12 }],
      participants: 512,
      codePartage: 'abc',
    };

    expect(traduireResultat(fr, 'fr')).toBe(fr);

    const en = traduireResultat(fr, 'en');
    expect(en.verdict?.titre).toBe('VISIBLE FROM A MILE AWAY');
    expect(en.archetype?.titre).toBe('THE OWNER');
    expect(en.classements.sexe?.legende).toBe('men');
    expect(en.classements.sexe?.avertissement).toBe('only 4 players');
    expect(en.classements.age?.legende).toBe('23-26');
    expect(en.comparaison?.legende).toBe('men aged 23-26');
    expect(en.pointNoir?.label).toBe('Control');
    expect(en.reponseDecisive).toEqual({ question: 'Have you ever cheated on your partner?', reponse: 'Yes', points: 9 });
    expect(en.highlights[0].pique).toBe('Someone’s cooking. The question is who.');
    // Rien du calcul ne change.
    expect(en.score).toBe(68);
    expect(en.classements.tous?.position).toBe(fr.classements.tous?.position);
  });
});
