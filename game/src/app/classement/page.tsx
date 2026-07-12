'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

type RankedEntry = {
  rank: number;
  entry: RankEntry;
  elo: number;
};

const MODE_CONFIG: Record<
  RankMode,
  {
    label: string;
    emoji: string;
    color: string;
    soft: string;
    border: string;
    shadow: string;
  }
> = {
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
    case 'homme':
      return r.elo_homme;
    case 'femme':
      return r.elo_femme;
    case '16-18':
      return r.elo_16_18 ?? r.elo_global;
    case '19-22':
      return r.elo_19_22 ?? r.elo_global;
    case '23-26':
      return r.elo_23_26 ?? r.elo_global;
    case '27+':
      return r.elo_27plus ?? r.elo_global;
    default:
      return r.elo_global;
  }
}

function getCategoryMeta(category: string): { label: string; emoji: string } {
  return CATEGORY_META[category] ?? { label: category || 'Autre', emoji: '🏷️' };
}

function getWallColumns(entries: RankedEntry[]): RankedEntry[][] {
  if (entries.length === 0) {
    return [];
  }

  const columnCount = entries.length >= 42 ? 3 : entries.length >= 18 ? 2 : 1;
  const chunkSize = Math.ceil(entries.length / columnCount);

  return Array.from({ length: columnCount }, (_, index) =>
    entries.slice(index * chunkSize, (index + 1) * chunkSize),
  );
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

        if (!isActive) {
          return;
        }

        if (redData.success) {
          setRedRankings(redData.data.rankings);
          setTotalElements(redData.data.totalElements || 0);
          setTotalVotes(redData.data.totalVotes || 0);
        }

        if (greenData.success) {
          setGreenRankings(greenData.data.rankings);
        }

        if (!redData.success && !greenData.success) {
          setError('Impossible de charger le classement');
        }
      } catch {
        if (isActive) {
          setError('Erreur de connexion');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchRankings();

    return () => {
      isActive = false;
    };
  }, [categoryFilter]);

  const handleCategoryFilterChange = useCallback(
    (nextCategory: string) => {
      if (nextCategory === categoryFilter) {
        return;
      }

      setIsLoading(true);
      setError('');
      setCategoryFilter(nextCategory);
    },
    [categoryFilter],
  );

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
      const direction = mode === 'redflag' ? -1 : 1;
      return direction * (getEloForView(a, view) - getEloForView(b, view));
    });
  }, [rankings, view, mode]);

  const rankedEntries = useMemo<RankedEntry[]>(() => {
    return sorted.map((entry, index) => ({
      rank: index + 1,
      entry,
      elo: getEloForView(entry, view),
    }));
  }, [sorted, view]);

  const wallColumns = useMemo(() => getWallColumns(rankedEntries), [rankedEntries]);

  const topElo = rankedEntries[0]?.elo ?? 0;
  const floorElo = rankedEntries[rankedEntries.length - 1]?.elo ?? 0;
  const eloSpread = Math.max(1, topElo - floorElo);

  const selectedPopulationLabel = useMemo(() => {
    const filter = [...POPULATION_FILTERS, ...AGE_FILTERS].find((item) => item.value === view);
    return filter?.label ?? 'Tous';
  }, [view]);

  const selectedCategoryLabel = useMemo(() => {
    const filter = CATEGORY_FILTERS.find((item) => item.value === categoryFilter);
    return filter?.label ?? 'Toutes categories';
  }, [categoryFilter]);

  const topCategorySlices = useMemo(() => {
    const byCategory = new Map<string, { count: number; bestRank: number }>();

    rankedEntries.slice(0, 24).forEach((item) => {
      const key = item.entry.categorie || 'autre';
      const current = byCategory.get(key);

      if (current) {
        current.count += 1;
        current.bestRank = Math.min(current.bestRank, item.rank);
        return;
      }

      byCategory.set(key, { count: 1, bestRank: item.rank });
    });

    return Array.from(byCategory.entries())
      .map(([key, value]) => ({
        key,
        count: value.count,
        bestRank: value.bestRank,
        ...getCategoryMeta(key),
      }))
      .sort((a, b) => a.bestRank - b.bestRank);
  }, [rankedEntries]);

  const handleShareClassement = useCallback(() => {
    const topLines = rankedEntries
      .slice(0, 8)
      .map(
        (item) =>
          `${item.rank}. ${item.entry.texte} - ELO ${item.elo} - ${item.entry.nb_participations} votes`,
      )
      .join('\n');

    const text = [
      `🏆 ${MODE_CONFIG[mode].emoji} ${MODE_CONFIG[mode].label}`,
      `Tri principal: ELO (classement)`,
      `👥 ${selectedPopulationLabel} • 🗂 ${selectedCategoryLabel}`,
      topLines,
      'redorgreen.fr/classement',
    ].join('\n');

    if (navigator.share) {
      navigator.share({ text, url: 'https://redorgreen.fr/classement' }).catch(() => {});
      return;
    }

    navigator.clipboard.writeText(text).catch(() => {});
  }, [rankedEntries, mode, selectedPopulationLabel, selectedCategoryLabel]);

  const activeMode = MODE_CONFIG[mode];

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
            Mur de classement ultra dense
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#9CA3AF] max-w-4xl">
            Le rang est calcule par le score ELO. Le nombre de votes est affiche a part, pour le contexte.
            Pas de confusion possible entre classement et popularite.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">
              🧩 {totalElements} elements
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">
              🗳 {totalVotes.toLocaleString('fr-FR')} votes
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: activeMode.soft, color: activeMode.color }}
            >
              {activeMode.emoji} {activeMode.label}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">
              👥 {selectedPopulationLabel}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">
              🗂 {selectedCategoryLabel}
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: activeMode.soft, color: activeMode.color }}
            >
              🎯 Tri principal: ELO
            </span>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside
            className="rounded-3xl border p-4 sm:p-5 lg:sticky lg:top-4 h-fit"
            style={{ background: 'rgba(14,14,17,0.92)', borderColor: '#24262B' }}
          >
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
                        style={
                          selected
                            ? {
                                background: conf.soft,
                                color: conf.color,
                                border: `1.5px solid ${conf.border}`,
                              }
                            : {
                                color: '#737373',
                                border: '1.5px solid #27272A',
                                background: '#17181B',
                              }
                        }
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
                      style={
                        view === item.value
                          ? {
                              background: activeMode.soft,
                              color: activeMode.color,
                              border: `1.5px solid ${activeMode.border}`,
                            }
                          : {
                              color: '#737373',
                              border: '1.5px solid #27272A',
                              background: '#17181B',
                            }
                      }
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
                      style={
                        view === item.value
                          ? {
                              background: activeMode.soft,
                              color: activeMode.color,
                              border: `1.5px solid ${activeMode.border}`,
                            }
                          : {
                              color: '#737373',
                              border: '1.5px solid #27272A',
                              background: '#17181B',
                            }
                      }
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
                      className={`px-2 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                        cat.value === '' ? 'col-span-2' : ''
                      }`}
                      style={
                        categoryFilter === cat.value
                          ? {
                              background: activeMode.soft,
                              color: activeMode.color,
                              border: `1.5px solid ${activeMode.border}`,
                            }
                          : {
                              color: '#737373',
                              border: '1.5px solid #27272A',
                              background: '#17181B',
                            }
                      }
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
              <div
                className="rounded-2xl p-4 text-center text-sm"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#FCA5A5',
                }}
              >
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {rankedEntries.length === 0 ? (
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
                <motion.div
                  key={`${mode}-${view}-${categoryFilter}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <section
                    className="rounded-3xl border p-4 sm:p-5"
                    style={{
                      background: 'rgba(14,14,17,0.88)',
                      borderColor: activeMode.border,
                      boxShadow: activeMode.shadow,
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF] font-black">
                          Lecture claire
                        </p>
                        <h2 className="text-lg sm:text-xl font-black text-[#FAFAFA] mt-1">
                          Rang = ELO, Votes = secondaire
                        </h2>
                      </div>
                      <button
                        onClick={handleShareClassement}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-[#D1D5DB] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        📤 Partager
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[#E5E7EB] font-semibold">
                        # = position
                      </span>
                      <span
                        className="px-2.5 py-1 rounded-lg font-semibold"
                        style={{ background: activeMode.soft, color: activeMode.color }}
                      >
                        ELO = ordre du classement
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[#A1A1AA] font-semibold">
                        Votes = contexte de popularite
                      </span>
                    </div>

                    {topCategorySlices.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {topCategorySlices.map((slice) => (
                          <span
                            key={slice.key}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                            style={{
                              borderColor: 'rgba(255,255,255,0.10)',
                              background: 'rgba(255,255,255,0.03)',
                              color: '#D1D5DB',
                            }}
                          >
                            {slice.emoji} {slice.label}: {slice.count} dans le top 24
                          </span>
                        ))}
                      </div>
                    )}
                  </section>

                  <section
                    className="rounded-3xl border"
                    style={{ background: 'rgba(14,14,17,0.9)', borderColor: '#27292F' }}
                  >
                    <div className="px-4 sm:px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-black uppercase tracking-[0.13em] text-[#D1D5DB]">
                        Mur de classement
                      </h3>
                      <p className="text-xs text-[#6B7280]">{rankedEntries.length} lignes visibles</p>
                    </div>

                    <div className="p-3 sm:p-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {wallColumns.map((column, columnIndex) => {
                        const start = column[0]?.rank ?? 0;
                        const end = column[column.length - 1]?.rank ?? 0;

                        return (
                          <div
                            key={`wall-col-${columnIndex}`}
                            className="rounded-2xl border"
                            style={{
                              borderColor: 'rgba(255,255,255,0.09)',
                              background: 'rgba(10,11,15,0.88)',
                            }}
                          >
                            <div className="px-2.5 py-2 border-b border-white/10 flex items-center justify-between">
                              <p className="text-[11px] font-black uppercase tracking-wider text-[#A1A1AA]">
                                Rangs {start}-{end}
                              </p>
                              <p className="text-[10px] text-[#6B7280]">{column.length} entrees</p>
                            </div>

                            <div className="px-2.5 py-1.5">
                              <div className="grid grid-cols-[30px_minmax(0,1fr)_62px_46px] sm:grid-cols-[34px_minmax(0,1fr)_72px_56px] gap-2 text-[10px] uppercase tracking-wide text-[#6B7280] mb-1.5 px-1">
                                <span>#</span>
                                <span>Element</span>
                                <span className="text-right">ELO</span>
                                <span className="text-right">Votes</span>
                              </div>

                              <div className="space-y-1">
                                {column.map((item) => {
                                  const cat = getCategoryMeta(item.entry.categorie);
                                  const eloPercent = Math.round(((item.elo - floorElo) / eloSpread) * 100);
                                  const isTop3 = item.rank <= 3;

                                  return (
                                    <div
                                      key={`${item.entry.texte}-${item.rank}`}
                                      className="grid grid-cols-[30px_minmax(0,1fr)_62px_46px] sm:grid-cols-[34px_minmax(0,1fr)_72px_56px] items-center gap-2 rounded-lg border px-2 py-1.5"
                                      style={{
                                        borderColor: isTop3 ? activeMode.border : 'rgba(255,255,255,0.09)',
                                        background: isTop3 ? activeMode.soft : 'rgba(255,255,255,0.02)',
                                      }}
                                    >
                                      <span className="text-[11px] font-black text-[#E5E7EB]">
                                        {item.rank === 1
                                          ? '🥇'
                                          : item.rank === 2
                                            ? '🥈'
                                            : item.rank === 3
                                              ? '🥉'
                                              : `#${item.rank}`}
                                      </span>

                                      <div className="min-w-0 flex items-center gap-1.5">
                                        <span className="text-[11px]">{cat.emoji}</span>
                                        <span className="truncate text-[12px] text-[#F3F4F6]">
                                          {item.entry.texte}
                                        </span>
                                      </div>

                                      <div className="text-right">
                                        <p className="text-[12px] font-black" style={{ color: activeMode.color }}>
                                          {item.elo}
                                        </p>
                                        <div className="h-0.5 mt-0.5 rounded-full bg-white/10 overflow-hidden">
                                          <div
                                            className="h-full rounded-full"
                                            style={{
                                              width: `${Math.max(8, eloPercent)}%`,
                                              background: activeMode.color,
                                            }}
                                          />
                                        </div>
                                      </div>

                                      <span className="text-right text-[11px] text-[#9CA3AF]">
                                        {item.entry.nb_participations}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
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
