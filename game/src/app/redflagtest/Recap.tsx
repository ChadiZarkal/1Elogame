'use client';

/**
 * @module redflagtest/Recap
 * Le récap, sur le markup de référence (celui que produisait
 * `ajax-get-stats.php`) :
 *
 *   div.stats-red-flag-pct    → le score, en pastille rouge
 *   ul.stats-flags            → li.flag-gender / .flag-age / .flag-region,
 *                               chacun avec son img.img-flag coloré
 *   section.stats-subscores   → div.spider-chart-container
 *   section.stats-rare-section → ul.stats-rare avec p.rarity-pct
 *   button.share-btn          → le partage, puis « refaire »
 *
 * Le verdict, lui, vit hors de ce bloc : `flac.css` le stylise sous
 * `.game-wrapper .bracket-message`, au-dessus de la barre de progression. Il est
 * donc rendu par `Quiz.tsx`.
 *
 * Tout ce qui s'affiche ici est faux et le dit. Un écran qui annonce
 * « Top 8 % des hommes » à partir de rien serait un mensonge poli.
 */

import { useEffect, useState } from 'react';
import type { Couleur, Rang, Resultat } from './resultat';

/** Variable de palette correspondant à une couleur de drapeau. */
const TEINTE: Record<Couleur, string> = {
  red: 'var(--red)',
  orange: 'var(--orange)',
  green: 'var(--light-green)',
};

/**
 * Fait défiler le nombre jusqu'à sa valeur, pour qu'il atterrisse au lieu
 * d'apparaître.
 */
