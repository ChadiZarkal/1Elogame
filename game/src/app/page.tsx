'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HubPage() {
  const router = useRouter();
  const [stats, setStats] = useState<{ totalVotes: number; estimatedPlayers: number } | null>(null);

  useEffect(() => {
    fetch('/api/stats/public')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-[100dvh] bg-[#0D0D0D] p-5 safe-area-top safe-area-bottom">
      {/* Version badge */}
      <div className="fixed top-4 right-4 z-50">
        <span className="px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#333] text-[#737373] text-xs font-mono">
          v3.4
        </span>
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center gap-3 text-5xl mb-4">
          <motion.span
            animate={{ rotate: [0, -12, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            🚩
          </motion.span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
          >
            🟢
          </motion.span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-[#F5F5F5] tracking-tight">
          Red <span className="text-[#DC2626]">FLAG</span> Games
        </h1>

        {/* Live stats */}
        {stats && (
          <motion.div
            className="flex justify-center gap-4 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-[#737373] text-sm">
              <span className="text-[#F5F5F5] font-bold">{stats.estimatedPlayers}</span> joueurs
            </span>
            <span className="text-[#333]">•</span>
            <span className="text-[#737373] text-sm">
              <span className="text-[#F5F5F5] font-bold">{stats.totalVotes.toLocaleString()}</span> votes
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Game cards */}
      <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-md">
        {/* Red Flag Test Game */}
        <motion.button
          onClick={() => window.location.href = 'https://redorgreen.fr/?quiz=quiz-sexualite'}
          className="relative text-left w-full rounded-2xl bg-gradient-to-br from-[#F97316]/15 to-[#EA580C]/5 bg-[#1A1A1A] border border-[#F97316]/30 hover:border-[#F97316] hover:shadow-[0_0_40px_rgba(249,115,22,0.25)] transition-all duration-300 cursor-pointer active:scale-[0.98] overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F97316]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🧪</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-[#F5F5F5]">Red Flag Test</h2>
                <p className="text-[#F97316] text-sm font-semibold mt-0.5">Es-tu un red flag ? Découvre-le</p>
              </div>
              <span className="text-[#F97316] text-2xl ml-2 flex-shrink-0">→</span>
            </div>

          </div>
        </motion.button>

        {/* Red Flag Game */}
        <motion.button
          onClick={() => router.push('/jeu')}
          className="relative text-left w-full rounded-2xl bg-gradient-to-br from-[#DC2626]/15 to-[#991B1B]/5 bg-[#1A1A1A] border border-[#DC2626]/30 hover:border-[#DC2626] hover:shadow-[0_0_40px_rgba(220,38,38,0.25)] transition-all duration-300 cursor-pointer active:scale-[0.98] overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#DC2626]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🚩</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-[#F5F5F5]">Red Flag</h2>
                <p className="text-[#DC2626] text-sm font-semibold mt-0.5">Choisis le pire entre deux options</p>
              </div>
              <span className="text-[#DC2626] text-2xl ml-2 flex-shrink-0">→</span>
            </div>

          </div>
        </motion.button>

        {/* Flag or Not Game */}
        <motion.button
          onClick={() => router.push('/flagornot')}
          className="relative text-left w-full rounded-2xl bg-gradient-to-br from-[#059669]/12 to-[#DC2626]/5 bg-[#1A1A1A] border border-[#333] hover:border-[#059669] hover:shadow-[0_0_40px_rgba(5,150,105,0.2)] transition-all duration-300 cursor-pointer active:scale-[0.98] overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#059669]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🤖</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-[#F5F5F5]">Flag or Not</h2>
                <p className="text-[#059669] text-sm font-semibold mt-0.5">Écris quelque chose, l&apos;IA décide</p>
              </div>
              <span className="text-[#059669] text-2xl ml-2 flex-shrink-0">→</span>
            </div>

          </div>
        </motion.button>
      </div>

      {/* Leaderboard CTA */}
      <motion.button
        onClick={() => router.push('/classement')}
        className="mt-8 pt-6 border-t-2 border-[#333] px-8 py-3 rounded-xl bg-[#1A1A1A] border-b border-[#333] hover:border-b-[#FCD34D]/50 hover:shadow-[0_0_20px_rgba(252,211,77,0.15)] transition-all text-[#A3A3A3] hover:text-[#FCD34D] text-sm font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.97 }}
      >
        🏆 Voir le classement
      </motion.button>


    </div>
  );
}

