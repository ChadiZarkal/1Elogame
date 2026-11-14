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
import { useTextesRft } from '../../textes';

/** À moins de cet écart, on considère que c'était vu. */
const TRES_PROCHE = 5;
const PROCHE = 15;


export function Devinette({
  score,
  onReveler,
}: {
  score: number;
  onReveler: () => void;
}) {
  const [pari, setPari] = useState(50);
  const [joue, setJoue] = useState(false);
  const t = useTextesRft();

  const ecart = Math.abs(pari - score);

  return (
    <section className="intro-wrapper">
      <h2>{t.devineSonScore}</h2>

      <div className="intro-form">
        {!joue ? (
          <>
            <p className="guess-value">{t.pct(pari)}</p>
            <input
              className="guess-slider"
              type="range"
              min={0}
              max={120}
              value={pari}
              onChange={(e) => setPari(Number(e.target.value))}
              aria-label={t.devineCurseur}
            />
            <p className="intro-note">
              {t.devineNote}
            </p>
            <button type="button" className="button-start" onClick={() => setJoue(true)}>
              {t.jeParieSeul}
            </button>
            <button type="button" className="guess-skip" onClick={onReveler}>
              {t.montreMoi}
            </button>
          </>
        ) : (
          <>
            <p className="guess-verdict">
              {t.tuAsDit}<strong>{t.pct(pari)}</strong>{t.ilEstA}<strong>{t.pct(score)}</strong>.
              <br />
              {t.devineVerdict(ecart, TRES_PROCHE, PROCHE)}
            </p>
            <button type="button" className="button-start" onClick={onReveler}>
              {t.voirSonProfil}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
