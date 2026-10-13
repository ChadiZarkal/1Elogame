import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getRandomStatements } from '@/lib/repositories/dixmais';

/**
 * Le mélange d'un profil dans la mécanique à la moyenne : trois red flags et
 * deux green flags, le premier toujours un red flag.
 */
describe('getRandomStatements — mélange red / green', () => {
  beforeEach(() => { process.env.NEXT_PUBLIC_MOCK_MODE = 'true'; });
  afterEach(() => { delete process.env.NEXT_PUBLIC_MOCK_MODE; });

  it('sert exactement le nombre de green flags demandé', async () => {
    for (let i = 0; i < 20; i++) {
      const profil = await getRandomStatements(5, [], { verts: 2 });
      expect(profil).toHaveLength(5);
      expect(profil.filter((s) => s.type === 'positive')).toHaveLength(2);
      expect(profil[0].type).toBe('negative');
    }
  });

  it('ne sert que des red flags si on le demande', async () => {
    const profil = await getRandomStatements(5, [], { redFlagsSeulement: true });
    expect(profil.every((s) => s.type === 'negative')).toBe(true);
  });

  it('garde le mélange par défaut des autres appels', async () => {
    const profil = await getRandomStatements(10, []);
    expect(profil.filter((s) => s.type === 'positive')).toHaveLength(3);
  });
});
