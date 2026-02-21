'use client';

import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { useHaptics } from '@/lib/hooks';

// ---------------------------------------------------------------------------
// Game definitions — single source of truth for all hub games
// ---------------------------------------------------------------------------

export interface GameDefinition {
  readonly id: string;
  readonly href: string;
  readonly external: boolean;
  readonly emoji: string;
  readonly badge: string;
  readonly title: string;
  readonly description: string;
  readonly cta: string;
  readonly color: string;
  readonly colorDim: string;
  readonly colorBorder: string;
}

/**
 * All games displayed on the hub page — equal hierarchy.
 * Adding a new game is as simple as appending an entry here.
 */
export const GAMES: readonly GameDefinition[] = [
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

// ---------------------------------------------------------------------------
// GameCard component — one card per game with 3D tilt effect
// ---------------------------------------------------------------------------

interface GameCardProps {
  game: GameDefinition;
  index: number;
  onNavigate: (href: string, external: boolean) => void;
  reducedMotion: boolean;
}

export function GameCard({ game, index, onNavigate, reducedMotion }: GameCardProps) {
  const { tap } = useHaptics();
  const cardRef = useRef<HTMLButtonElement>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (reducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cardRef.current.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    },
    [reducedMotion],
  );

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
      onClick={() => {
        tap();
        onNavigate(game.href, game.external);
      }}
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
      <BorderBeam colorFrom={game.color} colorTo={`${game.color}88`} duration={8 + index * 2} />

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

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-black mb-0.5" style={{ color: '#F5F5F7' }}>
          {game.title}
        </h3>
        <p className="text-xs leading-snug" style={{ color: '#6B7280' }}>
          {game.description}
        </p>
      </div>

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
