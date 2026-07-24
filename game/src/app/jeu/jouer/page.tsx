'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useGameStore, type PartySize } from '@/stores/gameStore';
import { useOnlineStatus, useHaptics } from '@/lib/hooks';
import { DuelInterface } from '@/components/game/DuelInterface';
import { ResultDisplay } from '@/components/game/ResultDisplay';
import { StreakDisplay } from '@/components/game/StreakDisplay';
import { CategorySelector } from '@/components/game/CategorySelector';
import { FullPageLoading } from '@/components/ui/Loading';

// Lazy-load components only needed rarely
const AllDuelsExhausted = dynamic(() => import('@/components/game/AllDuelsExhausted').then(m => m.AllDuelsExhausted), { ssr: false });
const CompactResult = dynamic(() => import('@/components/game/CompactResult').then(m => m.CompactResult), { ssr: false });

export default function JouerPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousOnlineRef = useRef(true);
  const [showBackToLive, setShowBackToLive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isOnline = useOnlineStatus();
  const { tap, success: hapticSuccess, error: hapticError } = useHaptics();
  
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
    duelHistory,
    partyActive,
    partyConfig,
    partyComplete,
    initializeFromStorage,
    fetchNextDuel,
    submitVote,
    showNextDuel,
    resetGame,
    clearError,
    startParty,
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
  
  // Redirect to recap when party completes
  useEffect(() => {
    if (partyComplete) {
      router.push('/jeu/recap');
    }
  }, [partyComplete, router]);
  
  // Fetch first duel when profile is loaded AND party is active
  // Guard: !error prevents infinite retry loop when API fails (429 / 500)
  useEffect(() => {
    if (hasProfile && partyActive && !currentDuel && !isLoadingDuel && !allDuelsExhausted && !error && isOnline) {
      fetchNextDuel();
    }
  }, [hasProfile, partyActive, currentDuel, isLoadingDuel, allDuelsExhausted, error, isOnline, fetchNextDuel]);
  
  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: duelHistory.length > 0 ? 'smooth' : 'instant',
      });
    }
  }, [duelHistory.length, showingResult, currentDuel]);

  // Detect when user is reading history and offer quick jump back to live duel
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowBackToLive(distanceFromBottom > 180);
    };

    onScroll();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [duelHistory.length, showingResult, currentDuel]);

  // Mobile resilience: clear feedback when connectivity changes and auto-resume fetch
  useEffect(() => {
    const wasOnline = previousOnlineRef.current;
    if (wasOnline && !isOnline) {
      hapticError();
      toast('Connexion perdue', {
        description: 'Le vote est suspendu tant que vous etes hors ligne.',
        duration: 2800,
      });
    }

    if (!wasOnline && isOnline) {
      hapticSuccess();
      toast('Connexion retablie', {
        description: 'Le jeu reprend normalement.',
        duration: 2200,
      });

      if (hasProfile && partyActive && !currentDuel && !isLoadingDuel && !allDuelsExhausted) {
        fetchNextDuel();
      }
    }

    previousOnlineRef.current = isOnline;
  }, [
    isOnline,
    hasProfile,
    partyActive,
    currentDuel,
    isLoadingDuel,
    allDuelsExhausted,
    fetchNextDuel,
    hapticSuccess,
    hapticError,
  ]);

  // Streak milestone toasts with viral challenge CTA
  const prevStreakRef = useRef(0);
  useEffect(() => {
    const prev = prevStreakRef.current;
    prevStreakRef.current = streak;
    if (streak > prev) {
      if (streak === 3) toast('🔥 3 de suite !', { description: 'Tu es chaud·e ce soir !', duration: 2500 });
      else if (streak === 5) {
        toast('⚡ Streak x5 !', {
          description: 'Continue, tu es en feu.',
          duration: 2500,
        });
      }
      else if (streak === 10) {
        toast('🏆 Streak x10 !', {
          description: 'Incroyable regularite.',
          duration: 2800,
        });
      }
      else if (streak >= 15 && streak % 5 === 0) {
        toast(`🎯 Streak x${streak}`, {
          description: 'Niveau legendaire.',
          duration: 2800,
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
        description: 'Tu tiens le rythme, continue.',
        duration: 2600,
      });
    }
  }, [duelCount]);
  
  const handleReset = useCallback(() => { resetGame(); router.push('/jeu'); }, [resetGame, router]);

  const handleRefreshDuel = useCallback(async () => {
    tap();
    if (!isOnline) {
      toast('Connexion requise', {
        description: 'Reconnecte-toi pour charger un nouveau duel.',
        duration: 2200,
      });
      return;
    }

    setIsRefreshing(true);
    clearError();
    try {
      await fetchNextDuel();
    } finally {
      setIsRefreshing(false);
    }
  }, [tap, isOnline, clearError, fetchNextDuel]);

  const handleCategoryStart = useCallback((selectedCategories: string[], partySize: PartySize) => {
    tap();
    localStorage.setItem('default_game_categories', JSON.stringify(selectedCategories));
    localStorage.setItem('default_game_size', String(partySize));
    startParty({ size: partySize, originalSize: partySize, categories: selectedCategories });
  }, [tap, startParty]);
  
  if (!hasProfile) {
    return <FullPageLoading text="Chargement..." />;
  }

  // Show category selector / party setup before starting the game
  if (!partyActive && !partyComplete) {
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
      <div className="flex flex-col items-center justify-center min-h-dvh bg-[#0D0D0D] p-6">
        <div className="text-center space-y-4">
          <span className="text-6xl">😕</span>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Oups !</h1>
          <p className="text-[#A3A3A3]">{error}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { clearError(); fetchNextDuel(); }}
              className="px-6 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#EF4444] transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={() => { resetGame(); router.push('/jeu/jouer'); }}
              className="px-6 py-2 bg-[#1A1A1A] text-[#E4E4E7] border border-[#333] rounded-lg hover:border-[#555] transition-colors"
            >
              Changer de catégories
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentDuel) {
    return <FullPageLoading text="Chargement du duel..." />;
  }
  
  return (
    <div
      ref={scrollRef}
      className="relative w-full overflow-y-auto overscroll-y-contain bg-[#0D0D0D]"
      style={{ height: 'var(--app-height, 100dvh)' }}
    >
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
      <div
        className="w-full relative flex flex-col"
        style={{
          minHeight: 'var(--app-height, 100dvh)',
          height: 'var(--app-height, 100dvh)',
        }}
      >
        {/* Top bar: home + streak + party progress */}
        <div className="absolute left-4 right-4 z-30 flex items-center justify-between" style={{ top: 'max(12px, env(safe-area-inset-top))' }}>
          <div className="flex items-center gap-2">
            {/* Home button */}
            <Link
              href="/"
              className="bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#333] rounded-full w-10 h-10 flex items-center justify-center text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
              aria-label="Retour accueil"
            >
              ←
            </Link>
            <button
              onClick={handleRefreshDuel}
              disabled={isLoadingDuel || isRefreshing}
              className="bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#333] rounded-full w-10 h-10 flex items-center justify-center text-[#A3A3A3] hover:text-[#F5F5F5] disabled:opacity-50 transition-colors"
              aria-label="Rafraichir le duel"
            >
              {isRefreshing ? '…' : '↻'}
            </button>
            {/* Streak — hidden instead of unmounted to prevent CLS */}
            <div style={{ visibility: showingResult ? 'hidden' : 'visible' }}>
              <StreakDisplay 
                streak={streak} 
                streakEmoji={streakEmoji} 
                duelCount={duelCount} 
              />
            </div>
          </div>
          {/* Party progress */}
          {partyConfig && (
            <div className="bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#333] rounded-full px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs font-bold text-[#999]">
                {duelCount >= partyConfig.size ? '✅' : `${duelCount}/${partyConfig.size}`}
              </span>
              <div className="w-16 h-1.5 bg-[#333] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#EF4444] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (duelCount / partyConfig.size) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {!isOnline && (
          <div
            className="absolute left-1/2 z-30 -translate-x-1/2 rounded-full border border-[#7F1D1D] bg-[#1A1212]/95 px-3 py-1 text-[11px] font-semibold text-[#FCA5A5]"
            style={{ top: 'calc(max(12px, env(safe-area-inset-top)) + 52px)' }}
          >
            📡 Hors ligne: vote desactive
          </div>
        )}
        
        {/* First duel hint — auto-fades after 3s */}
        {duelCount === 0 && !showingResult && currentDuel && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.5, times: [0, 0.12, 0.7, 1], ease: 'easeInOut' }}
            className="absolute left-1/2 -translate-x-1/2 z-10 bg-[#DC2626]/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-red-900/30 pointer-events-none"
            style={{ top: `calc(max(12px, env(safe-area-inset-top)) + ${isOnline ? 56 : 88}px)` }}
          >
            🚩 Votez pour l&apos;option la plus red flag
          </motion.div>
        )}

        {showBackToLive && duelHistory.length > 0 && (
          <button
            onClick={() => {
              if (!scrollRef.current) return;
              scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }}
            className="absolute right-4 z-30 rounded-full border border-[#EF4444]/40 bg-[#1A1A1A]/90 px-3 py-2 text-xs font-bold text-[#FCA5A5] backdrop-blur-sm hover:bg-[#232326] transition-colors"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)' }}
          >
            ↓ Duel en cours
          </button>
        )}
        
        {showingResult && lastResult ? (
          <div className="flex-1 min-h-0 flex flex-col w-full">
            <ResultDisplay
              duel={currentDuel}
              result={lastResult}
              streak={streak}
              streakEmoji={streakEmoji}
              onNext={showNextDuel}
              duelCount={duelCount}
              totalDuels={partyConfig?.size}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col w-full">
            <DuelInterface
              elementA={currentDuel.elementA}
              elementB={currentDuel.elementB}
              onVote={submitVote}
              disabled={showingResult || isLoadingDuel || !isOnline}
              disabledReason={!isOnline ? '📡 Reconnexion necessaire pour voter' : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
