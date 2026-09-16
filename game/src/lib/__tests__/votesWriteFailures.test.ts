import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Une écriture refusée doit laisser une trace.
 *
 * C'est le défaut qui a coûté le plus cher sur « Le pire des deux » : les trois
 * écritures d'un vote partaient dans un `Promise.all` dont la valeur était
 * jetée. Le client Supabase ne lève pas, il rend `{ error }`. Quand la mise à
 * jour des éléments s'est mise à échouer — une colonne du payload manquait sur
 * la base de production —, rien ne l'a signalé pendant sept mois : l'ELO n'a
 * plus bougé, et l'écran de résultat affichait « 1 vote » sur des propositions
 * qui en avaient reçu soixante.
 */
const { createServerClientMock, typedInsertMock, typedUpdateMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  typedInsertMock: vi.fn(),
  typedUpdateMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  createServerClient: createServerClientMock,
  typedInsert: typedInsertMock,
  typedUpdate: typedUpdateMock,
}));

const ELEMENTS = [
  { id: 'gagnant', elo_global: 1000, nb_participations: 40, elo_homme: 1000, elo_19_22: 1000 },
  { id: 'perdant', elo_global: 1000, nb_participations: 35, elo_homme: 1000, elo_19_22: 1000 },
];

/** Client minimal : lecture des deux éléments, puis les trois requêtes de rang. */
function clientFactice() {
  return {
    from: () => ({
      select: (_colonnes: string, options?: { count?: string; head?: boolean }) => {
        const compte = { count: options?.count ? 3 : null };
        const chaine: Record<string, unknown> = {
          in: async () => ({ data: ELEMENTS, error: null }),
          eq: () => chaine,
          gt: async () => compte,
          then: (resoudre: (r: unknown) => void) => resoudre(compte),
        };
        return chaine;
      },
    }),
  };
}

let erreurs: string[] = [];

beforeEach(() => {
  vi.resetModules();
  erreurs = [];
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    erreurs.push(args.map(String).join(' '));
  });
  process.env.NEXT_PUBLIC_MOCK_MODE = 'false';
  createServerClientMock.mockReturnValue(clientFactice());
  typedInsertMock.mockResolvedValue({ error: null });
  typedUpdateMock.mockReturnValue({ eq: async () => ({ error: null }) });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('processVote — écritures refusées', () => {
  it('ne dit rien quand tout passe', async () => {
    const { processVote } = await import('@/lib/repositories/votes');
    await processVote('gagnant', 'perdant', 'homme', '19-22');
    expect(erreurs).toEqual([]);
  });

  // Le cas réel : la colonne `nb_participations_homme` n'existait pas sur la
  // base de production, et PostgREST rejetait toute la requête.
  it('signale une colonne manquante sur la mise à jour des éléments', async () => {
    typedUpdateMock.mockReturnValue({
      eq: async () => ({
        error: { message: "Could not find the 'nb_participations_homme' column of 'elements'" },
      }),
    });

    const { processVote } = await import('@/lib/repositories/votes');
    await processVote('gagnant', 'perdant', 'homme', '19-22');

    expect(erreurs).toHaveLength(2); // gagnant et perdant
    expect(erreurs[0]).toContain('[VOTE] Écriture refusée');
    expect(erreurs[0]).toContain('nb_participations_homme');
    expect(erreurs[0]).toContain('gagnant');
  });

  it('signale aussi un enregistrement de vote refusé', async () => {
    typedInsertMock.mockResolvedValue({ error: { message: 'violates row-level security policy' } });

    const { processVote } = await import('@/lib/repositories/votes');
    await processVote('gagnant', 'perdant', 'femme', '23-26');

    expect(erreurs.some((e) => e.includes('voteInsert') && e.includes('row-level security'))).toBe(true);
  });

  // Le vote est déjà inséré quand la mise à jour échoue : lever ferait revoter
  // le joueur, et le duel serait compté deux fois.
  it('rend quand même un résultat au joueur', async () => {
    typedUpdateMock.mockReturnValue({ eq: async () => ({ error: { message: 'boom' } }) });

    const { processVote } = await import('@/lib/repositories/votes');
    const resultat = await processVote('gagnant', 'perdant', 'homme', '16-18');

    expect(resultat.winner.id).toBe('gagnant');
    expect(resultat.winner.percentage).toBeGreaterThan(0);
  });
});
