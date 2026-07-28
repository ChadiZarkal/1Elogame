/**
 * @module repositories/votes
 * Data access layer for votes and ELO updates.
 */

import { Element, SexeVotant, AgeVotant } from '@/types/database';
import { isMockMode } from '@/lib/apiHelpers';
import {
  calculateNewELO, estimatePercentage, didMatchMajority,
  getEloFieldForSex, getEloFieldForAge, getKFactor,
  getParticipationFieldForSex, getParticipationFieldForAge,
} from '@/lib/elo';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VoteResultData {
  winner: { id: string; percentage: number; participations: number; rank?: number; totalElements?: number };
  loser: { id: string; percentage: number; participations: number; rank?: number; totalElements?: number };
  streak: { matched: boolean; current: number };
}

export interface RankedElement {
  id: string;
  rank?: number;
  totalElements?: number;
  /** Estimation tête-à-tête face au choix du joueur, en %. Absente pour le choix lui-même. */
  percentage?: number;
}

export interface MultiVoteResultData extends VoteResultData {
  /**
   * Les N éléments du tour, du plus red flag au moins red flag selon la
   * communauté. Vide lorsque les rangs ne sont pas calculables (mode mock) :
   * mieux vaut ne rien annoncer qu'annoncer un classement inventé.
   */
  ranking: RankedElement[];
  /** Moyenne des accords tête-à-tête sur l'ensemble des duels du tour, en %. */
  agreement: number;
}

// ---------------------------------------------------------------------------
// Core vote processing
// ---------------------------------------------------------------------------

/**
 * Process a vote: update ELO scores, record the vote, return result.
 * All mock/prod logic is encapsulated here.
 */
export async function processVote(
  winnerId: string,
  loserId: string,
  sexe: SexeVotant,
  age: AgeVotant,
): Promise<VoteResultData> {
  if (isMockMode()) {
    return processMockVote(winnerId, loserId, sexe, age);
  }
  return processProductionVote(winnerId, loserId, sexe, age);
}

/** Rang absent (mode mock) : relégué en fin de tri plutôt qu'en tête. */
function rankOf(entry: { rank?: number }): number {
  return entry.rank ?? Number.MAX_SAFE_INTEGER;
}

/**
 * Vote d'un tour à choix multiple.
 *
 * Un choix parmi N se décompose en N-1 duels : l'élément retenu affronte chacun
 * des autres. C'est le traitement usuel d'une comparaison multiple en Elo, et il
 * n'exige **aucune modification du schéma** — la table des votes reste
 * strictement deux-à-deux.
 *
 * Les duels sont joués en série et non de front : chacun lit puis réécrit le
 * score du gagnant. Menées en parallèle, les trois écritures partiraient toutes
 * du même score initial et deux des trois gains seraient perdus.
 */
export async function processMultiVote(
  winnerId: string,
  loserIds: string[],
  sexe: SexeVotant,
  age: AgeVotant,
): Promise<MultiVoteResultData> {
  if (loserIds.length === 0) throw new Error('NOT_FOUND');

  const outcomes: VoteResultData[] = [];
  for (const loserId of loserIds) {
    outcomes.push(await processVote(winnerId, loserId, sexe, age));
  }

  const last = outcomes[outcomes.length - 1];

  // L'adversaire le plus sérieux, c'est-à-dire celui que la communauté classe le
  // plus haut : c'est face à lui que le pourcentage d'accord veut dire quelque
  // chose. L'opposer au dernier du lot gonflerait le score sans rien apprendre.
  const runnerUp = outcomes.reduce((best, o) => (rankOf(o.loser) < rankOf(best.loser) ? o : best));

  const ranksAvailable = outcomes.every(o => o.winner.rank != null && o.loser.rank != null);
  const ranking: RankedElement[] = ranksAvailable
    ? [
        { id: winnerId, rank: last.winner.rank, totalElements: last.winner.totalElements },
        ...outcomes.map(o => ({
          id: o.loser.id,
          rank: o.loser.rank,
          totalElements: o.loser.totalElements,
          percentage: o.loser.percentage,
        })),
      ].sort((a, b) => rankOf(a) - rankOf(b))
    : [];

  return {
    winner: { ...last.winner, percentage: runnerUp.winner.percentage },
    loser: runnerUp.loser,
    // Le tour ne compte comme réussi que si le choix devance **tous** les
    // autres : avec quatre propositions, tomber juste au hasard vaut 25 %.
    streak: { matched: outcomes.every(o => o.streak.matched), current: 0 },
    ranking,
    agreement: Math.round(
      outcomes.reduce((sum, o) => sum + o.winner.percentage, 0) / outcomes.length,
    ),
  };
}

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

