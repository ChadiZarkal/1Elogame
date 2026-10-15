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

  it('classe sur la note, vraies notes et estimations confondues, la plus basse en tête', async () => {
    select.mockResolvedValue({
      data: [
        ligne('a', 'Note réelle 6', { notes_count: 10, notes_total: 60 }),
        ligne('b', 'Estimée 3', { votes_count: 10, total_delta: -70 }),
        ligne('c', 'Rien de mesurable', { votes_count: 2, total_delta: -10 }),
        ligne('d', 'Note réelle 2', { notes_count: 5, notes_total: 10, votes_count: 40, total_delta: 0 }),
      ],
      error: null,
    });
    const { getDixMaisLeaderboard } = await import('@/lib/repositories/dixmais');

    const classement = await getDixMaisLeaderboard(10);
    expect(classement.map((l) => l.text)).toEqual(['Note réelle 2', 'Estimée 3', 'Note réelle 6', 'Rien de mesurable']);
    expect(classement[0].note).toEqual({ note: 2, source: 'notes', echantillon: 5 });
    expect(classement[3].note).toBeNull();
  });

  // Le même texte sur plusieurs lignes : les notes s'additionnent avant le
  // calcul, comme les votes.
  it('réunit les notes des exemplaires d’un même énoncé', async () => {
    select.mockResolvedValue({
      data: [
        ligne('a', 'Il ronfle', { notes_count: 3, notes_total: 24 }),
        ligne('b', 'il ronfle ', { notes_count: 3, notes_total: 12 }),
      ],
      error: null,
    });
    const { getDixMaisLeaderboard } = await import('@/lib/repositories/dixmais');

    const [seul] = await getDixMaisLeaderboard(10);
    expect(seul.note).toEqual({ note: 6, source: 'notes', echantillon: 6 });
  });
});

describe('getDixMaisCohortStats', () => {
  it('ajoute les notes de la cohorte aux anciens votes', async () => {
    rpc.mockImplementation((nom: string) => Promise.resolve(
      nom === 'dixmais_cohort_stats'
        ? { data: [{ statement_id: 'a', votes: 4, avg_delta: -3, elimination_rate: 10 }], error: null }
        : { data: [{ statement_id: 'a', notes: 6, avg_note: 5.5 }, { statement_id: 'b', notes: 2, avg_note: 12 }], error: null },
    ));
    const { getDixMaisCohortStats } = await import('@/lib/repositories/dixmais');

    const stats = await getDixMaisCohortStats(['a', 'b'], 'femme', '19-22');
    expect(stats).toEqual([
      { statement_id: 'a', votes: 4, avg_delta: -3, elimination_rate: 10, notes: 6, avg_note: 5.5 },
      { statement_id: 'b', votes: 0, avg_delta: 0, elimination_rate: 0, notes: 2, avg_note: 12 },
    ]);
  });

  it('se contente des anciens votes sans la migration 030', async () => {
    rpc.mockImplementation((nom: string) => Promise.resolve(
      nom === 'dixmais_cohort_stats'
        ? { data: [{ statement_id: 'a', votes: 4, avg_delta: -3, elimination_rate: 10 }], error: null }
        : { data: null, error: { code: 'PGRST202', message: 'Could not find the function' } },
    ));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getDixMaisCohortStats } = await import('@/lib/repositories/dixmais');

    const stats = await getDixMaisCohortStats(['a'], 'femme', '19-22');
    expect(stats).toEqual([{ statement_id: 'a', votes: 4, avg_delta: -3, elimination_rate: 10 }]);
    expect(warn).not.toHaveBeenCalled();
  });
});
