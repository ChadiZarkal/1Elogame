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
  { value: '27+' as const, label: '27+', emoji: '🧠' },
];

export function GenderSelect({ onSelect }: ProfileSelectProps) {
  const [selectedGender, setSelectedGender] = useState<FlagOrNotGender | null>(null);
  const [selectedAge, setSelectedAge] = useState<FlagOrNotAge | null>(null);

  const canConfirm = selectedGender !== null && selectedAge !== null;
  const handleConfirm = () => { if (canConfirm) onSelect(selectedGender!, selectedAge!); };

  return (
    /* `overflow-y-auto` plutôt que `overflow-hidden`, et `my-auto` sur le bloc
       plutôt que `justify-center` sur le conteneur.
       Sur un 360×640 ce contenu réclame 599 px pour 525 disponibles : centré
       dans une boîte qui déborde, il partait de 37 px AU-DESSUS du conteneur —
       la boule et le titre étaient rognés en haut, le bouton et le rappel
       « Comment ça marche » sous le bas, et rien de tout cela n'était
       atteignable, `justify-content: center` rendant le débordement de tête
       non défilable. Des marges automatiques centrent de la même façon tout en
       restant défilables. */
    <div className="flex-1 min-h-0 flex flex-col relative">
      {/* Background aurora orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-90 h-90 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />
        <div
          className="absolute bottom-0 -right-20 w-60 h-60 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div className="absolute inset-0 oracle-bg-dots opacity-10" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center overflow-y-auto overscroll-contain px-5 pt-6 pb-2 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="my-auto text-center w-full max-w-sm shrink-0"
      >
        {/* Crystal ball + rings.
            Dimensions réduites sur écran court : la boule, le titre et le
            sous-titre totalisaient 200 px de décor sur un écran de 640 où
            l'utilisateur n'a que deux choix à faire — le sélecteur d'âge en
            était chassé sous la ligne de flottaison. */}
        <div
          className="relative inline-flex items-center justify-center mb-5 [@media(max-height:740px)]:mb-3 h-24 w-24 [@media(max-height:740px)]:h-16 [@media(max-height:740px)]:w-16"
        >
          <div
            className="absolute rounded-full border border-violet-500/30 animate-oracle-ring"
            style={{ inset: 0 }}
          />
          <div
            className="absolute rounded-full border border-cyan-400/20 animate-oracle-ring-2"
            style={{ inset: 0 }}
          />
          <div
            className="absolute rounded-full border border-violet-400/15 animate-oracle-ring-3"
            style={{ inset: 0 }}
          />
          <motion.span
            className="text-5xl [@media(max-height:740px)]:text-3xl animate-oracle-float relative z-10"
            style={{ display: 'block' }}
          >
            🔮
          </motion.span>
        </div>

        {/* Title */}
        <motion.h2
          className="text-[38px] [@media(max-height:740px)]:text-[26px] font-black tracking-tighter mb-1 oracle-gradient-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          L&apos;ORACLE
        </motion.h2>
        <motion.p
          className="text-[13px] text-[#6B7280] mb-8 [@media(max-height:740px)]:mb-4 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Décris un comportement — obtiens le verdict.
        </motion.p>

        {/* Gender */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#9CA3AF] mb-3 text-left">
            Sexe
          </p>
          <div className="flex gap-2">
            {genderOptions.map((opt) => {
              const sel = selectedGender === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  onClick={() => setSelectedGender(opt.value)}
                  whileTap={{ scale: 0.93 }}
                  className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl transition-all duration-200"
                  style={{
                    background: sel
                      ? 'linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(6,182,212,0.12) 100%)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${sel ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: sel ? '0 0 20px rgba(139,92,246,0.22)' : 'none',
                  }}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className={`text-xs font-bold ${sel ? 'text-violet-300' : 'text-[#6B7280]'}`}>
                    {opt.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Age */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33 }}
        >
          <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#9CA3AF] mb-3 text-left">
            Âge
          </p>
          <div className="flex gap-1.5">
            {ageOptions.map((opt) => {
              const sel = selectedAge === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  onClick={() => setSelectedAge(opt.value)}
                  whileTap={{ scale: 0.93 }}
                  className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all duration-200"
                  style={{
                    background: sel
                      ? 'linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(6,182,212,0.12) 100%)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${sel ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: sel ? '0 0 16px rgba(139,92,246,0.2)' : 'none',
                  }}
                >
                  <span className="text-base leading-none">{opt.emoji}</span>
                  <span className={`text-[11px] font-bold leading-none ${sel ? 'text-violet-300' : 'text-[#6B7280]'}`}>
                    {opt.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

      </motion.div>
      </div>

      {/* Socle d'action — toujours visible.
          Le bouton était le dernier élément d'une colonne de 599 px dans un
          écran de 525 : sur un 360×640, il fallait faire défiler pour valider
          un choix qu'on venait de faire au-dessus. Il est désormais hors de la
          zone défilante, comme le dock de saisie de l'écran suivant. */}
      <div className="shrink-0 relative z-10 px-5 pt-2 pb-[max(16px,env(safe-area-inset-bottom))] text-center">
        <motion.button
          onClick={handleConfirm}
          disabled={!canConfirm}
          whileTap={canConfirm ? { scale: 0.97 } : {}}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="w-full py-4.5 rounded-2xl font-black text-[15px] tracking-wide transition-all duration-300"
          style={{
            background: canConfirm
              ? 'linear-gradient(135deg, #7C3AED 0%, #0891B2 100%)'
              : 'rgba(255,255,255,0.05)',
            color: canConfirm ? '#fff' : '#4B5563',
            boxShadow: canConfirm
              ? '0 0 32px rgba(124,58,237,0.38), 0 8px 32px rgba(0,0,0,0.32)'
              : 'none',
            cursor: canConfirm ? 'pointer' : 'default',
          }}
        >
          {canConfirm ? '✨ Consulter l\'Oracle' : 'Sélectionne sexe + âge'}
        </motion.button>

        <p className="text-[#6B7280] text-[12px] mt-4">
          Données anonymes — uniquement pour les stats
        </p>

        {/* L'écran occupe exactement la fenêtre : sans ce rappel, rien
            n'indique que les explications suivent en dessous. */}
        <a
          href="#page-notes-title"
          className="mt-2 inline-flex min-h-11 items-center text-[12px] font-bold uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-white/75"
        >
          Comment ça marche ↓
        </a>
      </div>
    </div>
  );
}
