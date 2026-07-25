'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy, Loader2, WifiOff } from 'lucide-react';
import { useHaptics } from '@/lib/hooks';
import type { DixMaisStatement } from '@/types/database';

// ─── Color helpers ────────────────────────────────────────────────────────────

const RATING_COLORS: Record<number, string> = {
  0: '#DC2626',  1: '#DC2626',  2: '#EF4444',  3: '#F97316',  4: '#F97316',
  5: '#F59E0B',  6: '#F59E0B',  7: '#FBBF24',  8: '#FBBF24',  9: '#FFD700',  10: '#FFD700',
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
      const count = Math.floor(Math.random() * 5) + 5;
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
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.11]"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-[0.09]"
          style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
        <Link href="/" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors active:scale-95">
          <ArrowLeft size={16} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Menu</span>
        </Link>
        {phase === 'playing' && (
          <button onClick={handleRestart} className="text-white/30 hover:text-white/60 transition-colors active:scale-95 cursor-pointer">
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && <IntroScreen onStart={handleStart} hasError={loadError} />}
        {phase === 'loading' && <LoadingScreen />}
        {phase === 'playing' && <GameScreen statements={statements} stmtIdx={stmtIdx} ratings={ratings} justRated={justRated} onRate={handleRate} locked={locked} roundsPlayed={roundsPlayed} />}
        {phase === 'recap' && lastResult && <RecapScreen result={lastResult} totalRounds={roundsPlayed} onNextRound={handleNextRound} />}
      </AnimatePresence>
    </div>
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
          LE JEU DE NOTATION CUMULATIF
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
        <div className="mt-6 max-w-[300px] space-y-3">
          <div className="px-5 py-4 rounded-2xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.2)' }}>
            <p className="text-sm font-bold text-white/85 leading-relaxed">
              Un profil commence à <span style={{ color: '#FFD700' }} className="font-black text-base">10/10</span>
            </p>
          </div>
          <div className="px-5 py-4 rounded-2xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.2)' }}>
            <p className="text-sm font-bold text-white/85 leading-relaxed">
              Chaque info <span style={{ color: '#FFD700' }} className="font-black">s&apos;ajoute</span> aux précédentes
            </p>
          </div>
          <div className="px-5 py-4 rounded-2xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-bold text-white/85 leading-relaxed">
              <span style={{ color: '#EF4444' }} className="font-black text-base">0</span> = Éliminatoire → Fin
            </p>
          </div>
        </div>
        <Link href="/dixmais/leaderboard"
          className="flex items-center gap-1.5 mt-5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
          style={{ color: 'rgba(245,158,11,0.45)' }}>
          <Trophy size={11} /> Classement des red flags
        </Link>
      </div>
      {hasError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <WifiOff size={14} className="text-[#EF4444] shrink-0" />
          <p className="text-[11px] font-bold text-[#EF4444]">Connexion impossible. Réessaie.</p>
        </div>
      )}
      <motion.button whileTap={{ scale: 0.96 }} onClick={onStart}
        className="w-full py-5 rounded-2xl font-black text-base uppercase tracking-widest text-black cursor-pointer"
        style={{ background: 'linear-gradient(135deg,#F59E0B 0%,#FFD700 100%)', boxShadow: '0 10px 40px rgba(245,158,11,0.45)' }}>
        COMMENCER ⭐
      </motion.button>
    </motion.div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative z-10 flex flex-col items-center justify-center min-h-[88dvh]">
      <Loader2 className="animate-spin mb-3" size={32} style={{ color: '#F59E0B' }} />
      <p className="text-sm font-bold text-white/40">Génération du profil...</p>
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
  const allRevealed = statements.slice(0, stmtIdx + 1);
  const current = statements[stmtIdx];
  const lastRating = ratings.length > 0 ? ratings[ratings.length - 1] : 10;

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="relative z-10 flex flex-col min-h-[88dvh] px-5 pb-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
              Info {stmtIdx + 1}/{statements.length}
            </span>
          </div>
        </div>
        <motion.div key={lastRating} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="px-3 py-1.5 rounded-lg font-black text-sm"
          style={{ color: rc(lastRating), background: rb(lastRating) }}>
          {re(lastRating)} {lastRating}/10
        </motion.div>
      </div>

      {/* Profile Card - ALL accumulated statements */}
      <div className="flex-1 mb-5">
        <div className="text-center mb-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30 mb-2">
            PROFIL ACTUEL
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="font-black text-2xl" style={{ color: '#FFD700' }}>10/10</span>
            <span className="text-white/40 text-lg font-bold">MAIS...</span>
          </div>
        </div>

        {/* Scrollable statement list */}
        <div className="max-h-[40vh] overflow-y-auto space-y-3 px-2 pb-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(245,158,11,0.3) transparent' }}>
          <AnimatePresence mode="popLayout">
            {allRevealed.map((stmt, idx) => {
              const isNew = idx === stmtIdx;
              const isPrev = idx < stmtIdx;

              return (
                <motion.div key={stmt.id}
                  initial={isNew ? { opacity: 0, y: 20, scale: 0.95 } : false}
                  animate={{
                    opacity: isPrev ? 0.5 : 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="relative">

                  {/* AND separator for non-first items */}
                  {idx > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className="px-4 py-1 rounded-full font-black text-[10px] tracking-[0.2em]"
                        style={{
                          background: 'rgba(245,158,11,0.12)',
                          color: 'rgba(245,158,11,0.7)',
                          border: '1px solid rgba(245,158,11,0.2)'
                        }}>
                        ET...
                      </div>
                    </div>
                  )}

                  <div className="relative px-5 py-4 rounded-xl"
                    style={{
                      background: isNew
                        ? 'linear-gradient(135deg,rgba(245,158,11,0.15) 0%,rgba(255,215,0,0.08) 100%)'
                        : 'rgba(255,255,255,0.03)',
                      border: isNew
                        ? '2px solid rgba(245,158,11,0.35)'
                        : '1px solid rgba(255,255,255,0.06)',
                    }}>

                    {/* Statement text */}
                    <p className={`font-bold leading-snug ${isNew ? 'text-white text-base' : 'text-white/60 text-sm'}`}>
                      {stmt.text}
                    </p>

                    {/* Type badge */}
                    <div className="absolute top-2 right-2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                      style={{
                        color: stmt.type === 'positive' ? '#22C55E' : '#EF4444',
                        background: stmt.type === 'positive' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'
                      }}>
                      {stmt.type === 'positive' ? '🟢' : '🚩'}
                    </div>

                    {/* New indicator */}
                    {isNew && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-2 -left-2 w-4 h-4 rounded-full"
                        style={{ background: '#FFD700', boxShadow: '0 0 20px rgba(255,215,0,0.6)' }}>
                        <div className="absolute inset-0 rounded-full animate-ping"
                          style={{ background: '#FFD700', opacity: 0.4 }} />
                      </motion.div>
                    )}

                    {/* Rating flash overlay */}
                    <AnimatePresence>
                      {justRated !== null && isNew && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.4 }}
                          transition={{ duration: 0.18 }}
                          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                          style={{ background: rb(justRated) }}>
                          <span className="font-black leading-none"
                            style={{ fontSize: '3.5rem', color: rc(justRated), textShadow: `0 0 30px ${rc(justRated)}55` }}>
                            {justRated}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-1"
                            style={{ color: rc(justRated) }}>
                            {rl(justRated)}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Rating interface */}
      <div>
        <p className="text-center text-[11px] font-black uppercase tracking-[0.25em] mb-3"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          QUELLE NOTE APRÈS TOUT ÇA ?
        </p>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {[1, 2, 3, 4, 5].map(n => <RatingBtn key={n} n={n} onRate={onRate} disabled={locked} />)}
        </div>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {[6, 7, 8, 9, 10].map(n => <RatingBtn key={n} n={n} onRate={onRate} disabled={locked} />)}
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onRate(0)} disabled={locked}
          className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
          style={{
            border: '2px solid rgba(239,68,68,0.4)',
            background: 'rgba(239,68,68,0.1)',
            color: '#EF4444',
            opacity: locked ? 0.4 : 1
          }}>
          🚫 C&apos;EST UN ZÉRO — FIN
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
  const minRating = Math.min(...result.ratings);
  const avgRating = (result.ratings.reduce((a, b) => a + b, 0) / result.ratings.length).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
      className="relative z-10 flex flex-col min-h-[88dvh] px-5 pb-8">

      {/* Score hero */}
      <div className="flex flex-col items-center text-center mb-6 pt-8">
        <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}>
          <span className="text-5xl block mb-2">{re(finalRating)}</span>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-2">NOTE FINALE</p>
          <span className="font-black leading-none block"
            style={{ fontSize: 'clamp(5rem,22vw,8rem)', color: rc(finalRating), textShadow: `0 0 50px ${rc(finalRating)}44` }}>
            {finalRating}
          </span>
          <span className="text-xs font-black uppercase tracking-[0.25em] block mt-2"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            {wasElim ? 'ÉLIMINATOIRE 🚫' : rl(finalRating)}
          </span>
          <span className="text-[10px] font-bold block mt-2"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Profil {totalRounds} complété
          </span>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="rounded-xl py-3 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xl font-black" style={{ color: '#F59E0B' }}>{result.statements.length}</p>
          <p className="text-[9px] font-bold uppercase tracking-wide text-white/30">infos</p>
        </div>
        <div className="rounded-xl py-3 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xl font-black" style={{ color: rc(minRating) }}>{minRating}</p>
          <p className="text-[9px] font-bold uppercase tracking-wide text-white/30">min</p>
        </div>
        <div className="rounded-xl py-3 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xl font-black" style={{ color: '#FBBF24' }}>{avgRating}</p>
          <p className="text-[9px] font-bold uppercase tracking-wide text-white/30">moy</p>
        </div>
      </div>

      {/* All revealed statements summary */}
      <div className="flex-1 mb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 text-center">
          RÉCAP DU PROFIL
        </p>
        <div className="space-y-2 max-h-[35vh] overflow-y-auto px-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(245,158,11,0.3) transparent' }}>
          {result.statements.map((stmt, i) => (
            <div key={stmt.id} className="flex items-start gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[10px] shrink-0">{stmt.type === 'positive' ? '🟢' : '🚩'}</span>
              <p className="text-xs font-semibold text-white/60 leading-snug flex-1">{stmt.text}</p>
              <span className="text-xs font-black shrink-0"
                style={{ color: rc(result.ratings[i]) }}>
                {result.ratings[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-2">
        <Link href="/dixmais/leaderboard"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
          <Trophy size={14} /> VOIR LE CLASSEMENT
        </Link>
        <motion.button whileTap={{ scale: 0.96 }} onClick={onNextRound}
          className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-black cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#F59E0B,#FFD700)', boxShadow: '0 8px 30px rgba(245,158,11,0.35)' }}>
          PROFIL SUIVANT →
        </motion.button>
      </div>
    </motion.div>
  );
}
