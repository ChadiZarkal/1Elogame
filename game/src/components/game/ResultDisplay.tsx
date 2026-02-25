'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoteResult, Duel } from '@/types/game';
import { ResultCard, type ElementStats } from './ResultCard';
import { FeedbackBar } from './FeedbackBar';

interface ResultDisplayProps {
  duel: Duel;
  result: VoteResult;
  streak: number;
  streakEmoji: string;
  onNext: () => void;
  onStar: () => void;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
}

export function ResultDisplay({
  duel,
  result,
  streak,
  streakEmoji,
  onNext,
  onStar,
  onThumbsUp,
  onThumbsDown,
}: ResultDisplayProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [canClickToAdvance, setCanClickToAdvance] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  const flexA = elementAIsMoreRedFlag ? flexBig : flexSmall;
  const flexB = !elementAIsMoreRedFlag ? flexBig : flexSmall;
  
  useEffect(() => {
    const animationTimer = setTimeout(() => setShowFeedback(true), 400);
    const clickTimer = setTimeout(() => setCanClickToAdvance(true), 250);
    
    return () => {
      clearTimeout(animationTimer);
      clearTimeout(clickTimer);
    };
  }, [onNext]);

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
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
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
      className="flex flex-col h-full w-full overflow-hidden bg-[#0D0D0D]"
      onClick={handleScreenClick}
    >
      {/* Correct/Wrong answer feedback — subtle overlay */}
      {!result.isOptimistic && (
        <motion.div
          className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
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
        {showFeedback && (
          <FeedbackBar
            duel={duel}
            elementAStats={elementAStats}
            streak={streak}
            streakEmoji={streakEmoji}
            streakMatched={result.streak.matched}
            onNext={handleNext}
            onStar={onStar}
            onThumbsUp={onThumbsUp}
            onThumbsDown={onThumbsDown}
          />
        )}
      </AnimatePresence>
      
      {/* Indicateur de clic pour passer */}
      {canClickToAdvance && !showFeedback && (
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
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
