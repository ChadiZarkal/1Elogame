/**
 * Duel Selection Algorithm v2
 * 
 * Selects duel pairs using configurable strategies with anti-repeat protection.
 * All parameters are tunable from the admin panel at /admin/algorithm.
 * 
 * Strategies (default weights):
 * - 50%: ELO close (configurable range) → Balanced debates
 * - 30%: Cross-category → Absurd, viral combinations
 * - 15%: Starred duels (if ≥N stars) → Popular content
 * - 5%: Random → Discovery, new elements
 * 
 * Anti-repeat:
 * - Tracks element appearances per session (max N times)
 * - Cooldown: elements seen in the last N rounds are deprioritized
 */

import { Element } from '@/types/database';
import { SelectionStrategy, ElementDTO } from '@/types/game';
import { getEloDifference, isCloseElo } from './elo';
import { getPairKey as getPairKeyUtil } from './utils';
import { getAlgorithmConfig, AlgorithmConfig } from './algorithmConfig';

// ─── Anti-repeat context passed from the client ─────────────────

export interface AntiRepeatContext {
  /** IDs of elements seen in the last N rounds (circular buffer) */
  recentElementIds: string[];
  /** Map of elementId → number of appearances this session */
  elementAppearances: Record<string, number>;
}

// ─── Strategy selection ──────────────────────────────────────────

/**
 * Select a random strategy based on the configured weight distribution.
 */
export function selectStrategy(config?: AlgorithmConfig): SelectionStrategy {
  const cfg = config ?? getAlgorithmConfig();
  const random = Math.random() * 100;
  let cumulative = 0;
  
  const strategyNames: SelectionStrategy[] = ['elo_close', 'cross_category', 'starred', 'random'];
  
  for (const name of strategyNames) {
    const strategy = cfg.strategies[name];
    if (!strategy.enabled) continue;
    cumulative += strategy.weight;
    if (random < cumulative) {
      return name;
    }
  }
  
  // Fallback to random
  return 'random';
}

// ─── Utility functions ──────────────────────────────────────────

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
 * @deprecated Use getPairKey from '@/lib/utils' directly.
 */
export function getPairKey(idA: string, idB: string): string {
  return getPairKeyUtil(idA, idB);
}

/**
 * Check if a pair has been seen.
 */
export function isPairSeen(idA: string, idB: string, seenDuels: Set<string>): boolean {
  return seenDuels.has(getPairKey(idA, idB));
}

// ─── Anti-repeat filtering ──────────────────────────────────────

/**
 * Filter out elements that have exceeded their max appearances per session.
 */
export function filterByAntiRepeat(
  elements: Element[],
  context: AntiRepeatContext,
  config?: AlgorithmConfig,
): Element[] {
  const cfg = config ?? getAlgorithmConfig();
  
  if (!cfg.antiRepeat.enabled) return elements;
  
  const { maxAppearancesPerSession } = cfg.antiRepeat;
  const { elementAppearances } = context;
  
  // Filter out elements that have hit the max appearances
  if (maxAppearancesPerSession > 0) {
    const filtered = elements.filter(el => {
      const count = elementAppearances[el.id] || 0;
      return count < maxAppearancesPerSession;
    });
    
    // Only use filtered list if it has enough elements for a duel
    if (filtered.length >= 2) {
      return filtered;
    }
    // Otherwise fall back to full list (better to repeat than to have no duel)
  }
  
  return elements;
}

/**
 * Score elements by "freshness" — higher = more fresh = more desirable.
 */
function getElementFreshnessScore(
  elementId: string,
  context: AntiRepeatContext,
  config: AlgorithmConfig,
): number {
  const { recentElementIds } = context;
  const { cooldownRounds } = config.antiRepeat;
  
  if (!config.antiRepeat.enabled || cooldownRounds === 0) return 1;
  
  // Check the last N*2 elements (each round has 2 elements)
  const lookback = recentElementIds.slice(-(cooldownRounds * 2));
  const lastIndex = lookback.lastIndexOf(elementId);
  
  if (lastIndex === -1) return 1; // Not recently seen → fully fresh
  
  // How many positions ago was it seen? Closer = less fresh
  const recency = lookback.length - lastIndex;
  const maxRecency = cooldownRounds * 2;
  
  return recency / maxRecency; // 0 (just seen) → 1 (cooldown expired)
}

/**
 * Sort elements by freshness, putting least-recently-seen first.
 */
function sortByFreshness(
  elements: Element[],
  context: AntiRepeatContext,
  config: AlgorithmConfig,
): Element[] {
  if (!config.antiRepeat.enabled) return shuffleArray(elements);
  
  // Compute freshness scores
  const scored = elements.map(el => ({
    element: el,
    freshness: getElementFreshnessScore(el.id, context, config),
  }));
  
  // Sort by freshness (highest = freshest first), with random tiebreaker
  scored.sort((a, b) => {
    const diff = b.freshness - a.freshness;
    if (Math.abs(diff) < 0.01) return Math.random() - 0.5;
    return diff;
  });
  
  return scored.map(s => s.element);
}

