'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import { useHaptics } from '@/lib/hooks';
import type { DixMaisStatement } from '@/types/database';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(n: number) {
  if (n === 0) return '#DC2626';
  if (n <= 3)  return '#EF4444';
  if (n <= 6)  return '#F59E0B';
  if (n <= 8)  return '#FBBF24';
  return '#FFD700';
}

function scoreLabel(n: number) {
  if (n === 0) return 'ÉLIMINÉ 🚫';
  if (n <= 2)  return 'RED FLAG 🚩';
  if (n <= 4)  return 'BOF 😬';
  if (n <= 6)  return 'MOYEN 🤷';
  if (n <= 8)  return 'PAS MAL 😏';
  if (n === 9) return 'PRESQUE 🔥';
  return 'PARFAIT ⭐';
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchStatements(count: number): Promise<DixMaisStatement[]> {
  const res = await fetch(`/api/dixmais/statements?count=${count}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('fail');
  return ((await res.json()).data ?? []) as DixMaisStatement[];
}

function sendVote(id: string, sid: string, prev: number, next: number) {
  fetch('/api/dixmais/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statement_id: id, session_id: sid, previous_score: prev, new_score: next }),
  }).catch(() => null);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'loading' | 'playing' | 'recap';

interface RoundResult { statements: DixMaisStatement[]; ratings: number[]; }

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function DixMaisPage() {
  const { tap } = useHaptics();
  const [phase, setPhase]         = useState<Phase>('intro');
  const [stmts, setStmts]         = useState<DixMaisStatement[]>([]);
  const [idx, setIdx]             = useState(0);
  const [ratings, setRatings]     = useState<number[]>([]);
  const [results, setResults]     = useState<RoundResult[]>([]);
  const [locked, setLocked]       = useState(false);
  const [flash, setFlash]         = useState<number | null>(null);
  const [loadErr, setLoadErr]     = useState(false);
  const [rounds, setRounds]       = useState(0);
  const sid                        = useRef('');

  useEffect(() => {
    sid.current = typeof crypto !== 'undefined' ? crypto.randomUUID() : `s-${Date.now()}`;
  }, []);

  const load = useCallback(async () => {
    setPhase('loading');
    setLoadErr(false);
    try {
      const count = 5 + Math.floor(Math.random() * 5);
      const data  = await fetchStatements(count);
      setStmts(data);
      setIdx(0);
      setRatings([]);
      setPhase('playing');
    } catch {
      setLoadErr(true);
      setPhase('intro');
    }
  }, []);

  const rate = useCallback((n: number) => {
    if (locked || !stmts.length) return;
    tap();
    setLocked(true);
    setFlash(n);
    const prev = ratings.at(-1) ?? 10;
    sendVote(stmts[idx].id, sid.current, prev, n);
    const next = [...ratings, n];
    setTimeout(() => {
      setFlash(null);
      setLocked(false);
      if (n === 0 || idx >= stmts.length - 1) {
        setResults(r => [...r, { statements: stmts.slice(0, idx + 1), ratings: next }]);
        setRounds(r => r + 1);
        setPhase('recap');
      } else {
        setRatings(next);
        setIdx(i => i + 1);
      }
    }, 600);
  }, [locked, tap, stmts, idx, ratings]);

  const next    = useCallback(() => { tap(); load(); }, [tap, load]);
  const restart = useCallback(() => { tap(); setResults([]); setRounds(0); setPhase('intro'); }, [tap]);

  return (
    <div className="relative flex flex-col min-h-dvh overflow-hidden text-white select-none"
      style={{ background: '#080808' }}>

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #F59E0B 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Topbar */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <Link href="/" className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Menu</span>
        </Link>
        {phase === 'playing' && (
          <button onClick={restart} className="text-white/25 hover:text-white/50 transition-colors active:scale-90 cursor-pointer">
            <RotateCcw size={14} />
          </button>
        )}
      </header>

      {/* Screens */}
      <div className="relative z-10 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {phase === 'intro'   && <Intro onStart={load} err={loadErr} key="intro" />}
          {phase === 'loading' && <Loading key="loading" />}
          {phase === 'playing' && (
            <Game key="game"
              stmts={stmts} idx={idx} ratings={ratings}
              flash={flash} onRate={rate} locked={locked} round={rounds} />
          )}
          {phase === 'recap' && results.at(-1) && (
            <Recap key="recap" result={results.at(-1)!} total={rounds} onNext={next} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── INTRO ────────────────────────────────────────────────────────────────────

function Intro({ onStart, err }: { onStart: () => void; err: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col flex-1 px-6 pb-8 pt-6">

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.p
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-[10px] font-black uppercase tracking-[0.35em] mb-5"
          style={{ color: 'rgba(245,158,11,0.55)' }}>
          Jeu de soirée · Notation cumulative
        </motion.p>

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="mb-6">
          <p className="font-black uppercase tracking-[-0.03em] leading-none text-white"
            style={{ fontSize: 'clamp(2.5rem, 12vw, 4.5rem)' }}>
            C&apos;EST UN
          </p>
          <p className="font-black leading-none"
            style={{
              fontSize: 'clamp(6rem, 28vw, 11rem)',
              letterSpacing: '-0.06em',
              color: '#FFD700',
              textShadow: '0 0 60px rgba(255,215,0,0.6), 0 0 120px rgba(245,158,11,0.3)',
              lineHeight: 0.85,
            }}>
            10
          </p>
          <p className="font-black uppercase tracking-[-0.03em] leading-none text-white/90"
            style={{ fontSize: 'clamp(2.5rem, 12vw, 4.5rem)' }}>
            MAIS...
          </p>
        </motion.div>

        {/* Rules — compact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="w-full max-w-xs space-y-2 mb-6">
          {[
            ['⭐', 'Le profil commence à 10/10'],
            ['📢', 'Chaque révélation s\'ajoute — ET... ET... ET...'],
            ['🎯', 'Tu réévalues la note à chaque fois'],
            ['🚫', '0 = éliminatoire, la partie s\'arrête'],
          ].map(([icon, text]) => (
            <div key={icon} className="flex items-start gap-3 text-left px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-lg shrink-0 leading-tight">{icon}</span>
              <span className="text-sm font-semibold text-white/70 leading-snug">{text}</span>
            </div>
          ))}
        </motion.div>

        <Link href="/dixmais/leaderboard"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors mb-1"
          style={{ color: 'rgba(245,158,11,0.4)' }}>
          <Trophy size={10} /> Classement des red flags
        </Link>
      </div>

      {err && (
        <p className="text-center text-xs font-bold text-red-400 mb-3">
          Connexion impossible. Réessaie.
        </p>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.96 }}
        onClick={onStart}
        className="w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest text-black cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #FFD700 100%)',
          boxShadow: '0 8px 40px rgba(245,158,11,0.5)',
        }}>
        JOUER ⭐
      </motion.button>
    </motion.div>
  );
}

// ─── LOADING ──────────────────────────────────────────────────────────────────

function Loading() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-[3px] border-transparent"
        style={{ borderTopColor: '#FFD700', borderRightColor: 'rgba(245,158,11,0.3)' }} />
      <p className="text-sm font-bold text-white/30 uppercase tracking-wider">Chargement du profil...</p>
    </motion.div>
  );
}

// ─── GAME ─────────────────────────────────────────────────────────────────────

function Game({ stmts, idx, ratings, flash, onRate, locked, round }: {
  stmts: DixMaisStatement[];
  idx: number;
  ratings: number[];
  flash: number | null;
  onRate: (n: number) => void;
  locked: boolean;
  round: number;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentScore = ratings.at(-1) ?? 10;
  const current = stmts[idx];
  const pastStmts = stmts.slice(0, idx);

  // Auto-scroll to bottom when new statement appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [idx]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col min-h-0">

      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pb-3 pt-1 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/25">
          Profil #{round + 1} · {idx + 1}/{stmts.length}
        </span>
        <motion.div
          key={currentScore}
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm"
          style={{
            background: `${scoreColor(currentScore)}20`,
            border: `1.5px solid ${scoreColor(currentScore)}50`,
            color: scoreColor(currentScore),
          }}>
          {currentScore}/10
        </motion.div>
      </div>

      {/* Scrollable reveal zone */}
      <div className="flex-1 overflow-y-auto px-5 min-h-0"
        style={{ scrollbarWidth: 'none' }}>

        {/* "C'est un 10" anchor */}
        <div className="text-center mb-3">
          <p className="font-black text-white/20 uppercase tracking-widest text-[11px]">
            Le profil
          </p>
          <p className="font-black text-white leading-none tracking-tight"
            style={{ fontSize: 'clamp(1.6rem, 8vw, 2.5rem)' }}>
            C&apos;EST UN{' '}
            <span style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>10</span>
            {' '}MAIS...
          </p>
        </div>

        {/* Past statements */}
        <AnimatePresence mode="popLayout">
          {pastStmts.map((s, i) => (
            <motion.div key={s.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} layout>
              <PastCard stmt={s} rating={ratings[i]} />
              {/* ET connector */}
              <EtDivider />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Current statement */}
        <AnimatePresence mode="wait">
          <motion.div key={`stmt-${idx}`}
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
            <CurrentCard stmt={current} flash={flash} />
          </motion.div>
        </AnimatePresence>

        <div ref={bottomRef} className="h-3" />
      </div>

      {/* Rating zone — fixed at bottom */}
      <div className="shrink-0 px-5 pb-7 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(16px)' }}>
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">
          Note le profil après tout ça
        </p>
        <RatingGrid onRate={onRate} disabled={locked} />
        <ZeroBtn onRate={onRate} disabled={locked} />
      </div>
    </motion.div>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function EtDivider() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full"
        style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
        ET...
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
    </div>
  );
}

function PastCard({ stmt, rating }: { stmt: DixMaisStatement; rating: number }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <span className="text-sm shrink-0 mt-0.5">{stmt.type === 'positive' ? '🟢' : '🚩'}</span>
      <p className="flex-1 text-sm font-semibold leading-snug text-white/50">{stmt.text}</p>
      <span className="text-sm font-black shrink-0 mt-0.5" style={{ color: scoreColor(rating) }}>
        {rating}/10
      </span>
    </div>
  );
}

function CurrentCard({ stmt, flash }: { stmt: DixMaisStatement; flash: number | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-1"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(255,215,0,0.05) 100%)',
        border: '2px solid rgba(245,158,11,0.35)',
        minHeight: '110px',
      }}>
      {/* Glow */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.18) 0%, transparent 70%)' }} />

      <div className="relative px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-black text-white leading-snug"
            style={{ fontSize: 'clamp(1.1rem, 5.5vw, 1.6rem)' }}>
            {stmt?.text}
          </p>
          <span className="text-xl shrink-0">{stmt?.type === 'positive' ? '🟢' : '🚩'}</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2"
          style={{ color: 'rgba(245,158,11,0.5)' }}>
          NOUVELLE RÉVÉLATION ★
        </p>
      </div>

      {/* Flash overlay */}
      <AnimatePresence>
        {flash !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: `${scoreColor(flash)}22` }}>
            <span className="font-black leading-none"
              style={{ fontSize: '4rem', color: scoreColor(flash), textShadow: `0 0 40px ${scoreColor(flash)}80` }}>
              {flash}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-1"
              style={{ color: scoreColor(flash) }}>
              {scoreLabel(flash)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Rating ───────────────────────────────────────────────────────────────────

const BTN_COLORS: Record<number, string> = {
  1: '#DC2626', 2: '#DC2626', 3: '#EF4444', 4: '#EF4444', 5: '#F59E0B',
  6: '#F59E0B', 7: '#FBBF24', 8: '#FBBF24', 9: '#FFD700', 10: '#FFD700',
};

function RatingGrid({ onRate, disabled }: { onRate: (n: number) => void; disabled: boolean }) {
  return (
    <div className="grid grid-cols-5 gap-2 mb-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
        <motion.button
          key={n}
          whileTap={{ scale: 0.84 }}
          onClick={() => onRate(n)}
          disabled={disabled}
          className="aspect-square rounded-xl font-black flex items-center justify-center cursor-pointer"
          style={{
            fontSize: 'clamp(1.2rem, 5.5vw, 1.7rem)',
            color: '#fff',
            background: `${BTN_COLORS[n]}25`,
            border: `2.5px solid ${BTN_COLORS[n]}`,
            opacity: disabled ? 0.4 : 1,
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
          {n}
        </motion.button>
      ))}
    </div>
  );
}

function ZeroBtn({ onRate, disabled }: { onRate: (n: number) => void; disabled: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => onRate(0)}
      disabled={disabled}
      className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
      style={{
        background: 'rgba(220,38,38,0.12)',
        border: '2px solid rgba(220,38,38,0.45)',
        color: '#EF4444',
        opacity: disabled ? 0.4 : 1,
      }}>
      🚫 ZÉRO — ÉLIMINATOIRE
    </motion.button>
  );
}

// ─── RECAP ────────────────────────────────────────────────────────────────────

function Recap({ result, total, onNext }: { result: RoundResult; total: number; onNext: () => void }) {
  const final   = result.ratings.at(-1) ?? 0;
  const wasElim = final === 0;
  const min     = Math.min(...result.ratings);
  const avg     = (result.ratings.reduce((a, b) => a + b, 0) / result.ratings.length).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col px-5 pb-8 pt-4 overflow-y-auto"
      style={{ scrollbarWidth: 'none' }}>

      {/* Final score hero */}
      <div className="text-center mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Note finale — Profil #{total}</p>
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.1 }}>
          <span className="font-black block leading-none"
            style={{
              fontSize: 'clamp(5rem, 26vw, 9rem)',
              color: scoreColor(final),
              textShadow: `0 0 60px ${scoreColor(final)}55`,
              letterSpacing: '-0.05em',
            }}>
            {final}
          </span>
        </motion.div>
        <p className="font-black text-base uppercase tracking-wide mt-1" style={{ color: scoreColor(final) }}>
          {wasElim ? 'ÉLIMINATOIRE 🚫' : scoreLabel(final)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'infos', value: result.statements.length, color: '#F59E0B' },
          { label: 'min', value: min, color: scoreColor(min) },
          { label: 'moy.', value: avg, color: '#FBBF24' },
        ].map(s => (
          <div key={s.label} className="rounded-xl py-3 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Full recap of statements */}
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3 text-center">
        Récap complet
      </p>

      <div className="flex flex-col gap-0 mb-6">
        {result.statements.map((s, i) => (
          <div key={s.id}>
            {i > 0 && (
              <div className="flex items-center gap-2 py-2">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full"
                  style={{ color: 'rgba(245,158,11,0.5)', background: 'rgba(245,158,11,0.08)' }}>
                  ET...
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-sm shrink-0">{s.type === 'positive' ? '🟢' : '🚩'}</span>
              <p className="flex-1 text-sm font-semibold leading-snug text-white/60">{s.text}</p>
              <span className="text-sm font-black shrink-0" style={{ color: scoreColor(result.ratings[i]) }}>
                {result.ratings[i]}/10
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2 mt-auto">
        <Link href="/dixmais/leaderboard"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
          <Trophy size={14} /> Classement des red flags
        </Link>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onNext}
          className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-black cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #FFD700 100%)',
            boxShadow: '0 6px 30px rgba(245,158,11,0.4)',
          }}>
          PROFIL SUIVANT →
        </motion.button>
      </div>
    </motion.div>
  );
}
