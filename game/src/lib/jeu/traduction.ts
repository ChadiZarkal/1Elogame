/**
 * @module lib/jeu/traduction
 * « Le pire des deux » en anglais : les comportements du jeu, tels que le
 * serveur les renvoie (duel, classement, Observatoire).
 *
 * MÊME PRINCIPE QUE LE RED FLAG TEST (`lib/rft/traduction`)
 *   Un dictionnaire indexé par le texte français (`elementsEn`), appliqué à la
 *   sortie des routes quand la langue demandée est l'anglais. Rien ne change en
 *   base : les votes, les scores et les identifiants sont communs aux deux
 *   langues. Une proposition ajoutée ou réécrite dans l'admin s'affiche en
 *   français tant qu'elle n'est pas dans le dictionnaire ; le test de
 *   couverture (`__tests__/traduction.test.ts`) le signale.
 *
 *   Les apostrophes droites et typographiques, les espaces insécables, sont
 *   confondus dans la clé.
 */

import type { Langue } from '@/lib/i18n/langue';
import { ELEMENTS_EN } from './elementsEn';

/** Apostrophes, espaces insécables : la base et la maquette n'écrivent pas pareil. */
function cle(texte: string): string {
  return texte.replace(/[’‘]/g, "'").replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
}

const TABLE = new Map(Object.entries(ELEMENTS_EN).map(([fr, en]) => [cle(fr), en]));

/** Le comportement dans la langue voulue ; le français tel quel s'il n'a pas de traduction. */
export function traduireElement(texte: string, langue: Langue): string {
  if (langue === 'fr') return texte;
  return TABLE.get(cle(texte)) ?? texte;
}

/** Les textes qui n'ont pas de traduction : pour le test, et pour l'admin plus tard. */
export function nonTraduits(textes: string[]): string[] {
  return textes.filter((t) => !TABLE.has(cle(t)));
}

/** Traduit le champ `texte` d'une liste (duel, lignes du classement, Observatoire). */
export function traduireTextes<T extends { texte: string }>(lignes: T[], langue: Langue): T[] {
  if (langue === 'fr') return lignes;
  return lignes.map((l) => ({ ...l, texte: traduireElement(l.texte, langue) }));
}

/** Pour la recherche anglaise du classement : casse et accents ignorés. */
export function normaliserRecherche(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .trim();
}
