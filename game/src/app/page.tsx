'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Share2, ArrowRight, ExternalLink, Users, Heart, Sparkles, ChevronDown, Play, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GradientText } from '@/components/ui/GradientText';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useReducedMotion, useHaptics, useIsMobile } from '@/lib/hooks';

// ─── First-visit detection ─────────────────────────────────
function useFirstVisit() {
  const [isFirst, setIsFirst] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('rf_visited')) {
      setIsFirst(true);
      localStorage.setItem('rf_visited', '1');
    }
  }, []);
  return isFirst;
}

// ─── Game config ───────────────────────────────────────────
const PRIMARY_GAME = {
  id: 'red-flag',
  href: '/jeu',
  external: false,
  emoji: '🚩',
  label: 'JEU PRINCIPAL',
  title: 'Red Flag',
  subtitle: 'Le classique',
  description: '2 situations. 1 choix. Laquelle est la pire ?',
  cta: 'Jouer maintenant',
  color: '#EF4444',
  colorDim: 'rgba(239,68,68,0.12)',
  colorBorder: 'rgba(239,68,68,0.30)',
  colorGlow: 'rgba(239,68,68,0.25)',
  players: '+ de 10k joueurs',
} as const;

const SECONDARY_GAMES = [
  {
    id: 'flag-or-not',
    href: '/flagornot',
    external: false,
    emoji: '🤖',
    title: 'Flag or Not',
    description: 'L\'IA juge ta situation',
    cta: 'Tester',
    color: '#10B981',
    colorDim: 'rgba(16,185,129,0.10)',
    colorBorder: 'rgba(16,185,129,0.22)',
    colorGlow: 'rgba(16,185,129,0.15)',
    badge: 'IA',
  },
  {
    id: 'red-flag-test',
    href: 'https://redorgreen.fr/?quiz=quiz-sexualite',
    external: true,
    emoji: '🧪',
    title: 'Red Flag Test',
    description: 'Es-tu un red flag ?',
    cta: 'Quiz',
    color: '#F59E0B',
    colorDim: 'rgba(245,158,11,0.10)',
    colorBorder: 'rgba(245,158,11,0.22)',
    colorGlow: 'rgba(245,158,11,0.15)',
    badge: 'QUIZ',
  },
] as const;

// ─── How-to-play steps ─────────────────────────────────────
const STEPS = [
  { emoji: '👆', title: 'Choisis', desc: 'La pire des 2 situations' },
  { emoji: '📊', title: 'Compare', desc: 'Avec les autres joueurs' },
  { emoji: '🔥', title: 'Enchaîne', desc: 'Le streak monte !' },
] as const;

