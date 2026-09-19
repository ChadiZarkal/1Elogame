/**
 * @module lib/rft/mock
 * Le Red Flag Test en mémoire, pour le développement local.
 *
 * POURQUOI CE FICHIER EXISTE
 *   Le dépôt n'embarque aucun fichier d'environnement : la machine de
 *   développement tourne avec `NEXT_PUBLIC_MOCK_MODE=true` et n'a donc pas de
 *   base. Sans ce module, l'administration serait un écran d'erreur en local et
 *   le jeu ne démarrerait pas — on ne pourrait rien vérifier avant la
 *   production, ce qui est exactement ce qu'il faut éviter.
 *
 * CE QU'IL N'EST PAS
 *   Ce n'est pas un jeu de données de production, et rien ici ne doit y
 *   ressembler. Le contenu sert à éprouver la mise en page — des réponses d'un
 *   mot à trois lignes, de une à cinq par question. Les vraies questions
 *   s'écrivent dans l'administration.
 *
 * L'état vit dans des variables de module : il disparaît au rechargement du
 * serveur de développement, et c'est très bien ainsi.
 */

import type { Axe, QuestionAdmin, Resultat, Tag, Verdict } from './types';
import type { ChoixResolu } from './score';
import { classement, part } from './score';

let compteur = 0;
const id = (prefixe: string) => `${prefixe}-${++compteur}`;

// ---------------------------------------------------------------------------
// L'état
// ---------------------------------------------------------------------------

const tags: Tag[] = [
  { id: 'tag-communication', slug: 'communication', label: 'Communication', description: 'Dire les choses, écouter, gérer un désaccord', color: '#38bdf8', position: 1, isActive: true },
  { id: 'tag-respect', slug: 'respect', label: 'Respect', description: 'Limites, consentement, considération de l’autre', color: '#f472b6', position: 2, isActive: true },
  { id: 'tag-confiance', slug: 'confiance', label: 'Confiance', description: 'Jalousie, transparence, fiabilité', color: '#a78bfa', position: 3, isActive: true },
  { id: 'tag-controle', slug: 'controle', label: 'Contrôle', description: 'Emprise, surveillance, besoin de décider pour l’autre', color: '#fb923c', position: 4, isActive: true },
  { id: 'tag-egoisme', slug: 'egoisme', label: 'Égoïsme', description: 'Place laissée à l’autre, réciprocité, effort', color: '#facc15', position: 5, isActive: true },
];

const verdicts: Verdict[] = [
  { id: 'v-0', minScore: 0, emoji: '🟢', titre: 'SUSPECT DE NORMALITÉ', soustitre: 'Soit tu vas bien, soit tu as menti avec application.' },
  { id: 'v-25', minScore: 25, emoji: '🟡', titre: 'QUELQUES TRAVAUX', soustitre: 'Rien d’irréparable. Deux ou trois choses à regarder en face.' },
  { id: 'v-50', minScore: 50, emoji: '🟠', titre: 'ÇA SE VOIT DE LOIN', soustitre: 'Tes proches le savent déjà. Toi, tu viens de l’apprendre.' },
  { id: 'v-75', minScore: 75, emoji: '🔴', titre: 'LE DRAPEAU EST PLANTÉ', soustitre: 'On ne va pas te mentir, on a relu le résultat deux fois.' },
  { id: 'v-100', minScore: 100, emoji: '☢️', titre: 'HORS BARÈME', soustitre: 'Tu as dépassé le maximum prévu. Personne n’avait anticipé ça.' },
];

