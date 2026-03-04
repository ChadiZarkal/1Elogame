'use client';

import { create } from 'zustand';
import { Duel, VoteResult, PlayerProfile } from '@/types/game';
import { 
  getSession, 
  initSession, 
  clearSession, 
  updateStreak,
  markDuelAsSeen,
  getSeenDuelsString,
  getStreakEmoji,
  getRecentElementIdsString,
  getElementAppearancesString,
} from '@/lib/session';
import { trackVote, trackProfile, trackCategoryChange } from '@/lib/analytics';

// Types pour le mode de jeu
export type GameMode = 'default' | 'thematique';

export interface GameModeSelection {
  mode: GameMode;
  category: string | null; // null = toutes catégories (default mode)
}

export const DEFAULT_GAME_MODE: GameModeSelection = {
  mode: 'thematique',
  category: 'quotidien',
};

/** Reads the admin-configured default category from localStorage (client-side only). */
export function getDefaultGameMode(): GameModeSelection {
  if (typeof window === 'undefined') return DEFAULT_GAME_MODE;
  const saved = localStorage.getItem('default_game_category');
  if (saved) return { mode: 'thematique', category: saved };
  return DEFAULT_GAME_MODE;
}

// History entry for scroll-back
export interface DuelHistoryEntry {
  duel: Duel;
  result: VoteResult;
  /** Time in ms the user took to pick (from duel shown to tap) */
  reactionTimeMs?: number;
}

const MAX_HISTORY = 10;

// ── Party Mode ──────────────────────────────────────────────────────────

export type PartySize = 10 | 15 | 20;

export interface PartyConfig {
  size: number;              // total duels target (grows via continueParty)
  originalSize: PartySize;   // user's original selection (10|15|20)
  category: string | null;   // null = classique (toutes)
}

export interface PartyStats {
  /** All duels played in this party */
  results: DuelHistoryEntry[];
  /** Best streak reached during this party */
  bestStreak: number;
  /** Total correct guesses (user pick matched majority) */
  correctGuesses: number;
  /** Party start timestamp */
  startedAt: number;
  /** Party end timestamp */
  endedAt: number;
  /** Category played */
  category: string | null;
  /** Party size (may have grown via continue) */
  size: number;
}

/** Shared initial state for reset operations. */
const INITIAL_GAME_STATE = {
  currentDuel: null as Duel | null,
  nextDuel: null as Duel | null,
  lastResult: null as VoteResult | null,
  showingResult: false,
  duelHistory: [] as DuelHistoryEntry[],
  streak: 0,
  streakEmoji: '',
  duelCount: 0,
  allDuelsExhausted: false,
};

const INITIAL_PARTY_STATE = {
  partyConfig: null as PartyConfig | null,
  partyActive: false,
  partyResults: [] as DuelHistoryEntry[],
  partyBestStreak: 0,
  partyCorrectGuesses: 0,
  partyStartedAt: 0,
  partyComplete: false,
  partyStats: null as PartyStats | null,
  duelShownAt: 0, // timestamp when current duel was shown (for reaction time)
};

interface GameState {
  // Profile state
  profile: PlayerProfile | null;
  hasProfile: boolean;
  
  // Game state
  currentDuel: Duel | null;
  nextDuel: Duel | null;  // Preloaded for instant transition
  isLoadingDuel: boolean;
  
  // Game mode state
  gameMode: GameModeSelection;
  
  // Result state
  lastResult: VoteResult | null;
  showingResult: boolean;
  
  // History for scroll-back
  duelHistory: DuelHistoryEntry[];
  
  // Streak
  streak: number;
  streakEmoji: string;
  
  // Stats
  duelCount: number;
  allDuelsExhausted: boolean;
  
  // ── Party Mode ──
  partyConfig: PartyConfig | null;
  partyActive: boolean;
  partyResults: DuelHistoryEntry[];
  partyBestStreak: number;
  partyCorrectGuesses: number;
  partyStartedAt: number;
  partyComplete: boolean;
  partyStats: PartyStats | null;
  duelShownAt: number;
  
