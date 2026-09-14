import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createDixmaisServerClientMock } = vi.hoisted(() => ({
  createDixmaisServerClientMock: vi.fn(),
}));

vi.mock('@/lib/supabaseDixmais', () => ({
  createDixmaisServerClient: createDixmaisServerClientMock,
}));

/**
 * Repli d'enregistrement d'un vote, quand le RPC atomique expire.
 *
 * Constaté en production : `PATCH /rest/v1/dixmais_statements` répondait 400 à
 * chaque passage par ce repli, parce que l'ancien code envoyait un objet
 * requête comme valeur de `votes_count`. Les votes concernés étaient insérés
 * mais n'entraient jamais dans le classement.
 */
describe('repositories/dixmais — repli quand le RPC de vote échoue', () => {
  beforeEach(() => {
    vi.resetModules();
    createDixmaisServerClientMock.mockReset();
    process.env.NEXT_PUBLIC_MOCK_MODE = 'false';
  });

  it('incrémente les compteurs avec des nombres, pas un objet requête', async () => {
    const updates: Record<string, unknown>[] = [];
    const inserts: Record<string, unknown>[] = [];

    const client = {
      rpc: () => Promise.resolve({ error: { message: 'timeout' } }),
      from: (table: string) => {
        const chain: Record<string, unknown> = {
          then: (resolve: (r: unknown) => void) =>
            resolve({ data: { votes_count: 4, total_delta: '-9', elimination_count: 1 }, error: null }),
          select: () => chain,
          eq: () => chain,
          maybeSingle: () => chain,
          insert: (payload: Record<string, unknown>) => { inserts.push({ table, ...payload }); return chain; },
          update: (payload: Record<string, unknown>) => { updates.push(payload); return chain; },
        };
        return chain;
      },
    };
    createDixmaisServerClientMock.mockReturnValue(client);

    const { recordDixMaisVote } = await import('@/lib/repositories/dixmais');
    await recordDixMaisVote({ statement_id: 's1', session_id: 'sess', previous_score: 8, new_score: 5 });

    expect(inserts).toHaveLength(1);
    expect(updates).toEqual([{ votes_count: 5, total_delta: -12, elimination_count: 1 }]);
    for (const valeur of Object.values(updates[0])) {
      expect(typeof valeur).toBe('number');
    }
  });
});
