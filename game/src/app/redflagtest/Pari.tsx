'use client';

/**
 * @module redflagtest/Pari
 * « Devine ton score » — avant la première question.
 *
 * POURQUOI DEMANDER UN PARI
 *   Le résultat se lit mieux quand on a une idée à lui opposer. « 68 % » est
 *   un chiffre ; « tu pensais 30 %, tu es à 68 % » est une histoire — celle
 *   qu'on raconte, et qu'on partage. Le pari donne aussi un enjeu aux questions
 *   qui suivent : on joue contre sa propre estimation.
 *
 * RIEN N'EST DÉVOILÉ
 *   L'écran ne montre ni les noms des verdicts ni les phrases de fin : le
 *   joueur parie un chiffre, et découvre à la fin ce qu'il veut dire. Seuls le
 *   drapeau et le chiffre changent de couleur, du vert au rouge — de quoi
 *   sentir où l'on se place sans rien apprendre de ce qui attend.
 *
 * LE PASSAGE RESTE POSSIBLE
 *   Un pari obligatoire serait un péage avant le test. « Passer » lance la
 *   partie sans rien retenir.
 */

import { useState } from 'react';
import { useGesteModeTest } from './modeTest';

/** Le curseur va au-delà de 100, comme le score. */
export const PARI_MAX = 120;

/**
 * Les couleurs de la jauge du test et leurs positions : du vert au rouge
 * jusqu'à 100, puis, hors barème, le violet du test qui s'assombrit jusqu'au
 * presque noir. Au-delà de 100, on ne parle plus de rouge.
 */
const PALETTE: Array<[number, [number, number, number]]> = [
  [0, [42, 160, 72]],     // --light-green
  [48, [247, 201, 20]],   // --yellow
  [66, [226, 124, 33]],   // --orange
  [100, [219, 50, 84]],   // --light-red
  [108, [139, 58, 159]],  // --purple
  [115, [74, 20, 90]],    // violet sombre
  [PARI_MAX, [24, 8, 30]], // presque noir
];

/** Au-delà de 100 : le hors-barème, qui a son propre traitement visuel. */
export const SEUIL_HORS_BAREME = 100;

/** La couleur de la jauge à cette valeur, interpolée entre ses repères. */
export function couleurPari(valeur: number): string {
  const v = Math.max(0, Math.min(PARI_MAX, valeur));
  for (let i = 1; i < PALETTE.length; i++) {
    const [fin, cFin] = PALETTE[i];
    const [debut, cDebut] = PALETTE[i - 1];
    if (v <= fin) {
      const t = (v - debut) / (fin - debut);
      const [r, g, b] = cDebut.map((c, k) => Math.round(c + (cFin[k] - c) * t));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return 'rgb(187, 32, 64)';
}

const GRADUATIONS = [0, 25, 50, 75, 100, PARI_MAX];

export function Pari({
  onParier,
  onPasser,
}: {
  onParier: (pari: number) => void;
  onPasser: () => void;
}) {
  const [pari, setPari] = useState(50);
  // Le geste caché du mode test vit aussi ici : une fois le profil connu, cet
  // écran est le premier de chaque partie.
  const taperTitre = useGesteModeTest();
  const couleur = couleurPari(pari);

  return (
    <section
      className={`intro-wrapper pari${pari > SEUIL_HORS_BAREME ? ' is-hors-bareme' : ''}`}
      style={{ '--pari-couleur': couleur } as React.CSSProperties}
    >
      <h2 onClick={taperTitre}>Devine ton score</h2>

      <p className="pari-question">
        À combien de pourcents de red flag tu t’estimes&nbsp;?
      </p>

      {/* Le drapeau du test, teint par le pari. Il flotte un peu : c'est le
          seul mouvement de l'écran, et il dit « à toi de jouer ». */}
      <svg className="pari-drapeau" viewBox="0 0 56 54" aria-hidden="true">
        <path
          d="M53.9121 20.9573C50.6566 24.843 40.4678 30.8684 29.8665 30.6414C21.0983 30.4547 14.5175 29.8523 8.03011 35.7293L2.91211 7.56143C7.88452 2.74593 13.4494 0.734444 19.8695 1.10965C29.1208 1.64776 39.8719 5.87939 48.9262 0.0224609C48.3539 5.56824 45.8324 8.99638 40.8465 10.9255C45.6034 11.5167 48.189 11.3263 52.5487 13.735C46.9198 15.6605 47.6655 17.8422 41.3616 19.7731C46.339 22.3008 48.295 21.7663 53.9104 20.9573H53.9121Z"
          fill="currentColor"
        />
        <path d="M1.91211 4.02246L11.9121 52.0225" stroke="#D9D9D9" strokeWidth="2" />
      </svg>

      <p className="pari-valeur" aria-live="polite">
        {pari}<span>%</span>
      </p>

      <div className="pari-jauge">
        <input
          className="pari-curseur"
          type="range"
          min={0}
          max={PARI_MAX}
          value={pari}
          onChange={(e) => setPari(Number(e.target.value))}
          aria-label="Ton estimation de ton score de red flag"
          aria-valuetext={`${pari} %`}
        />
        <div className="pari-graduations" aria-hidden="true">
          {GRADUATIONS.map((g) => (
            <span key={g} style={{ left: `${(g / PARI_MAX) * 100}%` }}>{g}</span>
          ))}
        </div>
      </div>
      <div className="pari-bornes" aria-hidden="true">
        <span>Green flag</span>
        <span>Red flag</span>
      </div>

      {/* Dans un `.intro-form` : c'est là que la feuille de référence habille
          `.button-start`. */}
      <div className="intro-form pari-actions">
        <button type="button" className="button-start" onClick={() => onParier(pari)}>
          Je parie {pari} %
        </button>
        <button type="button" className="guess-skip" onClick={onPasser}>
          Passer
        </button>
        <p className="intro-note pari-note">Réponse à la fin du test.</p>
      </div>
    </section>
  );
}
