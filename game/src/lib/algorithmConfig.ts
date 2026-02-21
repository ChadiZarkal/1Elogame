/** Centralized config for the duel selection algorithm. Tunable from /admin/algorithm. */

export interface StrategyConfig {
  enabled: boolean;
  weight: number;
  description: string;
  recommendation: string;
}

export interface AlgorithmConfig {
  strategies: {
    elo_close: StrategyConfig;
    cross_category: StrategyConfig;
    starred: StrategyConfig;
    random: StrategyConfig;
  };

  /** ELO proximity range */
  elo: {
    minDifference: number;
    maxDifference: number;
  };

  antiRepeat: {
    enabled: boolean;
    maxAppearancesPerSession: number;
    cooldownRounds: number;
  };

  /** Minimum stars for "starred" strategy */
  starredMinStars: number;

  /** K-factor tiers for ELO calculation */
  kFactor: {
    newThreshold: number;
    moderateThreshold: number;
    newK: number;
    moderateK: number;
    establishedK: number;
  };

  /** Max candidate pairs to evaluate per strategy */
  candidatePoolSize: number;
}

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

declare global {
  // eslint-disable-next-line no-var
  var __algorithmConfig: AlgorithmConfig | undefined;
}

/** Get current algorithm config (admin-set or defaults). */
export function getAlgorithmConfig(): AlgorithmConfig {
  return globalThis.__algorithmConfig ?? { ...DEFAULT_ALGORITHM_CONFIG };
}

/** Set config from admin panel. Validates weights before saving. */
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

/** Reset config to defaults. */
export function resetAlgorithmConfig(): void {
  globalThis.__algorithmConfig = undefined;
}
