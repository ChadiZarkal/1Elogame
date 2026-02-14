'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/stores/gameStore';
import { SexeVotant, AgeVotant } from '@/types/database';

const sexOptions: { value: SexeVotant; label: string }[] = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Ne se prononce pas' },
];

const ageOptions: { value: AgeVotant; label: string }[] = [
  { value: '16-18', label: '16-18' },
  { value: '19-22', label: '19-22' },
  { value: '23-26', label: '23-26' },
  { value: '27+', label: '27+' },
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
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#0D0D0D]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <motion.div 
        className="mb-12 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-4xl font-bold text-[#F5F5F5] mb-2">
          RED <span className="text-[#DC2626]">FLAG</span>
        </h1>
        <div className="flex justify-center gap-3 text-4xl mb-3">
          <span>🚩</span>
        </div>
        {/* Short onboarding */}
        <div className="bg-[#1A1A1A] border border-[#333]/60 rounded-xl px-5 py-3 max-w-sm mx-auto">
          <p className="text-[#A3A3A3] text-sm leading-relaxed">
            <span className="text-[#F5F5F5] font-semibold">Comment jouer :</span> choisis l&apos;option la plus red flag.
          </p>
        </div>
      </motion.div>
      
      {/* Form container */}
      <motion.div 
        className="w-full max-w-md bg-[#1A1A1A] border border-[#333] rounded-2xl p-8 space-y-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Sex selection */}
        <fieldset className="pb-6 mb-4 border-b border-[#333]">
          <label className="block text-[#F5F5F5] text-lg font-bold mb-3">
            Quel est ton sexe ?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {sexOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => { setSex(option.value); setError(null); }}
                className={`py-3 px-3 rounded-xl text-center font-medium transition-all duration-200 text-sm ${
                  sex === option.value
                    ? 'bg-[#DC2626] text-white ring-2 ring-[#EF4444] scale-105'
                    : 'bg-[#2A2A2A] text-[#A3A3A3] hover:bg-[#333] border border-[#333]'
                }`}
                role="radio"
                aria-checked={sex === option.value}
                aria-label={option.label}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
        
        {/* Age selection */}
        <fieldset>
          <label className="block text-[#F5F5F5] text-lg font-bold mb-3">
            Quel âge as-tu ?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ageOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => { setAge(option.value); setError(null); }}
                className={`py-3 px-2 rounded-xl text-center font-medium transition-all duration-200 text-sm ${
                  age === option.value
                    ? 'bg-[#DC2626] text-white ring-2 ring-[#EF4444] scale-105'
                    : 'bg-[#2A2A2A] text-[#A3A3A3] hover:bg-[#333] border border-[#333]'
                }`}
                role="radio"
                aria-checked={age === option.value}
                aria-label={`${option.label} ans`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
        
        {/* Error message */}
        {error && (
          <motion.p 
            className="text-[#FCA5A5] text-center text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
        
        {/* Submit button */}
        <div className="mt-8 pt-8 border-t border-[#333]">
          <Button
            onClick={handleSubmit}
            variant="primary"
            size="lg"
            className="w-full text-lg py-4"
          >
            JOUER
          </Button>
        </div>
      </motion.div>
      

    </motion.div>
  );
}
