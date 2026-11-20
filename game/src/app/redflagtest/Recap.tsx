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
 * Les stories disent l'essentiel, en plein écran, chacune en un écran qui se
 * capture. Elles s'ouvrent seules à la fin de la partie ; la croix les referme
 * sur le détail, qui garde ce qui se lit sans se raconter : le radar complet et
 * toutes les réponses qui distinguent le joueur. Un bouton les rouvre.
 */

import { useState } from 'react';
import Link from '@/components/ui/LienIntention';
import type { Resultat } from '@/lib/rft/types';
import { ParisDesAutres, Stories, teinte } from './Stories';
import { DON_URL } from '@/config/contact';
import { useTextesRft } from './textes';
import { useLangue } from '@/lib/i18n/LangueContexte';
import { cheminLocalise } from '@/lib/i18n/langue';

/*
 * LE RÉCAP N'A PAS BESOIN DU PROFIL DU JOUEUR.
 *
 * Les légendes des classements sont écrites par le serveur, qui relit le
 * profil avec la partie : la page d'un résultat partagé, qui ne connaît ni le
 * sexe ni l'âge de celui qui a joué, affiche ainsi exactement la même chose.
 */
export function Recap({
  resultat, onRecommencer, pari = null,
}: {
  resultat: Resultat;
  /** Absent sur un résultat partagé : on ne « refait » pas la partie d'un autre. */
  onRecommencer?: () => void;
  /** Le score parié avant la partie ; absent sur un résultat partagé ou si le joueur a passé. */
  pari?: number | null;
}) {
  const [ouvert, setOuvert] = useState(true);
  const t = useTextesRft();
  const langue = useLangue();

  const fermer = () => {
    setOuvert(false);
    // Le détail commence en haut de la page, pas là où le défilement s'était
    // arrêté avant l'ouverture.
    window.scrollTo(0, 0);
  };

  return (
    <>
      {ouvert && <Stories resultat={resultat} onRecommencer={onRecommencer} onFermer={fermer} pari={pari} />}

      <button type="button" className="stories-rouvrir" onClick={() => setOuvert(true)}>
        <span>▶</span> {t.revoirStories}
      </button>

      {/* Sous les stories : tout ce qui se lit mais ne se raconte pas. */}
      <p className="detail-titre">{t.detail}</p>

      {resultat.axes.length >= 3 && (
        <section className="stats-subscores">
          <Radar axes={resultat.axes} />
        </section>
      )}

      {/* Le radar donne la forme ; seul, il ne disait ni les chiffres ni ce
          qu'ils mesurent (« difficilement compréhensible », Chadi, 2026-11-21).
          La liste le dit en clair, thème par thème, du plus red flag au moins
          red flag. Sous trois axes, il n'y a pas de radar : elle suffit. */}
      {resultat.axes.length > 0 && <ListeCategories axes={resultat.axes} />}

      {resultat.highlights.length > 0 && (
        <section className="stats-rare-section">
          <h3>Highlights</h3>
          <hr />
          <p className="subtitle">{t.highlightsSousTitre}</p>
          <ul className="stats-rare">
            {resultat.highlights.map((item, i) => (
              <li key={i}>
                <div className="question-answer">
                  <p className="question">{item.question}</p>
                  <p className="answer">
                    <em>{t.cite(item.reponse)}</em>
                  </p>
                  <p className="humor-message">{item.pique}</p>
                </div>
                <p className="rarity-pct">
                  <strong>{t.pct(item.part)}</strong>
                </p>
              </li>
            ))}
          </ul>
          <p className="sample-size">
            {t.basePartiesAvant}{resultat.participants.toLocaleString(t.locale)}
            {t.partie(resultat.participants)}
          </p>
        </section>
      )}

      {/* Les paris moyens, ici aussi : celui qui a passé son pari, ou qui
          regarde le résultat d'un autre, n'a pas l'écran « Ton pari ». */}
      {resultat.paris && <ParisDesAutres paris={resultat.paris} className="detail-paris" />}

      {/* Les ressources ont leur écran dans les stories. Elles sont redites ici
          parce que celui qui fait défiler la page sans taper ne doit pas pouvoir
          les manquer. */}
      {resultat.ressources.map((r) => (
        <aside key={r.label} className="stats-ressource">
          <p className="stats-ressource-cat">{r.label}</p>
          <p>{r.texte}</p>
          {r.lien && (
            <Link href={r.lien} className="stats-ressource-lien">
              {t.voirRessource}
            </Link>
          )}
        </aside>
      ))}

      <Link href={cheminLocalise(langue, '/redflagtest/stats')} className="stats-public-link">
        {t.voirAutres}
      </Link>

      <a href={DON_URL} target="_blank" rel="noopener noreferrer" className="rft-cafe">
        {t.cafe}
      </a>
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
  const t = useTextesRft();
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
        aria-label={axes.map((a) => `${a.label} ${t.pct(a.valeur)}`).join(', ')}
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

/* ---------------------------------------------------------------------------
 * Les catégories en clair (2026-11-21)
 *
 * Pour chaque thème : son nom, ce qu'il couvre, un mot (« Red flag »,
 * « Limite »…), le pourcentage et sa barre. Le pourcentage est la part du pire
 * possible sur les questions du thème, et la légende le dit : sans elle,
 * « 55 % » ne voulait rien dire.
 * ------------------------------------------------------------------------- */

function ListeCategories({ axes }: { axes: Resultat['axes'] }) {
  const t = useTextesRft();
  const tries = [...axes].sort((a, b) => b.valeur - a.valeur);
  return (
    <section className="categories-detail" aria-labelledby="categories-detail-titre">
      <h3 id="categories-detail-titre">{t.titreCategories}</h3>
      <p className="categories-detail-intro">{t.categoriesTexte}</p>
      <ul>
        {tries.map((axe) => (
          <li key={axe.tagId}>
            <p className="categories-detail-tete">
              <span className="categories-detail-nom">{axe.label}</span>
              <strong style={{ color: teinte(axe.valeur) }}>
                <small>{t.niveauCategorie(axe.valeur)}</small> {t.pct(axe.valeur)}
              </strong>
            </p>
            <span className="categories-detail-piste" aria-hidden="true">
              <span style={{ width: `${axe.valeur}%`, backgroundColor: teinte(axe.valeur) }} />
            </span>
            {axe.description && <p className="categories-detail-desc">{axe.description}</p>}
          </li>
        ))}
      </ul>
      <p className="categories-detail-echelle">{t.echelleCategories}</p>
    </section>
  );
}
