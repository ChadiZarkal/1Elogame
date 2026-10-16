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

/**
 * Adresse de contact, unique et relevée.
 *
 * Elle remplace `contact@redorgreen.fr`, qui figurait en dur dans six fichiers
 * sans qu'on sache si la boîte existait. Un contact injoignable dans des
 * mentions légales est pire que pas de second contact : mieux vaut une seule
 * adresse dont on est sûr.
 */
export const CONTACT_EMAIL = 'chadizarkal25@gmail.com';

export const INSTAGRAM_HANDLE = 'redorgreen.fr';
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;

/** La page Ko-fi du site. */
export const KOFI_URL = 'https://ko-fi.com/redorgreen';

/**
 * Page de don vers laquelle mènent tous les boutons « Offrir un café ».
 *
 * La page Ko-fi par défaut. La variable `NEXT_PUBLIC_DON_URL`, réglée sur
 * Vercel, la remplace — changer de plateforme ne demande alors aucune
 * modification du code. Une valeur qui n'est pas une adresse https est
 * ignorée : mieux vaut la page connue qu'un bouton qui mène nulle part.
 */
export const DON_URL: string = (() => {
  const brute = process.env.NEXT_PUBLIC_DON_URL?.trim();
  if (!brute) return KOFI_URL;
  try {
    return new URL(brute).protocol === 'https:' ? brute : KOFI_URL;
  } catch {
    return KOFI_URL;
  }
})();
