'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { SexeVotant, AgeVotant } from '@/types/database';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

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
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: '100dvh', background: '#0A0A0B' }}
    >
      <AnimatedBackground variant="default" />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 480, height: 480,
          background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
        }}
      />
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center w-full p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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
      <motion.div
        className="mb-8 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="text-5xl mb-4 select-none block"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
        >
          🚩
        </motion.div>
        <h1 className="text-4xl font-black text-[#F5F5F7] tracking-tight mb-1">
          Red <span style={{ color: '#EF4444' }}>Flag</span>
        </h1>
        <p className="text-sm font-medium" style={{ color: '#52525B' }}>
          2 infos rapides avant de jouer
        </p>
      </motion.div>
      
      {/* Form container */}
      <motion.div
        className="w-full max-w-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
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
                <motion.button
                  key={opt.value}
                  onClick={() => { setSex(opt.value); setError(null); }}
                  whileTap={{ scale: 0.94 }}
                  role="radio"
                  aria-checked={selected}
                  aria-label={opt.label}
                  className="flex flex-col items-center justify-center py-4 px-2 rounded-xl font-bold text-sm transition-all duration-200"
                  style={{
                    background: selected ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${selected ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: selected ? '#FCA5A5' : '#6B7280',
                    boxShadow: selected ? '0 0 20px rgba(239,68,68,0.15)' : 'none',
                  }}
                >
                  <span className="text-2xl mb-1">{opt.emoji}</span>
                  <span className="text-xs font-bold">{opt.label}</span>
                </motion.button>
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
                <motion.button
                  key={opt.value}
                  onClick={() => { setAge(opt.value); setError(null); }}
                  whileTap={{ scale: 0.94 }}
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${opt.label} ans`}
                  className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl font-bold transition-all duration-200"
                  style={{
                    background: selected ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${selected ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: selected ? '#FCA5A5' : '#6B7280',
                    boxShadow: selected ? '0 0 20px rgba(239,68,68,0.15)' : 'none',
                  }}
                >
                  <span className="text-lg mb-0.5">{opt.vibe}</span>
                  <span className="text-[11px] font-black">{opt.label}</span>
                </motion.button>
              );
            })}
          </div>
        </fieldset>
        
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              key="err"
              className="text-[#FCA5A5] text-center text-xs font-medium"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              ⚠️ {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.button
          onClick={handleSubmit}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-xl font-black text-base tracking-wide transition-all duration-200"
          style={{
            background: sex && age ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' : 'rgba(255,255,255,0.04)',
            border: sex && age ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.06)',
            color: sex && age ? '#fff' : '#3F3F46',
            boxShadow: sex && age ? '0 8px 32px rgba(239,68,68,0.35)' : 'none',
            cursor: sex && age ? 'pointer' : 'not-allowed',
          }}
        >
          {sex && age ? "🚩 C'EST PARTI" : 'Sélectionne sexe + âge'}
        </motion.button>
        </div>
      </motion.div>

      <p className="text-center mt-5 text-[10px]" style={{ color: '#3F3F46' }}>
        Données 100% anonymes — juste pour les stats
      </p>

      </motion.div>
    </div>
  );
}
