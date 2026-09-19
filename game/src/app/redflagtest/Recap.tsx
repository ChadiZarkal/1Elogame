'use client';

/**
 * @module redflagtest/Recap
 * Le récap, sur le markup de référence (celui que produisait
 * `ajax-get-stats.php`) :
 *
 *   section.carte              → la nôtre : le bloc que le joueur capture
 *   section.stats-subscores    → div.spider-chart-container
 *   section.stats-rare-section → ul.stats-rare avec p.rarity-pct
 *
 * CE QUI A ÉTÉ RAMASSÉ DANS LA CARTE
 *   Le verdict, l'archétype, le score, l'écart à la moyenne, le point noir et
 *   les deux classements vivaient dans six blocs séparés, étalés sur deux
 *   écrans. La carte les réunit dans un cadre de trois cents pixels, posé assez
 *   haut pour qu'une capture d'écran de téléphone l'attrape en entier.
 *
 *   Les classements y sont passés du drapeau à la ligne de texte : deux images
 *   de 3,5 rem pour annoncer « Top 77 % » coûtaient cent pixels de hauteur et
 *   n'ajoutaient rien que le texte ne disait déjà.
 *
 * CE QUI EST DIT QUAND ON NE SAIT PAS
 *   Une cohorte trop mince porte son avertissement au lieu de se taire. Un rang
 *   sur quatre joueurs reste un rang ; le présenter comme un rang sur mille
 *   serait le mensonge que cet écran ne peut pas se permettre.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ComparaisonPublique, Resultat } from '@/lib/rft/types';
import type { PlayerProfile } from '@/types/game';
import { PartageBar } from './PartageBar';

const SEXES: Record<string, string> = {
  homme: 'des hommes',
  femme: 'des femmes',
  autre: 'des joueurs',
};

function legendeAge(age: string): string {
  return age === '27+' ? 'des 27 ans et plus' : `des ${age} ans`;
}

/**
 * La population citée dans la comparaison, en toutes lettres.
 *
 * Le serveur choisit la cohorte — la plus précise qui soit assez fournie — et
 * l'écran la met en mots, parce que c'est lui qui a le profil du joueur sous la
 * main.
 */
