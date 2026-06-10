'use client';

import { motion } from 'framer-motion';

interface GenderSelectProps {
  onSelect: (gender: 'homme' | 'femme' | 'autre') => void;
}

const options = [
  { value: 'homme' as const, label: 'Homme', emoji: '♂️' },
  { value: 'femme' as const, label: 'Femme', emoji: '♀️' },
  { value: 'autre' as const, label: 'Autre', emoji: '🤷' },
];

export function GenderSelect({ onSelect }: GenderSelectProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-sm"
      >
        <span className="text-5xl mb-4 block">🔮</span>
        <h2 className="text-2xl font-black text-[#FAFAFA] mb-2">
          Bienvenue sur l&apos;Oracle
        </h2>
        <p className="text-[#6B7280] text-sm mb-8">
          Avant de commencer, dis-nous qui tu es
        </p>

        <div className="space-y-3">
          {options.map((opt, i) => (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => onSelect(opt.value)}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.1)',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-[#FAFAFA] text-lg font-semibold">{opt.label}</span>
            </motion.button>
          ))}
        </div>

        <p className="text-[#4B5563] text-xs mt-6">
          Cette info est anonyme et sert uniquement aux stats
        </p>
      </motion.div>
    </div>
  );
}
