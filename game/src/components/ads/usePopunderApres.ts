'use client';

import { useEffect } from 'react';
import { JEUX_POPUNDER } from '@/config/ads';
import { useAdsterraScript } from './useAdsterraScript';
import { armerPopunder, desarmerPopunder } from './gardePopunder';

/**
 * Arme le pop-under une fois `tours` arrivé à `seuil` : le script est inséré à
 * ce moment-là, et la régie ouvre sa page au tap suivant — une seule fois (voir
 * `gardePopunder`). Avant le seuil, rien n'est chargé.
 *
 * Le compteur appartient au jeu (verdicts de la visite, duels de la partie,
 * profils jugés). S'il retombe sous le seuil — nouvelle partie —, le
 * pop-under se réarmera au même nombre de tours.
 *
 * À appeler depuis le composant qui vit toute la partie, pas depuis un écran
 * de résultat : démonté à chaque tour, il retirerait le script aussitôt posé.
 */
export function usePopunderApres(tours: number, seuil: number) {
  const atteint = JEUX_POPUNDER.enabled && tours >= seuil;

  // Avant le script : la garde doit envelopper ses écouteurs dès leur pose.
  useEffect(() => {
    if (atteint) armerPopunder();
    else desarmerPopunder();
  }, [atteint]);

  useAdsterraScript(JEUX_POPUNDER.src, atteint, undefined, true);
}