  // Errors
  error: string | null;
  
  // Actions
  initializeFromStorage: () => void;
  setProfile: (profile: PlayerProfile) => void;
  clearProfile: () => void;
  
  fetchNextDuel: () => Promise<void>;
  submitVote: (winnerId: string, loserId: string) => Promise<void>;
  submitFeedback: (type: 'star' | 'thumbs_up' | 'thumbs_down') => Promise<void>;
  
  showNextDuel: () => void;
  resetGame: () => void;
  clearError: () => void;
  
  // Game mode actions
  setGameMode: (selection: GameModeSelection) => Promise<void>;
  
  // ── Party Mode Actions ──
  startParty: (config: PartyConfig) => void;
  continueParty: (extraSize: number) => void;
  endParty: () => void;
}

// AbortController for in-flight duel fetch requests
let fetchAbortController: AbortController | null = null;

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
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
  gameMode: DEFAULT_GAME_MODE,
  // Party mode
  ...INITIAL_PARTY_STATE,
  
  // Initialize from LocalStorage
  initializeFromStorage: () => {
    const session = getSession();
    // Apply admin-configured default category
    const defaultMode = getDefaultGameMode();
    const updates: Partial<GameState> = { gameMode: defaultMode };
    if (session) {
      Object.assign(updates, {
        profile: session.profile,
        hasProfile: true,
        streak: session.streak,
        streakEmoji: getStreakEmoji(session.streak),
        duelCount: 0,
      });
    }
    set(updates);
  },
  
  // Set profile and initialize session
  setProfile: (profile: PlayerProfile) => {
    initSession(profile);
    trackProfile(profile.sex, profile.age);
    set({
      profile,
      hasProfile: true,
      streak: 0,
      streakEmoji: '',
      duelCount: 0,
    });
  },
  
  // Clear profile and session
  clearProfile: () => {
    clearSession();
    set({ profile: null, hasProfile: false, ...INITIAL_GAME_STATE });
  },
  
  // Fetch the next duel from API
  fetchNextDuel: async () => {
    const { isLoadingDuel, allDuelsExhausted, gameMode } = get();
    
    if (isLoadingDuel || allDuelsExhausted) return;
    
    set({ isLoadingDuel: true, error: null });
    
    // Cancel any in-flight fetch
    fetchAbortController?.abort();
    fetchAbortController = new AbortController();
    const { signal } = fetchAbortController;
    
    try {
      const seenDuels = getSeenDuelsString();
      const recentElements = getRecentElementIdsString();
      const appearances = getElementAppearancesString();
      
      // Construire les paramètres avec le mode de jeu
      const params = new URLSearchParams();
      if (seenDuels) {
        params.set('seenDuels', seenDuels);
      }
      if (recentElements) {
        params.set('recentElements', recentElements);
      }
      if (appearances) {
        params.set('appearances', appearances);
      }
      if (gameMode.mode === 'thematique' && gameMode.category) {
        params.set('category', gameMode.category);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/api/duel?${queryString}` : '/api/duel';
      
      const response = await fetch(url, { signal });
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error?.code === 'ALL_DUELS_EXHAUSTED') {
          set({ allDuelsExhausted: true, isLoadingDuel: false });
          return;
        }
        throw new Error(data.error?.message || 'Failed to fetch duel');
      }
      
      const { currentDuel } = get();
      
      if (!currentDuel) {
        // First duel - set as current (start reaction timer)
        set({ currentDuel: data.data, isLoadingDuel: false, duelShownAt: Date.now() });
      } else {
        // Preload as next duel
        set({ nextDuel: data.data, isLoadingDuel: false });
      }
    } catch (error) {
      // Ignore abort errors — they're expected during mode switches
      if (error instanceof DOMException && error.name === 'AbortError') {
        set({ isLoadingDuel: false });
        return;
      }
      set({
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
        isLoadingDuel: false,
      });
    }
  },
  
  // Submit a vote — OPTIMISTIC UI: show instant result, refine with API data
  submitVote: async (winnerId: string, loserId: string) => {
    const { profile, currentDuel, duelShownAt } = get();
    
    if (!profile || !currentDuel) return;
    if (get().showingResult) return; // double-tap guard
    
    // Capture reaction time
    const reactionTimeMs = duelShownAt > 0 ? Date.now() - duelShownAt : undefined;
    
    set({ error: null });
    
    // Mark duel as seen IMMEDIATELY (no need to wait)
    markDuelAsSeen(currentDuel.elementA.id, currentDuel.elementB.id);
    
    // OPTIMISTIC RESULT: show instant feedback — neutral state (no percentages yet)
    const optimisticResult = {
      winner: {
        id: winnerId,
        percentage: 50, // Neutral — will be updated by real API data
        participations: 0,
        rank: 0,
        totalElements: 0,
      },
      loser: {
        id: loserId,
        percentage: 50,
        participations: 0,
        rank: 0,
        totalElements: 0,
      },
      streak: {
        matched: true,
        current: 0,
      },
      isOptimistic: true, // Signals ResultDisplay to show neutral/loading state
    };
    
    // Track vote in analytics
    trackVote(get().gameMode.category);
    
    // Show result INSTANTLY — don't wait for API
    // NOTE: Do NOT call updateStreak here — wait for API to confirm match
    // This prevents the streak from incrementing by 2 (once optimistic, once real)
    const newDuelCount = get().duelCount + 1;
    set({
      lastResult: optimisticResult,
      showingResult: true,
      duelCount: newDuelCount,
    });
    
    // ── Party tracking: store the duel result immediately ──
    const { partyActive, partyConfig } = get();
    if (partyActive && currentDuel) {
      const entry: DuelHistoryEntry = { duel: currentDuel, result: optimisticResult, reactionTimeMs };
      set(state => ({
        partyResults: [...state.partyResults, entry],
      }));
    }
    
    // Preload next duel in parallel with vote submission
    // In party mode, only preload if we haven't reached the limit
    const shouldPreload = partyActive && partyConfig
      ? newDuelCount < partyConfig.size
      : true;
    if (!get().nextDuel && shouldPreload) {
      get().fetchNextDuel();
    }
    
    // Fire API call in background — update result when it arrives
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId,
          loserId,
          sexe: profile.sex,
          age: profile.age,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.warn('Vote API error:', data.error?.message);
        return; // Keep optimistic result visible
      }
      
      // Refine with real data (streak correctness, percentages, ranks)
      const realStreak = updateStreak(data.data.streak.matched);
      
      set({
        lastResult: data.data,
        streak: realStreak,
        streakEmoji: getStreakEmoji(realStreak),
      });
      
      // ── Party: update with real data ──
      if (get().partyActive) {
        const correct = data.data.winner.percentage >= 50;
        set(state => {
          // Update the last party result with real data
          const updatedResults = [...state.partyResults];
          if (updatedResults.length > 0) {
            updatedResults[updatedResults.length - 1] = {
              ...updatedResults[updatedResults.length - 1],
              result: data.data,
            };
          }
          return {
            partyResults: updatedResults,
            partyBestStreak: Math.max(state.partyBestStreak, realStreak),
            partyCorrectGuesses: state.partyCorrectGuesses + (correct ? 1 : 0),
          };
        });
      }
    } catch (error) {
      // Keep optimistic result — don't disrupt UX for network errors 
      console.warn('Vote submission error:', error instanceof Error ? error.message : error);
    }
  },
  
  // Submit feedback (star or thumbs)
  submitFeedback: async (type: 'star' | 'thumbs_up' | 'thumbs_down') => {
    const { currentDuel } = get();
    
    if (!currentDuel) return;
    
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elementAId: currentDuel.elementA.id,
          elementBId: currentDuel.elementB.id,
          type,
        }),
      });
      // Fire and forget - don't wait for response
    } catch {
      // Silently ignore feedback errors
    }
  },
  
  // Show the next duel (called after viewing result)
  showNextDuel: () => {
    const { nextDuel, currentDuel, lastResult, duelHistory, partyActive, partyConfig, duelCount } = get();
    
    // ── Party mode: check if we've reached the target ──
    if (partyActive && partyConfig && duelCount >= partyConfig.size) {
      // Party complete! Build final stats
      const state = get();
      set({
        partyComplete: true,
        partyActive: false,
        partyStats: {
          results: state.partyResults,
          bestStreak: state.partyBestStreak,
          correctGuesses: state.partyCorrectGuesses,
          startedAt: state.partyStartedAt,
          endedAt: Date.now(),
          category: partyConfig.category,
          size: partyConfig.size,
        },
      });
      return;
    }
    
    // Push current duel+result to history (keep last MAX_HISTORY)
    if (currentDuel && lastResult) {
      const newHistory = [...duelHistory, { duel: currentDuel, result: lastResult }];
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      set({ duelHistory: newHistory });
    }
    
    if (nextDuel) {
      set({
        currentDuel: nextDuel,
        nextDuel: null,
        lastResult: null,
        showingResult: false,
        duelShownAt: Date.now(),
      });
      // Start preloading the next one (if party allows)
      const newCount = get().duelCount;
      if (!partyActive || !partyConfig || newCount < partyConfig.size) {
        get().fetchNextDuel();
      }
    } else {
      set({
        lastResult: null,
        showingResult: false,
        duelShownAt: Date.now(),
      });
      // Fetch new duel
      get().fetchNextDuel();
    }
  },
  
  // Reset the game completely
  resetGame: () => {
    clearSession();
    set({
      profile: null,
      hasProfile: false,
      ...INITIAL_GAME_STATE,
      ...INITIAL_PARTY_STATE,
      error: null,
      gameMode: DEFAULT_GAME_MODE,
    });
  },
  
  // Clear error
  clearError: () => set({ error: null }),
  
  // Set game mode and reload duels
  setGameMode: async (selection: GameModeSelection) => {
    const { gameMode } = get();

    if (gameMode.mode === selection.mode && gameMode.category === selection.category) return;

    fetchAbortController?.abort();
    fetchAbortController = null;

    set({
      gameMode: selection,
      currentDuel: null,
      nextDuel: null,
      allDuelsExhausted: false,
      isLoadingDuel: false,
    });

    if (selection.category) trackCategoryChange(selection.category);

    await get().fetchNextDuel();
  },
  
  // ── Party Mode Actions ──────────────────────────────────────────────
  
  /** Start a new party with the given config. */
  startParty: (config: PartyConfig) => {
    // Set game mode to match party category
    const gameModeSelection: GameModeSelection = config.category
      ? { mode: 'thematique', category: config.category }
      : { mode: 'default', category: null };
    
    set({
      ...INITIAL_GAME_STATE,
      ...INITIAL_PARTY_STATE,
      gameMode: gameModeSelection,
      partyConfig: config,
      partyActive: true,
      partyStartedAt: Date.now(),
      partyComplete: false,
      partyStats: null,
    });
    
    // Fetch first duel
    get().fetchNextDuel();
  },
  
  /** Continue the current party with N more duels. */
  continueParty: (extraSize: number) => {
    const { partyConfig } = get();
    if (!partyConfig) return;
    
    const newSize = partyConfig.size + extraSize;
    
    set({
      partyConfig: { ...partyConfig, size: newSize },
      partyActive: true,
      partyComplete: false,
      partyStats: null,
      showingResult: false,
      lastResult: null,
      currentDuel: null,
      nextDuel: null,
    });
    
    // Fetch next duel
    get().fetchNextDuel();
  },
  
  /** End party and compute final stats. */
  endParty: () => {
    const state = get();
    if (!state.partyConfig) return;
    
    set({
      partyComplete: true,
      partyActive: false,
      partyStats: {
        results: state.partyResults,
        bestStreak: state.partyBestStreak,
        correctGuesses: state.partyCorrectGuesses,
        startedAt: state.partyStartedAt,
        endedAt: Date.now(),
        category: state.partyConfig.category,
        size: state.partyConfig.size,
      },
    });
  },
}));
