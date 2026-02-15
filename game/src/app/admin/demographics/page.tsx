'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AdminNav } from '@/components/admin/AdminNav';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface DemographicsData {
  visitorEvolution: { date: string; visitors: number; votes: number; aiRequests: number }[];
  genderBreakdown: { homme: number; femme: number; autre: number };
  ageBreakdown: Record<string, number>;
  gameEntries: { redflag: number; flagornot: number; redflagtest: number };
  timePerGame: { redflag: number; flagornot: number; redflagtest: number };
  aiRequestsPerSession: { average: number; median: number; max: number };
  agreementRate: number;
  avgChoicesBeforeQuit: number;
  categoryPopularity: { category: string; votes: number; percentage: number }[];
  sessionMetrics: {
    avgDuration: number;
    medianDuration: number;
    bounceRate: number;
    returnRate: number;
    totalSessions: number;
    totalUniqueVisitors: number;
  };
  hourlyActivity: { hour: number; activity: number }[];
  generatedAt: string;
}

// ═══════════════════════════════════════
// Chart Components (pure CSS/SVG — no library)
// ═══════════════════════════════════════

function BarChart({ data, color = '#DC2626', label }: { data: { name: string; value: number }[]; color?: string; label?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-2">
      {label && <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-bold">{label}</p>}
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-[#9CA3AF] w-20 text-right truncate">{item.name}</span>
          <div className="flex-1 h-7 bg-[#1A1A1A] rounded-lg overflow-hidden relative">
            <motion.div
              className="h-full rounded-lg"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white/80">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniLineChart({ data, color = '#DC2626', height = 80 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 300;
  
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 10) - 5,
  }));
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} opacity={i === points.length - 1 ? 1 : 0.4} />
      ))}
    </svg>
  );
}

