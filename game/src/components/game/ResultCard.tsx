'use client';

import { motion } from 'framer-motion';
import { ElementDTO } from '@/types/game';
import { formatNumber } from '@/lib/utils';
import { AnimatedPercent } from './AnimatedPercent';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ElementStats {
  percentage: number;
  votes: number;
  isMoreRedFlag: boolean;
  rank?: number;
  totalElements?: number;
}

interface ResultCardProps {
  element: ElementDTO;
  stats: ElementStats;
  flexValue: number;
  isOptimistic?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * One half of the duel result view — shows an element with its vote stats.
 * Renders differently when `isOptimistic` (pending real data from server).
 */
export function ResultCard({ element, stats, flexValue, isOptimistic }: ResultCardProps) {
  const { isMoreRedFlag } = stats;

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
        {/* Shimmer loading for optimistic mode */}
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

        {/* RED FLAG badge — hidden in optimistic mode */}
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

        {/* Element text */}
        <motion.p
          className={`font-bold text-white leading-tight mb-3 ${
            isOptimistic
              ? 'text-lg sm:text-xl'
              : isMoreRedFlag
                ? 'text-xl sm:text-2xl md:text-3xl'
                : 'text-base sm:text-lg'
          }`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
        >
          {element.texte}
        </motion.p>

        {/* Percentage — hidden in optimistic mode */}
        {!isOptimistic && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            <p className={`font-black text-white ${isMoreRedFlag ? 'text-4xl sm:text-5xl' : 'text-xl sm:text-2xl'}`}>
              <AnimatedPercent value={stats.percentage} delay={isMoreRedFlag ? 0.15 : 0.25} />
            </p>
            <p className="text-white/70 text-xs sm:text-sm">{formatNumber(stats.votes)} votes</p>
          </motion.div>
        )}

        {/* Global rank — hidden in optimistic mode */}
        {!isOptimistic && stats.rank && stats.totalElements && (
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${
                isMoreRedFlag ? 'bg-black/30 text-white' : 'bg-white/20 text-white'
              }`}
            >
              <span>🏆</span>
              <span>#{stats.rank}</span>
              <span className="text-white/60">/ {stats.totalElements}</span>
            </span>
          </motion.div>
        )}

        {/* "Less bad" badge — hidden in optimistic mode */}
        {!isOptimistic && !isMoreRedFlag && (
          <motion.div className="mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
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
