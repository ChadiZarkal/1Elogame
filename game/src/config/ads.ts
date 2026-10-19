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
 * Passer l'un des deux à `true` suffit à l'activer : le composant et
 * l'exclusion des routes sont déjà en place.
 *
 * Le troisième, `NATIVE_BANNER`, est éteint à son tour tant que le site est
 * en examen AdSense. Il s'affichait sur l'accueil, le guide, l'Observatoire
 * et sous chaque note de présentation — presque toutes les pages que
 * l'examinateur lit —, sans demande d'accord préalable. Des encarts « natifs »
 * d'une régie tierce, dont nous ne choisissons pas le contenu, sur les pages
 * mêmes que l'on présente comme informatives : c'est l'expérience que décrit
 * le refus « contenu à faible valeur ». Le rallumer une fois AdSense accepté
 * est une décision commerciale, pas technique : l'interrupteur suffit.
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
  enabled: false,
  src: 'https://pl31149603.profitableratecpmnetwork.com/8413c6c99c5cae8d29d9ac7c0cf1d2d6/invoke.js',
  containerId: 'container-8413c6c99c5cae8d29d9ac7c0cf1d2d6',
};

/**
 * Encart natif carré (1:1) de l'accueil, juste après « Offrir un café ».
 * Demandé côté produit le 2026-10-19, en connaissance des réserves de
 * l'en-tête sur `NATIVE_BANNER` (examen AdSense) : c'est un emplacement à part,
 * allumé seul, qui ne rallume pas le bandeau des autres pages.
 *
 * Même conteneur que `NATIVE_BANNER` : la régie l'impose pour cet emplacement.
 * Les deux ne doivent donc jamais être allumés sur une même page — l'accueil
 * porte aussi `PageNotes`, qui rend `NATIVE_BANNER`.
 */
export const ACCUEIL_NATIVE: NativeAdUnit = {
  enabled: true,
  src: 'https://bauval.org/21/8413c6c99c5cae8d29d9ac7c0cf1d2d6',
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
 * La pause publicitaire du Red Flag Test, entre la dernière réponse et le
 * résultat (voir `redflagtest/Interstitiel`). Demandée et assumée côté
 * produit le 2026-10-13, en connaissance des réserves ci-dessus.
 *
 * - L'encart reprend l'emplacement natif : c'est le seul format qui s'affiche
 *   *dans* l'écran, et c'est ce qui permet « la pub, puis le résultat ».
 * - Le pop-under s'arme sur cet écran et s'ouvre au clic sur « Voir mon
 *   résultat ». Il n'est chargé que si AdSense est absent de la page : le
 *   règlement AdSense interdit les annonces Google à côté d'un pop-under, et
 *   AdSense n'est plus chargé sur `/redflagtest` (voir `AdSenseScript`). Un
 *   joueur arrivé d'une autre page du site, où AdSense s'est déjà chargé, n'a
 *   donc pas de pop-under — c'est voulu.
 *
 * Éteindre l'un ou l'autre : passer son `enabled` à `false`.
 */
export const RFT_INTERSTITIEL: NativeAdUnit = {
  enabled: true,
  src: NATIVE_BANNER.src,
  containerId: NATIVE_BANNER.containerId,
};

export const RFT_POPUNDER: AdUnit = {
  enabled: true,
  src: POPUNDER.src,
};

/** Durée minimale de la pause publicitaire, avant que le résultat soit accessible. */
export const RFT_INTERSTITIEL_DUREE_S = 5;

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
  /^\/hors-ligne(\/|$)/,
];

export function isAdFreePath(pathname: string): boolean {
  return AD_FREE_PATHS.some((re) => re.test(pathname));
}
