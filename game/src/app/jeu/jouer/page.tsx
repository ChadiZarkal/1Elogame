'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/stores/gameStore';
import { DuelInterface } from '@/components/game/DuelInterface';
import { StreakDisplay } from '@/components/game/StreakDisplay';
import { CategorySelector } from '@/components/game/CategorySelector';
import { FullPageLoading } from '@/components/ui/Loading';

// Lazy-load components only needed after first vote or rarely
const ResultDisplay = dynamic(() => import('@/components/game/ResultDisplay').then(m => m.ResultDisplay), { ssr: false });
const AllDuelsExhausted = dynamic(() => import('@/components/game/AllDuelsExhausted').then(m => m.AllDuelsExhausted), { ssr: false });
const CompactResult = dynamic(() => import('@/components/game/CompactResult').then(m => m.CompactResult), { ssr: false });

export default function JouerPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categoriesChosen, setCategoriesChosen] = useState(false);
  
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
  
  // Initialize from storage
  useEffect(() => {
    initializeFromStorage();
    
    // Precache canvas-confetti during idle time to avoid micro-freeze on first confetti
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = requestIdleCallback(() => { import('canvas-confetti').catch(() => {}); });
      return () => cancelIdleCallback(id);
    }
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
  
  // Fetch first duel when profile is loaded AND categories chosen
  // Guard: !error prevents infinite retry loop when API fails (429 / 500)
  useEffect(() => {
    if (hasProfile && categoriesChosen && !currentDuel && !isLoadingDuel && !allDuelsExhausted && !error) {
      fetchNextDuel();
    }
  }, [hasProfile, categoriesChosen, currentDuel, isLoadingDuel, allDuelsExhausted, error, fetchNextDuel]);
  
  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: duelHistory.length > 0 ? 'smooth' : 'instant',
      });
    }
  }, [duelHistory.length, showingResult, currentDuel]);

  // Streak milestone toasts with viral challenge CTA
  const prevStreakRef = useRef(0);
  useEffect(() => {
    const prev = prevStreakRef.current;
    prevStreakRef.current = streak;
    if (streak > prev) {
      if (streak === 3) toast('🔥 3 de suite !', { description: 'Tu es chaud·e ce soir !', duration: 2500 });
      else if (streak === 5) {
        toast('⚡ Streak x5 !', {
          description: 'Défie un ami !',
          duration: 4000,
          action: {
            label: '📤 Défier',
            onClick: () => {
              const text = `🔥 J'ai une streak de 5 sur Red or Green ! Tu penses faire mieux ?`;
              if (navigator.share) navigator.share({ text, url: 'https://redorgreen.fr/jeu' }).catch(() => {});
              else navigator.clipboard.writeText(`${text} → redorgreen.fr/jeu`).catch(() => {});
            },
          },
        });
      }
      else if (streak === 10) {
        toast('🏆 Streak x10 !', {
          description: 'Incroyable ! Partage ta performance !',
          duration: 5000,
          action: {
            label: '📤 Partager',
            onClick: () => {
              const text = `🏆 Streak de 10 sur Red or Green ! Qui peut me battre ?`;
              if (navigator.share) navigator.share({ text, url: 'https://redorgreen.fr/jeu' }).catch(() => {});
              else navigator.clipboard.writeText(`${text} → redorgreen.fr/jeu`).catch(() => {});
            },
          },
        });
      }
      else if (streak >= 15 && streak % 5 === 0) {
        toast(`🎯 Streak x${streak}`, {
          description: 'Légendaire ! Partage ton exploit !',
          duration: 5000,
          action: {
            label: '📤 Partager',
            onClick: () => {
              const text = `🎯 Streak de ${streak} sur Red or Green ! Je suis inarrêtable !`;
              if (navigator.share) navigator.share({ text, url: 'https://redorgreen.fr/jeu' }).catch(() => {});
              else navigator.clipboard.writeText(`${text} → redorgreen.fr/jeu`).catch(() => {});
            },
          },
        });
      }
    }
  }, [streak]);

  // Duel count milestones — viral CTA every 10 duels
  const prevDuelCountRef = useRef(0);
  useEffect(() => {
    const prev = prevDuelCountRef.current;
    prevDuelCountRef.current = duelCount;
    if (duelCount > prev && duelCount > 0 && duelCount % 10 === 0) {
      toast(`🎮 ${duelCount} duels joués !`, {
        description: 'Invite tes amis à jouer !',
        duration: 5000,
        action: {
          label: '📤 Inviter',
          onClick: () => {
            const text = `🎮 J'ai fait ${duelCount} duels sur Red or Green ! Viens jouer aussi →`;
            if (navigator.share) navigator.share({ text, url: 'https://redorgreen.fr/jeu' }).catch(() => {});
            else navigator.clipboard.writeText(`${text} redorgreen.fr/jeu`).catch(() => {});
          },
        },
      });
    }
  }, [duelCount]);
  
  const handleReset = useCallback(() => { resetGame(); router.push('/jeu'); }, [resetGame, router]);

  const handleCategoryStart = useCallback((selectedCategories: string[]) => {
    const selection = {
      mode: 'thematique' as const,
      category: selectedCategories[0],
      categories: selectedCategories,
    };
    setGameMode(selection);
    localStorage.setItem('default_game_categories', JSON.stringify(selectedCategories));
    setCategoriesChosen(true);
  }, [setGameMode]);
  
  if (!hasProfile) {
    return <FullPageLoading text="Chargement..." />;
  }

  // Show category selector before starting the game
  if (!categoriesChosen) {
    return <CategorySelector onStart={handleCategoryStart} />;
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
        {/* Top bar: home + streak */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Home button */}
            <a
              href="/"
              className="bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#333] rounded-full w-10 h-10 flex items-center justify-center text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
              aria-label="Retour accueil"
            >
              ←
            </a>
            {/* Streak — hidden instead of unmounted to prevent CLS */}
            <div style={{ visibility: showingResult ? 'hidden' : 'visible' }}>
              <StreakDisplay 
                streak={streak} 
                streakEmoji={streakEmoji} 
                duelCount={duelCount} 
              />
            </div>
          </div>
        </div>
        
        {/* First duel hint */}
        {duelCount < 3 && !showingResult && currentDuel && (
          <div
            className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-[#DC2626]/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-red-900/30 pointer-events-none"
          >
            👆 Choisis le plus red flag 🚩
          </div>
        )}
        
        {showingResult && lastResult ? (
          <ResultDisplay
            duel={currentDuel}
            result={lastResult}
            streak={streak}
            streakEmoji={streakEmoji}
            onNext={showNextDuel}
            onStar={() => submitFeedback('star')}
            onThumbsUp={() => submitFeedback('thumbs_up')}
            onThumbsDown={() => submitFeedback('thumbs_down')}
          />
        ) : (
          <div className="flex-1 flex flex-col w-full">
            <DuelInterface
              elementA={currentDuel.elementA}
              elementB={currentDuel.elementB}
              onVote={submitVote}
              disabled={showingResult || isLoadingDuel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
