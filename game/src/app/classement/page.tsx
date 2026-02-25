'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  { value: 'lifestyle', label: 'Lifestyle', emoji: '🎯' },
  { value: 'sexe', label: 'Sexe & Kinks', emoji: '🔥' },
  { value: 'quotidien', label: 'Quotidien', emoji: '🤷' },
  { value: 'bureau', label: 'Bureau', emoji: '💼' },
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
  const router = useRouter();
  const [redRankings, setRedRankings] = useState<RankEntry[]>([]);
  const [greenRankings, setGreenRankings] = useState<RankEntry[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<RankMode>('redflag');
  const [view, setView] = useState<ViewMode>('global');
  const [filterType, setFilterType] = useState<'gender' | 'age'>('gender');
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

  const isRed = mode === 'redflag';
  const accent = isRed ? '#EF4444' : '#10B981';
  const accentDim = isRed ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)';
  const accentBorder = isRed ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0A0A0A' }}>
        <Loading size="lg" text="Chargement du classement..." />
      </div>
    );
  }

  const visibleFilters = VIEW_CONFIG.filter(v => v.group === filterType);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0A0A0A' }}>

      {/* ── HEADER ── */}
      <div className="px-4 pt-[max(16px,env(safe-area-inset-top))] pb-5"
        style={{ background: `linear-gradient(180deg, ${accentDim} 0%, transparent 100%)` }}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => router.push('/')}
            className="text-[#6B7280] hover:text-[#FAFAFA] text-sm mb-4 flex items-center gap-1 transition-colors py-1"
          >
            ← Accueil
          </button>

          <div className="text-center">
            <h1 className="text-[28px] font-black text-[#FAFAFA] tracking-tight">
              🏆 Statistiques
            </h1>
            <div className="flex justify-center items-center gap-3 mt-1.5 text-xs text-[#6B7280]">
              <span>{totalElements} comportements</span>
              <span className="text-[#333]">•</span>
              <span>{totalVotes.toLocaleString('fr-FR')} votes</span>
            </div>
          </div>

          {/* RED / GREEN toggle */}
          <div className="flex justify-center mt-5">
            <div className="inline-flex p-1 rounded-full" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <button
                onClick={() => setMode('redflag')}
                className="px-5 py-2.5 rounded-full text-sm font-black transition-all"
                style={isRed
                  ? { background: '#EF4444', color: '#fff', boxShadow: '0 0 20px rgba(239,68,68,0.4)' }
                  : { color: '#6B7280' }}
              >
                🚩 Red Flag
              </button>
              <button
                onClick={() => setMode('greenflag')}
                className="px-5 py-2.5 rounded-full text-sm font-black transition-all"
                style={!isRed
                  ? { background: '#10B981', color: '#fff', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }
                  : { color: '#6B7280' }}
              >
                🟢 Green Flag
              </button>
            </div>
          </div>

          {/* Sexe / Âge */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {['gender', 'age'].map((ft) => (
              <button
                key={ft}
                onClick={() => { setFilterType(ft as 'gender' | 'age'); setView(ft === 'gender' ? 'global' : '16-18'); }}
                className="text-xs px-3.5 py-2 rounded-full font-medium transition-all"
                style={filterType === ft
                  ? { background: 'rgba(255,255,255,0.1)', color: '#FAFAFA', border: '1px solid rgba(255,255,255,0.2)' }
                  : { color: '#6B7280', border: '1px solid transparent' }}
              >
                {ft === 'gender' ? '👤 Sexe' : '📊 Âge'}
              </button>
            ))}
            <span className="text-[#333] text-sm">|</span>
            {visibleFilters.map((v) => (
              <button
                key={v.value}
                onClick={() => setView(v.value)}
                className="text-xs px-3.5 py-2 rounded-full font-medium transition-all"
                style={view === v.value
                  ? { background: accentDim, color: accent, border: `1px solid ${accentBorder}` }
                  : { color: '#6B7280', border: '1px solid transparent' }}
              >
                {v.emoji} {v.label}
              </button>
            ))}
          </div>

          {/* Category */}
          <div className="flex justify-center gap-2 mt-2 flex-wrap">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={categoryFilter === cat.value
                  ? { background: accentDim, color: accent, border: `1px solid ${accentBorder}` }
                  : { color: '#555', border: '1px solid transparent' }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-lg mx-auto px-4 mb-4">
          <div className="rounded-xl p-4 text-center text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>{error}</div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4">

        {/* ── PODIUM ── */}
        <AnimatePresence mode="wait">
          {sorted.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <span className="text-5xl block mb-3">🏜️</span>
              <p className="text-[#6B7280] text-sm">Aucun résultat pour ces filtres</p>
            </motion.div>
          ) : (
            <motion.div key={mode + view + categoryFilter} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Podium label */}
              <p className="text-center text-[11px] font-bold uppercase tracking-widest mb-4 mt-2" style={{ color: '#4B5563' }}>
                {isRed ? '🚩 Les plus Red Flag' : '🟢 Les plus Green Flag'}
              </p>

              {/* Top 3 */}
              {top3.length >= 1 && (
                <div className="flex items-end justify-center gap-3 mb-6">
                  {/* 2nd */}
                  {top3[1] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex-1 flex flex-col items-center rounded-2xl p-3 pb-4"
                      style={{
                        background: isRed
                          ? 'linear-gradient(170deg, rgba(156,163,175,0.18) 0%, rgba(156,163,175,0.06) 100%)'
                          : 'linear-gradient(170deg, rgba(156,163,175,0.18) 0%, rgba(156,163,175,0.06) 100%)',
                        border: '1px solid rgba(156,163,175,0.35)',
                        minHeight: '130px',
                      }}
                    >
                      <span className="text-2xl mb-2">🥈</span>
                      <p className="text-[#FAFAFA] text-[12px] font-semibold text-center leading-snug mb-2 line-clamp-3 w-full">
                        {top3[1].texte}
                      </p>
                      <p className="text-[17px] font-black" style={{ color: '#9CA3AF' }}>
                        {getEloForView(top3[1], view)}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: '#6B7280' }}>ELO</p>
                    </motion.div>
                  )}

                  {/* 1st — tallest */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 flex flex-col items-center rounded-2xl p-3 pb-4 relative"
                    style={{
                      background: isRed
                        ? 'linear-gradient(170deg, rgba(239,68,68,0.28) 0%, rgba(239,68,68,0.08) 100%)'
                        : 'linear-gradient(170deg, rgba(16,185,129,0.28) 0%, rgba(16,185,129,0.08) 100%)',
                      border: `1px solid ${accentBorder}`,
                      boxShadow: `0 0 30px ${isRed ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                      minHeight: '170px',
                    }}
                  >
                    {/* Crown glow */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</div>
                    <span className="text-3xl mb-2 mt-2">🥇</span>
                    <p className="text-[#FAFAFA] text-[13px] font-bold text-center leading-snug mb-2 line-clamp-3 w-full">
                      {top3[0].texte}
                    </p>
                    <p className="text-[22px] font-black" style={{ color: accent }}>
                      {getEloForView(top3[0], view)}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: accent }}>ELO</p>
                  </motion.div>

                  {/* 3rd */}
                  {top3[2] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex-1 flex flex-col items-center rounded-2xl p-3 pb-4"
                      style={{
                        background: isRed
                          ? 'linear-gradient(170deg, rgba(217,119,6,0.18) 0%, rgba(217,119,6,0.06) 100%)'
                          : 'linear-gradient(170deg, rgba(110,231,183,0.18) 0%, rgba(110,231,183,0.06) 100%)',
                        border: isRed ? '1px solid rgba(217,119,6,0.35)' : '1px solid rgba(110,231,183,0.35)',
                        minHeight: '110px',
                      }}
                    >
                      <span className="text-2xl mb-2">🥉</span>
                      <p className="text-[#FAFAFA] text-[12px] font-semibold text-center leading-snug mb-2 line-clamp-3 w-full">
                        {top3[2].texte}
                      </p>
                      <p className="text-[17px] font-black" style={{ color: isRed ? '#F59E0B' : '#6EE7B7' }}>
                        {getEloForView(top3[2], view)}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: '#6B7280' }}>ELO</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── REST OF LIST ── */}
              {rest.length > 0 && (
                <div className="space-y-2">
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
                        className="rounded-xl p-3.5 flex items-center gap-3 relative overflow-hidden"
                        style={{ background: '#161616', border: '1px solid #222' }}
                      >
                        {/* Progress bar bg */}
                        <div
                          className="absolute left-0 top-0 bottom-0 rounded-xl transition-all"
                          style={{ width: `${Math.max(percent, 2)}%`, background: isRed ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)' }}
                        />
                        {/* Rank badge */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 z-10"
                          style={{ background: '#222', color: '#9CA3AF' }}
                        >
                          {idx + 4}
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0 z-10">
                          <p className="text-[#F0F0F0] text-sm font-medium leading-snug">{entry.texte}</p>
                          <p className="text-[#555] text-[11px] mt-0.5">{entry.categorie} · {entry.nb_participations} votes</p>
                        </div>
                        {/* ELO */}
                        <div className="text-right flex-shrink-0 z-10 pl-1">
                          <p className="text-[18px] font-black leading-none" style={{ color: '#FAFAFA' }}>{elo}</p>
                          <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: accent }}>ELO</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 text-center">
                <motion.button
                  onClick={() => router.push('/jeu')}
                  className="px-8 py-3.5 rounded-2xl font-black text-base text-white transition-transform active:scale-95"
                  style={{ background: accent, boxShadow: `0 0 30px ${isRed ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}` }}
                  whileTap={{ scale: 0.96 }}
                >
                  {isRed ? '🚩 Jouer et voter !' : '🟢 Jouer et voter !'}
                </motion.button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

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
  { value: 'lifestyle', label: 'Lifestyle', emoji: '🎯' },
  { value: 'sexe', label: 'Sexe & Kinks', emoji: '🔥' },
  { value: 'quotidien', label: 'Quotidien', emoji: '🤷' },
  { value: 'bureau', label: 'Bureau', emoji: '💼' },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [redRankings, setRedRankings] = useState<RankEntry[]>([]);
  const [greenRankings, setGreenRankings] = useState<RankEntry[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<RankMode>('redflag');
  const [view, setView] = useState<ViewMode>('global');
  const [filterType, setFilterType] = useState<'gender' | 'age'>('gender');
  const [categoryFilter, setCategoryFilter] = useState(''); // '' = all categories
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
      const eloA = getEloForView(a, view);
      const eloB = getEloForView(b, view);
      return dir * (eloA - eloB);
    });
  }, [rankings, view, mode]);

  const isRed = mode === 'redflag';
  const accent = isRed ? '#DC2626' : '#059669';
  const accentLight = isRed ? '#EF4444' : '#34D399';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement du classement..." />
      </div>
    );
  }

  const visibleFilters = VIEW_CONFIG.filter(v => v.group === filterType);

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-20 px-3">
      {/* Header */}
      <div className="pt-8 pb-5 px-4" style={{ background: `linear-gradient(to bottom, ${accent}15, transparent)` }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.push('/')} className="text-[#737373] hover:text-[#F5F5F5] text-sm mb-3 py-2 px-3 -ml-3 block transition-colors rounded-lg">
            ← Accueil
          </button>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-[#F5F5F5] text-center">
              🏆 <AnimatedGradientText className="text-3xl font-black">Classement</AnimatedGradientText>
            </h1>
          </motion.div>

          {/* Stats bar */}
          <div className="flex justify-center gap-4 mt-2 text-xs text-[#737373]">
            <span>{totalElements} éléments</span>
            <span>•</span>
            <span>{totalVotes.toLocaleString()} votes</span>
          </div>

          {/* RED / GREEN mode toggle */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex bg-[#1A1A1A] border border-[#333] rounded-full p-1">
              <button
                onClick={() => setMode('redflag')}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  isRed
                    ? 'bg-[#DC2626] text-white shadow-lg shadow-[#DC2626]/30'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
                }`}
              >
                🚩 Red Flag
              </button>
              <button
                onClick={() => setMode('greenflag')}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  !isRed
                    ? 'bg-[#059669] text-white shadow-lg shadow-[#059669]/30'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
                }`}
              >
                🟢 Green Flag
              </button>
            </div>
          </div>

          {/* Filters: collapsed into a single scrollable row */}
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {/* Gender/Age type toggle */}
            <button
              onClick={() => { setFilterType('gender'); setView('global'); }}
              className={`text-xs px-3.5 py-2.5 min-h-[44px] rounded-full font-medium transition-all flex items-center ${
                filterType === 'gender'
                  ? 'bg-[#F5F5F5]/10 text-[#F5F5F5] border border-[#F5F5F5]/20'
                  : 'text-[#737373] hover:text-[#A3A3A3]'
              }`}
            >
              👤 Sexe
            </button>
            <button
              onClick={() => { setFilterType('age'); setView('16-18'); }}
              className={`text-xs px-3.5 py-2.5 min-h-[44px] rounded-full font-medium transition-all flex items-center ${
                filterType === 'age'
                  ? 'bg-[#F5F5F5]/10 text-[#F5F5F5] border border-[#F5F5F5]/20'
                  : 'text-[#737373] hover:text-[#A3A3A3]'
              }`}
            >
              📊 Âge
            </button>
            <span className="text-[#333] self-center">|</span>
            {/* Inline view options */}
            {visibleFilters.map((v) => (
              <button key={v.value} onClick={() => setView(v.value)}
                className={`px-3.5 py-2.5 min-h-[44px] rounded-full text-xs font-medium transition-all flex items-center ${
                  view === v.value
                    ? 'bg-[#F5F5F5]/10 text-[#F5F5F5] border border-[#F5F5F5]/20'
                    : 'text-[#737373] hover:text-[#A3A3A3]'
                }`}>
                {v.emoji} {v.label}
              </button>
            ))}
          </div>

          {/* Category filter - compact */}
          <div className="flex justify-center gap-2 mt-2 flex-wrap">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-3.5 py-2.5 min-h-[44px] rounded-full text-xs font-medium transition-all flex items-center ${
                  categoryFilter === cat.value
                    ? 'bg-[#DC2626]/20 text-[#FCA5A5] border border-[#DC2626]/30'
                    : 'text-[#555] hover:text-[#A3A3A3]'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto px-4 mb-4">
          <div className="bg-[#991B1B]/20 border border-[#DC2626]/50 rounded-xl p-4 text-[#FCA5A5] text-center">{error}</div>
        </div>
      )}

      {/* Subtitle */}
      <div className="max-w-2xl mx-auto px-4 mb-4">
        <p className="text-center text-sm" style={{ color: accentLight }}>
          {isRed
            ? 'Les comportements jugés les pires par la communauté'
            : 'Les comportements jugés les plus acceptables'}
          {categoryFilter && (() => {
            const cat = CATEGORY_FILTERS.find(c => c.value === categoryFilter);
            return <span className="text-[#737373]">{' '}— {cat?.emoji} {cat?.label}</span>;
          })()}
          {view !== 'global' && (() => {
            const v = VIEW_CONFIG.find(v => v.value === view);
            return <span className="text-[#737373]">{' '}— {v?.emoji} {v?.label}</span>;
          })()}
        </p>
      </div>

      {/* Podium (top 3) */}
      <AnimatePresence mode="wait">
        {sorted.length >= 3 ? (
          <motion.div
            key={mode + view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto px-4 mb-6"
          >
            <div className="flex items-end justify-center gap-2 sm:gap-3 h-52">
              <PodiumCard rank={2} entry={sorted[1]} elo={getEloForView(sorted[1], view)} height="h-32" isRed={isRed} />
              <PodiumCard rank={1} entry={sorted[0]} elo={getEloForView(sorted[0], view)} height="h-44" isRed={isRed} />
              <PodiumCard rank={3} entry={sorted[2]} elo={getEloForView(sorted[2], view)} height="h-24" isRed={isRed} />
            </div>
          </motion.div>
        ) : sorted.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto px-4 mb-6 text-center py-12"
          >
            <span className="text-5xl mb-4 block">🏜️</span>
            <p className="text-[#A3A3A3] text-sm">Aucun résultat pour ces filtres</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Ranking list (4th+) */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-2">
          {sorted.slice(3).map((entry, idx) => {
            const elo = getEloForView(entry, view);
            const maxElo = getEloForView(sorted[0], view) || 1;
            const minElo = getEloForView(sorted[sorted.length - 1], view) || 0;
            const range = maxElo - minElo || 1;
            const percent = isRed
              ? ((elo - minElo) / range) * 100
              : ((maxElo - elo) / range) * 100;

            return (
              <motion.div key={entry.texte} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                className="bg-[#1A1A1A] border border-[#333] rounded-xl p-3 flex items-center gap-3 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{ width: `${percent}%`, backgroundColor: accent }}
                />
                <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#737373] font-bold text-sm flex-shrink-0 z-10">
                  {idx + 4}
                </div>
                <div className="flex-1 min-w-0 z-10">
                  <p className="text-[#F5F5F5] text-sm truncate">{entry.texte}</p>
                  <p className="text-[#737373] text-xs">{entry.categorie} • {entry.nb_participations} votes</p>
                </div>
                <div className="text-right flex-shrink-0 z-10">
                  <p className="text-lg font-bold text-[#F5F5F5]">{elo}</p>
                  <p className="text-[10px]" style={{ color: accentLight }}>ELO</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-4 mt-8 text-center">
        <motion.button
          onClick={() => router.push('/jeu')}
          className="px-8 py-3 text-white rounded-xl font-bold text-lg transition-colors"
          style={{
            backgroundColor: accent,
            boxShadow: `0 0 30px ${accent}44`,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRed ? '🚩 Jouer et voter !' : '🟢 Jouer et voter !'}
        </motion.button>
      </div>
    </div>
  );
}

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

function PodiumCard({ rank, entry, elo, height, isRed }: {
  rank: number; entry: RankEntry; elo: number; height: string; isRed: boolean;
}) {
  const medals = ['🥇', '🥈', '🥉'];

  const redColors = [
    'bg-gradient-to-t from-[#FCD34D]/20 to-[#FCD34D]/5 border-[#FCD34D]/40',
    'bg-gradient-to-t from-[#A3A3A3]/20 to-[#A3A3A3]/5 border-[#A3A3A3]/40',
    'bg-gradient-to-t from-[#D97706]/20 to-[#D97706]/5 border-[#D97706]/40',
  ];
  const greenColors = [
    'bg-gradient-to-t from-[#34D399]/20 to-[#34D399]/5 border-[#34D399]/40',
    'bg-gradient-to-t from-[#A3A3A3]/20 to-[#A3A3A3]/5 border-[#A3A3A3]/40',
    'bg-gradient-to-t from-[#6EE7B7]/20 to-[#6EE7B7]/5 border-[#6EE7B7]/40',
  ];

  const colors = isRed ? redColors : greenColors;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank === 1 ? 0.2 : rank === 2 ? 0.1 : 0.3 }}
      className={`${height} w-[7.5rem] sm:w-40 ${colors[rank - 1]} border rounded-t-xl flex flex-col items-center justify-end p-3`}
    >
      <span className="text-2xl mb-1">{medals[rank - 1]}</span>
      <p className="text-[#F5F5F5] text-xs text-center font-medium leading-tight line-clamp-2 mb-1">
        {entry.texte}
      </p>
      <p className="text-[#F5F5F5] font-bold text-lg">{elo}</p>
      <p className="text-[10px]" style={{ color: isRed ? '#EF4444' : '#34D399' }}>ELO</p>
    </motion.div>
  );
}