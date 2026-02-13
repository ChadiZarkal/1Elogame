'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { DuelInterface } from '@/components/game/DuelInterface';
import { ResultDisplay } from '@/components/game/ResultDisplay';
import { StreakDisplay } from '@/components/game/StreakDisplay';
import { AllDuelsExhausted } from '@/components/game/AllDuelsExhausted';
import { GameModeMenu } from '@/components/game/GameModeMenu';
import { CompactResult } from '@/components/game/CompactResult';
import { FullPageLoading } from '@/components/ui/Loading';

export default function JouerPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  
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
    duelHistory,
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
      fetchNextDuel().then(() => {
        fetchNextDuel();
      });
    }
  }, [hasProfile, currentDuel, isLoadingDuel, allDuelsExhausted, fetchNextDuel]);
  
  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: duelHistory.length > 0 ? 'smooth' : 'instant',
      });
    }
  }, [duelHistory.length, showingResult, currentDuel]);
  
  const handleVote = useCallback((winnerId: string, loserId: string) => {
    submitVote(winnerId, loserId);
  }, [submitVote]);
  
  const handleStar = useCallback(() => submitFeedback('star'), [submitFeedback]);
  const handleThumbsUp = useCallback(() => submitFeedback('thumbs_up'), [submitFeedback]);
  const handleThumbsDown = useCallback(() => submitFeedback('thumbs_down'), [submitFeedback]);
  const handleNext = useCallback(() => showNextDuel(), [showNextDuel]);
  const handleReset = useCallback(() => { resetGame(); router.push('/jeu'); }, [resetGame, router]);
  
  if (!hasProfile) {
    return <FullPageLoading text="Chargement..." />;
  }
  
  if (allDuelsExhausted) {
    return <AllDuelsExhausted duelCount={duelCount} onReset={handleReset} />;
  }
  
  if (isLoadingDuel && !currentDuel) {
    return <FullPageLoading text="Préparation du duel..." />;
  }
  
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
  
  if (!currentDuel) {
    return <FullPageLoading text="Chargement du duel..." />;
  }
  
  return (
    <div ref={scrollRef} className="h-screen w-screen overflow-y-auto relative bg-[#0D0D0D]">
      {/* History: past duel results */}
      {duelHistory.length > 0 && (
        <div className="pt-4 pb-2">
          {/* Scroll-up hint */}
          <div className="text-center text-[#555] text-xs mb-3 flex items-center justify-center gap-2">
            <span className="inline-block w-8 h-px bg-[#333]" />
            <span>{duelHistory.length} duel{duelHistory.length > 1 ? 's' : ''} précédent{duelHistory.length > 1 ? 's' : ''}</span>
            <span className="inline-block w-8 h-px bg-[#333]" />
          </div>
          {duelHistory.map((entry, i) => (
            <CompactResult
              key={`${entry.duel.elementA.id}-${entry.duel.elementB.id}-${i}`}
              duel={entry.duel}
              result={entry.result}
              index={i}
            />
          ))}
        </div>
      )}
      
      {/* Current active duel/result - takes full screen height */}
      <div className="h-screen w-full relative flex flex-col">
        {/* Streak display */}
        {!showingResult && (
          <StreakDisplay 
            streak={streak} 
            streakEmoji={streakEmoji} 
            duelCount={duelCount} 
          />
        )}
        
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
        
        {/* Game Mode Menu */}
        <div className="absolute top-4 right-4 z-20">
          <GameModeMenu
            currentSelection={gameMode}
            onSelectionChange={setGameMode}
          />
        </div>
      </div>
    </div>
  );
}
