'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

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
    // Check authentication
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    // Fetch dashboard stats
    fetchStats(token);
  }, [router, fetchStats]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    router.push('/admin');
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
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#F5F5F5]">
            Admin <span className="text-[#DC2626]">Dashboard</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
            >
              Voir le jeu
            </Link>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-[#991B1B]/20 border border-[#DC2626]/50 rounded-xl p-4 text-[#FCA5A5]">
            {error}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Éléments actifs"
            value={stats?.activeElements ?? 0}
            subtitle={`sur ${stats?.totalElements ?? 0} au total`}
            color="green"
          />
          <StatCard
            title="Votes totaux"
            value={stats?.totalVotes ?? 0}
            subtitle="depuis le lancement"
            color="blue"
          />
          <StatCard
            title="Votes aujourd'hui"
            value={stats?.todayVotes ?? 0}
            subtitle="dernières 24h"
            color="purple"
          />
          <StatCard
            title="Top Red Flag"
            value={stats?.topElement?.elo_global ?? 0}
            subtitle={stats?.topElement?.texte?.substring(0, 30) + '...' || 'Aucun'}
            color="red"
            isElo
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionCard
            title="Gérer les éléments"
            description="Ajouter, modifier ou désactiver des red flags"
            href="/admin/elements"
            icon="📝"
          />
          <ActionCard
            title="Catégories"
            description="Voir et gérer les catégories"
            href="/admin/categories"
            icon="🏷️"
          />
          <ActionCard
            title="Statistiques"
            description="Voir les classements et analyses détaillées"
            href="/admin/stats"
            icon="📊"
          />
          <ActionCard
            title="Modération"
            description="Voir les feedbacks et signalements"
            href="/admin/moderation"
            icon="🛡️"
          />
        </div>
      </div>

      {/* Mock Mode Warning */}
      {process.env.NEXT_PUBLIC_MOCK_MODE === 'true' && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#D97706]/20 border border-[#D97706]/50 rounded-xl p-4 text-[#FCD34D]">
            <strong>Mode démo activé</strong> - Les données affichées sont simulées. Connectez une base Supabase pour les vraies données.
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  color,
  isElo = false,
}: {
  title: string;
  value: number;
  subtitle: string;
  color: 'green' | 'blue' | 'purple' | 'red';
  isElo?: boolean;
}) {
  const colorClasses = {
    green: 'border-[#059669]/50 bg-[#059669]/10',
    blue: 'border-[#333] bg-[#1A1A1A]',
    purple: 'border-[#DC2626]/50 bg-[#DC2626]/10',
    red: 'border-[#DC2626] bg-[#DC2626]/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colorClasses[color]} border rounded-xl p-6`}
    >
      <p className="text-[#A3A3A3] text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-[#F5F5F5]">
        {isElo ? `ELO ${value}` : value.toLocaleString()}
      </p>
      <p className="text-[#737373] text-sm mt-1">{subtitle}</p>
    </motion.div>
  );
}

// Action Card Component
function ActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 hover:border-[#DC2626] hover:bg-[#1A1A1A]/80 transition-all cursor-pointer"
      >
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-1">{title}</h3>
        <p className="text-[#A3A3A3] text-sm">{description}</p>
      </motion.div>
    </Link>
  );
}
