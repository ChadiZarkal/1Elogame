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
  
  const rawBig = 1 + (percentDiff / 50) * 0.8;
  const rawSmall = 1 - (percentDiff / 50) * 0.4;

  /* Plancher de 30 % sur la petite carte.
     `percentDiff` peut atteindre 100 — un duel où tout le monde a voté du même
     côté — et la formule donnait alors un partage de 93/7 : la carte perdante
     tombait à une quarantaine de pixels, son libellé remontait sous la barre
     de commandes et s'y superposait. Le rapport reste parlant à 70/30. */
  const MIN_SHARE = 0.3;
  const smallShare = Math.max(MIN_SHARE, rawSmall / (rawBig + rawSmall));
  const flexSmall = smallShare;
  const flexBig = 1 - smallShare;

  const flexA = result.isOptimistic ? 1 : (elementAIsMoreRedFlag ? flexBig : flexSmall);
  const flexB = result.isOptimistic ? 1 : (!elementAIsMoreRedFlag ? flexBig : flexSmall);
  const splitRatio = (flexA / (flexA + flexB)) * 100;
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
          disableForReducedMotion: true,
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
      /* `relative` : les blocs ancrés en bas — le bouton « Suivant » et
         l'invite « Touchez pour continuer » — doivent se caler sur cet écran,
         pas sur un ancêtre lointain. */
      className="relative flex flex-1 min-h-0 h-full w-full flex-col overflow-hidden"
      style={{ background: splitBackground }}
      onClick={handleScreenClick}
    >
      {/* Correct/Wrong answer feedback — subtle overlay */}
      {!result.isOptimistic && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          style={{ top: 68 }}
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

      {/* 56 px : la barre de commandes flottante — 12 px du haut, boutons de
          44 px. Sans cette réserve, le libellé de la carte du haut se
          superposait aux boutons dès que le résultat était tranché. */}
      <ResultCard
        element={duel.elementA}
        stats={elementAStats}
        flexValue={flexA}
        isOptimistic={result.isOptimistic}
        topInset={56}
      />
      
      {/* Le séparateur ne porte plus que la pastille VS. Le bouton « Suivant »
          en a été sorti : ce point d'ancrage suit le partage proportionnel des
          deux cartes, qui vaut 50 % pendant le vote mais jusqu'à 75 % sur un
          duel tranché — et qui glisse encore pendant les 350 ms d'animation.
          Le bouton naissait donc à quelque 150 px du doigt qui venait de
          voter, et bougeait sous lui. Il est désormais ancré en bas, à une
          place fixe d'un écran à l'autre. */}
      <div className="relative h-0 z-30 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
          <AnimatePresence initial={false}>
            {!showNextCta && (
              <motion.div
                key="vs-badge"
                className="bg-[#0D0D0D] border-2 border-[#333] rounded-full w-12 h-12 flex items-center justify-center"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.16 }}
              >
                <span className="text-sm font-bold text-[#A3A3A3]">VS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 z-30 flex justify-center"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <AnimatePresence initial={false}>
          {showNextCta && (
            <motion.button
              key="next-cta"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              initial={{ opacity: 0, scale: 0.88, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 4 }}
              transition={{ duration: 0.18 }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="group pointer-events-auto relative isolate min-h-12 overflow-hidden rounded-full border border-white/65 bg-[#0B1220]/92 px-7 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur-md"
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(120deg,rgba(239,68,68,0.33),rgba(30,41,59,0.18),rgba(16,185,129,0.28))] opacity-85 transition-opacity duration-200 group-hover:opacity-100"
              />
              <span aria-hidden className="absolute inset-px rounded-full border border-white/15" />
              <span className="relative inline-flex items-center gap-2">
                <span>Suivant</span>
                <span aria-hidden className="text-base leading-none">→</span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>


      <ResultCard 
        element={duel.elementB} 
        stats={elementBStats}
        flexValue={flexB}
        isOptimistic={result.isOptimistic}
      />
      
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
