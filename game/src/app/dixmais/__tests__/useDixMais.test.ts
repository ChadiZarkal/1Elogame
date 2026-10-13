import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ENREGISTRER_VOTES, useDixMais } from '../useDixMais';

function statementsFactices(nombre = 5) {
  return Array.from({ length: nombre }, (_, i) => ({
    id: `stmt-${i}`,
    text: `Red flag ${i + 1}`,
    type: 'negative',
    category: 'caractere',
    is_active: true,
    is_approved: true,
    votes_count: 30,
    total_delta: -60,
    elimination_count: 6,
    created_at: '2026-09-16T00:00:00.000Z',
  }));
}

let appels: { url: string; body: Record<string, unknown> | null }[] = [];

beforeEach(() => {
  appels = [];
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const adresse = String(url);
      appels.push({ url: adresse, body: init?.body ? JSON.parse(String(init.body)) : null });
      if (adresse.startsWith('/api/dixmais/statements')) {
        return Promise.resolve({ ok: true, json: async () => ({ data: statementsFactices() }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function enPartie() {
  localStorage.setItem(
    'rog_session',
    JSON.stringify({ profile: { sex: 'femme', age: '19-22' }, seenDuels: [], streak: 0, duelCount: 0 }),
  );
  const hook = renderHook(() => useDixMais());
  await waitFor(() => expect(hook.result.current.profileChecked).toBe(true));
  await act(async () => { hook.result.current.start(); });
  await waitFor(() => expect(hook.result.current.phase).toBe('reveal'));
  return hook;
}

/** Pose une note et laisse passer l'animation de validation. */
function noter(result: { current: ReturnType<typeof useDixMais> }, note: number) {
  act(() => result.current.setDraft(note));
  act(() => result.current.commit());
  act(() => { vi.advanceTimersByTime(700); });
}

describe('useDixMais — enchaînement du départ', () => {
  it('passe par l’étape de profil quand on ne le connaît pas', async () => {
    const { result } = renderHook(() => useDixMais());
    await waitFor(() => expect(result.current.profileChecked).toBe(true));

    act(() => result.current.start());

    expect(result.current.phase).toBe('profile');
    expect(appels.some((a) => a.url.startsWith('/api/dixmais/statements'))).toBe(false);
  });

  it('entre directement en partie quand le profil est déjà connu', async () => {
    const { result } = await enPartie();
    expect(result.current.round?.statements).toHaveLength(5);
  });

  it('demande deux green flags par profil', async () => {
    await enPartie();
    const requete = appels.find((a) => a.url.startsWith('/api/dixmais/statements'));
    expect(requete?.url).toContain('verts=2');
    expect(requete?.url).not.toContain('types=negative');
  });
});

describe('useDixMais — chaque révélation se note seule', () => {
  it('repart de 10 à chaque révélation', async () => {
    const { result } = await enPartie();
    vi.useFakeTimers();

    noter(result, 3);
    expect(result.current.round?.index).toBe(1);
    expect(result.current.draft).toBe(10);
    expect(result.current.runningAverage).toBe(3);

    noter(result, 7);
    expect(result.current.draft).toBe(10);
    expect(result.current.runningAverage).toBe(5);
  });

  it('donne au profil la moyenne des cinq notes, et seulement au cinquième', async () => {
    const { result } = await enPartie();
    vi.useFakeTimers();

    [0, 6, 8, 10, 6].forEach((n, i) => {
      noter(result, n);
      // Un 0 n'arrête plus la manche.
      if (i < 4) expect(result.current.phase).toBe('reveal');
    });

    expect(result.current.phase).toBe('verdict');
    const juge = result.current.history[0];
    expect(juge.notes).toEqual([0, 6, 8, 10, 6]);
    expect(juge.moyenne).toBe(6);
    // Les phrases factices coûtent 2 points aux autres : ils mettent 8.
    expect(juge.communaute).toEqual([8, 8, 8, 8, 8]);
    expect(juge.moyenneCommunaute).toBe(8);
    expect(juge.fin.key).toBeTruthy();
  });

  it('accepte une note au-delà de 10, jusqu’à 15', async () => {
    const { result } = await enPartie();
    vi.useFakeTimers();

    act(() => result.current.setDraft(14));
    expect(result.current.draft).toBe(14);
    act(() => result.current.setDraft(22));
    expect(result.current.draft).toBe(15);

    [15, 14, 10, 12, 9].forEach((n) => noter(result, n));
    expect(result.current.history[0].moyenne).toBe(12);
  });

  it('teinte le fond de la moyenne au verdict', async () => {
    const { result } = await enPartie();
    vi.useFakeTimers();
    [2, 2, 2, 2, 2].forEach((n) => noter(result, n));
    expect(result.current.ambientScore).toBe(2);
  });
});

describe('useDixMais — la base n’est pas touchée', () => {
  it('n’envoie aucun vote tant que la base n’est pas prête', async () => {
    expect(ENREGISTRER_VOTES).toBe(false);
    const { result } = await enPartie();
    vi.useFakeTimers();
    [4, 5, 6, 7, 8].forEach((n) => noter(result, n));

    expect(appels.filter((a) => a.url === '/api/dixmais/vote')).toHaveLength(0);
  });

  // Le profil est partagé avec les autres jeux : l'enregistrer ne doit pas
  // effacer la session de l'autre jeu.
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
});
