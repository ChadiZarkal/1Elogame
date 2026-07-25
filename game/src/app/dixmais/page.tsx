'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useHaptics } from '@/lib/hooks';

// ─── Static Data ──────────────────────────────────────────────────────────────

interface GameProfile {
  id: string;
  statements: string[];
}

const PROFILES: GameProfile[] = [
  {
    id: 'alexandre',
    statements: [
      'Il est de droite',
      'Il adore le foot',
      'Il est parfois violent',
      'Il gagne 8 000€ par mois',
      "Il a un enfant d'une autre relation",
      'Il vote Marine Le Pen',
      'Il envoie des SMS à 3h du matin',
      'Il ne fait jamais la vaisselle',
    ],
  },
  {
    id: 'thomas',
    statements: [
      'Il vit chez ses parents à 30 ans',
      'Il est chef cuisinier étoilé',
      'Il parle encore à son ex toxique',
      'Il donne beaucoup aux associations',
      "Il a peur de l'engagement",
      'Il est hyper drôle',
      'Il fume un paquet par jour',
      'Il paye toujours les dîners',
    ],
  },
  {
    id: 'lucas',
    statements: [
      'Il est mannequin',
      'Il ne lit jamais',
      'Il est allergique aux chats',
      'Il a une Ferrari',
      'Il est misogyne',
      'Il adore les enfants',
      'Il a trompé ses 3 dernières copines',
      'Il cuisine très bien',
    ],
  },
  {
    id: 'maxime',
    statements: [
      'Il est militaire',
      'Il se dit féministe',
      "Il n'aime pas les animaux",
      'Il voyage 6 mois par an',
      'Il est manipulateur',
      'Il est très proche de sa famille',
      'Il est accro aux jeux vidéo',
      'Il parle de son ex constamment',
    ],
  },
  {
    id: 'nicolas',
    statements: [
      'Il a des abdos parfaits',
      'Il est hyper radin',
      'Il adore les enfants',
      'Il boit beaucoup le week-end',
      'Il est très attentionné',
      "Il ne veut pas d'enfants",
      'Il est jaloux maladif',
      "Il fait des crises en public",
    ],
  },
];

// ─── Color helpers ────────────────────────────────────────────────────────────

const RATING_COLORS: Record<number, string> = {
  0: '#EF4444',
  1: '#EF4444',
  2: '#F87171',
  3: '#FB923C',
  4: '#F97316',
  5: '#EAB308',
  6: '#84CC16',
  7: '#22C55E',
  8: '#10B981',
  9: '#14B8A6',
  10: '#FFD700',
};

function getRatingColor(r: number) {
  return RATING_COLORS[Math.max(0, Math.min(10, r))] ?? '#EF4444';
}

function getRatingBg(r: number) {
  const c = getRatingColor(r);
  return `${c}22`;
}

function getRatingEmoji(r: number) {
  if (r === 0) return '🚫';
  if (r <= 2) return '💀';
  if (r <= 4) return '😬';
  if (r <= 6) return '🤷';
  if (r <= 8) return '😏';
  if (r === 9) return '🔥';
  return '⭐';
}

