/**
 * Duel Selection Algorithm
 * 
 * Selects duel pairs using a mix of strategies:
 * - 50%: ELO close (50-300 point difference) → Balanced debates
 * - 30%: Cross-category → Absurd, viral combinations
 * - 15%: Starred duels (if ≥50 stars) → Popular content
 * - 5%: Random → Discovery, new elements
 */

import { Element } from '@/types/database';
import { SelectionStrategy, ElementDTO } from '@/types/game';
import { getEloDifference, isCloseElo } from './elo';

// Strategy distribution weights
const STRATEGY_WEIGHTS = {
  elo_close: 50,
  cross_category: 30,
  starred: 15,
  random: 5,
} as const;

/**
 * Select a random strategy based on the weight distribution.
 */
export function selectStrategy(): SelectionStrategy {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const [strategy, weight] of Object.entries(STRATEGY_WEIGHTS)) {
    cumulative += weight;
    if (random < cumulative) {
      return strategy as SelectionStrategy;
    }
  }
  
  return 'random';
}

/**
 * Fisher-Yates shuffle algorithm for randomizing arrays.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get a consistent pair key for checking seen duels.
 */
export function getPairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
}

/**
 * Check if a pair has been seen.
 */
export function isPairSeen(idA: string, idB: string, seenDuels: Set<string>): boolean {
  return seenDuels.has(getPairKey(idA, idB));
}

/**
 * Find pairs with close ELO scores.
 */
export function findCloseEloPairs(
  elements: Element[],
  seenDuels: Set<string>,
  limit: number = 10
): Array<[Element, Element]> {
  const pairs: Array<[Element, Element]> = [];
  const shuffled = shuffleArray(elements);
  
  for (let i = 0; i < shuffled.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < shuffled.length && pairs.length < limit; j++) {
      const a = shuffled[i];
      const b = shuffled[j];
      
      if (isPairSeen(a.id, b.id, seenDuels)) continue;
      
      const diff = getEloDifference(a.elo_global, b.elo_global);
      if (isCloseElo(diff)) {
        pairs.push([a, b]);
      }
    }
  }
  
  return pairs;
}

/**
 * Find pairs from different categories.
 */
export function findCrossCategoryPairs(
  elements: Element[],
  seenDuels: Set<string>,
  limit: number = 10
): Array<[Element, Element]> {
  const pairs: Array<[Element, Element]> = [];
  const shuffled = shuffleArray(elements);
  
  for (let i = 0; i < shuffled.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < shuffled.length && pairs.length < limit; j++) {
      const a = shuffled[i];
      const b = shuffled[j];
      
      if (isPairSeen(a.id, b.id, seenDuels)) continue;
      
      // Different categories = cross-category pair
      if (a.categorie !== b.categorie) {
        pairs.push([a, b]);
      }
    }
  }
  
  return pairs;
}

/**
 * Find random pairs.
 */
export function findRandomPairs(
  elements: Element[],
  seenDuels: Set<string>,
  limit: number = 10
): Array<[Element, Element]> {
  const pairs: Array<[Element, Element]> = [];
  const shuffled = shuffleArray(elements);
  
  for (let i = 0; i < shuffled.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < shuffled.length && pairs.length < limit; j++) {
      const a = shuffled[i];
      const b = shuffled[j];
      
      if (!isPairSeen(a.id, b.id, seenDuels)) {
        pairs.push([a, b]);
      }
    }
  }
  
  return pairs;
}

/**
 * Convert an Element to an ElementDTO (minimal data for client).
 */
export function toElementDTO(element: Element): ElementDTO {
  return {
    id: element.id,
    texte: element.texte,
    categorie: element.categorie,
  };
}

/**
 * Main algorithm: Select the next duel pair.
 * 
 * @param elements - All active elements
 * @param seenDuels - Set of seen duel pair keys
 * @param starredPairs - Optional: pairs with ≥50 stars (for starred strategy)
 * @returns A pair of elements for the duel, or null if all duels exhausted
 */
export function selectDuelPair(
  elements: Element[],
  seenDuels: Set<string>,
  starredPairs?: Array<{ element_a_id: string; element_b_id: string; stars_count: number }>
): [Element, Element] | null {
  if (elements.length < 2) {
    return null;
  }
  
  const strategy = selectStrategy();
  let pairs: Array<[Element, Element]> = [];
  
  switch (strategy) {
    case 'elo_close':
      pairs = findCloseEloPairs(elements, seenDuels, 5);
      break;
      
    case 'cross_category':
      pairs = findCrossCategoryPairs(elements, seenDuels, 5);
      break;
      
    case 'starred':
      // Filter starred pairs that haven't been seen and have enough stars
      if (starredPairs && starredPairs.length > 0) {
        const validStarred = starredPairs
          .filter(p => p.stars_count >= 50 && !isPairSeen(p.element_a_id, p.element_b_id, seenDuels));
        
        if (validStarred.length > 0) {
          const randomStarred = validStarred[Math.floor(Math.random() * validStarred.length)];
          const elementA = elements.find(e => e.id === randomStarred.element_a_id);
          const elementB = elements.find(e => e.id === randomStarred.element_b_id);
          
          if (elementA && elementB) {
            return [elementA, elementB];
          }
        }
      }
      // Fallback to random if no starred pairs available
      pairs = findRandomPairs(elements, seenDuels, 5);
      break;
      
    case 'random':
    default:
      pairs = findRandomPairs(elements, seenDuels, 5);
      break;
  }
  
  // If no pairs found with the selected strategy, fallback to random
  if (pairs.length === 0) {
    pairs = findRandomPairs(elements, seenDuels, 5);
  }
  
  // Still no pairs? All duels exhausted
  if (pairs.length === 0) {
    return null;
  }
  
  // Return a random pair from the found options
  return pairs[Math.floor(Math.random() * pairs.length)];
}

/**
 * Calculate the total number of possible duel combinations.
 * Formula: n * (n-1) / 2
 */
export function getTotalPossibleDuels(elementCount: number): number {
  return (elementCount * (elementCount - 1)) / 2;
}

/**
 * Check if all possible duels have been seen.
 */
export function allDuelsExhausted(elementCount: number, seenCount: number): boolean {
  return seenCount >= getTotalPossibleDuels(elementCount);
}
