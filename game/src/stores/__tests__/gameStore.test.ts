import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGameStore } from '../gameStore';
import type { Duel, VoteResult } from '@/types/game';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock analytics (fire-and-forget, no need to verify)
vi.mock('@/lib/analytics', () => ({
  trackVote: vi.fn(),
  trackProfile: vi.fn(),
  trackCategoryChange: vi.fn(),
}));

// Helper: mock a successful duel response
function mockDuelResponse(duel: Partial<Duel> = {}) {
  const defaultDuel: Duel = {
    elementA: { id: 'a1', texte: 'Test A', categorie: 'sexe' },
    elementB: { id: 'b1', texte: 'Test B', categorie: 'lifestyle' },
    ...duel,
  };
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: defaultDuel }),
  });
  return defaultDuel;
}

// Helper: mock a vote response
function mockVoteResponse(result: Partial<VoteResult> = {}) {
  const defaultResult: VoteResult = {
    winner: { id: 'a1', percentage: 65, participations: 10, rank: 1, totalElements: 40 },
    loser: { id: 'b1', percentage: 35, participations: 10, rank: 20, totalElements: 40 },
    streak: { matched: true, current: 1 },
    ...result,
  };
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: defaultResult }),
  });
  return defaultResult;
}

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      profile: null,
      hasProfile: false,
      currentDuel: null,
      nextDuel: null,
      isLoadingDuel: false,
      lastResult: null,
      showingResult: false,
      duelHistory: [],
      streak: 0,
      streakEmoji: '',
      duelCount: 0,
      allDuelsExhausted: false,
      error: null,
      gameMode: { mode: 'thematique', category: 'lifestyle' },
    });
    mockFetch.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Profile Management ────────────────────────────────────

  describe('profile management', () => {
    it('should set profile and update state', () => {
      const store = useGameStore.getState();
      store.setProfile({ sex: 'homme', age: '19-22' });

      const state = useGameStore.getState();
      expect(state.hasProfile).toBe(true);
      expect(state.profile).toEqual({ sex: 'homme', age: '19-22' });
      expect(state.streak).toBe(0);
      expect(state.duelCount).toBe(0);
    });

    it('should clear profile and reset all game state', () => {
      const store = useGameStore.getState();
      store.setProfile({ sex: 'femme', age: '23-26' });

      // Set some game state
      useGameStore.setState({ streak: 5, duelCount: 10 });

      store.clearProfile();
      const state = useGameStore.getState();
      expect(state.hasProfile).toBe(false);
      expect(state.profile).toBeNull();
      expect(state.currentDuel).toBeNull();
      expect(state.streak).toBe(0);
      expect(state.duelCount).toBe(0);
    });

    it('should initialize from localStorage session', () => {
      // Simulate a stored session
      localStorage.setItem('rog_session', JSON.stringify({
        profile: { sex: 'homme', age: '27plus' },
        seenDuels: [],
        streak: 3,
        duelCount: 7,
      }));

      const store = useGameStore.getState();
      store.initializeFromStorage();

      const state = useGameStore.getState();
      expect(state.hasProfile).toBe(true);
      expect(state.profile).toEqual({ sex: 'homme', age: '27plus' });
      expect(state.streak).toBe(3);
      expect(state.duelCount).toBe(7);
    });

    it('should handle missing session gracefully', () => {
      const store = useGameStore.getState();
      store.initializeFromStorage();

      const state = useGameStore.getState();
      expect(state.hasProfile).toBe(false);
      expect(state.profile).toBeNull();
    });
  });

  // ─── Duel Fetching ─────────────────────────────────────────

  describe('fetchNextDuel', () => {
    it('should fetch first duel and set as currentDuel', async () => {
      const duel = mockDuelResponse();

      const store = useGameStore.getState();
      await store.fetchNextDuel();

      const state = useGameStore.getState();
      expect(state.currentDuel).toEqual(duel);
      expect(state.isLoadingDuel).toBe(false);
    });

    it('should preload second duel as nextDuel', async () => {
      const duel1 = mockDuelResponse();
      const duel2 = mockDuelResponse({
        elementA: { id: 'a2', texte: 'Test A2', categorie: 'quotidien' },
        elementB: { id: 'b2', texte: 'Test B2', categorie: 'bureau' },
      });

      const store = useGameStore.getState();
      await store.fetchNextDuel(); // Sets currentDuel
      await store.fetchNextDuel(); // Sets nextDuel

      const state = useGameStore.getState();
      expect(state.currentDuel).toEqual(duel1);
      expect(state.nextDuel).toEqual(duel2);
    });

    it('should not fetch when already loading', async () => {
      useGameStore.setState({ isLoadingDuel: true });

      const store = useGameStore.getState();
      await store.fetchNextDuel();

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not fetch when all duels exhausted', async () => {
      useGameStore.setState({ allDuelsExhausted: true });

      const store = useGameStore.getState();
      await store.fetchNextDuel();

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should set allDuelsExhausted on exhaustion response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { code: 'ALL_DUELS_EXHAUSTED', message: 'No more duels' } }),
      });

      const store = useGameStore.getState();
      await store.fetchNextDuel();

      const state = useGameStore.getState();
      expect(state.allDuelsExhausted).toBe(true);
      expect(state.isLoadingDuel).toBe(false);
    });

    it('should set error on fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { code: 'SERVER_ERROR', message: 'Internal error' } }),
      });

      const store = useGameStore.getState();
      await store.fetchNextDuel();

      const state = useGameStore.getState();
      expect(state.error).toBe('Internal error');
      expect(state.isLoadingDuel).toBe(false);
    });

    it('should pass category param for thematique mode', async () => {
      useGameStore.setState({ gameMode: { mode: 'thematique', category: 'sexe' } });
      mockDuelResponse();

      const store = useGameStore.getState();
      await store.fetchNextDuel();

      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain('category=sexe');
    });

    it('should not pass category param for default mode', async () => {
      useGameStore.setState({ gameMode: { mode: 'default', category: null } });
      mockDuelResponse();

      const store = useGameStore.getState();
      await store.fetchNextDuel();

      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).not.toContain('category=');
    });

    it('should handle network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const store = useGameStore.getState();
      await store.fetchNextDuel();

      const state = useGameStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoadingDuel).toBe(false);
    });

    it('should handle AbortError silently', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      mockFetch.mockRejectedValueOnce(abortError);

      const store = useGameStore.getState();
      await store.fetchNextDuel();

      const state = useGameStore.getState();
      expect(state.error).toBeNull();
      expect(state.isLoadingDuel).toBe(false);
    });
  });

  // ─── Vote Submission ───────────────────────────────────────

  describe('submitVote', () => {
    it('should show optimistic result immediately', async () => {
      useGameStore.setState({
        profile: { sex: 'homme', age: '19-22' },
        hasProfile: true,
        currentDuel: {
          elementA: { id: 'a1', texte: 'A', categorie: 'sexe' },
          elementB: { id: 'b1', texte: 'B', categorie: 'lifestyle' },
        },
      });

      // Mock both preload + vote fetch (preload fires first)
      mockDuelResponse();
      mockVoteResponse();

      const store = useGameStore.getState();
      // Don't await — check optimistic state first
      const promise = store.submitVote('a1', 'b1');

      // After sync part, state should show result
      const state = useGameStore.getState();
      expect(state.showingResult).toBe(true);
      expect(state.lastResult?.isOptimistic).toBe(true);

      await promise;
    });

    it('should update with real API data after resolve', async () => {
      useGameStore.setState({
        profile: { sex: 'femme', age: '23-26' },
        hasProfile: true,
        currentDuel: {
          elementA: { id: 'a1', texte: 'A', categorie: 'sexe' },
          elementB: { id: 'b1', texte: 'B', categorie: 'lifestyle' },
        },
      });

      mockDuelResponse(); // preload (fires first via fetchNextDuel)
      const realResult = mockVoteResponse({
        winner: { id: 'a1', percentage: 72, participations: 50, rank: 3, totalElements: 40 },
      });

      const store = useGameStore.getState();
      await store.submitVote('a1', 'b1');

      const state = useGameStore.getState();
      expect(state.lastResult?.winner.percentage).toBe(72);
      expect(state.lastResult?.isOptimistic).toBeUndefined();
    });

    it('should not submit without profile', async () => {
      useGameStore.setState({ profile: null, currentDuel: null });

      const store = useGameStore.getState();
      await store.submitVote('a1', 'b1');

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not submit without current duel', async () => {
      useGameStore.setState({
        profile: { sex: 'homme', age: '19-22' },
        hasProfile: true,
        currentDuel: null,
      });

      const store = useGameStore.getState();
      await store.submitVote('a1', 'b1');

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should increment duelCount', async () => {
      useGameStore.setState({
        profile: { sex: 'homme', age: '19-22' },
        hasProfile: true,
        currentDuel: {
          elementA: { id: 'a1', texte: 'A', categorie: 'sexe' },
          elementB: { id: 'b1', texte: 'B', categorie: 'lifestyle' },
        },
        duelCount: 5,
      });

      mockDuelResponse(); // preload first
      mockVoteResponse();

      const store = useGameStore.getState();
      await store.submitVote('a1', 'b1');

      expect(useGameStore.getState().duelCount).toBe(6);
    });

    it('should keep optimistic result on API error', async () => {
      useGameStore.setState({
        profile: { sex: 'homme', age: '19-22' },
        hasProfile: true,
        currentDuel: {
          elementA: { id: 'a1', texte: 'A', categorie: 'sexe' },
          elementB: { id: 'b1', texte: 'B', categorie: 'lifestyle' },
        },
      });

      mockDuelResponse(); // preload (fires first via fetchNextDuel)
      // Vote fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Server error' } }),
      });

      const store = useGameStore.getState();
      await store.submitVote('a1', 'b1');

      const state = useGameStore.getState();
      // Should still show result (optimistic), no error set
      expect(state.showingResult).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  // ─── Show Next Duel ────────────────────────────────────────

  describe('showNextDuel', () => {
    it('should promote nextDuel to currentDuel', () => {
      const nextDuel: Duel = {
        elementA: { id: 'a2', texte: 'A2', categorie: 'quotidien' },
        elementB: { id: 'b2', texte: 'B2', categorie: 'bureau' },
      };

      useGameStore.setState({
        currentDuel: {
          elementA: { id: 'a1', texte: 'A', categorie: 'sexe' },
          elementB: { id: 'b1', texte: 'B', categorie: 'lifestyle' },
        },
        nextDuel,
        lastResult: {
          winner: { id: 'a1', percentage: 60, participations: 10 },
          loser: { id: 'b1', percentage: 40, participations: 10 },
          streak: { matched: true, current: 1 },
        },
        showingResult: true,
      });

      // Mock the preload fetch triggered by showNextDuel
      mockDuelResponse();

      const store = useGameStore.getState();
      store.showNextDuel();

      const state = useGameStore.getState();
      expect(state.currentDuel).toEqual(nextDuel);
      expect(state.nextDuel).toBeNull();
      expect(state.lastResult).toBeNull();
      expect(state.showingResult).toBe(false);
    });

    it('should push current duel to history', () => {
      const currentDuel: Duel = {
        elementA: { id: 'a1', texte: 'A', categorie: 'sexe' },
        elementB: { id: 'b1', texte: 'B', categorie: 'lifestyle' },
      };
      const lastResult: VoteResult = {
        winner: { id: 'a1', percentage: 60, participations: 10 },
        loser: { id: 'b1', percentage: 40, participations: 10 },
        streak: { matched: true, current: 1 },
      };

      useGameStore.setState({
        currentDuel,
        nextDuel: {
          elementA: { id: 'a2', texte: 'A2', categorie: 'quotidien' },
          elementB: { id: 'b2', texte: 'B2', categorie: 'bureau' },
        },
        lastResult,
        showingResult: true,
        duelHistory: [],
      });

      mockDuelResponse();

      const store = useGameStore.getState();
      store.showNextDuel();

      const state = useGameStore.getState();
      expect(state.duelHistory).toHaveLength(1);
      expect(state.duelHistory[0].duel).toEqual(currentDuel);
      expect(state.duelHistory[0].result).toEqual(lastResult);
    });

    it('should limit history to MAX_HISTORY (10)', () => {
      // Pre-fill with 10 entries
      const history = Array.from({ length: 10 }, (_, i) => ({
        duel: {
          elementA: { id: `a${i}`, texte: `A${i}`, categorie: 'sexe' as const },
          elementB: { id: `b${i}`, texte: `B${i}`, categorie: 'lifestyle' as const },
        },
        result: {
          winner: { id: `a${i}`, percentage: 50, participations: 1 },
          loser: { id: `b${i}`, percentage: 50, participations: 1 },
          streak: { matched: true, current: 1 },
        },
      }));

      useGameStore.setState({
        currentDuel: {
          elementA: { id: 'new-a', texte: 'New A', categorie: 'quotidien' },
          elementB: { id: 'new-b', texte: 'New B', categorie: 'bureau' },
        },
        nextDuel: {
          elementA: { id: 'next-a', texte: 'Next A', categorie: 'sexe' },
          elementB: { id: 'next-b', texte: 'Next B', categorie: 'lifestyle' },
        },
        lastResult: {
          winner: { id: 'new-a', percentage: 50, participations: 1 },
          loser: { id: 'new-b', percentage: 50, participations: 1 },
          streak: { matched: true, current: 1 },
        },
        showingResult: true,
        duelHistory: history,
      });

      mockDuelResponse();

      const store = useGameStore.getState();
      store.showNextDuel();

      const state = useGameStore.getState();
      expect(state.duelHistory).toHaveLength(10);
      // Oldest entry should have been shifted out
      expect(state.duelHistory[0].duel.elementA.id).toBe('a1');
      expect(state.duelHistory[9].duel.elementA.id).toBe('new-a');
    });
  });

  // ─── Game Mode ─────────────────────────────────────────────

  describe('setGameMode', () => {
    it('should update game mode and reset duels', async () => {
      mockDuelResponse();
      mockDuelResponse();

      const store = useGameStore.getState();
      await store.setGameMode({ mode: 'default', category: null });

      const state = useGameStore.getState();
      expect(state.gameMode).toEqual({ mode: 'default', category: null });
    });

    it('should not re-fetch if mode unchanged', async () => {
      useGameStore.setState({ gameMode: { mode: 'thematique', category: 'lifestyle' } });

      const store = useGameStore.getState();
      await store.setGameMode({ mode: 'thematique', category: 'lifestyle' });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should reset allDuelsExhausted when switching mode', async () => {
      useGameStore.setState({ allDuelsExhausted: true });
      mockDuelResponse();
      mockDuelResponse();

      const store = useGameStore.getState();
      await store.setGameMode({ mode: 'default', category: null });

      const state = useGameStore.getState();
      expect(state.allDuelsExhausted).toBe(false);
    });
  });

  // ─── Reset & Error ─────────────────────────────────────────

  describe('resetGame', () => {
    it('should reset all state to defaults', () => {
      useGameStore.setState({
        profile: { sex: 'homme', age: '19-22' },
        hasProfile: true,
        currentDuel: {
          elementA: { id: 'a1', texte: 'A', categorie: 'sexe' },
          elementB: { id: 'b1', texte: 'B', categorie: 'lifestyle' },
        },
        streak: 5,
        duelCount: 10,
        error: 'some error',
      });

      const store = useGameStore.getState();
      store.resetGame();

      const state = useGameStore.getState();
      expect(state.profile).toBeNull();
      expect(state.hasProfile).toBe(false);
      expect(state.currentDuel).toBeNull();
      expect(state.streak).toBe(0);
      expect(state.duelCount).toBe(0);
      expect(state.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      useGameStore.setState({ error: 'test error' });

      const store = useGameStore.getState();
      store.clearError();

      expect(useGameStore.getState().error).toBeNull();
    });
  });

  // ─── Feedback ──────────────────────────────────────────────

  describe('submitFeedback', () => {
    it('should send feedback POST request', async () => {
      useGameStore.setState({
        currentDuel: {
          elementA: { id: 'a1', texte: 'A', categorie: 'sexe' },
          elementB: { id: 'b1', texte: 'B', categorie: 'lifestyle' },
        },
      });

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const store = useGameStore.getState();
      await store.submitFeedback('star');

      expect(mockFetch).toHaveBeenCalledWith('/api/feedback', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          elementAId: 'a1',
          elementBId: 'b1',
          type: 'star',
        }),
      }));
    });

    it('should not submit without current duel', async () => {
      useGameStore.setState({ currentDuel: null });

      const store = useGameStore.getState();
      await store.submitFeedback('thumbs_up');

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should silently ignore errors', async () => {
      useGameStore.setState({
        currentDuel: {
          elementA: { id: 'a1', texte: 'A', categorie: 'sexe' },
          elementB: { id: 'b1', texte: 'B', categorie: 'lifestyle' },
        },
      });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const store = useGameStore.getState();
      // Should not throw
      await expect(store.submitFeedback('thumbs_down')).resolves.toBeUndefined();
    });
  });
});