function DonutChart({ segments, size = 120 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * r;
  
  let offset = 0;
  
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A1A1A" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashArray = `${pct * circumference} ${circumference}`;
          const dashOffset = -offset * circumference;
          offset += pct;
          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 }}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-[#F5F5F5] text-lg font-bold">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-[#6B7280] text-[10px]">total</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-[#9CA3AF]">{seg.label}</span>
            <span className="text-xs font-bold text-[#F5F5F5]">{seg.value}</span>
            <span className="text-[10px] text-[#6B7280]">({Math.round((seg.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatmapRow({ data, label }: { data: { hour: number; activity: number }[]; label?: string }) {
  const max = Math.max(...data.map(d => d.activity), 1);
  return (
    <div>
      {label && <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-bold mb-2">{label}</p>}
      <div className="flex gap-1">
        {data.map((d, i) => {
          const intensity = d.activity / max;
          return (
            <div
              key={i}
              className="flex-1 h-8 rounded-sm relative group cursor-default"
              style={{
                backgroundColor: intensity > 0.7 ? '#DC2626' : intensity > 0.4 ? '#EF4444' : intensity > 0.15 ? '#7F1D1D' : '#1A1A1A',
                opacity: 0.3 + intensity * 0.7,
              }}
              title={`${d.hour}h — ${d.activity} actions`}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-[#4B5563] hidden group-hover:block">
                {d.hour}h
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] text-[#4B5563]">0h</span>
        <span className="text-[8px] text-[#4B5563]">6h</span>
        <span className="text-[8px] text-[#4B5563]">12h</span>
        <span className="text-[8px] text-[#4B5563]">18h</span>
        <span className="text-[8px] text-[#4B5563]">23h</span>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// ═══════════════════════════════════════
// Stat Card component
// ═══════════════════════════════════════

function StatCard({ icon, label, value, subtitle, color = '#DC2626' }: { icon: string; label: string; value: string | number; subtitle?: string; color?: string }) {
  return (
    <motion.div
      className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 space-y-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] uppercase tracking-widest text-[#6B7280] font-bold">{label}</span>
      </div>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      {subtitle && <p className="text-[11px] text-[#6B7280]">{subtitle}</p>}
    </motion.div>
  );
}

// ═══════════════════════════════════════
// Main Page
// ═══════════════════════════════════════

export default function AdminDemographicsPage() {
  const router = useRouter();
  const [data, setData] = useState<DemographicsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/admin/demographics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        sessionStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'Erreur de chargement');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) { router.push('/admin'); return; }
    fetchData(token);
  }, [router, fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;
    const interval = setInterval(() => fetchData(token), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <AdminNav />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center space-y-3">
            <div className="text-4xl animate-pulse">📊</div>
            <p className="text-[#6B7280]">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <AdminNav />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center space-y-3">
            <p className="text-[#EF4444] text-lg">{error || 'Données indisponibles'}</p>
          </div>
        </div>
      </div>
    );
  }

  const genderTotal = data.genderBreakdown.homme + data.genderBreakdown.femme + data.genderBreakdown.autre;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#F5F5F5]">📊 Démographie & Analytics</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Données réelles traquées — Mise à jour: {new Date(data.generatedAt).toLocaleTimeString('fr-FR')}
          </p>
          {data.sessionMetrics.totalSessions === 0 && (
            <div className="mt-3 bg-[#1E3A5F]/30 border border-[#3B82F6]/30 rounded-xl p-4 text-[#93C5FD] text-sm">
              <span className="font-bold">ℹ️ Aucune donnée de session enregistrée pour le moment.</span>
              <br />
              <span className="text-xs text-[#6B7280]">Les statistiques se rempliront automatiquement au fur et à mesure que des utilisateurs visitent le site.</span>
            </div>
          )}
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard icon="👥" label="Sessions" value={data.sessionMetrics.totalSessions} subtitle="total" color="#3B82F6" />
          <StatCard icon="🧑" label="Visiteurs uniques" value={data.sessionMetrics.totalUniqueVisitors} subtitle="estimé" color="#8B5CF6" />
          <StatCard icon="⏱️" label="Durée moy." value={formatDuration(data.sessionMetrics.avgDuration)} subtitle="par session" color="#F59E0B" />
          <StatCard icon="🎯" label="Taux accord" value={`${data.agreementRate}%`} subtitle="avec la majorité" color="#10B981" />
          <StatCard icon="🔢" label="Choix moy." value={data.avgChoicesBeforeQuit} subtitle="avant de quitter" color="#EF4444" />
          <StatCard icon="🤖" label="IA / session" value={data.aiRequestsPerSession.average} subtitle={`max: ${data.aiRequestsPerSession.max}`} color="#06B6D4" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          
          {/* Visitor Evolution */}
          <motion.div
            className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-sm font-bold text-[#F5F5F5] mb-1">📈 Évolution des visiteurs</h3>
            <p className="text-[10px] text-[#6B7280] mb-3">14 derniers jours</p>
            <MiniLineChart data={data.visitorEvolution.map(v => v.visitors)} color="#3B82F6" height={90} />
            <div className="flex justify-between mt-2">
              <span className="text-[9px] text-[#4B5563]">{data.visitorEvolution[0]?.date.slice(5)}</span>
              <span className="text-[9px] text-[#4B5563]">{data.visitorEvolution[data.visitorEvolution.length - 1]?.date.slice(5)}</span>
            </div>
            
            {/* Votes overlay */}
            <h4 className="text-xs text-[#6B7280] mt-4 mb-1">Votes par jour</h4>
            <MiniLineChart data={data.visitorEvolution.map(v => v.votes)} color="#DC2626" height={60} />
            
            {/* AI Requests overlay */}
            <h4 className="text-xs text-[#6B7280] mt-3 mb-1">Requêtes IA par jour</h4>
            <MiniLineChart data={data.visitorEvolution.map(v => v.aiRequests)} color="#06B6D4" height={50} />
          </motion.div>
          
          {/* Gender + Age Breakdown */}
          <div className="space-y-4">
            <motion.div
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-bold text-[#F5F5F5] mb-3">👤 Répartition par genre</h3>
              <DonutChart
                segments={[
                  { label: 'Homme', value: data.genderBreakdown.homme, color: '#3B82F6' },
                  { label: 'Femme', value: data.genderBreakdown.femme, color: '#EC4899' },
                  { label: 'Autre', value: data.genderBreakdown.autre, color: '#6B7280' },
                ]}
              />
              {genderTotal > 0 && (
                <p className="text-[10px] text-[#4B5563] mt-2">
                  Ratio H/F: {(data.genderBreakdown.homme / Math.max(data.genderBreakdown.femme, 1)).toFixed(2)}
                </p>
              )}
            </motion.div>
            
            <motion.div
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-bold text-[#F5F5F5] mb-3">🎂 Répartition par âge</h3>
              <BarChart
                data={Object.entries(data.ageBreakdown).map(([k, v]) => ({ name: k, value: v }))}
                color="#8B5CF6"
              />
            </motion.div>
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          
          {/* Game entries */}
          <motion.div
            className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="text-sm font-bold text-[#F5F5F5] mb-3">🎮 Entrées par jeu</h3>
            <BarChart
              data={[
                { name: 'Red Flag', value: data.gameEntries.redflag },
                { name: 'Flag or Not', value: data.gameEntries.flagornot },
                { name: 'RF Test', value: data.gameEntries.redflagtest },
              ]}
              color="#EF4444"
            />
            <div className="mt-3 pt-3 border-t border-[#333]">
              <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold mb-2">Temps moyen par jeu</p>
              {Object.entries(data.timePerGame).map(([game, seconds]) => (
                <div key={game} className="flex justify-between text-xs py-1">
                  <span className="text-[#9CA3AF] capitalize">{game === 'redflag' ? 'Red Flag' : game === 'flagornot' ? 'Flag or Not' : 'RF Test'}</span>
                  <span className="text-[#F5F5F5] font-bold">{formatDuration(seconds)}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Category popularity */}
          <motion.div
            className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-[#F5F5F5] mb-3">🏷️ Catégories populaires</h3>
            <div className="space-y-3">
              {data.categoryPopularity.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#9CA3AF] capitalize">{cat.category}</span>
                    <span className="text-[#F5F5F5] font-bold">{cat.percentage}%</span>
                  </div>
                  <div className="h-2.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'][i] || '#6B7280' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                  <p className="text-[10px] text-[#4B5563] mt-0.5">{cat.votes} votes</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Session metrics */}
          <motion.div
            className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="text-sm font-bold text-[#F5F5F5] mb-1">📋 Métriques de session</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#9CA3AF]">Durée moyenne</span>
                <span className="text-sm font-bold text-[#F5F5F5]">{formatDuration(data.sessionMetrics.avgDuration)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#9CA3AF]">Durée médiane</span>
                <span className="text-sm font-bold text-[#F5F5F5]">{formatDuration(data.sessionMetrics.medianDuration)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#9CA3AF]">Taux de rebond</span>
                <span className="text-sm font-bold text-[#EF4444]">{data.sessionMetrics.bounceRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#9CA3AF]">Taux de retour</span>
                <span className="text-sm font-bold text-[#10B981]">{data.sessionMetrics.returnRate}%</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-[#333]">
              <h4 className="text-xs text-[#6B7280] mb-2">🤖 Requêtes IA / session</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-[#06B6D4]">{data.aiRequestsPerSession.average}</p>
                  <p className="text-[9px] text-[#6B7280]">Moyenne</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#06B6D4]">{data.aiRequestsPerSession.median}</p>
                  <p className="text-[9px] text-[#6B7280]">Médiane</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#06B6D4]">{data.aiRequestsPerSession.max}</p>
                  <p className="text-[9px] text-[#6B7280]">Max</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Hourly Activity Heatmap */}
        <motion.div
          className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <HeatmapRow data={data.hourlyActivity} label="🕐 Activité par heure de la journée" />
        </motion.div>

        {/* Deep metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon="🎯"
            label="Taux d'accord communauté"
            value={`${data.agreementRate}%`}
            subtitle="Utilisateurs votant avec la majorité"
            color="#10B981"
          />
          <StatCard
            icon="🔄"
            label="Choix avant abandon"
            value={data.avgChoicesBeforeQuit}
            subtitle="Nombre moyen de duels joués"
            color="#F59E0B"
          />
          <StatCard
            icon="📱"
            label="Taux de rebond"
            value={`${data.sessionMetrics.bounceRate}%`}
            subtitle="Partent sans jouer"
            color="#EF4444"
          />
          <StatCard
            icon="🔁"
            label="Taux de rétention"
            value={`${data.sessionMetrics.returnRate}%`}
            subtitle="Reviennent dans les 7 jours"
            color="#8B5CF6"
          />
        </div>
      </div>
    </div>
  );
}
