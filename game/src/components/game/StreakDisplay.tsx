'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakDisplayProps {
  streak: number;
  streakEmoji: string;
  duelCount: number;
}

// Fire confetti at streak milestones
const CONFETTI_MILESTONES = [3, 5, 10, 15, 20];

export function StreakDisplay({ streak, streakEmoji, duelCount }: StreakDisplayProps) {
  const prevStreakRef = useRef(streak);

  useEffect(() => {
    const prev = prevStreakRef.current;
    prevStreakRef.current = streak;

    // Only fire when streak increases and hits a milestone
    if (streak > prev && CONFETTI_MILESTONES.includes(streak)) {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: streak >= 10 ? 180 : streak >= 5 ? 120 : 80,
          spread: streak >= 10 ? 100 : 70,
          origin: { x: 0.5, y: 0.4 },
          colors: ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#A855F7'],
          scalar: 0.9,
          zIndex: 9999,
        });
        if (streak >= 5) {
          setTimeout(() => {
            confetti({
              particleCount: 60,
              angle: 60,
              spread: 60,
              origin: { x: 0, y: 0.5 },
              colors: ['#EF4444', '#F97316', '#F59E0B'],
              zIndex: 9999,
            });
            confetti({
              particleCount: 60,
              angle: 120,
              spread: 60,
              origin: { x: 1, y: 0.5 },
              colors: ['#10B981', '#3B82F6', '#A855F7'],
              zIndex: 9999,
            });
          }, 250);
        }
      }).catch(() => {});
    }
  }, [streak]);

  if (streak === 0 && duelCount === 0) {
    return null;
  }

  const isMilestone = CONFETTI_MILESTONES.includes(streak);

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {streak > 0 && (
          <motion.div
            key={`streak-${streak}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: isMilestone ? [1, 1.25, 1] : 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: isMilestone ? 0.5 : 0.3, type: 'spring' }}
            className="backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5"
            style={{
              background: isMilestone ? 'rgba(239,68,68,0.18)' : 'rgba(26,26,26,0.8)',
              border: isMilestone ? '1px solid rgba(239,68,68,0.4)' : '1px solid #333',
              boxShadow: isMilestone ? '0 0 20px rgba(239,68,68,0.25)' : 'none',
            }}
          >
            <span
              className="font-bold text-sm"
              style={{ color: isMilestone ? '#FCA5A5' : '#F5F5F5' }}
            >
              {streak} {streakEmoji}
            </span>
            {isMilestone && (
              <motion.span
                className="text-xs font-black"
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ color: '#EF4444' }}
              >
                🔥
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#333] rounded-full px-2.5 py-1">
        <span className="text-[#A3A3A3] text-xs">
          #{duelCount + 1}
        </span>
      </div>
    </motion.div>
  );
}

