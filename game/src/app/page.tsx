'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Share2, ArrowRight, ExternalLink, Users, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GradientText } from '@/components/ui/GradientText';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useReducedMotion, useHaptics } from '@/lib/hooks';

// ─── Game config ───────────────────────────────────────────
const GAMES = [
  {
    id: 'red-flag',
    href: '/jeu',
    external: false,
    emoji: '🚩',
    label: 'LE CLASSIQUE',
    title: 'Red Flag',
    description: 'Choisis l\'option la plus red flag entre deux situations.',
    cta: 'Jouer maintenant',
    color: '#EF4444',
    colorDim: 'rgba(239,68,68,0.12)',
    colorBorder: 'rgba(239,68,68,0.25)',
    colorGlow: 'rgba(239,68,68,0.18)',
    players: '+ de 10k joueurs',
  },
  {
    id: 'flag-or-not',
    href: '/flagornot',
    external: false,
    emoji: '🤖',
    label: 'INTELLIGENCE ARTIFICIELLE',
    title: 'Flag or Not',
    description: 'Écris une situation — l\'IA juge si c\'est red flag ou non.',
    cta: 'Tester l\'IA',
    color: '#10B981',
    colorDim: 'rgba(16,185,129,0.10)',
    colorBorder: 'rgba(16,185,129,0.22)',
    colorGlow: 'rgba(16,185,129,0.15)',
    players: 'Powered by AI',
  },
  {
    id: 'red-flag-test',
    href: 'https://redorgreen.fr/?quiz=quiz-sexualite',
    external: true,
    emoji: '🧪',
    label: 'QUIZ PERSO',
    title: 'Red Flag Test',
    description: 'Réponds à ce quiz — découvre si TU es un red flag.',
    cta: 'Faire le test',
    color: '#F59E0B',
    colorDim: 'rgba(245,158,11,0.10)',
    colorBorder: 'rgba(245,158,11,0.22)',
    colorGlow: 'rgba(245,158,11,0.15)',
    players: 'Quiz interactif',
  },
] as const;

