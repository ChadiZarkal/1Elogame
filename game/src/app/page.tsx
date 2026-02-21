'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Share2, ArrowRight, ExternalLink, Users, Heart, Play } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { AnimatedGradientText } from '@/components/magicui/AnimatedGradientText';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { FlipWords } from '@/components/magicui/FlipWords';
import { Sparkles } from '@/components/magicui/Sparkles';
import { useReducedMotion, useHaptics } from '@/lib/hooks';

// ─── Game config — all 3 games at the SAME level ───────────
const GAMES = [
  {
    id: 'red-flag',
    href: '/jeu',
    external: false,
    emoji: '🚩',
    badge: 'DUEL',
    title: 'Red Flag',
    description: '2 situations. 1 choix. Lequel est le plus red flag ?',
    cta: 'Jouer',
    color: '#EF4444',
    colorDim: 'rgba(239,68,68,0.10)',
    colorBorder: 'rgba(239,68,68,0.25)',
  },
  {
    id: 'flag-or-not',
    href: '/flagornot',
    external: false,
    emoji: '🤖',
    badge: 'IA',
    title: 'Flag or Not',
    description: "L'IA juge ta situation",
    cta: 'Tester',
    color: '#10B981',
    colorDim: 'rgba(16,185,129,0.10)',
    colorBorder: 'rgba(16,185,129,0.25)',
  },
  {
    id: 'red-flag-test',
    href: 'https://redorgreen.fr/?quiz=quiz-sexualite',
    external: true,
    emoji: '🧪',
    badge: 'QUIZ',
    title: 'Red Flag Test',
    description: 'Es-tu un red flag ?',
    cta: 'Quiz',
    color: '#A855F7',
    colorDim: 'rgba(168,85,247,0.10)',
    colorBorder: 'rgba(168,85,247,0.25)',
  },
] as const;

// ─── Game Card (equal for all 3) with 3D tilt ─────────────
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
  const cardRef = useRef<HTMLButtonElement>(null);

  // 3D tilt on pointer move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) scale(1.02)`;
  }, [reducedMotion]);

  const handlePointerLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
    }
  }, []);

  return (
    <motion.button
      initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { delay: 0.15 + index * 0.1, type: 'spring', stiffness: 240, damping: 22 }
      }
      whileTap={{ scale: 0.96 }}
      onClick={() => { tap(); onNavigate(game.href, game.external); }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      ref={cardRef}
      className="w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer group relative overflow-hidden text-left"
      style={{
        background: `linear-gradient(145deg, ${game.colorDim} 0%, rgba(15,15,18,0.97) 70%)`,
        border: `1px solid ${game.colorBorder}`,
        transition: 'transform 0.15s ease-out, box-shadow 0.22s ease',
        willChange: 'transform',
      }}
      aria-label={`Jouer à ${game.title}`}
    >
      {/* Animated border beam on hover */}
      <BorderBeam colorFrom={game.color} colorTo={`${game.color}88`} duration={8 + index * 2} />
      {/* Badge */}
      <span
        className="absolute top-2.5 right-2.5 text-[10px] font-black tracking-[0.12em] px-2 py-[2px] rounded-full"
        style={{
          color: game.color,
          background: `${game.color}18`,
          border: `1px solid ${game.color}30`,
        }}
      >
        {game.badge}
      </span>

      {/* Emoji */}
      <motion.div
        className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
        animate={reducedMotion ? undefined : { rotate: [0, -6, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5 + index }}
        style={{
          background: `${game.color}14`,
          border: `1px solid ${game.color}25`,
        }}
      >
        {game.emoji}
      </motion.div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-black mb-0.5" style={{ color: '#F5F5F7' }}>{game.title}</h3>
        <p className="text-xs leading-snug" style={{ color: '#6B7280' }}>{game.description}</p>
      </div>

      {/* CTA arrow */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full"
        style={{
          background: `${game.color}18`,
          border: `1px solid ${game.color}30`,
        }}
      >
        {game.external ? (
          <ExternalLink size={14} style={{ color: game.color }} />
        ) : (
          <ArrowRight size={14} style={{ color: game.color }} />
        )}
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