/**
 * @file categories.test.ts
 * @description Tests unitaires pour la configuration des catégories
 */

import { describe, it, expect } from 'vitest';
import {
  CATEGORIES_CONFIG,
  CATEGORIES_LIST,
  CATEGORY_IDS,
  getCategory,
  getCategoryClasses,
} from '@/config/categories';

describe('CATEGORIES_CONFIG', () => {
  it('contient exactement 3 catégories', () => {
    expect(Object.keys(CATEGORIES_CONFIG)).toHaveLength(3);
  });

  it('contient les catégories attendues', () => {
    expect(CATEGORIES_CONFIG).toHaveProperty('sexe');
    expect(CATEGORIES_CONFIG).toHaveProperty('quotidien');
    expect(CATEGORIES_CONFIG).toHaveProperty('metiers');
  });

  it('chaque catégorie a les propriétés requises', () => {
    for (const [key, config] of Object.entries(CATEGORIES_CONFIG)) {
      expect(config.id).toBe(key);
      expect(config.label).toBeTruthy();
      expect(config.labelFr).toBeTruthy();
      expect(config.color).toBeTruthy();
      expect(config.textColor).toBeTruthy();
    }
  });

  it('l\'emoji de sexe n\'est pas corrompu', () => {
    expect(CATEGORIES_CONFIG.sexe.emoji).toBe('🔥');
    expect(CATEGORIES_CONFIG.sexe.emoji).not.toBe('�');
  });
});

describe('CATEGORIES_LIST', () => {
  it('est un tableau de 3 éléments', () => {
    expect(CATEGORIES_LIST).toHaveLength(3);
  });
});

describe('CATEGORY_IDS', () => {
  it('contient les 3 IDs', () => {
    expect(CATEGORY_IDS).toEqual(['sexe', 'quotidien', 'metiers']);
  });
});

describe('getCategory', () => {
  it('retourne la configuration pour un ID valide', () => {
    const cat = getCategory('sexe');
    expect(cat).toBeDefined();
    expect(cat!.label).toBe('Sexe & Kinks');
  });

  it('retourne undefined pour un ID invalide', () => {
    expect(getCategory('inexistant')).toBeUndefined();
  });
});

describe('getCategoryClasses', () => {
  it('retourne les classes CSS pour un ID valide', () => {
    const classes = getCategoryClasses('metiers');
    expect(classes).toContain('bg-');
    expect(classes).toContain('text-');
  });

  it('retourne des classes fallback pour un ID invalide', () => {
    const classes = getCategoryClasses('unknown');
    expect(classes).toContain('bg-gray-500');
  });
});
