/**
 * @file algorithmConfig.test.ts
 * @description Tests unitaires pour la configuration de l'algorithme de sélection de duels.
 * Couvre: getAlgorithmConfig, setAlgorithmConfig, resetAlgorithmConfig, validation des poids.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAlgorithmConfig,
  setAlgorithmConfig,
  resetAlgorithmConfig,
  DEFAULT_ALGORITHM_CONFIG,
  AlgorithmConfig,
} from '@/lib/algorithmConfig';

// Reset config between tests
beforeEach(() => {
  resetAlgorithmConfig();
});

describe('getAlgorithmConfig', () => {
  it('retourne la config par défaut quand aucune config custom n\'est définie', () => {
    const config = getAlgorithmConfig();
    expect(config.strategies.elo_close.weight).toBe(50);
    expect(config.strategies.cross_category.weight).toBe(30);
    expect(config.strategies.starred.weight).toBe(15);
    expect(config.strategies.random.weight).toBe(5);
  });

  it('les poids par défaut totalisent 100', () => {
    const config = getAlgorithmConfig();
    const total = Object.values(config.strategies)
      .filter(s => s.enabled)
      .reduce((sum, s) => sum + s.weight, 0);
    expect(total).toBe(100);
  });

  it('la config par défaut a toutes les stratégies activées', () => {
    const config = getAlgorithmConfig();
    for (const strategy of Object.values(config.strategies)) {
      expect(strategy.enabled).toBe(true);
    }
  });

  it('la config par défaut a des valeurs ELO valides', () => {
    const config = getAlgorithmConfig();
    expect(config.elo.minDifference).toBeLessThan(config.elo.maxDifference);
    expect(config.elo.minDifference).toBeGreaterThanOrEqual(0);
  });

  it('la config par défaut a des valeurs anti-repeat valides', () => {
    const config = getAlgorithmConfig();
    expect(config.antiRepeat.enabled).toBe(true);
    expect(config.antiRepeat.maxAppearancesPerSession).toBeGreaterThanOrEqual(1);
    expect(config.antiRepeat.cooldownRounds).toBeGreaterThanOrEqual(0);
  });
});

describe('setAlgorithmConfig', () => {
  it('accepte une config valide avec poids totalisant 100', () => {
    const config = { ...DEFAULT_ALGORITHM_CONFIG };
    const result = setAlgorithmConfig(config);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('la config est persistée après un set réussi', () => {
    const config = { ...DEFAULT_ALGORITHM_CONFIG };
    config.strategies = {
      ...config.strategies,
      elo_close: { ...config.strategies.elo_close, weight: 70 },
      cross_category: { ...config.strategies.cross_category, weight: 20 },
      starred: { ...config.strategies.starred, weight: 7 },
      random: { ...config.strategies.random, weight: 3 },
    };
    setAlgorithmConfig(config);
    const retrieved = getAlgorithmConfig();
    expect(retrieved.strategies.elo_close.weight).toBe(70);
  });

  it('rejette si aucune stratégie n\'est activée', () => {
    const config = structuredClone(DEFAULT_ALGORITHM_CONFIG);
    for (const key of Object.keys(config.strategies) as Array<keyof typeof config.strategies>) {
      config.strategies[key].enabled = false;
    }
    const result = setAlgorithmConfig(config);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Au moins une stratégie');
  });

  it('rejette si les poids ne totalisent pas 100', () => {
    const config = structuredClone(DEFAULT_ALGORITHM_CONFIG);
    config.strategies.elo_close.weight = 90; // Total = 90+30+15+5 = 140
    const result = setAlgorithmConfig(config);
    expect(result.success).toBe(false);
    expect(result.error).toContain('100%');
  });

  it('accepte si seules les stratégies activées totalisent 100', () => {
    const config = structuredClone(DEFAULT_ALGORITHM_CONFIG);
    config.strategies.starred.enabled = false;
    config.strategies.random.enabled = false;
    // elo_close=50, cross_category=30 → 80, besoin de 100
    config.strategies.elo_close.weight = 60;
    config.strategies.cross_category.weight = 40;
    const result = setAlgorithmConfig(config);
    expect(result.success).toBe(true);
  });

  it('rejette si minDifference > maxDifference pour ELO', () => {
    const config = structuredClone(DEFAULT_ALGORITHM_CONFIG);
    config.elo.minDifference = 500;
    config.elo.maxDifference = 100;
    const result = setAlgorithmConfig(config);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ELO');
  });

  it('rejette si minDifference est négatif', () => {
    const config = structuredClone(DEFAULT_ALGORITHM_CONFIG);
    config.elo.minDifference = -10;
    const result = setAlgorithmConfig(config);
    expect(result.success).toBe(false);
  });

  it('rejette si maxAppearancesPerSession < 1', () => {
    const config = structuredClone(DEFAULT_ALGORITHM_CONFIG);
    config.antiRepeat.maxAppearancesPerSession = 0;
    const result = setAlgorithmConfig(config);
    expect(result.success).toBe(false);
    expect(result.error).toContain('apparitions');
  });

  it('rejette si cooldownRounds est négatif', () => {
    const config = structuredClone(DEFAULT_ALGORITHM_CONFIG);
    config.antiRepeat.cooldownRounds = -1;
    const result = setAlgorithmConfig(config);
    expect(result.success).toBe(false);
    expect(result.error).toContain('cooldown');
  });
});

describe('resetAlgorithmConfig', () => {
  it('reset la config aux valeurs par défaut', () => {
    const config = structuredClone(DEFAULT_ALGORITHM_CONFIG);
    config.strategies.elo_close.weight = 90;
    config.strategies.cross_category.weight = 10;
    config.strategies.starred.enabled = false;
    config.strategies.random.enabled = false;
    setAlgorithmConfig(config);
    
    resetAlgorithmConfig();
    const retrieved = getAlgorithmConfig();
    expect(retrieved.strategies.elo_close.weight).toBe(50);
  });

  it('après reset, getAlgorithmConfig retourne les valeurs par défaut', () => {
    const config = structuredClone(DEFAULT_ALGORITHM_CONFIG);
    config.candidatePoolSize = 999;
    config.strategies.elo_close.weight = 60;
    config.strategies.cross_category.weight = 25;
    config.strategies.starred.weight = 10;
    config.strategies.random.weight = 5;
    setAlgorithmConfig(config);
    
    resetAlgorithmConfig();
    const retrieved = getAlgorithmConfig();
    expect(retrieved.candidatePoolSize).toBe(DEFAULT_ALGORITHM_CONFIG.candidatePoolSize);
  });
});

describe('DEFAULT_ALGORITHM_CONFIG', () => {
  it('a les 4 stratégies requises', () => {
    expect(DEFAULT_ALGORITHM_CONFIG.strategies).toHaveProperty('elo_close');
    expect(DEFAULT_ALGORITHM_CONFIG.strategies).toHaveProperty('cross_category');
    expect(DEFAULT_ALGORITHM_CONFIG.strategies).toHaveProperty('starred');
    expect(DEFAULT_ALGORITHM_CONFIG.strategies).toHaveProperty('random');
  });

  it('chaque stratégie a description et recommendation', () => {
    for (const strategy of Object.values(DEFAULT_ALGORITHM_CONFIG.strategies)) {
      expect(strategy.description).toBeTruthy();
      expect(strategy.recommendation).toBeTruthy();
    }
  });

  it('le kFactor a des seuils cohérents', () => {
    const { kFactor } = DEFAULT_ALGORITHM_CONFIG;
    expect(kFactor.newThreshold).toBeLessThan(kFactor.moderateThreshold);
    expect(kFactor.newK).toBeGreaterThan(kFactor.moderateK);
    expect(kFactor.moderateK).toBeGreaterThan(kFactor.establishedK);
  });

  it('starredMinStars est positif', () => {
    expect(DEFAULT_ALGORITHM_CONFIG.starredMinStars).toBeGreaterThan(0);
  });

  it('candidatePoolSize est positif', () => {
    expect(DEFAULT_ALGORITHM_CONFIG.candidatePoolSize).toBeGreaterThan(0);
  });
});
