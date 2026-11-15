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
 *
 *   Depuis le 2026-11-15, ce que l'admin saisit dans sa zone « Traduction »
 *   (table `traductions`, `lib/i18n/traductionsBase`) passe avant le
 *   dictionnaire. La route appelle `chargerTraductions('jeu')` avant de traduire.
 */

import type { Langue } from '@/lib/i18n/langue';
import { ELEMENTS_EN } from './elementsEn';
import { traductionSaisie } from '@/lib/i18n/traductionsBase';

/** Apostrophes, espaces insécables : la base et la maquette n'écrivent pas pareil. */
function cle(texte: string): string {
  return texte.replace(/[’‘]/g, "'").replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
}

const TABLE = new Map(Object.entries(ELEMENTS_EN).map(([fr, en]) => [cle(fr), en]));

/** Le comportement dans la langue voulue ; le français tel quel s'il n'a pas de traduction. */
export function traduireElement(texte: string, langue: Langue): string {
  if (langue === 'fr') return texte;
  return traductionSaisie('jeu', texte) ?? TABLE.get(cle(texte)) ?? texte;
}

/** La traduction écrite dans le code, pour que l'admin la montre. */
export function traductionDuCode(texte: string): string | undefined {
  return TABLE.get(cle(texte));
}

/** Les textes absents du dictionnaire du code : pour le test de couverture. */
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
