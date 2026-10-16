import { describe, expect, it } from 'vitest';
import { NOTES_MIN_COMPARAISON, noteMesuree } from '@/lib/dixmaisNote';

describe('noteMesuree — la note des joueurs sur une info', () => {
  it('est la moyenne des notes de la mécanique actuelle', () => {
    expect(noteMesuree({ notes_count: 8, notes_total: 100 })).toEqual({ note: 12.5, echantillon: 8 });
  });

  it(`apparaît à partir de ${NOTES_MIN_COMPARAISON} notes, pas avant`, () => {
    expect(NOTES_MIN_COMPARAISON).toBe(3);
    expect(noteMesuree({ notes_count: 2, notes_total: 20 })).toBeNull();
    expect(noteMesuree({ notes_count: 3, notes_total: 21 })).toEqual({ note: 7, echantillon: 3 });
  });

  // Le défaut signalé : les moyennes de fin mêlaient encore les anciens votes,
  // qui mesuraient autre chose. Ils ne doivent plus rien produire, même quand
  // ils sont nombreux et que les notes manquent.
  it('ignore entièrement les votes de l’ancienne mécanique', () => {
    const ancien = { votes_count: 400, total_delta: -1200, avg_delta: -3 } as Record<string, number>;
    expect(noteMesuree(ancien)).toBeNull();
    expect(noteMesuree({ ...ancien, notes_count: 4, notes_total: 48 })).toEqual({ note: 12, echantillon: 4 });
  });

  it('reste entre 0 et 15', () => {
    expect(noteMesuree({ notes_count: 5, notes_total: 90 })?.note).toBe(15);
    expect(noteMesuree({ notes_count: 5, notes_total: 0 })?.note).toBe(0);
  });
});
