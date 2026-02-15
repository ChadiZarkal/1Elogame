'use client';

import { motion } from 'framer-motion';
import { ElementDTO } from '@/types/game';

interface DuelInterfaceProps {
  elementA: ElementDTO;
  elementB: ElementDTO;
  onVote: (winnerId: string, loserId: string) => void;
  disabled?: boolean;
}

export function DuelInterface({ elementA, elementB, onVote, disabled }: DuelInterfaceProps) {
  const handleClickA = () => {
    if (!disabled) {
      onVote(elementA.id, elementB.id);
    }
  };
  
  const handleClickB = () => {
    if (!disabled) {
      onVote(elementB.id, elementA.id);
    }
  };

  // Style NEUTRE pour les deux options - pas de biais couleur
  const neutralCardClass = `
    flex-1 flex items-center justify-center p-6 
    bg-[#1A1A1A] border border-[#333333]
    hover:bg-[#242424] hover:border-[#DC2626] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]
    active:bg-[#2A2A2A] active:scale-[0.98]
    transition-all duration-200 
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0D]">
      {/* Element A - Top half - NEUTRE */}
      <motion.button
        onClick={handleClickA}
        disabled={disabled}
        className={neutralCardClass}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <div className="text-center max-w-lg">
          <motion.p 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F5F5F5] leading-tight px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            {elementA.texte}
          </motion.p>
          <p className="mt-3 text-[#737373] text-xs uppercase tracking-widest font-medium">
            {elementA.categorie}
          </p>
        </div>
      </motion.button>
      
      {/* Divider VS */}
      <div className="relative h-0 z-20">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            className="bg-[#DC2626] rounded-full w-14 h-14 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)]"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
          >
            <span className="text-lg font-black text-white tracking-tight">VS</span>
          </motion.div>
        </div>
      </div>
      
      {/* Element B - Bottom half - NEUTRE */}
      <motion.button
        onClick={handleClickB}
        disabled={disabled}
        className={neutralCardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <div className="text-center max-w-lg">
          <motion.p 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F5F5F5] leading-tight px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            {elementB.texte}
          </motion.p>
          <p className="mt-3 text-[#737373] text-xs uppercase tracking-widest font-medium">
            {elementB.categorie}
          </p>
        </div>
      </motion.button>
    </div>
  );
}
