import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useDixMais } from '../useDixMais';

/**
 * Ce que le profil sert à faire : voyager avec chaque vote.
 *
 * C'est l'unique raison de le demander avant la première note. Un test sur
 * l'écran de question ne le prouve pas — il montre que la question est posée,
 * pas que la réponse arrive jusqu'à la base.
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

const votesEnvoyes = () => appels.filter((a) => a.url === '/api/dixmais/vote');

describe('useDixMais — enchaînement du départ', () => {
  it('passe par l’étape de profil quand on ne le connaît pas', async () => {
    const { result } = renderHook(() => useDixMais());
    await waitFor(() => expect(result.current.profileChecked).toBe(true));

    act(() => result.current.start());

    expect(result.current.phase).toBe('profile');
    // Aucun profil n'est encore chargé : la partie attend la réponse.
    expect(appels.some((a) => a.url.startsWith('/api/dixmais/statements'))).toBe(false);
  });

  it('entre directement en partie quand le profil est déjà connu', async () => {
    localStorage.setItem(
      'rog_session',
      JSON.stringify({ profile: { sex: 'homme', age: '27+' }, seenDuels: [], streak: 3, duelCount: 12 }),
    );

    const { result } = renderHook(() => useDixMais());
    await waitFor(() => expect(result.current.playerProfile).toEqual({ sex: 'homme', age: '27+' }));

    await act(async () => { result.current.start(); });
    await waitFor(() => expect(result.current.phase).toBe('reveal'));
  });
});

describe('useDixMais — le profil accompagne le vote', () => {
  it('étiquette le tout premier vote de la partie', async () => {
    const { result } = renderHook(() => useDixMais());
    await waitFor(() => expect(result.current.profileChecked).toBe(true));

    act(() => result.current.start());
    await act(async () => { result.current.submitProfile({ sex: 'femme', age: '19-22' }); });
    await waitFor(() => expect(result.current.phase).toBe('reveal'));

    act(() => result.current.setDraft(7));
    act(() => result.current.commit());

    expect(votesEnvoyes()).toHaveLength(1);
    expect(votesEnvoyes()[0].body).toMatchObject({
      statement_id: 'stmt-0',
      previous_score: 10,
      new_score: 7,
      sex: 'femme',
      age: '19-22',
    });
  });

  // Le profil est partagé avec les autres jeux : celui qui a déjà joué au
  // Pire des deux n'est pas resollicité, et ses votes sont étiquetés dès le
  // premier.
  it('reprend le profil enregistré par un autre jeu du site', async () => {
    localStorage.setItem(
      'rog_session',
      JSON.stringify({ profile: { sex: 'homme', age: '27+' }, seenDuels: [], streak: 3, duelCount: 12 }),
    );

    const { result } = renderHook(() => useDixMais());
    await waitFor(() => expect(result.current.profileChecked).toBe(true));

    await act(async () => { result.current.start(); });
    await waitFor(() => expect(result.current.phase).toBe('reveal'));
    act(() => result.current.setDraft(4));
    act(() => result.current.commit());

    expect(votesEnvoyes()[0].body).toMatchObject({ sex: 'homme', age: '27+' });
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

  // Le profil vit en mémoire autant qu'en stockage : un navigateur qui refuse
  // d'écrire ne doit pas coûter l'étiquetage de la partie en cours.
  it('étiquette quand même les votes si le stockage refuse d’écrire', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('stockage indisponible');
    });

    const { result } = renderHook(() => useDixMais());
    await waitFor(() => expect(result.current.profileChecked).toBe(true));

    act(() => result.current.start());
    await act(async () => { result.current.submitProfile({ sex: 'autre', age: '16-18' }); });
    await waitFor(() => expect(result.current.phase).toBe('reveal'));
    act(() => result.current.setDraft(5));
    act(() => result.current.commit());

    expect(votesEnvoyes()[0].body).toMatchObject({ sex: 'autre', age: '16-18' });
    setItem.mockRestore();
  });
});
