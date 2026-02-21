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

  // Record vote + update ELO + get rankings — all in parallel
  const [, , , , , winnerRank, loserRank, totalResult] = await Promise.all([
    typedInsert(supabase, 'votes', { element_gagnant_id: winnerId, element_perdant_id: loserId, sexe_votant: sexe, age_votant: age }),
    typedUpdate(supabase, 'elements', {
      elo_global: newWinnerELO, [sexField]: winnerSexELO, [ageField]: winnerAgeELO,
      nb_participations: winner.nb_participations + 1, updated_at: new Date().toISOString(),
    }).eq('id', winnerId),
    typedUpdate(supabase, 'elements', {
      elo_global: newLoserELO, [sexField]: loserSexELO, [ageField]: loserAgeELO,
      nb_participations: loser.nb_participations + 1, updated_at: new Date().toISOString(),
    }).eq('id', loserId),
    typedUpdate(supabase, 'elements', {
      [sexPartField]: ((winner[sexPartField as keyof Element] as number) || 0) + 1,
      [agePartField]: ((winner[agePartField as keyof Element] as number) || 0) + 1,
    }).eq('id', winnerId).then(() => {}),
    typedUpdate(supabase, 'elements', {
      [sexPartField]: ((loser[sexPartField as keyof Element] as number) || 0) + 1,
      [agePartField]: ((loser[agePartField as keyof Element] as number) || 0) + 1,
    }).eq('id', loserId).then(() => {}),
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
