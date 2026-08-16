'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Play } from 'lucide-react';
import type { DixMaisStatement } from '@/types/database';

export interface LeaderboardEntry extends DixMaisStatement {
  avg_delta: number;
  elimination_rate: number;
}

type SortKey = 'avg_delta' | 'elimination_rate' | 'votes_count';
type FilterKey = 'all' | 'negative' | 'positive';

function deltaColor(d: number) {
  if (d >= 0) return '#22C55E';
  if (d >= -2) return '#FBBF24';
  if (d >= -4) return '#F59E0B';
  return '#EF4444';
}

/**
 * Le classement est désormais rendu côté serveur et passé en `initialData` :
 * sans cela, le HTML servi se limitait à un indicateur de chargement, pour une
 * page pourtant présente au sitemap. Le rafraîchissement manuel et les filtres
 * restent côté navigateur.
 */
export default function LeaderboardClient({ initialData }: { initialData: LeaderboardEntry[] }) {
  const [data, setData] = useState<LeaderboardEntry[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortKey>('avg_delta');
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dixmais/leaderboard?limit=100', { cache: 'no-store' });
      const json = await res.json();
      setData(json.data ?? []);
    } catch { setError('Erreur de chargement'); }
    finally { setLoading(false); }
  }, []);

  // Le serveur a déjà fourni une liste : on ne refait la requête au montage que
  // si elle est vide (base indisponible à la régénération).
  useEffect(() => {
    if (initialData.length === 0) load();
  }, [initialData.length, load]);

  const filtered = data
    .filter(s => filter === 'all' || s.type === filter)
    .sort((a, b) => {
      if (sort === 'avg_delta') return a.avg_delta - b.avg_delta;
      if (sort === 'elimination_rate') return b.elimination_rate - a.elimination_rate;
      return b.votes_count - a.votes_count;
    });

  const totalVotes = data.reduce((a, s) => a + s.votes_count, 0);
  const worstDelta = data.length ? Math.min(...data.map(d => d.avg_delta)) : null;

  return (
    <div className="relative min-h-[calc(100dvh-var(--header-h,3rem))] text-white pb-10" style={{ background: '#080808' }}>
      {/* `absolute` : décor de cette page, pas de la fenêtre. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse,#F59E0B 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-4">
        <Link href="/dixmais" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft size={16} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Jeu</span>
        </Link>
        <button onClick={load} className="text-white/30 hover:text-white/60 transition-colors cursor-pointer active:scale-90">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl font-black text-white tracking-[-0.03em]">🏆 CLASSEMENT</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Les affirmations les plus red flag
          </p>
          {totalVotes > 0 && (
            <p className="text-[10px] font-bold mt-2 px-3 py-1.5 rounded-full inline-block"
              style={{ color: 'rgba(245,158,11,0.7)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              {totalVotes.toLocaleString()} votes enregistrés
            </p>
          )}
        </motion.div>

        {worstDelta !== null && worstDelta < -3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="mb-5 px-5 py-4 rounded-2xl text-center"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.2)' }}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Pire impact moyen</p>
            <span className="font-black text-3xl" style={{ color: '#EF4444' }}>{worstDelta.toFixed(1)}</span>
            <span className="text-white/30 text-sm ml-1">pts</span>
          </motion.div>
        )}

        <div className="flex gap-2 mb-3">
          <div className="flex gap-1 flex-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {([['all', 'Tous'], ['negative', '🚩 Red'], ['positive', '🟢 Green']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all"
                style={{ background: filter === v ? 'rgba(255,255,255,0.12)' : 'transparent', color: filter === v ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {([['avg_delta', 'Impact'], ['elimination_rate', 'Élim.'], ['votes_count', 'Votes']] as [SortKey, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setSort(k)}
              className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all"
              style={{
                background: sort === k ? '#F59E0B' : 'rgba(255,255,255,0.04)',
                color: sort === k ? '#000' : 'rgba(255,255,255,0.35)',
                border: `1.5px solid ${sort === k ? '#F59E0B' : 'rgba(255,255,255,0.07)'}`,
              }}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-14">
            <div className="inline-block w-8 h-8 rounded-full border-2 border-transparent animate-spin mb-3"
              style={{ borderTopColor: '#FFD700', borderRightColor: 'rgba(245,158,11,0.3)' }} />
            <p className="text-xs text-white/25">Chargement...</p>
          </div>
        ) : error ? (
          <p className="text-center text-[#EF4444] py-12 text-sm font-bold">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-sm font-bold text-white/40">Pas encore de données</p>
            <p className="text-xs text-white/25 mt-1 mb-6">Joue quelques parties pour remplir le classement !</p>
            <Link href="/dixmais"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-black"
              style={{ background: 'linear-gradient(135deg,#F59E0B,#FFD700)' }}>
              <Play size={14} /> JOUER
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((stmt, i) => (
                <motion.div key={`${stmt.id}-${sort}`}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                  style={{
                    background: i < 3 ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i < 3 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  }}>
                  <span className="text-base font-black w-7 text-center shrink-0"
                    style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.25)' }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px]">{stmt.type === 'positive' ? '🟢' : '🚩'}</span>
                      <p className="text-sm font-bold text-white truncate">{stmt.text}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-bold text-white/30">{stmt.votes_count} votes</span>
                      <span className="text-[9px] font-bold" style={{ color: 'rgba(239,68,68,0.6)' }}>
                        🚫 {stmt.elimination_rate.toFixed(0)}% élim.
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white/30"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {stmt.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black leading-none" style={{ color: deltaColor(stmt.avg_delta) }}>
                      {stmt.avg_delta > 0 ? '+' : ''}{stmt.avg_delta.toFixed(1)}
                    </p>
                    <p className="text-[8px] font-bold uppercase tracking-wide text-white/25">impact</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/dixmais"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#FFD700)', boxShadow: '0 10px 30px rgba(245,158,11,0.3)' }}>
            <Play size={16} /> JOUER MAINTENANT
          </Link>
        </div>
      </div>
    </div>
  );
}
