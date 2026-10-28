'use client';

import { useEffect, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import { isAdFreePath } from '@/config/ads';

/**
 * Insère un script de régie, et le retire au démontage.
 *
 * Pourquoi l'insertion est impérative et non un `<Script>` de Next : ce dernier
 * dédoublonne par identifiant et ne rejoue donc *pas* le script lors d'une
 * navigation côté client. Or le conteneur de l'encart natif, lui, est détruit
 * et recréé à chaque changement de route — le script doit repasser derrière,
 * sinon l'emplacement reste vide sur toutes les pages sauf la première.
 *
 * Le crochet porte les deux conditions d'autorisation, pour qu'aucun appelant
 * ne puisse en oublier une : l'emplacement doit être activé, et la route ne
 * doit pas être exclue.
 *
 * @param target Élément qui reçoit le script. À défaut, `document.body`.
 * @param toutesRoutes Ignorer la liste des routes exclues. Réservé au
 *   pop-under armé en cours de partie (voir `usePopunderApres`) : il n'occupe
 *   aucune place à l'écran, et `/jeu/jouer` est exclu pour ses encarts.
 */
export function useAdsterraScript(
  src: string,
  enabled: boolean,
  target?: RefObject<HTMLElement | null>,
  toutesRoutes = false,
) {
  const pathname = usePathname() ?? '';
  const allowed = enabled && (toutesRoutes || !isAdFreePath(pathname));

  useEffect(() => {
    if (!allowed) return;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    /* Fourni tel quel par la régie : Rocket Loader de Cloudflare réécrit les
       scripts qu'il croise, ce qui casse celui-ci. */
    script.setAttribute('data-cfasync', 'false');

    const host = target?.current ?? document.body;
    host.appendChild(script);

    return () => {
      script.remove();
    };
    /* `target` est un objet de référence : son identité est stable d'un rendu à
       l'autre, le placer ici ne relance rien. */
  }, [src, allowed, target]);
}
