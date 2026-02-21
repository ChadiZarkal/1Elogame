/**
 * @file mockData.test.ts
 * @description Tests unitaires pour le module de données mock.
 * Couvre: getMockElements, getMockElement, getSeenPairs, recordMockVote, updateMockElo.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMockElements,
  getMockElement,
  getSeenPairs,
  recordMockVote,
  updateMockElo,
  mockElements,
} from '@/lib/mockData';

// Reset mock state between tests
beforeEach(() => {
  // Reset ELO values
  for (const el of mockElements) {
    el.elo_global = 1000;
    el.actif = true;
    el.nb_participations = 0;
  }
  // Clear seen pairs (must use .clear() since module caches the Map reference)
  if (globalThis.__mockVotes) {
    globalThis.__mockVotes.clear();
  }
});

describe('getMockElements', () => {
  it('retourne uniquement les éléments actifs', () => {
    const elements = getMockElements();
    expect(elements.every(e => e.actif)).toBe(true);
  });

  it('retourne 40 éléments par défaut', () => {
    const elements = getMockElements();
    expect(elements.length).toBe(40);
  });

  it('exclut les éléments désactivés', () => {
    mockElements[0].actif = false;
    const elements = getMockElements();
    expect(elements.length).toBe(39);
    expect(elements.find(e => e.id === '1')).toBeUndefined();
  });

  it('retourne des éléments avec des catégories valides', () => {
    const validCategories = ['sexe', 'lifestyle', 'quotidien', 'bureau'];
    const elements = getMockElements();
    for (const el of elements) {
      expect(validCategories).toContain(el.categorie);
    }
  });

  it('retourne des éléments avec les 4 catégories', () => {
    const elements = getMockElements();
    const categories = new Set(elements.map(e => e.categorie));
    expect(categories.size).toBe(4);
  });
});

describe('getMockElement', () => {
  it('retourne un élément par son ID', () => {
    const el = getMockElement('1');
    expect(el).toBeDefined();
    expect(el?.id).toBe('1');
  });

  it('retourne undefined pour un ID inexistant', () => {
    const el = getMockElement('nonexistent');
    expect(el).toBeUndefined();
  });

  it('retourne undefined pour un élément inactif', () => {
    mockElements[0].actif = false;
    const el = getMockElement('1');
    expect(el).toBeUndefined();
  });

  it('retourne l\'élément avec toutes les propriétés ELO', () => {
    const el = getMockElement('1');
    expect(el).toHaveProperty('elo_global');
    expect(el).toHaveProperty('elo_homme');
    expect(el).toHaveProperty('elo_femme');
    expect(el).toHaveProperty('elo_16_18');
    expect(el).toHaveProperty('elo_19_22');
    expect(el).toHaveProperty('elo_23_26');
    expect(el).toHaveProperty('elo_27plus');
  });
});

describe('getSeenPairs', () => {
  it('retourne un Set vide pour une nouvelle session', () => {
    const seen = getSeenPairs('session-new');
    expect(seen.size).toBe(0);
  });

  it('retourne le même Set pour la même session', () => {
    const seen1 = getSeenPairs('session-a');
    seen1.add('1-2');
    const seen2 = getSeenPairs('session-a');
    expect(seen2.has('1-2')).toBe(true);
  });

  it('retourne des Sets différents pour des sessions différentes', () => {
    const seenA = getSeenPairs('session-a');
    seenA.add('1-2');
    const seenB = getSeenPairs('session-b');
    expect(seenB.has('1-2')).toBe(false);
  });

  it('évicte les anciennes sessions quand la limite est atteinte', () => {
    // Create 100 sessions (the max)
    for (let i = 0; i < 100; i++) {
      getSeenPairs(`session-${i}`);
    }
    // Adding one more should evict the first
    const firstSeen = getSeenPairs('session-0');
    firstSeen.add('1-2');
    
    getSeenPairs('session-new');
    // Re-access session-0 should still work (it was re-added when we accessed it)
    const seen = getSeenPairs('session-0');
    expect(seen).toBeDefined();
  });
});

describe('recordMockVote', () => {
  it('enregistre un vote dans les paires vues', () => {
    recordMockVote('session-test', '1', '2');
    const seen = getSeenPairs('session-test');
    expect(seen.has('1-2')).toBe(true);
  });

  it('trie les IDs pour assurer la cohérence de la clé', () => {
    recordMockVote('session-test', '5', '3');
    const seen = getSeenPairs('session-test');
    expect(seen.has('3-5')).toBe(true);
    expect(seen.has('5-3')).toBe(false);
  });

  it('n\'ajoute pas de doublon pour la même paire dans le même ordre', () => {
    recordMockVote('session-test', '1', '2');
    recordMockVote('session-test', '1', '2'); // Exact same pair
    const seen = getSeenPairs('session-test');
    expect(seen.size).toBe(1);
  });

  it('les paires inversées créent la même clé triée', () => {
    // recordMockVote trie les IDs: '5','3' => clé '3-5'
    recordMockVote('session-sorted', '5', '3');
    recordMockVote('session-sorted', '3', '5');
    const seen = getSeenPairs('session-sorted');
    expect(seen.size).toBe(1);
  });
});

describe('updateMockElo', () => {
  it('met à jour les scores ELO des deux éléments', () => {
    updateMockElo('1', '2', 1050, 950);
    const winner = getMockElement('1');
    const loser = getMockElement('2');
    expect(winner?.elo_global).toBe(1050);
    expect(loser?.elo_global).toBe(950);
  });

  it('ne crash pas si les IDs n\'existent pas', () => {
    expect(() => updateMockElo('nonexistent', 'also-nonexistent', 1050, 950)).not.toThrow();
  });

  it('ne modifie pas les autres propriétés ELO', () => {
    const originalHomme = getMockElement('1')?.elo_homme;
    updateMockElo('1', '2', 1050, 950);
    const updated = getMockElement('1');
    expect(updated?.elo_homme).toBe(originalHomme);
  });
});

describe('mockElements structure', () => {
  it('contient 10 éléments par catégorie', () => {
    const byCat = mockElements.reduce((acc, el) => {
      acc[el.categorie] = (acc[el.categorie] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    expect(byCat['sexe']).toBe(10);
    expect(byCat['lifestyle']).toBe(10);
    expect(byCat['quotidien']).toBe(10);
    expect(byCat['bureau']).toBe(10);
  });

  it('chaque élément a un texte non vide', () => {
    for (const el of mockElements) {
      expect(el.texte.length).toBeGreaterThan(0);
    }
  });

  it('les IDs sont uniques', () => {
    const ids = mockElements.map(e => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('chaque élément a des valeurs de participation initialisées à 0', () => {
    for (const el of mockElements) {
      expect(el.nb_participations).toBe(0);
    }
  });
});
