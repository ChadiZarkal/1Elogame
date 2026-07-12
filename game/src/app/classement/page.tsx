'use client';

import Link from 'next/link';
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

const MODE_CONFIG: Record<RankMode, {
  label: string;
  emoji: string;
  color: string;
  soft: string;
  border: string;
  shadow: string;
}> = {
  redflag: {
    label: 'Red Flag',
    emoji: '🚩',
    color: '#EF4444',
    soft: 'rgba(239,68,68,0.14)',
    border: 'rgba(239,68,68,0.35)',
    shadow: '0 10px 30px rgba(239,68,68,0.20)',
  },
  greenflag: {
    label: 'Green Flag',
    emoji: '🟢',
    color: '#10B981',
    soft: 'rgba(16,185,129,0.14)',
    border: 'rgba(16,185,129,0.35)',
    shadow: '0 10px 30px rgba(16,185,129,0.20)',
  },
};

const POPULATION_FILTERS: { value: ViewMode; label: string; emoji: string }[] = [
  { value: 'global', label: 'Tous', emoji: '🌍' },
  { value: 'homme', label: 'Hommes', emoji: '♂️' },
  { value: 'femme', label: 'Femmes', emoji: '♀️' },
];

const AGE_FILTERS: { value: ViewMode; label: string; emoji: string }[] = [
  { value: '16-18', label: '16-18', emoji: '🎓' },
  { value: '19-22', label: '19-22', emoji: '🎯' },
  { value: '23-26', label: '23-26', emoji: '💼' },
  { value: '27+', label: '27+', emoji: '🧠' },
];

const CATEGORY_FILTERS = [
  { value: '', label: 'Toutes categories', emoji: '🌐' },
  { value: 'sexe', label: 'Sexe & Kinks', emoji: '🔥' },
  { value: 'quotidien', label: 'Quotidien', emoji: '🤷' },
  { value: 'metiers', label: 'Metiers', emoji: '💼' },
];

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  sexe: { label: 'Sexe & Kinks', emoji: '🔥' },
  quotidien: { label: 'Quotidien', emoji: '🤷' },
  metiers: { label: 'Metiers', emoji: '💼' },
};

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