// ─── GameCard ──────────────────────────────────────────────
function GameCard({
  game,
  index,
  onNavigate,
  reducedMotion,
}: {
  game: (typeof GAMES)[number];
  index: number;
  onNavigate: (href: string, external: boolean) => void;
  reducedMotion: boolean;
}) {
  const { tap } = useHaptics();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={reducedMotion ? undefined : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { delay: 0.12 + index * 0.1, type: 'spring', stiffness: 280, damping: 22 }
      }
      whileHover={{ y: reducedMotion ? 0 : -3 }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => { tap(); onNavigate(game.href, game.external); }}
      className="w-full text-left rounded-2xl overflow-hidden relative cursor-pointer"
      style={{
        background: isHovered
          ? `linear-gradient(135deg, ${game.colorDim} 0%, rgba(18,18,22,0.98) 55%)`
          : `linear-gradient(135deg, ${game.color}09 0%, rgba(15,15,18,0.97) 60%)`,
        border: `1px solid ${isHovered ? game.colorBorder : `${game.color}22`}`,
        boxShadow: isHovered
          ? `0 10px 48px ${game.colorGlow}, 0 0 0 1px ${game.colorBorder}`
          : `0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 ${game.color}08`,
        transition: 'all 0.22s cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
      aria-label={`Jouer à ${game.title}`}
    >
      {/* Left color accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{
          background: `linear-gradient(to bottom, ${game.color}, ${game.color}40)`,
          opacity: isHovered ? 1 : 0.6,
          transition: 'opacity 0.25s',
        }}
      />

      <div className="px-5 py-[18px] pl-6">
        <div className="flex items-center gap-4">
          {/* Emoji bubble */}
          <div
            className="flex-shrink-0 w-13 h-13 rounded-2xl flex items-center justify-center text-3xl"
            style={{
              width: 52,
              height: 52,
              background: isHovered ? `${game.color}22` : `${game.color}18`,
              border: `1.5px solid ${isHovered ? game.colorBorder : `${game.color}30`}`,
              boxShadow: isHovered ? `0 0 18px ${game.color}33` : 'none',
              transition: 'all 0.22s ease',
            }}
          >
            {game.emoji}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            {/* Label chip */}
            <span
              className="inline-block text-[9px] font-black tracking-[0.14em] mb-1 px-2 py-[3px] rounded-full"
              style={{
                color: game.color,
                background: `${game.color}18`,
                border: `1px solid ${game.color}30`,
                letterSpacing: '0.14em',
              }}
            >
              {game.label}
            </span>
            {/* Title */}
            <h2
              className="text-[1.1rem] font-black tracking-tight leading-tight"
              style={{ color: '#F5F5F7' }}
            >
              {game.title}
            </h2>
            {/* Description */}
            <p className="text-[11px] mt-[3px] leading-relaxed" style={{ color: '#6B7280' }}>
              {game.description}
            </p>
          </div>

          {/* CTA arrow */}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: isHovered ? game.color : `${game.color}15`,
              color: isHovered ? '#fff' : game.color,
            }}
          >
            {game.external ? (
              <ExternalLink size={14} />
            ) : (
              <ArrowRight size={15} />
            )}
          </div>
        </div>

        {/* Bottom row: social proof */}
        <div className="flex items-center gap-1.5 mt-3 ml-16">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: game.color }} />
          <span className="text-[10px] font-medium" style={{ color: `${game.color}99` }}>
            {game.players}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

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

  const handleNavigate = (href: string, external: boolean) => {
    if (external) window.open(href, '_blank', 'noopener,noreferrer');
    else router.push(href);
  };

  const handleShare = async () => {
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
  };

  return (
    <div
      className="relative flex flex-col items-center min-h-screen min-h-[100dvh] overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Animated gradient orbs */}
      <AnimatedBackground variant="default" />

      {/* Version badge — top right */}
      <div className="fixed top-4 right-4 z-50">
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#52525B',
          }}
        >
          v3.8
        </span>
      </div>

      {/* ─── Main layout ─── */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg mx-auto px-5 py-12 min-h-screen min-h-[100dvh]">

        {/* ─── HERO ─── */}
        <motion.header
          className="w-full text-center mb-8"
          initial={reducedMotion ? undefined : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated emojis */}
          <div className="flex justify-center gap-5 mb-5">
            <motion.span
              className="text-5xl sm:text-6xl select-none"
              animate={reducedMotion ? undefined : { rotate: [0, -14, 14, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
              role="img" aria-label="Red Flag"
            >
              🚩
            </motion.span>
            <motion.span
              className="text-5xl sm:text-6xl select-none"
              animate={reducedMotion ? undefined : { scale: [1, 1.18, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3.5 }}
              role="img" aria-label="Green Flag"
            >
              🟢
            </motion.span>
          </div>

          {/* Main title */}
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-3">
            <span style={{ color: 'var(--text-primary)' }}>Red </span>
            <GradientText from="#EF4444" to="#F97316">FLAG</GradientText>
            <span style={{ color: 'var(--text-primary)' }}> Games</span>
          </h1>

          {/* Tagline */}
          <p className="text-base font-semibold mb-4" style={{ color: '#A1A1AA' }}>
            Le party game qui fait débat 🔥
          </p>

          {/* Trust pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { icon: '✅', text: 'Gratuit' },
              { icon: '⚡', text: 'Sans inscription' },
              { icon: '👥', text: 'Entre amis' },
            ].map(pill => (
              <span
                key={pill.text}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#71717A',
                }}
              >
                <span>{pill.icon}</span> {pill.text}
              </span>
            ))}
          </div>

          {/* Live stats */}
          {statsLoaded && stats && (
            <motion.div
              className="flex justify-center gap-3 mt-4"
              initial={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                <Users size={12} style={{ color: '#10B981' }} />
                <span className="text-sm font-bold" style={{ color: '#10B981' }}>
                  <AnimatedCounter value={stats.estimatedPlayers} />
                </span>
                <span className="text-xs" style={{ color: '#52525B' }}>joueurs</span>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <Heart size={12} style={{ color: '#EF4444' }} />
                <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
                  <AnimatedCounter value={stats.totalVotes} />
                </span>
                <span className="text-xs" style={{ color: '#52525B' }}>votes</span>
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* ─── GAME CARDS ─── */}
        <div className="w-full flex flex-col gap-3 mb-7" role="list" aria-label="Jeux disponibles">
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

        {/* ─── ACTION BAR ─── */}
        <motion.div
          className="flex items-center gap-3 w-full"
          initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <button
            onClick={() => { tap(); router.push('/classement'); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-250 active:scale-[0.97]"
            style={{
              background: 'rgba(245,158,11,0.10)',
              border: '1px solid rgba(245,158,11,0.25)',
              color: '#F59E0B',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.16)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.4)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.10)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.25)';
            }}
          >
            <Trophy size={16} />
            Classement
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-250 active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#71717A',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#F5F5F7';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#71717A';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
            }}
            aria-label="Partager le jeu"
          >
            <Share2 size={16} />
            Partager
          </button>
        </motion.div>

        {/* ─── FOOTER ─── */}
        <motion.footer
          className="mt-8 text-center"
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs" style={{ color: '#3F3F46' }}>
            Red Flag Games — Le meilleur party game en ligne
          </p>
        </motion.footer>
      </main>
    </div>
  );
}