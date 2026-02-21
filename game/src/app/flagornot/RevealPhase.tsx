'use client';

import { motion } from 'framer-motion';
import type { JudgmentResult } from './constants';

interface RevealPhaseProps {
  result: JudgmentResult;
  submittedText: string;
  showJustification: boolean;
  isMounted: boolean;
  redCount: number;
  greenCount: number;
  historyLength: number;
  onShare: () => void;
  onNext: () => void;
}

const RED_EMOJIS = ['🚩', '💀', '😱', '⛔', '🔥', '💔', '😬'];
const GREEN_EMOJIS = ['🟢', '✨', '💚', '🌟', '🎉', '💫', '🥳'];

export function RevealPhase({
  result,
  submittedText,
  showJustification,
  isMounted,
  redCount,
  greenCount,
  historyLength,
  onShare,
  onNext,
}: RevealPhaseProps) {
  const isRed = result.verdict === 'red';
  const emojis = isRed ? RED_EMOJIS : GREEN_EMOJIS;
  const color = isRed ? '#EF4444' : '#10B981';

  return (
    <motion.div
      key="reveal"
      className="flex-1 flex flex-col items-center px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Particle burst */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * 360 + Math.random() * 20;
          const rad = (angle * Math.PI) / 180;
          const dist = 90 + Math.random() * 100;
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-[30%] text-lg"
              style={{ marginLeft: '-9px', marginTop: '-9px' }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(rad) * dist,
                y: Math.sin(rad) * dist,
                opacity: 0,
                scale: 0.15,
                rotate: Math.random() * 400 - 200,
              }}
              transition={{ duration: 1.1, delay: 0.15 + i * 0.03, ease: 'easeOut' }}
            >
              {emojis[i % emojis.length]}
            </motion.span>
          );
        })}
      </div>

      {/* Main verdict */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md">
        <motion.h2
          className={`text-[40px] sm:text-5xl font-black tracking-tight mb-5 ${
            isRed ? 'text-[#EF4444]' : 'text-[#10B981]'
          }`}
          initial={{ opacity: 0, y: 25, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 250, damping: 20 }}
          style={{
            textShadow: `0 0 50px ${color}66, 0 0 100px ${color}26`,
          }}
        >
          {isRed ? 'RED FLAG' : 'GREEN FLAG'}
        </motion.h2>

        <motion.p
          className="text-[#9CA3AF] text-base italic text-center mb-5 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          &quot;{submittedText}&quot;
        </motion.p>

        {isMounted && showJustification && (
          <motion.div
            className="w-full rounded-2xl p-5 text-center glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{ border: `1px solid ${color}33` }}
          >
            <p className="text-[#D1D5DB] text-[15px] leading-relaxed">{result.justification}</p>
          </motion.div>
        )}

        <motion.button
          onClick={onShare}
          className="mt-4 px-4 py-2 rounded-xl text-xs text-[#9CA3AF] bg-[#1A1A1A] border border-[#333] hover:border-[#555] hover:text-white transition-all active:scale-95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          📤 Partager le résultat
        </motion.button>
      </div>

      {/* Encore! button */}
      <motion.div
        className="w-full max-w-md pb-[max(16px,env(safe-area-inset-bottom))] pt-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
      >
        <motion.button
          onClick={onNext}
          className={`w-full py-[18px] rounded-2xl font-bold text-[17px] text-white active:scale-[0.97] transition-transform ${
            isRed
              ? 'bg-[#EF4444] shadow-[0_0_35px_rgba(239,68,68,0.35)]'
              : 'bg-[#10B981] shadow-[0_0_35px_rgba(16,185,129,0.35)]'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          Encore ! 🔥
        </motion.button>
      </motion.div>

      {/* Progress bar */}
      {historyLength > 1 && (
        <motion.div
          className="w-full max-w-md pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="h-1 rounded-full bg-[#1A1A1A] overflow-hidden flex">
            <motion.div
              className="h-full bg-[#EF4444]"
              animate={{ width: `${(redCount / historyLength) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="h-full bg-[#10B981]"
              animate={{ width: `${(greenCount / historyLength) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
