/**
 * @module lib/i18n/langue
 * Les langues du site.
 *
 * Le français vit à la racine (`/redflagtest`), l'anglais sous `/en`
 * (`/en/redflagtest`). Les adresses françaises existantes ne bougent pas : elles
 * portent le référencement du site.
 *
 * Pas de bibliothèque ni de middleware de détection : une fonction qui
 * tournerait à chaque requête serait facturée à chaque requête (voir
 * `next.config.ts`, les coûts Vercel). La langue est celle de l'adresse.
 *
 * Traduction commencée le 2026-11-14 par le Red Flag Test ; les autres pages
 * restent en français, et un lien vers l'une d'elles depuis une page anglaise
 * mène à la version française.
 */

export type Langue = 'fr' | 'en';

export const LANGUE_PAR_DEFAUT: Langue = 'fr';

/** Les chemins qui existent en anglais, sous `/en`. */
const TRADUITS = [/^\/redflagtest(?:\/|$)/];

/**
 * L'adresse d'une page du site dans la langue voulue : préfixée par `/en`
 * quand la page existe en anglais, laissée telle quelle sinon.
 */
export function cheminLocalise(langue: Langue, chemin: string): string {
  if (langue === 'fr') return chemin;
  return TRADUITS.some((re) => re.test(chemin)) ? `/en${chemin}` : chemin;
}

/** `fr-FR` / `en-US`, pour `Intl` et les données structurées. */
export function localeDe(langue: Langue): string {
  return langue === 'en' ? 'en-US' : 'fr-FR';
}

/** Lit la langue d'un paramètre de requête (`?lang=en`) ; le français sinon. */
export function langueDe(valeur: string | null | undefined): Langue {
  return valeur === 'en' ? 'en' : 'fr';
}
