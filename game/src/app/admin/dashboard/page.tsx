'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loading } from '@/components/ui/Loading';
import { AdminNav } from '@/components/admin/AdminNav';

interface DailyVoteStat {
  date: string;
  count: number;
}

interface DashboardStats {
  totalElements: number;
  activeElements: number;
  totalVotes: number;
  todayVotes: number;
  topElement: { texte: string; elo_global: number } | null;
  dailyVotes?: DailyVoteStat[];
}

interface RankEntry {
  rank: number;
  texte: string;
  categorie: string;
  elo_global: number;
  nb_participations: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topRed, setTopRed] = useState<RankEntry[]>([]);
  const [topGreen, setTopGreen] = useState<RankEntry[]>([]);
  const [error, setError] = useState('');
  const [now] = useState(new Date());
  const [showJustification, setShowJustification] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const fetchStats = useCallback(async (token: string) => {
    try {
      const [statsRes, redRes, greenRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/leaderboard?order=desc&limit=5'),
        fetch('/api/leaderboard?order=asc&limit=5'),
      ]);

      if (statsRes.status === 401) {
        sessionStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }

      const [statsData, redData, greenData] = await Promise.all([
        statsRes.json(), redRes.json(), greenRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      else setError(statsData.error?.message || 'Erreur lors du chargement');

      if (redData.success) setTopRed(redData.data.rankings);
      if (greenData.success) setTopGreen(greenData.data.rankings);
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) { router.push('/admin'); return; }
    
    // Load preference from localStorage
    const saved = localStorage.getItem('flagornot_show_justification');
    if (saved !== null) {
      setShowJustification(saved === 'true');
    }
    setIsMounted(true);
    
    fetchStats(token);
  }, [router, fetchStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement..." />
      </div>
    );
  }

  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir';
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const voteRatio = stats ? ((stats.todayVotes / Math.max(stats.totalVotes, 1)) * 100) : 0;
  const activeRatio = stats ? ((stats.activeElements / Math.max(stats.totalElements, 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      <AdminNav />

      <main className="flex-1 p-6">
        {/* Greeting */}
        <div className="max-w-7xl mx-auto mb-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
              {greeting}, <span className="text-[#DC2626]">Admin</span> 👋
            </h1>
            <p className="text-[#737373] mt-1 capitalize">{dateStr}</p>
          </motion.div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto mb-6">
              <div className="bg-[#991B1B]/20 border border-[#DC2626]/50 rounded-xl p-4 text-[#FCA5A5] flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError('')} className="text-[#FCA5A5] hover:text-white">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards with gauges */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard title="Éléments actifs" value={stats?.activeElements ?? 0}
              subtitle={`/ ${stats?.totalElements ?? 0} total`} icon="🎯" color="green" delay={0}
              gauge={activeRatio} />
            <StatCard title="Votes totaux" value={stats?.totalVotes ?? 0}
              subtitle="depuis le lancement" icon="🗳️" color="blue" delay={0.05} />
            <StatCard title="Votes 24h" value={stats?.todayVotes ?? 0}
              subtitle={`${voteRatio.toFixed(1)}% du total`} icon="⚡" color="purple" delay={0.1}
              gauge={Math.min(voteRatio * 10, 100)} />
            <StatCard title="Top Red Flag" value={stats?.topElement?.elo_global ?? 0}
              subtitle={stats?.topElement?.texte?.substring(0, 25) || 'Aucun'} icon="🏆" color="red" delay={0.15} isElo />
          </div>
        </div>

        {/* Charts row: Top Red & Top Green side by side */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top 5 Red Flags bar chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#F5F5F5] font-semibold text-sm">🚩 Top 5 Red Flags</h3>
                <Link href="/admin/stats" className="text-[#DC2626] text-xs hover:underline">Voir tout →</Link>
              </div>
              <div className="space-y-3">
                {topRed.slice(0, 5).map((entry, i) => {
                  const max = topRed[0]?.elo_global || 1;
                  const pct = (entry.elo_global / max) * 100;
                  return (
                    <div key={entry.texte} className="flex items-center gap-3">
                      <span className="text-[#737373] text-xs font-mono w-4 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#F5F5F5] text-xs truncate mb-1">{entry.texte}</p>
                        <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#DC2626] to-[#EF4444] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                          />
                        </div>
                      </div>
                      <span className="text-[#A3A3A3] text-xs font-bold w-10 text-right">{entry.elo_global}</span>
                    </div>
                  );
                })}
                {topRed.length === 0 && <p className="text-[#737373] text-xs text-center py-4">Aucune donnée</p>}
              </div>
            </motion.div>

            {/* Top 5 Green Flags bar chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#F5F5F5] font-semibold text-sm">🟢 Top 5 Green Flags</h3>
                <Link href="/classement" className="text-[#059669] text-xs hover:underline">Classement →</Link>
              </div>
              <div className="space-y-3">
                {topGreen.slice(0, 5).map((entry, i) => {
                  const min = topGreen[0]?.elo_global || 1;
                  const max = topGreen[4]?.elo_global || min + 1;
                  const range = max - min || 1;
                  const pct = 100 - ((entry.elo_global - min) / range) * 100;
                  return (
                    <div key={entry.texte} className="flex items-center gap-3">
                      <span className="text-[#737373] text-xs font-mono w-4 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#F5F5F5] text-xs truncate mb-1">{entry.texte}</p>
                        <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#059669] to-[#34D399] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(pct, 20)}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                          />
                        </div>
                      </div>
                      <span className="text-[#A3A3A3] text-xs font-bold w-10 text-right">{entry.elo_global}</span>
                    </div>
                  );
                })}
                {topGreen.length === 0 && <p className="text-[#737373] text-xs text-center py-4">Aucune donnée</p>}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Activity Overview (simulated sparkline) */}
        <div className="max-w-7xl mx-auto mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
            <h3 className="text-[#F5F5F5] font-semibold text-sm mb-4">📈 Activité récente (7 derniers jours)</h3>
            <ActivityChart dailyVotes={stats?.dailyVotes} />
          </motion.div>
        </div>

        {/* Quick Actions Grid */}
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-[#A3A3A3] mb-4 uppercase tracking-wider text-xs font-semibold">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ActionCard title="Gérer les éléments" description="Ajouter, supprimer, star"
              href="/admin/elements" icon="📝" badge={`${stats?.activeElements ?? 0} actifs`} delay={0} />
            <ActionCard title="Algorithme" description="Anti-répétition, stratégies, ELO"
              href="/admin/algorithm" icon="🧠" delay={0.05} />
            <ActionCard title="Catégories" description="Renommer et organiser"
              href="/admin/categories" icon="🏷️" delay={0.1} />
            <ActionCard title="Statistiques" description="Rankings, insights, CSV"
              href="/admin/stats" icon="📊" badge={`${stats?.totalVotes ?? 0} votes`} delay={0.15} />
            <ActionCard title="Modération" description="Feedbacks et signalements"
              href="/admin/moderation" icon="🛡️" delay={0.2} />
          </div>
        </div>

        {/* Settings Section */}
        {isMounted && (
          <div className="max-w-7xl mx-auto mb-8">
            <h2 className="text-[#A3A3A3] mb-4 uppercase tracking-wider text-xs font-semibold">Paramètres</h2>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#F5F5F5] font-semibold text-sm">🤖 Justifications d'IA</h3>
                  <p className="text-[#737373] text-xs mt-1">Afficher les justifications détaillées dans le jeu "Flag or Not"</p>
                </div>
                <button
                  onClick={() => {
                    const newValue = !showJustification;
                    setShowJustification(newValue);
                    localStorage.setItem('flagornot_show_justification', newValue ? 'true' : 'false');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    showJustification
                      ? 'bg-[#059669] text-[#F5F5F5] hover:bg-[#047857]'
                      : 'bg-[#333] text-[#A3A3A3] hover:bg-[#404040]'
                  }`}
                >
                  {showJustification ? '✓ Activé' : '✕ Désactivé'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Quick Links */}
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-[#A3A3A3] mb-4 uppercase tracking-wider text-xs font-semibold">Accès rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/jeu" className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 hover:border-[#DC2626]/50 transition-all group">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚩</span>
                <div>
                  <h3 className="text-[#F5F5F5] font-semibold group-hover:text-[#DC2626] transition-colors">Red Flag — Jouer</h3>
                  <p className="text-[#737373] text-sm">Tester le jeu principal</p>
                </div>
              </div>
            </Link>
            <Link href="/flagornot" className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 hover:border-[#059669]/50 transition-all group">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="text-[#F5F5F5] font-semibold group-hover:text-[#059669] transition-colors">Flag or Not — Jouer</h3>
                  <p className="text-[#737373] text-sm">Tester le jeu IA</p>
                </div>
              </div>
            </Link>
            <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📡</span>
                <div>
                  <h3 className="text-[#F5F5F5] font-semibold">Status</h3>
                  <p className="text-sm font-medium">
                    {process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
                      ? <span className="text-[#D97706]">🟡 Mode démo</span>
                      : <span className="text-[#22C55E]">🟢 Production</span>
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Mode Warning */}
        {process.env.NEXT_PUBLIC_MOCK_MODE === 'true' && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#D97706]/10 border border-[#D97706]/30 rounded-xl p-4 text-[#FCD34D] text-sm">
              <strong>⚠️ Mode démo</strong> — Données simulées. Connectez Supabase pour la production.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Activity chart - CSS-based bar chart with real 7-day data from Supabase
function ActivityChart({ dailyVotes }: { dailyVotes?: DailyVoteStat[] }) {
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const todayStr = new Date().toISOString().split('T')[0];

  const data = (dailyVotes ?? []).map((d) => {
    const date = new Date(d.date + 'T12:00:00');
    return {
      day: dayNames[date.getDay()],
      votes: d.count,
      isToday: d.date === todayStr,
    };
  });

  if (data.length === 0) {
    return <p className="text-[#737373] text-xs text-center py-8">Aucune donnée disponible</p>;
  }

  const maxVotes = Math.max(...data.map(d => d.votes), 1);

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const pct = (d.votes / maxVotes) * 100;
        return (
          <div key={`${d.day}-${i}`} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[#737373] text-[10px]">{d.votes}</span>
            <motion.div
              className={`w-full rounded-t-md ${
                d.isToday
                  ? 'bg-gradient-to-t from-[#DC2626] to-[#EF4444]'
                  : 'bg-gradient-to-t from-[#333] to-[#444]'
              }`}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 5)}%` }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
              style={{ minHeight: 4 }}
            />
            <span className={`text-[10px] ${d.isToday ? 'text-[#DC2626] font-bold' : 'text-[#737373]'}`}>
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color, isElo = false, delay = 0, gauge }: {
  title: string; value: number; subtitle: string; icon: string;
  color: 'green' | 'blue' | 'purple' | 'red'; isElo?: boolean; delay?: number; gauge?: number;
}) {
  const colors = {
    green: 'border-[#059669]/40 bg-gradient-to-br from-[#059669]/10 to-[#059669]/5',
    blue: 'border-[#3B82F6]/40 bg-gradient-to-br from-[#3B82F6]/10 to-[#3B82F6]/5',
    purple: 'border-[#8B5CF6]/40 bg-gradient-to-br from-[#8B5CF6]/10 to-[#8B5CF6]/5',
    red: 'border-[#DC2626]/40 bg-gradient-to-br from-[#DC2626]/10 to-[#DC2626]/5',
  };
  const barColors = {
    green: 'bg-[#059669]', blue: 'bg-[#3B82F6]', purple: 'bg-[#8B5CF6]', red: 'bg-[#DC2626]',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={`${colors[color]} border rounded-xl p-4 sm:p-6`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[#A3A3A3] text-xs sm:text-sm font-medium">{title}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
        {isElo ? value : value.toLocaleString()}
      </p>
      <p className="text-[#737373] text-xs sm:text-sm mt-1 truncate">{subtitle}</p>
      {gauge !== undefined && (
        <div className="mt-3 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColors[color]}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(gauge, 100)}%` }}
            transition={{ delay: delay + 0.3, duration: 0.8 }}
          />
        </div>
      )}
    </motion.div>
  );
}

function ActionCard({ title, description, href, icon, badge, delay = 0 }: {
  title: string; description: string; href: string; icon: string; badge?: string; delay?: number;
}) {
  return (
    <Link href={href}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
        className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 hover:border-[#DC2626] transition-all cursor-pointer h-full relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#DC2626]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{icon}</span>
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DC2626]/20 text-[#DC2626] font-medium">{badge}</span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-1">{title}</h3>
        <p className="text-[#737373] text-sm">{description}</p>
      </motion.div>
    </Link>
  );
}
