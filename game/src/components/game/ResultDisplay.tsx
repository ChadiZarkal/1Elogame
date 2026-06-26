'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoteResult, Duel } from '@/types/game';
import { ResultCard, type ElementStats } from './ResultCard';

interface ResultDisplayProps {
  duel: Duel;
  result: VoteResult;
  streak: number;
  streakEmoji: string;
  onNext: () => void;
}

export function ResultDisplay({
  duel,
  result,
  streak,
  streakEmoji,
  onNext,
}: ResultDisplayProps) {
  const [showNextCta, setShowNextCta] = useState(false);
  const [canClickToAdvance, setCanClickToAdvance] = useState(false);
  
  // winner = user's pick, loser = other option
  const userChoice = result.winner;
  const otherOption = result.loser;
  
  const userGuessedCorrectly = userChoice.percentage >= 50;
  
  // Déterminer qui est elementA et elementB
  const userChoseA = userChoice.id === duel.elementA.id;
  
  // Stats pour A: 
  // - Si user a choisi A ET a deviné juste → A est rouge/grand
  // - Si user a choisi A ET s'est trompé → A est vert/petit (c'était le moins red flag)
  // - Si user a choisi B ET a deviné juste → A est vert/petit
  // - Si user a choisi B ET s'est trompé → A est rouge/grand
  const elementAIsMoreRedFlag = userChoseA ? userGuessedCorrectly : !userGuessedCorrectly;
  
  // Stats pour chaque élément avec les bons pourcentages
  const elementAStats: ElementStats = userChoseA
    ? { 
        percentage: userChoice.percentage, 
        votes: userChoice.participations, 
        isMoreRedFlag: elementAIsMoreRedFlag,
        rank: userChoice.rank,
        totalElements: userChoice.totalElements,
      }
    : { 
        percentage: otherOption.percentage, 
        votes: otherOption.participations, 
        isMoreRedFlag: elementAIsMoreRedFlag,
        rank: otherOption.rank,
        totalElements: otherOption.totalElements,
      };
  
  const elementBStats: ElementStats = !userChoseA
    ? { 
        percentage: userChoice.percentage, 
        votes: userChoice.participations, 
        isMoreRedFlag: !elementAIsMoreRedFlag,
        rank: userChoice.rank,
        totalElements: userChoice.totalElements,
      }
    : { 
        percentage: otherOption.percentage, 
        votes: otherOption.participations, 
        isMoreRedFlag: !elementAIsMoreRedFlag,
        rank: otherOption.rank,
        totalElements: otherOption.totalElements,
      };
  
  // Proportional flex: ratio capped at 3:1 for readability
  const higherPercent = Math.max(elementAStats.percentage, elementBStats.percentage);
  const lowerPercent = Math.min(elementAStats.percentage, elementBStats.percentage);
  const percentDiff = higherPercent - lowerPercent;
  
  const flexBig = 1 + (percentDiff / 50) * 0.8;
  const flexSmall = 1 - (percentDiff / 50) * 0.4;
  
  const flexA = result.isOptimistic ? 1 : (elementAIsMoreRedFlag ? flexBig : flexSmall);
  const flexB = result.isOptimistic ? 1 : (!elementAIsMoreRedFlag ? flexBig : flexSmall);
  const splitRatio = Math.max(5, Math.min(95, (flexA / (flexA + flexB)) * 100));
  const topColor = elementAIsMoreRedFlag ? '#991B1B' : '#047857';
  const bottomColor = !elementAIsMoreRedFlag ? '#991B1B' : '#047857';
  const splitBackground = `linear-gradient(180deg, ${topColor} 0%, ${topColor} ${splitRatio}%, ${bottomColor} ${splitRatio}%, ${bottomColor} 100%)`;
  
  useEffect(() => {
    if (result.isOptimistic) {
      setShowNextCta(false);
      setCanClickToAdvance(false);
      return;
    }

    const clickTimer = setTimeout(() => setCanClickToAdvance(true), 280);
    const ctaTimer = setTimeout(() => setShowNextCta(true), 460);

    return () => {
      clearTimeout(clickTimer);
      clearTimeout(ctaTimer);
    };
  }, [result.isOptimistic]);

  // Sparkle burst on correct answer (green confetti)
  useEffect(() => {
    if (!result.isOptimistic && userGuessedCorrectly) {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x: 0.5, y: 0.3 },
          colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
          scalar: 0.7,
          gravity: 1.2,
          ticks: 80,
          zIndex: 9999,
        });
      }).catch(() => {});
    }
  }, [result.isOptimistic, userGuessedCorrectly]);
  
  const handleNext = () => {
    onNext();
  };
  
  // Clic n'importe où pour passer à la suivante
  const handleScreenClick = () => {
    if (canClickToAdvance) {
      handleNext();
    }
  };
  
  return (
    <div 
      className="flex flex-1 min-h-0 h-full w-full flex-col overflow-hidden"
      style={{ background: splitBackground }}
      onClick={handleScreenClick}
    >
      {/* Correct/Wrong answer feedback — subtle overlay */}
      {!result.isOptimistic && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          style={{ top: 'calc(max(12px, env(safe-area-inset-top)) + 56px)' }}
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [-20, 0, 0, -10], scale: [0.8, 1.05, 1, 0.95] }}
          transition={{ duration: 2, times: [0, 0.15, 0.7, 1] }}
        >
          <div
            className="px-5 py-2.5 rounded-full font-black text-sm shadow-lg backdrop-blur-md"
            style={{
              background: userGuessedCorrectly 
                ? 'rgba(16,185,129,0.25)' 
                : 'rgba(239,68,68,0.20)',
              border: `1px solid ${userGuessedCorrectly ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.4)'}`,
              color: userGuessedCorrectly ? '#34D399' : '#FCA5A5',
              boxShadow: userGuessedCorrectly 
                ? '0 4px 24px rgba(16,185,129,0.3)' 
                : '0 4px 24px rgba(239,68,68,0.2)',
            }}
          >
            {userGuessedCorrectly ? '✓ Bien vu !' : '✗ Raté !'}
          </div>
        </motion.div>
      )}

      <ResultCard 
        element={duel.elementA} 
        stats={elementAStats}
        flexValue={flexA}
        isOptimistic={result.isOptimistic}
      />
      
      <div className="relative h-0 z-20">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            className="bg-[#0D0D0D] border-2 border-[#333] rounded-full w-12 h-12 flex items-center justify-center"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-bold text-[#A3A3A3]">VS</span>
          </motion.div>
        </div>
      </div>
      
      <ResultCard 
        element={duel.elementB} 
        stats={elementBStats}
        flexValue={flexB}
        isOptimistic={result.isOptimistic}
      />

      <AnimatePresence>
        {showNextCta && (
          <motion.div
            className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 pointer-events-none"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            {streak > 0 && (
              <div className="rounded-full border border-white/30 bg-black/35 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-md">
                Streak: {streak} {streakEmoji}
                {result.streak.matched ? <span className="ml-2 text-[#34D399]">+1 🎯</span> : null}
              </div>
            )}

            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="group pointer-events-auto relative isolate min-h-12 overflow-hidden rounded-full border border-white/65 bg-[#0B1220]/92 px-7 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur-md"
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(120deg,rgba(239,68,68,0.33),rgba(30,41,59,0.18),rgba(16,185,129,0.28))] opacity-85 transition-opacity duration-200 group-hover:opacity-100"
              />
              <span aria-hidden className="absolute inset-[1px] rounded-full border border-white/15" />
              <span className="relative inline-flex items-center gap-2">
                <span>Suivant</span>
                <span aria-hidden className="text-base leading-none">→</span>
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Indicateur de clic pour passer */}
      {canClickToAdvance && !showNextCta && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-white/50 text-sm">Touchez pour continuer</span>
        </motion.div>
      )}
    </div>
  );
}
