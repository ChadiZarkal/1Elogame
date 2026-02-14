'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const GAMES = [
  {
    href: 'https://redorgreen.fr/?quiz=quiz-sexualite',
    external: true,
    emoji: '🧪',
    title: 'Red Flag Test',
    subtitle: 'Es-tu un red flag ? Découvre-le',
    gradient: 'from-[#F97316]/15 to-[#EA580C]/5',
    border: '#F97316',
    tag: 'Populaire',
    tagColor: '#F97316',
  },
  {
    href: '/jeu',
    external: false,
    emoji: '🚩',
    title: 'Red Flag',
    subtitle: 'Choisis le pire entre deux options',
    gradient: 'from-[#DC2626]/15 to-[#991B1B]/5',
    border: '#DC2626',
    tag: 'Classique',
    tagColor: '#DC2626',
  },
  {
    href: '/flagornot',
    external: false,
    emoji: '🤖',
    title: 'Flag or Not',
    subtitle: "Écris quelque chose, l'IA décide",
    gradient: 'from-[#059669]/12 to-[#DC2626]/5',
    border: '#059669',
    tag: 'IA',
    tagColor: '#059669',
  },
];

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
          v3.6
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
        <p className="text-[#737373] text-sm mt-2 max-w-xs mx-auto">
          Party games mobiles gratuits — joue et débats avec tes amis
        </p>

        {/* Live stats */}
        {stats && (
          <motion.div
            className="flex justify-center items-center gap-4 mt-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-[#737373] text-sm text-center">
              <span className="text-[#F5F5F5] font-bold">{stats.estimatedPlayers}</span> joueurs
            </span>
            <span className="text-[#333]">•</span>
            <span className="text-[#737373] text-sm text-center">
              <span className="text-[#F5F5F5] font-bold">{stats.totalVotes.toLocaleString()}</span> votes
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Game cards */}
      <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-md">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.title}
            onClick={() => game.external ? window.location.href = game.href : router.push(game.href)}
            className={`relative text-left w-full rounded-2xl bg-gradient-to-br ${game.gradient} bg-[#1A1A1A] border transition-all duration-300 cursor-pointer active:scale-[0.98] overflow-hidden`}
            style={{ borderColor: `${game.border}30` }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.5 }}
            whileHover={{ borderColor: game.border, boxShadow: `0 0 40px ${game.border}25` }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${game.border}15` }}>
                  <span className="text-3xl">{game.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-[#F5F5F5]">{game.title}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: `${game.tagColor}20`, color: game.tagColor }}>
                      {game.tag}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: game.border }}>{game.subtitle}</p>
                </div>
                <span className="text-2xl ml-2 flex-shrink-0" style={{ color: game.border }}>→</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Leaderboard CTA */}
      <motion.button
        onClick={() => router.push('/classement')}
        className="mt-10 px-8 py-3 rounded-xl bg-[#1A1A1A] border border-[#333] hover:border-[#FCD34D]/50 hover:shadow-[0_0_20px_rgba(252,211,77,0.15)] transition-all text-[#A3A3A3] hover:text-[#FCD34D] text-sm font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.97 }}
      >
        🏆 Voir le classement
      </motion.button>

      {/* SEO-friendly footer with links */}
      <motion.footer
        className="mt-8 text-center text-[#737373] text-xs space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>Aucun compte requis • Données anonymes • 100% gratuit</p>
        <p className="text-[#555]">
          Red Flag Games — Le meilleur party game en ligne
        </p>
      </motion.footer>
    </div>
  );
}