function useCompteur(cible: number, duree = 1400): number {
  const [valeur, setValeur] = useState(0);

  useEffect(() => {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const span = reduit ? 0 : duree;

    let frame = 0;
    const depart = performance.now();
    const tick = (maintenant: number) => {
      const avance = span <= 0 ? 1 : Math.min(1, (maintenant - depart) / span);
      setValeur(Math.round(cible * (1 - Math.pow(1 - avance, 3))));
      if (avance < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // requestAnimationFrame est suspendu dans un onglet caché : le compteur
    // pourrait ne jamais tourner et le score rester à 0 %, ce qui se lit comme
    // un vrai score — la pire panne possible pour cet écran. Un minuteur
    // garantit l'arrivée du nombre, qu'une image ait été peinte ou non.
    const filet = setTimeout(() => setValeur(cible), span + 250);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(filet);
    };
  }, [cible, duree]);

  return valeur;
}

export function Recap({
  resultat,
  onRecommencer,
}: {
  resultat: Resultat;
  onRecommencer: () => void;
}) {
  const affiche = useCompteur(resultat.score);

  return (
    <>
      <div className="stats-red-flag-pct">
        <p>
          Tu es <strong>{affiche} %</strong> red flag
        </p>
      </div>

      <ul className="stats-flags">
        <Drapeau genre="gender" rang={resultat.rangs.genre} />
        <Drapeau genre="age" rang={resultat.rangs.age} />
        <Drapeau genre="region" rang={resultat.rangs.region} />
      </ul>

      <section className="stats-subscores">
        <h3>Profil</h3>
        <hr />
        <Radar axes={resultat.axes} />
      </section>

      <section className="stats-rare-section">
        <h3>Highlights</h3>
        <hr />
        <p className="subtitle">Les réponses qui te distinguent le plus de la masse</p>
        <ul className="stats-rare">
          {resultat.highlights.map((item) => (
            <li key={item.reponse}>
              <div className="question-answer">
                <p className="question">{item.question}</p>
                <p className="answer">
                  <em>&laquo;&nbsp;{item.reponse}&nbsp;&raquo;</em>
                </p>
                <p className="humor-message">{item.pique}</p>
              </div>
              <p className="rarity-pct" style={{ backgroundColor: TEINTE[item.couleur] }}>
                <strong>{item.part} %</strong>
              </p>
            </li>
          ))}
        </ul>
        <p className="sample-size">
          Basé sur {resultat.participants.toLocaleString('fr-FR')} participant·es
        </p>
      </section>

      <button type="button" className="share-btn" onClick={onRecommencer}>
        {/* eslint-disable-next-line @next/next/no-img-element -- markup de
            référence ; `flac.css` dimensionne l'icône via .share-icon. */}
        <img className="share-icon" src="/rft/img/symbol-share.svg" alt="" />
        <p>Refaire le test</p>
      </button>
    </>
  );
}

function Drapeau({ genre, rang }: { genre: 'gender' | 'age' | 'region'; rang: Rang }) {
  return (
    <li className={`flag-${genre}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- markup de
          référence ; `flac.css` dimensionne l'image via .img-flag. */}
      <img
        className="img-flag"
        src={`/rft/img/flag-${genre}-${rang.couleur}.svg`}
        alt={`Drapeau ${rang.couleur}`}
      />
      <p>
        <strong>Top {rang.top} %</strong>
      </p>
      <p>{rang.legende}</p>
    </li>
  );
}

/* ---------------------------------------------------------------------------
 * Le radar des sous-scores.
 *
 * La référence le dessinait avec Chart.js sur un <canvas>. C'est ici un SVG
 * écrit à la main : la même forme, dans le même conteneur, sans tirer deux cents
 * kilo-octets de bibliothèque graphique dans une page mobile pour un polygone.
 * ------------------------------------------------------------------------- */

const CENTRE = 130;
const RAYON = 88;

/**
 * La zone dessinée déborde volontairement du polygone : les étiquettes des axes
 * sont posées au-delà du dernier anneau, et un SVG rogne ce qui sort de son
 * `viewBox`. « Impulsivité » se retrouverait coupé à droite sans cette marge.
 */
const CADRE = '-48 -12 356 290';

function point(index: number, total: number, ratio: number): [number, number] {
  // On démarre à midi pour que le premier axe se lise comme celui « du haut ».
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return [CENTRE + Math.cos(angle) * RAYON * ratio, CENTRE + Math.sin(angle) * RAYON * ratio];
}

function Radar({ axes }: { axes: Resultat['axes'] }) {
  const total = axes.length;
  const contour = axes.map((_, i) => point(i, total, 1).join(',')).join(' ');
  const forme = axes
    .map((axe, i) => point(i, total, Math.max(0.04, axe.valeur / 100)).join(','))
    .join(' ');

  return (
    <div className="spider-chart-container">
      <svg
        viewBox={CADRE}
        width="100%"
        role="img"
        aria-label={axes.map((a) => `${a.label} ${a.valeur} %`).join(', ')}
      >
        {/* Les anneaux, pour qu'une forme se lise contre une échelle plutôt que
            s'admire dans l'abstrait. */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <polygon
            key={ratio}
            points={axes.map((_, i) => point(i, total, ratio).join(',')).join(' ')}
            fill="none"
            stroke="var(--blueish-grey)"
            strokeWidth="1"
          />
        ))}

        {axes.map((axe, i) => {
          const [x, y] = point(i, total, 1);
          return (
            <line
              key={axe.id}
              x1={CENTRE}
              y1={CENTRE}
              x2={x}
              y2={y}
              stroke="var(--blueish-grey)"
              strokeWidth="1"
            />
          );
        })}

        <polygon points={contour} fill="none" stroke="var(--grey)" strokeWidth="1" />
        <polygon
          points={forme}
          fill="var(--red)"
          fillOpacity="0.45"
          stroke="var(--light-red)"
          strokeWidth="2"
        />

        {axes.map((axe, i) => {
          const [x, y] = point(i, total, 1.22);
          return (
            <text
              key={axe.id}
              x={x}
              y={y}
              fill="var(--white)"
              fontSize="12"
              textAnchor={x > CENTRE + 4 ? 'start' : x < CENTRE - 4 ? 'end' : 'middle'}
              dominantBaseline="middle"
            >
              {axe.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
