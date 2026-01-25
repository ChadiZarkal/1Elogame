'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface AllDuelsExhaustedProps {
  duelCount: number;
  onReset: () => void;
}

export function AllDuelsExhausted({ duelCount, onReset }: AllDuelsExhaustedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#0D0D0D]">
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span 
          className="text-8xl block"
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
        >
          🎉
        </motion.span>
        
        <h1 className="text-3xl font-bold text-[#F5F5F5]">
          Incroyable !
        </h1>
        
        <p className="text-[#A3A3A3] text-lg max-w-md">
          Tu as vu tous les duels possibles ! Tu as participé à <strong className="text-[#F5F5F5]">{duelCount} duels</strong>.
        </p>
        
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
          <p className="text-[#737373] text-sm">
            Merci d&apos;avoir joué ! Reviens plus tard pour découvrir de nouveaux éléments.
          </p>
        </div>
        
        <Button
          onClick={onReset}
          variant="primary"
          size="lg"
          className="mt-4"
        >
          🔄 Recommencer
        </Button>
      </motion.div>
    </div>
  );
}