async function processMockVote(
  winnerId: string, loserId: string,
  sexe: SexeVotant, age: AgeVotant,
): Promise<VoteResultData> {
  const { getMockElement, updateMockElo, recordMockVote } = await import('@/lib/mockData');
  const winner = getMockElement(winnerId);
  const loser = getMockElement(loserId);

  if (!winner || !loser) throw new Error('NOT_FOUND');

  const kFactor = Math.min(getKFactor(winner.nb_participations), getKFactor(loser.nb_participations));
  const { newWinnerELO, newLoserELO } = calculateNewELO(winner.elo_global, loser.elo_global, kFactor);
  const matched = didMatchMajority(winner.elo_global, loser.elo_global);

  // Update global ELO
  updateMockElo(winnerId, loserId, newWinnerELO, newLoserELO);

  // Update segmented ELO (sex + age)
  updateSegmentedElo(winner, loser, sexe, age, kFactor);

  // Update participations
  updateParticipations(winner, loser, sexe, age);

  recordMockVote('mock-session', winnerId, loserId);

  const winnerPercentage = estimatePercentage(newWinnerELO, newLoserELO);
  return {
    winner: { id: winnerId, percentage: winnerPercentage, participations: winner.nb_participations },
    loser: { id: loserId, percentage: 100 - winnerPercentage, participations: loser.nb_participations },
    streak: { matched, current: 0 },
  };
}

// ---------------------------------------------------------------------------
// Production implementation
// ---------------------------------------------------------------------------

