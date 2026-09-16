'use client';

/**
 * @module dixmais/ProfilePicker
 * Sexe et tranche d'âge du joueur, demandés avant la première note.
 *
 * POURQUOI AU DÉBUT ET NON À LA FIN
 *   Chaque vote part avec le profil de celui qui l'a posé : c'est ce qui
 *   alimente les comparaisons par cohorte. Demandé au moment du rapport, le
 *   profil arrivait après une dizaine de votes déjà enregistrés sans lui —
 *   ceux-là étaient perdus pour la statistique, et ils sont les plus nombreux
 *   chez un joueur qui ne fait qu'une partie.
 *
 * AUCUN BOUTON DE VALIDATION
 *   Deux rangées de pastilles, et dès que les deux réponses sont posées le
 *   profil part. Un formulaire à soumettre, devant un jeu de soirée, c'est un
 *   écran de plus à franchir.
 *
 * Les joueurs venus des autres jeux du site ne le voient jamais : le profil est
 * enregistré une seule fois pour tout le site.
 */

import { useState } from 'react';
import type { AgeVotant, SexeVotant } from '@/types/database';
import type { PlayerProfile } from '@/types/game';

const SEXES: { value: SexeVotant; label: string }[] = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
];

const AGES: AgeVotant[] = ['16-18', '19-22', '23-26', '27+'];

const ACTIVE = '#F59E0B';

export function ProfilePicker({
  onProfile,
}: {
  onProfile: (profile: PlayerProfile) => void;
}) {
  const [sex, setSex] = useState<SexeVotant | null>(null);
  const [age, setAge] = useState<AgeVotant | null>(null);

  function choisir(nouveauSexe: SexeVotant | null, nouvelAge: AgeVotant | null) {
    setSex(nouveauSexe);
    setAge(nouvelAge);
    if (nouveauSexe && nouvelAge) onProfile({ sex: nouveauSexe, age: nouvelAge });
  }

  return (
    <div
      className="w-full max-w-xs rounded-2xl px-4 py-3.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,158,11,0.25)' }}
    >
      <p className="mb-2.5 text-center text-[12px] font-bold leading-snug text-white/70">
        Deux questions, et on pourra te dire si tu notes{' '}
        <span style={{ color: '#FBBF24' }}>plus dur que les gens comme toi</span>.
      </p>

      <div className="mb-1.5 grid grid-cols-3 gap-1.5">
        {SEXES.map((option) => (
          <button
            key={option.value}
            onClick={() => choisir(option.value, age)}
            aria-pressed={sex === option.value}
            className="min-h-11 cursor-pointer rounded-lg text-[11px] font-black uppercase tracking-wide transition-colors"
            style={{
              background: sex === option.value ? ACTIVE : 'rgba(255,255,255,0.06)',
              color: sex === option.value ? '#000' : 'rgba(255,255,255,0.55)',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {AGES.map((option) => (
          <button
            key={option}
            onClick={() => choisir(sex, option)}
            aria-pressed={age === option}
            className="min-h-11 cursor-pointer rounded-lg text-[11px] font-black uppercase tracking-wide transition-colors"
            style={{
              background: age === option ? ACTIVE : 'rgba(255,255,255,0.06)',
              color: age === option ? '#000' : 'rgba(255,255,255,0.55)',
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