function legendeCohorte(cohorte: ComparaisonPublique['cohorte'], profil: PlayerProfile | null): string {
  const sexe = profil ? (SEXES[profil.sex] ?? 'des joueurs') : 'des joueurs';
  switch (cohorte) {
    case 'sexe_age':
      return profil ? `${sexe} de ${legendeAge(profil.age).replace(/^des /, '')}` : sexe;
    case 'sexe':
      return sexe;
    case 'age':
      return profil ? legendeAge(profil.age) : 'des joueurs';
    default:
      return 'des joueurs';
  }
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
  /** Absent sur un résultat partagé : on ne « refait » pas la partie d'un autre. */
  onRecommencer?: () => void;
}) {
  const affiche = useCompteur(resultat.score);

  return (
    <>
      {/*
        LA CARTE — le bloc que le joueur capture.

        Tout ce qui se raconte tient dedans : le nom du profil, le score, l'ecart
        a la moyenne, le point noir, et la marque. Elle est bornee, dense et
        posee en haut pour qu'une capture d'ecran de telephone l'attrape en
        entier, sans reglage et sans rognage.

        Avant, ces memes informations s'etalaient sur deux ecrans, chacune dans
        son bloc, avec deux titres de trois centimetres qui se suivaient — le
        verdict puis l'archetype. Une capture n'attrapait qu'un morceau, et le
        morceau ne voulait rien dire.
      */}
      <section className="carte" aria-label="Ton resultat">
        {resultat.verdict && (
          <p className="carte-verdict">{resultat.verdict.titre}</p>
        )}

        {/* Le nom du profil est le titre de la carte : c'est la ligne qu'on
            repete, et un pourcentage ne decrit personne. */}
        {resultat.archetype ? (
          <div className="carte-nom">
            <h3>
              <span className="carte-emoji">{resultat.archetype.emoji}</span>
              {resultat.archetype.titre}
            </h3>
            {resultat.archetype.soustitre && <p>{resultat.archetype.soustitre}</p>}
          </div>
        ) : (
          resultat.verdict?.soustitre && (
            <div className="carte-nom">
              <p>{resultat.verdict.soustitre}</p>
            </div>
          )
        )}

        <p className="carte-score">
          <strong>{affiche}</strong>
          <span>% red flag</span>
        </p>

        <div className="carte-lignes">
          {resultat.comparaison && (
            <p>
              {resultat.comparaison.ecart === 0 ? (
                <>Pile dans la moyenne {legendeCohorte(resultat.comparaison.cohorte, profil)}</>
              ) : (
                <>
                  <strong
                    style={{
                      color: resultat.comparaison.ecart > 0
                        ? 'var(--light-red)'
                        : 'var(--light-green)',
                    }}
                  >
                    {resultat.comparaison.ecart > 0 ? '+' : '\u2212'}
                    {Math.abs(resultat.comparaison.ecart)} pts
                  </strong>{' '}
                  {resultat.comparaison.ecart > 0 ? 'au-dessus' : 'en dessous'} de la moyenne{' '}
                  {legendeCohorte(resultat.comparaison.cohorte, profil)}
                </>
              )}
            </p>
          )}

          {resultat.pointNoir && (
            <p>
              Point noir{' '}
              <strong style={{ color: resultat.pointNoir.color ?? 'var(--red)' }}>
                {resultat.pointNoir.label}
              </strong>{' '}
              <span className="carte-valeur">{resultat.pointNoir.valeur} %</span>
            </p>
          )}

          {(resultat.classements.sexe || resultat.classements.age) && profil && (
            <p>
              {resultat.classements.sexe && (
                <>
                  Top <strong>{resultat.classements.sexe.top} %</strong>{' '}
                  {SEXES[profil.sex] ?? 'des joueurs'}
                </>
              )}
              {resultat.classements.sexe && resultat.classements.age && (
                <span className="carte-sep"> · </span>
              )}
              {resultat.classements.age && (
                <>
                  Top <strong>{resultat.classements.age.top} %</strong>{' '}
                  {legendeAge(profil.age)}
                </>
              )}
            </p>
          )}
        </div>

        {/* Sans elle, une capture d'ecran est un rectangle anonyme : personne ne
            sait d'ou elle vient ni ou aller la refaire. */}
        <p className="carte-signature">redorgreen.fr/redflagtest</p>
      </section>

      {/* Sous la carte : tout ce qui se lit mais ne se capture pas. */}
      <p className="detail-titre">Le détail</p>

      {/* Une seule réponse qui porte le cinquième du score : c'est la phrase la
          plus brutale que ces données permettent, et elle est vraie. */}
      {resultat.reponseDecisive && (
        <p className="stats-decisive">
          Une seule réponse t’a coûté{' '}
          <strong>{resultat.reponseDecisive.points} de tes {resultat.score} points</strong>
          <span className="stats-decisive-quote">
            « {resultat.reponseDecisive.reponse} »
          </span>
          <span className="stats-decisive-question">{resultat.reponseDecisive.question}</span>
        </p>
      )}

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

      {/* Au-delà du seuil d'une catégorie, le test cesse de faire de l'humour.
          Placé avant le partage : ce n'est pas un bas de page. */}
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

      {resultat.codePartage && (
        <PartageBar
          code={resultat.codePartage}
          score={resultat.score}
          archetype={resultat.archetype?.titre ?? null}
        />
      )}

      {onRecommencer ? (
        <button type="button" className="partage-copier" onClick={onRecommencer}>
          Refaire le test
        </button>
      ) : (
        <Link href="/redflagtest" className="share-btn">
          <p>Faire le test</p>
        </Link>
      )}

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
