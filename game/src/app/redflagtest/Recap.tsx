'use client';

/**
 * @module redflagtest/Recap
 * Le récap, sur le markup de référence (celui que produisait
 * `ajax-get-stats.php`) :
 *
 *   div.stats-red-flag-pct     → le score, en pastille rouge
 *   ul.stats-flags             → li.flag-gender / .flag-age, drapeau coloré
 *   section.stats-subscores    → div.spider-chart-container
 *   section.stats-rare-section → ul.stats-rare avec p.rarity-pct
 *   button.share-btn           → refaire
 *
 * Le verdict, lui, vit hors de ce bloc : `flac.css` le stylise sous
 * `.game-wrapper .bracket-message`, au-dessus de la barre de progression. Il
 * est donc rendu par `Quiz.tsx`.
 *
 * DEUX DRAPEAUX ET NON TROIS
 *   La référence en affichait trois : genre, âge, région. Le test ne demande
 *   pas la région — deux questions au démarrage sont déjà deux portes avant le
 *   jeu — et un drapeau « de ta région » calculé sur rien serait un ornement
 *   mensonger. Le CSS répartit les deux restants sans rien changer.
 *
 * CE QUI EST DIT QUAND ON NE SAIT PAS
 *   Une cohorte trop mince porte son avertissement au lieu de se taire. Un rang
 *   sur quatre joueurs reste un rang ; le présenter comme un rang sur mille
 *   serait le mensonge que cet écran ne peut pas se permettre.
 */

import { useEffect, useState } from 'react';
import type { Classement, Resultat } from '@/lib/rft/types';
import type { PlayerProfile } from '@/types/game';

/** Sous ce rang, on est dans la tête du classement : drapeau rouge. */
const SEUIL_ROUGE = 33;
const SEUIL_ORANGE = 66;

/** Plus le « top » est bas, plus le joueur est extrême. */
function couleur(top: number): 'red' | 'orange' | 'green' {
  if (top <= SEUIL_ROUGE) return 'red';
  if (top <= SEUIL_ORANGE) return 'orange';
  return 'green';
}

const SEXES: Record<string, string> = {
  homme: 'des hommes',
  femme: 'des femmes',
  autre: 'des joueurs',
};

function legendeAge(age: string): string {
  return age === '27+' ? 'des 27 ans et plus' : `des ${age} ans`;
}

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
  resultat, profil, onRecommencer,
}: {
  resultat: Resultat;
  profil: PlayerProfile | null;
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

      {(resultat.classements.sexe || resultat.classements.age) && (
        <ul className="stats-flags">
          {resultat.classements.sexe && profil && (
            <Drapeau
              genre="gender"
              rang={resultat.classements.sexe}
              legende={SEXES[profil.sex] ?? 'des joueurs'}
            />
          )}
          {resultat.classements.age && profil && (
            <Drapeau
              genre="age"
              rang={resultat.classements.age}
              legende={legendeAge(profil.age)}
            />
          )}
        </ul>
      )}

      {resultat.axes.length >= 3 && (
        <section className="stats-subscores">
          <h3>Profil</h3>
          <hr />
          <Radar axes={resultat.axes} />
        </section>
      )}

      {/* Moins de trois axes ne fait pas un radar : deux points ne forment pas
          un polygone, et un seul encore moins. Des barres disent la même chose
          sans prétendre à une forme. */}
      {resultat.axes.length > 0 && resultat.axes.length < 3 && (
        <section className="stats-subscores">
          <h3>Profil</h3>
          <hr />
          <ul className="subscore-bars">
            {resultat.axes.map((axe) => (
              <li key={axe.tagId}>
                <span className="subscore-label">{axe.label}</span>
                <span className="subscore-track">
                  <span
                    className="subscore-fill"
                    style={{ width: `${axe.valeur}%`, backgroundColor: axe.color ?? 'var(--red)' }}
                  />
                </span>
                <span className="subscore-value">{axe.valeur} %</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {resultat.highlights.length > 0 && (
        <section className="stats-rare-section">
          <h3>Highlights</h3>
          <hr />
          <p className="subtitle">Les réponses qui te distinguent le plus de la masse</p>
          <ul className="stats-rare">
            {resultat.highlights.map((item, i) => (
              <li key={i}>
                <div className="question-answer">
                  <p className="question">{item.question}</p>
                  <p className="answer">
                    <em>&laquo;&nbsp;{item.reponse}&nbsp;&raquo;</em>
                  </p>
                  <p className="humor-message">{item.pique}</p>
                </div>
                <p className="rarity-pct">
                  <strong>{item.part} %</strong>
                </p>
              </li>
            ))}
          </ul>
          <p className="sample-size">
            Basé sur {resultat.participants.toLocaleString('fr-FR')} partie
            {resultat.participants > 1 ? 's' : ''}
          </p>
        </section>
      )}

      <button type="button" className="share-btn" onClick={onRecommencer}>
        {/* eslint-disable-next-line @next/next/no-img-element -- markup de
            référence ; `flac.css` dimensionne l'icône via .share-icon. */}
        <img className="share-icon" src="/rft/img/symbol-share.svg" alt="" />
        <p>Refaire le test</p>
      </button>
    </>
  );
}

function Drapeau({
  genre, rang, legende,
}: { genre: 'gender' | 'age'; rang: Classement; legende: string }) {
  const teinte = couleur(rang.top);

  return (
    <li className={`flag-${genre}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- markup de
          référence ; `flac.css` dimensionne l'image via .img-flag. */}
      <img className="img-flag" src={`/rft/img/flag-${genre}-${teinte}.svg`} alt="" />
      <p>
        <strong>Top {rang.top} %</strong>
      </p>
      <p>{legende}</p>
      {rang.avertissement && <p className="low-sample-warning">({rang.avertissement})</p>}
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
 * `viewBox`. « Communication » se retrouverait coupé à droite sans cette marge.
 */
const CADRE = '-58 -12 376 290';

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
              key={axe.tagId}
              x1={CENTRE} y1={CENTRE} x2={x} y2={y}
              stroke="var(--blueish-grey)" strokeWidth="1"
            />
          );
        })}

        <polygon points={contour} fill="none" stroke="var(--grey)" strokeWidth="1" />
        <polygon
          points={forme}
          fill="var(--red)" fillOpacity="0.45"
          stroke="var(--light-red)" strokeWidth="2"
        />

        {axes.map((axe, i) => {
          const [x, y] = point(i, total, 1.22);
          return (
            <text
              key={axe.tagId}
              x={x} y={y}
              fill={axe.color ?? 'var(--white)'}
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
