'use client';

import { useEffect, useState, useMemo } from 'react';
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
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/leaderboard?order=desc').then(r => r.json()),
      fetch('/api/leaderboard?order=asc').then(r => r.json()),
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
    <div className="min-h-screen bg-[#0D0D0D] pb-20">
      {/* Header */}
      <div className="pt-8 pb-6 px-4" style={{ background: `linear-gradient(to bottom, ${accent}22, transparent)` }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.push('/')} className="text-[#737373] hover:text-[#F5F5F5] text-sm mb-4 block transition-colors">
            ← Accueil
          </button>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-[#F5F5F5] text-center">
              🏆 Classement
            </h1>
          </motion.div>

          {/* Stats bar */}
          <div className="flex justify-center gap-4 mt-3 text-xs text-[#737373]">
            <span>{totalElements} red flags</span>
            <span>•</span>
            <span>{totalVotes.toLocaleString()} votes</span>
          </div>

          {/* RED / GREEN mode toggle */}
          <div className="flex justify-center mt-5">
            <div className="inline-flex bg-[#1A1A1A] border border-[#333] rounded-full p-1">
              <button
                onClick={() => setMode('redflag')}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  isRed
                    ? 'bg-[#DC2626] text-white shadow-lg shadow-[#DC2626]/30'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
                }`}
              >
                🚩 Plus Red Flag
              </button>
              <button
                onClick={() => setMode('greenflag')}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  !isRed
                    ? 'bg-[#059669] text-white shadow-lg shadow-[#059669]/30'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
                }`}
              >
                🟢 Moins Red Flag
              </button>
            </div>
          </div>

          {/* Filter type toggle: Gender vs Age */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => { setFilterType('gender'); setView('global'); }}
              className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${
                filterType === 'gender'
                  ? 'bg-[#F5F5F5]/10 text-[#F5F5F5] border border-[#F5F5F5]/20'
                  : 'text-[#737373] hover:text-[#A3A3A3]'
              }`}
            >
              👤 Par sexe
            </button>
            <button
              onClick={() => { setFilterType('age'); setView('16-18'); }}
              className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${
                filterType === 'age'
                  ? 'bg-[#F5F5F5]/10 text-[#F5F5F5] border border-[#F5F5F5]/20'
                  : 'text-[#737373] hover:text-[#A3A3A3]'
              }`}
            >
              📊 Par âge
            </button>
          </div>

          {/* Filter buttons */}
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            {visibleFilters.map((v) => (
              <button key={v.value} onClick={() => setView(v.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  view === v.value
                    ? 'bg-[#F5F5F5]/10 text-[#F5F5F5] border border-[#F5F5F5]/20'
                    : 'text-[#737373] hover:text-[#A3A3A3]'
                }`}>
                {v.emoji} {v.label}
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
          {view !== 'global' && (
            <span className="text-[#737373]">
              {' '}— vue {VIEW_CONFIG.find(v => v.value === view)?.emoji} {VIEW_CONFIG.find(v => v.value === view)?.label}
            </span>
          )}
        </p>
      </div>

      {/* Podium (top 3) */}
      <AnimatePresence mode="wait">
        {sorted.length >= 3 && (
          <motion.div
            key={mode + view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto px-4 mb-6"
          >
            <div className="flex items-end justify-center gap-3 h-52">
              <PodiumCard rank={2} entry={sorted[1]} elo={getEloForView(sorted[1], view)} height="h-32" isRed={isRed} />
              <PodiumCard rank={1} entry={sorted[0]} elo={getEloForView(sorted[0], view)} height="h-44" isRed={isRed} />
              <PodiumCard rank={3} entry={sorted[2]} elo={getEloForView(sorted[2], view)} height="h-24" isRed={isRed} />
            </div>
          </motion.div>
        )}
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

// ═══════════════════════════════════════
// Helper: Get ELO for any view mode
// ═══════════════════════════════════════

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

// ═══════════════════════════════════════
// Podium Card Component
// ═══════════════════════════════════════

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
      className={`${height} w-28 sm:w-36 ${colors[rank - 1]} border rounded-t-xl flex flex-col items-center justify-end p-3`}
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