'use client';

import { motion } from 'framer-motion';
import { useHaptics } from '@/lib/hooks';

interface FeedbackBarProps {
  streak: number;
  streakEmoji: string;
  streakMatched: boolean;
  onNext: () => void;
}

/**
 * Bottom feedback bar shown after result reveal — keeps the flow focused on
 * progression during the question sequence.
 */
export function FeedbackBar({
  streak,
  streakEmoji,
  streakMatched,
  onNext,
}: FeedbackBarProps) {
  const { success } = useHaptics();

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

      <motion.button
        onClick={() => {
          success();
          onNext();
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full min-h-12 px-6 py-2.5 bg-[#DC2626] hover:bg-[#EF4444] text-white rounded-xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
      >
        Suivant →
      </motion.button>
    </motion.div>
  );
}
