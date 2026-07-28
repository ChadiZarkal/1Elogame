/**
 * @module contentRating
 * Restriction du contenu réservé aux majeurs.
 *
 * Le jeu propose une tranche d'âge 16-18 ans, et la catégorie « Amour & Sexe »
 * contient des propositions explicites. Les servir à des mineurs relève des
 * règles Google sur les sujets réservés aux adultes, distinctes du contenu à
 * faible valeur — et pose un problème en soi.
 */

/** Catégories d'éléments à ne pas servir aux mineurs. */
export const ADULT_ONLY_CATEGORIES: readonly string[] = ['sexe'];

/** La seule tranche déclarable pouvant contenir des mineurs. */
export function isMinorBracket(age: string | null | undefined): boolean {
  return age === '16-18';
}

export function isAdultOnlyCategory(category: string | null | undefined): boolean {
  return !!category && ADULT_ONLY_CATEGORIES.includes(category);
}

/** Retire les éléments réservés aux majeurs d'une liste. */
export function filterAdultContent<T extends { categorie: string }>(
  items: T[],
  restrict: boolean,
): T[] {
  if (!restrict) return items;
  return items.filter((item) => !isAdultOnlyCategory(item.categorie));
}
