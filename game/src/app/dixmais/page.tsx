'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy, Loader2, WifiOff } from 'lucide-react';
import { useHaptics } from '@/lib/hooks';
import type { DixMaisStatement } from '@/types/database';

// ─── Color helpers ────────────────────────────────────────────────────────────

const RATING_COLORS: Record<number, string> = {
  0: '#DC2626',  // Red intense
  1: '#DC2626',  // Red intense
  2: '#EF4444',  // Red
  3: '#F97316',  // Orange
  4: '#F97316',  // Orange
  5: '#F59E0B',  // Amber
  6: '#F59E0B',  // Amber
  7: '#FBBF24',  // Yellow-amber
  8: '#FBBF24',  // Yellow-amber
  9: '#FFD700',  // Gold
  10: '#FFD700', // Gold
};
function rc(r: number) { return RATING_COLORS[Math.max(0, Math.min(10, r))] ?? '#EF4444'; }
function rb(r: number) { return `${rc(r)}18`; }
function re(r: number) {
  if (r === 0) return '🚫'; if (r <= 2) return '💀'; if (r <= 4) return '😬';
  if (r <= 6) return '🤷'; if (r <= 8) return '😏'; if (r === 9) return '🔥'; return '⭐';
}
function rl(r: number) {
  if (r === 0) return 'ÉLIMINATOIRE'; if (r <= 2) return 'RED FLAG';
  if (r <= 4) return 'BOF...'; if (r <= 6) return 'MOYEN';
  if (r <= 8) return 'PAS MAL'; if (r === 9) return 'PRESQUE PARFAIT'; return 'PARFAIT';
}

// ─── Network helpers ──────────────────────────────────────────────────────────

