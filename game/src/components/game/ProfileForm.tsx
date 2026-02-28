'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { SexeVotant, AgeVotant } from '@/types/database';
import dynamic from 'next/dynamic';

// Lazy-load animated background — renders AFTER first paint to unblock FCP
const AnimatedBackgroundCSS = dynamic(
  () => import('@/components/ui/AnimatedBackgroundCSS').then(m => ({ default: m.AnimatedBackgroundCSS })),
  { ssr: false },
);

const sexOptions: { value: SexeVotant; label: string; emoji: string }[] = [
  { value: 'homme', label: 'Homme', emoji: '♂️' },
  { value: 'femme', label: 'Femme', emoji: '♀️' },
  { value: 'autre', label: 'Autre', emoji: '🤷' },
];

const ageOptions: { value: AgeVotant; label: string; vibe: string }[] = [
  { value: '16-18', label: '16-18', vibe: '🎒' },
  { value: '19-22', label: '19-22', vibe: '🎓' },
  { value: '23-26', label: '23-26', vibe: '💼' },
  { value: '27+', label: '27+', vibe: '🧠' },
];

export function ProfileForm() {
  const router = useRouter();
  const setProfile = useGameStore((state) => state.setProfile);
  
  const [sex, setSex] = useState<SexeVotant | null>(null);
  const [age, setAge] = useState<AgeVotant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBg, setShowBg] = useState(false);
  // mounted = false during SSR → éléments rendus à opacity:1 (pas de classe animation)
  // mounted = true après hydration → classes animation ajoutées → effet de transition
  const [mounted, setMounted] = useState(false);

  // Defer animated background + animation classes to after first paint to unblock FCP
  useEffect(() => {
    // Use requestAnimationFrame to ensure the first paint has occurred
    requestAnimationFrame(() => {
      setShowBg(true);
      setMounted(true);
    });
  }, []);
  
  const handleSubmit = () => {
    if (!sex) {
      setError('Sélectionne ton sexe');
      return;
    }
    if (!age) {
      setError('Sélectionne ton âge');
      return;
    }
    
    setProfile({ sex, age });
    router.push('/jeu/jouer');
  };
  
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden px-3"
      style={{ minHeight: '100dvh', background: '#0A0A0B' }}
    >
      {showBg && <AnimatedBackgroundCSS variant="default" />}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 480, height: 480,
          background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
        }}
      />
      <div className={`relative z-10 flex flex-col items-center justify-center w-full p-6${mounted ? ' animate-fade-in' : ''}`}>
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-[#52525B] hover:text-[#A1A1AA] text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
        >
          ← Accueil
        </button>
      </div>

      {/* Logo */}
      <div className={`mb-6 text-center pt-10${mounted ? ' animate-pf-logo' : ''}`}>
        <div className={`flex items-center justify-center mb-3${mounted ? ' animate-pf-logo-img' : ''}`}>
          <img
            src="/logo-rog-new.svg"
            alt="Red or Green"
            className="w-[180px] sm:w-[220px]"
            draggable={false}
          />
        </div>
        <p className="text-sm font-medium" style={{ color: '#52525B' }}>
          2 infos rapides avant de jouer
        </p>
      </div>
      
      {/* Form container */}
      <div
        className={`w-full max-w-sm${mounted ? ' animate-pf-form' : ''}`}
        style={{
          background: 'rgba(20,20,23,0.9)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          borderRadius: 20,
          padding: '24px',
        }}
      >
        <div className="space-y-6">

        {/* Sex selection */}
        <fieldset>
          <label className="block text-xs font-black tracking-[0.14em] uppercase mb-3" style={{ color: '#6B7280' }}>
            Sexe
          </label>
          <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Sélection du sexe">
            {sexOptions.map((opt) => {
              const selected = sex === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setSex(opt.value); setError(null); }}
                  role="radio"
                  aria-checked={selected}
                  aria-label={opt.label}
                  className="flex flex-col items-center justify-center py-4 px-2 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.94]"
                  style={{
                    background: selected ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${selected ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: selected ? '#FCA5A5' : '#6B7280',
                    boxShadow: selected ? '0 0 20px rgba(239,68,68,0.15)' : 'none',
                  }}
                >
                  <span className="text-2xl mb-1">{opt.emoji}</span>
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
        
        {/* Age selection */}
        <fieldset>
          <label className="block text-xs font-black tracking-[0.14em] uppercase mb-3" style={{ color: '#6B7280' }}>
            Âge
          </label>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Sélection de l'âge">
            {ageOptions.map((opt) => {
              const selected = age === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setAge(opt.value); setError(null); }}
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${opt.label} ans`}
                  className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl font-bold transition-all duration-200 active:scale-[0.94]"
                  style={{
                    background: selected ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${selected ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: selected ? '#FCA5A5' : '#6B7280',
                    boxShadow: selected ? '0 0 20px rgba(239,68,68,0.15)' : 'none',
                  }}
                >
                  <span className="text-lg mb-0.5">{opt.vibe}</span>
                  <span className="text-[11px] font-black">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
        
        {/* Error */}
        {error && (
          <p className="text-[#FCA5A5] text-center text-xs font-medium animate-fade-slide-up-sm">
            ⚠️ {error}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl font-black text-base tracking-wide transition-all duration-200 active:scale-[0.97]"
          style={{
            background: sex && age ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' : 'rgba(255,255,255,0.04)',
            border: sex && age ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.06)',
            color: sex && age ? '#fff' : '#3F3F46',
            boxShadow: sex && age ? '0 8px 32px rgba(239,68,68,0.35)' : 'none',
            cursor: sex && age ? 'pointer' : 'not-allowed',
          }}
        >
          {sex && age ? "🚩 C'EST PARTI" : 'Sélectionne sexe + âge'}
        </button>
        </div>
      </div>

      <p className="text-center mt-5 text-[10px]" style={{ color: '#3F3F46' }}>
        Données 100% anonymes — juste pour les stats
      </p>

      {/* How to play — compact inline under the form */}
      <div className={`w-full max-w-sm mt-4 mb-4${mounted ? ' animate-pf-howto' : ''}`}>
        <div className="flex items-center gap-3 justify-center">
          {[
            { emoji: '🚩', label: 'Choisis le pire' },
            { emoji: '📊', label: 'Compare' },
            { emoji: '🔥', label: 'Enchaîne' },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-[#333] text-xs mr-1">→</span>}
              <span className="text-sm">{step.emoji}</span>
              <span className="text-[10px] font-medium" style={{ color: '#52525B' }}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      </div>
    </div>
  );
}