function getCategoryMeta(category: string): { label: string; emoji: string } {
  return CATEGORY_META[category] ?? { label: category || 'Autre', emoji: '🏷️' };
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

  useEffect(() => {
    let isActive = true;

    const fetchRankings = async () => {
      const catParam = categoryFilter ? `&category=${categoryFilter}` : '';

      try {
        const [redData, greenData] = await Promise.all([
          fetch(`/api/leaderboard?order=desc${catParam}`).then((r) => r.json()),
          fetch(`/api/leaderboard?order=asc${catParam}`).then((r) => r.json()),
        ]);

        if (!isActive) return;

        if (redData.success) {
          setRedRankings(redData.data.rankings);
          setTotalElements(redData.data.totalElements || 0);
          setTotalVotes(redData.data.totalVotes || 0);
        }
        if (greenData.success) setGreenRankings(greenData.data.rankings);
        if (!redData.success && !greenData.success) setError('Impossible de charger le classement');
      } catch {
        if (isActive) setError('Erreur de connexion');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void fetchRankings();

    return () => {
      isActive = false;
    };
  }, [categoryFilter]);

  const handleCategoryFilterChange = useCallback((nextCategory: string) => {
    if (nextCategory === categoryFilter) return;
    setIsLoading(true);
    setError('');
    setCategoryFilter(nextCategory);
  }, [categoryFilter]);

  const handleResetFilters = useCallback(() => {
    setError('');
    setMode('redflag');
    setView('global');

    if (categoryFilter !== '') {
      setIsLoading(true);
      setCategoryFilter('');
    }
  }, [categoryFilter]);

  const rankings = mode === 'redflag' ? redRankings : greenRankings;

  const sorted = useMemo(() => {
    return [...rankings].sort((a, b) => {
      const dir = mode === 'redflag' ? -1 : 1;
      return dir * (getEloForView(a, view) - getEloForView(b, view));
    });
  }, [rankings, view, mode]);

  const activeMode = MODE_CONFIG[mode];
  const snapshotEntries = sorted.slice(0, 12);

  const selectedPopulationLabel = useMemo(() => {
    const filter = [...POPULATION_FILTERS, ...AGE_FILTERS].find((item) => item.value === view);
    return filter?.label ?? 'Tous';
  }, [view]);

  const selectedCategoryLabel = useMemo(() => {
    const filter = CATEGORY_FILTERS.find((item) => item.value === categoryFilter);
    return filter?.label ?? 'Toutes categories';
  }, [categoryFilter]);

  const maxVotes = useMemo(() => {
    return sorted.reduce((acc, item) => Math.max(acc, item.nb_participations), 0) || 1;
  }, [sorted]);

  const handleShareClassement = useCallback(() => {
    const topLines = sorted
      .slice(0, 5)
      .map((entry, index) => `${index + 1}. ${entry.texte} (${entry.nb_participations} votes)`)
      .join('\n');

    const text = [
      `🏆 ${activeMode.emoji} ${activeMode.label}`,
      `👥 ${selectedPopulationLabel} • 🗂 ${selectedCategoryLabel}`,
      topLines,
      'redorgreen.fr/classement',
    ].join('\n');

    if (navigator.share) {
      navigator.share({ text, url: 'https://redorgreen.fr/classement' }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }, [sorted, activeMode, selectedPopulationLabel, selectedCategoryLabel]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0A0A0A' }}>
        <Loading size="lg" text="Chargement du classement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090C] pb-24">
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-[max(20px,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#FAFAFA] transition-colors py-1"
        >
          ← Accueil
        </Link>

        <header className="mt-4 mb-6">
          <h1 className="text-[28px] sm:text-[36px] leading-tight font-black text-[#FAFAFA] tracking-tight">
            Classement visuel et partageable
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#9CA3AF] max-w-3xl">
            Un seul screenshot doit montrer assez d infos: mode actif, filtres, top 12 et tendances de votes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">🧩 {totalElements} elements</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">🗳 {totalVotes.toLocaleString('fr-FR')} votes</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: activeMode.soft, color: activeMode.color }}>
              {activeMode.emoji} {activeMode.label}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">👥 {selectedPopulationLabel}</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">🗂 {selectedCategoryLabel}</span>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-3xl border p-4 sm:p-5 lg:sticky lg:top-4 h-fit" style={{ background: 'rgba(14,14,17,0.92)', borderColor: '#24262B' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black uppercase tracking-[0.13em] text-[#D1D5DB]">Filtres</h3>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-[#6B7280] hover:text-[#F3F4F6] transition-colors"
              >
                Reinitialiser
              </button>
            </div>

            <div className="space-y-4">
              <section>
                <p className="text-[12px] font-semibold text-[#A1A1AA] mb-2">1) Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(MODE_CONFIG) as RankMode[]).map((item) => {
                    const conf = MODE_CONFIG[item];
                    const selected = mode === item;

                    return (
                      <button
                        key={item}
                        onClick={() => setMode(item)}
                        className="px-2 py-2.5 rounded-xl text-[13px] font-black transition-all"
                        style={selected
                          ? { background: conf.soft, color: conf.color, border: `1.5px solid ${conf.border}` }
                          : { color: '#737373', border: '1.5px solid #27272A', background: '#17181B' }}
                      >
                        {conf.emoji} {conf.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <p className="text-[12px] font-semibold text-[#A1A1AA] mb-2">2) Population</p>
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  {POPULATION_FILTERS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setView(item.value)}
                      className="px-2 py-2 rounded-xl text-[12px] font-semibold transition-all"
                      style={view === item.value
                        ? { background: activeMode.soft, color: activeMode.color, border: `1.5px solid ${activeMode.border}` }
                        : { color: '#737373', border: '1.5px solid #27272A', background: '#17181B' }}
                    >
                      {item.emoji} {item.label}
                    </button>
                  ))}
                </div>

                <p className="text-[12px] font-semibold text-[#A1A1AA] mb-2">Age</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AGE_FILTERS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setView(item.value)}
                      className="px-2 py-2 rounded-xl text-[12px] font-semibold transition-all"
                      style={view === item.value
                        ? { background: activeMode.soft, color: activeMode.color, border: `1.5px solid ${activeMode.border}` }
                        : { color: '#737373', border: '1.5px solid #27272A', background: '#17181B' }}
                    >
                      {item.emoji} {item.label}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-[12px] font-semibold text-[#A1A1AA] mb-2">3) Categorie</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_FILTERS.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryFilterChange(cat.value)}
                      className={`px-2 py-2 rounded-xl text-[12px] font-semibold transition-all ${cat.value === '' ? 'col-span-2' : ''}`}
                      style={categoryFilter === cat.value
                        ? { background: activeMode.soft, color: activeMode.color, border: `1.5px solid ${activeMode.border}` }
                        : { color: '#737373', border: '1.5px solid #27272A', background: '#17181B' }}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          <div className="space-y-5">
            {error && (
              <div className="rounded-2xl p-4 text-center text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {sorted.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-white/10 bg-white/3 text-center py-20"
                >
                  <span className="text-6xl block mb-4">🏜️</span>
                  <p className="text-[#9CA3AF] text-base">Aucun resultat pour ces filtres</p>
                </motion.div>
              ) : (
                <motion.div key={`${mode}-${view}-${categoryFilter}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <section className="rounded-3xl border p-4 sm:p-5" style={{ background: 'rgba(14,14,17,0.88)', borderColor: activeMode.border, boxShadow: activeMode.shadow }}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF] font-black">Capture rapide</p>
                        <h2 className="text-lg sm:text-xl font-black text-[#FAFAFA] mt-1">Top 12 d un coup</h2>
                      </div>
                      <button
                        onClick={handleShareClassement}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-[#D1D5DB] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        📤 Partager
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {snapshotEntries.map((entry, index) => {
                        const isTop3 = index < 3;
                        const votesPercent = Math.round((entry.nb_participations / maxVotes) * 100);
                        const categoryMeta = getCategoryMeta(entry.categorie);

                        return (
                          <motion.div
                            key={`${entry.texte}-${index}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.03, 0.24) }}
                            className="rounded-2xl border p-3.5"
                            style={{
                              background: isTop3 ? activeMode.soft : '#121319',
                              borderColor: isTop3 ? activeMode.border : 'rgba(255,255,255,0.08)',
                            }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black bg-black/30 text-[#E5E7EB]">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'} #{index + 1}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold bg-black/25 text-[#D1D5DB]">
                                {categoryMeta.emoji} {categoryMeta.label}
                              </span>
                            </div>

                            <p className="text-[14px] font-semibold text-[#F3F4F6] leading-snug min-h-11 line-clamp-2">
                              {entry.texte}
                            </p>

                            <div className="mt-2.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#9CA3AF]">Votes</span>
                                <span className="font-semibold text-[#E5E7EB]">{entry.nb_participations}</span>
                              </div>
                              <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.max(votesPercent, 5)}%`, background: activeMode.color }} />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="rounded-3xl border" style={{ background: 'rgba(14,14,17,0.9)', borderColor: '#27292F' }}>
                    <div className="px-4 sm:px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-black uppercase tracking-[0.13em] text-[#D1D5DB]">Classement complet</h3>
                      <p className="text-xs text-[#6B7280]">{sorted.length} lignes</p>
                    </div>

                    <div className="hidden sm:grid grid-cols-[68px_minmax(0,1fr)_110px_150px] gap-3 px-4 sm:px-5 py-2 text-[11px] uppercase tracking-wider text-[#6B7280] border-b border-white/10">
                      <span>Rang</span>
                      <span>Element</span>
                      <span>Votes</span>
                      <span>Categorie</span>
                    </div>

                    <div>
                      {sorted.map((entry, idx) => {
                        const votesPercent = Math.round((entry.nb_participations / maxVotes) * 100);
                        const categoryMeta = getCategoryMeta(entry.categorie);
                        const rank = idx + 1;

                        return (
                          <div
                            key={`${entry.texte}-line-${idx}`}
                            className="relative grid grid-cols-[56px_minmax(0,1fr)_80px] sm:grid-cols-[68px_minmax(0,1fr)_110px_150px] gap-3 px-4 sm:px-5 py-3 border-b border-white/6"
                          >
                            <div
                              className="absolute inset-y-0 left-0"
                              style={{ width: `${Math.max(votesPercent, 4)}%`, background: activeMode.soft }}
                            />

                            <div className="relative z-10 flex items-center">
                              <span className="inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-full bg-black/35 text-[#E5E7EB] text-xs font-black">
                                {rank <= 3 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : rank}
                              </span>
                            </div>

                            <div className="relative z-10 min-w-0">
                              <p className="text-[14px] font-medium text-[#F3F4F6] leading-snug line-clamp-2">{entry.texte}</p>
                            </div>

                            <div className="relative z-10 flex items-center text-sm font-semibold text-[#D1D5DB]">
                              {entry.nb_participations}
                            </div>

                            <div className="relative z-10 hidden sm:flex items-center text-[12px] text-[#9CA3AF]">
                              {categoryMeta.emoji} {categoryMeta.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="mt-8 pb-2 flex flex-col items-center gap-3">
          <motion.a
            href="/jeu"
            className="w-full max-w-xs block px-8 py-4 rounded-2xl font-black text-[16px] text-white transition-transform active:scale-95 text-center"
            style={{ background: activeMode.color, boxShadow: activeMode.shadow }}
            whileTap={{ scale: 0.96 }}
          >
            {activeMode.emoji} Jouer et voter
          </motion.a>
        </section>
      </main>
    </div>
  );
}
