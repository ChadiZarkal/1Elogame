'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/stores/gameStore';

export default function RedFlagHome() {
  const router = useRouter();
  const { clearProfile } = useGameStore();

  // Always clear profile on page load to force re-entry
  useEffect(() => {
    clearProfile();
  }, [clearProfile]);

  const handlePlay = () => {
    router.push('/jeu');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-[100dvh] bg-[#0D0D0D] p-6">
      {/* Back to Hub */}
      <motion.button
        onClick={() => router.push('/')}
        className="absolute top-5 left-5 text-[#737373] hover:text-[#F5F5F5] transition-colors text-sm flex items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        ← Accueil
      </motion.button>

      <motion.div
        className="text-center space-y-8 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <div className="flex justify-center gap-4 text-6xl mb-4">
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              🚩
            </motion.span>
          </div>

          <h1 className="text-5xl font-black text-[#F5F5F5] tracking-tight">
            RED <span className="text-[#DC2626]">FLAG</span>
          </h1>

          <p className="text-[#737373] text-lg mt-2">Le party game qui fait débat 🔥</p>
        </motion.div>

        <motion.div
          className="bg-[#1A1A1A] border border-[#333] rounded-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[#F5F5F5] text-lg leading-relaxed">
            Entre deux choix, lequel est le plus gros{' '}
            <strong className="text-[#DC2626]">Red Flag</strong> ?
          </p>
          <p className="text-[#A3A3A3] mt-2">
            Découvre ce que pensent les autres et débat avec tes amis ! 🎉
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handlePlay}
            variant="primary"
            size="lg"
            className="w-full text-xl py-6"
          >
            🚩 C'EST PARTI
          </Button>

          {/* No persistent session message since we always ask */}
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#333]">
            <span className="text-2xl">⚡</span>
            <p className="text-[#A3A3A3] text-xs mt-1">Instant</p>
          </div>
          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#333]">
            <span className="text-2xl">🎲</span>
            <p className="text-[#A3A3A3] text-xs mt-1">Infini</p>
          </div>
          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#333]">
            <span className="text-2xl">🔒</span>
            <p className="text-[#A3A3A3] text-xs mt-1">Anonyme</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.footer
        className="absolute bottom-4 text-[#737373] text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Aucun compte requis • Données anonymes
      </motion.footer>
    </div>
  );
}
