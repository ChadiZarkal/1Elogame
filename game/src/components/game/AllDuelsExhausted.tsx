'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useHaptics } from '@/lib/hooks';
import { DON_URL } from '@/config/contact';
import { useLangue } from '@/lib/i18n/LangueContexte';
import { cheminLocalise } from '@/lib/i18n/langue';
import { useTextesJeu } from './textes';

interface AllDuelsExhaustedProps {
  duelCount: number;
  onReset: () => void;
}

export function AllDuelsExhausted({ duelCount, onReset }: AllDuelsExhaustedProps) {
  const { tap, success } = useHaptics();
  const langue = useLangue();
  const t = useTextesJeu();

  const handleShare = () => {
    tap();
    const text = t.partageEpuise(duelCount);
    if (navigator.share) {
      navigator.share({ text, url: `${t.urlPartage}?ref=share` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + `\n${t.urlPartage}?ref=share`).catch(() => {});
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-var(--header-h,3rem))] px-6 pt-5 pb-[max(20px,env(safe-area-inset-bottom))] bg-[#0D0D0D]">
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
          {t.incroyable}
        </h1>
        
        <p className="text-[#A3A3A3] text-lg">
          {t.tousVusAvant}<strong className="text-[#F5F5F5]">{t.tousVusDuels(duelCount)}</strong>{t.tousVusApres}
        </p>
        
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
          <p className="text-[#737373] text-sm">
            {t.merci}
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
            {t.recommencer}
          </Button>
          <a
            href={cheminLocalise(langue, '/classement')}
            className="min-h-12 px-6 py-3 rounded-xl bg-[#1A1A1A] border border-[#333] text-[#A3A3A3] font-medium hover:border-[#FCD34D] hover:text-[#FCD34D] transition-all text-center flex items-center justify-center"
          >
            {t.voirClassement}
          </a>
          <button
            onClick={handleShare}
            className="px-6 py-3 rounded-xl bg-[#1A1A1A] border border-[#333] text-[#A3A3A3] font-medium hover:border-[#059669] hover:text-[#059669] transition-all"
          >
            {t.partagerScore}
          </button>
          <a
            href={DON_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-12 px-6 py-3 rounded-xl border border-[#FFC04D]/30 bg-[#FFC04D]/8 text-[#FFC04D] font-bold transition-colors hover:bg-[#FFC04D]/15 text-center flex items-center justify-center"
          >
            {t.offrirCafe}
          </a>
        </div>
      </motion.div>
    </div>
  );
}
