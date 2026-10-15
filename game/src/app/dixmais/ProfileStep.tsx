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
import { TEINTES } from './ui';

const SEXES: { value: SexeVotant; label: string }[] = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
];

const AGES: AgeVotant[] = ['16-18', '19-22', '23-26', '27+'];

/**
 * Même retenue que le reste du jeu : pas d'émojis ni de cadres colorés. Un
 * choix se signale en blanc ; l'or reste au seul bouton qui fait avancer.
 */
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
        <div className="flex min-h-full flex-col justify-center py-4">
          <h2
            className="font-black uppercase leading-none tracking-tight text-white"
            style={{ fontSize: 'min(2.6rem, 10vw, 6vh)' }}
          >
            Tu es qui&nbsp;?
          </h2>
          <p className="mt-3 mb-8 max-w-[32ch] text-[15px] leading-snug" style={{ color: TEINTES.secondaire }}>
            Deux réponses, et on pourra te dire si tu notes plus dur que les gens comme toi.
          </p>

          <Question label="Tu es…">
            <div className="grid grid-cols-3 gap-2">
              {SEXES.map((option) => (
                <Choix key={option.value} active={sex === option.value} onClick={() => setSex(option.value)}>
                  {option.label}
                </Choix>
              ))}
            </div>
          </Question>

          <Question label="Tu as…">
            <div className="grid grid-cols-4 gap-2">
              {AGES.map((option) => (
                <Choix key={option} active={age === option} onClick={() => setAge(option)}>
                  {option}
                </Choix>
              ))}
            </div>
          </Question>
        </div>
      </div>

      <div className="shrink-0 px-6 pt-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        {/* Un bouton plutôt qu'un départ automatique au second appui : un choix
            touché par erreur serait sinon enregistré pour de bon, le profil
            valant pour tout le site. */}
        <motion.button
          whileTap={ready ? { scale: 0.97 } : undefined}
          onClick={() => ready && onSubmit({ sex: sex!, age: age! })}
          disabled={!ready}
          className="w-full rounded-2xl py-4 text-[15px] font-black uppercase tracking-wider transition-colors"
          style={{
            background: ready ? TEINTES.or : 'rgba(255,255,255,0.06)',
            color: ready ? '#000' : TEINTES.discret,
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
    <div className="mb-6 w-full">
      <p className="mb-2.5 text-[13px] font-semibold" style={{ color: TEINTES.discret }}>
        {label}
      </p>
      {children}
    </div>
  );
}

/**
 * Bouton ordinaire, et non `motion.button` : sept composants animés sur un
 * écran qu'on ne touche que deux fois coûtent plus qu'ils ne rapportent — à
 * l'affichage comme au test, où ils suffisaient à dépasser le délai.
 */
function Choix({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="min-h-12 cursor-pointer rounded-xl text-[14px] font-bold transition-colors active:scale-95"
      style={{
        background: active ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
        boxShadow: active ? 'none' : `inset 0 0 0 1px ${TEINTES.filet}`,
        color: active ? '#000' : TEINTES.secondaire,
      }}
    >
      {children}
    </button>
  );
}