// ─── Pair finding strategies ────────────────────────────────────

/**
 * Find pairs with close ELO scores.
 */
export function findCloseEloPairs(
  elements: Element[],
  seenDuels: Set<string>,
  context: AntiRepeatContext,
  config?: AlgorithmConfig,
): Array<[Element, Element]> {
  const cfg = config ?? getAlgorithmConfig();
  const limit = cfg.candidatePoolSize;
  const pairs: Array<[Element, Element]> = [];
  const sorted = sortByFreshness(elements, context, cfg);
  
  for (let i = 0; i < sorted.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < sorted.length && pairs.length < limit; j++) {
      const a = sorted[i];
      const b = sorted[j];
      
      if (isPairSeen(a.id, b.id, seenDuels)) continue;
      
      const diff = getEloDifference(a.elo_global, b.elo_global);
      if (isCloseElo(diff, cfg.elo.minDifference, cfg.elo.maxDifference)) {
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
  context: AntiRepeatContext,
  config?: AlgorithmConfig,
): Array<[Element, Element]> {
  const cfg = config ?? getAlgorithmConfig();
  const limit = cfg.candidatePoolSize;
  const pairs: Array<[Element, Element]> = [];
  const sorted = sortByFreshness(elements, context, cfg);
  
  for (let i = 0; i < sorted.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < sorted.length && pairs.length < limit; j++) {
      const a = sorted[i];
      const b = sorted[j];
      
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
 * Find random pairs (freshest elements prioritized).
 */
export function findRandomPairs(
  elements: Element[],
  seenDuels: Set<string>,
  context: AntiRepeatContext,
  config?: AlgorithmConfig,
): Array<[Element, Element]> {
  const cfg = config ?? getAlgorithmConfig();
  const limit = cfg.candidatePoolSize;
  const pairs: Array<[Element, Element]> = [];
  const sorted = sortByFreshness(elements, context, cfg);
  
  for (let i = 0; i < sorted.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < sorted.length && pairs.length < limit; j++) {
      const a = sorted[i];
      const b = sorted[j];
      
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
 * @param antiRepeatContext - Recent element tracking for anti-repeat
 * @param starredPairs - Optional: pairs with ≥N stars (for starred strategy)
 * @param config - Optional: algorithm config override
 * @returns A pair of elements for the duel, or null if all duels exhausted
 */
export function selectDuelPair(
  elements: Element[],
  seenDuels: Set<string>,
  antiRepeatContext?: AntiRepeatContext,
  starredPairs?: Array<{ element_a_id: string; element_b_id: string; stars_count: number }>,
  config?: AlgorithmConfig,
): [Element, Element] | null {
  const cfg = config ?? getAlgorithmConfig();
  
  if (elements.length < 2) {
    return null;
  }
  
  // Apply anti-repeat filtering first
  const context: AntiRepeatContext = antiRepeatContext ?? { recentElementIds: [], elementAppearances: {} };
  const filteredElements = filterByAntiRepeat(elements, context, cfg);
  
  if (filteredElements.length < 2) {
    return null;
  }
  
  const strategy = selectStrategy(cfg);
  let pairs: Array<[Element, Element]> = [];
  
  switch (strategy) {
    case 'elo_close':
      pairs = findCloseEloPairs(filteredElements, seenDuels, context, cfg);
      break;
      
    case 'cross_category':
      pairs = findCrossCategoryPairs(filteredElements, seenDuels, context, cfg);
      break;
      
    case 'starred':
      // Filter starred pairs that haven't been seen and have enough stars
      if (starredPairs && starredPairs.length > 0) {
        const validStarred = starredPairs
          .filter(p => p.stars_count >= cfg.starredMinStars && !isPairSeen(p.element_a_id, p.element_b_id, seenDuels));
        
        if (validStarred.length > 0) {
          const randomStarred = validStarred[Math.floor(Math.random() * validStarred.length)];
          const elementA = filteredElements.find(e => e.id === randomStarred.element_a_id);
          const elementB = filteredElements.find(e => e.id === randomStarred.element_b_id);
          
          if (elementA && elementB) {
            return [elementA, elementB];
          }
        }
      }
      // Fallback to random if no starred pairs available
      pairs = findRandomPairs(filteredElements, seenDuels, context, cfg);
      break;
      
    case 'random':
    default:
      pairs = findRandomPairs(filteredElements, seenDuels, context, cfg);
      break;
  }
  
  // If no pairs found with the selected strategy, fallback to random
  if (pairs.length === 0) {
    pairs = findRandomPairs(filteredElements, seenDuels, context, cfg);
  }
  
  // Still no pairs? Try without anti-repeat filter
  if (pairs.length === 0) {
    pairs = findRandomPairs(elements, seenDuels, context, cfg);
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
  if (elementCount < 2) return 0;
  return (elementCount * (elementCount - 1)) / 2;
}

/**
 * Check if all possible duels have been seen.
 */
export function allDuelsExhausted(elementCount: number, seenCount: number): boolean {
  return seenCount >= getTotalPossibleDuels(elementCount);
}
