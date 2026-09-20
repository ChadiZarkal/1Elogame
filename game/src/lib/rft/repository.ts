/**
 * @module lib/rft/repository
 * Tout l'accès à la base pour le Red Flag Test. Serveur uniquement.
 *
 * POURQUOI TOUT PASSE PAR ICI
 *   Les tables `rft_*` ont RLS actif et aucune politique : la clé anonyme n'y
 *   lit rien. Ce n'est pas un oubli — `rft_answers.points` EST le barème, et
 *   une lecture publique le rendrait consultable par quiconque ouvre
 *   l'inspecteur. Ce module est donc le seul chemin, et il parle en
 *   `service_role`.
 *
 * LA RÈGLE QUI NE SE NÉGOCIE PAS
 *   `lireQuizPublic` ne renvoie jamais de points. Le navigateur reçoit un
 *   indice de 0 à 2, qui dit le sens du déplacement de l'aiguille et rien de
 *   plus. Le score est recalculé ici, à partir des identifiants de réponses
 *   envoyés par le client et des points relus en base.
 *
 * LE SILENCE DE SUPABASE
 *   Le client JS ne lève pas : il retourne `{ error }`. Une écriture refusée
 *   ressemble donc à une réussite si l'on ne regarde pas. Chaque appel est
 *   vérifié, et `verifier()` transforme l'erreur en exception avec le message
 *   de Postgres — que les routes d'administration affichent en clair.
 */

import 'server-only';
import { isMockMode } from '@/lib/apiHelpers';
import {
  calculerAxes,
  calculerScore,
  classement,
  comparaison,
  indicePour,
  maximumAtteignable,
  part,
  pointNoir,
  legendeAge,
  legendeCohorte,
  legendeSexe,
  reponseLaPlusChere,
  ressourcesPour,
  trouverArchetype,
  verdictPour,
  type ChoixResolu,
  type CohorteBrute,
  type MaximumQuestion,
  type NomCohorte,
} from './score';
import type {
  Archetype,
  Highlight,
  QuestionAdmin,
  QuizPublic,
  Resultat,
  Soumission,
  StatQuestion,
  Tag,
  Verdict,
} from './types';
import * as fictif from './mock';

// ---------------------------------------------------------------------------
// Plomberie
// ---------------------------------------------------------------------------

type Erreur = { message: string; code?: string } | null;

/** Transforme le `{ error }` silencieux de Supabase en exception parlante. */
function verifier(erreur: Erreur, quoi: string): void {
  if (erreur) throw new Error(`${quoi} : ${erreur.message}`);
}

