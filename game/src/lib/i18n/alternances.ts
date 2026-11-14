/**
 * @module lib/i18n/alternances
 * Le lien entre une page et sa traduction, pour les moteurs de recherche.
 *
 * Chaque page qui existe dans les deux langues déclare son adresse de
 * référence (`canonical`) et ses deux versions (`hreflang`) : Google montre
 * alors la française aux francophones et l'anglaise aux autres, au lieu de
 * les traiter comme deux pages en concurrence. Les deux côtés doivent se citer
 * l'un l'autre, sans quoi Google ignore la déclaration. `x-default` (le
 * visiteur d'une autre langue) mène au français, la langue d'origine du site.
 *
 * Ouvert aux moteurs le 2026-11-14, à la demande de Chadi.
 */

import type { Metadata } from 'next';
import { cheminLocalise, estTraduit, type Langue } from './langue';

/** `alternates` d'une page, à partir de son adresse française (`/redflagtest`). */
export function alternances(langue: Langue, cheminFr: string): NonNullable<Metadata['alternates']> {
  const canonical = cheminLocalise(langue, cheminFr);
  if (!estTraduit(cheminFr)) return { canonical };
  return {
    canonical,
    languages: {
      fr: cheminFr,
      en: cheminLocalise('en', cheminFr),
      'x-default': cheminFr,
    },
  };
}
