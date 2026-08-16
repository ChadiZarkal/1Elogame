/**
 * @module config/contact
 * Coordonnées publiques du site — source unique.
 *
 * L'adresse figurait en dur dans six fichiers, dont les quatre pages légales.
 * Un contact qui diverge d'une page à l'autre est un défaut visible pour un
 * examinateur autant que pour un visiteur.
 *
 * L'URL Instagram est volontairement dépourvue du paramètre `igsh` des liens
 * de partage : c'est un jeton de suivi, il n'a rien à faire dans un lien
 * public et rend l'adresse illisible.
 */

/** Adresse de contact directe, mise en avant partout. */
export const CONTACT_EMAIL = 'chadizarkal25@gmail.com';

/**
 * Adresse historique du domaine. Conservée dans les mentions légales tant
 * qu'elle est relevée ; à retirer si la boîte n'existe pas, un contact
 * injoignable étant pire que pas de second contact.
 */
export const CONTACT_EMAIL_DOMAIN = 'contact@redorgreen.fr';

export const INSTAGRAM_HANDLE = 'redorgreen.fr';
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;
