/**
 * @module dixmais/cohort
 * Comparaison du joueur aux gens de son sexe et de sa tranche d'âge.
 *
 * Les autres jeux du site demandent ces deux informations à l'entrée ; celui-ci
 * ne les réclame qu'au moment du rapport, et seulement à qui ne les a jamais
 * données — l'enregistrement est partagé entre tous les jeux. Un refus ne
 * bloque rien : le bloc de cohorte disparaît, le reste du rapport tient.
 *
 * LA COMPARAISON SE FAIT PHRASE PAR PHRASE
 *   Opposer la moyenne du joueur à la moyenne de sa cohorte sur *tous* les
 *   énoncés mesurerait surtout la différence entre deux paniers d'énoncés
 *   tirés au hasard. On demande donc à la base les moyennes de la cohorte sur
 *   les seules phrases que le joueur a vues.
 */

import type { PlayerProfile } from '@/types/game';
import { START_SCORE } from './scale';
import type { ProfilJuge } from './moyenne';

/** Ce que la base rend pour une info : les notes de la cohorte (migration
 * 030), sans celles de la session du joueur (migration 031). */
export interface CohortStat {
  statement_id: string;
  notes: number;
  avg_note: number;
}

export interface CohortComparison {
  /** Note moyenne du joueur sur les phrases que la cohorte a notées. */
  mine: number;
  /** Note moyenne de la cohorte sur ces mêmes phrases. */
  theirs: number;
  /** mine − theirs. Négatif = le joueur est plus sévère que sa cohorte. */
  gap: number;
  /** Nombre de phrases comparables. */
  sample: number;
  /** Notes de la cohorte derrière la comparaison, toutes phrases confondues. */
  votes: number;
}

/** Sous cinq phrases, l'écart tient au tirage plutôt qu'au tempérament. */
const MIN_SAMPLE = 5;

/**
 * Et sous ce total de notes, la cohorte n'est qu'une poignée de personnes.
 *
 * C'est ce seuil-ci qui protège du bruit, et non un plancher par phrase : la
 * comparaison moyenne plusieurs phrases, chacune pouvant ne reposer que sur
 * une ou deux notes. Quinze plutôt que vingt-cinq : les notes de la mécanique
 * actuelle viennent de démarrer, et un seuil plus haut aurait caché la
 * comparaison pendant des semaines.
 */
const MIN_TOTAL_NOTES = 15;

/** Tous les identifiants vus dans la session, sans doublon. */
export function statementIdsOf(profils: ProfilJuge[]): string[] {
  return [...new Set(profils.flatMap((p) => p.propositions.map((x) => x.id)))];
}

/**
 * `sessionId` : la session du joueur, exclue de la cohorte côté base. Ses
 * propres notes sont déjà enregistrées au moment du bilan ; sans cette
 * exclusion, sur une cohorte encore peu fournie, il se comparait surtout à
 * lui-même et l'écart tendait vers zéro.
 */
export async function fetchCohortStats(
  statementIds: string[],
  profile: PlayerProfile,
  sessionId?: string,
): Promise<CohortStat[]> {
  if (statementIds.length === 0) return [];

  const res = await fetch('/api/dixmais/cohort', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      statement_ids: statementIds,
      sex: profile.sex,
      age: profile.age,
      ...(sessionId ? { session_id: sessionId } : {}),
    }),
  });
  if (!res.ok) return [];

  const json = await res.json();
  return (json?.data ?? []) as CohortStat[];
}

export function compareToCohort(
  profils: ProfilJuge[],
  stats: CohortStat[],
): CohortComparison | null {
  const byId = new Map(stats.map((s) => [s.statement_id, s]));
  const pairs: [number, number][] = [];
  let votes = 0;

  for (const profil of profils) {
    profil.propositions.forEach((stmt, i) => {
      const stat = byId.get(stmt.id);
      if (!stat || !(Number(stat.notes) > 0)) return;
      pairs.push([profil.notes[i] ?? START_SCORE, Number(stat.avg_note)]);
      votes += Number(stat.notes);
    });
  }

  if (pairs.length < MIN_SAMPLE || votes < MIN_TOTAL_NOTES) return null;

  // Moyenne non pondérée des deux côtés : la moyenne de la cohorte est calculée
  // phrase par phrase puis moyennée comme le joueur moyenne ses propres notes.
  // Cumuler les notes brutes donnerait plus de poids aux phrases les plus
  // servies d'un côté seulement, et l'écart mesurerait ce déséquilibre.
  const mine = pairs.reduce((acc, p) => acc + p[0], 0) / pairs.length;
  const theirs = pairs.reduce((acc, p) => acc + p[1], 0) / pairs.length;
  return { mine, theirs, gap: mine - theirs, sample: pairs.length, votes };
}

// ---------------------------------------------------------------------------
// Mise en mots
// ---------------------------------------------------------------------------

const SEX_NOUNS: Record<string, string> = {
  homme: 'hommes',
  femme: 'femmes',
  autre: 'joueurs',
};

/**
 * Le groupe sans article : « femmes de 19-22 ans ».
 *
 * Deux variantes en découlent, parce que le français ne contracte pas de la
 * même façon selon la préposition — « face **aux** femmes » mais « plus sévère
 * que **les** femmes ». Une seule chaîne toute faite donnait « par rapport à
 * les femmes ».
 */
export function cohortNoun(profile: PlayerProfile): string {
  const sexe = SEX_NOUNS[profile.sex] ?? 'joueurs';
  return profile.age === '27+'
    ? `${sexe} de 27 ans et plus`
    : `${sexe} de ${profile.age} ans`;
}

/** « les femmes de 19-22 ans » — après « que », « comme ». */
export function cohortLabel(profile: PlayerProfile): string {
  return `les ${cohortNoun(profile)}`;
}

/** « aux femmes de 19-22 ans » — après « face », « par rapport ». */
export function cohortDative(profile: PlayerProfile): string {
  return `aux ${cohortNoun(profile)}`;
}

function fr(n: number, digits = 1): string {
  return Math.abs(n).toFixed(digits).replace('.', ',');
}

/**
 * La phrase que le joueur vient chercher. Les paliers reprennent ceux de la
 * sévérité générale, pour qu'un même écart se raconte de la même façon dans
 * les deux blocs.
 */
export function cohortSentence(
  comparison: CohortComparison,
  profile: PlayerProfile,
): string {
  const label = cohortLabel(profile);
  const { gap } = comparison;
  const pts = (n: number) => (Math.abs(n) >= 2 ? 'points' : 'point');

  if (gap <= -2) {
    return `Tu es extrêmement sévère par rapport ${cohortDative(profile)} : ${fr(gap)} ${pts(gap)} de moins à chaque révélation.`;
  }
  if (gap <= -0.8) {
    return `Tu es plus sévère que ${label} : ${fr(gap)} ${pts(gap)} de moins à chaque révélation.`;
  }
  if (gap < -0.3) {
    return `Tu es un peu plus dur que ${label}.`;
  }
  if (gap <= 0.3) {
    return `Tu notes exactement comme ${label}. Rien ne te distingue.`;
  }
  if (gap < 1.5) {
    return `Tu es plus indulgent que ${label} : ${fr(gap)} ${pts(gap)} de plus à chaque révélation.`;
  }
  return `Tu es bien plus tendre que ${label} : ${fr(gap)} ${pts(gap)} de plus à chaque révélation.`;
}
