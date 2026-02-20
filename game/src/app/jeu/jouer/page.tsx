'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
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
  // Guard: !error prevents infinite retry loop when API fails (429 / 500)
  useEffect(() => {
    if (hasProfile && !currentDuel && !isLoadingDuel && !allDuelsExhausted && !error) {
      fetchNextDuel();
    }
  }, [hasProfile, currentDuel, isLoadingDuel, allDuelsExhausted, error, fetchNextDuel]);
  
  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: duelHistory.length > 0 ? 'smooth' : 'instant',
      });
    }
  }, [duelHistory.length, showingResult, currentDuel]);

  // Streak milestone toasts
  const prevStreakRef = useRef(0);
  useEffect(() => {
    const prev = prevStreakRef.current;
    prevStreakRef.current = streak;
    if (streak > prev) {
      if (streak === 3) toast('🔥 3 de suite !', { description: 'Tu es chaud·e ce soir !', duration: 2500 });
      else if (streak === 5) toast('⚡ Streak x5 !', { description: 'Incroyable, continue !', duration: 3000 });
      else if (streak === 10) toast('🏆 Streak x10 !', { description: 'Tu es inarrêtable !', duration: 3500 });
      else if (streak >= 15 && streak % 5 === 0) toast(`🎯 Streak x${streak}`, { description: 'Légendaire !', duration: 3500 });
    }
  }, [streak]);
  
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
        {/* Top bar: home + streak + mode */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Home button */}
            <button
              onClick={() => router.push('/')}
              className="bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#333] rounded-full w-10 h-10 flex items-center justify-center text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
              aria-label="Retour accueil"
            >
              ←
            </button>
            {/* Streak */}
            {!showingResult && (
              <StreakDisplay 
                streak={streak} 
                streakEmoji={streakEmoji} 
                duelCount={duelCount} 
              />
            )}
          </div>
          {/* Game Mode Menu */}
          <GameModeMenu
            currentSelection={gameMode}
            onSelectionChange={setGameMode}
          />
        </div>
        
        {/* First duel hint */}
        {duelCount === 0 && !showingResult && (
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-[#DC2626]/90 text-white text-xs font-bold px-4 py-2 rounded-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            👆 Choisis le pire des deux 👇
          </motion.div>
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
          <div className="flex-1 flex flex-col w-full">
            <DuelInterface
              elementA={currentDuel.elementA}
              elementB={currentDuel.elementB}
              onVote={handleVote}
              disabled={showingResult || isLoadingDuel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
