'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loading } from '@/components/ui/Loading';

interface RankEntry {
  rank: number;
  texte: string;
  categorie: string;
  elo_global: number;
  elo_homme: number;
  elo_femme: number;
  nb_participations: number;
}

type ViewMode = 'global' | 'homme' | 'femme';

export default function LeaderboardPage() {
  const router = useRouter();
  const [rankings, setRankings] = useState<RankEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('global');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRankings(data.data.rankings);
        } else {
          setError('Impossible de charger le classement');
        }
      })
      .catch(() => setError('Erreur de connexion'))
      .finally(() => setIsLoading(false));
  }, []);

  const sorted = useMemo(() => {
    return [...rankings].sort((a, b) => {
      switch (view) {
        case 'homme': return b.elo_homme - a.elo_homme;
        case 'femme': return b.elo_femme - a.elo_femme;
        default: return b.elo_global - a.elo_global;
      }
    });
  }, [rankings, view]);

  const getElo = (r: RankEntry) => {
    switch (view) {
      case 'homme': return r.elo_homme;
      case 'femme': return r.elo_femme;
      default: return r.elo_global;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement du classement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#DC2626]/20 to-transparent pt-8 pb-6 px-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.push('/')} className="text-[#737373] hover:text-[#F5F5F5] text-sm mb-4 block transition-colors">
            ← Accueil
          </button>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-[#F5F5F5] text-center">
              🏆 Classement <span className="text-[#DC2626]">Red Flags</span>
            </h1>
            <p className="text-[#737373] text-center text-sm mt-2">
              Top 50 des plus gros Red Flags selon les votes
            </p>
          </motion.div>

          {/* View tabs */}
          <div className="flex justify-center gap-2 mt-5">
            {(['global', 'homme', 'femme'] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  view === v
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-[#1A1A1A] text-[#A3A3A3] border border-[#333] hover:bg-[#2A2A2A]'
                }`}>
                {v === 'global' ? '🌍 Tous' : v === 'homme' ? '♂️ Hommes' : '♀️ Femmes'}
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

      {/* Podium (top 3) */}
      {sorted.length >= 3 && (
        <div className="max-w-2xl mx-auto px-4 mb-6">
          <div className="flex items-end justify-center gap-3 h-52">
            {/* 2nd place */}
            <PodiumCard rank={2} entry={sorted[1]} elo={getElo(sorted[1])} height="h-32" />
            {/* 1st place */}
            <PodiumCard rank={1} entry={sorted[0]} elo={getElo(sorted[0])} height="h-44" />
            {/* 3rd place */}
            <PodiumCard rank={3} entry={sorted[2]} elo={getElo(sorted[2])} height="h-24" />
          </div>
        </div>
      )}

      {/* Ranking list (4th+) */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-2">
          {sorted.slice(3).map((entry, idx) => (
            <motion.div key={entry.texte} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.5) }}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#737373] font-bold text-sm flex-shrink-0">
                {idx + 4}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F5F5F5] text-sm truncate">{entry.texte}</p>
                <p className="text-[#737373] text-xs">{entry.categorie} • {entry.nb_participations} votes</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-[#F5F5F5]">{getElo(entry)}</p>
                <p className="text-[#737373] text-[10px]">ELO</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-4 mt-8 text-center">
        <motion.button
          onClick={() => router.push('/redflag')}
          className="px-8 py-3 bg-[#DC2626] text-white rounded-xl font-bold text-lg hover:bg-[#EF4444] transition-colors shadow-[0_0_30px_rgba(220,38,38,0.3)]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🚩 Jouer et voter !
        </motion.button>
      </div>
    </div>
  );
}

function PodiumCard({ rank, entry, elo, height }: { rank: number; entry: RankEntry; elo: number; height: string }) {
  const medals = ['🥇', '🥈', '🥉'];
  const colors = [
    'bg-gradient-to-t from-[#FCD34D]/20 to-[#FCD34D]/5 border-[#FCD34D]/40',
    'bg-gradient-to-t from-[#A3A3A3]/20 to-[#A3A3A3]/5 border-[#A3A3A3]/40',
    'bg-gradient-to-t from-[#D97706]/20 to-[#D97706]/5 border-[#D97706]/40',
  ];

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
      <p className="text-[#737373] text-[10px]">ELO</p>
    </motion.div>
  );
}