const questions: QuestionAdmin[] = [
  {
    id: 'q-1', position: 0, active: true,
    texte: 'Ton ex t’écrit à 2 h du matin. Tu fais quoi ?',
    precision: null,
    tagIds: ['tag-confiance', 'tag-communication'],
    reponses: [
      { id: 'r-1a', position: 0, texte: 'Rien.', points: 0, pique: null },
      { id: 'r-1b', position: 1, texte: 'Je lis, je ne réponds pas, et je relis quatre fois', points: 4, pique: null },
      { id: 'r-1c', position: 2, texte: 'Je réponds tout de suite, puis je passe la fin de la nuit à regretter chaque mot que j’ai envoyé', points: 9, pique: 'Tu as tapé, effacé, retapé. On a tous vu les trois petits points.' },
      { id: 'r-1d', position: 3, texte: 'J’appelle.', points: 14, pique: 'Appeler un ex à 2 h du matin n’a jamais amélioré une situation. Jamais.' },
    ],
  },
  {
    id: 'q-2', position: 1, active: true,
    texte: 'On te demande pardon. Tu réponds « c’est rien » alors que ce n’est pas rien ?',
    precision: 'Sois honnête, personne ne lit tes réponses.',
    tagIds: ['tag-communication'],
    reponses: [
      { id: 'r-2a', position: 0, texte: 'Jamais', points: 0, pique: null },
      { id: 'r-2b', position: 1, texte: 'Tout le temps, et je le ressors trois semaines plus tard', points: 12, pique: 'Le pardon accepté en apparence est la plus lente des vengeances.' },
    ],
  },
  {
    id: 'q-3', position: 2, active: true,
    texte: 'Ton/ta partenaire sort sans toi. Ta première pensée ?',
    precision: null,
    tagIds: ['tag-controle', 'tag-confiance'],
    reponses: [
      { id: 'r-3a', position: 0, texte: 'Tant mieux.', points: 0, pique: null },
      { id: 'r-3b', position: 1, texte: 'Avec qui ?', points: 5, pique: null },
      { id: 'r-3c', position: 2, texte: 'Je demande une photo du groupe, l’air de rien, juste pour situer l’ambiance', points: 11, pique: '« Juste pour situer l’ambiance » est la phrase la plus chargée de ce test.' },
      { id: 'r-3d', position: 3, texte: 'Je regarde qui est en ligne pendant ce temps-là, et je note mentalement l’heure à laquelle chacun se déconnecte', points: 18, pique: 'Tu as transformé une soirée en enquête. Tu es douée ou doué, mais ce n’est pas rassurant.' },
      { id: 'r-3e', position: 4, texte: 'Aucune.', points: 1, pique: null },
    ],
  },
  {
    id: 'q-4', position: 3, active: true,
    texte: 'La dernière fois que tu as dit « je vais changer », c’était il y a combien de temps ?',
    precision: null,
    tagIds: ['tag-respect', 'tag-egoisme'],
    reponses: [
      { id: 'r-4a', position: 0, texte: 'Je ne l’ai jamais dit, je préfère ne rien promettre', points: 3, pique: null },
      { id: 'r-4b', position: 1, texte: 'Il y a longtemps, et j’ai changé', points: 0, pique: null },
      { id: 'r-4c', position: 2, texte: 'La semaine dernière. Et la semaine d’avant. Et celle d’avant.', points: 15, pique: 'Trois promesses en trois semaines : à ce rythme-là ce n’est plus une intention, c’est un abonnement.' },
    ],
  },
  {
    id: 'q-5', position: 4, active: true,
    texte: 'Dernière question : tu penses que ce test va te donner raison ?',
    precision: 'Il n’y a qu’une seule réponse. C’est déjà une information.',
    tagIds: ['tag-egoisme'],
    reponses: [
      { id: 'r-5a', position: 0, texte: 'Oui', points: 6, pique: 'Tout le monde clique sur « oui ». C’est bien ça le problème.' },
    ],
  },
];

/** Parties simulées, pour que les classements ne soient pas vides au premier essai. */
const scoresFictifs = [4, 9, 12, 18, 21, 25, 30, 31, 34, 38, 41, 44, 48, 52, 55, 61, 66, 70, 77, 88];

// ---------------------------------------------------------------------------
// Lectures
// ---------------------------------------------------------------------------

export function lireTags(): Tag[] {
  return tags.map((t) => ({ ...t }));
}

export function lireVerdicts(): Verdict[] {
  return verdicts.map((v) => ({ ...v })).sort((a, b) => a.minScore - b.minScore);
}

export function lireQuestions(): QuestionAdmin[] {
  return questions
    .map((q) => ({ ...q, tagIds: [...q.tagIds], reponses: q.reponses.map((r) => ({ ...r })) }))
    .sort((a, b) => a.position - b.position);
}

