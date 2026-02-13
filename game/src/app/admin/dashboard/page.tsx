'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loading } from '@/components/ui/Loading';
import { AdminNav } from '@/components/admin/AdminNav';

interface DashboardStats {
  totalElements: number;
  activeElements: number;
  totalVotes: number;
  todayVotes: number;
  topElement: { texte: string; elo_global: number } | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [now] = useState(new Date());

  const fetchStats = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        sessionStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
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

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard title="Éléments actifs" value={stats?.activeElements ?? 0}
              subtitle={`/ ${stats?.totalElements ?? 0} total`} icon="🎯" color="green" delay={0} />
            <StatCard title="Votes totaux" value={stats?.totalVotes ?? 0}
              subtitle="depuis le lancement" icon="🗳️" color="blue" delay={0.05} />
            <StatCard title="Votes 24h" value={stats?.todayVotes ?? 0}
              subtitle="dernières 24 heures" icon="⚡" color="purple" delay={0.1} />
            <StatCard title="Top Red Flag" value={stats?.topElement?.elo_global ?? 0}
              subtitle={stats?.topElement?.texte?.substring(0, 25) || 'Aucun'} icon="🏆" color="red" delay={0.15} isElo />
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-lg font-semibold text-[#A3A3A3] mb-4 uppercase tracking-wider text-xs">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard title="Gérer les éléments" description="Ajouter, supprimer, star des red flags"
              href="/admin/elements" icon="📝" badge={`${stats?.activeElements ?? 0} actifs`} delay={0} />
            <ActionCard title="Catégories" description="Renommer et organiser les catégories"
              href="/admin/categories" icon="🏷️" delay={0.05} />
            <ActionCard title="Statistiques" description="Rankings, gender gap, marketing insights"
              href="/admin/stats" icon="📊" badge={`${stats?.totalVotes ?? 0} votes`} delay={0.1} />
            <ActionCard title="Modération" description="Feedbacks et signalements utilisateurs"
              href="/admin/moderation" icon="🛡️" delay={0.15} />
          </div>
        </div>

        {/* Quick Insights */}
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-lg font-semibold text-[#A3A3A3] mb-4 uppercase tracking-wider text-xs">Accès rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/redflag" className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 hover:border-[#DC2626]/50 transition-all group">
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
                  <p className="text-[#22C55E] text-sm font-medium">
                    {process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ? '🟡 Mode démo' : '🟢 Production'}
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

function StatCard({ title, value, subtitle, icon, color, isElo = false, delay = 0 }: {
  title: string; value: number; subtitle: string; icon: string;
  color: 'green' | 'blue' | 'purple' | 'red'; isElo?: boolean; delay?: number;
}) {
  const colors = {
    green: 'border-[#059669]/40 bg-gradient-to-br from-[#059669]/10 to-[#059669]/5',
    blue: 'border-[#3B82F6]/40 bg-gradient-to-br from-[#3B82F6]/10 to-[#3B82F6]/5',
    purple: 'border-[#8B5CF6]/40 bg-gradient-to-br from-[#8B5CF6]/10 to-[#8B5CF6]/5',
    red: 'border-[#DC2626]/40 bg-gradient-to-br from-[#DC2626]/10 to-[#DC2626]/5',
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
