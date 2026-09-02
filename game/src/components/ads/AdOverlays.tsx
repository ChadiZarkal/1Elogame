'use client';

import { POPUNDER, SOCIAL_BAR } from '@/config/ads';
import { useAdsterraScript } from './useAdsterraScript';

/**
 * @module components/ads/AdOverlays
 * Les deux formats qui se posent *par-dessus* la page : barre sociale et
 * pop-under. Tous deux éteints par défaut — la raison de chacun est écrite dans
 * `config/ads.ts`, à côté de son interrupteur.
 *
 * Ils sont montés ici, en fin de `body`, comme la régie le demande. Le composant
 * ne rend aucun élément : ces formats se dessinent eux-mêmes.
 *
 * Ne rien rendre du tout tant qu'ils sont éteints ne suffirait pas à s'en
 * passer : c'est `useAdsterraScript` qui refuse l'insertion, et il vérifie en
 * plus le consentement et la route. Un interrupteur passé à `true` par erreur
 * ne peut donc pas court-circuiter l'accord de l'utilisateur.
 */
export function AdOverlays() {
  useAdsterraScript(SOCIAL_BAR.src, SOCIAL_BAR.enabled);
  useAdsterraScript(POPUNDER.src, POPUNDER.enabled);
  return null;
}
