/**
 * @file validations.test.ts
 * @description Tests unitaires pour les schémas de validation Zod
 */

import { describe, it, expect } from 'vitest';
import {
  categorieSchema,
  sexeVotantSchema,
  ageVotantSchema,
  feedbackTypeSchema,
  playerProfileSchema,
  elementCreateSchema,
  elementUpdateSchema,
  voteSchema,
  feedbackSchema,
  adminLoginSchema,
  duelQuerySchema,
  elementsQuerySchema,
  rankingsQuerySchema,
} from '@/lib/validations';

describe('categorieSchema', () => {
  it('accepte les catégories valides', () => {
    expect(categorieSchema.parse('sexe')).toBe('sexe');
    expect(categorieSchema.parse('lifestyle')).toBe('lifestyle');
    expect(categorieSchema.parse('quotidien')).toBe('quotidien');
    expect(categorieSchema.parse('bureau')).toBe('bureau');
  });

  it('rejette les catégories invalides', () => {
    expect(() => categorieSchema.parse('invalid')).toThrow();
    expect(() => categorieSchema.parse('')).toThrow();
  });
});

describe('sexeVotantSchema', () => {
  it('accepte les valeurs valides', () => {
    expect(sexeVotantSchema.parse('homme')).toBe('homme');
    expect(sexeVotantSchema.parse('femme')).toBe('femme');
    expect(sexeVotantSchema.parse('autre')).toBe('autre');
  });

  it('rejette les valeurs invalides', () => {
    expect(() => sexeVotantSchema.parse('nonbinaire')).toThrow();
  });
});

describe('ageVotantSchema', () => {
  it('accepte toutes les tranches d\'âge', () => {
    expect(ageVotantSchema.parse('16-18')).toBe('16-18');
    expect(ageVotantSchema.parse('19-22')).toBe('19-22');
    expect(ageVotantSchema.parse('23-26')).toBe('23-26');
    expect(ageVotantSchema.parse('27+')).toBe('27+');
  });
});

describe('playerProfileSchema', () => {
  it('accepte un profil valide', () => {
    const result = playerProfileSchema.parse({ sex: 'homme', age: '19-22' });
    expect(result.sex).toBe('homme');
    expect(result.age).toBe('19-22');
  });

  it('rejette un profil incomplet', () => {
    expect(() => playerProfileSchema.parse({ sex: 'homme' })).toThrow();
    expect(() => playerProfileSchema.parse({ age: '19-22' })).toThrow();
  });
});

describe('elementCreateSchema', () => {
  it('accepte un élément valide', () => {
    const result = elementCreateSchema.parse({
      texte: 'Test element',
      categorie: 'sexe',
      niveau_provocation: 3,
    });
    expect(result.texte).toBe('Test element');
    expect(result.niveau_provocation).toBe(3);
  });

  it('texte trop court', () => {
    expect(() => elementCreateSchema.parse({
      texte: 'AB',
      categorie: 'sexe',
    })).toThrow();
  });

  it('texte trop long', () => {
    expect(() => elementCreateSchema.parse({
      texte: 'A'.repeat(201),
      categorie: 'sexe',
    })).toThrow();
  });

  it('applique un niveau de provocation par défaut', () => {
    const result = elementCreateSchema.parse({
      texte: 'Test element',
      categorie: 'sexe',
    });
    expect(result.niveau_provocation).toBe(2);
  });
});

describe('voteSchema', () => {
  it('accepte un vote valide', () => {
    const result = voteSchema.parse({
      winnerId: 'id-1',
      loserId: 'id-2',
      sexe: 'femme',
      age: '23-26',
    });
    expect(result.winnerId).toBe('id-1');
  });

  it('rejette quand winner === loser', () => {
    expect(() => voteSchema.parse({
      winnerId: 'id-1',
      loserId: 'id-1',
      sexe: 'homme',
      age: '16-18',
    })).toThrow();
  });
});

describe('feedbackSchema', () => {
  it('accepte un feedback valide', () => {
    const result = feedbackSchema.parse({
      elementAId: 'id-1',
      elementBId: 'id-2',
      type: 'star',
    });
    expect(result.type).toBe('star');
  });

  it('rejette les mêmes éléments', () => {
    expect(() => feedbackSchema.parse({
      elementAId: 'id-1',
      elementBId: 'id-1',
      type: 'star',
    })).toThrow();
  });
});

describe('adminLoginSchema', () => {
  it('accepte un mot de passe valide', () => {
    const result = adminLoginSchema.parse({ password: 'monmotdepasse' });
    expect(result.password).toBe('monmotdepasse');
  });

  it('rejette un mot de passe vide', () => {
    expect(() => adminLoginSchema.parse({ password: '' })).toThrow();
  });
});

describe('duelQuerySchema', () => {
  it('accepte des seenDuels valides', () => {
    const result = duelQuerySchema.parse({ seenDuels: 'id1-id2,id3-id4' });
    expect(result.seenDuels).toBe('id1-id2,id3-id4');
  });

  it('accepte l\'absence de seenDuels', () => {
    const result = duelQuerySchema.parse({});
    expect(result.seenDuels).toBeUndefined();
  });
});

describe('elementsQuerySchema', () => {
  it('applique les valeurs par défaut', () => {
    const result = elementsQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('accepte des filtres valides', () => {
    const result = elementsQuerySchema.parse({
      page: '2',
      limit: '50',
      category: 'bureau',
      active: 'true',
      search: 'test',
    });
    expect(result.page).toBe(2);
    expect(result.active).toBe(true);
  });
});

describe('rankingsQuerySchema', () => {
  it('accepte des paramètres valides', () => {
    const result = rankingsQuerySchema.parse({
      type: 'red',
      limit: '20',
      category: 'sexe',
    });
    expect(result.type).toBe('red');
    expect(result.limit).toBe(20);
  });
});