function getRatingLabel(r: number) {
  if (r === 0) return 'ÉLIMINATOIRE';
  if (r <= 2) return 'RED FLAG';
  if (r <= 4) return 'BOF...';
  if (r <= 6) return 'MOYEN';
  if (r <= 8) return 'PAS MAL';
  if (r === 9) return 'PRESQUE PARFAIT';
  return 'PARFAIT';
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'playing' | 'recap' | 'finished';

interface RoundResult {
  profile: GameProfile;
  ratings: number[];
  statementsShown: string[];
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function DixMaisPage() {
  const { tap } = useHaptics();
  const [phase, setPhase] = useState<Phase>('intro');
  const [profileIdx, setProfileIdx] = useState(0);
  const [stmtIdx, setStmtIdx] = useState(0);
  const [ratings, setRatings] = useState<number[]>([]);
  const [allResults, setAllResults] = useState<RoundResult[]>([]);
  const [locked, setLocked] = useState(false);
  const [justRated, setJustRated] = useState<number | null>(null);

  const profile = PROFILES[profileIdx];

  const handleStart = useCallback(() => {
    tap();
    setPhase('playing');
  }, [tap]);

  const handleRate = useCallback(
    (rating: number) => {
      if (locked) return;
      tap();
      setLocked(true);
      setJustRated(rating);
      const newRatings = [...ratings, rating];

      setTimeout(() => {
        setJustRated(null);
        setLocked(false);
        const isEnd = rating === 0 || stmtIdx >= profile.statements.length - 1;
        if (isEnd) {
          setAllResults((prev) => [
            ...prev,
            {
              profile,
              ratings: newRatings,
              statementsShown: profile.statements.slice(0, stmtIdx + 1),
            },
          ]);
          setRatings([]);
          setStmtIdx(0);
          setPhase('recap');
        } else {
          setRatings(newRatings);
          setStmtIdx((prev) => prev + 1);
        }
      }, 550);
    },
    [locked, tap, ratings, stmtIdx, profile],
  );

  const handleNextProfile = useCallback(() => {
    tap();
    if (profileIdx >= PROFILES.length - 1) {
      setPhase('finished');
    } else {
      setProfileIdx((prev) => prev + 1);
      setPhase('playing');
    }
  }, [tap, profileIdx]);

  const handleRestart = useCallback(() => {
    tap();
    setProfileIdx(0);
    setStmtIdx(0);
    setRatings([]);
    setAllResults([]);
    setJustRated(null);
    setLocked(false);
    setPhase('intro');
  }, [tap]);

  return (
    <div
      className="relative min-h-dvh overflow-hidden text-white select-none"
      style={{ background: '#060606' }}
    >
      {/* Animated ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{
            background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-[0.10]"
          style={{
            background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Top navigation bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-6 pb-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors active:scale-95"
        >
          <ArrowLeft size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Accueil</span>
        </Link>

        {phase !== 'intro' && (
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors active:scale-95 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recommencer</span>
          </button>
        )}
      </div>

      {/* Main content — phase switcher */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && <IntroScreen key="intro" onStart={handleStart} />}

        {phase === 'playing' && (
          <GameScreen
            key={`game-${profileIdx}`}
            profile={profile}
            profileIdx={profileIdx}
            totalProfiles={PROFILES.length}
            stmtIdx={stmtIdx}
            ratings={ratings}
            justRated={justRated}
            onRate={handleRate}
            locked={locked}
          />
        )}

        {phase === 'recap' && allResults.length > 0 && (
          <RecapScreen
            key={`recap-${profileIdx}`}
            result={allResults[allResults.length - 1]}
            profileIdx={profileIdx}
            totalProfiles={PROFILES.length}
            onNext={handleNextProfile}
          />
        )}

        {phase === 'finished' && (
          <FinishedScreen key="finished" results={allResults} onRestart={handleRestart} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Intro Screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative z-10 flex flex-col items-center justify-between min-h-[88dvh] px-6 pb-10"
    >
      {/* Hero title */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-6">
        <p
          className="text-[10px] font-black uppercase tracking-[0.3em] mb-2"
          style={{ color: 'rgba(245,158,11,0.55)' }}
        >
          LE JEU DE NOTATION
        </p>

        <h1
          className="font-black leading-[0.88] tracking-[-0.04em] uppercase"
          style={{ fontSize: 'clamp(3rem,16vw,5.5rem)', color: '#F5F5F7' }}
        >
          C&apos;EST UN
        </h1>

        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="font-black leading-none"
          style={{
            fontSize: 'clamp(5.5rem,24vw,10rem)',
            color: '#FFD700',
            textShadow:
              '0 0 50px rgba(255,215,0,0.55), 0 0 100px rgba(245,158,11,0.25)',
            letterSpacing: '-0.05em',
          }}
        >
          10
        </motion.div>

        <h1
          className="font-black leading-[0.88] tracking-[-0.04em] uppercase"
          style={{ fontSize: 'clamp(3rem,16vw,5.5rem)', color: '#F5F5F7' }}
        >
          MAIS...
        </h1>

        <p className="text-[#A0A0A6] text-sm font-semibold leading-relaxed max-w-[280px] mt-6">
          Chaque profil commence à{' '}
          <span style={{ color: '#FFD700' }} className="font-black">
            10
          </span>
          . Les révélations s&apos;enchaînent. Note après chaque info. Donne{' '}
          <span style={{ color: '#EF4444' }} className="font-black">
            0
          </span>{' '}
          quand c&apos;est éliminatoire.
        </p>
      </div>

      {/* Rules */}
      <div className="w-full space-y-2 mb-7">
        {[
          { icon: '⭐', text: `${PROFILES.length} profils à évaluer` },
          { icon: '📝', text: 'Note après chaque révélation (1 à 10)' },
          { icon: '🚫', text: '0 = éliminatoire — fin du profil' },
        ].map((rule) => (
          <div
            key={rule.icon}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span className="text-lg">{rule.icon}</span>
            <span className="text-sm font-bold text-white/75">{rule.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="w-full py-5 rounded-2xl font-black text-base uppercase tracking-widest text-black active:scale-95 transition-transform cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #FFD700 100%)',
          boxShadow: '0 10px 40px rgba(245,158,11,0.45)',
        }}
      >
        COMMENCER ⭐
      </button>
    </motion.div>
  );
}

// ─── Game Screen ──────────────────────────────────────────────────────────────

function GameScreen({
  profile,
  profileIdx,
  totalProfiles,
  stmtIdx,
  ratings,
  justRated,
  onRate,
  locked,
}: {
  profile: GameProfile;
  profileIdx: number;
  totalProfiles: number;
  stmtIdx: number;
  ratings: number[];
  justRated: number | null;
  onRate: (r: number) => void;
  locked: boolean;
}) {
  const prevStatements = profile.statements.slice(0, stmtIdx);
  const currentStatement = profile.statements[stmtIdx];
  const lastRating = ratings.length > 0 ? ratings[ratings.length - 1] : null;

  // Show at most 4 previous statements on screen
  const visiblePrev = prevStatements.slice(-4);
  const hiddenCount = prevStatements.length - visiblePrev.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative z-10 flex flex-col min-h-[88dvh] px-5 pb-6"
    >
      {/* Profile progress + last rating badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-black uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          PROFIL {profileIdx + 1}/{totalProfiles}
        </span>
        {lastRating !== null && (
          <motion.span
            key={lastRating}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{
              color: getRatingColor(lastRating),
              background: getRatingBg(lastRating),
            }}
          >
            {getRatingEmoji(lastRating)} DERNIER : {lastRating}/10
          </motion.span>
        )}
      </div>

      {/* Big headline */}
      <div className="mb-4 text-center">
        <span
          className="font-black leading-none tracking-[-0.04em] uppercase"
          style={{
            fontSize: 'clamp(1.8rem,9vw,3.2rem)',
            color: '#F5F5F7',
          }}
        >
          C&apos;EST UN{' '}
          <span
            style={{
              color: '#FFD700',
              textShadow: '0 0 25px rgba(255,215,0,0.5)',
            }}
          >
            10
          </span>{' '}
          MAIS...
        </span>
      </div>

      {/* Statement stack area */}
      <div className="flex-1 flex flex-col justify-end gap-2 mb-5">
        {/* Hidden count hint */}
        {hiddenCount > 0 && (
          <p
            className="text-center text-[10px] font-bold uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            + {hiddenCount} révélation{hiddenCount > 1 ? 's' : ''} précédente{hiddenCount > 1 ? 's' : ''}
          </p>
        )}

        {/* Previous statements — fade/shrink by age */}
        <AnimatePresence initial={false}>
          {visiblePrev.map((stmt, localIdx) => {
            const globalIdx = prevStatements.length - visiblePrev.length + localIdx;
            const age = visiblePrev.length - localIdx; // 1 = most recent
            const opacity = Math.max(0.2, 1 - (age - 1) * 0.22);
            const scale = Math.max(0.88, 1 - (age - 1) * 0.04);
            const rating = ratings[globalIdx];

            return (
              <motion.div
                key={`prev-${globalIdx}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity, y: 0, scale }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transformOrigin: 'center',
                }}
              >
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: `rgba(255,255,255,${opacity})` }}
                >
                  {stmt}
                </span>
                {rating !== undefined && (
                  <span
                    className="text-xs font-black shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      color: getRatingColor(rating),
                      background: getRatingBg(rating),
                      minWidth: '1.75rem',
                    }}
                  >
                    {rating}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Current statement — BIG & PROMINENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`current-${stmtIdx}`}
            initial={{ opacity: 0, y: 30, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative flex items-center justify-center text-center px-5 py-7 rounded-2xl overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(255,215,0,0.03) 100%)',
              border: '1.5px solid rgba(245,158,11,0.2)',
              minHeight: '100px',
            }}
          >
            {/* Subtle corner glow */}
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.15), transparent 70%)',
              }}
            />

            <p
              className="relative font-black leading-tight text-white"
              style={{ fontSize: 'clamp(1.4rem,7.5vw,2.4rem)' }}
            >
              {currentStatement}
            </p>

            {/* Rating flash overlay */}
            <AnimatePresence>
              {justRated !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.4 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                  style={{ background: `${getRatingBg(justRated)}` }}
                >
                  <span
                    className="font-black leading-none"
                    style={{
                      fontSize: 'clamp(4rem,20vw,7rem)',
                      color: getRatingColor(justRated),
                      textShadow: `0 0 30px ${getRatingColor(justRated)}55`,
                    }}
                  >
                    {justRated}
                  </span>
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.25em] mt-1"
                    style={{ color: getRatingColor(justRated) }}
                  >
                    {getRatingLabel(justRated)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating interface */}
      <div>
        <p
          className="text-center text-[10px] font-black uppercase tracking-[0.25em] mb-3"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          QUELLE EST SA NOTE ?
        </p>

        {/* Row 1: 1–5 */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <RatingButton key={n} value={n} onRate={onRate} disabled={locked} />
          ))}
        </div>

        {/* Row 2: 6–10 */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {[6, 7, 8, 9, 10].map((n) => (
            <RatingButton key={n} value={n} onRate={onRate} disabled={locked} />
          ))}
        </div>

        {/* 0 = kill button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onRate(0)}
          disabled={locked}
          className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity cursor-pointer"
          style={{
            border: '1.5px solid rgba(239,68,68,0.35)',
            background: 'rgba(239,68,68,0.08)',
            color: '#EF4444',
            opacity: locked ? 0.4 : 1,
          }}
        >
          🚫 C&apos;EST UN ZÉRO — FIN DU PROFIL
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Rating Button ────────────────────────────────────────────────────────────

function RatingButton({
  value,
  onRate,
  disabled,
}: {
  value: number;
  onRate: (r: number) => void;
  disabled: boolean;
}) {
  const color = getRatingColor(value);

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={() => onRate(value)}
      disabled={disabled}
      className="aspect-square rounded-xl font-black flex items-center justify-center cursor-pointer transition-opacity"
      style={{
        fontSize: 'clamp(1.1rem,5vw,1.6rem)',
        color,
        background: `${color}18`,
        border: `2px solid ${color}30`,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {value}
    </motion.button>
  );
}

// ─── Recap Screen ─────────────────────────────────────────────────────────────

function RecapScreen({
  result,
  profileIdx,
  totalProfiles,
  onNext,
}: {
  result: RoundResult;
  profileIdx: number;
  totalProfiles: number;
  onNext: () => void;
}) {
  const finalRating = result.ratings[result.ratings.length - 1];
  const wasEliminated = finalRating === 0;
  const isLastProfile = profileIdx >= totalProfiles - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative z-10 flex flex-col min-h-[88dvh] px-5 pb-8"
    >
      {/* Final score hero */}
      <div className="flex flex-col items-center text-center mb-6 pt-2">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
        >
          <span className="text-5xl block mb-1">{getRatingEmoji(finalRating)}</span>
          <span
            className="font-black leading-none block"
            style={{
              fontSize: 'clamp(5rem,22vw,8rem)',
              color: getRatingColor(finalRating),
              textShadow: `0 0 50px ${getRatingColor(finalRating)}44`,
            }}
          >
            {finalRating}
          </span>
          <span
            className="text-xs font-black uppercase tracking-[0.25em] block mt-1"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {wasEliminated ? 'ÉLIMINATOIRE 🚫' : `${getRatingLabel(finalRating)}`}
          </span>
        </motion.div>
      </div>

      {/* Statement + rating breakdown */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-6 scrollbar-hide">
        {result.statementsShown.map((stmt, i) => {
          const r = result.ratings[i];
          const isLast = i === result.statementsShown.length - 1;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 + 0.2, duration: 0.25 }}
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl"
              style={{
                background: isLast ? `${getRatingColor(r)}12` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isLast ? `${getRatingColor(r)}30` : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: isLast ? '#fff' : 'rgba(255,255,255,0.55)' }}
              >
                {stmt}
              </span>
              <span
                className="text-sm font-black shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  color: getRatingColor(r),
                  background: getRatingBg(r),
                  minWidth: '2.25rem',
                }}
              >
                {r}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Next button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
        className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-black cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #FFD700 100%)',
          boxShadow: '0 10px 35px rgba(245,158,11,0.4)',
        }}
      >
        {isLastProfile ? 'VOIR LE BILAN FINAL 🏆' : 'PROFIL SUIVANT →'}
      </motion.button>
    </motion.div>
  );
}

// ─── Finished Screen ──────────────────────────────────────────────────────────

function FinishedScreen({
  results,
  onRestart,
}: {
  results: RoundResult[];
  onRestart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative z-10 flex flex-col min-h-[88dvh] px-5 pb-8"
    >
      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          className="text-5xl block mb-3"
        >
          🏆
        </motion.span>
        <h2 className="text-2xl font-black text-white tracking-[-0.03em]">BILAN FINAL</h2>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Tous les profils complétés
        </p>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-6 scrollbar-hide">
        {results.map((result, i) => {
          const finalRating = result.ratings[result.ratings.length - 1];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.15 }}
              className="px-4 py-4 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span
                  className="text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Profil {i + 1}
                </span>
                <span
                  className="font-black text-xl leading-none"
                  style={{ color: getRatingColor(finalRating) }}
                >
                  {finalRating === 0 ? '🚫 0' : `${finalRating}/10`}
                </span>
              </div>
              {/* Mini rating progression */}
              <div className="flex flex-wrap gap-1.5">
                {result.ratings.map((r, j) => (
                  <span
                    key={j}
                    className="text-xs font-black px-2.5 py-0.5 rounded-full"
                    style={{
                      color: getRatingColor(r),
                      background: getRatingBg(r),
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>
              {/* Last statement shown */}
              <p
                className="text-[11px] font-semibold mt-2 line-clamp-1"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                ↳ {result.statementsShown[result.statementsShown.length - 1]}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onRestart}
        className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-black cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #FFD700 100%)',
          boxShadow: '0 10px 35px rgba(245,158,11,0.4)',
        }}
      >
        REJOUER ⭐
      </motion.button>
    </motion.div>
  );
}
