/**
 * Algorithm Configuration System
 * 
 * Centralized configuration for the duel selection algorithm.
 * All parameters are tunable from the admin panel at /admin/algorithm.
 * 
 * Storage: in-memory via globalThis (resets on server restart).
 * Defaults are production-ready and optimized for engagement.
 */

// ─── Types ───────────────────────────────────────────────────────

export interface StrategyConfig {
  enabled: boolean;
  weight: number;
  description: string;
  recommendation: string;
}

export interface AlgorithmConfig {
  /** Strategy distribution (weights must sum to 100 among enabled strategies) */
  strategies: {
    elo_close: StrategyConfig;
    cross_category: StrategyConfig;
    starred: StrategyConfig;
    random: StrategyConfig;
  };

  /** ELO proximity range for the "elo_close" strategy */
  elo: {
    minDifference: number;
    maxDifference: number;
  };

  /** Anti-repeat: prevent same elements from appearing too often */
  antiRepeat: {
    enabled: boolean;
    /** Max times an element can appear in one session (0 = unlimited) */
    maxAppearancesPerSession: number;
    /** Min rounds before a recently-seen element can reappear */
    cooldownRounds: number;
  };

  /** Minimum stars for the "starred" strategy */
  starredMinStars: number;

  /** K-factor tiers for ELO calculation */
  kFactor: {
    newThreshold: number;       // participations < this → new K
    moderateThreshold: number;  // participations < this → moderate K
    newK: number;
    moderateK: number;
    establishedK: number;
  };

  /** Max candidate pairs to evaluate per strategy */
  candidatePoolSize: number;
}

// ─── Defaults ────────────────────────────────────────────────────

export const DEFAULT_ALGORITHM_CONFIG: AlgorithmConfig = {
  strategies: {
    elo_close: {
      enabled: true,
      weight: 50,
      description: 'Duels équilibrés (ELO proche)',
      recommendation: '40-60% — Génère des débats serrés, très engageants. C\'est le cœur du jeu.',
    },
    cross_category: {
      enabled: true,
      weight: 30,
      description: 'Combinaisons inter-catégories',
      recommendation: '20-35% — Crée des matchups absurdes et viraux. Idéal pour le partage.',
    },
    starred: {
      enabled: true,
      weight: 15,
      description: 'Duels populaires (étoilés)',
      recommendation: '10-20% — Recycle les meilleurs duels. Nécessite ≥50 étoiles par défaut.',
    },
    random: {
      enabled: true,
      weight: 5,
      description: 'Découverte aléatoire',
      recommendation: '3-10% — Fait remonter les éléments peu vus. Évite les bulles.',
    },
  },

  elo: {
    minDifference: 50,
    maxDifference: 300,
  },

  antiRepeat: {
    enabled: true,
    maxAppearancesPerSession: 2,
    cooldownRounds: 3,
  },

  starredMinStars: 50,

  kFactor: {
    newThreshold: 30,
    moderateThreshold: 100,
    newK: 40,
    moderateK: 32,
    establishedK: 24,
  },

  candidatePoolSize: 10,
};

// ─── Runtime storage (globalThis for cross-module sharing) ───────

declare global {
  // eslint-disable-next-line no-var
  var __algorithmConfig: AlgorithmConfig | undefined;
}

/**
 * Get the current algorithm config.
 * Returns the admin-set config if available, otherwise defaults.
 */
export function getAlgorithmConfig(): AlgorithmConfig {
  return globalThis.__algorithmConfig ?? { ...DEFAULT_ALGORITHM_CONFIG };
}

/**
 * Set the algorithm config (from admin panel).
 * Validates weights before saving.
 */
export function setAlgorithmConfig(config: AlgorithmConfig): { success: boolean; error?: string } {
  // Validate strategy weights sum to 100 among enabled strategies
  const enabledStrategies = Object.values(config.strategies).filter(s => s.enabled);
  if (enabledStrategies.length === 0) {
    return { success: false, error: 'Au moins une stratégie doit être activée.' };
  }

  const totalWeight = enabledStrategies.reduce((sum, s) => sum + s.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    return { success: false, error: `Les poids des stratégies activées doivent totaliser 100% (actuellement ${totalWeight}%).` };
  }

  // Validate ranges
  if (config.elo.minDifference < 0 || config.elo.maxDifference < config.elo.minDifference) {
    return { success: false, error: 'La plage ELO est invalide (min doit être < max).' };
  }

  if (config.antiRepeat.maxAppearancesPerSession < 1) {
    return { success: false, error: 'Le max d\'apparitions doit être ≥ 1.' };
  }

  if (config.antiRepeat.cooldownRounds < 0) {
    return { success: false, error: 'Le cooldown doit être ≥ 0.' };
  }

  globalThis.__algorithmConfig = { ...config };
  return { success: true };
}

/**
 * Reset config to defaults.
 */
export function resetAlgorithmConfig(): void {
  globalThis.__algorithmConfig = undefined;
}

/**
 * Normalize strategy weights so enabled strategies sum to 100.
 */
export function normalizeWeights(config: AlgorithmConfig): AlgorithmConfig {
  const result = { ...config, strategies: { ...config.strategies } };
  const enabledEntries = Object.entries(result.strategies)
    .filter(([, s]) => s.enabled) as [string, StrategyConfig][];

  if (enabledEntries.length === 0) return result;

  const total = enabledEntries.reduce((sum, [, s]) => sum + s.weight, 0);
  if (total === 0) {
    // Distribute equally
    const each = Math.floor(100 / enabledEntries.length);
    enabledEntries.forEach(([key]) => {
      (result.strategies as Record<string, StrategyConfig>)[key] = {
        ...(result.strategies as Record<string, StrategyConfig>)[key],
        weight: each,
      };
    });
    // Give remainder to first
    const remainder = 100 - each * enabledEntries.length;
    if (remainder > 0) {
      (result.strategies as Record<string, StrategyConfig>)[enabledEntries[0][0]].weight += remainder;
    }
  } else {
    enabledEntries.forEach(([key, s]) => {
      (result.strategies as Record<string, StrategyConfig>)[key] = {
        ...s,
        weight: Math.round((s.weight / total) * 100),
      };
    });
    // Fix rounding errors
    const newTotal = enabledEntries.reduce((sum, [key]) =>
      sum + (result.strategies as Record<string, StrategyConfig>)[key].weight, 0);
    if (newTotal !== 100) {
      (result.strategies as Record<string, StrategyConfig>)[enabledEntries[0][0]].weight += (100 - newTotal);
    }
  }

  return result;
}
