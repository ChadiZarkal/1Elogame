/** ELO rating system for Red or Green Game. */

const DEFAULT_K_FACTOR = 32;
export const DEFAULT_ELO = 1000;

/** Expected probability of winning: E = 1 / (1 + 10^((opponent - player) / 400)) */
function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/** Calculate new ELO scores after a duel. */
export function calculateNewELO(
  winnerElo: number,
  loserElo: number,
  kFactor: number = DEFAULT_K_FACTOR
): { newWinnerELO: number; newLoserELO: number } {
  const expectedWinner = calculateExpectedScore(winnerElo, loserElo);
  const expectedLoser = 1 - expectedWinner;
  return {
    newWinnerELO: Math.round(winnerElo + kFactor * (1 - expectedWinner)),
    newLoserELO: Math.max(100, Math.round(loserElo + kFactor * (0 - expectedLoser))),
  };
}

/** Estimate win percentage based on ELO scores. */
export function estimatePercentage(eloA: number, eloB: number): number {
  return Math.round(calculateExpectedScore(eloA, eloB) * 100);
}

export function getEloDifference(eloA: number, eloB: number): number {
  return Math.abs(eloA - eloB);
}

export function isCloseElo(difference: number, minDiff = 50, maxDiff = 300): boolean {
  return difference >= minDiff && difference <= maxDiff;
}

/** K-factor based on participation: higher for new elements, lower for established. */
export function getKFactor(participations: number): number {
  if (participations < 30) return 40;
  if (participations < 100) return 32;
  return 24;
}

/** Did the player's vote match the majority (based on ELO)? */
export function didMatchMajority(winnerElo: number, loserElo: number): boolean {
  return winnerElo >= loserElo;
}

export function getEloFieldForSex(sexe: 'homme' | 'femme' | 'autre'): string {
  return { homme: 'elo_homme', femme: 'elo_femme', autre: 'elo_autre' }[sexe];
}

export function getEloFieldForAge(age: '16-18' | '19-22' | '23-26' | '27+'): string {
  return { '16-18': 'elo_16_18', '19-22': 'elo_19_22', '23-26': 'elo_23_26', '27+': 'elo_27plus' }[age];
}

export function getParticipationFieldForSex(sexe: 'homme' | 'femme' | 'autre'): string {
  return { homme: 'nb_participations_homme', femme: 'nb_participations_femme', autre: 'nb_participations_autre' }[sexe];
}

export function getParticipationFieldForAge(age: '16-18' | '19-22' | '23-26' | '27+'): string {
  return { '16-18': 'nb_participations_16_18', '19-22': 'nb_participations_19_22', '23-26': 'nb_participations_23_26', '27+': 'nb_participations_27plus' }[age];
}
