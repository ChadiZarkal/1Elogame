/**
 * @module redflagtest/modeTest
 * Le mode test : jouer sans être compté.
 *
 * Pour l'administrateur qui veut refaire le test autant de fois qu'il le faut
 * sans fausser les statistiques. Il s'active par un geste caché — cinq taps
 * rapides sur « Avant de commencer », ou sur « Question X sur Y » pendant la
 * partie — et reste actif sur cet appareil jusqu'à ce qu'on refasse le geste
 * ou qu'on touche le badge.
 *
 * Deux endroits et pas un : une fois le profil connu, le site saute l'écran
 * « Avant de commencer » et ouvre directement la première question. Le
 * compteur de questions, lui, est toujours là.
 *
 * Il vit dans le `localStorage` : un réglage de cet appareil, qui survit au
 * rechargement. Inaccessible (navigation privée, stockage bloqué), il reste
 * simplement éteint — jamais allumé par erreur.
 */

import { useCallback, useRef, useSyncExternalStore } from 'react';

const CLE = 'rft-mode-test';
const EVENEMENT = 'rft-mode-test';

export function modeTestActif(): boolean {
  try {
    return window.localStorage.getItem(CLE) === '1';
  } catch {
    return false;
  }
}

export function basculerModeTest(): boolean {
  const actif = !modeTestActif();
  try {
    if (actif) window.localStorage.setItem(CLE, '1');
    else window.localStorage.removeItem(CLE);
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(EVENEMENT));
  return actif;
}

function abonner(rappel: () => void): () => void {
  window.addEventListener(EVENEMENT, rappel);
  // Un autre onglet qui bascule le mode : celui-ci suit.
  window.addEventListener('storage', rappel);
  return () => {
    window.removeEventListener(EVENEMENT, rappel);
    window.removeEventListener('storage', rappel);
  };
}

/** L'état du mode test, rendu à jour à chaque bascule. Éteint au rendu serveur. */
export function useModeTest(): boolean {
  return useSyncExternalStore(abonner, modeTestActif, () => false);
}

/** Le nombre de taps, et le délai dans lequel ils doivent tomber. */
export const TAPS_REQUIS = 5;
export const FENETRE_TAPS_MS = 2500;

/**
 * Le geste caché : un gestionnaire de clic à poser sur un élément qu'on n'a
 * aucune raison de taper cinq fois. Rien ne le signale à l'écran.
 */
export function useGesteModeTest(): () => void {
  const taps = useRef<number[]>([]);
  return useCallback(() => {
    const maintenant = Date.now();
    taps.current = [...taps.current, maintenant].filter((t) => maintenant - t < FENETRE_TAPS_MS);
    if (taps.current.length >= TAPS_REQUIS) {
      taps.current = [];
      basculerModeTest();
    }
  }, []);
}
