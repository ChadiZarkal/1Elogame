import { describe, expect, it } from 'vitest';
import { noteMesuree } from '@/lib/dixmaisNote';

describe('noteMesuree — la note des joueurs sur une info', () => {
  it('prend les vraies notes dès qu’il y en a cinq', () => {
    expect(noteMesuree({ notes_count: 8, notes_total: 100, votes_count: 50, total_delta: -300 }))
      .toEqual({ note: 12.5, source: 'notes', echantillon: 8 });
  });

  it('retombe sur l’estimation des anciens votes en deçà', () => {
    expect(noteMesuree({ notes_count: 3, notes_total: 30, votes_count: 20, total_delta: -60 }))
      .toEqual({ note: 7, source: 'estimation', echantillon: 20 });
    // La moyenne précalculée par la vue prime sur le recalcul.
    expect(noteMesuree({ votes_count: 20, total_delta: -60, avg_delta: -4.5 })?.note).toBe(5.5);
  });

  it('marche sans les colonnes de la migration 030', () => {
    expect(noteMesuree({ votes_count: 10, total_delta: -20 })).toEqual({ note: 8, source: 'estimation', echantillon: 10 });
  });

  it('reste entre 0 et 15', () => {
    expect(noteMesuree({ votes_count: 10, total_delta: -140 })?.note).toBe(0);
    expect(noteMesuree({ notes_count: 5, notes_total: 90 })?.note).toBe(15);
  });

  it('se tait quand rien n’est mesurable', () => {
    expect(noteMesuree({ notes_count: 4, notes_total: 40, votes_count: 4, total_delta: -8 })).toBeNull();
    expect(noteMesuree({})).toBeNull();
  });
});
