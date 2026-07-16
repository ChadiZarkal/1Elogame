'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { FlagOrNotGender, FlagOrNotAge } from './constants';

interface ProfileSelectProps {
  onSelect: (gender: FlagOrNotGender, age: FlagOrNotAge) => void;
}

const genderOptions = [
  { value: 'homme' as const, label: 'Homme', emoji: '♂️' },
  { value: 'femme' as const, label: 'Femme', emoji: '♀️' },
  { value: 'autre' as const, label: 'Autre', emoji: '🤷' },
];

const ageOptions = [
  { value: '16-18' as const, label: '16-18', emoji: '🎒' },
  { value: '19-22' as const, label: '19-22', emoji: '🎓' },
  { value: '23-26' as const, label: '23-26', emoji: '💼' },
  { value: '27+' as const,  label: '27+',   emoji: '🧠' },
];

export function GenderSelect({ onSelect }: ProfileSelectProps) {
  const [selectedGender, setSelectedGender] = useState<FlagOrNotGender | null>(null);
  const [selectedAge, setSelectedAge]       = useState<FlagOrNotAge | null>(null);

  const canConfirm = selectedGender !== null && selectedAge !== null;

  const handleConfirm = () => {
    if (canConfirm) onSelect(selectedGender!, selectedAge!);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-sm"
      >
        <span className="text-5xl mb-4 block">🔮</span>
        <h2 className="text-2xl font-black text-[#FAFAFA] mb-2">
          Bienvenue sur l&apos;Oracle
        </h2>
        <p className="text-[#6B7280] text-sm mb-6">
          Avant de commencer, dis-nous qui tu es
        </p>

        {/* Gender */}
        <p className="text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-2 text-left">
          Sexe
        </p>
        <div className="flex gap-2 mb-5">
          {genderOptions.map((opt) => {
            const sel = selectedGender === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedGender(opt.value)}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all"
                style={{
                  background: sel ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${sel ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className={`text-sm font-semibold ${sel ? 'text-[#FCA5A5]' : 'text-[#9CA3AF]'}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Age */}
        <p className="text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-2 text-left">
          Âge
        </p>
        <div className="flex gap-2 mb-6">
          {ageOptions.map((opt) => {
            const sel = selectedAge === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedAge(opt.value)}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all"
                style={{
                  background: sel ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${sel ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <span className="text-sm">{opt.emoji}</span>
                <span className={`text-xs font-semibold ${sel ? 'text-[#FCA5A5]' : 'text-[#9CA3AF]'}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="w-full py-4 rounded-2xl font-black text-lg transition-all"
          style={{
            background: canConfirm ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.06)',
            color: canConfirm ? '#fff' : '#4B5563',
            cursor: canConfirm ? 'pointer' : 'default',
          }}
        >
          {canConfirm ? 'Consulter l\'Oracle 🔮' : 'Sélectionne sexe + âge'}
        </button>

        <p className="text-[#4B5563] text-xs mt-4">
          Données anonymes — uniquement pour les stats
        </p>
      </motion.div>
    </div>
  );
}

