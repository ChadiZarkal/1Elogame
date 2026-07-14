'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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

interface LeaderboardPayload {
  success: boolean;
  data: {
    rankings: RankEntry[];
    totalElements: number;
    visibleElements: number;
    visibleVotes: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

type RankMode = 'redflag' | 'greenflag';
type ViewMode = 'global' | 'homme' | 'femme' | '16-18' | '19-22' | '23-26' | '27+';

const PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 280;

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
    shadow: '0 12px 30px rgba(239,68,68,0.20)',
  },
  greenflag: {
    label: 'Green Flag',
    emoji: '🟢',
    color: '#10B981',
    soft: 'rgba(16,185,129,0.14)',
    border: 'rgba(16,185,129,0.35)',
    shadow: '0 12px 30px rgba(16,185,129,0.20)',
  },
};

const PROFILE_FILTERS: { value: ViewMode; label: string; emoji: string }[] = [
  { value: 'global', label: 'Tous', emoji: '🌍' },
  { value: 'homme', label: 'Hommes', emoji: '♂️' },
  { value: 'femme', label: 'Femmes', emoji: '♀️' },
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

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<RankEntry[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [visibleVotes, setVisibleVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [mode, setMode] = useState<RankMode>('redflag');
  const [view, setView] = useState<ViewMode>('global');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchQuery(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const fetchRankings = async () => {
      const offset = (page - 1) * PAGE_SIZE;
      const params = new URLSearchParams({
        order: mode === 'redflag' ? 'desc' : 'asc',
        view,
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });

      if (categoryFilter) {
        params.set('category', categoryFilter);
      }

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const isFirstPage = page === 1;

      try {
        if (isFirstPage) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setError('');

        const response = await fetch(`/api/leaderboard?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as LeaderboardPayload;

        if (!isActive) {
          return;
        }

        if (!response.ok || !payload.success) {
          throw new Error('Impossible de charger le classement');
        }

        const fetchedRankings = payload.data.rankings ?? [];
        setRankings((prev) => (isFirstPage ? fetchedRankings : [...prev, ...fetchedRankings]));
        setTotalElements(payload.data.totalElements ?? 0);
        setVisibleVotes((prev) =>
          isFirstPage ? payload.data.visibleVotes ?? 0 : prev + (payload.data.visibleVotes ?? 0),
        );
        setHasMore(Boolean(payload.data.hasMore));
      } catch (err) {
        const isAbortError = err instanceof DOMException && err.name === 'AbortError';
        if (!isActive || isAbortError) {
          return;
        }

        setError('Impossible de charger le classement');

        if (page === 1) {
          setRankings([]);
          setHasMore(false);
          setTotalElements(0);
          setVisibleVotes(0);
        }
      } finally {
        if (!isActive) {
          return;
        }

        if (page === 1) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    };

    void fetchRankings();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [categoryFilter, mode, page, searchQuery, view]);

  const activeMode = MODE_CONFIG[mode];

  const selectedProfileLabel = useMemo(() => {
    const selected = PROFILE_FILTERS.find((item) => item.value === view);
    return selected?.label ?? 'Tous';
  }, [view]);

  const selectedCategoryLabel = useMemo(() => {
    const selected = CATEGORY_FILTERS.find((item) => item.value === categoryFilter);
    return selected?.label ?? 'Toutes categories';
  }, [categoryFilter]);

  const loadedElements = rankings.length;
  const canLoadMore = hasMore && !isLoadingMore;

  const handleModeChange = useCallback(
    (nextMode: RankMode) => {
      if (nextMode === mode) {
        return;
      }

      setMode(nextMode);
      setPage(1);
    },
    [mode],
  );

  const handleViewChange = useCallback(
    (nextView: ViewMode) => {
      if (nextView === view) {
        return;
      }

      setView(nextView);
      setPage(1);
    },
    [view],
  );

  const handleCategoryChange = useCallback(
    (nextCategory: string) => {
      if (nextCategory === categoryFilter) {
        return;
      }

      setCategoryFilter(nextCategory);
      setPage(1);
    },
    [categoryFilter],
  );

  const handleResetFilters = useCallback(() => {
    setMode('redflag');
    setView('global');
    setCategoryFilter('');
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
    setError('');
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!canLoadMore) {
      return;
    }

    setPage((prev) => prev + 1);
  }, [canLoadMore]);

  const handleShareClassement = useCallback(() => {
    const lines = rankings
      .slice(0, 8)
      .map((entry) => {
        const elo = getEloForView(entry, view);
        return `${entry.rank}. ${entry.texte} - ELO ${elo} - ${entry.nb_participations} votes`;
      })
      .join('\n');

    const text = [
      `🏆 ${activeMode.emoji} ${activeMode.label}`,
      'Tri principal: ELO',
      `👤 Profil: ${selectedProfileLabel}`,
      `🗂 Categorie: ${selectedCategoryLabel}`,
      lines,
      'redorgreen.fr/classement',
    ].join('\n');

    if (navigator.share) {
      navigator.share({ text, url: 'https://redorgreen.fr/classement' }).catch(() => {});
      return;
    }

    navigator.clipboard.writeText(text).catch(() => {});
  }, [activeMode, rankings, selectedCategoryLabel, selectedProfileLabel, view]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#090A0D' }}>
        <Loading size="lg" text="Chargement du classement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0D] pb-20">
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-[max(18px,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#FAFAFA] transition-colors py-1"
        >
          ← Accueil
        </Link>

        <header className="mt-4 mb-5">
          <h1 className="text-[30px] sm:text-[38px] leading-none font-black tracking-tight text-[#FAFAFA]">
            Classement General qui donne envie de jouer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#9CA3AF] max-w-3xl">
            Lis chaque ligne en entier, cherche un mot, filtre en un tap et explore tout le classement.
            Le rang est calcule par ELO, les votes sont seulement contextuels.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">
              {activeMode.emoji} {activeMode.label}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">
              👤 {selectedProfileLabel}
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">
              📚 Affiche {loadedElements} / {totalElements}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">
              🗳 {visibleVotes.toLocaleString('fr-FR')} votes visibles
            </span>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside
            className="rounded-3xl border p-4 sm:p-5 h-fit lg:sticky lg:top-4"
            style={{ background: 'rgba(14,14,17,0.92)', borderColor: '#252830' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black uppercase tracking-[0.13em] text-[#D1D5DB]">Filtres utiles</h2>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-[#6B7280] hover:text-[#F3F4F6] transition-colors"
              >
                Reinitialiser
              </button>
            </div>

            <label className="block mb-3">
              <span className="text-[12px] font-semibold text-[#A1A1AA]">Recherche</span>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ex: haleine, cryptobro, onlyfans..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#13151A] px-3 py-2.5 text-sm text-[#F3F4F6] placeholder:text-[#6B7280] focus:outline-none focus:ring-2"
                style={{
                  boxShadow: `0 0 0 0 ${activeMode.soft}`,
                }}
              />
            </label>

            <section className="mb-4">
              <p className="text-[12px] font-semibold text-[#A1A1AA] mb-2">Type</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(MODE_CONFIG) as RankMode[]).map((item) => {
                  const conf = MODE_CONFIG[item];
                  const selected = mode === item;

                  return (
                    <button
                      key={item}
                      onClick={() => handleModeChange(item)}
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

            <section className="mb-4">
              <p className="text-[12px] font-semibold text-[#A1A1AA] mb-2">Profil</p>
              <p className="text-[11px] text-[#6B7280] mb-2">
                Un seul profil a la fois (meme logique que la version precedente).
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PROFILE_FILTERS.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleViewChange(item.value)}
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
              <p className="text-[12px] font-semibold text-[#A1A1AA] mb-2">Categorie</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`px-2 py-2 rounded-xl text-[12px] font-semibold transition-all ${cat.value === '' ? 'col-span-2' : ''}`}
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
          </aside>

          <section className="space-y-4">
            <div
              className="rounded-3xl border p-4 sm:p-5"
              style={{ background: 'rgba(14,14,17,0.9)', borderColor: activeMode.border, boxShadow: activeMode.shadow }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#9CA3AF] font-black">Lecture simple</p>
                  <h2 className="text-lg sm:text-xl font-black text-[#FAFAFA] mt-1">
                    Rang = ELO, texte complet, votes en contexte
                  </h2>
                </div>
                <button
                  onClick={handleShareClassement}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#D1D5DB] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  📤 Partager
                </button>
              </div>

              {searchQuery && (
                <p className="mt-3 text-sm text-[#9CA3AF]">
                  Resultats pour <span className="font-semibold text-[#F3F4F6]">{`"${searchQuery}"`}</span>
                </p>
              )}
            </div>

            {error && (
              <div
                className="rounded-2xl p-4 text-center text-sm"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  color: '#FCA5A5',
                }}
              >
                {error}
              </div>
            )}

            {rankings.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/2 text-center py-16 px-4">
                <span className="text-5xl block mb-3">🔎</span>
                <p className="text-[#E5E7EB] text-base font-semibold">Aucune ligne trouvee</p>
                <p className="text-[#9CA3AF] text-sm mt-1">Essaie un autre mot cle ou retire des filtres.</p>
              </div>
            ) : (
              <ol className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {rankings.map((entry, index) => {
                  const categoryMeta = getCategoryMeta(entry.categorie);
                  const elo = getEloForView(entry, view);
                  const isPodium = entry.rank <= 3;

                  return (
                    <motion.li
                      key={`${entry.rank}-${entry.texte}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.015, 0.22) }}
                      className="rounded-2xl border p-3.5"
                      style={{
                        borderColor: isPodium ? activeMode.border : 'rgba(255,255,255,0.10)',
                        background: isPodium ? activeMode.soft : 'rgba(16,17,22,0.85)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 inline-flex min-w-11 h-8 items-center justify-center rounded-full bg-black/30 text-[11px] font-black text-[#F3F4F6] px-2">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] leading-snug text-[#F8FAFC] wrap-break-word whitespace-normal">
                            {entry.texte}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                            <span className="rounded-lg px-2 py-1 bg-black/25 text-[#D1D5DB]">
                              {categoryMeta.emoji} {categoryMeta.label}
                            </span>
                            <span className="rounded-lg px-2 py-1 bg-black/25 text-[#A1A1AA]">
                              {entry.nb_participations} votes
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">ELO</p>
                          <p className="text-[16px] font-black" style={{ color: activeMode.color }}>
                            {elo}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            )}

            <div className="flex flex-col items-center gap-2 pt-1">
              {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  disabled={!canLoadMore}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#E5E7EB] border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingMore
                    ? 'Chargement...'
                    : `Voir ${Math.min(PAGE_SIZE, Math.max(totalElements - loadedElements, 0))} lignes de plus`}
                </button>
              ) : (
                rankings.length > 0 && (
                  <p className="text-xs text-[#6B7280]">Tout le classement disponible est affiche.</p>
                )
              )}
            </div>
          </section>
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
