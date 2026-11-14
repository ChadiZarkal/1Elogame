/**
 * @module lib/dixmais/traduction
 * « C'est un 10 mais… » en anglais : les énoncés, tels que le serveur les
 * renvoie (tirage d'un profil, classement).
 *
 * MÊME PRINCIPE QUE « LE PIRE DES DEUX » (`lib/jeu/traduction`)
 *   Un dictionnaire indexé par le texte français (`enoncesEn`), appliqué à la
 *   sortie des routes quand la langue demandée est l'anglais. Rien ne change en
 *   base : les notes, les identifiants et les catégories sont communs aux deux
 *   langues. Un énoncé ajouté ou réécrit dans l'admin s'affiche en français
 *   tant qu'il n'est pas dans le dictionnaire ; le test de couverture
 *   (`__tests__/traduction.test.ts`) le signale.
 *
 *   Les apostrophes droites et typographiques, les espaces insécables, sont
 *   confondus dans la clé.
 */

import type { Langue } from '@/lib/i18n/langue';
import { ENONCES_EN } from './enoncesEn';

/** Apostrophes, espaces insécables : la base et l'admin n'écrivent pas toujours pareil. */
function cle(texte: string): string {
  return texte.replace(/[‘’]/g, "'").replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
}

const TABLE = new Map(Object.entries(ENONCES_EN).map(([fr, en]) => [cle(fr), en]));

/** L'énoncé dans la langue voulue ; le français tel quel s'il n'a pas de traduction. */
export function traduireEnonce(texte: string, langue: Langue): string {
  if (langue === 'fr') return texte;
  return TABLE.get(cle(texte)) ?? texte;
}

/** Les textes qui n'ont pas de traduction : pour le test, et pour l'admin plus tard. */
export function nonTraduits(textes: string[]): string[] {
  return textes.filter((t) => !TABLE.has(cle(t)));
}

/** Traduit le champ `text` d'une liste (profil tiré, lignes du classement). */
export function traduireEnonces<T extends { text: string }>(lignes: T[], langue: Langue): T[] {
  if (langue === 'fr') return lignes;
  return lignes.map((l) => ({ ...l, text: traduireEnonce(l.text, langue) }));
}
