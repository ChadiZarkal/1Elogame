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
    shadow: '0 12px 30px rgba(239,68,68,0.25)',
  },
  greenflag: {
    label: 'Green Flag',
    emoji: '🟢',
    color: '#10B981',
    soft: 'rgba(16,185,129,0.14)',
    border: 'rgba(16,185,129,0.35)',
    shadow: '0 12px 30px rgba(16,185,129,0.25)',
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

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const activeMode = MODE_CONFIG[mode];

  const selectedPopulationLabel = useMemo(() => {
    const filter = [...POPULATION_FILTERS, ...AGE_FILTERS].find((item) => item.value === view);
    return filter?.label ?? 'Tous';
  }, [view]);

  const selectedCategoryLabel = useMemo(() => {
    const filter = CATEGORY_FILTERS.find((item) => item.value === categoryFilter);
    return filter?.label ?? 'Toutes categories';
  }, [categoryFilter]);

  const avgVotesPerElement = totalElements > 0 ? Math.round(totalVotes / totalElements) : 0;

  const handleShareClassement = useCallback(() => {
    const top = sorted[0];
    const topText = top ? ` Le n°1 : "${top.texte}"` : '';
    const text = `🏆 Classement Red or Green !${topText}\nViens voter et compare tes resultats →`;

    if (navigator.share) {
      navigator.share({ text, url: 'https://redorgreen.fr/classement' }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} redorgreen.fr/classement`).catch(() => {});
    }
  }, [sorted]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0A0A0A' }}>
        <Loading size="lg" text="Chargement du classement..." />
      </div>
    );
  }

  const topElo = sorted.length > 0 ? getEloForView(sorted[0], view) : 0;
  const bottomElo = sorted.length > 0 ? getEloForView(sorted[sorted.length - 1], view) : 0;
  const eloRange = Math.abs(topElo - bottomElo) || 1;

  return (
    <div className="relative min-h-screen overflow-hidden pb-24" style={{ background: '#08090B' }}>
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full blur-[130px] opacity-70"
          style={{ background: activeMode.soft }}
        />
        <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-white/2 blur-[100px]" />
        <div className="absolute top-28 -right-24 h-80 w-80 rounded-full bg-white/2 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-[max(20px,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#FAFAFA] transition-colors py-1"
        >
          ← Accueil
        </Link>

        <header className="mt-4 mb-6 sm:mb-8">
          <h1 className="text-[30px] sm:text-[40px] leading-none font-black tracking-tight text-[#FAFAFA]">
            Leaderboards qui claquent
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#9CA3AF] max-w-2xl">
            Lis en un regard: qui est top, sur quel filtre, et pourquoi. Format optimise pour screenshot et partage.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">
              🧩 {totalElements} elements
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#E5E7EB]">
              🗳 {totalVotes.toLocaleString('fr-FR')} votes
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: activeMode.soft, color: activeMode.color }}>
              {activeMode.emoji} {activeMode.label}
            </span>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(330px,1fr)]">
          <article
            className="rounded-3xl border p-4 sm:p-6"
            style={{ background: 'rgba(14,14,17,0.82)', borderColor: activeMode.border, boxShadow: activeMode.shadow }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF] font-black">Carte resume</p>
                <h2 className="text-xl sm:text-2xl font-black text-[#FAFAFA] mt-1">Pret a partager</h2>
              </div>
              <button
                onClick={handleShareClassement}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#D1D5DB] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                📤 Partager
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280]">Mode</p>
                <p className="text-sm font-bold text-[#FAFAFA] mt-1">{activeMode.emoji} {activeMode.label}</p>
              </div>
              <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280]">Population</p>
                <p className="text-sm font-bold text-[#FAFAFA] mt-1">👥 {selectedPopulationLabel}</p>
              </div>
              <div className="rounded-xl p-3 bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280]">Categorie</p>
                <p className="text-sm font-bold text-[#FAFAFA] mt-1">🗂 {selectedCategoryLabel}</p>
              </div>
            </div>

            {sorted[0] ? (
              <div
                className="rounded-2xl p-4 sm:p-5 border"
                style={{ background: activeMode.soft, borderColor: activeMode.border }}
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#9CA3AF] font-black">TOP #1</p>
                <p className="mt-2 text-lg sm:text-2xl font-black text-[#FAFAFA] leading-tight">
                  {sorted[0].texte}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/20 text-[#F3F4F6]">
                    {sorted[0].nb_participations} votes
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/20 text-[#F3F4F6]">
                    moyenne {avgVotesPerElement} votes/element
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-5 text-sm text-[#9CA3AF] bg-white/5 border border-white/10">
                Aucun resultat avec ces filtres.
              </div>
            )}

            <p className="mt-4 text-xs text-[#6B7280]">
              Tip: prends un screenshot de ce bloc pour partager rapidement les infos cles.
            </p>
          </article>

          <aside className="rounded-3xl border p-4 sm:p-5 lg:sticky lg:top-4 h-fit" style={{ background: 'rgba(14,14,17,0.9)', borderColor: '#24262B' }}>
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

              <div className="pt-3 border-t border-[#26272B] flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-[#6B7280] uppercase tracking-wider">Actifs:</span>
                <span className="px-2 py-1 rounded-lg text-[11px] font-semibold" style={{ background: activeMode.soft, color: activeMode.color }}>
                  {activeMode.emoji} {activeMode.label}
                </span>
                <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/5 text-[#D1D5DB]">
                  👥 {selectedPopulationLabel}
                </span>
                <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/5 text-[#D1D5DB]">
                  🗂 {selectedCategoryLabel}
                </span>
              </div>
            </div>
          </aside>
        </section>

        {error && (
          <div className="mt-4 rounded-2xl p-4 text-center text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
            {error}
          </div>
        )}

        <section className="mt-7 sm:mt-9">
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
              <motion.div key={`${mode}-${view}-${categoryFilter}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] font-black text-[#6B7280]">Podium</p>
                    {top3.map((entry, index) => {
                      const medals = ['🥇', '🥈', '🥉'];
                      const medal = medals[index] ?? '🏅';
                      const indexLabel = `#${index + 1}`;

                      return (
                        <motion.div
                          key={`${entry.texte}-podium-${index}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06 }}
                          className="rounded-2xl border p-4"
                          style={{
                            background: index === 0 ? activeMode.soft : 'rgba(255,255,255,0.03)',
                            borderColor: index === 0 ? activeMode.border : 'rgba(255,255,255,0.08)',
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{medal}</span>
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF]">{indexLabel}</span>
                          </div>
                          <p className="text-[15px] font-bold text-[#F3F4F6] leading-snug">{entry.texte}</p>
                          <p className="text-xs mt-2" style={{ color: index === 0 ? activeMode.color : '#9CA3AF' }}>
                            {entry.nb_participations} votes
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] font-black text-[#6B7280] mb-3">Classement complet</p>
                    <div className="space-y-2.5">
                      {rest.map((entry, idx) => {
                        const elo = getEloForView(entry, view);
                        const score = mode === 'redflag'
                          ? (elo - bottomElo) / eloRange
                          : (bottomElo - elo) / eloRange;
                        const width = Math.max(9, Math.round(score * 100));

                        return (
                          <motion.div
                            key={`${entry.texte}-rest-${idx}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(idx * 0.02, 0.35) }}
                            className="rounded-2xl border p-4 flex items-center gap-3 relative overflow-hidden"
                            style={{ background: '#121317', borderColor: 'rgba(255,255,255,0.08)' }}
                          >
                            <div
                              className="absolute inset-y-0 left-0 rounded-2xl"
                              style={{ width: `${width}%`, background: activeMode.soft }}
                            />

                            <div className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-black bg-black/35 text-[#D1D5DB] shrink-0">
                              {idx + 4}
                            </div>

                            <div className="relative z-10 flex-1 min-w-0">
                              <p className="text-[15px] font-medium text-[#F3F4F6] leading-snug">{entry.texte}</p>
                              <p className="text-xs mt-1 text-[#8A8A93]">{entry.nb_participations} votes</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="mt-10 pb-2 flex flex-col items-center gap-4">
          <motion.a
            href="/jeu"
            className="w-full max-w-xs block px-8 py-4 rounded-2xl font-black text-[16px] text-white transition-transform active:scale-95 text-center"
            style={{ background: activeMode.color, boxShadow: activeMode.shadow }}
            whileTap={{ scale: 0.96 }}
          >
            {activeMode.emoji} Jouer et voter !
          </motion.a>

          <button
            onClick={handleShareClassement}
            className="text-[#7B7B85] hover:text-[#FAFAFA] text-[14px] flex items-center gap-2 transition-colors py-3 px-5"
          >
            📤 Partager le classement
          </button>
        </section>
      </main>
    </div>
  );
}
