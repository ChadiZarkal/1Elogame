/**
 * @file leaderboard-vitrine.test.ts
 * @description Les catégories hors vitrine ne sortent d'aucune page publique.
 *
 * `getLeaderboardPage` et `getObservatoryData` servent le classement, l'API
 * publique, l'accueil, la méthodologie et l'Observatoire. Si l'un d'eux cesse
 * de transmettre l'exclusion, « Amour & Sexe » — contenus explicites et
 * orientations sexuelles soumises au vote — revient dans un classement
 * indexable, sans qu'aucune page ne le signale.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const getLeaderboard = vi.hoisted(() => vi.fn());
vi.mock('@/lib/repositories', () => ({ getLeaderboard }));

import { getLeaderboardPage, getObservatoryData } from '@/lib/leaderboard';
import { CATEGORIES_HORS_VITRINE } from '@/config/categories';

describe('vitrine publique du classement', () => {
  beforeEach(() => {
    getLeaderboard.mockReset();
    getLeaderboard.mockResolvedValue({ elements: [], total: 0 });
  });

  it("« Amour & Sexe » est hors vitrine", () => {
    expect(CATEGORIES_HORS_VITRINE).toContain('sexe');
  });

  it('le classement transmet l’exclusion à la base', async () => {
    await getLeaderboardPage({ limit: 10 });
    expect(getLeaderboard).toHaveBeenCalledWith(
      expect.objectContaining({ excludeCategories: CATEGORIES_HORS_VITRINE }),
    );
  });

  it('une catégorie hors vitrine demandée explicitement ne renvoie rien, sans interroger la base', async () => {
    const data = await getLeaderboardPage({ category: 'sexe', limit: 10 });
    expect(data.rankings).toEqual([]);
    expect(data.totalElements).toBe(0);
    expect(getLeaderboard).not.toHaveBeenCalled();
  });

  it("l'Observatoire transmet l'exclusion à la base", async () => {
    await getObservatoryData(5);
    expect(getLeaderboard).toHaveBeenCalledWith(
      expect.objectContaining({ excludeCategories: CATEGORIES_HORS_VITRINE }),
    );
  });
});
