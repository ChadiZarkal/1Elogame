'use client';

/**
 * @module redflagtest/r/Devinette
 * « Devine son score » — la porte d'entrée d'un résultat partagé.
 *
 * POURQUOI NE PAS MONTRER LE RÉSULTAT TOUT DE SUITE
 *   Un lien qui affiche directement « 62 % » se lit en deux secondes et se
 *   referme. Le même lien qui demande d'abord une estimation transforme le
 *   destinataire en joueur : il a misé, donc il a un résultat à lui, donc il a
 *   une raison de répondre — et une raison de faire le test à son tour.
 *
 * LE PASSAGE RESTE POSSIBLE
 *   Quelqu'un qui revient sur son propre lien, ou qui n'a pas envie de jouer,
 *   doit pouvoir voir. Une devinette obligatoire serait un péage.
 */

import { useState } from 'react';

/** À moins de cet écart, on considère que c'était vu. */
const TRES_PROCHE = 5;
const PROCHE = 15;

function verdict(ecart: number): string {
  if (ecart <= TRES_PROCHE) return 'Tu le connais bien. Trop bien, peut-être.';
  if (ecart <= PROCHE) return 'Pas loin. Tu as des soupçons fondés.';
  return 'Complètement à côté. Ça en dit long sur l’un de vous deux.';
}

export function Devinette({
  score,
  onReveler,
}: {
  score: number;
  onReveler: () => void;
}) {
  const [pari, setPari] = useState(50);
  const [joue, setJoue] = useState(false);

  const ecart = Math.abs(pari - score);

  return (
    <section className="intro-wrapper">
      <h2>Devine son score</h2>

      <div className="intro-form">
        {!joue ? (
          <>
            <p className="guess-value">{pari} %</p>
            <input
              className="guess-slider"
              type="range"
              min={0}
              max={120}
              value={pari}
              onChange={(e) => setPari(Number(e.target.value))}
              aria-label="Ton estimation de son score"
            />
            <p className="intro-note">
              À combien de pourcents de red flag tu l’estimes&nbsp;? Le curseur va au-delà de
              100 — le test aussi.
            </p>
            <button type="button" className="button-start" onClick={() => setJoue(true)}>
              Je parie
            </button>
            <button type="button" className="guess-skip" onClick={onReveler}>
              Montre-moi directement
            </button>
          </>
        ) : (
          <>
            <p className="guess-verdict">
              Tu as dit <strong>{pari} %</strong>. Il est à <strong>{score} %</strong>.
              <br />
              {verdict(ecart)}
            </p>
            <button type="button" className="button-start" onClick={onReveler}>
              Voir son profil
            </button>
          </>
        )}
      </div>
    </section>
  );
}
