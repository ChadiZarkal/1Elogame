'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface GenderStat {
  gender: string;
  total: number;
  red: number;
  green: number;
  redPercent: number;
}

interface StatsData {
  total: number;
  byGender: GenderStat[];
  insights: string[];
}

const GENDER_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  homme: { label: 'Hommes', emoji: '♂️', color: '#60A5FA' },
  femme: { label: 'Femmes', emoji: '♀️', color: '#F472B6' },
  autre: { label: 'Autre', emoji: '🤷', color: '#A78BFA' },
};

export default function OracleStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/flagornot/stats')
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0A0A0A' }}>
        <div className="text-[#6B7280] text-sm">Chargement des stats...</div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0A0A0A' }}>
        <span className="text-5xl mb-4">📊</span>
        <h1 className="text-xl font-bold text-[#FAFAFA] mb-2">Pas encore de stats</h1>
        <p className="text-[#6B7280] text-sm text-center mb-6">
          Les statistiques apparaîtront quand plus de personnes auront utilisé l&apos;Oracle.
        </p>
        <Link href="/flagornot" className="text-[#EF4444] text-sm font-medium hover:underline">
          ← Retour à l&apos;Oracle
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="px-5 pt-[max(20px,env(safe-area-inset-top))] pb-6">
        <div className="max-w-md mx-auto">
          <Link href="/flagornot" className="text-[#6B7280] hover:text-[#FAFAFA] text-sm mb-5 flex items-center gap-1.5 transition-colors py-1">
            ← Oracle
          </Link>
          <div className="text-center">
            <h1 className="text-[26px] font-black text-[#FAFAFA] tracking-tight">
              📊 Stats Oracle
            </h1>
            <p className="text-[#6B7280] text-sm mt-1">
              {stats.total.toLocaleString('fr-FR')} jugements rendus
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 space-y-6">
        {/* Insights cards */}
        {stats.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B5563]">
              💡 Ce qu&apos;on observe
            </h2>
            {stats.insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-[#FAFAFA] text-[15px] font-medium">{insight}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Gender breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B5563]">
            📈 Par genre
          </h2>
          {stats.byGender.map((g) => {
            const config = GENDER_LABELS[g.gender] || { label: g.gender, emoji: '❓', color: '#6B7280' };
            const greenPercent = g.total > 0 ? 100 - g.redPercent : 0;
            return (
              <div
                key={g.gender}
                className="rounded-2xl p-4"
                style={{ background: '#141414', border: '1px solid #1F1F1F' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.emoji}</span>
                    <span className="text-[#FAFAFA] font-bold">{config.label}</span>
                  </div>
                  <span className="text-[#6B7280] text-xs">{g.total} réponses</span>
                </div>

                {/* Bar */}
                <div className="flex h-6 rounded-full overflow-hidden mb-2" style={{ background: '#1F1F1F' }}>
                  <div
                    className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
                    style={{ width: `${g.redPercent}%`, background: '#EF4444', minWidth: g.redPercent > 0 ? '20px' : '0' }}
                  >
                    {g.redPercent > 10 && `${g.redPercent}%`}
                  </div>
                  <div
                    className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
                    style={{ width: `${greenPercent}%`, background: '#10B981', minWidth: greenPercent > 0 ? '20px' : '0' }}
                  >
                    {greenPercent > 10 && `${greenPercent}%`}
                  </div>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-[#EF4444]">🚩 {g.red} red flags</span>
                  <span className="text-[#10B981]">🟢 {g.green} green flags</span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <div className="text-center pt-4">
          <a
            href="/flagornot"
            className="inline-block px-6 py-3 rounded-2xl font-bold text-white text-sm"
            style={{ background: '#EF4444', boxShadow: '0 4px 20px rgba(239,68,68,0.3)' }}
          >
            🔮 Tester l&apos;Oracle
          </a>
        </div>
      </div>
    </div>
  );
}
