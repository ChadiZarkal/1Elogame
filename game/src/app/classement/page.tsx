'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loading } from '@/components/ui/Loading';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RankEntry {
  rank: number;
  texte: string;
  categorie: string;
  tags: string[];
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

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 30;

const MODE_CONFIG: Record<
  RankMode,
  {
    label: string;
    emoji: string;
    color: string;
    soft: string;
    border: string;
    shadow: string;
    glow: string;
    headline: string;
    sub: (n: number) => string;
  }
> = {
  redflag: {
    label: 'Red Flag',
    emoji: '🚩',
    color: '#EF4444',
    soft: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.35)',
    shadow: '0 16px 50px rgba(239,68,68,0.25)',
    glow: 'rgba(239,68,68,0.12)',
    headline: 'Ce que personne\nne supporte.',
    sub: (n) =>
      `Le verdict de la communauté. ${n} comportements jugés, classés par score collectif — sans filtre, sans diplomatie.`,
  },
  greenflag: {
    label: 'Green Flag',
    emoji: '🟢',
    color: '#10B981',
    soft: 'rgba(16,185,129,0.15)',
    border: 'rgba(16,185,129,0.35)',
    shadow: '0 16px 50px rgba(16,185,129,0.25)',
    glow: 'rgba(16,185,129,0.12)',
    headline: 'Ce que tout\nle monde valide.',
    sub: (n) =>
      `Pour une fois, quelque chose d'unanime. ${n} comportements que la communauté a approuvés.`,
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
  { value: '', label: 'Tout', emoji: '⚡' },
  { value: 'sexe', label: 'Amour & Sexe', emoji: '❤️‍🔥' },
  { value: 'quotidien', label: 'Quotidien', emoji: '🤷' },
];

const TAG_FILTERS = [
  { value: 'metier', label: 'Travail', emoji: '💼' },
  { value: 'couple', label: 'Couple', emoji: '❤️' },
  { value: 'hygiene', label: 'Hygiène', emoji: '🚿' },
  { value: 'argent', label: 'Argent', emoji: '💰' },
  { value: 'numerique', label: 'Numérique', emoji: '📱' },
  { value: 'sport', label: 'Sport', emoji: '🏋️' },
  { value: 'nourriture', label: 'Nourriture', emoji: '🍽️' },
  { value: 'emotionnel', label: 'Émotionnel', emoji: '💔' },
  { value: 'social', label: 'Social', emoji: '🌍' },
  { value: 'transport', label: 'Transport', emoji: '🚗' },
  { value: 'politique', label: 'Politique', emoji: '🏛️' },
];

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  sexe: { label: 'Amour & Sexe', emoji: '❤️‍🔥' },
  quotidien: { label: 'Quotidien', emoji: '🤷' },
};

