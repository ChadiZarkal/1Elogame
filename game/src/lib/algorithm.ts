/** Duel selection algorithm with configurable strategies and anti-repeat protection. */

import { Element } from '@/types/database';
import { SelectionStrategy, ElementDTO } from '@/types/game';
import { getEloDifference, isCloseElo } from './elo';
import { getPairKey as getPairKeyUtil } from './utils';
import { getAlgorithmConfig, AlgorithmConfig } from './algorithmConfig';

export interface AntiRepeatContext {
  recentElementIds: string[];
  elementAppearances: Record<string, number>;
}

/**
 * Select a random strategy based on weight distribution.
 * @param config Algorithm config
 * @param singleCategory If true, cross_category is skipped (useless when filtering by one category)
 */
export function selectStrategy(config?: AlgorithmConfig, singleCategory = false): SelectionStrategy {
  const cfg = config ?? getAlgorithmConfig();
  
  const strategyNames: SelectionStrategy[] = ['elo_close', 'cross_category', 'starred', 'random'];
  
  // Build effective weights, skipping disabled strategies and cross_category if single category
  const effective: { name: SelectionStrategy; weight: number }[] = [];
  for (const name of strategyNames) {
    const strategy = cfg.strategies[name];
    if (!strategy.enabled) continue;
    if (name === 'cross_category' && singleCategory) continue;
    effective.push({ name, weight: strategy.weight });
  }

  if (effective.length === 0) return 'random';

  // Normalize weights to 100%
  const totalWeight = effective.reduce((sum, s) => sum + s.weight, 0);
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  
  for (const { name, weight } of effective) {
    cumulative += weight;
    if (random < cumulative) {
      return name;
    }
  }
  
  return effective[effective.length - 1].name;
}

/** Fisher-Yates shuffle. */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Check if a pair has been seen. */
export function isPairSeen(idA: string, idB: string, seenDuels: Set<string>): boolean {
  return seenDuels.has(getPairKeyUtil(idA, idB));
}

/** Filter out elements that exceeded max appearances per session.
 *  - 'strict' mode: each element can appear at most maxAppearancesPerSession times (default 1 = zero repeats)
 *  - 'cooldown' mode: same filtering, but freshness scoring still allows deprioritized repeats
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
    
    // In strict mode: NEVER fall back to repeats, even if pool is tiny
    if (cfg.antiRepeat.mode === 'strict') {
      return filtered;
    }
    
    // In cooldown mode: only use filtered list if it has enough elements for a duel
    if (filtered.length >= 2) {
      return filtered;
    }
    // Otherwise fall back to full list (better to repeat than to have no duel)
  }
  
  return elements;
}

/** Score elements by freshness (higher = more desirable). */
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

/** Find pairs with close ELO scores. */
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

/** Find pairs from different categories. */
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

/** Find random pairs (freshest elements prioritized). */
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

/** Convert Element to ElementDTO. */
export function toElementDTO(element: Element): ElementDTO {
  return {
    id: element.id,
    texte: element.texte,
    categorie: element.categorie,
  };
}

/** Select the next duel pair using configured strategy with anti-repeat and fallbacks. */
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
  
  // Detect single-category mode: all elements share the same category
  const categories = new Set(filteredElements.map(e => e.categorie));
  const singleCategory = categories.size <= 1;
  
  const strategy = selectStrategy(cfg, singleCategory);
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
  
  // Still no pairs? Try without anti-repeat filter (only in cooldown mode)
  if (pairs.length === 0 && cfg.antiRepeat.mode !== 'strict') {
    pairs = findRandomPairs(elements, seenDuels, context, cfg);
  }
  
  // Still no pairs? All duels exhausted
  if (pairs.length === 0) {
    return null;
  }
  
  // Return a random pair from the found options
  return pairs[Math.floor(Math.random() * pairs.length)];
}

/** Total possible duel combinations: n*(n-1)/2 */
export function getTotalPossibleDuels(elementCount: number): number {
  if (elementCount < 2) return 0;
  return (elementCount * (elementCount - 1)) / 2;
}

/** Check if all possible duels have been seen. */
export function allDuelsExhausted(elementCount: number, seenCount: number): boolean {
  return seenCount >= getTotalPossibleDuels(elementCount);
}
