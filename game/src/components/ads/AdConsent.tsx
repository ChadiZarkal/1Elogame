'use client';

import Link from 'next/link';
import { setAdConsent } from '@/lib/adConsent';

/**
 * @module components/ads/AdConsent
 * Demande d'accord préalable à l'affichage de publicités.
 *
 * Ce bloc n'est pas un ornement : c'est lui qui rend les encarts diffusables.
 * Le dépôt de traceurs publicitaires réclame un accord donné *avant* le
 * chargement de la régie, et les CGU du site s'y engagent explicitement. Aucun
 * script tiers n'est inséré tant qu'il n'a pas reçu de réponse.
 *
 * Il est rendu *dans le flux*, à la place exacte qu'occuperait l'encart, et
 * c'est le point important. La première version se posait en bandeau fixe en
 * bas de fenêtre : mesuré sur un 375×812, il recouvrait de 15 px le bouton
 * d'action de l'Oracle et masquait complètement la mention sous lui — et sur un
 * écran plus court, le bouton entier passait dessous. C'est le même défaut que
 * celui reproché à la feuille d'installation. Posé ici, il ne peut recouvrir
 * quoi que ce soit : il vit sous le contenu éditorial, là où aucun bouton de jeu
 * ne se trouve, et il pousse le texte au lieu de passer devant.
 *
 * Poser la question à l'endroit concerné la rend aussi plus compréhensible
 * qu'un bandeau global : on demande l'autorisation d'afficher *cet* encart, à
 * l'endroit où il apparaîtrait.
 *
 * Refuser coûte exactement le même geste qu'accepter — deux boutons frères, de
 * même taille et de même lisibilité. Un refus relégué derrière un lien discret
 * ne vaudrait pas accord libre.
 */
export function AdConsent({ className = '' }: { className?: string }) {
  return (
    <aside
      className={`ad-consent ${className}`.trim()}
      aria-label="Choix publicitaire"
    >
      <p className="ad-consent__label" aria-hidden>
        Emplacement publicitaire
      </p>
      <p className="ad-consent__text">
        Le site est gratuit et financé par la publicité. Afficher un encart ici
        suppose de déposer des traceurs — on ne le fait pas sans ton accord.{' '}
        <Link href="/confidentialite" className="ad-consent__link">
          En savoir plus
        </Link>
      </p>
      <div className="ad-consent__actions">
        <button
          type="button"
          onClick={() => setAdConsent('denied')}
          className="ad-consent__button"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => setAdConsent('granted')}
          className="ad-consent__button ad-consent__button--accept"
        >
          Accepter
        </button>
      </div>
      <p className="ad-consent__foot">
        Refuser n&apos;enlève rien : tous les jeux restent accessibles.
      </p>
    </aside>
  );
}
