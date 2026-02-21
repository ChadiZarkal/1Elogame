'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoteResult, Duel, ElementDTO } from '@/types/game';
import { formatNumber } from '@/lib/utils';

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

interface ElementStats {
  percentage: number;
  votes: number;
  isMoreRedFlag: boolean; // true = c'est le PLUS red flag (celui voté)
  rank?: number; // Rang global
  totalElements?: number; // Total des éléments
}

// Composant pour afficher une option avec son résultat
function ResultCard({ 
  element, 
  stats,
  flexValue,
  isOptimistic
}: { 
  element: ElementDTO; 
  stats: ElementStats;
  flexValue: number; // Valeur de flex calculée proportionnellement
  isOptimistic?: boolean; // Mode optimiste = affichage neutre en attente
}) {
  // isMoreRedFlag = true → C'est le plus red flag → ROUGE + GRAND
  // isMoreRedFlag = false → C'est le moins red flag → VERT + PETIT
  const isMoreRedFlag = stats.isMoreRedFlag;
  
  // En mode optimiste: fond neutre gris, pas de direction affichée
  const bgClass = isOptimistic
    ? 'bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A]'
    : isMoreRedFlag 
      ? 'bg-gradient-to-br from-[#DC2626] to-[#991B1B]'
      : 'bg-gradient-to-br from-[#059669] to-[#047857]';
  
  return (
    <motion.div
      className={`relative flex items-center justify-center p-5 ${bgClass}`}
      initial={{ flex: 1 }}
      animate={{ flex: flexValue }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Flash effect — only when real data */}
      {!isOptimistic && (
        <motion.div 
          className={`absolute inset-0 ${isMoreRedFlag ? 'bg-[#DC2626]' : 'bg-[#059669]'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 0.4 }}
        />
      )}
      
      <div className="text-center z-10 max-w-md">
        {/* Shimmer loading pour mode optimiste */}
        {isOptimistic && (
          <motion.div
            className="mb-3"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/60 px-4 py-1.5 rounded-lg text-sm font-medium">
              <span>⏳</span>
              <span>Calcul des votes...</span>
            </span>
          </motion.div>
        )}

        {/* Badge RED FLAG amélioré pour le plus red flag — hidden in optimistic mode */}
        {!isOptimistic && isMoreRedFlag && (
          <motion.div
            className="mb-4"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 18 }}
          >
            <span className="inline-flex items-center gap-2 bg-white text-[#DC2626] px-5 py-2 rounded-lg text-base sm:text-lg font-black shadow-xl border-2 border-white/50">
              <span className="text-xl">🚩</span>
              <span>PLUS RED FLAG</span>
              <span className="text-xl">🚩</span>
            </span>
          </motion.div>
        )}
        
        {/* Texte de l'élément */}
        <motion.p 
          className={`font-bold text-white leading-tight mb-3 ${
            isOptimistic ? 'text-lg sm:text-xl' : isMoreRedFlag ? 'text-xl sm:text-2xl md:text-3xl' : 'text-base sm:text-lg'
          }`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
        >
          {element.texte}
        </motion.p>
        
        {/* Pourcentage — hidden in optimistic mode */}
        {!isOptimistic && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            <p className={`font-black text-white ${isMoreRedFlag ? 'text-4xl sm:text-5xl' : 'text-xl sm:text-2xl'}`}>
              {stats.percentage}%
            </p>
            <p className="text-white/70 text-xs sm:text-sm">
              {formatNumber(stats.votes)} votes
            </p>
          </motion.div>
        )}

        {/* Classement global — hidden in optimistic mode */}
        {!isOptimistic && stats.rank && stats.totalElements && (
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${
              isMoreRedFlag 
                ? 'bg-black/30 text-white' 
                : 'bg-white/20 text-white'
            }`}>
              <span>🏆</span>
              <span>#{stats.rank}</span>
              <span className="text-white/60">/ {stats.totalElements}</span>
            </span>
          </motion.div>
        )}

        {/* Badge "Moins pire" pour le moins red flag — hidden in optimistic mode */}
        {!isOptimistic && !isMoreRedFlag && (
          <motion.div
            className="mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
              <span>✓</span>
              <span>Moins pire</span>
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
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
  const [starGiven, setStarGiven] = useState(false);
  const [canClickToAdvance, setCanClickToAdvance] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // LOGIQUE CORRIGÉE:
  // - result.winner = l'option que l'utilisateur a CLIQUÉE (son choix)
  // - result.winner.percentage = le % de gens qui pensent que CE choix est le plus red flag
  // - result.loser.percentage = le % de gens qui pensent que L'AUTRE option est le plus red flag
  // 
  // Si winner.percentage > 50% → L'utilisateur a deviné correctement (son choix EST le plus red flag)
  // Si winner.percentage < 50% → L'utilisateur s'est trompé (l'autre option est le plus red flag)
  
  const userChoice = result.winner; // Ce que l'utilisateur a cliqué
  const otherOption = result.loser; // L'autre option
  
  // Est-ce que le choix de l'utilisateur est VRAIMENT le plus red flag selon les stats ?
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
  
  // CALCUL PROPORTIONNEL DES TAILLES
  // Récupérer le pourcentage du plus grand (le red flag)
  const higherPercent = Math.max(elementAStats.percentage, elementBStats.percentage);
  const lowerPercent = Math.min(elementAStats.percentage, elementBStats.percentage);
  
  // L'écart va de 0 (50/50) à 50 (100/0)
  const percentDiff = higherPercent - lowerPercent;
  
  // Système de flex proportionnel avec limites pour la lisibilité:
  // - 50/50 → flex 1 / 1 (égal)
  // - 60/40 → légère différence
  // - 80/20 → grande différence mais lisible
  // 
  // On utilise une échelle où:
  // - Le plus grand va de 1.0 (à 50%) jusqu'à 1.8 max (à 100%)
  // - Le plus petit va de 1.0 (à 50%) jusqu'à 0.6 min (à 0%)
  // Cela donne un ratio max de 1.8/0.6 = 3:1, lisible
  
  const flexBig = 1 + (percentDiff / 50) * 0.8;   // Range: 1.0 → 1.8
  const flexSmall = 1 - (percentDiff / 50) * 0.4; // Range: 1.0 → 0.6
  
  const flexA = elementAIsMoreRedFlag ? flexBig : flexSmall;
  const flexB = !elementAIsMoreRedFlag ? flexBig : flexSmall;
  
  useEffect(() => {
    // Afficher le feedback après 0.4s (was 1.2s)
    const animationTimer = setTimeout(() => setShowFeedback(true), 400);
    // Permettre le clic pour avancer après 0.25s (was 0.8s)
    const clickTimer = setTimeout(() => setCanClickToAdvance(true), 250);
    // Auto-advance après 4s (was 6s)
    autoAdvanceTimerRef.current = setTimeout(() => onNext(), 4000);
    
    return () => {
      clearTimeout(animationTimer);
      clearTimeout(clickTimer);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
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
  
  const handleStar = () => {
    if (!starGiven) {
      setStarGiven(true);
      onStar();
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
          <motion.div
            className="bg-[#1A1A1A] border-t border-[#333] p-4 safe-area-bottom"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} // Empêche le clic de passer à la suivante
          >
            {streak > 0 && (
              <motion.div
                className="text-center mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <span className="text-[#F5F5F5] text-lg font-bold">
                  Streak: {streak} {streakEmoji}
                </span>
                {result.streak.matched && (
                  <span className="ml-2 text-[#059669] text-sm font-semibold">+1 🎯</span>
                )}
              </motion.div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <motion.button
                  onClick={handleStar}
                  disabled={starGiven}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-xl transition-all ${
                    starGiven
                      ? 'bg-[#FCD34D] text-[#92400E]'
                      : 'bg-[#2A2A2A] text-[#F5F5F5] hover:bg-[#333] border border-[#333]'
                  }`}
                  aria-label={starGiven ? 'Duel déjà noté' : 'Voter pour ce duel'}
                >
                  ⭐
                </motion.button>
                <motion.button
                  onClick={onThumbsUp}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl bg-[#2A2A2A] text-[#F5F5F5] hover:bg-[#333] border border-[#333] transition-all"
                  aria-label="J'aime ce duel"
                >
                  👍
                </motion.button>
                <motion.button
                  onClick={onThumbsDown}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl bg-[#2A2A2A] text-[#F5F5F5] hover:bg-[#333] border border-[#333] transition-all"
                  aria-label="Je n'aime pas ce duel"
                >
                  👎
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    const moreRF = elementAStats.isMoreRedFlag ? duel.elementA.texte : duel.elementB.texte;
                    const lessRF = !elementAStats.isMoreRedFlag ? duel.elementA.texte : duel.elementB.texte;
                    const shareText = `🚩 Red Flag Games\n\n"${moreRF}" est voté plus Red Flag que "${lessRF}" par la communauté !\n\nJoue toi aussi → redflaggames.fr`;
                    if (navigator.share) {
                      navigator.share({ text: shareText }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(shareText).catch(() => {});
                    }
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl bg-[#2A2A2A] text-[#F5F5F5] hover:bg-[#333] border border-[#333] transition-all"
                  aria-label="Partager ce duel"
                >
                  📤
                </motion.button>
              </div>
              
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 bg-[#DC2626] hover:bg-[#EF4444] text-white rounded-xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
              >
                Suivant →
              </motion.button>
            </div>
          </motion.div>
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
