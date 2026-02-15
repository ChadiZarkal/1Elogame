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
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      {streak > 0 && (
        <div className="bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#333] rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-[#F5F5F5] font-bold text-sm">
            {streak} {streakEmoji}
          </span>
        </div>
      )}
      
      <div className="bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#333] rounded-full px-2.5 py-1">
        <span className="text-[#A3A3A3] text-xs">
          #{duelCount + 1}
        </span>
      </div>
    </motion.div>
  );
}
