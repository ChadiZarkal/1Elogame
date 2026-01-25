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
} from '@/lib/session';

interface GameState {
  // Profile state
  profile: PlayerProfile | null;
  hasProfile: boolean;
  
  // Game state
  currentDuel: Duel | null;
  nextDuel: Duel | null;  // Preloaded for instant transition
  isLoadingDuel: boolean;
  
  // Result state
  lastResult: VoteResult | null;
  showingResult: boolean;
  
  // Streak
  streak: number;
  streakEmoji: string;
  
  // Stats
  duelCount: number;
  allDuelsExhausted: boolean;
  
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
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  profile: null,
  hasProfile: false,
  currentDuel: null,
  nextDuel: null,
  isLoadingDuel: false,
  lastResult: null,
  showingResult: false,
  streak: 0,
  streakEmoji: '',
  duelCount: 0,
  allDuelsExhausted: false,
  error: null,
  
  // Initialize from LocalStorage
  initializeFromStorage: () => {
    const session = getSession();
    if (session) {
      set({
        profile: session.profile,
        hasProfile: true,
        streak: session.streak,
        streakEmoji: getStreakEmoji(session.streak),
        duelCount: session.duelCount,
      });
    }
  },
  
  // Set profile and initialize session
  setProfile: (profile: PlayerProfile) => {
    initSession(profile);
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
    set({
      profile: null,
      hasProfile: false,
      currentDuel: null,
      nextDuel: null,
      lastResult: null,
      showingResult: false,
      streak: 0,
      streakEmoji: '',
      duelCount: 0,
      allDuelsExhausted: false,
    });
  },
  
  // Fetch the next duel from API
  fetchNextDuel: async () => {
    const { isLoadingDuel, allDuelsExhausted } = get();
    
    if (isLoadingDuel || allDuelsExhausted) return;
    
    set({ isLoadingDuel: true, error: null });
    
    try {
      const seenDuels = getSeenDuelsString();
      const params = seenDuels ? `?seenDuels=${encodeURIComponent(seenDuels)}` : '';
      
      const response = await fetch(`/api/duel${params}`);
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
        // First duel - set as current
        set({ currentDuel: data.data, isLoadingDuel: false });
        // Immediately start preloading next
        get().fetchNextDuel();
      } else {
        // Preload as next duel
        set({ nextDuel: data.data, isLoadingDuel: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
        isLoadingDuel: false,
      });
    }
  },
  
  // Submit a vote
  submitVote: async (winnerId: string, loserId: string) => {
    const { profile, currentDuel } = get();
    
    if (!profile || !currentDuel) return;
    
    set({ error: null });
    
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
        throw new Error(data.error?.message || 'Failed to submit vote');
      }
      
      // Mark duel as seen
      markDuelAsSeen(currentDuel.elementA.id, currentDuel.elementB.id);
      
      // Update streak
      const newStreak = updateStreak(data.data.streak.matched);
      
      set({
        lastResult: data.data,
        showingResult: true,
        streak: newStreak,
        streakEmoji: getStreakEmoji(newStreak),
        duelCount: get().duelCount + 1,
      });
      
      // Preload next duel while showing result
      if (!get().nextDuel) {
        get().fetchNextDuel();
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
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
    const { nextDuel } = get();
    
    if (nextDuel) {
      set({
        currentDuel: nextDuel,
        nextDuel: null,
        lastResult: null,
        showingResult: false,
      });
      // Start preloading the next one
      get().fetchNextDuel();
    } else {
      set({
        lastResult: null,
        showingResult: false,
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
      currentDuel: null,
      nextDuel: null,
      lastResult: null,
      showingResult: false,
      streak: 0,
      streakEmoji: '',
      duelCount: 0,
      allDuelsExhausted: false,
      error: null,
    });
  },
  
  // Clear error
  clearError: () => set({ error: null }),
}));
