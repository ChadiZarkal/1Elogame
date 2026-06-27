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
  categories?: string[]; // multi-select: list of selected category IDs
}

export const DEFAULT_GAME_MODE: GameModeSelection = {
  mode: 'thematique',
  category: 'sexe',
  categories: ['sexe'],
};

/** Reads the admin-configured default category from localStorage (client-side only). */
export function getDefaultGameMode(): GameModeSelection {
  if (typeof window === 'undefined') return DEFAULT_GAME_MODE;
  const saved = localStorage.getItem('default_game_categories');
  if (saved) {
    try {
      const cats = JSON.parse(saved) as string[];
      if (cats.length === 1) return { mode: 'thematique', category: cats[0], categories: cats };
      if (cats.length > 1) return { mode: 'thematique', category: cats[0], categories: cats };
    } catch { /* ignore */ }
  }
  const savedSingle = localStorage.getItem('default_game_category');
  if (savedSingle) return { mode: 'thematique', category: savedSingle, categories: [savedSingle] };
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
  categories: string[];      // selected category IDs
}

export interface PartyStats {
  results: DuelHistoryEntry[];
  bestStreak: number;
  correctGuesses: number;
  startedAt: number;
  endedAt: number;
  categories: string[];
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
  duelShownAt: 0,
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
      if (gameMode.mode === 'thematique' && gameMode.categories && gameMode.categories.length > 0) {
        // Pick a random category from selected ones for variety
        const cats = gameMode.categories;
        const picked = cats[Math.floor(Math.random() * cats.length)];
        params.set('category', picked);
      } else if (gameMode.mode === 'thematique' && gameMode.category) {
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
  
  // Show the next duel (called after viewing result)
  showNextDuel: () => {
    const { nextDuel, currentDuel, lastResult, duelHistory, partyActive, partyConfig, duelCount } = get();
    
    // ── Party mode: check if we've reached the target ──
    if (partyActive && partyConfig && duelCount >= partyConfig.size) {
      const state = get();
      const finalBestStreak = Math.max(state.partyBestStreak, state.streak);
      let finalCorrect = 0;
      for (const entry of state.partyResults) {
        if (!entry.result.isOptimistic && entry.result.winner.percentage >= 50) finalCorrect++;
      }
      set({
        partyComplete: true,
        partyActive: false,
        partyStats: {
          results: state.partyResults,
          bestStreak: finalBestStreak,
          correctGuesses: Math.max(state.partyCorrectGuesses, finalCorrect),
          startedAt: state.partyStartedAt,
          endedAt: Date.now(),
          categories: partyConfig.categories,
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

  startParty: (config: PartyConfig) => {
    const gameModeSelection: GameModeSelection = {
      mode: 'thematique',
      category: config.categories[0] || null,
      categories: config.categories,
    };
    
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
    
    get().fetchNextDuel();
  },
  
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
    
    get().fetchNextDuel();
  },
  
  endParty: () => {
    const state = get();
    if (!state.partyConfig) return;
    
    const finalBestStreak = Math.max(state.partyBestStreak, state.streak);
    let finalCorrect = 0;
    for (const entry of state.partyResults) {
      if (!entry.result.isOptimistic && entry.result.winner.percentage >= 50) finalCorrect++;
    }
    
    set({
      partyComplete: true,
      partyActive: false,
      partyStats: {
        results: state.partyResults,
        bestStreak: finalBestStreak,
        correctGuesses: Math.max(state.partyCorrectGuesses, finalCorrect),
        startedAt: state.partyStartedAt,
        endedAt: Date.now(),
        categories: state.partyConfig.categories,
        size: state.partyConfig.size,
      },
    });
  },
}));
