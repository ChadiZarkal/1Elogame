import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * L'enregistrement des notes et le classement, côté base.
 *
 * Le client Supabase est simulé : on vérifie ce que le code lui demande, et
 * surtout qu'il tient debout quand la migration 030 n'est pas encore jouée.
 */

const rpc = vi.fn();
const select = vi.fn();

vi.mock('@/lib/supabaseDixmais', () => ({
  createDixmaisServerClient: () => ({
    rpc,
    from: () => ({ select }),
  }),
}));

beforeEach(() => {
  vi.resetModules();
  rpc.mockReset();
  select.mockReset();
  delete process.env.NEXT_PUBLIC_MOCK_MODE;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('recordDixMaisNote', () => {
  it('appelle la fonction de la migration 030 avec la note et le profil', async () => {
    rpc.mockResolvedValue({ error: null });
    const { recordDixMaisNote } = await import('@/lib/repositories/dixmais');

    await expect(recordDixMaisNote({ statement_id: 's1', session_id: 'x', note: 13, sex: 'homme', age: '27+' })).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith('record_dixmais_note', {
      p_statement_id: 's1', p_session_id: 'x', p_note: 13, p_sex: 'homme', p_age: '27+',
    });
  });

  // Avant la migration, la fonction n'existe pas : le jeu continue, et le
  // journal ne le dit qu'une fois au lieu d'une ligne par note.
  it('tient sans la migration et ne le signale qu’une fois', async () => {
    rpc.mockResolvedValue({ error: { code: 'PGRST202', message: 'Could not find the function' } });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { recordDixMaisNote } = await import('@/lib/repositories/dixmais');

    await expect(recordDixMaisNote({ statement_id: 's1', session_id: 'x', note: 4 })).resolves.toBe(false);
    await expect(recordDixMaisNote({ statement_id: 's2', session_id: 'x', note: 5 })).resolves.toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('migration 030');
  });
});

describe('getDixMaisLeaderboard', () => {
  const ligne = (id: string, texte: string, extra: Record<string, unknown>) => ({
    id, text: texte, type: 'negative', category: 'caractere', is_active: true, is_approved: true,
    votes_count: 0, total_delta: 0, elimination_count: 0, created_at: '', ...extra,
  });

  it('classe sur les seules notes actuelles, la plus basse en tête', async () => {
    select.mockResolvedValue({
      data: [
        ligne('a', 'Note 6', { notes_count: 10, notes_total: 60 }),
        // Beaucoup d'anciens votes très négatifs, aucune note : plus de note du tout.
        ligne('b', 'Seulement anciens votes', { votes_count: 400, total_delta: -2800 }),
        ligne('c', 'Deux notes seulement', { notes_count: 2, notes_total: 2 }),
        ligne('d', 'Note 2', { notes_count: 3, notes_total: 6, votes_count: 40, total_delta: 0 }),
      ],
      error: null,
    });
    const { getDixMaisLeaderboard } = await import('@/lib/repositories/dixmais');

    const classement = await getDixMaisLeaderboard(10);
    expect(classement.slice(0, 2).map((l) => l.text)).toEqual(['Note 2', 'Note 6']);
    expect(classement[0].note).toEqual({ note: 2, echantillon: 3 });
    expect(classement.find((l) => l.text === 'Seulement anciens votes')!.note).toBeNull();
    expect(classement.find((l) => l.text === 'Deux notes seulement')!.note).toBeNull();
  });

  // Le même texte sur plusieurs lignes : les notes s'additionnent avant le
  // calcul.
  it('réunit les notes des exemplaires d’un même énoncé', async () => {
    select.mockResolvedValue({
      data: [
        ligne('a', 'Il ronfle', { notes_count: 2, notes_total: 16 }),
        ligne('b', 'il ronfle ', { notes_count: 2, notes_total: 8 }),
      ],
      error: null,
    });
    const { getDixMaisLeaderboard } = await import('@/lib/repositories/dixmais');

    const [seul] = await getDixMaisLeaderboard(10);
    expect(seul.note).toEqual({ note: 6, echantillon: 4 });
  });
});

describe('getDixMaisCohortStats', () => {
  it('lit les notes de la cohorte, sans la session du joueur', async () => {
    rpc.mockResolvedValue({ data: [{ statement_id: 'a', notes: '6', avg_note: '5.5' }], error: null });
    const { getDixMaisCohortStats } = await import('@/lib/repositories/dixmais');

    const stats = await getDixMaisCohortStats(['a', 'b'], 'femme', '19-22', 'ma-session');
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('dixmais_cohort_notes', {
      p_statement_ids: ['a', 'b'], p_sex: 'femme', p_age: '19-22', p_exclude_session: 'ma-session',
    });
    expect(stats).toEqual([{ statement_id: 'a', notes: 6, avg_note: 5.5 }]);
  });

  it('rend une liste vide si la base ne répond pas', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'timeout' } });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getDixMaisCohortStats } = await import('@/lib/repositories/dixmais');

    expect(await getDixMaisCohortStats(['a'], 'femme', '19-22')).toEqual([]);
  });
});
