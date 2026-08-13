'use client';

import { motion } from 'framer-motion';

interface LoadingPhaseProps {
  loadingPhrase: string;
  submittedText: string;
}

export function LoadingPhase({ loadingPhrase, submittedText }: LoadingPhaseProps) {
  return (
    <motion.div
      key="loading"
      className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.22 }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 38%, rgba(139,92,246,0.16) 0%, transparent 62%)',
        }}
      />
      <div className="absolute inset-0 oracle-bg-dots opacity-8 pointer-events-none" />

      {/* Oracle orb with rings */}
      <div className="relative mb-10" style={{ width: 128, height: 128 }}>
        {/* Animated concentric rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              inset: 0,
              borderColor: i === 0
                ? 'rgba(139,92,246,0.6)'
                : i === 1
                ? 'rgba(6,182,212,0.35)'
                : 'rgba(139,92,246,0.2)',
              animationName: 'oracle-ring-pulse',
              animationDuration: `${1.6 + i * 0.45}s`,
              animationTimingFunction: 'ease-out',
              animationDelay: `${i * 0.38}s`,
              animationIterationCount: 'infinite',
            }}
          />
        ))}

        {/* Inner glowing orb */}
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          style={{ inset: 20 }}
          animate={{
            background: [
              'radial-gradient(circle, rgba(139,92,246,0.9) 0%, rgba(88,28,135,0.7) 100%)',
              'radial-gradient(circle, rgba(6,182,212,0.9) 0%, rgba(21,94,117,0.7) 100%)',
              'radial-gradient(circle, rgba(139,92,246,0.9) 0%, rgba(88,28,135,0.7) 100%)',
            ],
            boxShadow: [
              '0 0 40px rgba(139,92,246,0.55), 0 0 80px rgba(139,92,246,0.2)',
              '0 0 40px rgba(6,182,212,0.55), 0 0 80px rgba(6,182,212,0.2)',
              '0 0 40px rgba(139,92,246,0.55), 0 0 80px rgba(139,92,246,0.2)',
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🔮
          </motion.span>
        </motion.div>
      </div>

      {/* Loading phrase — gradient shimmer */}
      <motion.p
        className="text-[17px] font-black text-center mb-4 oracle-gradient-text tracking-tight"
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {loadingPhrase}
      </motion.p>

      {/* Dot loader */}
      <div className="flex gap-2.5 mb-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="oracle-dot"
            style={{
              background: i === 1 ? '#06B6D4' : '#7C3AED',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Submitted text */}
      <motion.div
        className="w-full max-w-xs rounded-2xl px-5 py-4 text-center oracle-glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <p className="text-[13px] text-[#6B7280] italic leading-relaxed">
          &quot;{submittedText}&quot;
        </p>
      </motion.div>
    </motion.div>
  );
}