// ─── Primary Hero Card ─────────────────────────────────────
function HeroCard({
  onPlay,
  reducedMotion,
  stats,
}: {
  onPlay: () => void;
  reducedMotion: boolean;
  stats: { totalVotes: number; estimatedPlayers: number } | null;
}) {
  const { tap } = useHaptics();

  return (
    <motion.div
      initial={reducedMotion ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
      className="w-full rounded-3xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(145deg, rgba(239,68,68,0.08) 0%, rgba(15,15,18,0.98) 50%, rgba(249,115,22,0.05) 100%)',
        border: '1px solid rgba(239,68,68,0.20)',
        boxShadow: '0 8px 40px rgba(239,68,68,0.12), 0 0 0 1px rgba(239,68,68,0.06)',
      }}
    >
      {/* Glow orb behind card */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative px-6 pt-7 pb-6">
        {/* Top label */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.16em] px-2.5 py-1 rounded-full"
            style={{
              color: '#EF4444',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <Sparkles size={10} />
            JEU PRINCIPAL
          </span>
          {stats && (
            <span className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: '#52525B' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <AnimatedCounter value={stats.estimatedPlayers} /> en ligne
            </span>
          )}
        </div>

        {/* Emoji + title row */}
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
            animate={reducedMotion ? undefined : { rotate: [0, -8, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2 }}
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1.5px solid rgba(239,68,68,0.30)',
              boxShadow: '0 0 24px rgba(239,68,68,0.20)',
            }}
          >
            🚩
          </motion.div>
          <div className="flex-1">
            <h2
              className="text-2xl font-black tracking-tight leading-none"
              style={{ color: '#F5F5F7' }}
            >
              Red Flag
            </h2>
            <p className="text-sm mt-1 font-medium" style={{ color: '#6B7280' }}>
              2 situations. 1 choix. Laquelle est la pire ?
            </p>
          </div>
        </div>

        {/* Big CTA button */}
        <motion.button
          onClick={() => { tap(); onPlay(); }}
          whileTap={{ scale: 0.96 }}
          className="hero-cta-pulse w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base cursor-pointer relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#fff',
            boxShadow: '0 4px 24px rgba(239,68,68,0.40), 0 0 0 1px rgba(239,68,68,0.50)',
            minHeight: 56,
          }}
          aria-label="Jouer à Red Flag"
        >
          <Play size={20} fill="#fff" />
          Jouer maintenant
          <ArrowRight size={18} className="ml-1" />
        </motion.button>

        {/* Quick stats row */}
        {stats && (
          <div className="flex items-center justify-center gap-4 mt-4">
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
      </div>
    </motion.div>
  );
}

// ─── How‑to‑Play Section ───────────────────────────────────
function HowToPlay({ reducedMotion }: { reducedMotion: boolean }) {
  const [open, setOpen] = useState(false);
  const isFirst = useFirstVisit();

  // Auto-open for first-time visitors
  useEffect(() => {
    if (isFirst) setOpen(true);
  }, [isFirst]);

  return (
    <motion.div
      initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
      className="w-full"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        aria-expanded={open}
        aria-controls="how-to-play"
      >
        <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#A1A1AA' }}>
          <Zap size={14} style={{ color: '#F59E0B' }} />
          Comment ça marche ?
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: '#52525B' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="how-to-play"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-2 pt-3">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className="flex flex-col items-center text-center px-2 py-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span className="text-2xl mb-1.5">{step.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: '#F5F5F7' }}>{step.title}</span>
                  <span className="text-[10px] mt-0.5 leading-tight" style={{ color: '#52525B' }}>{step.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Secondary Game Card ───────────────────────────────────
function SecondaryCard({
  game,
  index,
  onNavigate,
  reducedMotion,
}: {
  game: (typeof SECONDARY_GAMES)[number];
  index: number;
  onNavigate: (href: string, external: boolean) => void;
  reducedMotion: boolean;
}) {
  const { tap } = useHaptics();

  return (
    <motion.button
      initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { delay: 0.3 + index * 0.08, type: 'spring', stiffness: 260, damping: 22 }
      }
      whileTap={{ scale: 0.96 }}
      onClick={() => { tap(); onNavigate(game.href, 'external' in game && game.external); }}
      className="flex-1 flex flex-col items-center text-center p-4 rounded-2xl cursor-pointer group relative overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${game.colorDim} 0%, rgba(15,15,18,0.97) 70%)`,
        border: `1px solid ${game.colorBorder}`,
        minHeight: 140,
        transition: 'all 0.22s ease',
      }}
      aria-label={`Jouer à ${game.title}`}
    >
      {/* Badge */}
      <span
        className="absolute top-2.5 right-2.5 text-[8px] font-black tracking-[0.12em] px-2 py-[2px] rounded-full"
        style={{
          color: game.color,
          background: `${game.color}18`,
          border: `1px solid ${game.color}30`,
        }}
      >
        {game.badge}
      </span>

      {/* Emoji */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2.5"
        style={{
          background: `${game.color}14`,
          border: `1px solid ${game.color}25`,
        }}
      >
        {game.emoji}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold mb-0.5" style={{ color: '#F5F5F7' }}>{game.title}</h3>
      <p className="text-[10px] leading-snug mb-3" style={{ color: '#6B7280' }}>{game.description}</p>

      {/* CTA pill */}
      <div
        className="mt-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
        style={{
          background: `${game.color}18`,
          color: game.color,
          border: `1px solid ${game.color}30`,
        }}
      >
        {game.cta}
        {'external' in game && game.external ? <ExternalLink size={10} /> : <ArrowRight size={11} />}
      </div>
    </motion.button>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function HubPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
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

  const handlePlay = useCallback(() => {
    tap();
    router.push('/jeu');
  }, [tap, router]);

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
      {/* Animated gradient orbs */}
      <AnimatedBackground variant="default" />

      {/* ─── Main layout ─── */}
      <main className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto px-4 sm:px-5 pt-10 pb-28 min-h-screen min-h-[100dvh]">

        {/* ─── COMPACT HERO ─── */}
        <motion.header
          className="w-full text-center mb-6"
          initial={reducedMotion ? undefined : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title row — compact on mobile */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <motion.span
              className="text-3xl sm:text-4xl select-none"
              animate={reducedMotion ? undefined : { rotate: [0, -10, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
              role="img" aria-label="Red Flag"
            >
              🚩
            </motion.span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              <span style={{ color: 'var(--text-primary)' }}>Red </span>
              <GradientText from="#EF4444" to="#F97316">FLAG</GradientText>
              <span className="text-lg sm:text-xl font-bold ml-1.5" style={{ color: '#52525B' }}>Games</span>
            </h1>
          </div>

          <p className="text-sm font-medium" style={{ color: '#71717A' }}>
            Le party game qui fait débat entre amis 🔥
          </p>

          {/* Compact trust pills */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {['✅ Gratuit', '⚡ Sans inscription', '👥 Multijoueur'].map(pill => (
              <span
                key={pill}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#52525B',
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        </motion.header>

        {/* ─── HERO CARD (primary game) ─── */}
        <div className="w-full mb-4">
          <HeroCard
            onPlay={handlePlay}
            reducedMotion={reducedMotion}
            stats={statsLoaded ? stats : null}
          />
        </div>

        {/* ─── HOW TO PLAY ─── */}
        <div className="w-full mb-5">
          <HowToPlay reducedMotion={reducedMotion} />
        </div>

        {/* ─── SECONDARY GAMES (2-col grid) ─── */}
        <motion.div
          className="w-full mb-5"
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase mb-3 px-1" style={{ color: '#3F3F46' }}>
            Autres jeux
          </p>
          <div className="grid grid-cols-2 gap-3" role="list" aria-label="Autres jeux">
            {SECONDARY_GAMES.map((game, i) => (
              <SecondaryCard
                key={game.id}
                game={game}
                index={i}
                onNavigate={handleNavigate}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </motion.div>

        {/* ─── ACTION BAR ─── */}
        <motion.div
          className="flex items-center gap-3 w-full"
          initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <button
            onClick={() => { tap(); router.push('/classement'); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm active:scale-[0.96]"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.20)',
              color: '#F59E0B',
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

        {/* ─── FOOTER ─── */}
        <motion.footer
          className="mt-6 text-center"
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-[10px]" style={{ color: '#27272A' }}>
            Red Flag Games — v3.9
          </p>
        </motion.footer>
      </main>

      {/* ─── FLOATING BOTTOM CTA (mobile-only) ─── */}
      {isMobile && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div
            className="mx-4 mb-3 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(10,10,11,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(239,68,68,0.15)',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(239,68,68,0.08)',
            }}
          >
            <button
              onClick={handlePlay}
              className="hero-cta-pulse w-full flex items-center justify-center gap-2.5 py-3.5 font-black text-sm cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#fff',
              }}
              aria-label="Lancer une partie Red Flag"
            >
              <Play size={16} fill="#fff" />
              Jouer à Red Flag
              <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}