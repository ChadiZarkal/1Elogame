import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useDixMais } from '../useDixMais';

/**
 * Ce que le profil sert à faire : voyager avec chaque vote.
 *
 * C'est l'unique raison de le demander avant la première note plutôt que dans
 * le rapport. Un test sur l'écran d'accueil ne le prouve pas — il montre que
 * la question est posée, pas que la réponse arrive jusqu'à la base.
 */
function statementsFactices(nombre = 5) {
  return Array.from({ length: nombre }, (_, i) => ({
    id: `stmt-${i}`,
    text: `Révélation ${i + 1}`,
    type: i === 0 ? 'negative' : 'positive',
    category: 'caractere',
    is_active: true,
    is_approved: true,
    votes_count: 30,
    total_delta: -60,
    elimination_count: 6,
    created_at: '2026-09-16T00:00:00.000Z',
  }));
}

let appels: { url: string; body: Record<string, unknown> }[] = [];

beforeEach(() => {
  appels = [];
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const adresse = String(url);
      if (init?.body) {
        appels.push({ url: adresse, body: JSON.parse(String(init.body)) });
      }
      if (adresse.startsWith('/api/dixmais/statements')) {
        return Promise.resolve({ ok: true, json: async () => ({ data: statementsFactices() }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useDixMais — le profil accompagne le vote', () => {
  it('joint le sexe et la tranche d’âge à chaque vote', async () => {
    const { result } = renderHook(() => useDixMais());

    act(() => result.current.setPlayerProfile({ sex: 'femme', age: '19-22' }));
    await act(async () => { await result.current.start(); });
    await waitFor(() => expect(result.current.phase).toBe('reveal'));

    act(() => result.current.setDraft(7));
    act(() => result.current.commit());

    const votes = appels.filter((a) => a.url === '/api/dixmais/vote');
    expect(votes).toHaveLength(1);
    expect(votes[0].body).toMatchObject({
      statement_id: 'stmt-0',
      previous_score: 10,
      new_score: 7,
      sex: 'femme',
      age: '19-22',
    });
  });

  // Le profil est partagé avec les autres jeux : celui qui a déjà joué au
  // Pire des deux ne se voit rien redemander, et ses votes sont étiquetés dès
  // le premier.
  it('reprend le profil déjà enregistré par un autre jeu du site', async () => {
    localStorage.setItem(
      'rog_session',
      JSON.stringify({ profile: { sex: 'homme', age: '27+' }, seenDuels: [], streak: 3, duelCount: 12 }),
    );

    const { result } = renderHook(() => useDixMais());
    await waitFor(() => expect(result.current.profileChecked).toBe(true));
    expect(result.current.playerProfile).toEqual({ sex: 'homme', age: '27+' });

    await act(async () => { await result.current.start(); });
    await waitFor(() => expect(result.current.phase).toBe('reveal'));
    act(() => result.current.setDraft(4));
    act(() => result.current.commit());

    const votes = appels.filter((a) => a.url === '/api/dixmais/vote');
    expect(votes[0].body).toMatchObject({ sex: 'homme', age: '27+' });
  });

  // Enregistrer le profil ne doit pas effacer la session de l'autre jeu, qui
  // partage le même stockage.
  it('n’écrase pas les duels déjà vus de l’autre jeu', async () => {
    localStorage.setItem(
      'rog_session',
      JSON.stringify({ profile: { sex: 'autre', age: '16-18' }, seenDuels: ['a-b', 'c-d'], streak: 5, duelCount: 9 }),
    );

    const { result } = renderHook(() => useDixMais());
    await waitFor(() => expect(result.current.profileChecked).toBe(true));

    act(() => result.current.setPlayerProfile({ sex: 'femme', age: '23-26' }));

    const session = JSON.parse(localStorage.getItem('rog_session') as string);
    expect(session.profile).toEqual({ sex: 'femme', age: '23-26' });
    expect(session.seenDuels).toEqual(['a-b', 'c-d']);
    expect(session.streak).toBe(5);
    expect(session.duelCount).toBe(9);
  });

  it('laisse jouer sans profil quand le stockage est indisponible', async () => {
    const { result } = renderHook(() => useDixMais());
    await waitFor(() => expect(result.current.profileChecked).toBe(true));

    await act(async () => { await result.current.start(); });
    await waitFor(() => expect(result.current.phase).toBe('reveal'));
    act(() => result.current.setDraft(6));
    act(() => result.current.commit());

    const votes = appels.filter((a) => a.url === '/api/dixmais/vote');
    expect(votes[0].body).toMatchObject({ sex: null, age: null });
  });
});
