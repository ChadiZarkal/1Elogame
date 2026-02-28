'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Duel } from '@/types/game';
import type { ElementStats } from './ResultCard';

interface FeedbackBarProps {
  duel: Duel;
  elementAStats: ElementStats;
  streak: number;
  streakEmoji: string;
  streakMatched: boolean;
  onNext: () => void;
  onStar: () => void;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
}

/**
 * Bottom feedback bar shown after result reveal — contains streak info,
 * star/thumbs/share buttons, and the "Next" button.
 */
export function FeedbackBar({
  duel,
  elementAStats,
  streak,
  streakEmoji,
  streakMatched,
  onNext,
  onStar,
  onThumbsUp,
  onThumbsDown,
}: FeedbackBarProps) {
  const [starGiven, setStarGiven] = useState(false);

  const handleStar = () => {
    if (!starGiven) {
      setStarGiven(true);
      onStar();
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const moreRF = elementAStats.isMoreRedFlag ? duel.elementA.texte : duel.elementB.texte;
    const lessRF = !elementAStats.isMoreRedFlag ? duel.elementA.texte : duel.elementB.texte;
    const shareText = `🚩 Red or Green\n\n"${moreRF}" est voté plus Red Flag que "${lessRF}" par la communauté !\n\nJoue toi aussi →`;
    if (navigator.share) {
      navigator.share({ text: shareText, url: 'https://redorgreen.fr/jeu' }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
  };

  return (
    <motion.div
      className="bg-[#1A1A1A] border-t border-[#333] p-4 safe-area-bottom"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={(e) => e.stopPropagation()}
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
          {streakMatched && <span className="ml-2 text-[#059669] text-sm font-semibold">+1 🎯</span>}
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
            onClick={handleShare}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl bg-[#2A2A2A] text-[#F5F5F5] hover:bg-[#333] border border-[#333] transition-all"
            aria-label="Partager ce duel"
          >
            📤
          </motion.button>
        </div>

        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 bg-[#DC2626] hover:bg-[#EF4444] text-white rounded-xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
        >
          Suivant →
        </motion.button>
      </div>
    </motion.div>
  );
}
