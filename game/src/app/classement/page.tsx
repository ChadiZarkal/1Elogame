'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loading } from '@/components/ui/Loading';

interface RankEntry {
  rank: number;
  texte: string;
  categorie: string;
  elo_global: number;
  elo_homme: number;
  elo_femme: number;
  elo_16_18: number;
  elo_19_22: number;
  elo_23_26: number;
  elo_27plus: number;
  nb_participations: number;
}

type RankMode = 'redflag' | 'greenflag';
type ViewMode = 'global' | 'homme' | 'femme' | '16-18' | '19-22' | '23-26' | '27+';

const VIEW_CONFIG: { value: ViewMode; label: string; emoji: string; group: 'gender' | 'age' }[] = [
  { value: 'global', label: 'Tous', emoji: '🌍', group: 'gender' },
  { value: 'homme', label: 'Hommes', emoji: '♂️', group: 'gender' },
  { value: 'femme', label: 'Femmes', emoji: '♀️', group: 'gender' },
  { value: '16-18', label: '16-18', emoji: '🎓', group: 'age' },
  { value: '19-22', label: '19-22', emoji: '🎯', group: 'age' },
  { value: '23-26', label: '23-26', emoji: '💼', group: 'age' },
  { value: '27+', label: '27+', emoji: '🧠', group: 'age' },
];

const CATEGORY_FILTERS = [
  { value: '', label: 'Toutes', emoji: '🌐' },
  { value: 'sexe', label: 'Sexe & Kinks', emoji: '🔥' },
  { value: 'quotidien', label: 'Quotidien', emoji: '🤷' },
  { value: 'metiers', label: 'Métiers', emoji: '💼' },
];

function getEloForView(r: RankEntry, view: ViewMode): number {
  switch (view) {
    case 'homme': return r.elo_homme;
    case 'femme': return r.elo_femme;
    case '16-18': return r.elo_16_18 ?? r.elo_global;
    case '19-22': return r.elo_19_22 ?? r.elo_global;
    case '23-26': return r.elo_23_26 ?? r.elo_global;
    case '27+': return r.elo_27plus ?? r.elo_global;
    default: return r.elo_global;
  }
}

