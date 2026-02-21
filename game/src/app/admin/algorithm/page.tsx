'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loading } from '@/components/ui/Loading';
import { AdminNav } from '@/components/admin/AdminNav';
import { AlgorithmConfig, DEFAULT_ALGORITHM_CONFIG } from '@/lib/algorithmConfig';

type StrategyKey = 'elo_close' | 'cross_category' | 'starred' | 'random';

const STRATEGY_ICONS: Record<StrategyKey, string> = {
  elo_close: '⚖️',
  cross_category: '🔀',
  starred: '⭐',
  random: '🎲',
};

const STRATEGY_LABELS: Record<StrategyKey, string> = {
  elo_close: 'ELO Proche',
  cross_category: 'Inter-catégories',
  starred: 'Duels populaires',
  random: 'Aléatoire',
};

export default function AdminAlgorithmPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<AlgorithmConfig>(DEFAULT_ALGORITHM_CONFIG);
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const fetchConfig = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/admin/algorithm', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        sessionStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setConfig(data.data.config);
        setIsDefault(data.data.isDefault);
      } else {
        setError(data.error?.message || 'Erreur de chargement');
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
    fetchConfig(token);
  }, [router, fetchConfig]);

  const saveConfig = async () => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/algorithm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'update', config }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data.config);
        setIsDefault(false);
        setHasChanges(false);
        setSuccess(data.data.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error?.message || 'Erreur de sauvegarde');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsSaving(false);
    }
  };

  const resetConfig = async () => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;

    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/algorithm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data.config);
        setIsDefault(true);
        setHasChanges(false);
        setSuccess('Configuration réinitialisée.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStrategy = (key: StrategyKey, field: 'enabled' | 'weight', value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      strategies: {
        ...prev.strategies,
        [key]: {
          ...prev.strategies[key],
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const autoBalanceWeights = () => {
    const enabled = (Object.keys(config.strategies) as StrategyKey[]).filter(k => config.strategies[k].enabled);
    if (enabled.length === 0) return;

    const each = Math.floor(100 / enabled.length);
    const remainder = 100 - each * enabled.length;

    setConfig(prev => {
      const strategies = { ...prev.strategies };
      enabled.forEach((key, i) => {
        strategies[key] = {
          ...strategies[key],
          weight: each + (i === 0 ? remainder : 0),
        };
      });
      return { ...prev, strategies };
    });
    setHasChanges(true);
  };

  const totalWeight = (Object.keys(config.strategies) as StrategyKey[])
    .filter(k => config.strategies[k].enabled)
    .reduce((sum, k) => sum + config.strategies[k].weight, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      <AdminNav />
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
                  🧠 Algorithme de matchmaking
                </h1>
                <p className="text-[#737373] mt-1 text-sm">
                  Configurer les règles de sélection des duels. Les changements sont appliqués immédiatement.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isDefault ? (
                  <span className="px-3 py-1 rounded-full bg-[#059669]/20 text-[#34D399] text-xs font-medium">
                    ✓ Par défaut
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[#D97706]/20 text-[#FCD34D] text-xs font-medium">
                    ✏️ Personnalisé
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 bg-[#991B1B]/20 border border-[#DC2626]/50 rounded-xl p-4 text-[#FCA5A5] flex items-center justify-between">
                <span>❌ {error}</span>
                <button onClick={() => setError('')} className="text-[#FCA5A5] hover:text-white ml-2">✕</button>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 bg-[#059669]/20 border border-[#059669]/50 rounded-xl p-4 text-[#34D399]">
                ✅ {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Section 1: Strategies ─── */}
          <Section title="📊 Distribution des stratégies" delay={0.05}
            tip="Les poids déterminent la probabilité de chaque stratégie. Ils doivent totaliser 100% parmi les stratégies activées.">
            <div className="space-y-4">
              {(Object.keys(config.strategies) as StrategyKey[]).map((key) => {
                const s = config.strategies[key];
                return (
                  <div key={key} className={`p-4 rounded-xl border transition-all ${
                    s.enabled
                      ? 'bg-[#1A1A1A] border-[#333]'
                      : 'bg-[#0D0D0D] border-[#222] opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{STRATEGY_ICONS[key]}</span>
                        <div>
                          <h4 className="text-[#F5F5F5] font-semibold text-sm">{STRATEGY_LABELS[key]}</h4>
                          <p className="text-[#737373] text-xs">{s.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateStrategy(key, 'enabled', !s.enabled)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          s.enabled
                            ? 'bg-[#059669] text-white hover:bg-[#047857]'
                            : 'bg-[#333] text-[#737373] hover:bg-[#404040]'
                        }`}
                      >
                        {s.enabled ? '✓ Activé' : '✕ Désactivé'}
                      </button>
                    </div>

                    {s.enabled && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#A3A3A3] text-xs">Poids: {s.weight}%</span>
                          <span className="text-[#737373] text-[10px]">{s.recommendation}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={s.weight}
                          onChange={(e) => updateStrategy(key, 'weight', parseInt(e.target.value))}
                          className="w-full h-2 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#DC2626]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Weight total indicator */}
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                Math.abs(totalWeight - 100) <= 0.01
                  ? 'bg-[#059669]/10 border-[#059669]/30'
                  : 'bg-[#DC2626]/10 border-[#DC2626]/30'
              }`}>
                <span className={`text-sm font-medium ${
                  Math.abs(totalWeight - 100) <= 0.01 ? 'text-[#34D399]' : 'text-[#FCA5A5]'
                }`}>
                  Total: {totalWeight}% {Math.abs(totalWeight - 100) <= 0.01 ? '✓' : `(doit être 100%)`}
                </span>
                <button
                  onClick={autoBalanceWeights}
                  className="text-xs px-3 py-1 rounded-lg bg-[#333] text-[#A3A3A3] hover:bg-[#404040] transition-colors"
                >
                  ⚖️ Auto-équilibrer
                </button>
              </div>
            </div>
          </Section>

          {/* ─── Section 2: Anti-Repeat ─── */}
          <Section title="🔄 Anti-répétition" delay={0.1}
            tip="Empêche le même élément d'apparaître trop souvent. C'est le réglage le plus important pour l'expérience joueur.">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[#F5F5F5] font-semibold text-sm">Activer l&apos;anti-répétition</h4>
                  <p className="text-[#737373] text-xs mt-0.5">Recommandé : toujours activé pour une meilleure UX</p>
                </div>
                <button
                  onClick={() => {
                    setConfig(prev => ({
                      ...prev,
                      antiRepeat: { ...prev.antiRepeat, enabled: !prev.antiRepeat.enabled },
                    }));
                    setHasChanges(true);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    config.antiRepeat.enabled
                      ? 'bg-[#059669] text-white hover:bg-[#047857]'
                      : 'bg-[#333] text-[#737373] hover:bg-[#404040]'
                  }`}
                >
                  {config.antiRepeat.enabled ? '✓ Activé' : '✕ Désactivé'}
                </button>
              </div>

              {config.antiRepeat.enabled && (
                <>
                  <NumberInput
                    label="Max apparitions par session"
                    description="Nombre max de fois qu'un élément peut apparaître dans une session. Après ça, il est exclu."
                    recommendation="Recommandé : 2-3. Un élément qui apparaît 4+ fois fatigue le joueur."
                    value={config.antiRepeat.maxAppearancesPerSession}
                    min={1}
                    max={20}
                    onChange={(v) => {
                      setConfig(prev => ({
                        ...prev,
                        antiRepeat: { ...prev.antiRepeat, maxAppearancesPerSession: v },
                      }));
                      setHasChanges(true);
                    }}
                  />

                  <NumberInput
                    label="Cooldown (en rounds)"
                    description="Nombre de rounds avant qu'un élément récent puisse réapparaître. Les éléments en cooldown sont dépiorisés."
                    recommendation="Recommandé : 3-5. Évite de voir le même texte dans des duels consécutifs."
                    value={config.antiRepeat.cooldownRounds}
                    min={0}
                    max={20}
                    onChange={(v) => {
                      setConfig(prev => ({
                        ...prev,
                        antiRepeat: { ...prev.antiRepeat, cooldownRounds: v },
                      }));
                      setHasChanges(true);
                    }}
                  />
                </>
              )}
            </div>
          </Section>

          {/* ─── Section 3: ELO Range ─── */}
          <Section title="📏 Plage ELO" delay={0.15}
            tip="Pour la stratégie 'ELO Proche'. Détermine quand deux éléments sont considérés comme ayant un niveau similaire.">
            <div className="space-y-5">
              <NumberInput
                label="Différence ELO minimum"
                description="En dessous de cette différence, les éléments sont trop proches (pas assez de débat)."
                recommendation="Recommandé : 0-100. Mettre 0 pour inclure les duels parfaitement équilibrés."
                value={config.elo.minDifference}
                min={0}
                max={500}
                step={10}
                onChange={(v) => {
                  setConfig(prev => ({ ...prev, elo: { ...prev.elo, minDifference: v } }));
                  setHasChanges(true);
                }}
              />

              <NumberInput
                label="Différence ELO maximum"
                description="Au-dessus de cette différence, les éléments sont trop éloignés (résultat trop prévisible)."
                recommendation="Recommandé : 200-400. Plus c'est haut, plus il y a de matchups possibles."
                value={config.elo.maxDifference}
                min={50}
                max={1000}
                step={10}
                onChange={(v) => {
                  setConfig(prev => ({ ...prev, elo: { ...prev.elo, maxDifference: v } }));
                  setHasChanges(true);
                }}
              />

              {/* Visual ELO range */}
              <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#333]">
                <p className="text-[#A3A3A3] text-xs mb-2">Aperçu de la plage :</p>
                <div className="relative h-6 bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-[#DC2626]/60 to-[#DC2626] rounded-full"
                    style={{
                      left: `${(config.elo.minDifference / 1000) * 100}%`,
                      width: `${((config.elo.maxDifference - config.elo.minDifference) / 1000) * 100}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-[10px] font-mono">
                      {config.elo.minDifference} — {config.elo.maxDifference} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ─── Section 4: K-Factor ─── */}
          <Section title="🎯 K-Factor (volatilité ELO)" delay={0.2}
            tip="Le K-factor contrôle de combien l'ELO change après chaque duel. Plus haut = plus volatile.">
            <div className="space-y-5">
              <NumberInput
                label="K-factor : Nouveaux éléments"
                description={`Appliqué quand participations < ${config.kFactor.newThreshold}. Éléments instables, ratings bougent vite.`}
                recommendation="Recommandé : 32-48. Les nouveaux éléments doivent trouver vite leur place."
                value={config.kFactor.newK}
                min={8}
                max={64}
                onChange={(v) => {
                  setConfig(prev => ({ ...prev, kFactor: { ...prev.kFactor, newK: v } }));
                  setHasChanges(true);
                }}
              />

              <NumberInput
                label="K-factor : Éléments modérés"
                description={`Appliqué quand participations entre ${config.kFactor.newThreshold} et ${config.kFactor.moderateThreshold}.`}
                recommendation="Recommandé : 24-40. Un bon équilibre stabilité/réactivité."
                value={config.kFactor.moderateK}
                min={8}
                max={64}
                onChange={(v) => {
                  setConfig(prev => ({ ...prev, kFactor: { ...prev.kFactor, moderateK: v } }));
                  setHasChanges(true);
                }}
              />

              <NumberInput
                label="K-factor : Éléments établis"
                description={`Appliqué quand participations ≥ ${config.kFactor.moderateThreshold}. Ratings stables.`}
                recommendation="Recommandé : 16-32. Les classements doivent être stables mais pas figés."
                value={config.kFactor.establishedK}
                min={4}
                max={64}
                onChange={(v) => {
                  setConfig(prev => ({ ...prev, kFactor: { ...prev.kFactor, establishedK: v } }));
                  setHasChanges(true);
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="Seuil 'nouveau'"
                  description="Nombre de participations en dessous duquel un élément est considéré comme nouveau."
                  value={config.kFactor.newThreshold}
                  min={5}
                  max={100}
                  onChange={(v) => {
                    setConfig(prev => ({ ...prev, kFactor: { ...prev.kFactor, newThreshold: v } }));
                    setHasChanges(true);
                  }}
                />
                <NumberInput
                  label="Seuil 'modéré'"
                  description="Au-dessus de ce seuil, l'élément est considéré comme 'établi'."
                  value={config.kFactor.moderateThreshold}
                  min={20}
                  max={500}
                  onChange={(v) => {
                    setConfig(prev => ({ ...prev, kFactor: { ...prev.kFactor, moderateThreshold: v } }));
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>
          </Section>

          {/* ─── Section 5: Advanced ─── */}
          <Section title="⚙️ Avancé" delay={0.25}
            tip="Paramètres avancés pour fine-tuner le comportement global.">
            <div className="space-y-5">
              <NumberInput
                label="Étoiles min (stratégie populaire)"
                description="Nombre minimum d'étoiles qu'un duel doit avoir pour être choisi par la stratégie 'populaire'."
                recommendation="Recommandé : 20-100. Trop bas = duels peu remarquables remontent."
                value={config.starredMinStars}
                min={1}
                max={500}
                onChange={(v) => {
                  setConfig(prev => ({ ...prev, starredMinStars: v }));
                  setHasChanges(true);
                }}
              />

              <NumberInput
                label="Taille du pool de candidats"
                description="Nombre de paires candidates évaluées par stratégie avant d'en choisir une au hasard."
                recommendation="Recommandé : 5-15. Plus haut = plus de variété mais plus lent."
                value={config.candidatePoolSize}
                min={1}
                max={50}
                onChange={(v) => {
                  setConfig(prev => ({ ...prev, candidatePoolSize: v }));
                  setHasChanges(true);
                }}
              />
            </div>
          </Section>

          {/* ─── Save bar ─── */}
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#333] p-4 z-50"
              >
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#FCD34D] text-sm">⚠️ Modifications non sauvegardées</span>
                    {Math.abs(totalWeight - 100) > 0.01 && (
                      <span className="text-[#FCA5A5] text-xs">
                        (Total poids: {totalWeight}% ≠ 100%)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetConfig}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-lg bg-[#333] text-[#A3A3A3] hover:bg-[#404040] text-sm transition-colors"
                    >
                      Réinitialiser
                    </button>
                    <button
                      onClick={saveConfig}
                      disabled={isSaving || Math.abs(totalWeight - 100) > 0.01}
                      className="px-6 py-2 rounded-lg bg-[#DC2626] text-white font-semibold text-sm hover:bg-[#B91C1C] disabled:opacity-50 transition-all"
                    >
                      {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom padding for save bar */}
          {hasChanges && <div className="h-20" />}
        </div>
      </main>
    </div>
  );
}

// ─── Reusable components ─────────────────────────────────────────

function Section({ title, tip, delay = 0, children }: {
  title: string; tip: string; delay?: number; children: React.ReactNode;
}) {
  const [showTip, setShowTip] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-6 bg-[#1A1A1A] border border-[#333] rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#F5F5F5] font-bold text-base">{title}</h2>
        <button
          onClick={() => setShowTip(!showTip)}
          className="text-[#737373] hover:text-[#A3A3A3] text-sm transition-colors"
          title="Voir les recommandations"
        >
          {showTip ? '✕' : '💡'}
        </button>
      </div>
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30"
          >
            <p className="text-[#93C5FD] text-xs leading-relaxed">💡 {tip}</p>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </motion.div>
  );
}

function NumberInput({ label, description, recommendation, value, min, max, step = 1, onChange }: {
  label: string;
  description: string;
  recommendation?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[#F5F5F5] font-medium text-sm">{label}</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(Math.max(min, value - step))}
            className="w-7 h-7 rounded bg-[#333] text-[#A3A3A3] hover:bg-[#404040] flex items-center justify-center text-sm"
          >
            −
          </button>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v >= min && v <= max) onChange(v);
            }}
            className="w-16 h-7 bg-[#2A2A2A] border border-[#333] rounded text-center text-[#F5F5F5] text-sm focus:border-[#DC2626] focus:outline-none"
          />
          <button
            onClick={() => onChange(Math.min(max, value + step))}
            className="w-7 h-7 rounded bg-[#333] text-[#A3A3A3] hover:bg-[#404040] flex items-center justify-center text-sm"
          >
            +
          </button>
        </div>
      </div>
      <p className="text-[#737373] text-xs">{description}</p>
      {recommendation && (
        <p className="text-[#3B82F6]/80 text-[10px] mt-0.5 italic">📌 {recommendation}</p>
      )}
    </div>
  );
}