async function fetchStatements(count: number): Promise<DixMaisStatement[]> {
  const res = await fetch(`/api/dixmais/statements?count=${count}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('fetch failed');
  const json = await res.json();
  return json.data as DixMaisStatement[];
}

function submitVote(stmtId: string, sessionId: string, prev: number, next: number) {
  fetch('/api/dixmais/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statement_id: stmtId, session_id: sessionId, previous_score: prev, new_score: next }),
  }).catch(() => null);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'loading' | 'playing' | 'recap';

interface RoundResult {
  statements: DixMaisStatement[];
  ratings: number[];
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function DixMaisPage() {
  const { tap } = useHaptics();
  const [phase, setPhase] = useState<Phase>('intro');
  const [statements, setStatements] = useState<DixMaisStatement[]>([]);
  const [stmtIdx, setStmtIdx] = useState(0);
  const [ratings, setRatings] = useState<number[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [locked, setLocked] = useState(false);
  const [justRated, setJustRated] = useState<number | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const sessionId = useRef<string>('');

  useEffect(() => { sessionId.current = typeof crypto !== 'undefined' ? crypto.randomUUID() : `s-${Date.now()}`; }, []);

  const loadStatements = useCallback(async () => {
    setPhase('loading');
    setLoadError(false);
    try {
      const count = Math.floor(Math.random() * 5) + 5; // 5-9 statements
      const stmts = await fetchStatements(count);
      setStatements(stmts);
      setStmtIdx(0);
      setRatings([]);
      setPhase('playing');
    } catch {
      setLoadError(true);
      setPhase('intro');
    }
  }, []);

  const handleStart = useCallback(() => { tap(); loadStatements(); }, [tap, loadStatements]);

  const handleRate = useCallback((rating: number) => {
    if (locked || !statements.length) return;
    tap();
    setLocked(true);
    setJustRated(rating);

    const stmt = statements[stmtIdx];
    const prevScore = ratings.length > 0 ? ratings[ratings.length - 1] : 10;
    submitVote(stmt.id, sessionId.current, prevScore, rating);

    const newRatings = [...ratings, rating];

    setTimeout(() => {
      setJustRated(null);
      setLocked(false);
      if (rating === 0 || stmtIdx >= statements.length - 1) {
        setResults(prev => [...prev, { statements: statements.slice(0, stmtIdx + 1), ratings: newRatings }]);
        setRoundsPlayed(n => n + 1);
        setPhase('recap');
      } else {
        setRatings(newRatings);
        setStmtIdx(i => i + 1);
      }
    }, 520);
  }, [locked, tap, statements, stmtIdx, ratings]);

  const handleNextRound = useCallback(() => { tap(); loadStatements(); }, [tap, loadStatements]);
  const handleRestart = useCallback(() => { tap(); setResults([]); setRoundsPlayed(0); setPhase('intro'); }, [tap]);

  const lastResult = results[results.length - 1];

  return (
    <div className="relative min-h-dvh overflow-hidden text-white select-none" style={{ background: '#060606' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.11]"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-[0.09]"
          style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* Nav bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-6 pb-3">
        <Link href="/" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors active:scale-95">
          <ArrowLeft size={16} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Accueil</span>
        </Link>
        <div className="flex items-center gap-4">
          {roundsPlayed > 0 && (
            <Link href="/dixmais/leaderboard" className="flex items-center gap-1 text-[#F59E0B]/50 hover:text-[#F59E0B] transition-colors">
              <Trophy size={13} /><span className="text-[10px] font-black uppercase tracking-[0.15em]">Classement</span>
            </Link>
          )}
          {phase !== 'intro' && phase !== 'loading' && (
            <button onClick={handleRestart} className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors active:scale-95 cursor-pointer">
              <RotateCcw size={13} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Reset</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && <IntroScreen key="intro" onStart={handleStart} hasError={loadError} />}
        {phase === 'loading' && <LoadingScreen key="loading" />}
        {phase === 'playing' && (
          <GameScreen
            key={`game-${roundsPlayed}`}
            statements={statements}
            stmtIdx={stmtIdx}
            ratings={ratings}
            justRated={justRated}
            onRate={handleRate}
            locked={locked}
            roundsPlayed={roundsPlayed}
          />
        )}
        {phase === 'recap' && lastResult && (
          <RecapScreen
            key={`recap-${roundsPlayed}`}
            result={lastResult}
            totalRounds={roundsPlayed}
            onNextRound={handleNextRound}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative z-10 flex flex-col items-center justify-center min-h-[80dvh] gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Loader2 size={32} style={{ color: '#F59E0B' }} />
      </motion.div>
      <p className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(245,158,11,0.6)' }}>
        Chargement du profil...
      </p>
    </motion.div>
  );
}

// ─── Intro Screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart, hasError }: { onStart: () => void; hasError: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
      className="relative z-10 flex flex-col items-center justify-between min-h-[88dvh] px-6 pb-10">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: 'rgba(245,158,11,0.55)' }}>
          LE JEU DE NOTATION
        </p>
        <h1 className="font-black leading-[0.88] tracking-[-0.04em] uppercase" style={{ fontSize: 'clamp(3rem,16vw,5.5rem)', color: '#F5F5F7' }}>
          C&apos;EST UN
        </h1>
        <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="font-black leading-none"
          style={{ fontSize: 'clamp(5.5rem,24vw,10rem)', color: '#FFD700', textShadow: '0 0 50px rgba(255,215,0,0.55),0 0 100px rgba(245,158,11,0.25)', letterSpacing: '-0.05em' }}>
          10
        </motion.div>
        <h1 className="font-black leading-[0.88] tracking-[-0.04em] uppercase" style={{ fontSize: 'clamp(3rem,16vw,5.5rem)', color: '#F5F5F7' }}>
          MAIS...
        </h1>
        <p className="text-[#A0A0A6] text-sm font-semibold leading-relaxed max-w-[280px] mt-6">
          Chaque profil commence à <span style={{ color: '#FFD700' }} className="font-black">10</span>. Les révélations s&apos;enchaînent. Note après chaque info. Donne{' '}
          <span style={{ color: '#EF4444' }} className="font-black">0</span> quand c&apos;est éliminatoire.
        </p>
        <Link href="/dixmais/leaderboard"
          className="flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
          style={{ color: 'rgba(245,158,11,0.45)' }}>
          <Trophy size={11} /> Voir le classement des red flags
        </Link>
      </div>
      {hasError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <WifiOff size={14} className="text-[#EF4444] shrink-0" />
          <p className="text-[11px] font-bold text-[#EF4444]">Connexion impossible. Réessaie.</p>
        </div>
      )}
      <div className="w-full space-y-2 mb-7">
        {[
          { icon: '⭐', text: 'Profils infinis générés aléatoirement' },
          { icon: '📝', text: '5 à 9 révélations par profil' },
          { icon: '🚫', text: '0 = éliminatoire — fin du profil' },
        ].map(r => (
          <div key={r.icon} className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-lg">{r.icon}</span>
            <span className="text-sm font-bold text-white/75">{r.text}</span>
          </div>
        ))}
      </div>
      <motion.button whileTap={{ scale: 0.96 }} onClick={onStart}
        className="w-full py-5 rounded-2xl font-black text-base uppercase tracking-widest text-black cursor-pointer"
        style={{ background: 'linear-gradient(135deg,#F59E0B 0%,#FFD700 100%)', boxShadow: '0 10px 40px rgba(245,158,11,0.45)' }}>
        COMMENCER ⭐
      </motion.button>
    </motion.div>
  );
}

// ─── Game Screen ──────────────────────────────────────────────────────────────

function GameScreen({ statements, stmtIdx, ratings, justRated, onRate, locked, roundsPlayed }: {
  statements: DixMaisStatement[];
  stmtIdx: number;
  ratings: number[];
  justRated: number | null;
  onRate: (r: number) => void;
  locked: boolean;
  roundsPlayed: number;
}) {
  const prevStmts = statements.slice(0, stmtIdx);
  const current = statements[stmtIdx];
  const lastRating = ratings.length > 0 ? ratings[ratings.length - 1] : null;
  const visiblePrev = prevStmts.slice(-4);
  const hiddenCount = prevStmts.length - visiblePrev.length;

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="relative z-10 flex flex-col min-h-[88dvh] px-5 pb-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          PROFIL {roundsPlayed + 1} · {stmtIdx + 1}/{statements.length}
        </span>
        {lastRating !== null && (
          <motion.span key={lastRating} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{ color: rc(lastRating), background: rb(lastRating) }}>
            {re(lastRating)} SCORE : {lastRating}/10
          </motion.span>
        )}
      </div>

      {/* Headline */}
      <div className="mb-4 text-center">
        <span className="font-black leading-none tracking-[-0.04em] uppercase"
          style={{ fontSize: 'clamp(1.8rem,9vw,3.2rem)', color: '#F5F5F7' }}>
          C&apos;EST UN{' '}
          <span style={{ color: '#FFD700', textShadow: '0 0 25px rgba(255,215,0,0.5)' }}>10</span>{' '}
          MAIS...
        </span>
      </div>

      {/* Statement stack */}
      <div className="flex-1 flex flex-col justify-end gap-2 mb-5">
        {hiddenCount > 0 && (
          <p className="text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.18)' }}>
            + {hiddenCount} révélation{hiddenCount > 1 ? 's' : ''} précédente{hiddenCount > 1 ? 's' : ''}
          </p>
        )}
        <AnimatePresence initial={false}>
          {visiblePrev.map((stmt, li) => {
            const gi = prevStmts.length - visiblePrev.length + li;
            const age = visiblePrev.length - li;
            const opacity = Math.max(0.2, 1 - (age - 1) * 0.22);
            const scale = Math.max(0.88, 1 - (age - 1) * 0.04);
            const rating = ratings[gi];
            return (
              <motion.div key={`prev-${gi}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity, y: 0, scale }} transition={{ duration: 0.25 }}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)', transformOrigin: 'center' }}>
                <span className="text-sm font-semibold truncate" style={{ color: `rgba(255,255,255,${opacity})` }}>{stmt.text}</span>
                {rating !== undefined && (
                  <span className="text-xs font-black shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ color: rc(rating), background: rb(rating), minWidth: '1.75rem' }}>{rating}</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Current statement */}
        <AnimatePresence mode="wait">
          <motion.div key={`curr-${stmtIdx}`}
            initial={{ opacity: 0, y: 30, scale: 0.93 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative flex items-center justify-center text-center px-5 py-7 rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.07) 0%,rgba(255,215,0,0.03) 100%)', border: '1.5px solid rgba(245,158,11,0.2)', minHeight: '100px' }}>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(255,215,0,0.15),transparent 70%)' }} />
            <p className="relative font-black leading-tight text-white" style={{ fontSize: 'clamp(1.4rem,7.5vw,2.4rem)' }}>
              {current?.text}
            </p>
            {/* Type badge */}
            {current && (
              <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded"
                style={{ color: current.type === 'positive' ? '#22C55E' : '#EF4444', background: current.type === 'positive' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
                {current.type === 'positive' ? '🟢' : '🚩'}
              </span>
            )}
            {/* Rating flash */}
            <AnimatePresence>
              {justRated !== null && (
                <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.4 }} transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                  style={{ background: rb(justRated) }}>
                  <span className="font-black leading-none" style={{ fontSize: 'clamp(4rem,20vw,7rem)', color: rc(justRated), textShadow: `0 0 30px ${rc(justRated)}55` }}>
                    {justRated}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] mt-1" style={{ color: rc(justRated) }}>
                    {rl(justRated)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating interface */}
      <div>
        <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          QUELLE EST SA NOTE ?
        </p>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {[1, 2, 3, 4, 5].map(n => <RatingBtn key={n} n={n} onRate={onRate} disabled={locked} />)}
        </div>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {[6, 7, 8, 9, 10].map(n => <RatingBtn key={n} n={n} onRate={onRate} disabled={locked} />)}
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onRate(0)} disabled={locked}
          className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
          style={{ border: '1.5px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', opacity: locked ? 0.4 : 1 }}>
          🚫 C&apos;EST UN ZÉRO — FIN DU PROFIL
        </motion.button>
      </div>
    </motion.div>
  );
}

