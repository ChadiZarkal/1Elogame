'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Share2, Users, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { AnimatedGradientText } from '@/components/magicui/AnimatedGradientText';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { FlipWords } from '@/components/magicui/FlipWords';
import { Sparkles } from '@/components/magicui/Sparkles';
import { useReducedMotion, useHaptics } from '@/lib/hooks';
import { GAMES, GameCard } from '@/components/game/GameCard';

// ─── Main Page ─────────────────────────────────────────────
export default function HubPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { tap } = useHaptics();
  const [stats, setStats] = useState<{ totalVotes: number; estimatedPlayers: number } | null>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/stats/public')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {})
      .finally(() => setStatsLoaded(true));
  }, []);

  const handleNavigate = useCallback((href: string, external: boolean) => {
    if (external) window.open(href, '_blank', 'noopener,noreferrer');
    else router.push(href);
  }, [router]);

  const handleShare = useCallback(async () => {
    tap();
    if (navigator.share) {
      await navigator.share({
        title: 'Red Flag Games 🚩',
        text: 'Viens jouer au party game qui fait débat entre amis !',
        url: window.location.href,
      }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => {});
      toast('🔗 Lien copié !', { description: 'Partage avec tes amis', duration: 2000 });
    }
  }, [tap]);

  return (
    <div
      className="relative flex flex-col items-center min-h-screen min-h-[100dvh] overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <AnimatedBackground variant="default" />

      <main className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto px-4 sm:px-5 pt-10 pb-12 min-h-screen min-h-[100dvh]">

        {/* ─── Header ─── */}
        <motion.header
          className="w-full text-center mb-8"
          initial={reducedMotion ? undefined : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles color="#EF4444" count={4}>
              <motion.span
                className="text-3xl sm:text-4xl select-none"
                animate={reducedMotion ? undefined : { rotate: [0, -10, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
                role="img" aria-label="Red Flag"
              >
                🚩
              </motion.span>
            </Sparkles>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              <span style={{ color: 'var(--text-primary)' }}>Red </span>
              <AnimatedGradientText>FLAG</AnimatedGradientText>
              <span className="text-lg sm:text-xl font-bold ml-1.5" style={{ color: '#52525B' }}>Games</span>
            </h1>
          </div>

          <p className="text-sm font-medium" style={{ color: '#71717A' }}>
            <FlipWords
              words={[
                'Le party game qui fait débat entre amis 🔥',
                'Ose juger, vote et compare tes potes 🎯',
                'Red flag ou pas ? À toi de décider 🚩',
                'Le jeu qui met tes opinions à l\'épreuve 💥',
              ]}
              duration={4000}
            />
          </p>

          {/* Stats row */}
          {statsLoaded && stats && (
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Heart size={11} style={{ color: '#EF4444' }} />
                <span className="text-xs font-bold" style={{ color: '#EF4444' }}>
                  <AnimatedCounter value={stats.totalVotes} />
                </span>
                <span className="text-[10px]" style={{ color: '#52525B' }}>votes</span>
              </div>
              <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="flex items-center gap-1.5">
                <Users size={11} style={{ color: '#A1A1AA' }} />
                <span className="text-xs font-bold" style={{ color: '#A1A1AA' }}>
                  <AnimatedCounter value={stats.estimatedPlayers} />
                </span>
                <span className="text-[10px]" style={{ color: '#52525B' }}>joueurs</span>
              </div>
            </div>
          )}
        </motion.header>

        {/* ─── All 3 games — EQUAL level ─── */}
        <div className="w-full flex flex-col gap-3 mb-6" role="list" aria-label="Nos jeux">
          {GAMES.map((game, i) => (
            <GameCard
              key={game.id}
              game={game}
              index={i}
              onNavigate={handleNavigate}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        {/* ─── Action bar ─── */}
        <motion.div
          className="flex items-center gap-3 w-full"
          initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <button
            onClick={() => { tap(); router.push('/classement'); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm active:scale-[0.96]"
            style={{
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.20)',
              color: '#3B82F6',
              transition: 'all 0.2s ease',
            }}
          >
            <Trophy size={15} />
            Classement
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm active:scale-[0.96]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#52525B',
              transition: 'all 0.2s ease',
            }}
            aria-label="Partager le jeu"
          >
            <Share2 size={15} />
            Partager
          </button>
        </motion.div>

        {/* ─── Footer ─── */}
        <motion.footer
          className="mt-6 text-center"
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-[10px]" style={{ color: '#27272A' }}>
            Red Flag Games — v4.0
          </p>
        </motion.footer>
      </main>
    </div>
  );
}