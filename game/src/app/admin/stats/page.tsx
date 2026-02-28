'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loading } from '@/components/ui/Loading';
import { AdminNav } from '@/components/admin/AdminNav';
import { CATEGORIES_CONFIG } from '@/config/categories';

interface ElementRanking {
  id: string;
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
  nb_participations_homme: number;
  nb_participations_femme: number;
  nb_participations_autre: number;
  nb_participations_16_18: number;
  nb_participations_19_22: number;
  nb_participations_23_26: number;
  nb_participations_27plus: number;
  is_starred?: boolean;
}

type ViewMode = 'global' | 'homme' | 'femme' | '16-18' | '19-22' | '23-26' | '27+';
type SortField = 'elo' | 'participations' | 'gap';

export default function AdminStatsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [rankings, setRankings] = useState<ElementRanking[]>([]);
  const [view, setView] = useState<ViewMode>('global');
  const [sortBy, setSortBy] = useState<SortField>('elo');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedPair, setSelectedPair] = useState<[string, string] | null>(null);

  const fetchRankings = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/admin/elements', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        sessionStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }

      const data = await response.json();
      if (data.success) {
        const elements = data.data.elements;
        setRankings(elements.filter((e: ElementRanking & { actif: boolean }) => e.actif).map((e: ElementRanking & { actif: boolean; is_starred?: boolean }) => ({
          id: e.id,
          texte: e.texte,
          categorie: e.categorie,
          elo_global: e.elo_global,
          elo_homme: e.elo_homme,
          elo_femme: e.elo_femme,
          elo_16_18: e.elo_16_18 ?? 1000,
          elo_19_22: e.elo_19_22 ?? 1000,
          elo_23_26: e.elo_23_26 ?? 1000,
          elo_27plus: e.elo_27plus ?? 1000,
          nb_participations: e.nb_participations,
          nb_participations_homme: e.nb_participations_homme ?? 0,
          nb_participations_femme: e.nb_participations_femme ?? 0,
          nb_participations_autre: e.nb_participations_autre ?? 0,
          nb_participations_16_18: e.nb_participations_16_18 ?? 0,
          nb_participations_19_22: e.nb_participations_19_22 ?? 0,
          nb_participations_23_26: e.nb_participations_23_26 ?? 0,
          nb_participations_27plus: e.nb_participations_27plus ?? 0,
          is_starred: e.is_starred || false,
        })));
      } else {
        setError(data.error?.message || 'Erreur lors du chargement');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchRankings(token);
  }, [router, fetchRankings]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;
    const interval = setInterval(() => fetchRankings(token), 30000);
    return () => clearInterval(interval);
  }, [fetchRankings]);

  const getEloValue = useCallback((r: ElementRanking) => {
    switch (view) {
      case 'homme': return r.elo_homme;
      case 'femme': return r.elo_femme;
      case '16-18': return r.elo_16_18;
      case '19-22': return r.elo_19_22;
      case '23-26': return r.elo_23_26;
      case '27+': return r.elo_27plus;
      default: return r.elo_global;
    }
  }, [view]);

  const getParticipationsValue = useCallback((r: ElementRanking) => {
    switch (view) {
      case 'homme': return r.nb_participations_homme;
      case 'femme': return r.nb_participations_femme;
      case '16-18': return r.nb_participations_16_18;
      case '19-22': return r.nb_participations_19_22;
      case '23-26': return r.nb_participations_23_26;
      case '27+': return r.nb_participations_27plus;
      default: return r.nb_participations;
    }
  }, [view]);

  const getGenderGap = (r: ElementRanking) => r.elo_femme - r.elo_homme;

  const processedRankings = useMemo(() => {
    const filtered = rankings.filter(r =>
      r.texte.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!selectedCategory || r.categorie === selectedCategory)
    );
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'participations':
          return getParticipationsValue(b) - getParticipationsValue(a);
        case 'gap':
          return Math.abs(getGenderGap(b)) - Math.abs(getGenderGap(a));
        default:
          return getEloValue(b) - getEloValue(a);
      }
    });
  }, [rankings, searchQuery, selectedCategory, sortBy, getEloValue, getParticipationsValue]);

  const displayedRankings = showAll ? processedRankings : processedRankings.slice(0, 100);

  const summaryStats = useMemo(() => {
    if (rankings.length === 0) return null;
    const totalParticipations = rankings.reduce((s, r) => s + getParticipationsValue(r), 0);
    const avgElo = Math.round(rankings.reduce((s, r) => s + getEloValue(r), 0) / rankings.length);
    const sorted = [...rankings].sort((a, b) => Math.abs(getGenderGap(b)) - Math.abs(getGenderGap(a)));
    const biggestGap = sorted[0];
    const mostDebated = [...rankings]
      .filter(r => getParticipationsValue(r) >= 5)
      .sort((a, b) => Math.abs(getEloValue(a) - 1000) - Math.abs(getEloValue(b) - 1000))[0];
    return { totalParticipations, avgElo, biggestGap, mostDebated };
  }, [rankings, getEloValue, getParticipationsValue]);

  const marketingInsights = useMemo(() => {
    if (rankings.length < 2) return [];
    const insights: { text: string; type: 'gender_diff' | 'extreme' | 'consensus' }[] = [];
    const byGap = [...rankings].filter(r => r.nb_participations >= 3).sort((a, b) => Math.abs(getGenderGap(b)) - Math.abs(getGenderGap(a)));
    for (const r of byGap.slice(0, 3)) {
      const gap = getGenderGap(r);
      if (Math.abs(gap) > 30) {
        const who = gap > 0 ? 'Les femmes' : 'Les hommes';
        const other = gap > 0 ? 'les hommes' : 'les femmes';
        insights.push({ text: `${who} considèrent "${r.texte}" comme ${Math.abs(gap) > 100 ? 'beaucoup ' : ''}plus Red Flag que ${other} (écart ELO: ${Math.abs(gap)})`, type: 'gender_diff' });
      }
    }
    const topRed = [...rankings].sort((a, b) => b.elo_global - a.elo_global);
    if (topRed[0] && topRed[0].elo_global > 1050) {
      insights.push({ text: `"${topRed[0].texte}" est le plus gros Red Flag avec un ELO de ${Math.round(topRed[0].elo_global)}`, type: 'extreme' });
    }
    const consensual = [...rankings].filter(r => r.nb_participations >= 3).sort((a, b) => Math.abs(getGenderGap(a)) - Math.abs(getGenderGap(b)));
    if (consensual[0] && Math.abs(getGenderGap(consensual[0])) < 20) {
      insights.push({ text: `Hommes et femmes sont d'accord : "${consensual[0].texte}" (écart seulement ${Math.abs(getGenderGap(consensual[0]))} ELO)`, type: 'consensus' });
    }
    for (let i = 0; i < Math.min(5, topRed.length); i++) {
      for (let j = i + 1; j < Math.min(10, topRed.length); j++) {
        const a = topRed[i], b = topRed[j];
        if (!a || !b) continue;
        if (getGenderGap(a) * getGenderGap(b) < 0 && Math.abs(getGenderGap(a)) > 30 && Math.abs(getGenderGap(b)) > 30) {
          insights.push({ text: `Les femmes trouvent "${a.texte}" pire, tandis que les hommes trouvent "${b.texte}" pire — parfait pour un post viral !`, type: 'gender_diff' });
          break;
        }
      }
      if (insights.length >= 6) break;
    }
    return insights;
  }, [rankings]);

  const pairComparison = useMemo(() => {
    if (!selectedPair) return null;
    const [idA, idB] = selectedPair;
    const a = rankings.find(r => r.id === idA);
    const b = rankings.find(r => r.id === idB);
    if (!a || !b) return null;
    const globalWinner = a.elo_global > b.elo_global ? a : b;
    const hommeWinner = a.elo_homme > b.elo_homme ? a : b;
    const femmeWinner = a.elo_femme > b.elo_femme ? a : b;
    return { a, b, globalWinner, hommeWinner, femmeWinner };
  }, [selectedPair, rankings]);

  const exportCSV = useCallback(() => {
    const headers = ['Rang', 'Texte', 'Catégorie', 'ELO Global', 'ELO Hommes', 'ELO Femmes', 'ELO 16-18', 'ELO 19-22', 'ELO 23-26', 'ELO 27+', 'Écart H/F', 'Participations Total', 'Part. Hommes', 'Part. Femmes', 'Part. 16-18', 'Part. 19-22', 'Part. 23-26', 'Part. 27+', 'Starred'];
    const rows = processedRankings.map((r, i) => [
      i + 1,
      `"${r.texte.replace(/"/g, '""')}"`,
      r.categorie,
      Math.round(r.elo_global),
      Math.round(r.elo_homme),
      Math.round(r.elo_femme),
      Math.round(r.elo_16_18),
      Math.round(r.elo_19_22),
      Math.round(r.elo_23_26),
      Math.round(r.elo_27plus),
      Math.round(getGenderGap(r)),
      r.nb_participations,
      r.nb_participations_homme,
      r.nb_participations_femme,
      r.nb_participations_16_18,
      r.nb_participations_19_22,
      r.nb_participations_23_26,
      r.nb_participations_27plus,
      r.is_starred ? 'Oui' : 'Non',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redflag-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [processedRankings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <AdminNav />
      <div className="p-4 md:p-6 overflow-y-auto pb-24">
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">
              Statistiques <span className="text-[#DC2626]">& Insights</span>
            </h1>
            <p className="text-[#737373] text-sm mt-1">
              {rankings.length} éléments actifs • {summaryStats ? Math.round(summaryStats.totalParticipations / 2).toLocaleString() : 0} votes totaux
            </p>
          </div>
          <button onClick={exportCSV} className="px-4 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#DC2626] transition-all text-sm flex items-center gap-2">
            📥 Export CSV
          </button>
        </div>
      </header>

      {error && (
        <div className="max-w-6xl mx-auto mb-4">
          <div className="bg-[#991B1B]/20 border border-[#DC2626]/50 rounded-xl p-4 text-[#FCA5A5]">{error}</div>
        </div>
      )}

      {summaryStats && (
        <div className="max-w-6xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard label="ELO Moyen" value={summaryStats.avgElo.toString()} icon="📊" />
          <SummaryCard label="Total Votes" value={Math.round(summaryStats.totalParticipations / 2).toLocaleString()} icon="🗳️" />
          <SummaryCard label="Plus gros écart H/F" value={summaryStats.biggestGap ? `${Math.abs(getGenderGap(summaryStats.biggestGap))} pts` : '-'} icon="⚡" sublabel={summaryStats.biggestGap?.texte?.substring(0, 25)} />
          <SummaryCard label="Plus débattu" value={summaryStats.mostDebated ? `${Math.round(getEloValue(summaryStats.mostDebated))} ELO` : '-'} icon="🔥" sublabel={summaryStats.mostDebated?.texte?.substring(0, 25)} />
        </div>
      )}

      {/* ELO Distribution Chart */}
      {rankings.length > 0 && (
        <div className="max-w-6xl mx-auto mb-6">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-3 flex items-center gap-2">
            📊 Distribution ELO
            <span className="text-xs font-normal text-[#737373]">— Répartition des éléments par plage ELO</span>
          </h2>
          <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
            <EloDistributionChart rankings={rankings} />
          </div>
        </div>
      )}

      {/* Participation Activity */}
      {rankings.length > 0 && (
        <div className="max-w-6xl mx-auto mb-6">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-3 flex items-center gap-2">
            🎯 Top 10 — Participations
            <span className="text-xs font-normal text-[#737373]">— Éléments les plus votés {view !== 'global' ? `(${view})` : ''}</span>
          </h2>
          <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
            <TopParticipationsChart rankings={rankings} getParticipations={getParticipationsValue} />
          </div>
        </div>
      )}

      {marketingInsights.length > 0 && (
        <div className="max-w-6xl mx-auto mb-6">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-3 flex items-center gap-2">
            💡 Insights Marketing
            <span className="text-xs font-normal text-[#737373]">— Idées de contenu pour les réseaux</span>
          </h2>
          <div className="space-y-2">
            {marketingInsights.map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className={`p-4 rounded-xl border ${insight.type === 'gender_diff' ? 'bg-[#7C3AED]/10 border-[#7C3AED]/30' : insight.type === 'extreme' ? 'bg-[#DC2626]/10 border-[#DC2626]/30' : 'bg-[#059669]/10 border-[#059669]/30'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{insight.type === 'gender_diff' ? '⚡' : insight.type === 'extreme' ? '🚩' : '🤝'}</span>
                  <p className="text-[#F5F5F5] text-sm leading-relaxed flex-1">{insight.text}</p>
                  <button onClick={() => navigator.clipboard.writeText(insight.text)} className="flex-shrink-0 text-[#737373] hover:text-[#F5F5F5] transition-colors text-xs px-2 py-1 rounded bg-[#2A2A2A]" title="Copier">📋</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-lg font-bold text-[#F5F5F5] mb-3">🔄 Comparateur de duels</h2>
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <select value={selectedPair?.[0] ?? ''} onChange={(e) => setSelectedPair(prev => [e.target.value, prev?.[1] ?? ''])}
              className="flex-1 px-3 py-2 bg-[#0D0D0D] border border-[#333] rounded-lg text-[#F5F5F5] text-sm">
              <option value="">Élément A...</option>
              {rankings.map(r => <option key={r.id} value={r.id}>{r.texte}</option>)}
            </select>
            <span className="text-[#DC2626] font-bold self-center">VS</span>
            <select value={selectedPair?.[1] ?? ''} onChange={(e) => setSelectedPair(prev => [prev?.[0] ?? '', e.target.value])}
              className="flex-1 px-3 py-2 bg-[#0D0D0D] border border-[#333] rounded-lg text-[#F5F5F5] text-sm">
              <option value="">Élément B...</option>
              {rankings.map(r => <option key={r.id} value={r.id}>{r.texte}</option>)}
            </select>
          </div>
          {pairComparison && (
            <div className="space-y-3">
              <ComparisonRow label="🌍 Global" a={pairComparison.a} b={pairComparison.b} eloA={pairComparison.a.elo_global} eloB={pairComparison.b.elo_global} />
              <ComparisonRow label="♂️ Hommes" a={pairComparison.a} b={pairComparison.b} eloA={pairComparison.a.elo_homme} eloB={pairComparison.b.elo_homme} />
              <ComparisonRow label="♀️ Femmes" a={pairComparison.a} b={pairComparison.b} eloA={pairComparison.a.elo_femme} eloB={pairComparison.b.elo_femme} />
              <div className="border-t border-[#333] pt-3 mt-3">
                <p className="text-[#737373] text-xs mb-2">Par tranche d&apos;âge</p>
                <div className="space-y-2">
                  <ComparisonRow label="🎓 16-18" a={pairComparison.a} b={pairComparison.b} eloA={pairComparison.a.elo_16_18} eloB={pairComparison.b.elo_16_18} />
                  <ComparisonRow label="🎯 19-22" a={pairComparison.a} b={pairComparison.b} eloA={pairComparison.a.elo_19_22} eloB={pairComparison.b.elo_19_22} />
                  <ComparisonRow label="💼 23-26" a={pairComparison.a} b={pairComparison.b} eloA={pairComparison.a.elo_23_26} eloB={pairComparison.b.elo_23_26} />
                  <ComparisonRow label="🔥 27+" a={pairComparison.a} b={pairComparison.b} eloA={pairComparison.a.elo_27plus} eloB={pairComparison.b.elo_27plus} />
                </div>
              </div>
              <div className="mt-3 p-3 bg-[#0D0D0D] rounded-lg">
                <p className="text-[#A3A3A3] text-xs mb-1">🔊 Texte marketing :</p>
                <p className="text-[#F5F5F5] text-sm">
                  {pairComparison.hommeWinner.id !== pairComparison.femmeWinner.id
                    ? `Les hommes trouvent "${pairComparison.hommeWinner.texte}" pire, alors que les femmes trouvent "${pairComparison.femmeWinner.texte}" pire. Qui a raison ? 🤔`
                    : `Hommes et femmes sont d'accord : "${pairComparison.globalWinner.texte}" est le plus gros Red Flag ! 🚩`}
                </p>
                <button onClick={() => {
                  const text = pairComparison.hommeWinner.id !== pairComparison.femmeWinner.id
                    ? `Les hommes trouvent "${pairComparison.hommeWinner.texte}" pire, alors que les femmes trouvent "${pairComparison.femmeWinner.texte}" pire. Qui a raison ? 🤔`
                    : `Hommes et femmes sont d'accord : "${pairComparison.globalWinner.texte}" est le plus gros Red Flag ! 🚩`;
                  navigator.clipboard.writeText(text);
                }} className="mt-2 text-xs text-[#DC2626] hover:underline">📋 Copier pour les réseaux</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-4 space-y-3">
        <div>
          <p className="text-[#737373] text-xs mb-1.5">Par genre</p>
          <div className="flex gap-2 flex-wrap">
            <ViewButton active={view === 'global'} onClick={() => setView('global')}>🌍 Global</ViewButton>
            <ViewButton active={view === 'homme'} onClick={() => setView('homme')}>♂️ Hommes</ViewButton>
            <ViewButton active={view === 'femme'} onClick={() => setView('femme')}>♀️ Femmes</ViewButton>
          </div>
        </div>
        <div>
          <p className="text-[#737373] text-xs mb-1.5">Par tranche d&apos;âge</p>
          <div className="flex gap-2 flex-wrap">
            <ViewButton active={view === '16-18'} onClick={() => setView('16-18')}>🎓 16-18</ViewButton>
            <ViewButton active={view === '19-22'} onClick={() => setView('19-22')}>🎯 19-22</ViewButton>
            <ViewButton active={view === '23-26'} onClick={() => setView('23-26')}>💼 23-26</ViewButton>
            <ViewButton active={view === '27+'} onClick={() => setView('27+')}>🔥 27+</ViewButton>
          </div>
        </div>
        <div>
          <p className="text-[#737373] text-xs mb-1.5">Par catégorie</p>
          <div className="flex gap-2 flex-wrap">
            <ViewButton active={selectedCategory === null} onClick={() => setSelectedCategory(null)}>✅ Toutes</ViewButton>
            {Object.entries(CATEGORIES_CONFIG).map(([id, category]) => (
              <ViewButton key={id} active={selectedCategory === id} onClick={() => setSelectedCategory(id)}>
                {category.emoji} {category.labelFr}
              </ViewButton>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" placeholder="Rechercher un élément..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#737373] text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]" />
          <div className="flex gap-2">
            <SortButton active={sortBy === 'elo'} onClick={() => setSortBy('elo')}>Tri: ELO</SortButton>
            <SortButton active={sortBy === 'participations'} onClick={() => setSortBy('participations')}>Tri: Votes</SortButton>
            <SortButton active={sortBy === 'gap'} onClick={() => setSortBy('gap')}>Tri: Écart H/F</SortButton>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="space-y-2">
          {displayedRankings.map((ranking, index) => (
            <motion.div key={ranking.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(index * 0.015, 0.5) }}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-3 md:p-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-[#FCD34D] text-[#0D0D0D]' : index === 1 ? 'bg-[#A3A3A3] text-[#0D0D0D]' : index === 2 ? 'bg-[#D97706] text-white' : 'bg-[#2A2A2A] text-[#A3A3A3]'
                }`}>{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F5F5] text-sm md:text-base truncate">
                    {ranking.is_starred && <span className="mr-1">⭐</span>}{ranking.texte}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[#737373] text-xs">{getParticipationsValue(ranking)} participations</span>
                    <span className="text-[#737373] text-xs">•</span>
                    <span className="text-[#737373] text-xs">{ranking.categorie}</span>
                    {view !== 'global' && (
                      <>
                        <span className="text-[#737373] text-xs">•</span>
                        <span className="text-[#525252] text-[10px]">{ranking.nb_participations} total</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  {(view === 'global' || view === 'homme' || view === 'femme') ? (
                    <>
                      <EloChip label="G" value={ranking.elo_global} highlighted={view === 'global'} />
                      <EloChip label="H" value={ranking.elo_homme} highlighted={view === 'homme'} />
                      <EloChip label="F" value={ranking.elo_femme} highlighted={view === 'femme'} />
                    </>
                  ) : (
                    <>
                      <EloChip label="16-18" value={ranking.elo_16_18} highlighted={view === '16-18'} />
                      <EloChip label="19-22" value={ranking.elo_19_22} highlighted={view === '19-22'} />
                      <EloChip label="23-26" value={ranking.elo_23_26} highlighted={view === '23-26'} />
                      <EloChip label="27+" value={ranking.elo_27plus} highlighted={view === '27+'} />
                    </>
                  )}
                </div>
                <div className="md:hidden text-right">
                  <p className="text-xl font-bold text-[#F5F5F5]">{Math.round(getEloValue(ranking))}</p>
                  <p className="text-[#737373] text-[10px]">ELO</p>
                </div>
                <div className="hidden md:block w-20">
                  <GenderGapBar gap={getGenderGap(ranking)} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {!showAll && processedRankings.length > 100 && (
          <div className="mt-4 text-center">
            <button onClick={() => setShowAll(true)} className="px-6 py-3 bg-[#1A1A1A] border border-[#333] rounded-xl text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#DC2626] transition-all text-sm">
              Voir les {processedRankings.length - 100} éléments restants ({processedRankings.length} total)
            </button>
          </div>
        )}
        {showAll && processedRankings.length > 100 && (
          <div className="mt-4 text-center">
            <button onClick={() => setShowAll(false)} className="px-6 py-3 bg-[#1A1A1A] border border-[#333] rounded-xl text-[#A3A3A3] hover:text-[#F5F5F5] transition-all text-sm">
              Réduire à 100 éléments
            </button>
          </div>
        )}
        <p className="text-center text-[#737373] text-xs mt-4">
          Affichage: {displayedRankings.length} / {processedRankings.length} éléments
        </p>
      </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, sublabel }: { label: string; value: string; icon: string; sublabel?: string }) {
  return (
    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <p className="text-[#737373] text-xs">{label}</p>
      </div>
      <p className="text-xl font-bold text-[#F5F5F5]">{value}</p>
      {sublabel && <p className="text-[#737373] text-[10px] mt-0.5 truncate">{sublabel}</p>}
    </div>
  );
}

function EloChip({ label, value, highlighted }: { label: string; value: number; highlighted: boolean }) {
  return (
    <div className={`text-center px-2 py-1 rounded-lg ${highlighted ? 'bg-[#DC2626]/20 border border-[#DC2626]/40' : 'bg-[#2A2A2A]'}`}>
      <p className={`text-xs ${highlighted ? 'text-[#DC2626]' : 'text-[#737373]'}`}>{label}</p>
      <p className={`text-sm font-bold ${highlighted ? 'text-[#F5F5F5]' : 'text-[#A3A3A3]'}`}>{Math.round(value)}</p>
    </div>
  );
}

function GenderGapBar({ gap }: { gap: number }) {
  const absGap = Math.min(Math.abs(gap), 200);
  const widthPct = (absGap / 200) * 100;
  const isFemmeHigher = gap > 0;
  return (
    <div className="text-center">
      <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden relative">
        <div className={`h-full rounded-full absolute top-0 ${isFemmeHigher ? 'bg-[#EC4899] right-1/2' : 'bg-[#3B82F6] left-1/2'}`} style={{ width: `${widthPct / 2}%` }} />
      </div>
      <p className="text-[10px] text-[#737373] mt-0.5">{gap > 0 ? `♀+${Math.round(gap)}` : gap < 0 ? `♂+${Math.round(Math.abs(gap))}` : '='}</p>
    </div>
  );
}

function ComparisonRow({ label, a, b, eloA, eloB }: { label: string; a: ElementRanking; b: ElementRanking; eloA: number; eloB: number }) {
  const totalElo = eloA + eloB;
  const pctA = totalElo > 0 ? Math.round((eloA / totalElo) * 100) : 50;
  const pctB = 100 - pctA;
  const winnerIsA = eloA >= eloB;
  return (
    <div>
      <p className="text-[#737373] text-xs mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${winnerIsA ? 'text-[#DC2626] font-bold' : 'text-[#A3A3A3]'} w-16 text-right truncate`}>{Math.round(eloA)}</span>
        <div className="flex-1 h-4 bg-[#2A2A2A] rounded-full overflow-hidden flex">
          <div className="h-full bg-[#DC2626]/70 transition-all" style={{ width: `${pctA}%` }} />
          <div className="h-full bg-[#3B82F6]/70 transition-all" style={{ width: `${pctB}%` }} />
        </div>
        <span className={`text-xs ${!winnerIsA ? 'text-[#3B82F6] font-bold' : 'text-[#A3A3A3]'} w-16 truncate`}>{Math.round(eloB)}</span>
      </div>
      <div className="flex justify-between text-[10px] text-[#737373] mt-0.5">
        <span className="truncate max-w-[40%]">{a.texte.substring(0, 30)}</span>
        <span className="truncate max-w-[40%] text-right">{b.texte.substring(0, 30)}</span>
      </div>
    </div>
  );
}

function ViewButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg transition-colors text-sm ${active ? 'bg-[#DC2626] text-white' : 'bg-[#1A1A1A] text-[#A3A3A3] border border-[#333] hover:bg-[#2A2A2A]'}`}>
      {children}
    </button>
  );
}

function SortButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 rounded-lg transition-colors text-xs ${active ? 'bg-[#333] text-[#F5F5F5]' : 'bg-[#1A1A1A] text-[#737373] border border-[#333] hover:bg-[#2A2A2A]'}`}>
      {children}
    </button>
  );
}

function EloDistributionChart({ rankings }: { rankings: ElementRanking[] }) {
  const buckets: { label: string; count: number; range: [number, number] }[] = [
    { label: '<900', count: 0, range: [0, 900] },
    { label: '900-950', count: 0, range: [900, 950] },
    { label: '950-1000', count: 0, range: [950, 1000] },
    { label: '1000-1050', count: 0, range: [1000, 1050] },
    { label: '1050-1100', count: 0, range: [1050, 1100] },
    { label: '>1100', count: 0, range: [1100, 9999] },
  ];

  for (const r of rankings) {
    const elo = r.elo_global;
    for (const bucket of buckets) {
      if (elo >= bucket.range[0] && elo < bucket.range[1]) {
        bucket.count++;
        break;
      }
    }
  }

  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div>
      <div className="flex items-end gap-2 h-28 mb-2">
        {buckets.map((bucket, i) => {
          const pct = (bucket.count / maxCount) * 100;
          const isCenter = i === 2 || i === 3;
          return (
            <div key={bucket.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[#A3A3A3] text-[10px] font-mono">{bucket.count}</span>
              <motion.div
                className={`w-full rounded-t-md ${
                  isCenter
                    ? 'bg-gradient-to-t from-[#D97706] to-[#FBBF24]'
                    : i < 2
                    ? 'bg-gradient-to-t from-[#059669] to-[#34D399]'
                    : 'bg-gradient-to-t from-[#DC2626] to-[#EF4444]'
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, 4)}%` }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                style={{ minHeight: 4 }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {buckets.map(bucket => (
          <div key={bucket.label} className="flex-1 text-center">
            <span className="text-[#737373] text-[10px]">{bucket.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#059669]" /> Green Flags</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D97706]" /> Neutres</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Red Flags</span>
      </div>
    </div>
  );
}

function TopParticipationsChart({ rankings, getParticipations }: { rankings: ElementRanking[]; getParticipations: (r: ElementRanking) => number }) {
  const sorted = [...rankings].sort((a, b) => getParticipations(b) - getParticipations(a)).slice(0, 10);
  const maxP = getParticipations(sorted[0]) || 1;

  return (
    <div className="space-y-2">
      {sorted.map((entry, i) => {
        const pct = (getParticipations(entry) / maxP) * 100;
        return (
          <div key={entry.id} className="flex items-center gap-3">
            <span className="text-[#737373] text-xs font-mono w-4 text-right">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[#F5F5F5] text-xs truncate max-w-[70%]">{entry.texte}</p>
                <span className="text-[#A3A3A3] text-[10px] font-mono">{getParticipations(entry)} votes</span>
              </div>
              <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
