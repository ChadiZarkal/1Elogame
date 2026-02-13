'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const games = [
  {
    id: 'redflag',
    title: 'Red Flag',
    subtitle: 'Le duel des Red Flags',
    description:
      'Entre deux choix, lequel est le plus gros Red Flag ? Vote et découvre ce que pensent les autres !',
    emoji: '🚩',
    href: '/redflag',
    gradient: 'from-[#DC2626]/20 to-[#991B1B]/10',
    borderColor: 'border-[#DC2626]/40',
    hoverBorder: 'hover:border-[#DC2626]',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]',
    accentText: 'text-[#DC2626]',
    tags: ['🎲 Infini', '⚡ Instant', '📊 Stats live'],
  },
  {
    id: 'flagornot',
    title: 'Red Flag ou Green Flag ?',
    subtitle: "L'IA te juge",
    description:
      "Écris n'importe quoi et découvre si c'est plutôt Red Flag 🚩 ou Green Flag 🟢 selon l'IA !",
    emoji: '🤖',
    href: '/flagornot',
    gradient: 'from-[#059669]/20 to-[#DC2626]/10',
    borderColor: 'border-[#333]',
    hoverBorder: 'hover:border-[#059669]',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(5,150,105,0.3)]',
    accentText: 'text-[#059669]',
    tags: ['🤖 IA', '✍️ Libre', '😂 Fun'],
  },
];

export default function HubPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-[100dvh] bg-[#0D0D0D] p-5 safe-area-top safe-area-bottom">
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center gap-3 text-4xl mb-3">
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            🚩
          </motion.span>
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
          >
            🟢
          </motion.span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F5] tracking-tight">
          FLAG <span className="text-[#DC2626]">GAMES</span>
        </h1>
        <p className="text-[#737373] text-base mt-2">
          Choisis ton jeu et amuse-toi 🎉
        </p>
      </motion.div>

      {/* Game cards */}
      <div className="flex flex-col gap-5 w-full max-w-md">
        {games.map((game, i) => (
          <motion.button
            key={game.id}
            onClick={() => router.push(game.href)}
            className={`
              relative text-left w-full p-6 rounded-2xl
              bg-gradient-to-br ${game.gradient}
              bg-[#1A1A1A] border ${game.borderColor}
              ${game.hoverBorder} ${game.hoverShadow}
              transition-all duration-300 cursor-pointer
              active:scale-[0.98]
            `}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">{game.emoji}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[#F5F5F5]">
                  {game.title}
                </h2>
                <p className={`text-sm font-medium ${game.accentText} mt-0.5`}>
                  {game.subtitle}
                </p>
                <p className="text-[#A3A3A3] text-sm mt-2 leading-relaxed">
                  {game.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-[#0D0D0D]/60 text-[#737373] border border-[#333]/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[#737373] text-xl ml-2 flex-shrink-0 self-center">
                →
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Leaderboard CTA */}
      <motion.button
        onClick={() => router.push('/classement')}
        className="mt-6 px-6 py-3 rounded-xl bg-[#1A1A1A] border border-[#333] hover:border-[#FCD34D]/50 hover:shadow-[0_0_20px_rgba(252,211,77,0.15)] transition-all text-[#A3A3A3] hover:text-[#FCD34D] text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.97 }}
      >
        🏆 Voir le classement
      </motion.button>

      {/* Footer */}
      <motion.footer
        className="mt-8 text-[#737373] text-xs text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Aucun compte requis • Données anonymes
      </motion.footer>
    </div>
  );
}
