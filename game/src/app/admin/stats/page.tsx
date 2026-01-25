'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loading } from '@/components/ui/Loading';
import { Element } from '@/types';

interface ElementRanking {
  id: string;
  texte: string;
  elo_global: number;
  elo_homme: number;
  elo_femme: number;
  nb_participations: number;
}

export default function AdminStatsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [rankings, setRankings] = useState<ElementRanking[]>([]);
  const [view, setView] = useState<'global' | 'homme' | 'femme'>('global');
  const [error, setError] = useState('');

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
        const elements = data.data.elements as Element[];
        setRankings(elements.filter(e => e.actif).map(e => ({
          id: e.id,
          texte: e.texte,
          elo_global: e.elo_global,
          elo_homme: e.elo_homme,
          elo_femme: e.elo_femme,
          nb_participations: e.nb_participations,
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

  const sortedRankings = [...rankings].sort((a, b) => {
    switch (view) {
      case 'homme':
        return b.elo_homme - a.elo_homme;
      case 'femme':
        return b.elo_femme - a.elo_femme;
      default:
        return b.elo_global - a.elo_global;
    }
  });

  const getEloValue = (ranking: ElementRanking) => {
    switch (view) {
      case 'homme':
        return ranking.elo_homme;
      case 'femme':
        return ranking.elo_femme;
      default:
        return ranking.elo_global;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <Link href="/admin/dashboard" className="text-[#A3A3A3] hover:text-[#F5F5F5] text-sm mb-2 block">
          ← Retour au dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#F5F5F5]">
          Classement <span className="text-[#DC2626]">ELO</span>
        </h1>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-[#991B1B]/20 border border-[#DC2626]/50 rounded-xl p-4 text-[#FCA5A5]">
            {error}
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex gap-2">
          <ViewButton active={view === 'global'} onClick={() => setView('global')}>
            🌍 Global
          </ViewButton>
          <ViewButton active={view === 'homme'} onClick={() => setView('homme')}>
            ♂️ Hommes
          </ViewButton>
          <ViewButton active={view === 'femme'} onClick={() => setView('femme')}>
            ♀️ Femmes
          </ViewButton>
        </div>
      </div>

      {/* Rankings */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2">
          {sortedRankings.slice(0, 50).map((ranking, index) => (
            <motion.div
              key={ranking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 flex items-center gap-4"
            >
              {/* Rank */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                index === 0 ? 'bg-[#FCD34D] text-[#0D0D0D]' :
                index === 1 ? 'bg-[#A3A3A3] text-[#0D0D0D]' :
                index === 2 ? 'bg-[#D97706] text-white' :
                'bg-[#2A2A2A] text-[#A3A3A3]'
              }`}>
                {index + 1}
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-[#F5F5F5]">{ranking.texte}</p>
                <p className="text-[#737373] text-sm">
                  {ranking.nb_participations} participations
                </p>
              </div>

              {/* ELO */}
              <div className="text-right">
                <p className="text-2xl font-bold text-[#F5F5F5]">
                  {Math.round(getEloValue(ranking))}
                </p>
                <p className="text-[#737373] text-xs">ELO</p>
              </div>

              {/* ELO Bar */}
              <div className="w-32 h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#DC2626] to-[#EF4444]"
                  style={{
                    width: `${Math.min(100, (getEloValue(ranking) - 800) / 4)}%`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ViewButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-[#DC2626] text-white'
          : 'bg-[#1A1A1A] text-[#A3A3A3] border border-[#333] hover:bg-[#2A2A2A]'
      }`}
    >
      {children}
    </button>
  );
}
