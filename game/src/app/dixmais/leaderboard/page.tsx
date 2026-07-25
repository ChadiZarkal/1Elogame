'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { DixMaisStatement } from '@/types/database';

interface LeaderboardEntry extends DixMaisStatement {
  avg_delta: number;
  elimination_rate: number;
}

type SortKey = 'avg_delta' | 'elimination_rate' | 'votes_count';

function rc(r: number) {
  if (r >= 0) return '#22C55E';
  if (r >= -2) return '#EAB308';
  if (r >= -4) return '#F97316';
  return '#EF4444';
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortKey>('avg_delta');
  const [filter, setFilter] = useState<'all' | 'negative' | 'positive'>('all');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dixmais/leaderboard?limit=100', { cache: 'no-store' });
      const json = await res.json();
      setData(json.data ?? []);
    } catch { setError('Erreur de chargement'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = data
    .filter(s => filter === 'all' || s.type === filter)
    .sort((a, b) => {
      if (sort === 'avg_delta') return a.avg_delta - b.avg_delta;
      if (sort === 'elimination_rate') return b.elimination_rate - a.elimination_rate;
      return b.votes_count - a.votes_count;
    });

  const totalVotes = data.reduce((a, s) => a + s.votes_count, 0);

  return (
    <div className="min-h-dvh text-white pb-10" style={{ background: '#060606' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle,#F59E0B 0%,transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* Nav */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-4">
        <Link href="/dixmais" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors active:scale-95">
          <ArrowLeft size={16} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Jeu</span>
        </Link>
        <button onClick={load} className="text-white/30 hover:text-white/60 transition-colors active:scale-95 cursor-pointer">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-2xl font-black text-white tracking-[-0.03em]">🏆 CLASSEMENT</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Les affirmations les plus red flag
          </p>
          {totalVotes > 0 && (
            <p className="text-[10px] font-bold mt-1" style={{ color: 'rgba(245,158,11,0.5)' }}>
              {totalVotes.toLocaleString()} votes enregistrés
            </p>
          )}
        </motion.div>

        {/* Filters & Sort */}
        <div className="flex gap-2 mb-4">
          <div className="flex gap-1 flex-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {([['all', 'Tous'], ['negative', '🚩 Red'], ['positive', '🟢 Green']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all"
                style={{ background: filter === v ? 'rgba(255,255,255,0.12)' : 'transparent', color: filter === v ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {([['avg_delta', 'Impact'] , ['elimination_rate', 'Élim.'], ['votes_count', 'Votes']] as [SortKey, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setSort(k)}
              className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all"
              style={{ background: sort === k ? '#F59E0B' : 'rgba(255,255,255,0.04)', color: sort === k ? '#000' : 'rgba(255,255,255,0.35)', border: `1px solid ${sort === k ? '#F59E0B' : 'rgba(255,255,255,0.07)'}` }}>
              {l}
            </button>
          ))}
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <p className="text-center text-white/30 py-12">Chargement...</p>
        ) : error ? (
          <p className="text-center text-[#EF4444] py-12">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm font-bold text-white/40">Pas encore de données.</p>
            <p className="text-xs text-white/25 mt-1">Joue quelques parties pour remplir le classement !</p>
            <Link href="/dixmais" className="inline-block mt-5 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-black"
              style={{ background: 'linear-gradient(135deg,#F59E0B,#FFD700)' }}>
              JOUER
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((stmt, i) => (
              <motion.div key={stmt.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                style={{ background: i < 3 ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i < 3 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)'}` }}>
                {/* Rank */}
                <span className="text-base font-black w-7 text-center shrink-0"
                  style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.25)' }}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px]">{stmt.type === 'positive' ? '🟢' : '🚩'}</span>
                    <p className="text-sm font-bold text-white truncate">{stmt.text}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {stmt.votes_count} votes
                    </span>
                    <span className="text-[9px] font-bold" style={{ color: 'rgba(239,68,68,0.7)' }}>
                      🚫 {stmt.elimination_rate.toFixed(0)}% élim.
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}>
                      {stmt.category}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-black leading-none"
                    style={{ color: rc(stmt.avg_delta) }}>
                    {stmt.avg_delta > 0 ? '+' : ''}{stmt.avg_delta.toFixed(1)}
                  </p>
                  <p className="text-[8px] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.3)' }}>impact moy.</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/dixmais"
            className="inline-block px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#FFD700)', boxShadow: '0 10px 30px rgba(245,158,11,0.3)' }}>
            ⭐ JOUER MAINTENANT
          </Link>
        </div>
      </div>
    </div>
  );
}