// ---------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------

export function ecrireQuestion(
  questionId: string | null,
  q: {
    texte: string; precision: string | null; active: boolean; position: number;
    tagIds: string[]; reponses: Array<{ texte: string; points: number; pique: string | null }>;
  },
): string {
  const reponses = q.reponses.map((r, i) => ({
    id: id('r'), position: i, texte: r.texte, points: r.points, pique: r.pique,
  }));

  const existante = questions.find((x) => x.id === questionId);
  if (existante) {
    Object.assign(existante, {
      texte: q.texte, precision: q.precision, active: q.active,
      position: q.position, tagIds: [...q.tagIds], reponses,
    });
    return existante.id;
  }

  const nouvelle: QuestionAdmin = {
    id: id('q'), position: q.position, texte: q.texte, precision: q.precision,
    active: q.active, tagIds: [...q.tagIds], reponses,
  };
  questions.push(nouvelle);
  return nouvelle.id;
}

export function supprimerQuestion(questionId: string): void {
  const i = questions.findIndex((q) => q.id === questionId);
  if (i >= 0) questions.splice(i, 1);
}

export function reordonner(ids: string[]): void {
  ids.forEach((questionId, position) => {
    const q = questions.find((x) => x.id === questionId);
    if (q) q.position = position;
  });
}

export function ecrireTag(
  tagId: string | null,
  t: { slug: string; label: string; description: string | null; color: string | null; position: number; isActive: boolean },
): void {
  const existant = tags.find((x) => x.id === tagId);
  if (existant) Object.assign(existant, t);
  else tags.push({ id: id('tag'), ...t });
}

export function supprimerTag(tagId: string): void {
  const i = tags.findIndex((t) => t.id === tagId);
  if (i >= 0) tags.splice(i, 1);
  for (const q of questions) q.tagIds = q.tagIds.filter((x) => x !== tagId);
}

export function ecrireVerdict(
  verdictId: string | null,
  v: { minScore: number; emoji: string | null; titre: string; soustitre: string | null },
): void {
  const existant = verdicts.find((x) => x.id === verdictId);
  if (existant) Object.assign(existant, v);
  else verdicts.push({ id: id('v'), ...v });
}

export function supprimerVerdict(verdictId: string): void {
  const i = verdicts.findIndex((v) => v.id === verdictId);
  if (i >= 0) verdicts.splice(i, 1);
}

// ---------------------------------------------------------------------------
// Résultat
// ---------------------------------------------------------------------------

/**
 * Le récap en local : le score, le verdict et les axes sont les vrais — ils
 * sortent du même calcul qu'en production. Seuls les classements et les parts
 * de réponses sont simulés, faute de parties enregistrées.
 */
export function resultat(args: {
  score: number;
  verdict: Verdict | null;
  axes: Axe[];
  choix: ChoixResolu[];
  questions: QuestionAdmin[];
}): Resultat {
  const population = [...scoresFictifs, args.score];
  const plusHauts = population.filter((s) => s > args.score).length;
  const parId = new Map(args.questions.map((q) => [q.id, q]));

  return {
    score: args.score,
    verdict: args.verdict,
    classements: {
      sexe: classement(population.length, plusHauts),
      age: classement(Math.round(population.length / 2), Math.round(plusHauts / 2)),
    },
    axes: args.axes,
    highlights: args.choix
      .map((c) => {
        const question = parId.get(c.questionId);
        const reponse = question?.reponses.find((r) => r.id === c.answerId);
        if (!question || !reponse?.pique) return null;
        // Une part inventée mais stable : la réponse la plus chargée de la
        // question est aussi la plus rare, ce qui est presque toujours vrai.
        const rang = [...question.reponses].sort((a, b) => b.points - a.points)
          .findIndex((r) => r.id === reponse.id);
        return {
          question: question.texte,
          reponse: reponse.texte,
          pique: reponse.pique,
          part: part(rang + 1, question.reponses.length + 2),
        };
      })
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .sort((a, b) => a.part - b.part)
      .slice(0, 3),
    participants: population.length,
  };
}
