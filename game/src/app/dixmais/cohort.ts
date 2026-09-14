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
import type { PlayedRound } from './report';

export interface CohortStat {
  statement_id: string;
  votes: number;
  avg_delta: number;
  elimination_rate: number;
}

export interface CohortComparison {
  /** Moyenne du joueur sur les phrases où la cohorte est mesurable. */
  mine: number;
  /** Moyenne de la cohorte sur ces mêmes phrases. */
  theirs: number;
  /** mine − theirs. Négatif = le joueur est plus sévère que sa cohorte. */
  gap: number;
  /** Nombre de phrases comparables. */
  sample: number;
}

/**
 * Même seuil que la sévérité générale : sous quatre phrases, l'écart tient au
 * tirage.
 */
const MIN_SAMPLE = 4;

/** Tous les identifiants vus dans la session, sans doublon. */
export function statementIdsOf(rounds: PlayedRound[]): string[] {
  return [...new Set(rounds.flatMap((r) => r.played.map((p) => p.id)))];
}

export async function fetchCohortStats(
  statementIds: string[],
  profile: PlayerProfile,
): Promise<CohortStat[]> {
  if (statementIds.length === 0) return [];

  const res = await fetch('/api/dixmais/cohort', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statement_ids: statementIds, sex: profile.sex, age: profile.age }),
  });
  if (!res.ok) return [];

  const json = await res.json();
  return (json?.data ?? []) as CohortStat[];
}

/**
 * @remarks Les votes du joueur font partie de la cohorte — il en est membre.
 * Sur une cohorte encore peu fournie, il se compare donc en partie à lui-même
 * et l'écart tend vers zéro. C'est la raison du seuil de votes appliqué côté
 * serveur : mieux vaut ne rien afficher qu'un écart écrasé par sa propre voix.
 */
export function compareToCohort(
  rounds: PlayedRound[],
  stats: CohortStat[],
): CohortComparison | null {
  const byId = new Map(stats.map((s) => [s.statement_id, s]));
  const pairs: [number, number][] = [];

  for (const round of rounds) {
    round.played.forEach((stmt, i) => {
      const stat = byId.get(stmt.id);
      if (stat) pairs.push([round.deltas[i] ?? 0, stat.avg_delta]);
    });
  }

  if (pairs.length < MIN_SAMPLE) return null;

  const mine = pairs.reduce((acc, p) => acc + p[0], 0) / pairs.length;
  const theirs = pairs.reduce((acc, p) => acc + p[1], 0) / pairs.length;
  return { mine, theirs, gap: mine - theirs, sample: pairs.length };
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

  if (gap <= -2) {
    return `Tu es extrêmement sévère par rapport ${cohortDative(profile)} : ${fr(gap)} points de plus retirés à chaque révélation.`;
  }
  if (gap <= -0.8) {
    return `Tu es plus sévère que ${label} : ${fr(gap)} point de plus retiré à chaque révélation.`;
  }
  if (gap < -0.3) {
    return `Tu es un peu plus dur que ${label}.`;
  }
  if (gap <= 0.3) {
    return `Tu notes exactement comme ${label}. Rien ne te distingue.`;
  }
  if (gap < 1.5) {
    return `Tu es plus indulgent que ${label} : ${fr(gap)} point de moins retiré à chaque révélation.`;
  }
  return `Tu es bien plus tendre que ${label} : ${fr(gap)} points de moins retirés à chaque révélation.`;
}
