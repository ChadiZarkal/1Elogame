'use client';

/**
 * @module redflagtest/Recap
 * Le récap : les stories, puis le détail.
 *
 *   Stories                    → une information par écran, à taper (voir
 *                                `Stories`)
 *   section.stats-subscores    → div.spider-chart-container
 *   section.stats-rare-section → ul.stats-rare avec p.rarity-pct
 *
 * Les stories disent l'essentiel, chacune en un écran qui se capture. Le
 * détail, dessous, garde ce qui se lit sans se raconter : le radar complet et
 * toutes les réponses qui distinguent le joueur. On y arrive en faisant
 * défiler la page, ou par le lien du dernier écran.
 */

import Link from 'next/link';
import type { Resultat } from '@/lib/rft/types';
import { Stories } from './Stories';

/** L'ancre du détail, visée par le dernier écran des stories. */
const ID_DETAIL = 'rft-detail';

/*
 * LE RÉCAP N'A PAS BESOIN DU PROFIL DU JOUEUR.
 *
 * Les légendes des classements sont écrites par le serveur, qui relit le
 * profil avec la partie : la page d'un résultat partagé, qui ne connaît ni le
 * sexe ni l'âge de celui qui a joué, affiche ainsi exactement la même chose.
 */
export function Recap({
  resultat, onRecommencer,
}: {
  resultat: Resultat;
  /** Absent sur un résultat partagé : on ne « refait » pas la partie d'un autre. */
  onRecommencer?: () => void;
}) {
  return (
    <>
      <Stories resultat={resultat} onRecommencer={onRecommencer} idDetail={ID_DETAIL} />

      {/* Sous les stories : tout ce qui se lit mais ne se raconte pas. */}
      <p className="detail-titre" id={ID_DETAIL}>Le détail</p>

      {resultat.axes.length >= 3 && (
        <section className="stats-subscores">
          <Radar axes={resultat.axes} />
        </section>
      )}

      {/* Moins de trois axes ne fait pas un radar : deux points ne forment pas
          un polygone, et un seul encore moins. Des barres disent la même chose
          sans prétendre à une forme. */}
      {resultat.axes.length > 0 && resultat.axes.length < 3 && (
        <section className="stats-subscores">
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

      {/* Les ressources ont leur écran dans les stories. Elles sont redites ici
          parce que celui qui fait défiler la page sans taper ne doit pas pouvoir
          les manquer. */}
      {resultat.ressources.map((r) => (
        <aside key={r.label} className="stats-ressource">
          <p className="stats-ressource-cat">{r.label}</p>
          <p>{r.texte}</p>
          {r.lien && (
            <Link href={r.lien} className="stats-ressource-lien">
              Voir la ressource →
            </Link>
          )}
        </aside>
      ))}

      <Link href="/redflagtest/stats" className="stats-public-link">
        Voir ce que les autres ont répondu
      </Link>
    </>
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
