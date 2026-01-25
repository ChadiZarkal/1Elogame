'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { DuelInterface } from '@/components/game/DuelInterface';
import { ResultDisplay } from '@/components/game/ResultDisplay';
import { StreakDisplay } from '@/components/game/StreakDisplay';
import { AllDuelsExhausted } from '@/components/game/AllDuelsExhausted';
import { GameModeMenu } from '@/components/game/GameModeMenu';
import { FullPageLoading } from '@/components/ui/Loading';

export default function JouerPage() {
  const router = useRouter();
  
  const {
    hasProfile,
    currentDuel,
    lastResult,
    showingResult,
    streak,
    streakEmoji,
    duelCount,
    allDuelsExhausted,
    isLoadingDuel,
    error,
    gameMode,
    initializeFromStorage,
    fetchNextDuel,
    submitVote,
    submitFeedback,
    showNextDuel,
    resetGame,
    clearError,
    setGameMode,
  } = useGameStore();
  
  // Initialize from storage and fetch first duel
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);
  
  // Redirect if no profile
  useEffect(() => {
    // Small delay to allow storage initialization
    const timer = setTimeout(() => {
      if (!hasProfile) {
        router.push('/jeu');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [hasProfile, router]);
  
  // Fetch first duel when profile is loaded
  useEffect(() => {
    if (hasProfile && !currentDuel && !isLoadingDuel && !allDuelsExhausted) {
      // Charger le premier duel et preload le suivant
      fetchNextDuel().then(() => {
        fetchNextDuel();
      });
    }
  }, [hasProfile, currentDuel, isLoadingDuel, allDuelsExhausted, fetchNextDuel]);
  
  // Handle vote
  const handleVote = useCallback((winnerId: string, loserId: string) => {
    submitVote(winnerId, loserId);
  }, [submitVote]);
  
  // Handle feedback
  const handleStar = useCallback(() => {
    submitFeedback('star');
  }, [submitFeedback]);
  
  const handleThumbsUp = useCallback(() => {
    submitFeedback('thumbs_up');
  }, [submitFeedback]);
  
  const handleThumbsDown = useCallback(() => {
    submitFeedback('thumbs_down');
  }, [submitFeedback]);
  
  // Handle next
  const handleNext = useCallback(() => {
    showNextDuel();
  }, [showNextDuel]);
  
  // Handle reset
  const handleReset = useCallback(() => {
    resetGame();
    router.push('/jeu');
  }, [resetGame, router]);
  
  // Show loading state
  if (!hasProfile) {
    return <FullPageLoading text="Chargement..." />;
  }
  
  // Show all duels exhausted screen
  if (allDuelsExhausted) {
    return <AllDuelsExhausted duelCount={duelCount} onReset={handleReset} />;
  }
  
  // Show loading while fetching first duel
  if (isLoadingDuel && !currentDuel) {
    return <FullPageLoading text="Préparation du duel..." />;
  }
  
  // Show error state
  if (error && !currentDuel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0D0D0D] p-6">
        <div className="text-center space-y-4">
          <span className="text-6xl">😕</span>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Oups !</h1>
          <p className="text-[#A3A3A3]">{error}</p>
          <button
            onClick={() => { clearError(); fetchNextDuel(); }}
            className="px-6 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#EF4444] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  
  // No duel yet
  if (!currentDuel) {
    return <FullPageLoading text="Chargement du duel..." />;
  }
  
  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Streak display */}
      {!showingResult && (
        <StreakDisplay 
          streak={streak} 
          streakEmoji={streakEmoji} 
          duelCount={duelCount} 
        />
      )}
      
      {/* Main game area */}
      {showingResult && lastResult ? (
        <ResultDisplay
          duel={currentDuel}
          result={lastResult}
          streak={streak}
          streakEmoji={streakEmoji}
          onNext={handleNext}
          onStar={handleStar}
          onThumbsUp={handleThumbsUp}
          onThumbsDown={handleThumbsDown}
        />
      ) : (
        <DuelInterface
          elementA={currentDuel.elementA}
          elementB={currentDuel.elementB}
          onVote={handleVote}
          disabled={showingResult || isLoadingDuel}
        />
      )}
      
      {/* Game Mode Menu - remplace le bouton refresh */}
      <div className="absolute top-4 right-4 z-20">
        <GameModeMenu
          currentSelection={gameMode}
          onSelectionChange={setGameMode}
        />
      </div>
    </div>
  );
}
