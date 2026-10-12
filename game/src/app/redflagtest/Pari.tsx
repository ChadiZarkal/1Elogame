'use client';

/**
 * @module redflagtest/Pari
 * « Devine ton score » — avant la première question.
 *
 * POURQUOI DEMANDER UN PARI
 *   Le résultat se lit mieux quand on a une idée à lui opposer. « 68 % » est
 *   un chiffre ; « tu pensais 30 %, tu es à 68 % » est une histoire — celle
 *   qu'on raconte, et qu'on partage. Le pari donne aussi un enjeu aux quarante
 *   questions qui suivent : on joue contre sa propre estimation.
 *
 * LE PASSAGE RESTE POSSIBLE
 *   Un pari obligatoire serait un péage avant le test. « Passer » lance la
 *   partie sans rien retenir, et le résultat s'affiche comme avant.
 *
 * Le nom du palier sous le chiffre vient des verdicts écrits dans
 * l'administration : le joueur parie dans les mots du test, et retrouvera les
 * mêmes à la fin.
 */

import { useState } from 'react';
import { verdictPour } from '@/lib/rft/score';
import type { Verdict } from '@/lib/rft/types';
import { useGesteModeTest } from './modeTest';

/** Le curseur va au-delà de 100, comme le score. */
export const PARI_MAX = 120;

export function Pari({
  verdicts,
  onParier,
  onPasser,
}: {
  verdicts: Verdict[];
  onParier: (pari: number) => void;
  onPasser: () => void;
}) {
  const [pari, setPari] = useState(50);
  // Le geste caché du mode test vit aussi ici : une fois le profil connu, cet
  // écran est le premier de chaque partie.
  const taperTitre = useGesteModeTest();
  const palier = verdictPour(pari, verdicts);

  return (
    <section className="intro-wrapper">
      <h2 onClick={taperTitre}>Devine ton score</h2>

      <div className="intro-form pari">
        <p className="intro-note pari-question">
          Avant de commencer : à combien de pourcents de red flag tu t’estimes&nbsp;?
        </p>
        <p className="guess-value" aria-live="polite">{pari} %</p>
        {palier && <p className="pari-palier">{palier.titre}</p>}
        <input
          className="guess-slider pari-curseur"
          type="range"
          min={0}
          max={PARI_MAX}
          value={pari}
          onChange={(e) => setPari(Number(e.target.value))}
          aria-label="Ton estimation de ton score de red flag"
        />
        <div className="pari-bornes" aria-hidden="true">
          <span>Green flag</span>
          <span>Red flag</span>
        </div>
        <button type="button" className="button-start" onClick={() => onParier(pari)}>
          Je parie
        </button>
        <button type="button" className="guess-skip" onClick={onPasser}>
          Passer
        </button>
        <p className="intro-note">Tu verras à la fin si tu te connais bien.</p>
      </div>
    </section>
  );
}