async function client() {
  const { createServerClient } = await import('@/lib/supabase');
  // Les tables `rft_*` ne figurent pas dans les types générés de la base, qui
  // datent d'avant cette migration. Le typage utile est celui des fonctions
  // exportées ci-dessous, pas celui du client.
  return createServerClient() as unknown as {
    from: (table: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
    rpc: (nom: string, params: Record<string, unknown>) => Promise<{ data: any; error: Erreur }>; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}

// ---------------------------------------------------------------------------
// Lectures de contenu
// ---------------------------------------------------------------------------

export async function lireTags(): Promise<Tag[]> {
  if (isMockMode()) return fictif.lireTags();

  const supabase = await client();
  const { data, error } = await supabase
    .from('rft_tags')
    .select('id, slug, label, description, color, position, is_active, resource_seuil, resource_texte, resource_lien')
    .order('position');
  verifier(error, 'Lecture des tags');

  return (data ?? []).map(rangeeVersTag);
}

export async function lireVerdicts(): Promise<Verdict[]> {
  if (isMockMode()) return fictif.lireVerdicts();

  const supabase = await client();
  const { data, error } = await supabase
    .from('rft_verdicts')
    .select('id, min_score, emoji, title, subtitle')
    .order('min_score');
  verifier(error, 'Lecture des verdicts');

  return (data ?? []).map(rangeeVersVerdict);
}

/**
 * Le questionnaire complet, points compris. Réservé à l'administration.
 *
 * Trois requêtes plutôt qu'une jointure imbriquée : PostgREST sait imbriquer,
 * mais il applique alors sa limite de mille lignes à l'ensemble aplati, et un
 * questionnaire de quarante questions à cinq réponses s'en approche plus vite
 * qu'on ne croit.
 */
export async function lireQuestionsAdmin(): Promise<QuestionAdmin[]> {
  if (isMockMode()) return fictif.lireQuestions();

  const supabase = await client();

  const [questions, reponses, liens] = await Promise.all([
    supabase
      .from('rft_questions')
      .select('id, position, text, helper_text, is_active')
      .order('position'),
    supabase
      .from('rft_answers')
      .select('id, question_id, position, text, points, humor_message')
      .order('position'),
    supabase.from('rft_question_tags').select('question_id, tag_id'),
  ]);

  verifier(questions.error, 'Lecture des questions');
  verifier(reponses.error, 'Lecture des réponses');
  verifier(liens.error, 'Lecture des tags de questions');

  const parQuestion = new Map<string, QuestionAdmin['reponses']>();
  for (const r of reponses.data ?? []) {
    const liste = parQuestion.get(r.question_id) ?? [];
    liste.push({
      id: r.id,
      position: r.position,
      texte: r.text,
      points: r.points,
      pique: r.humor_message,
    });
    parQuestion.set(r.question_id, liste);
  }

  const tagsParQuestion = new Map<string, string[]>();
  for (const l of liens.data ?? []) {
    tagsParQuestion.set(l.question_id, [...(tagsParQuestion.get(l.question_id) ?? []), l.tag_id]);
  }

  return (questions.data ?? []).map((q: RangeeQuestion) => ({
    id: q.id,
    position: q.position,
    texte: q.text,
    precision: q.helper_text,
    active: q.is_active,
    tagIds: tagsParQuestion.get(q.id) ?? [],
    reponses: parQuestion.get(q.id) ?? [],
  }));
}

/**
 * Ce que le navigateur reçoit : les énoncés, les réponses, et pas un point.
 *
 * Les questions sans réponse sont écartées ici plutôt qu'affichées vides — une
 * question en cours de rédaction dans l'admin ne doit pas bloquer une partie
 * sur un écran sans bouton.
 */
export async function lireQuizPublic(): Promise<QuizPublic> {
  const [questions, tags] = await Promise.all([lireQuestionsAdmin(), lireTags()]);

  return {
    questions: questions
      .filter((q) => q.active && q.reponses.length > 0)
      .map((q) => {
        const tous = q.reponses.map((r) => r.points);
        return {
          id: q.id,
          texte: q.texte,
          precision: q.precision,
          reponses: q.reponses.map((r) => ({
            id: r.id,
            texte: r.texte,
            indice: indicePour(r.points, tous),
          })),
        };
      }),
    tags: tags.filter((t) => t.isActive).map((t) => ({ id: t.id, label: t.label, color: t.color })),
  };
}

// ---------------------------------------------------------------------------
// Écritures de contenu
// ---------------------------------------------------------------------------

export interface EcritureQuestion {
  texte: string;
  precision: string | null;
  active: boolean;
  position: number;
  tagIds: string[];
  reponses: Array<{ texte: string; points: number; pique: string | null }>;
}

/**
 * Crée ou remplace une question, ses réponses et ses tags.
 *
 * Les réponses sont effacées puis réinsérées plutôt que rapprochées une à une.
 * C'est assumé : un éditeur permet d'ajouter, supprimer et réordonner dans la
 * même passe, et rapprocher l'ancien du nouveau demanderait des identifiants
 * stables côté formulaire pour un gain nul — personne ne consulte l'historique
 * d'une réponse. Le prix est connu : les parties déjà enregistrées perdent le
 * lien vers la réponse choisie, par la cascade. C'est pourquoi l'admin propose
 * de désactiver une question plutôt que de la réécrire une fois le test en
 * ligne.
 */
export async function ecrireQuestion(id: string | null, q: EcritureQuestion): Promise<string> {
  if (isMockMode()) return fictif.ecrireQuestion(id, q);

  const supabase = await client();
  let questionId = id;

  if (questionId) {
    const { error } = await supabase
      .from('rft_questions')
      .update({
        text: q.texte,
        helper_text: q.precision,
        is_active: q.active,
        position: q.position,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select('id');
    verifier(error, 'Mise à jour de la question');
  } else {
    const { data, error } = await supabase
      .from('rft_questions')
      .insert({
        text: q.texte,
        helper_text: q.precision,
        is_active: q.active,
        position: q.position,
      })
      .select('id')
      .single();
    verifier(error, 'Création de la question');
    questionId = (data as { id: string }).id;
  }

  const suppressions = await Promise.all([
    supabase.from('rft_answers').delete().eq('question_id', questionId),
    supabase.from('rft_question_tags').delete().eq('question_id', questionId),
  ]);
  verifier(suppressions[0].error, 'Nettoyage des réponses');
  verifier(suppressions[1].error, 'Nettoyage des tags');

  if (q.reponses.length > 0) {
    const { error } = await supabase.from('rft_answers').insert(
      q.reponses.map((r, i) => ({
        question_id: questionId,
        position: i,
        text: r.texte,
        points: r.points,
        humor_message: r.pique,
      })),
    );
    verifier(error, 'Écriture des réponses');
  }

  if (q.tagIds.length > 0) {
    const { error } = await supabase
      .from('rft_question_tags')
      .insert(q.tagIds.map((tagId) => ({ question_id: questionId, tag_id: tagId })));
    verifier(error, 'Écriture des tags');
  }

  return questionId as string;
}

export async function supprimerQuestion(id: string): Promise<void> {
  if (isMockMode()) return fictif.supprimerQuestion(id);

  const supabase = await client();
  const { error } = await supabase.from('rft_questions').delete().eq('id', id);
  verifier(error, 'Suppression de la question');
}

export async function reordonnerQuestions(ids: string[]): Promise<void> {
  if (isMockMode()) return fictif.reordonner(ids);

  const supabase = await client();
  // Une par une : PostgREST n'a pas d'écriture en lot avec des valeurs
  // différentes par ligne, et un `upsert` exigerait de renvoyer tout le contenu
  // de chaque question — donc de risquer de l'écraser avec une version périmée.
  const resultats = await Promise.all(
    ids.map((id, position) =>
      supabase.from('rft_questions').update({ position }).eq('id', id).select('id'),
    ),
  );
  for (const r of resultats) verifier(r.error, 'Réordonnancement');
}

export async function ecrireTag(
  id: string | null,
  t: EcritureTag,
): Promise<void> {
  if (isMockMode()) return fictif.ecrireTag(id, t);

  const supabase = await client();
  const rangee = {
    slug: t.slug,
    label: t.label,
    description: t.description,
    color: t.color,
    position: t.position,
    is_active: t.isActive,
    resource_seuil: t.ressourceSeuil,
    resource_texte: t.ressourceTexte,
    resource_lien: t.ressourceLien,
  };

  const { error } = id
    ? await supabase.from('rft_tags').update(rangee).eq('id', id).select('id')
    : await supabase.from('rft_tags').insert(rangee).select('id');
  verifier(error, id ? 'Mise à jour du tag' : 'Création du tag');
}

export async function supprimerTag(id: string): Promise<void> {
  if (isMockMode()) return fictif.supprimerTag(id);

  const supabase = await client();
  const { error } = await supabase.from('rft_tags').delete().eq('id', id);
  verifier(error, 'Suppression du tag');
}

export async function ecrireVerdict(
  id: string | null,
  v: { minScore: number; emoji: string | null; titre: string; soustitre: string | null },
): Promise<void> {
  if (isMockMode()) return fictif.ecrireVerdict(id, v);

  const supabase = await client();
  const rangee = {
    min_score: v.minScore,
    emoji: v.emoji,
    title: v.titre,
    subtitle: v.soustitre,
  };

  const { error } = id
    ? await supabase.from('rft_verdicts').update(rangee).eq('id', id).select('id')
    : await supabase.from('rft_verdicts').insert(rangee).select('id');
  verifier(error, id ? 'Mise à jour du verdict' : 'Création du verdict');
}

export async function supprimerVerdict(id: string): Promise<void> {
  if (isMockMode()) return fictif.supprimerVerdict(id);

  const supabase = await client();
  const { error } = await supabase.from('rft_verdicts').delete().eq('id', id);
  verifier(error, 'Suppression du verdict');
}

// ---------------------------------------------------------------------------
// Archétypes
// ---------------------------------------------------------------------------

export interface EcritureTag {
  slug: string;
  label: string;
  description: string | null;
  color: string | null;
  position: number;
  isActive: boolean;
  ressourceSeuil: number | null;
  ressourceTexte: string | null;
  ressourceLien: string | null;
}

export interface EcritureArchetype {
  tagA: string;
  tagB: string | null;
  emoji: string | null;
  titre: string;
  soustitre: string | null;
}

export async function lireArchetypes(): Promise<Archetype[]> {
  if (isMockMode()) return fictif.lireArchetypes();

  const supabase = await client();
  const { data, error } = await supabase
    .from('rft_archetypes')
    .select('id, tag_a, tag_b, emoji, title, subtitle');
  verifier(error, 'Lecture des archétypes');

  return (data ?? []).map((r: RangeeArchetype) => ({
    id: r.id,
    tagA: r.tag_a,
    tagB: r.tag_b,
    emoji: r.emoji,
    titre: r.title,
    soustitre: r.subtitle,
  }));
}

/**
 * La paire est rangée avant d'être écrite.
 *
 * La base impose `tag_a < tag_b` pour qu'« Emprise + Loyauté » et
 * « Loyauté + Emprise » soient la même ligne. Laisser le formulaire décider de
 * l'ordre ferait échouer une saisie sur deux, avec un message de contrainte
 * que personne n'aurait envie de lire.
 */
export async function ecrireArchetype(id: string | null, a: EcritureArchetype): Promise<void> {
  if (isMockMode()) return fictif.ecrireArchetype(id, a);

  const [tagA, tagB] = a.tagB === null
    ? [a.tagA, null]
    : [a.tagA, a.tagB].sort() as [string, string];

  const supabase = await client();
  const rangee = {
    tag_a: tagA,
    tag_b: tagB,
    emoji: a.emoji,
    title: a.titre,
    subtitle: a.soustitre,
  };

  const { error } = id
    ? await supabase.from('rft_archetypes').update(rangee).eq('id', id).select('id')
    : await supabase.from('rft_archetypes').insert(rangee).select('id');
  verifier(error, id ? 'Mise à jour de l’archétype' : 'Création de l’archétype');
}

export async function supprimerArchetype(id: string): Promise<void> {
  if (isMockMode()) return fictif.supprimerArchetype(id);

  const supabase = await client();
  const { error } = await supabase.from('rft_archetypes').delete().eq('id', id);
  verifier(error, 'Suppression de l’archétype');
}

// ---------------------------------------------------------------------------
// Une partie
// ---------------------------------------------------------------------------

/** En dessous de cette part, une réponse ne mérite pas d'être signalée. */
const HIGHLIGHTS_MAX = 3;

/**
 * Le code qui sert d'adresse publique à une partie.
 *
 * Tiré au hasard plutôt que dérivé de l'identifiant : un code devinable
 * laisserait remonter à des résultats que personne n'a partagés. Neuf
 * caractères en base 36 donnent cent mille milliards de combinaisons, ce qui
 * rend la collision et l'énumération aussi improbables l'une que l'autre.
 */
function codePartage(): string {
  const octets = new Uint8Array(9);
  crypto.getRandomValues(octets);
  return Array.from(octets, (o) => (o % 36).toString(36)).join('');
}

/** Tout le contenu dont dépend le calcul d'un résultat. */
async function contexte() {
  const [questions, tags, verdicts, archetypes] = await Promise.all([
    lireQuestionsAdmin(),
    lireTags(),
    lireVerdicts(),
    lireArchetypes(),
  ]);
  return { questions, tags, verdicts, archetypes };
}

type Contexte = Awaited<ReturnType<typeof contexte>>;

/**
 * Résout les identifiants envoyés par le client en réponses munies de leurs
 * points, relus en base.
 *
 * Une réponse inconnue est ignorée plutôt que fatale : entre une question
 * supprimée pendant qu'on y répondait et un écran d'erreur en fin de partie, le
 * choix est vite fait.
 */
function resoudre(
  questions: QuestionAdmin[],
  choix: Array<{ questionId: string; answerId: string }>,
): ChoixResolu[] {
  const parId = new Map(questions.map((q) => [q.id, q]));
  const resolus: ChoixResolu[] = [];

  for (const c of choix) {
    const question = parId.get(c.questionId);
    const reponse = question?.reponses.find((r) => r.id === c.answerId);
    if (!question || !reponse) continue;
    resolus.push({
      questionId: question.id,
      answerId: reponse.id,
      points: reponse.points,
      tagIds: question.tagIds,
    });
  }
  return resolus;
}

/** Le maximum atteignable, question par question. */
function maximaDe(questions: QuestionAdmin[]): MaximumQuestion[] {
  return questions
    .filter((q) => q.active && q.reponses.length > 0)
    .map((q) => ({
      questionId: q.id,
      maxPoints: Math.max(...q.reponses.map((r) => r.points)),
      tagIds: q.tagIds,
    }));
}

/**
 * Assemble le résultat affiché, à partir des réponses et des agrégats.
 *
 * Partagé entre la fin de partie et la relecture d'un résultat partagé : ces
 * deux écrans DOIVENT dire la même chose, et la seule façon de s'en assurer est
 * qu'ils passent par le même code. Le résultat n'est d'ailleurs jamais figé en
 * base — il se recalcule, pour qu'un lien partagé n'affiche pas éternellement
 * des pourcentages de cohorte arrêtés au jour de la partie.
 */
function composer(
  ctx: Contexte,
  choix: ChoixResolu[],
  brutes: CohorteBrute[],
  parts: Map<string, number>,
  code: string | null,
  profil: { sexe: string | null; age: string | null },
): Resultat {
  const score = calculerScore(choix);
  const axes = calculerAxes(choix, maximaDe(ctx.questions), ctx.tags.filter((t) => t.isActive));

  const cohorte = (nom: NomCohorte) => brutes.find((c) => c.cohorte === nom);
  const rang = (nom: NomCohorte, legende: string) => {
    const c = cohorte(nom);
    return c ? classement(c.effectif, c.plusHauts, legende) : null;
  };

  const chere = reponseLaPlusChere(choix, score);
  const question = chere && ctx.questions.find((q) => q.id === chere.questionId);
  const reponse = question?.reponses.find((r) => r.id === chere?.answerId);

  return {
    score,
    verdict: verdictPour(score, ctx.verdicts),
    classements: {
      tous: rang('tous', 'de tout le monde'),
      sexe: profil.sexe ? rang('sexe', legendeSexe(profil.sexe)) : null,
      age: profil.age ? rang('age', legendeAge(profil.age)) : null,
    },
    axes,
    pointNoir: pointNoir(axes),
    comparaison: (() => {
      const c = comparaison(score, brutes);
      return c ? { ...c, legende: legendeCohorte(c.cohorte, profil) } : null;
    })(),
    archetype: trouverArchetype(axes, ctx.archetypes),
    reponseDecisive:
      question && reponse
        ? { question: question.texte, reponse: reponse.texte, points: reponse.points }
        : null,
    ressources: ressourcesPour(axes, ctx.tags),
    highlights: construireHighlights(choix, ctx.questions, parts),
    participants: cohorte('tous')?.effectif ?? 1,
    codePartage: code,
  };
}

/**
 * Enregistre la partie et renvoie son résultat.
 *
 * Le score est calculé ICI, à partir des points relus en base : le client
 * n'envoie que des identifiants de réponses. Un navigateur qui mentirait sur
 * ses points n'obtiendrait rien — il n'a pas de point à envoyer.
 *
 * L'enregistrement précède le classement, et c'est voulu : la partie doit être
 * dans la population qu'elle interroge, sinon le premier joueur serait comparé
 * au vide et le rang bougerait d'une partie à l'autre pour un même score.
 */
export async function enregistrerPartie(s: Soumission): Promise<Resultat> {
  const ctx = await contexte();
  const choix = resoudre(ctx.questions, s.choix);
  const score = calculerScore(choix);

  if (isMockMode()) {
    return fictif.resultat({ ctx, choix, score, profil: { sexe: s.sexe, age: s.age } });
  }

  const supabase = await client();
  const code = codePartage();

  const { data: run, error: erreurRun } = await supabase
    .from('rft_runs')
    .insert({ score, sex: s.sexe, age: s.age, duration_ms: s.dureeMs, share_code: code })
    .select('id')
    .single();
  verifier(erreurRun, 'Enregistrement de la partie');
  const runId = (run as { id: string }).id;

  if (choix.length > 0) {
    const { error } = await supabase.from('rft_run_answers').insert(
      choix.map((c) => ({ run_id: runId, question_id: c.questionId, answer_id: c.answerId })),
    );
    // Un échec ici fausse les statistiques futures sans rien casser pour ce
    // joueur : on le signale dans les journaux, on ne perd pas son résultat.
    if (error) console.error('[RFT] Réponses de partie non enregistrées :', error.message);
  }

  const { brutes, parts } = await agreger(score, s.sexe, s.age, choix);
  return composer(ctx, choix, brutes, parts, code, { sexe: s.sexe, age: s.age });
}

/**
 * Le résultat d'une partie partagée, relu depuis son code.
 *
 * Recalculé, jamais relu d'un cliché : les classements et les parts de réponses
 * suivent la population d'aujourd'hui. Un lien ouvert six mois plus tard montre
 * donc le même score, mais un rang qui a pu bouger — ce qui est la vérité.
 */
export async function lireResultatParCode(code: string): Promise<Resultat | null> {
  if (isMockMode()) return fictif.resultatParCode(await contexte(), code);

  const supabase = await client();

  const { data: run, error } = await supabase
    .from('rft_runs')
    .select('id, score, sex, age')
    .eq('share_code', code)
    .maybeSingle();
  verifier(error, 'Lecture de la partie partagée');
  if (!run) return null;

  const partie = run as { id: string; score: number; sex: string | null; age: string | null };

  const { data: reponses, error: erreurReponses } = await supabase
    .from('rft_run_answers')
    .select('question_id, answer_id')
    .eq('run_id', partie.id);
  verifier(erreurReponses, 'Lecture des réponses de la partie');

  const ctx = await contexte();
  const choix = resoudre(
    ctx.questions,
    ((reponses ?? []) as Array<{ question_id: string; answer_id: string }>).map((r) => ({
      questionId: r.question_id,
      answerId: r.answer_id,
    })),
  );

  // Le score relu, et non recalculé : une question dont le barème a changé
  // depuis ne doit pas réécrire après coup le résultat de quelqu'un.
  const { brutes, parts } = await agreger(partie.score, partie.sex, partie.age, choix);
  const resultat = composer(ctx, choix, brutes, parts, code, {
    sexe: partie.sex,
    age: partie.age,
  });

  return { ...resultat, score: partie.score };
}

/** Les deux agrégats dont dépend le récap : cohortes et parts de réponses. */
async function agreger(
  score: number,
  sexe: string | null,
  age: string | null,
  choix: ChoixResolu[],
): Promise<{ brutes: CohorteBrute[]; parts: Map<string, number> }> {
  const supabase = await client();

  const [cohortes, parts] = await Promise.all([
    supabase.rpc('rft_cohortes', { p_score: score, p_sex: sexe, p_age: age }),
    choix.length > 0
      ? supabase.rpc('rft_parts_reponses', { p_answer_ids: choix.map((c) => c.answerId) })
      : Promise.resolve({ data: [], error: null }),
  ]);
  verifier(cohortes.error, 'Lecture des classements');
  verifier(parts.error, 'Lecture des parts de réponses');

  type LigneCohorte = {
    cohorte: NomCohorte;
    effectif: number;
    plus_hauts: number;
    // Postgres rend `avg` en NUMERIC, que PostgREST sérialise en chaîne pour ne
    // pas perdre de précision — et `null` quand la cohorte est vide.
    moyenne: string | number | null;
  };
  type LignePart = { answer_id: string; choix: number; total_question: number };

  return {
    brutes: ((cohortes.data as LigneCohorte[] | null) ?? []).map((c) => ({
      cohorte: c.cohorte,
      effectif: Number(c.effectif),
      plusHauts: Number(c.plus_hauts),
      moyenne: c.moyenne === null ? null : Number(c.moyenne),
    })),
    parts: new Map(
      ((parts.data as LignePart[] | null) ?? []).map((p) => [
        p.answer_id,
        part(Number(p.choix), Number(p.total_question)),
      ]),
    ),
  };
}

// ---------------------------------------------------------------------------
// Mise en forme du récap
// ---------------------------------------------------------------------------

/**
 * Les réponses qui distinguent le plus le joueur.
 *
 * Triées par rareté croissante : une réponse choisie par 4 % des joueurs dit
 * quelque chose, une réponse choisie par 80 % ne dit rien. Seules celles qui
 * portent une pique sont retenues — sans texte à afficher, la ligne serait un
 * pourcentage nu.
 */
function construireHighlights(
  choix: ChoixResolu[],
  questions: QuestionAdmin[],
  parts: Map<string, number>,
): Highlight[] {
  const parId = new Map(questions.map((q) => [q.id, q]));

  return choix
    .map((c) => {
      const question = parId.get(c.questionId);
      const reponse = question?.reponses.find((r) => r.id === c.answerId);
      if (!question || !reponse?.pique) return null;
      return {
        question: question.texte,
        reponse: reponse.texte,
        pique: reponse.pique,
        part: parts.get(c.answerId) ?? 0,
      };
    })
    .filter((h): h is Highlight => h !== null)
    .sort((a, b) => a.part - b.part)
    .slice(0, HIGHLIGHTS_MAX);
}

// ---------------------------------------------------------------------------
// Statistiques publiques
// ---------------------------------------------------------------------------

/**
 * Ce que la page publique affiche : chaque question, chaque réponse, et la part
 * qui l'a choisie — au total, chez les hommes, chez les femmes.
 *
 * Les points n'y figurent pas. La page est publique : y faire apparaître le
 * barème le rendrait consultable par tout le monde, et le test truquable.
 */
export async function lireStatsPubliques(): Promise<StatQuestion[]> {
  const questions = (await lireQuestionsAdmin()).filter(
    (q) => q.active && q.reponses.length > 0,
  );

  if (isMockMode()) return fictif.stats(questions);

  const supabase = await client();
  const { data, error } = await supabase.rpc('rft_stats_publiques', {});
  verifier(error, 'Lecture des statistiques');

  type Ligne = {
    question_id: string; answer_id: string;
    choix: number; choix_h: number; choix_f: number;
    total: number; total_h: number; total_f: number;
  };
  const parReponse = new Map(
    ((data as Ligne[] | null) ?? []).map((l) => [l.answer_id, l]),
  );

  return questions.map((q) => {
    const premiere = q.reponses.map((r) => parReponse.get(r.id)).find(Boolean);
    return {
      questionId: q.id,
      texte: q.texte,
      total: Number(premiere?.total ?? 0),
      totalH: Number(premiere?.total_h ?? 0),
      totalF: Number(premiere?.total_f ?? 0),
      reponses: q.reponses.map((r) => {
        const l = parReponse.get(r.id);
        return {
          answerId: r.id,
          texte: r.texte,
          points: r.points,
          choix: Number(l?.choix ?? 0),
          choixH: Number(l?.choix_h ?? 0),
          choixF: Number(l?.choix_f ?? 0),
        };
      }),
    };
  });
}

// ---------------------------------------------------------------------------
// Le budget de points, pour l'administration
// ---------------------------------------------------------------------------

/** Le score maximum que le questionnaire peut rendre, en l'état. */
export function budget(questions: QuestionAdmin[]): number {
  return maximumAtteignable(
    questions
      .filter((q) => q.active && q.reponses.length > 0)
      .map((q) => ({
        questionId: q.id,
        maxPoints: Math.max(...q.reponses.map((r) => r.points)),
        tagIds: q.tagIds,
      })),
  );
}

// ---------------------------------------------------------------------------
// Conversions
// ---------------------------------------------------------------------------

interface RangeeArchetype {
  id: string;
  tag_a: string;
  tag_b: string | null;
  emoji: string | null;
  title: string;
  subtitle: string | null;
}

interface RangeeQuestion {
  id: string;
  position: number;
  text: string;
  helper_text: string | null;
  is_active: boolean;
}

function rangeeVersTag(r: {
  id: string; slug: string; label: string; description: string | null;
  color: string | null; position: number; is_active: boolean;
  resource_seuil: number | null; resource_texte: string | null; resource_lien: string | null;
}): Tag {
  return {
    id: r.id,
    slug: r.slug,
    label: r.label,
    description: r.description,
    color: r.color,
    position: r.position,
    isActive: r.is_active,
    ressourceSeuil: r.resource_seuil,
    ressourceTexte: r.resource_texte,
    ressourceLien: r.resource_lien,
  };
}

function rangeeVersVerdict(r: {
  id: string; min_score: number; emoji: string | null; title: string; subtitle: string | null;
}): Verdict {
  return {
    id: r.id,
    minScore: r.min_score,
    emoji: r.emoji,
    titre: r.title,
    soustitre: r.subtitle,
  };
}
