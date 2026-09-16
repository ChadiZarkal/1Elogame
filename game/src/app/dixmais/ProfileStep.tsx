'use client';

/**
 * @module dixmais/ProfileStep
 * Étape « tu es qui ? », entre l'accueil et la première note.
 *
 * POURQUOI UN ÉCRAN À PART
 *   Les deux questions ont d'abord été posées sur l'accueil, sous la
 *   démonstration animée — c'est-à-dire dans la zone défilante. Sur un
 *   téléphone, il fallait faire défiler pour les trouver, pendant que le bouton
 *   en bas réclamait des réponses invisibles. Un écran dédié, atteint en
 *   appuyant sur « Jouer », les met là où on regarde.
 *
 * POURQUOI AVANT LA PREMIÈRE NOTE
 *   Chaque vote part avec le profil de celui qui l'a posé : c'est ce qui
 *   alimente les comparaisons par cohorte. Demandé plus tard, le profil
 *   arriverait après une dizaine de votes déjà enregistrés sans lui — soit
 *   toute la partie de quelqu'un qui n'en fait qu'une.
 *
 * Les joueurs venus des autres jeux du site ne le voient jamais : le profil est
 * enregistré une seule fois pour tout le site, et « Jouer » les emmène
 * directement en partie.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AgeVotant, SexeVotant } from '@/types/database';
import type { PlayerProfile } from '@/types/game';

const SEXES: { value: SexeVotant; label: string; emoji: string }[] = [
  { value: 'homme', label: 'Homme', emoji: '♂️' },
  { value: 'femme', label: 'Femme', emoji: '♀️' },
  { value: 'autre', label: 'Autre', emoji: '🤷' },
];

const AGES: { value: AgeVotant; emoji: string }[] = [
  { value: '16-18', emoji: '🎒' },
  { value: '19-22', emoji: '🎓' },
  { value: '23-26', emoji: '💼' },
  { value: '27+', emoji: '🧠' },
];

const OR = '#F59E0B';

export function ProfileStep({ onSubmit }: { onSubmit: (profile: PlayerProfile) => void }) {
  const [sex, setSex] = useState<SexeVotant | null>(null);
  const [age, setAge] = useState<AgeVotant | null>(null);
  const ready = sex !== null && age !== null;

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
        <div className="flex min-h-full flex-col items-center justify-center py-4 text-center">
          <p
            className="mb-2 text-[11px] font-black uppercase tracking-[0.24em]"
            style={{ color: 'rgba(245,158,11,0.6)' }}
          >
            Avant de juger qui que ce soit
          </p>
          <h2
            className="mb-2 font-black uppercase leading-none tracking-tight text-white"
            style={{ fontSize: 'min(2.6rem, 9vw, 6vh)' }}
          >
            Tu es qui&nbsp;?
          </h2>
          <p className="mb-6 max-w-[30ch] text-sm font-semibold leading-snug text-white/55">
            Deux réponses, et on pourra te dire si tu notes{' '}
            <span style={{ color: '#FBBF24' }}>plus dur que les gens comme toi</span>.
          </p>

          <Question label="Tu es…">
            <div className="grid grid-cols-3 gap-2">
              {SEXES.map((option) => (
                <Pastille
                  key={option.value}
                  active={sex === option.value}
                  onClick={() => setSex(option.value)}
                  emoji={option.emoji}
                  label={option.label}
                />
              ))}
            </div>
          </Question>

          <Question label="Tu as…">
            <div className="grid grid-cols-4 gap-2">
              {AGES.map((option) => (
                <Pastille
                  key={option.value}
                  active={age === option.value}
                  onClick={() => setAge(option.value)}
                  emoji={option.emoji}
                  label={option.value}
                />
              ))}
            </div>
          </Question>
        </div>
      </div>

      <div
        className="shrink-0 px-6 pt-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        {/* Un bouton plutôt qu'un départ automatique au second appui : une
            pastille touchée par erreur serait sinon enregistrée pour de bon,
            le profil valant pour tout le site. */}
        <motion.button
          whileTap={ready ? { scale: 0.96 } : undefined}
          onClick={() => ready && onSubmit({ sex: sex!, age: age! })}
          disabled={!ready}
          className="w-full rounded-2xl py-[18px] text-lg font-black uppercase tracking-widest"
          style={{
            background: ready ? `linear-gradient(135deg, ${OR} 0%, #FFD700 100%)` : 'rgba(255,255,255,0.08)',
            color: ready ? '#000' : 'rgba(255,255,255,0.35)',
            boxShadow: ready ? '0 8px 40px rgba(245,158,11,0.45)' : 'none',
            cursor: ready ? 'pointer' : 'not-allowed',
          }}
        >
          {ready ? "C'est parti →" : 'Choisis les deux'}
        </motion.button>
      </div>
    </motion.div>
  );
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 w-full max-w-xs">
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      {children}
    </div>
  );
}

function Pastille({
  active, onClick, emoji, label,
}: { active: boolean; onClick: () => void; emoji: string; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-pressed={active}
      className="flex min-h-[64px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl transition-colors"
      style={{
        background: active ? OR : 'rgba(255,255,255,0.05)',
        border: `1.5px solid ${active ? OR : 'rgba(255,255,255,0.1)'}`,
        color: active ? '#000' : 'rgba(255,255,255,0.6)',
      }}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-[11px] font-black uppercase tracking-wide">{label}</span>
    </motion.button>
  );
}
