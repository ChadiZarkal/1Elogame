/**
 * @file algorithm.test.ts
 * @description Tests unitaires pour l'algorithme de sélection de duels
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  selectStrategy,
  shuffleArray,
  getPairKey,
  isPairSeen,
  findCloseEloPairs,
  findCrossCategoryPairs,
  findRandomPairs,
  toElementDTO,
  selectDuelPair,
  getTotalPossibleDuels,
  allDuelsExhausted,
} from '@/lib/algorithm';
import { Element } from '@/types/database';

// Factory pour créer des éléments de test
function createMockElement(overrides: Partial<Element> = {}): Element {
  return {
    id: `el-${Math.random().toString(36).slice(2, 8)}`,
    texte: 'Test element',
    categorie: 'lifestyle',
    niveau_provocation: 2,
    actif: true,
    elo_global: 1000,
    elo_homme: 1000,
    elo_femme: 1000,
    elo_nonbinaire: 1000,
    elo_autre: 1000,
    elo_16_18: 1000,
    elo_19_22: 1000,
    elo_23_26: 1000,
    elo_27plus: 1000,
    nb_participations: 0,
    nb_participations_homme: 0,
    nb_participations_femme: 0,
    nb_participations_autre: 0,
    nb_participations_16_18: 0,
    nb_participations_19_22: 0,
    nb_participations_23_26: 0,
    nb_participations_27plus: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('selectStrategy', () => {
  it('retourne une stratégie valide', () => {
    const valid = ['elo_close', 'cross_category', 'starred', 'random'];
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(selectStrategy());
    }
  });
});

describe('shuffleArray', () => {
  it('retourne un tableau de même longueur', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr)).toHaveLength(5);
  });

  it('contient les mêmes éléments', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('ne modifie pas le tableau original', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(copy);
  });
});

describe('getPairKey', () => {
  it('crée une clé cohérente', () => {
    expect(getPairKey('a', 'b')).toBe('a-b');
    expect(getPairKey('b', 'a')).toBe('a-b');
  });

  it('trie alphabétiquement', () => {
    expect(getPairKey('z', 'a')).toBe('a-z');
  });
});

describe('isPairSeen', () => {
  it('détecte une paire vue', () => {
    const seen = new Set(['a-b', 'c-d']);
    expect(isPairSeen('a', 'b', seen)).toBe(true);
    expect(isPairSeen('b', 'a', seen)).toBe(true); // Ordre inversé
  });

  it('retourne false pour une paire non vue', () => {
    const seen = new Set(['a-b']);
    expect(isPairSeen('a', 'c', seen)).toBe(false);
  });
});

describe('findCloseEloPairs', () => {
  it('trouve des paires avec ELO proche', () => {
    const elements = [
      createMockElement({ id: 'a', elo_global: 1000 }),
      createMockElement({ id: 'b', elo_global: 1100 }), // diff = 100
      createMockElement({ id: 'c', elo_global: 2000 }), // diff = 1000 (trop loin)
    ];
    const pairs = findCloseEloPairs(elements, new Set(), 10);
    // Au moins une paire a-b devrait être trouvée
    expect(pairs.length).toBeGreaterThanOrEqual(1);
    const foundPair = pairs.some(([a, b]) => 
      Math.abs(a.elo_global - b.elo_global) <= 300
    );
    expect(foundPair).toBe(true);
  });

  it('exclut les paires déjà vues', () => {
    const elements = [
      createMockElement({ id: 'a', elo_global: 1000 }),
      createMockElement({ id: 'b', elo_global: 1050 }),
    ];
    const seen = new Set(['a-b']);
    const pairs = findCloseEloPairs(elements, seen, 10);
    expect(pairs).toHaveLength(0);
  });
});

describe('findCrossCategoryPairs', () => {
  it('trouve des paires de catégories différentes', () => {
    const elements = [
      createMockElement({ id: 'a', categorie: 'sexe' }),
      createMockElement({ id: 'b', categorie: 'bureau' }),
      createMockElement({ id: 'c', categorie: 'sexe' }),
    ];
    const pairs = findCrossCategoryPairs(elements, new Set(), 10);
    for (const [a, b] of pairs) {
      expect(a.categorie).not.toBe(b.categorie);
    }
  });
});

describe('findRandomPairs', () => {
  it('trouve des paires non vues', () => {
    const elements = [
      createMockElement({ id: 'a' }),
      createMockElement({ id: 'b' }),
      createMockElement({ id: 'c' }),
    ];
    const pairs = findRandomPairs(elements, new Set(), 10);
    expect(pairs.length).toBeGreaterThan(0);
  });

  it('respecte la limite', () => {
    const elements = Array.from({ length: 10 }, (_, i) =>
      createMockElement({ id: `el-${i}` })
    );
    const pairs = findRandomPairs(elements, new Set(), 3);
    expect(pairs.length).toBeLessThanOrEqual(3);
  });
});

describe('toElementDTO', () => {
  it('extrait uniquement id, texte, categorie', () => {
    const element = createMockElement({ id: 'test-1', texte: 'Hello', categorie: 'bureau' });
    const dto = toElementDTO(element);
    expect(dto).toEqual({
      id: 'test-1',
      texte: 'Hello',
      categorie: 'bureau',
    });
    expect(Object.keys(dto)).toHaveLength(3);
  });
});

describe('selectDuelPair', () => {
  it('retourne une paire quand il y a assez d\'éléments', () => {
    const elements = [
      createMockElement({ id: 'a' }),
      createMockElement({ id: 'b' }),
      createMockElement({ id: 'c' }),
    ];
    const result = selectDuelPair(elements, new Set());
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
  });

  it('retourne null avec moins de 2 éléments', () => {
    expect(selectDuelPair([], new Set())).toBeNull();
    expect(selectDuelPair([createMockElement()], new Set())).toBeNull();
  });

  it('retourne null quand tous les duels sont vus', () => {
    const a = createMockElement({ id: 'a' });
    const b = createMockElement({ id: 'b' });
    const seen = new Set(['a-b']);
    const result = selectDuelPair([a, b], seen);
    expect(result).toBeNull();
  });
});

describe('getTotalPossibleDuels', () => {
  it('calcule C(n,2)', () => {
    expect(getTotalPossibleDuels(2)).toBe(1);
    expect(getTotalPossibleDuels(3)).toBe(3);
    expect(getTotalPossibleDuels(4)).toBe(6);
    expect(getTotalPossibleDuels(10)).toBe(45);
    expect(getTotalPossibleDuels(40)).toBe(780);
  });

  it('retourne 0 pour 0 ou 1 élément', () => {
    expect(getTotalPossibleDuels(0)).toBe(0);
    expect(getTotalPossibleDuels(1)).toBe(0);
  });
});

describe('allDuelsExhausted', () => {
  it('true quand tous les duels sont vus', () => {
    expect(allDuelsExhausted(3, 3)).toBe(true); // C(3,2) = 3
    expect(allDuelsExhausted(3, 5)).toBe(true); // Plus que nécessaire
  });

  it('false quand il reste des duels', () => {
    expect(allDuelsExhausted(3, 2)).toBe(false);
    expect(allDuelsExhausted(10, 0)).toBe(false);
  });
});
