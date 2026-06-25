'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useHaptics } from '@/lib/hooks';

interface AllDuelsExhaustedProps {
  duelCount: number;
  onReset: () => void;
}

export function AllDuelsExhausted({ duelCount, onReset }: AllDuelsExhaustedProps) {
  const { tap, success } = useHaptics();

  const handleShare = () => {
    tap();
    const text = `🚩 J'ai participé à ${duelCount} duels sur Red or Green !\nEt toi, tu as combien de Red Flags ? 👀`;
    if (navigator.share) {
      navigator.share({ text, url: 'https://redorgreen.fr/jeu?ref=share' }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + '\nhttps://redorgreen.fr/jeu?ref=share').catch(() => {});
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 pt-[max(20px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))] bg-[#0D0D0D]">
      <motion.div
        className="text-center space-y-6 max-w-md"
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
        
        <p className="text-[#A3A3A3] text-lg">
          Tu as vu tous les duels possibles ! Tu as participé à <strong className="text-[#F5F5F5]">{duelCount} duels</strong>.
        </p>
        
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
          <p className="text-[#737373] text-sm">
            Merci d&apos;avoir joué ! Reviens plus tard pour découvrir de nouveaux éléments.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => {
              success();
              onReset();
            }}
            variant="primary"
            size="lg"
            className="min-h-12"
          >
            🔄 Recommencer
          </Button>
          <a
            href="/classement"
            className="min-h-12 px-6 py-3 rounded-xl bg-[#1A1A1A] border border-[#333] text-[#A3A3A3] font-medium hover:border-[#FCD34D] hover:text-[#FCD34D] transition-all text-center flex items-center justify-center"
          >
            🏆 Voir le classement
          </a>
          <button
            onClick={handleShare}
            className="px-6 py-3 rounded-xl bg-[#1A1A1A] border border-[#333] text-[#A3A3A3] font-medium hover:border-[#059669] hover:text-[#059669] transition-all"
          >
            📤 Partager mon score
          </button>
        </div>
      </motion.div>
    </div>
  );
}
