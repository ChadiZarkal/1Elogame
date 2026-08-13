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

function particleJitter(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

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
  const primaryColor = isRed ? '#EF4444' : '#10B981';
  const accentColor = isRed ? '#FCA5A5' : '#6EE7B7';
  const bgGlow = isRed
    ? 'radial-gradient(ellipse at 50% 18%, rgba(239,68,68,0.22) 0%, rgba(127,29,29,0.08) 48%, transparent 72%)'
    : 'radial-gradient(ellipse at 50% 18%, rgba(16,185,129,0.22) 0%, rgba(6,78,59,0.08) 48%, transparent 72%)';

  const redParticles = ['🚩', '💀', '⛔', '🔥', '😱', '💔', '😬', '🫠'];
  const greenParticles = ['✅', '💚', '✨', '🌟', '🎉', '💫', '🥳', '🌿'];
  const particles = isRed ? redParticles : greenParticles;

  return (
    <motion.div
      key="reveal"
      className="flex-1 flex flex-col items-center px-5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: bgGlow }} />
      <div className="absolute inset-0 oracle-bg-dots opacity-8 pointer-events-none" />

      {/* Particle burst on mount */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * 360 + particleJitter(i + 1) * 22;
          const rad = (angle * Math.PI) / 180;
          const dist = 90 + particleJitter(i + 101) * 130;
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 text-lg"
              style={{ top: '30%', marginLeft: '-9px', marginTop: '-9px' }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(rad) * dist,
                y: Math.sin(rad) * dist,
                opacity: 0,
                scale: 0.08,
                rotate: particleJitter(i + 201) * 360 - 180,
              }}
              transition={{ duration: 1.1, delay: 0.1 + i * 0.018, ease: 'easeOut' }}
            >
              {particles[i % particles.length]}
            </motion.span>
          );
        })}
      </div>

      {/* Main verdict content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-sm py-6">

        {/* Big verdict icon */}
        <motion.span
          className="text-7xl mb-4 block"
          initial={{ opacity: 0, scale: 0.4, rotate: -18 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.14, type: 'spring', stiffness: 300, damping: 18 }}
        >
          {isRed ? '🚩' : '✅'}
        </motion.span>

        {/* VERDICT text — massive & glowing */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 22, scale: 0.82 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.24, type: 'spring', stiffness: 200, damping: 20 }}
        >
          <p
            className="text-[52px] font-black tracking-tighter leading-none"
            style={{
              color: primaryColor,
              textShadow: `0 0 50px ${primaryColor}99, 0 0 100px ${primaryColor}33`,
            }}
          >
            {isRed ? 'RED' : 'GREEN'}
          </p>
          <p
            className="text-[52px] font-black tracking-tighter leading-none"
            style={{
              color: accentColor,
              textShadow: `0 0 35px ${primaryColor}66`,
            }}
          >
            FLAG
          </p>
        </motion.div>

        {/* Submitted text */}
        <motion.p
          className="text-[#6B7280] text-[13px] italic text-center mb-5 px-3 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34 }}
        >
          &quot;{submittedText}&quot;
        </motion.p>

        {/* Justification card */}
        {isMounted && showJustification && (
          <motion.div
            className="w-full rounded-3xl p-5 mb-4 oracle-glass"
            style={{ border: `1px solid ${primaryColor}33` }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
          >
            {/* Accent header */}
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: primaryColor, boxShadow: `0 0 10px ${primaryColor}` }}
              />
              <span
                className="text-[10px] font-black uppercase tracking-[0.2em]"
                style={{ color: primaryColor }}
              >
                Analyse de l&apos;Oracle
              </span>
            </div>
            <p className="text-[#D1D5DB] text-[13px] leading-relaxed">{result.justification}</p>
          </motion.div>
        )}

        {/* Persistence warning */}
        {result.persistenceWarning && (
          <motion.div
            className="mb-4 w-full rounded-2xl border border-amber-500/30 px-4 py-3"
            style={{ background: 'rgba(245,158,11,0.06)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.54 }}
          >
            <p className="text-[12px] text-amber-200 leading-relaxed">{result.persistenceWarning}</p>
          </motion.div>
        )}

        {/* Share button */}
        <motion.button
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: '#9CA3AF',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.94 }}
        >
          {/* Share icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Partager le verdict
        </motion.button>
      </div>

      {/* Encore CTA */}
      <motion.div
        className="w-full max-w-sm pb-[max(20px,env(safe-area-inset-bottom))] pt-2"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.58, type: 'spring', stiffness: 180, damping: 20 }}
      >
        <motion.button
          onClick={onNext}
          whileTap={{ scale: 0.96 }}
          className="w-full py-4.5 rounded-2xl font-black text-[17px] text-white tracking-wide"
          style={{
            background: isRed
              ? 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)'
              : 'linear-gradient(135deg, #10B981 0%, #065F46 100%)',
            boxShadow: isRed
              ? '0 0 42px rgba(239,68,68,0.38), 0 8px 32px rgba(0,0,0,0.32)'
              : '0 0 42px rgba(16,185,129,0.38), 0 8px 32px rgba(0,0,0,0.32)',
          }}
        >
          Encore 🔮
        </motion.button>

        {/* Stats bar */}
        {historyLength > 1 && (
          <motion.div
            className="mt-3 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.78 }}
          >
            <div className="flex justify-between text-[10px] text-[#4B5563] mb-1.5 font-semibold">
              <span>🚩 {redCount} red flag{redCount > 1 ? 's' : ''}</span>
              <span>✅ {greenCount} green flag{greenCount > 1 ? 's' : ''}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full"
                style={{ background: 'linear-gradient(90deg, #EF4444, #DC2626)', borderRadius: '9999px 0 0 9999px' }}
                animate={{ width: `${(redCount / historyLength) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              <motion.div
                className="h-full"
                style={{ background: 'linear-gradient(90deg, #059669, #10B981)', borderRadius: '0 9999px 9999px 0' }}
                animate={{ width: `${(greenCount / historyLength) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
