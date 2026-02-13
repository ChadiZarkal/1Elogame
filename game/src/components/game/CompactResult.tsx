'use client';

import { motion } from 'framer-motion';
import { VoteResult, Duel } from '@/types/game';

interface CompactResultProps {
  duel: Duel;
  result: VoteResult;
  index: number;
}

export function CompactResult({ duel, result, index }: CompactResultProps) {
  const userChoice = result.winner;
  const otherOption = result.loser;
  const userGuessedCorrectly = userChoice.percentage >= 50;

  const userChoseA = userChoice.id === duel.elementA.id;

  const elementA = {
    texte: duel.elementA.texte,
    percentage: userChoseA ? userChoice.percentage : otherOption.percentage,
    isRedFlag: userChoseA ? userGuessedCorrectly : !userGuessedCorrectly,
  };
  const elementB = {
    texte: duel.elementB.texte,
    percentage: !userChoseA ? userChoice.percentage : otherOption.percentage,
    isRedFlag: !userChoseA ? userGuessedCorrectly : !userGuessedCorrectly,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="mx-3 mb-3 rounded-2xl overflow-hidden border border-[#333]/60 bg-[#111]"
    >
      {/* Two options side by side */}
      <div className="flex min-h-[120px]">
        {/* Element A */}
        <div className={`flex-1 p-4 flex flex-col justify-center items-center text-center ${
          elementA.isRedFlag
            ? 'bg-gradient-to-br from-[#DC2626]/20 to-[#991B1B]/10'
            : 'bg-gradient-to-br from-[#059669]/15 to-[#047857]/5'
        }`}>
          <p className="text-[#F5F5F5] text-sm font-semibold leading-snug line-clamp-3 mb-2">
            {elementA.texte}
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`text-lg font-black ${elementA.isRedFlag ? 'text-[#EF4444]' : 'text-[#34D399]'}`}>
              {elementA.percentage}%
            </span>
            <span className="text-xs">{elementA.isRedFlag ? '🚩' : '✓'}</span>
          </div>
        </div>

        {/* VS Divider */}
        <div className="w-px bg-[#333] relative flex items-center justify-center">
          <div className="absolute bg-[#222] border border-[#444] rounded-full w-7 h-7 flex items-center justify-center z-10">
            <span className="text-[9px] font-bold text-[#666]">VS</span>
          </div>
        </div>

        {/* Element B */}
        <div className={`flex-1 p-4 flex flex-col justify-center items-center text-center ${
          elementB.isRedFlag
            ? 'bg-gradient-to-br from-[#DC2626]/20 to-[#991B1B]/10'
            : 'bg-gradient-to-br from-[#059669]/15 to-[#047857]/5'
        }`}>
          <p className="text-[#F5F5F5] text-sm font-semibold leading-snug line-clamp-3 mb-2">
            {elementB.texte}
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`text-lg font-black ${elementB.isRedFlag ? 'text-[#EF4444]' : 'text-[#34D399]'}`}>
              {elementB.percentage}%
            </span>
            <span className="text-xs">{elementB.isRedFlag ? '🚩' : '✓'}</span>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className={`px-4 py-2 flex items-center justify-between text-xs ${
        userGuessedCorrectly
          ? 'bg-[#059669]/10 text-[#34D399]'
          : 'bg-[#DC2626]/10 text-[#FCA5A5]'
      }`}>
        <span className="font-medium">
          {userGuessedCorrectly ? '🎯 Bien deviné !' : '❌ Raté !'}
        </span>
        {result.streak.current > 0 && (
          <span className="text-[#A3A3A3]">Streak: {result.streak.current}</span>
        )}
      </div>
    </motion.div>
  );
}
