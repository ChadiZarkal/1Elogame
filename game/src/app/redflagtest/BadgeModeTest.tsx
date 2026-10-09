'use client';

/**
 * @module redflagtest/BadgeModeTest
 * Le seul signe visible du mode test : un badge discret, en haut au centre.
 *
 * Il dit que la partie ne sera pas comptée — sans lui, l'administrateur
 * n'aurait aucun moyen de savoir si le geste caché a pris — et le toucher
 * éteint le mode. Il est monté sous <body>, comme les stories, pour rester
 * au-dessus d'elles : c'est sur l'écran de résultat qu'on se demande si la
 * partie a compté.
 */

import { createPortal } from 'react-dom';
import { basculerModeTest, useModeTest } from './modeTest';

export function BadgeModeTest() {
  const actif = useModeTest();
  if (!actif) return null;

  return createPortal(
    <button
      type="button"
      className="rft-badge-test"
      onClick={() => basculerModeTest()}
      aria-label="Mode test actif : partie non comptée. Toucher pour le désactiver."
    >
      Non compté <span aria-hidden="true">✕</span>
    </button>,
    document.body,
  );
}
