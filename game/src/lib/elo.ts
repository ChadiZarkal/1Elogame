/**
 * ELO Calculation Library
 * 
 * Implements the ELO rating system for Red or Green Game.
 * Performance critical: All calculations must complete in < 20ms.
 */

// Default K-factor (adjustable based on participation count)
export const DEFAULT_K_FACTOR = 32;
export const DEFAULT_ELO = 1000;

/**
 * Calculate expected probability of winning based on ELO difference.
 * Formula: E = 1 / (1 + 10^((opponent_elo - player_elo) / 400))
 * 
 * @param playerElo - The player's/element's ELO score
 * @param opponentElo - The opponent's ELO score
 * @returns Expected probability of winning (0-1)
 */
export function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/**
 * Calculate new ELO scores after a duel.
 * 
 * @param winnerElo - Current ELO of the winner
 * @param loserElo - Current ELO of the loser
 * @param kFactor - K-factor for adjustment (default: 32)
 * @returns Object containing new ELO scores for both winner and loser
 */
export function calculateNewELO(
  winnerElo: number,
  loserElo: number,
  kFactor: number = DEFAULT_K_FACTOR
): { newWinnerELO: number; newLoserELO: number } {
  const expectedWinner = calculateExpectedScore(winnerElo, loserElo);
  const expectedLoser = 1 - expectedWinner;
  
  // Winner gets a score of 1, loser gets 0
  const newWinnerELO = Math.round(winnerElo + kFactor * (1 - expectedWinner));
  const newLoserELO = Math.round(loserElo + kFactor * (0 - expectedLoser));
  
  return { newWinnerELO, newLoserELO };
}

/**
 * Estimate win percentage based on ELO scores.
 * This is used to display "what the majority thinks" without needing actual vote counts.
 * 
 * @param eloA - ELO score of element A
 * @param eloB - ELO score of element B
 * @returns Estimated percentage that element A would be chosen as the bigger red flag (0-100)
 */
export function estimatePercentage(eloA: number, eloB: number): number {
  const probability = calculateExpectedScore(eloA, eloB);
  return Math.round(probability * 100);
}

/**
 * Calculate the ELO difference between two elements.
 * Used by the duel selection algorithm.
 * 
 * @param eloA - ELO score of element A
 * @param eloB - ELO score of element B
 * @returns Absolute difference in ELO scores
 */
export function getEloDifference(eloA: number, eloB: number): number {
  return Math.abs(eloA - eloB);
}

/**
 * Determine if an ELO difference qualifies as "close" for the algorithm.
 * Close ELO duels create more engaging debates.
 * 
 * @param difference - The ELO difference between two elements
 * @param minDiff - Minimum difference to consider (default: 50)
 * @param maxDiff - Maximum difference to consider "close" (default: 300)
 * @returns True if the difference is within the "close" range
 */
export function isCloseElo(
  difference: number,
  minDiff: number = 50,
  maxDiff: number = 300
): boolean {
  return difference >= minDiff && difference <= maxDiff;
}

/**
 * Get the appropriate K-factor based on participation count.
 * Higher K-factor for new elements (more volatile ratings),
 * lower K-factor for established elements (more stable ratings).
 * 
 * @param participations - Number of times the element has participated in duels
 * @returns Appropriate K-factor
 */
export function getKFactor(participations: number): number {
  if (participations < 30) {
    return 40; // New element: more volatile
  } else if (participations < 100) {
    return 32; // Moderately established
  } else {
    return 24; // Well-established: more stable
  }
}

/**
 * Determine if a player's vote matched the majority (based on ELO).
 * Used for streak calculation.
 * 
 * @param winnerId - ID of the element the player chose as winner
 * @param winnerElo - ELO of the chosen winner
 * @param loserElo - ELO of the element not chosen
 * @returns True if the player agreed with the majority prediction
 */
export function didMatchMajority(winnerElo: number, loserElo: number): boolean {
  // The majority would have picked the element with higher ELO as more "red flag"
  return winnerElo >= loserElo;
}

/**
 * Get the ELO field name for a specific sex segment.
 * 
 * @param sexe - The sex segment
 * @returns The corresponding ELO field name
 */
export function getEloFieldForSex(sexe: 'homme' | 'femme' | 'nonbinaire' | 'autre'): string {
  const mapping: Record<string, string> = {
    homme: 'elo_homme',
    femme: 'elo_femme',
    nonbinaire: 'elo_nonbinaire',
    autre: 'elo_autre',
  };
  return mapping[sexe];
}

/**
 * Get the ELO field name for a specific age segment.
 * 
 * @param age - The age segment
 * @returns The corresponding ELO field name
 */
export function getEloFieldForAge(age: '16-18' | '19-22' | '23-26' | '27+'): string {
  const mapping: Record<string, string> = {
    '16-18': 'elo_16_18',
    '19-22': 'elo_19_22',
    '23-26': 'elo_23_26',
    '27+': 'elo_27plus',
  };
  return mapping[age];
}
