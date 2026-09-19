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

import type { Archetype, QuestionAdmin, Resultat, StatQuestion, Tag, Verdict } from './types';
import type { ChoixResolu } from './score';
import {
  calculerAxes, classement, comparaison, part, pointNoir, reponseLaPlusChere,
  ressourcesPour, trouverArchetype, verdictPour,
} from './score';

let compteur = 0;
const id = (prefixe: string) => `${prefixe}-${++compteur}`;

// ---------------------------------------------------------------------------
// L'état
// ---------------------------------------------------------------------------

const tags: Tag[] = [
  { id: 'tag-communication', slug: 'communication', label: 'Communication', description: 'Dire les choses, écouter, gérer un désaccord', color: '#38bdf8', position: 1, isActive: true, ressourceSeuil: null, ressourceTexte: null, ressourceLien: null },
  { id: 'tag-respect', slug: 'respect', label: 'Respect', description: 'Limites, consentement, considération de l’autre', color: '#f472b6', position: 2, isActive: true, ressourceSeuil: null, ressourceTexte: null, ressourceLien: null },
  { id: 'tag-confiance', slug: 'confiance', label: 'Confiance', description: 'Jalousie, transparence, fiabilité', color: '#a78bfa', position: 3, isActive: true, ressourceSeuil: null, ressourceTexte: null, ressourceLien: null },
  { id: 'tag-controle', slug: 'controle', label: 'Contrôle', description: 'Emprise, surveillance, besoin de décider pour l’autre', color: '#fb923c', position: 4, isActive: true, ressourceSeuil: 55, ressourceTexte: 'Surveiller, fouiller, décider pour l’autre : ce sont des comportements qui ont un nom, et une échelle.', ressourceLien: '/ressources/violentometre' },
  { id: 'tag-egoisme', slug: 'egoisme', label: 'Égoïsme', description: 'Place laissée à l’autre, réciprocité, effort', color: '#facc15', position: 5, isActive: true, ressourceSeuil: null, ressourceTexte: null, ressourceLien: null },
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
  t: Omit<Tag, 'id'>,
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
// Archétypes
// ---------------------------------------------------------------------------

const archetypes: Archetype[] = [
  { id: 'a-1', tagA: 'tag-confiance', tagB: 'tag-controle', emoji: '👁️', titre: 'LE SURVEILLANT', soustitre: 'Tu sais toujours où est tout le monde. On ne t’a rien demandé.' },
  { id: 'a-2', tagA: 'tag-communication', tagB: 'tag-confiance', emoji: '🎭', titre: 'LE STRATÈGE', soustitre: 'Tu ne mens pas tout le temps. Juste quand ça sert.' },
  { id: 'a-3', tagA: 'tag-egoisme', tagB: 'tag-respect', emoji: '🪐', titre: 'LE CENTRE DU MONDE', soustitre: 'La conversation revient toujours au même endroit.' },
  { id: 'a-4', tagA: 'tag-controle', tagB: null, emoji: '🔑', titre: 'LE PROPRIÉTAIRE', soustitre: 'Tu appelles ça de l’attention. Personne d’autre ne l’appelle comme ça.' },
  { id: 'a-5', tagA: 'tag-communication', tagB: null, emoji: '📖', titre: 'LE NARRATEUR', soustitre: 'Dans chacune de tes histoires, tu es celui qu’on a mal compris.' },
  { id: 'a-6', tagA: 'tag-egoisme', tagB: null, emoji: '📣', titre: 'LE DONNEUR DE LEÇONS', soustitre: 'Tu as réfléchi à tout. Sauf à toi.' },
];

export function lireArchetypes(): Archetype[] {
  return archetypes.map((a) => ({ ...a }));
}

export function ecrireArchetype(
  archetypeId: string | null,
  a: { tagA: string; tagB: string | null; emoji: string | null; titre: string; soustitre: string | null },
): void {
  const existant = archetypes.find((x) => x.id === archetypeId);
  if (existant) Object.assign(existant, a);
  else archetypes.push({ id: id('a'), ...a });
}

export function supprimerArchetype(archetypeId: string): void {
  const i = archetypes.findIndex((a) => a.id === archetypeId);
  if (i >= 0) archetypes.splice(i, 1);
}

// ---------------------------------------------------------------------------
// Résultat
// ---------------------------------------------------------------------------

/**
 * Les parties jouées en local, pour que les liens de partage fonctionnent.
 *
 * Posées sur `globalThis` et non dans une variable de module : en
 * développement, Next compile les routes d'API et les composants serveur dans
 * deux graphes distincts, et chacun obtient sa propre instance du module. Une
 * partie enregistrée par la route de soumission serait donc introuvable par la
 * page de résultat partagé — un 404 qui n'existe qu'en local, et qui ferait
 * chercher un bug là où il n'y en a pas.
 */
const memoire = globalThis as unknown as { __rftParties?: Map<string, ChoixResolu[]> };
const partiesLocales = (memoire.__rftParties ??= new Map<string, ChoixResolu[]>());

interface ContexteFictif {
  questions: QuestionAdmin[];
  tags: Tag[];
  verdicts: Verdict[];
  archetypes: Archetype[];
}

/**
 * Le récap en local.
 *
 * Le score, le verdict, les axes, l'archétype, la réponse décisive et les
 * ressources sont les VRAIS — ils sortent du même calcul qu'en production.
 * Seuls les classements et les parts de réponses sont simulés, faute de parties
 * enregistrées.
 */
export function resultat(args: {
  ctx: ContexteFictif;
  choix: ChoixResolu[];
  score: number;
}): Resultat {
  const code = id('code');
  partiesLocales.set(code, args.choix);
  return composer(args.ctx, args.choix, args.score, code);
}

export function resultatParCode(ctx: ContexteFictif, code: string): Resultat | null {
  const choix = partiesLocales.get(code);
  if (!choix) return null;
  return composer(ctx, choix, choix.reduce((a, c) => a + c.points, 0), code);
}

function composer(
  ctx: ContexteFictif,
  choix: ChoixResolu[],
  score: number,
  code: string,
): Resultat {
  const population = [...scoresFictifs, score];
  const plusHauts = population.filter((s) => s > score).length;
  const moyenne = population.reduce((a, b) => a + b, 0) / population.length;
  const parId = new Map(ctx.questions.map((q) => [q.id, q]));

  const maxima = ctx.questions
    .filter((q) => q.active && q.reponses.length > 0)
    .map((q) => ({
      questionId: q.id,
      maxPoints: Math.max(...q.reponses.map((r) => r.points)),
      tagIds: q.tagIds,
    }));
  const axes = calculerAxes(choix, maxima, ctx.tags.filter((t) => t.isActive));

  const chere = reponseLaPlusChere(choix, score);
  const questionChere = chere && parId.get(chere.questionId);
  const reponseChere = questionChere?.reponses.find((r) => r.id === chere?.answerId);

  return {
    score,
    verdict: verdictPour(score, ctx.verdicts),
    classements: {
      sexe: classement(population.length, plusHauts),
      age: classement(Math.round(population.length / 2), Math.round(plusHauts / 2)),
    },
    axes,
    pointNoir: pointNoir(axes),
    comparaison: comparaison(score, [
      { cohorte: 'sexe_age', effectif: population.length, plusHauts, moyenne },
    ]),
    archetype: trouverArchetype(axes, ctx.archetypes),
    reponseDecisive:
      questionChere && reponseChere
        ? { question: questionChere.texte, reponse: reponseChere.texte, points: reponseChere.points }
        : null,
    ressources: ressourcesPour(axes, ctx.tags),
    highlights: choix
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
    codePartage: code,
  };
}

// ---------------------------------------------------------------------------
// Statistiques
// ---------------------------------------------------------------------------

/**
 * Des parts inventées mais COHÉRENTES : chaque population est tirée de sa
 * propre distribution, normalisée séparément, de sorte que les pourcentages
 * d'une question somment à cent chez les hommes comme chez les femmes.
 *
 * Une première version multipliait simplement la part générale par un facteur
 * selon le sexe. Elle affichait « 115 % des hommes », ce qui est impossible et
 * ce qu'aucune vraie donnée ne produira jamais — mais un écran qui montre 115 %
 * apprend à ne plus lire l'écran, et c'est le pire service à rendre à une page
 * de statistiques.
 *
 * Le penchant simulé : les femmes choisissent moins souvent les réponses
 * chargées. C'est faux, mais c'est la FORME que prendront les vraies données,
 * ce qui suffit à juger la page.
 */
export function stats(questionsActives: QuestionAdmin[]): StatQuestion[] {
  /** Répartit `total` selon des poids, sans perdre ni inventer de réponse. */
  const repartir = (total: number, poids: number[]): number[] => {
    const somme = poids.reduce((a, b) => a + b, 0) || 1;
    const parts = poids.map((p) => Math.floor((p / somme) * total));
    // Les arrondis à la baisse laissent un reste : il va à la réponse la plus
    // lourde, pour que le compte tombe juste.
    const reste = total - parts.reduce((a, b) => a + b, 0);
    if (parts.length > 0) parts[poids.indexOf(Math.max(...poids))] += reste;
    return parts;
  };

  return questionsActives.map((q, iq) => {
    const total = 180 + iq * 13;
    const totalH = Math.round(total * 0.62);
    const totalF = total - totalH;

    // Plus une réponse est chargée, moins elle est choisie — et l'effet est
    // plus marqué chez les femmes.
    const base = q.reponses.map((r) => 1 / (1 + Math.max(0, r.points)));
    const poidsH = q.reponses.map((r, i) => base[i] * (r.points > 0 ? 1.35 : 1));
    const poidsF = q.reponses.map((r, i) => base[i] * (r.points > 0 ? 0.55 : 1));

    const tous = repartir(total, base);
    const hommes = repartir(totalH, poidsH);
    const femmes = repartir(totalF, poidsF);

    return {
      questionId: q.id,
      texte: q.texte,
      total,
      totalH,
      totalF,
      reponses: q.reponses.map((r, i) => ({
        answerId: r.id,
        texte: r.texte,
        points: r.points,
        choix: tous[i],
        choixH: hommes[i],
        choixF: femmes[i],
      })),
    };
  });
}
