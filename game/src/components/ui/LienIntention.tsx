'use client';

/**
 * @module components/ui/LienIntention
 * Le lien du site : la page visée n'est préchargée qu'à l'intention du
 * visiteur, plus dès que le lien apparaît à l'écran.
 *
 * POURQUOI
 *   Par défaut, Next précharge chaque page dont un lien entre dans l'écran —
 *   menu, cartes de l'accueil, pied de page —, et plusieurs requêtes par page.
 *   Mesuré le 2026-11-06 sur redorgreen.fr : une visite de l'accueil faisait 77
 *   requêtes à Vercel, dont 41 préchargements de pages que le visiteur
 *   n'ouvrirait pour la plupart jamais ; 35 à 53 % des requêtes selon la page.
 *   Vercel facture chaque requête (forfait CDN, événements Observability).
 *
 * L'INTENTION, PAS LA VISIBILITÉ
 *   Le préchargement part quand le doigt touche le lien (`touchstart`, avant
 *   même que le clic soit reconnu), quand la souris le survole, ou quand il
 *   prend le focus au clavier. C'est le schéma que documente Next
 *   (« Hover-triggered prefetch ») : `prefetch={false}` tant que rien ne
 *   l'annonce, puis le comportement par défaut. La page qu'on ouvre reste
 *   rapide ; celles qu'on ne visite pas ne coûtent plus rien.
 *
 * Un `prefetch` passé explicitement est respecté tel quel.
 */

import NextLink from 'next/link';
import { useState, type ComponentProps } from 'react';

type Props = ComponentProps<typeof NextLink>;

export default function LienIntention({ prefetch, onMouseEnter, onTouchStart, onFocus, ...rest }: Props) {
  const [intention, setIntention] = useState(false);

  return (
    <NextLink
      {...rest}
      prefetch={prefetch !== undefined ? prefetch : intention ? null : false}
      onMouseEnter={(e) => {
        setIntention(true);
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setIntention(true);
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setIntention(true);
        onFocus?.(e);
      }}
    />
  );
}