export default function LeaderboardPage() {
  const [redRankings, setRedRankings] = useState<RankEntry[]>([]);
  const [greenRankings, setGreenRankings] = useState<RankEntry[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<RankMode>('redflag');
  const [view, setView] = useState<ViewMode>('global');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');

  const fetchRankings = useCallback((category: string) => {
    setIsLoading(true);
    setError('');
    const catParam = category ? `&category=${category}` : '';
    Promise.all([
      fetch(`/api/leaderboard?order=desc${catParam}`).then(r => r.json()),
      fetch(`/api/leaderboard?order=asc${catParam}`).then(r => r.json()),
    ])
      .then(([redData, greenData]) => {
        if (redData.success) {
          setRedRankings(redData.data.rankings);
          setTotalElements(redData.data.totalElements || 0);
          setTotalVotes(redData.data.totalVotes || 0);
        }
        if (greenData.success) setGreenRankings(greenData.data.rankings);
        if (!redData.success && !greenData.success) setError('Impossible de charger le classement');
      })
      .catch(() => setError('Erreur de connexion'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchRankings(categoryFilter);
  }, [categoryFilter, fetchRankings]);

  const rankings = mode === 'redflag' ? redRankings : greenRankings;

  const sorted = useMemo(() => {
    return [...rankings].sort((a, b) => {
      const dir = mode === 'redflag' ? -1 : 1;
      return dir * (getEloForView(a, view) - getEloForView(b, view));
    });
  }, [rankings, view, mode]);

  const handleShareClassement = useCallback(() => {
    const top = sorted[0];
    const topText = top ? ` Le n°1 : "${top.texte}"` : '';
    const text = `🏆 Classement Red or Green !${topText}\nViens voter et compare tes résultats →`;
    if (navigator.share) {
      navigator.share({ text, url: 'https://redorgreen.fr/classement' }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} redorgreen.fr/classement`).catch(() => {});
    }
  }, [sorted]);

  const isRed = mode === 'redflag';
  const accent = isRed ? '#EF4444' : '#10B981';
  const accentDim = isRed ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)';
  const accentBorder = isRed ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0A0A0A' }}>
        <Loading size="lg" text="Chargement du classement..." />
      </div>
    );
  }

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="min-h-screen pb-28" style={{ background: '#0A0A0A' }}>

      {/* ── HEADER ── */}
      <div
        className="px-5 pt-[max(20px,env(safe-area-inset-top))] pb-6"
        style={{ background: `linear-gradient(180deg, ${accentDim} 0%, transparent 100%)` }}
      >
        <div className="max-w-md mx-auto">
          <a
            href="/"
            className="text-[#6B7280] hover:text-[#FAFAFA] text-sm mb-5 flex items-center gap-1.5 transition-colors py-1"
          >
            ← Accueil
          </a>

          <div className="text-center mb-6">
            <h1 className="text-[26px] sm:text-[30px] font-black text-[#FAFAFA] tracking-tight">
              🏆 Classement
            </h1>
            <div className="flex justify-center items-center gap-3 mt-2 text-[13px] text-[#6B7280]">
              <span>{totalElements} éléments</span>
              <span className="text-[#333]">•</span>
              <span>{totalVotes.toLocaleString('fr-FR')} votes</span>
            </div>
          </div>

          {/* RED / GREEN toggle - larger touch targets */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex p-1.5 rounded-2xl w-full max-w-xs" style={{ background: '#141414', border: '1px solid #2A2A2A' }}>
              <button
                onClick={() => setMode('redflag')}
                className="flex-1 py-3 rounded-xl text-[15px] font-black transition-all"
                style={isRed
                  ? { background: '#EF4444', color: '#fff', boxShadow: '0 4px 20px rgba(239,68,68,0.4)' }
                  : { color: '#6B7280' }}
              >
                🚩 Red Flag
              </button>
              <button
                onClick={() => setMode('greenflag')}
                className="flex-1 py-3 rounded-xl text-[15px] font-black transition-all"
                style={!isRed
                  ? { background: '#10B981', color: '#fff', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }
                  : { color: '#6B7280' }}
              >
                🟢 Green Flag
              </button>
            </div>
          </div>

          {/* Segment filter — two rows for clarity */}
          <div className="space-y-3">
            {/* Gender/Age view filter */}
            <div className="overflow-x-auto -mx-5 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-2 w-max">
                {VIEW_CONFIG.map((v, i) => (
                  <span key={v.value} className="contents">
                    {i > 0 && VIEW_CONFIG[i - 1].group !== v.group && (
                      <span className="text-[#333] text-sm mx-0.5 select-none">|</span>
                    )}
                    <button
                      onClick={() => setView(v.value)}
                      className="text-[13px] px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap"
                      style={view === v.value
                        ? { background: accentDim, color: accent, border: `1.5px solid ${accentBorder}` }
                        : { color: '#6B7280', border: '1.5px solid transparent', background: 'rgba(255,255,255,0.03)' }}
                    >
                      {v.emoji} {v.label}
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="overflow-x-auto -mx-5 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-2 w-max">
                {CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className="text-[13px] px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap"
                    style={categoryFilter === cat.value
                      ? { background: accentDim, color: accent, border: `1.5px solid ${accentBorder}` }
                      : { color: '#555', border: '1.5px solid transparent', background: 'rgba(255,255,255,0.03)' }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto px-5 mb-4">
          <div className="rounded-2xl p-4 text-center text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
            {error}
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-5">
        <AnimatePresence mode="wait">
          {sorted.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <span className="text-6xl block mb-4">🏜️</span>
              <p className="text-[#6B7280] text-base">Aucun résultat pour ces filtres</p>
            </motion.div>
          ) : (
            <motion.div key={mode + view + categoryFilter} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Section title */}
              <p className="text-center text-[12px] font-bold uppercase tracking-[0.15em] mb-5 mt-3" style={{ color: '#4B5563' }}>
                {isRed ? '🚩 Les plus Red Flag' : '🟢 Les plus Green Flag'}
              </p>

              {/* ── TOP 3 PODIUM ── */}
              {top3.length >= 1 && (
                <div className="mb-8">
                  {/* #1 — Hero card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl p-5 mb-4 relative overflow-hidden"
                    style={{
                      background: isRed
                        ? 'linear-gradient(160deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)'
                        : 'linear-gradient(160deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)',
                      border: `1.5px solid ${accentBorder}`,
                      boxShadow: `0 8px 40px ${isRed ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className="text-2xl">👑</span>
                        <span className="text-3xl">🥇</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#FAFAFA] text-[16px] sm:text-[18px] font-bold leading-snug mb-3">
                          {top3[0].texte}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[28px] font-black" style={{ color: accent }}>
                            {getEloForView(top3[0], view)}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                            ELO
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* #2 and #3 side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    {top3[1] && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-2xl p-4"
                        style={{
                          background: 'linear-gradient(160deg, rgba(156,163,175,0.12) 0%, rgba(156,163,175,0.04) 100%)',
                          border: '1px solid rgba(156,163,175,0.25)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🥈</span>
                          <span className="text-[11px] font-bold text-[#6B7280] uppercase">#2</span>
                        </div>
                        <p className="text-[#FAFAFA] text-[14px] font-semibold leading-snug mb-3 line-clamp-3">
                          {top3[1].texte}
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[20px] font-black" style={{ color: '#9CA3AF' }}>
                            {getEloForView(top3[1], view)}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">ELO</span>
                        </div>
                      </motion.div>
                    )}

                    {top3[2] && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl p-4"
                        style={{
                          background: isRed
                            ? 'linear-gradient(160deg, rgba(217,119,6,0.12) 0%, rgba(217,119,6,0.04) 100%)'
                            : 'linear-gradient(160deg, rgba(110,231,183,0.12) 0%, rgba(110,231,183,0.04) 100%)',
                          border: isRed ? '1px solid rgba(217,119,6,0.25)' : '1px solid rgba(110,231,183,0.25)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🥉</span>
                          <span className="text-[11px] font-bold text-[#6B7280] uppercase">#3</span>
                        </div>
                        <p className="text-[#FAFAFA] text-[14px] font-semibold leading-snug mb-3 line-clamp-3">
                          {top3[2].texte}
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[20px] font-black" style={{ color: isRed ? '#F59E0B' : '#6EE7B7' }}>
                            {getEloForView(top3[2], view)}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">ELO</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* ── REST OF LIST ── */}
              {rest.length > 0 && (
                <div className="space-y-2.5">
                  {rest.map((entry, idx) => {
                    const elo = getEloForView(entry, view);
                    const maxElo = getEloForView(sorted[0], view) || 1;
                    const minElo = getEloForView(sorted[sorted.length - 1], view) || 0;
                    const range = maxElo - minElo || 1;
                    const percent = isRed
                      ? ((elo - minElo) / range) * 100
                      : ((maxElo - elo) / range) * 100;

                    return (
                      <motion.div
                        key={entry.texte}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                        className="rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden"
                        style={{ background: '#141414', border: '1px solid #1F1F1F' }}
                      >
                        {/* Progress bar bg */}
                        <div
                          className="absolute left-0 top-0 bottom-0 rounded-2xl transition-all"
                          style={{ width: `${Math.max(percent, 3)}%`, background: isRed ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)' }}
                        />
                        {/* Rank badge */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[14px] shrink-0 z-10"
                          style={{ background: '#1F1F1F', color: '#9CA3AF' }}
                        >
                          {idx + 4}
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0 z-10">
                          <p className="text-[#F0F0F0] text-[15px] font-medium leading-snug">
                            {entry.texte}
                          </p>
                          <p className="text-[#555] text-[12px] mt-1">
                            {entry.nb_participations} votes
                          </p>
                        </div>
                        {/* ELO */}
                        <div className="text-right shrink-0 z-10 pl-2">
                          <p className="text-[20px] font-black leading-none" style={{ color: '#FAFAFA' }}>
                            {elo}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: accent }}>
                            ELO
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* CTA + Share */}
              <div className="mt-10 flex flex-col items-center gap-4">
                <motion.a
                  href="/jeu"
                  className="w-full max-w-xs block px-8 py-4 rounded-2xl font-black text-[16px] text-white transition-transform active:scale-95 text-center"
                  style={{ background: accent, boxShadow: `0 8px 32px ${isRed ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}` }}
                  whileTap={{ scale: 0.96 }}
                >
                  {isRed ? '🚩 Jouer et voter !' : '🟢 Jouer et voter !'}
                </motion.a>
                <button
                  onClick={handleShareClassement}
                  className="text-[#6B7280] hover:text-[#FAFAFA] text-[14px] flex items-center gap-2 transition-colors py-3 px-5"
                >
                  📤 Partager le classement
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