function RatingBtn({ n, onRate, disabled }: { n: number; onRate: (r: number) => void; disabled: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.88 }} onClick={() => onRate(n)} disabled={disabled}
      className="aspect-square rounded-xl font-black flex items-center justify-center cursor-pointer transition-all"
      style={{
        fontSize: 'clamp(1.3rem,6vw,1.8rem)',
        color: '#FFFFFF',
        background: rb(n),
        border: `2.5px solid ${rc(n)}`,
        opacity: disabled ? 0.4 : 1,
        textShadow: `0 1px 3px rgba(0,0,0,0.4)`
      }}>
      {n}
    </motion.button>
  );
}

// ─── Recap Screen ─────────────────────────────────────────────────────────────

function RecapScreen({ result, totalRounds, onNextRound }: {
  result: RoundResult;
  totalRounds: number;
  onNextRound: () => void;
}) {
  const finalRating = result.ratings[result.ratings.length - 1];
  const wasElim = finalRating === 0;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
      className="relative z-10 flex flex-col min-h-[88dvh] px-5 pb-8">
      {/* Score hero */}
      <div className="flex flex-col items-center text-center mb-6 pt-2">
        <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}>
          <span className="text-5xl block mb-1">{re(finalRating)}</span>
          <span className="font-black leading-none block"
            style={{ fontSize: 'clamp(5rem,22vw,8rem)', color: rc(finalRating), textShadow: `0 0 50px ${rc(finalRating)}44` }}>
            {finalRating}
          </span>
          <span className="text-xs font-black uppercase tracking-[0.25em] block mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {wasElim ? 'ÉLIMINATOIRE 🚫' : rl(finalRating)}
          </span>
          <span className="text-[10px] font-bold block mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Profil {totalRounds} complété
          </span>
        </motion.div>
      </div>

      {/* Breakdown */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-5 scrollbar-hide">
        {result.statements.map((stmt, i) => {
          const r = result.ratings[i];
          const isLast = i === result.statements.length - 1;
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 + 0.2 }}
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl"
              style={{ background: isLast ? `${rc(r)}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${isLast ? `${rc(r)}30` : 'rgba(255,255,255,0.07)'}` }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] shrink-0">{stmt.type === 'positive' ? '🟢' : '🚩'}</span>
                <span className="text-sm font-bold truncate" style={{ color: isLast ? '#fff' : 'rgba(255,255,255,0.55)' }}>{stmt.text}</span>
              </div>
              <span className="text-sm font-black shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ color: rc(r), background: rb(r), minWidth: '2.25rem' }}>{r}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="flex gap-2 mb-4">
        {[
          { label: 'Questions', value: result.statements.length },
          { label: 'Score min', value: Math.min(...result.ratings) },
          { label: 'Moy.', value: (result.ratings.reduce((a, b) => a + b, 0) / result.ratings.length).toFixed(1) },
        ].map(s => (
          <div key={s.label} className="flex-1 rounded-xl py-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-lg font-black text-white">{s.value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/dixmais/leaderboard"
          className="flex-none px-4 py-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
          <Trophy size={14} /> Stats
        </Link>
        <motion.button whileTap={{ scale: 0.96 }} onClick={onNextRound}
          className="flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest text-black cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#F59E0B 0%,#FFD700 100%)', boxShadow: '0 10px 35px rgba(245,158,11,0.4)' }}>
          PROFIL SUIVANT →
        </motion.button>
      </div>
    </motion.div>
  );
}
