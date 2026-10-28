'use client';

import { JEUX_POPUNDER } from '@/config/ads';
import { useAdsterraScript } from './useAdsterraScript';

/**
 * Arme le pop-under une fois `tours` arrivé à `seuil` : le script est inséré à
 * ce moment-là, et la régie ouvre sa page au clic suivant. Avant le seuil,
 * rien n'est chargé — les premiers tours restent sans pop-under.
 *
 * Le compteur appartient au jeu (verdicts de la visite, duels de la partie,
 * profils jugés). S'il retombe sous le seuil — nouvelle partie —, le script est
 * retiré et le pop-under se réarmera au même nombre de tours.
 *
 * À appeler depuis le composant qui vit toute la partie, pas depuis un écran
 * de résultat : démonté à chaque tour, il retirerait le script aussitôt posé.
 */
export function usePopunderApres(tours: number, seuil: number) {
  useAdsterraScript(JEUX_POPUNDER.src, JEUX_POPUNDER.enabled && tours >= seuil, undefined, true);
}
