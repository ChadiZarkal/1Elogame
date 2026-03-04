'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, type PartySize, type PartyConfig } from '@/stores/gameStore';
import { CATEGORIES_CONFIG } from '@/config/categories';

const PARTY_SIZES: { value: PartySize; label: string; description: string; emoji: string }[] = [
  { value: 10, label: '10', description: 'Rapide', emoji: '⚡' },
  { value: 15, label: '15', description: 'Classique', emoji: '🎯' },
  { value: 20, label: '20', description: 'Expert', emoji: '🏆' },
];

const CATEGORY_OPTIONS = [
  { id: null, label: 'Toutes', emoji: '🌍', description: 'Mix de toutes les catégories' },
  ...Object.values(CATEGORIES_CONFIG).map(cat => ({
    id: cat.id,
    label: cat.labelFr,
    emoji: cat.emoji || '🎯',
    description: getCategoryDescription(cat.id),
  })),
];

function getCategoryDescription(id: string): string {
  const descriptions: Record<string, string> = {
    sexe: 'Relations, dating, intimité',
    lifestyle: 'Hobbies, passions, sport',
    quotidien: 'Comportements du quotidien',
    bureau: 'Attitudes au travail',
  };
  return descriptions[id] || '';
}

export function PartySetup() {
  const router = useRouter();
  const { hasProfile, startParty } = useGameStore();
  const [partySize, setPartySize] = useState<PartySize>(15);
  const [category, setCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showRules, setShowRules] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem('rog_has_played');
  });

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Redirect if no profile
  useEffect(() => {
    if (!hasProfile) {
      router.push('/jeu');
    }
  }, [hasProfile, router]);

  const handleStart = () => {
    localStorage.setItem('rog_has_played', '1');
    const config: PartyConfig = {
      size: partySize,
      originalSize: partySize,
      category,
    };
    startParty(config);
  };

  if (!hasProfile) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: '#0A0A0B' }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => router.push('/jeu')}
          className="flex items-center gap-1.5 text-[#71717A] hover:text-[#A1A1AA] text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          aria-label="Retour à la sélection du profil"
        >
          ← Retour
        </button>
      </div>

      <div className={`relative z-10 w-full max-w-md space-y-6 ${mounted ? 'animate-fade-in' : ''}`}>
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">
            🚩 Mode Partie
          </h1>
          <p className="text-[#A1A1AA] text-sm">
            Choisis ta catégorie et le nombre de duels
          </p>
        </div>

        {/* Explainer: Why play? Sociological angle */}
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{
            background: 'rgba(20,20,23,0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-between text-left"
            aria-expanded={showRules}
            aria-controls="party-rules"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🧪</span>
              <span className="text-white font-bold text-sm">Comment ça marche ?</span>
            </div>
            <span
              className="text-[#A1A1AA] text-xs transition-transform"
              style={{ transform: showRules ? 'rotate(180deg)' : 'none' }}
            >
              ▼
            </span>
          </button>

          {showRules && (
            <div id="party-rules" className="space-y-4 pt-2 animate-fade-in">
              {/* Rules */}
              <div className="space-y-2.5">
                {[
                  { emoji: '🆚', title: '2 situations, 1 choix', desc: 'On te présente deux comportements. Choisis celui que tu considères le plus "Red Flag" (le pire).' },
                  { emoji: '📊', title: 'Compare avec la communauté', desc: 'Après chaque vote, découvre si tu es d\'accord avec la majorité. Construis ta streak !' },
                  { emoji: '🏆', title: 'Un récap à la fin', desc: 'À la fin de ta partie, on te donne ton profil personnalité basé sur tes réponses.' },
                ].map(rule => (
                  <div key={rule.title} className="flex gap-3 items-start">
                    <span className="text-xl flex-shrink-0 mt-0.5">{rule.emoji}</span>
                    <div>
                      <p className="text-white text-sm font-bold">{rule.title}</p>
                      <p className="text-[#71717A] text-xs leading-relaxed">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sociological angle */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                <p className="text-[#FCA5A5] text-xs font-bold uppercase tracking-wider">
                  🔬 Expérience sociologique
                </p>
                <p className="text-[#A1A1AA] text-xs leading-relaxed">
                  Chaque vote met à jour les <strong className="text-white">classements en temps réel</strong> de ce qui est considéré comme Red Flag ou Green Flag — par sexe et par âge. Tu contribues à une étude collective sur la perception des comportements.
                </p>
                <div className="flex gap-2 pt-1">
                  <a
                    href="/classement"
                    className="text-[10px] text-[#EF4444] hover:text-[#FCA5A5] font-bold transition-colors"
                  >
                    Voir les classements →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(20,20,23,0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <label className="block text-xs font-black tracking-[0.14em] uppercase mb-3" style={{ color: '#6B7280' }}>
            Catégorie
          </label>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Choix de catégorie">
            {CATEGORY_OPTIONS.map(cat => {
              const selected = category === cat.id;
              return (
                <button
                  key={cat.id ?? 'all'}
                  onClick={() => setCategory(cat.id)}
                  role="radio"
                  aria-checked={selected}
                  className="flex items-center gap-2.5 p-3 rounded-xl transition-all duration-200 active:scale-[0.96] text-left"
                  style={{
                    background: selected ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${selected ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: selected ? '0 0 16px rgba(239,68,68,0.12)' : 'none',
                  }}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: selected ? '#FCA5A5' : '#A1A1AA' }}>
                      {cat.label}
                    </p>
                    <p className="text-[10px]" style={{ color: '#71717A' }}>
                      {cat.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Party Size Selection */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(20,20,23,0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <label className="block text-xs font-black tracking-[0.14em] uppercase mb-3" style={{ color: '#6B7280' }}>
            Nombre de duels
          </label>
          <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Nombre de duels">
            {PARTY_SIZES.map(size => {
              const selected = partySize === size.value;
              return (
                <button
                  key={size.value}
                  onClick={() => setPartySize(size.value)}
                  role="radio"
                  aria-checked={selected}
                  className="flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all duration-200 active:scale-[0.94]"
                  style={{
                    background: selected ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${selected ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: selected ? '0 0 20px rgba(239,68,68,0.15)' : 'none',
                  }}
                >
                  <span className="text-lg mb-0.5">{size.emoji}</span>
                  <span
                    className="text-2xl font-black"
                    style={{ color: selected ? '#FCA5A5' : '#6B7280' }}
                  >
                    {size.label}
                  </span>
                  <span className="text-[10px] font-medium mt-0.5" style={{ color: '#71717A' }}>
                    {size.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-xl font-black text-lg tracking-wide transition-all duration-200 active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
            border: '1px solid #EF4444',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(239,68,68,0.35)',
          }}
        >
          🚩 Lancer la partie ({partySize} duels)
        </button>

        {/* Suggestion CTA */}
        <p className="text-center text-[10px]" style={{ color: '#71717A' }}>
          Tu peux aussi suggérer de nouveaux éléments dans le jeu !
        </p>
      </div>
    </div>
  );
}
