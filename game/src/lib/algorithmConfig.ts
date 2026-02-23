/**
 * Centralized config for the duel selection algorithm.
 * Tunable from /admin/algorithm.
 * 
 * Persistence strategy:
 * - Production: stored in Supabase `algorithm_config` table (survives redeploys)
 * - Mock mode: in-memory globalThis (for local dev)
 * - In-memory cache in production to avoid hitting DB on every duel request
 */

export interface StrategyConfig {
  enabled: boolean;
  weight: number;
  description: string;
  recommendation: string;
}

export type AntiRepeatMode = 'cooldown' | 'strict';

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
    /**
     * 'cooldown' — original behavior: elements deprioritized for N rounds
     * 'strict'  — NO element can appear twice in a session, period
     */
    mode: AntiRepeatMode;
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
    mode: 'strict',
    maxAppearancesPerSession: 1,
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

// ─── In-memory cache ──────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __algorithmConfig: AlgorithmConfig | undefined;
  // eslint-disable-next-line no-var
  var __algorithmConfigLoaded: boolean | undefined;
}

function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
}

/** Migrate old configs that don't have the mode field */
function ensureModeField(config: AlgorithmConfig): AlgorithmConfig {
  if (!config.antiRepeat.mode) {
    config.antiRepeat.mode = 'cooldown';
  }
  return config;
}

/** Get current algorithm config. Uses cache, falls back to defaults. */
export function getAlgorithmConfig(): AlgorithmConfig {
  return ensureModeField(globalThis.__algorithmConfig ?? { ...DEFAULT_ALGORITHM_CONFIG });
}

/**
 * Load config from Supabase (production) or return defaults (mock).
 * Call this once at startup or on admin page load.
 */
export async function loadAlgorithmConfig(): Promise<AlgorithmConfig> {
  // Return cache if already loaded
  if (globalThis.__algorithmConfigLoaded && globalThis.__algorithmConfig) {
    return ensureModeField(globalThis.__algorithmConfig);
  }

  if (isMockMode()) {
    return getAlgorithmConfig();
  }

  try {
    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('algorithm_config')
      .select('config')
      .eq('id', 'current')
      .single();

    if (!error && data?.config) {
      const loaded = ensureModeField(data.config as AlgorithmConfig);
      globalThis.__algorithmConfig = loaded;
      globalThis.__algorithmConfigLoaded = true;
      return loaded;
    }
  } catch (e) {
    console.error('[algorithmConfig] Failed to load from Supabase:', e);
  }

  // No saved config → use defaults
  globalThis.__algorithmConfigLoaded = true;
  return getAlgorithmConfig();
}

/** Set config from admin panel. Validates weights, persists to Supabase. */
export async function setAlgorithmConfig(config: AlgorithmConfig): Promise<{ success: boolean; error?: string }> {
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

  const validated = ensureModeField(config);

  // Update in-memory cache
  globalThis.__algorithmConfig = { ...validated };
  globalThis.__algorithmConfigLoaded = true;

  // Persist to Supabase (production only)
  if (!isMockMode()) {
    try {
      const { createServerClient } = await import('@/lib/supabase');
      const supabase = createServerClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('algorithm_config')
        .upsert({
          id: 'current',
          config: validated,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error('[algorithmConfig] Failed to persist:', error.message);
        // Non-fatal: cache is updated, next deploy will lose it
      }
    } catch (e) {
      console.error('[algorithmConfig] Supabase persist error:', e);
    }
  }

  return { success: true };
}

/** Reset config to defaults. Removes from Supabase. */
export async function resetAlgorithmConfig(): Promise<void> {
  globalThis.__algorithmConfig = undefined;
  globalThis.__algorithmConfigLoaded = true;

  if (!isMockMode()) {
    try {
      const { createServerClient } = await import('@/lib/supabase');
      const supabase = createServerClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('algorithm_config')
        .delete()
        .eq('id', 'current');
    } catch (e) {
      console.error('[algorithmConfig] Failed to delete from Supabase:', e);
    }
  }
}
