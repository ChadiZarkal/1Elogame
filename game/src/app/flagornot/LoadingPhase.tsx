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
      className="flex-1 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative w-28 h-28 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: [
              'radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)',
            ],
            scale: [1, 1.4, 1],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 40px rgba(239,68,68,0.2)',
              '0 0 60px rgba(16,185,129,0.2)',
              '0 0 40px rgba(239,68,68,0.2)',
            ],
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-5xl"
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🤖
        </motion.div>
      </div>

      <motion.p
        className="text-[#9CA3AF] text-lg text-center font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {loadingPhrase}
      </motion.p>

      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: ['#4B5563', '#EF4444', '#10B981', '#4B5563'],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      <motion.p
        className="text-[#4B5563] text-sm italic mt-8 text-center max-w-[280px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        &quot;{submittedText}&quot;
      </motion.p>
    </motion.div>
  );
}