async function processProductionVote(
  winnerId: string, loserId: string,
  sexe: SexeVotant, age: AgeVotant,
): Promise<VoteResultData> {
  const { createServerClient, typedInsert, typedUpdate } = await import('@/lib/supabase');
  const supabase = createServerClient();

  // Fetch both elements
  const { data, error } = await supabase.from('elements').select('*').in('id', [winnerId, loserId]);
  if (error || !data || data.length !== 2) throw new Error('NOT_FOUND');

  const elements = data as unknown as Element[];
  const winner = elements.find((e) => e.id === winnerId);
  const loser = elements.find((e) => e.id === loserId);
  if (!winner || !loser) throw new Error('NOT_FOUND');

  // Calculate ELO changes
  const kFactor = Math.min(getKFactor(winner.nb_participations), getKFactor(loser.nb_participations));
  const { newWinnerELO, newLoserELO } = calculateNewELO(winner.elo_global, loser.elo_global, kFactor);
  const matched = didMatchMajority(winner.elo_global, loser.elo_global);

  const sexField = getEloFieldForSex(sexe);
  const ageField = getEloFieldForAge(age);
  const sexPartField = getParticipationFieldForSex(sexe);
  const agePartField = getParticipationFieldForAge(age);

  const { newWinnerELO: winnerSexELO, newLoserELO: loserSexELO } = calculateNewELO(
    winner[sexField as keyof Element] as number, loser[sexField as keyof Element] as number, kFactor,
  );
  const { newWinnerELO: winnerAgeELO, newLoserELO: loserAgeELO } = calculateNewELO(
    winner[ageField as keyof Element] as number, loser[ageField as keyof Element] as number, kFactor,
  );

  // Record vote + update both elements (ELO global + segmented + participations) + get rankings — all in parallel
  const [, , , winnerRank, loserRank, totalResult] = await Promise.all([
    // 1. Record the vote
    typedInsert(supabase, 'votes', {
      element_gagnant_id: winnerId,
      element_perdant_id: loserId,
      sexe_votant: sexe,
      age_votant: age,
    }),
    // 2. Update winner: global ELO + sex ELO + age ELO + all participations in one query
    typedUpdate(supabase, 'elements', {
      elo_global: newWinnerELO,
      [sexField]: winnerSexELO,
      [ageField]: winnerAgeELO,
      nb_participations: winner.nb_participations + 1,
      [sexPartField]: ((winner[sexPartField as keyof Element] as number) || 0) + 1,
      [agePartField]: ((winner[agePartField as keyof Element] as number) || 0) + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', winnerId),
    // 3. Update loser: global ELO + sex ELO + age ELO + all participations in one query
    typedUpdate(supabase, 'elements', {
      elo_global: newLoserELO,
      [sexField]: loserSexELO,
      [ageField]: loserAgeELO,
      nb_participations: loser.nb_participations + 1,
      [sexPartField]: ((loser[sexPartField as keyof Element] as number) || 0) + 1,
      [agePartField]: ((loser[agePartField as keyof Element] as number) || 0) + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', loserId),
    // 4. Rank queries (after new ELO)
    supabase.from('elements').select('*', { count: 'exact', head: true }).eq('actif', true).gt('elo_global', newWinnerELO),
    supabase.from('elements').select('*', { count: 'exact', head: true }).eq('actif', true).gt('elo_global', newLoserELO),
    supabase.from('elements').select('*', { count: 'exact', head: true }).eq('actif', true),
  ]);

  const winnerPercentage = estimatePercentage(newWinnerELO, newLoserELO);
  return {
    winner: {
      id: winnerId, percentage: winnerPercentage,
      participations: winner.nb_participations + 1,
      rank: (winnerRank.count ?? 0) + 1, totalElements: totalResult.count ?? 0,
    },
    loser: {
      id: loserId, percentage: 100 - winnerPercentage,
      participations: loser.nb_participations + 1,
      rank: (loserRank.count ?? 0) + 1, totalElements: totalResult.count ?? 0,
    },
    streak: { matched, current: 0 },
  };
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function updateSegmentedElo(winner: Element, loser: Element, sexe: SexeVotant, age: AgeVotant, kFactor: number) {
  const sexField = getEloFieldForSex(sexe) as keyof Element;
  const ageField = getEloFieldForAge(age) as keyof Element;

  const { newWinnerELO: wSex, newLoserELO: lSex } = calculateNewELO(winner[sexField] as number, loser[sexField] as number, kFactor);
  (winner as unknown as Record<string, unknown>)[sexField as string] = wSex;
  (loser as unknown as Record<string, unknown>)[sexField as string] = lSex;

  const { newWinnerELO: wAge, newLoserELO: lAge } = calculateNewELO(winner[ageField] as number, loser[ageField] as number, kFactor);
  (winner as unknown as Record<string, unknown>)[ageField as string] = wAge;
  (loser as unknown as Record<string, unknown>)[ageField as string] = lAge;
}

function updateParticipations(winner: Element, loser: Element, sexe: SexeVotant, age: AgeVotant) {
  winner.nb_participations += 1;
  loser.nb_participations += 1;

  const sexPart = getParticipationFieldForSex(sexe) as keyof Element;
  const agePart = getParticipationFieldForAge(age) as keyof Element;

  for (const el of [winner, loser]) {
    (el as unknown as Record<string, unknown>)[sexPart as string] = ((el[sexPart] as number) || 0) + 1;
    (el as unknown as Record<string, unknown>)[agePart as string] = ((el[agePart] as number) || 0) + 1;
  }
}