const TAG_META: Record<string, { label: string; emoji: string }> = {
  metier: { label: 'Travail', emoji: '💼' },
  couple: { label: 'Couple', emoji: '❤️' },
  hygiene: { label: 'Hygiène', emoji: '🚿' },
  argent: { label: 'Argent', emoji: '💰' },
  numerique: { label: 'Numérique', emoji: '📱' },
  sport: { label: 'Sport', emoji: '🏋️' },
  nourriture: { label: 'Nourriture', emoji: '🍽️' },
  emotionnel: { label: 'Émotionnel', emoji: '💔' },
  social: { label: 'Social', emoji: '🌍' },
  transport: { label: 'Transport', emoji: '🚗' },
  politique: { label: 'Politique', emoji: '🏛️' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreForView(r: RankEntry, view: ViewMode): number {
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

function getCategoryMeta(cat: string): { label: string; emoji: string } {
  return CATEGORY_META[cat] ?? { label: cat || 'Autre', emoji: '🏷️' };
}

function heatPct(score: number, maxScore: number): number {
  return Math.min(Math.max(((score - 900) / Math.max(maxScore - 900, 100)) * 100, 3), 100);
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  const [tagFilter, setTagFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

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
      if (categoryFilter) params.set('category', categoryFilter);
      if (tagFilter) params.set('tag', tagFilter);
      if (searchQuery) params.set('search', searchQuery);

      const isFirstPage = page === 1;

      try {
        if (isFirstPage) setIsLoading(true);
        else setIsLoadingMore(true);
        setError('');

        const res = await fetch(`/api/leaderboard?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = (await res.json()) as LeaderboardPayload;

        if (!isActive) return;
        if (!res.ok || !payload.success) throw new Error('Erreur chargement');

        const fetched = payload.data.rankings ?? [];
        setRankings((prev) => (isFirstPage ? fetched : [...prev, ...fetched]));
        setTotalElements(payload.data.totalElements ?? 0);
        setVisibleVotes((prev) =>
          isFirstPage
            ? (payload.data.visibleVotes ?? 0)
            : prev + (payload.data.visibleVotes ?? 0),
        );
        setHasMore(Boolean(payload.data.hasMore));
      } catch (err) {
        const isAbort = err instanceof DOMException && err.name === 'AbortError';
        if (!isActive || isAbort) return;
        setError('Impossible de charger le classement');
        if (page === 1) {
          setRankings([]);
          setHasMore(false);
          setTotalElements(0);
          setVisibleVotes(0);
        }
      } finally {
        if (!isActive) return;
        if (page === 1) setIsLoading(false);
        else setIsLoadingMore(false);
      }
    };

    void fetchRankings();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [categoryFilter, tagFilter, mode, page, searchQuery, view]);

  const cfg = MODE_CONFIG[mode];
  const loadedCount = rankings.length;
  const canLoadMore = hasMore && !isLoadingMore;
  const hasContextualFilter =
    searchQuery.length > 0 || categoryFilter !== '' || tagFilter !== '' || view !== 'global';
  const isFiltered =
    mode !== 'redflag' ||
    view !== 'global' ||
    categoryFilter !== '' ||
    tagFilter !== '' ||
    searchQuery !== '';

  const maxScore = useMemo(
    () => Math.max(...rankings.map((r) => getScoreForView(r, view)), 1000),
    [rankings, view],
  );

  const setModeAndReset = useCallback(
    (m: RankMode) => {
      if (m === mode) return;
      setMode(m);
      setPage(1);
    },
    [mode],
  );

  const setViewAndReset = useCallback(
    (v: ViewMode) => {
      if (v === view) return;
      setView(v);
      setPage(1);
    },
    [view],
  );

  const setCatAndReset = useCallback(
    (c: string) => {
      if (c === categoryFilter) return;
      setCategoryFilter(c);
      setPage(1);
    },
    [categoryFilter],
  );

  const setTagAndReset = useCallback(
    (t: string) => {
      setTagFilter((prev) => (prev === t ? '' : t));
      setPage(1);
    },
    [],
  );

  const resetAll = useCallback(() => {
    setMode('redflag');
    setView('global');
    setCategoryFilter('');
    setTagFilter('');
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
    setError('');
  }, []);

  const onSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setPage(1);
      setSearchQuery(searchInput.trim());
    },
    [searchInput],
  );

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    if (canLoadMore) setPage((p) => p + 1);
  }, [canLoadMore]);

  const shareEntry = useCallback(
    (entry: RankEntry) => {
      const score = getScoreForView(entry, view);
      const text = `${cfg.emoji} #${entry.rank} — "${entry.texte}"\nScore : ${score} · ${entry.nb_participations} votes\nredorgreen.fr/classement`;
      if (navigator.share) {
        navigator.share({ text, url: 'https://redorgreen.fr/classement' }).catch(() => {});
        return;
      }
      navigator.clipboard.writeText(text).catch(() => {});
    },
    [cfg.emoji, view],
  );

  const shareTop = useCallback(() => {
    const lines = rankings
      .slice(0, 5)
      .map((r) => `${r.rank}. ${r.texte}`)
      .join('\n');
    const text = `${cfg.emoji} Top 5 ${cfg.label} :\n${lines}\nredorgreen.fr/classement`;
    if (navigator.share) {
      navigator.share({ text, url: 'https://redorgreen.fr/classement' }).catch(() => {});
      return;
    }
    navigator.clipboard.writeText(text).catch(() => {});
  }, [cfg, rankings]);

  const podium = !hasContextualFilter ? rankings.slice(0, 3) : [];
  const listItems = hasContextualFilter ? rankings : rankings.slice(3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#070809' }}>
        <Loading size="lg" text="Chargement du verdict..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#070809' }}>
      {/* Ambient glow */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 h-[55vh] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% -5%, ${cfg.glow}, transparent 70%)`,
        }}
      />

      <main
        id="main-content"
        className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 pt-[max(16px,env(safe-area-inset-top))]"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#4B5563] hover:text-white transition-colors py-1.5"
        >
          ← Accueil
        </Link>

        {/* HEADER */}
        <header className="mt-5 mb-6">
          <div className="flex gap-2 mb-5">
            {(['redflag', 'greenflag'] as const).map((m) => {
              const c = MODE_CONFIG[m];
              const sel = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModeAndReset(m)}
                  className="px-4 py-1.5 rounded-full text-[13px] font-black transition-all"
                  style={
                    sel
                      ? { background: c.soft, color: c.color, border: `1.5px solid ${c.border}` }
                      : { background: 'rgba(255,255,255,0.04)', color: '#4B5563', border: '1.5px solid #1C1D22' }
                  }
                >
                  {c.emoji} {c.label}
                </button>
              );
            })}
          </div>

          <motion.h1
            key={`h1-${mode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[40px] sm:text-[56px] font-black tracking-tight text-white leading-[1.03] whitespace-pre-line"
          >
            {cfg.headline}
          </motion.h1>

          <motion.p
            key={`sub-${mode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mt-4 text-[#6B7280] text-[15px] sm:text-[16px] leading-relaxed max-w-xl"
          >
            {cfg.sub(totalElements)}
          </motion.p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-white/[0.05] text-[#9CA3AF] text-[12px] font-semibold border border-white/[0.07]">
              🗳️ {visibleVotes.toLocaleString('fr-FR')} votes
            </span>
            <span className="px-3 py-1 rounded-full bg-white/[0.05] text-[#9CA3AF] text-[12px] font-semibold border border-white/[0.07]">
              📊 {loadedCount} / {totalElements}
            </span>
            {tagFilter && (
              <button
                type="button"
                onClick={() => setTagAndReset(tagFilter)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold"
                style={{ background: cfg.soft, color: cfg.color, border: `1px solid ${cfg.border}` }}
              >
                {TAG_META[tagFilter]?.emoji ?? '🏷️'} {TAG_META[tagFilter]?.label ?? tagFilter}
                <span className="opacity-60">×</span>
              </button>
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold"
                style={{ background: cfg.soft, color: cfg.color, border: `1px solid ${cfg.border}` }}
              >
                🔍 &quot;{searchQuery}&quot; <span className="opacity-60">×</span>
              </button>
            )}
            <button
              type="button"
              onClick={shareTop}
              className="px-3 py-1 rounded-full bg-white/[0.05] text-[#6B7280] text-[12px] font-semibold border border-white/[0.07] hover:text-white hover:bg-white/10 transition-colors"
            >
              📤 Partager
            </button>
          </div>
        </header>

        {/* MOBILE FILTER BAR */}
        <div className="mb-5 lg:hidden space-y-3">
          <form onSubmit={onSearchSubmit} className="flex gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="🔍  Cherche un comportement..."
              enterKeyHint="search"
              autoComplete="off"
              className="flex-1 rounded-xl border border-white/[0.09] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-[#3D404A] focus:outline-none focus:border-white/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-3 rounded-xl bg-white/[0.04] border border-white/[0.09] text-[#6B7280] text-xl leading-none"
              >
                ×
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-black text-white"
              style={{ background: cfg.color }}
            >
              OK
            </button>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCatAndReset(cat.value)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap"
                style={
                  categoryFilter === cat.value
                    ? { background: cfg.soft, color: cfg.color, border: `1.5px solid ${cfg.border}` }
                    : { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1.5px solid #1C1D22' }
                }
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {PROFILE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setViewAndReset(f.value)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap"
                style={
                  view === f.value
                    ? { background: cfg.soft, color: cfg.color, border: `1.5px solid ${cfg.border}` }
                    : { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1.5px solid #1C1D22' }
                }
              >
                {f.emoji} {f.label}
              </button>
            ))}
          </div>

          {/* Tag filter chips */}
          <div>
            <p className="text-[11px] font-semibold text-[#3D404A] uppercase tracking-wider mb-2">
              🏷️ Filtrer par thème
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {TAG_FILTERS.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => setTagAndReset(tag.value)}
                  className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap"
                  style={
                    tagFilter === tag.value
                      ? { background: cfg.soft, color: cfg.color, border: `1.5px solid ${cfg.border}` }
                      : { background: 'rgba(255,255,255,0.04)', color: '#4B5563', border: '1.5px solid #1C1D22' }
                  }
                >
                  {tag.emoji} {tag.label}
                </button>
              ))}
            </div>
          </div>

          {isFiltered && (
            <button type="button" onClick={resetAll} className="text-xs text-[#4B5563] hover:text-white transition-colors">
              ↺ Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-[252px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div
              className="sticky top-4 rounded-2xl border p-4 space-y-5"
              style={{ background: 'rgba(11,11,15,0.92)', borderColor: '#18191F' }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#4B5563]">Filtres</span>
                {isFiltered && (
                  <button type="button" onClick={resetAll} className="text-[11px] text-[#4B5563] hover:text-white transition-colors">
                    ↺ Reset
                  </button>
                )}
              </div>

              <form onSubmit={onSearchSubmit} className="space-y-2">
                <label className="text-[11px] font-semibold text-[#3D404A] uppercase tracking-wider">Recherche</label>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="haleine, cryptobro..."
                  enterKeyHint="search"
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/[0.07] bg-[#08090C] px-3 py-2 text-sm text-white placeholder:text-[#2D2F37] focus:outline-none focus:border-white/15"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 rounded-xl text-[12px] font-black text-white" style={{ background: cfg.color }}>
                    Rechercher
                  </button>
                  {searchQuery && (
                    <button type="button" onClick={clearSearch} className="px-3 py-2 rounded-xl text-sm text-[#6B7280] bg-white/[0.04] border border-white/[0.07]">
                      ×
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#3D404A] uppercase tracking-wider">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['redflag', 'greenflag'] as const).map((m) => {
                    const c = MODE_CONFIG[m];
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setModeAndReset(m)}
                        className="py-2.5 rounded-xl text-[12px] font-black transition-all"
                        style={
                          mode === m
                            ? { background: c.soft, color: c.color, border: `1.5px solid ${c.border}` }
                            : { color: '#4B5563', border: '1.5px solid #1A1B21', background: '#0B0C0F' }
                        }
                      >
                        {c.emoji} {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#3D404A] uppercase tracking-wider">Profil</label>
                <p className="text-[10px] text-[#2D2F37]">Un seul profil à la fois</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PROFILE_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setViewAndReset(f.value)}
                      className="py-2 rounded-xl text-[11px] font-semibold transition-all"
                      style={
                        view === f.value
                          ? { background: cfg.soft, color: cfg.color, border: `1.5px solid ${cfg.border}` }
                          : { color: '#4B5563', border: '1.5px solid #1A1B21', background: '#0B0C0F' }
                      }
                    >
                      {f.emoji} {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#3D404A] uppercase tracking-wider">Catégorie</label>
                <div className="space-y-1.5">
                  {CATEGORY_FILTERS.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCatAndReset(cat.value)}
                      className="w-full py-2 rounded-xl text-[12px] font-semibold transition-all"
                      style={
                        categoryFilter === cat.value
                          ? { background: cfg.soft, color: cfg.color, border: `1.5px solid ${cfg.border}` }
                          : { color: '#4B5563', border: '1.5px solid #1A1B21', background: '#0B0C0F' }
                      }
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#3D404A] uppercase tracking-wider">🏷️ Thème</label>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_FILTERS.map((tag) => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => setTagAndReset(tag.value)}
                      className="px-2 py-1 rounded-lg text-[11px] font-semibold transition-all"
                      style={
                        tagFilter === tag.value
                          ? { background: cfg.soft, color: cfg.color, border: `1.5px solid ${cfg.border}` }
                          : { color: '#4B5563', border: '1.5px solid #1A1B21', background: '#0B0C0F' }
                      }
                    >
                      {tag.emoji} {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RANKINGS */}
          <section className="min-w-0">
            {error && (
              <div
                className="rounded-2xl p-4 text-sm mb-4 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}
              >
                {error}
              </div>
            )}

            {searchQuery && rankings.length > 0 && (
              <p className="text-sm text-[#6B7280] mb-4">
                <span className="font-bold text-white">{totalElements}</span> résultat
                {totalElements !== 1 ? 's' : ''} pour{' '}
                <span style={{ color: cfg.color }}>&quot;{searchQuery}&quot;</span>
              </p>
            )}

            {rankings.length === 0 ? (
              <div className="text-center py-24 space-y-3">
                <span className="text-6xl block">🔎</span>
                <p className="text-white font-black text-xl">Rien trouvé</p>
                <p className="text-[#4B5563] text-sm">Essaie un autre mot ou change les filtres.</p>
                <button type="button" onClick={resetAll} className="mt-2 text-sm underline" style={{ color: cfg.color }}>
                  Tout réinitialiser
                </button>
              </div>
            ) : (
              <>
                {/* PODIUM TOP 3 */}
                {podium.length === 3 && (
                  <div className="mb-5 space-y-3">
                    <motion.div
                      key={`p1-${mode}-${view}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
                      style={{
                        background: `linear-gradient(140deg, ${cfg.soft} 0%, rgba(9,9,13,0.97) 55%)`,
                        border: `1.5px solid ${cfg.border}`,
                        boxShadow: cfg.shadow,
                      }}
                    >
                      <span
                        aria-hidden
                        className="absolute -right-3 top-1/2 -translate-y-1/2 text-[130px] font-black leading-none select-none pointer-events-none"
                        style={{ color: cfg.color, opacity: 0.06 }}
                      >
                        1
                      </span>
                      <div className="relative flex items-start gap-4">
                        <span className="text-[44px] shrink-0 leading-none">🥇</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[21px] sm:text-[26px] font-black text-white leading-tight">
                            {podium[0].texte}
                          </p>
                          <div className="mt-2.5 flex flex-wrap gap-2 text-[12px]">
                            {(() => {
                              const m = getCategoryMeta(podium[0].categorie);
                              return (
                                <span className="px-2.5 py-1 rounded-full bg-black/40 text-[#D1D5DB]">{m.emoji} {m.label}</span>
                              );
                            })()}
                            <span className="px-2.5 py-1 rounded-full bg-black/40 text-[#9CA3AF]">
                              {podium[0].nb_participations} votes
                            </span>
                          </div>
                          <div className="mt-3.5 flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${heatPct(getScoreForView(podium[0], view), maxScore)}%` }}
                                transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${cfg.color}70, ${cfg.color})` }}
                              />
                            </div>
                            <span className="text-[13px] font-black shrink-0" style={{ color: cfg.color }}>
                              {getScoreForView(podium[0], view)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => shareEntry(podium[0])}
                          className="shrink-0 p-2 rounded-xl bg-black/25 hover:bg-black/50 text-[#4B5563] hover:text-white transition-all"
                          aria-label="Partager cette entrée"
                        >
                          📤
                        </button>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-3">
                      {podium.slice(1).map((entry, i) => {
                        const medal = i === 0 ? '🥈' : '🥉';
                        const rn = i + 2;
                        const score = getScoreForView(entry, view);
                        const hp = heatPct(score, maxScore);
                        const meta = getCategoryMeta(entry.categorie);
                        return (
                          <motion.div
                            key={`p${rn}-${mode}-${view}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                            className="relative overflow-hidden rounded-2xl p-4 flex flex-col gap-2"
                            style={{ background: 'rgba(12,12,17,0.94)', border: `1px solid ${cfg.border}` }}
                          >
                            <span
                              aria-hidden
                              className="absolute right-1 top-1/2 -translate-y-1/2 text-[75px] font-black leading-none select-none pointer-events-none"
                              style={{ color: cfg.color, opacity: 0.06 }}
                            >
                              {rn}
                            </span>
                            <span className="text-[30px] leading-none">{medal}</span>
                            <p className="text-[14px] font-bold text-white leading-snug">{entry.texte}</p>
                            <p className="text-[11px] text-[#4B5563]">{meta.emoji} {meta.label} · {entry.nb_participations} votes</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${hp}%` }}
                                  transition={{ delay: 0.35 + i * 0.1, duration: 0.5 }}
                                  className="h-full rounded-full"
                                  style={{ background: cfg.color }}
                                />
                              </div>
                              <span className="text-[12px] font-black shrink-0" style={{ color: cfg.color }}>{score}</span>
                              <button type="button" onClick={() => shareEntry(entry)} className="text-[12px] text-[#3D404A] hover:text-white transition-colors" aria-label="Partager">
                                📤
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* LIST */}
                {listItems.length > 0 && (
                  <ol className="space-y-1.5">
                    {listItems.map((entry, idx) => {
                      const score = getScoreForView(entry, view);
                      const hp = heatPct(score, maxScore);
                      const meta = getCategoryMeta(entry.categorie);
                      const isTop = hasContextualFilter && entry.rank <= 3;
                      const medal = isTop
                        ? entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                        : null;

                      return (
                        <motion.li
                          key={`${entry.rank}-${entry.texte}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.01, 0.18) }}
                        >
                          <div
                            className="group flex items-center gap-3 rounded-xl px-3.5 py-3 hover:bg-white/[0.02] transition-colors"
                            style={{
                              border: '1px solid rgba(255,255,255,0.065)',
                              background: isTop
                                ? `linear-gradient(135deg, ${cfg.soft}, rgba(9,9,13,0.94))`
                                : 'rgba(11,11,15,0.87)',
                            }}
                          >
                            <span
                              className="shrink-0 text-[12px] font-black w-8 text-center tabular-nums"
                              style={{ color: isTop ? cfg.color : '#2D2F37' }}
                            >
                              {medal ?? `#${entry.rank}`}
                            </span>

                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] sm:text-[15px] font-semibold text-[#E8EAED] leading-snug">
                                {entry.texte}
                              </p>
                              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#3D404A] flex-wrap">
                                <span>{meta.emoji} {meta.label}</span>
                                {entry.tags && entry.tags.length > 0 && TAG_META[entry.tags[0]] && (
                                  <>
                                    <span>·</span>
                                    <span className="text-[#2D2F37]">
                                      {TAG_META[entry.tags[0]].emoji} {TAG_META[entry.tags[0]].label}
                                    </span>
                                  </>
                                )}
                                <span>·</span>
                                <span>{entry.nb_participations} votes</span>
                              </div>
                              <div className="mt-1.5 h-[2px] rounded-full bg-white/[0.05] overflow-hidden max-w-[150px]">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${hp}%` }}
                                  transition={{ delay: Math.min(idx * 0.007, 0.12), duration: 0.4, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ background: `linear-gradient(90deg, ${cfg.color}45, ${cfg.color})` }}
                                />
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1">
                              <span className="text-[13px] font-black tabular-nums" style={{ color: cfg.color }}>
                                {score}
                              </span>
                              <button
                                type="button"
                                onClick={() => shareEntry(entry)}
                                className="opacity-0 group-hover:opacity-100 ml-1 p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-[#4B5563] hover:text-white transition-all text-[11px]"
                                aria-label="Partager"
                              >
                                📤
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ol>
                )}

                <div className="flex flex-col items-center gap-2 mt-8 pb-2">
                  {hasMore ? (
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={!canLoadMore}
                      className="px-8 py-3 rounded-2xl text-sm font-black border transition-all disabled:opacity-40"
                      style={{ color: cfg.color, borderColor: cfg.border, background: cfg.soft }}
                    >
                      {isLoadingMore
                        ? 'Chargement...'
                        : `Voir ${Math.min(PAGE_SIZE, Math.max(totalElements - loadedCount, 0))} de plus`}
                    </button>
                  ) : (
                    <p className="text-[12px] text-[#2D2F37]">Tout est affiché — {totalElements} comportements</p>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* STICKY CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-6"
        style={{ background: 'linear-gradient(to top, rgba(7,8,9,0.99) 55%, transparent)', pointerEvents: 'none' }}
      >
        <div className="mx-auto max-w-sm" style={{ pointerEvents: 'all' }}>
          <Link
            href="/jeu"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-black text-[15px] text-white transition-transform active:scale-95"
            style={{ background: cfg.color, boxShadow: cfg.shadow }}
          >
            {cfg.emoji} Donner mon vote
          </Link>
        </div>
      </div>
    </div>
  );
}
