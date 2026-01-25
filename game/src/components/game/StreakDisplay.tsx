'use client';

import { motion } from 'framer-motion';

interface StreakDisplayProps {
  streak: number;
  streakEmoji: string;
  duelCount: number;
}

export function StreakDisplay({ streak, streakEmoji, duelCount }: StreakDisplayProps) {
  if (streak === 0 && duelCount === 0) {
    return null;
  }
  
  return (
    <motion.div
      className="absolute top-4 left-4 z-20 flex items-center gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      {streak > 0 && (
        <div className="bg-[#1A1A1A] border border-[#333] rounded-full px-4 py-2 flex items-center gap-2">
          <span className="text-[#F5F5F5] font-bold text-lg">
            {streak} {streakEmoji}
          </span>
        </div>
      )}
      
      <div className="bg-[#1A1A1A] border border-[#333] rounded-full px-3 py-1">
        <span className="text-[#A3A3A3] text-sm">
          #{duelCount + 1}
        </span>
      </div>
    </motion.div>
  );
}
