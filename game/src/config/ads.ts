/**
 * @module config/ads
 * Déclaration des emplacements publicitaires Adsterra.
 *
 * Un seul endroit porte les URL et les interrupteurs : ces scripts sont des
 * tiers qui exécutent du code arbitraire sur toutes nos pages. Les voir tous
 * les trois côte à côte, avec la raison de leur état, est la seule façon de
 * garder la décision relisible — dispersés dans les composants, on ne saurait
 * plus au bout d'un mois lequel est actif ni pourquoi.
 *
 * Deux des trois régies sont livrées éteintes. Ce n'est pas un oubli :
 *
 * - `popunder` ouvre une fenêtre derrière la page au premier clic. Ici *tout*
 *   est un clic — voter, swiper, choisir une réponse : le premier geste de jeu
 *   déclencherait une fenêtre. En application installée (PWA autonome) elle
 *   sort carrément de l'application. Le règlement AdSense interdit par ailleurs
 *   les annonces Google sur une page portant un pop-under, et le code AdSense
 *   est déjà intégré : l'allumer mettrait en risque l'autre régie.
 *
 * - `socialBar` est une barre flottante posée par-dessus le contenu, en bas de
 *   l'écran le plus souvent. C'est exactement la bande où vivent les boutons
 *   d'appel à action des trois jeux, qu'on vient de faire remonter au-dessus de
 *   la ligne de flottaison. Elle les recouvrirait.
 *
 * Passer l'un des deux à `true` suffit à l'activer : le composant, le
 * consentement et l'exclusion des routes sont déjà en place.
 *
 * Une réserve à connaître avant de le faire. L'accord est demandé *à
 * l'emplacement de l'encart natif* — c'est ce qui évite un bandeau posé sur les
 * boutons de jeu. Un format en recouvrement activé ne se chargerait donc que
 * chez les visiteurs ayant déjà croisé cet emplacement et accepté. Pour le
 * servir à tout le monde, il faudrait une demande à l'échelle du site, et
 * retrouver la question de l'endroit où la poser sans gêner.
 */

export interface AdUnit {
  /** Interrupteur unique. Voir l'en-tête du module pour les deux `false`. */
  enabled: boolean;
  src: string;
}

export interface NativeAdUnit extends AdUnit {
  /** `invoke.js` cherche cet identifiant dans le DOM pour s'y injecter. */
  containerId: string;
}

/** Bandeau natif : s'insère dans le flux, à la place d'un bloc de contenu. */
export const NATIVE_BANNER: NativeAdUnit = {
  enabled: true,
  src: 'https://pl31149603.profitableratecpmnetwork.com/8413c6c99c5cae8d29d9ac7c0cf1d2d6/invoke.js',
  containerId: 'container-8413c6c99c5cae8d29d9ac7c0cf1d2d6',
};

export const SOCIAL_BAR: AdUnit = {
  enabled: false,
  src: 'https://pl31008336.profitableratecpmnetwork.com/68/18/5e/68185e1c4ae03b3726a06b8ab25952ad.js',
};

export const POPUNDER: AdUnit = {
  enabled: false,
  src: 'https://pl31008335.profitableratecpmnetwork.com/74/f6/92/74f692d04f08eba7fcdc90ba9634f984.js',
};

/**
 * Routes sans aucune publicité, ni bandeau de consentement.
 *
 * La liste reprend celle d'AdSense et l'étend : le règlement « valeur de
 * l'inventaire » vise les écrans sans contenu de l'éditeur, et un écran de jeu
 * en cours n'a pas de place pour un encart. `/hors-ligne` est servi sans réseau
 * — un script tiers n'y chargerait jamais.
 */
export const AD_FREE_PATHS: RegExp[] = [
  /^\/admin(\/|$)/,
  /^\/dixmais\/admin(\/|$)/,
  /^\/jeu\/jouer(\/|$)/,
  /^\/jeu\/recap(\/|$)/,
  /^\/flashflag\/session(\/|$)/,
  /^\/hors-ligne(\/|$)/,
];

export function isAdFreePath(pathname: string): boolean {
  return AD_FREE_PATHS.some((re) => re.test(pathname));
}
