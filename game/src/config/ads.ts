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
 *   sort carrément de l'application. Il n'est allumé qu'à la fin du Red Flag
 *   Test (`RFT_POPUNDER`).
 *
 * - `socialBar` est une barre flottante posée par-dessus le contenu, en bas de
 *   l'écran le plus souvent. C'est exactement la bande où vivent les boutons
 *   d'appel à action des trois jeux, qu'on vient de faire remonter au-dessus de
 *   la ligne de flottaison. Elle les recouvrirait.
 *
 * Passer l'un des deux à `true` suffit à l'activer : le composant et
 * l'exclusion des routes sont déjà en place.
 *
 * Le troisième, `NATIVE_BANNER`, le bandeau du bas des pages de contenu (guide,
 * notes de présentation), avait été éteint pendant l'examen AdSense. AdSense a
 * été retiré du site le 2026-10-28 : la raison est tombée, mais le rallumer
 * reste une décision commerciale. L'interrupteur suffit.
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
  src: 'https://bauval.org/21/8413c6c99c5cae8d29d9ac7c0cf1d2d6',
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

/**
 * « C'est un 10 mais… » : l'encart natif carré sur l'écran du verdict, après
 * chaque profil (demandé côté produit le 2026-10-21). Il s'insère dans la
 * page, sous la note : pas d'écran à part, pas de compte à rebours. Il
 * remplace la pause tous les cinq profils (`DIXMAIS_PAUSE`, éteinte) — les
 * deux ensemble feraient deux pubs d'affilée au cinquième profil.
 */
export const DIXMAIS_VERDICT: NativeAdUnit = {
  enabled: true,
  src: ACCUEIL_NATIVE.src,
  containerId: ACCUEIL_NATIVE.containerId,
};

/**
 * « Le pire des deux » : l'encart natif carré sur le récap de fin de partie
 * (`/jeu/recap`), sous « Partager mon résultat ». Demandé côté produit le
 * 2026-10-21.
 */
export const JEU_RECAP: NativeAdUnit = {
  enabled: true,
  src: ACCUEIL_NATIVE.src,
  containerId: ACCUEIL_NATIVE.containerId,
};

/**
 * « Le pire des deux » : une pause publicitaire tous les cinq duels, entre le
 * résultat et le duel suivant (`components/game/PausePubDuel`). Demandée côté
 * produit le 2026-10-28. Un écran à part, avec un bouton pour repartir : rien
 * ne s'affiche pendant qu'on choisit, et le dernier duel d'une partie n'en a
 * pas — le récap porte déjà `JEU_RECAP`.
 *
 * `/jeu/jouer` reste dans `AD_FREE_PATHS` : aucun encart *pendant* un duel.
 * La pause monte son cadre elle-même, sur son propre écran.
 */
export const JEU_PAUSE: NativeAdUnit = {
  enabled: true,
  src: ACCUEIL_NATIVE.src,
  containerId: ACCUEIL_NATIVE.containerId,
};

/** Une pause tous les combien de duels joués. */
export const JEU_PAUSE_TOUS_LES = 5;

/**
 * Faut-il une pause après ce duel ? Jamais après le dernier d'une partie :
 * le joueur part vers le récap, qui a son encart.
 */
export function pauseJeuDue(duelsJoues: number, taillePartie?: number): boolean {
  if (!JEU_PAUSE.enabled || duelsJoues <= 0) return false;
  if (taillePartie !== undefined && duelsJoues >= taillePartie) return false;
  return duelsJoues % JEU_PAUSE_TOUS_LES === 0;
}

/**
 * L'Oracle : l'encart natif carré sur chaque verdict (`RevealPhase`), sous
 * « Partager » et « Offrir un café ». Demandé côté produit le 2026-10-28.
 * Rien pendant la saisie ni l'attente : seul l'écran du verdict le porte.
 */
export const ORACLE_VERDICT: NativeAdUnit = {
  enabled: true,
  src: ACCUEIL_NATIVE.src,
  containerId: ACCUEIL_NATIVE.containerId,
};

/**
 * « C'est un 10 mais… » : une pause publicitaire tous les cinq profils, entre
 * un verdict (ou le bilan) et le profil suivant. Demandée côté produit le
 * 2026-10-19.
 *
 * L'encart natif plutôt que les deux autres formats :
 *  - le pop-under s'ouvrirait au premier clic, et dans ce jeu tout est clic ;
 *  - la barre sociale flotte en bas de l'écran, là où vivent la jauge et le
 *    bouton « Valider » : elle les recouvrirait pendant toute la partie.
 * L'encart natif, lui, occupe un écran à part, puis le jeu reprend.
 *
 * Même conteneur que les autres encarts natifs : aucun n'est allumé sur
 * /dixmais, il est seul sur la page.
 */
export const DIXMAIS_PAUSE: NativeAdUnit = {
  // Éteinte le 2026-10-21 : remplacée par l'encart du verdict (DIXMAIS_VERDICT).
  enabled: false,
  src: ACCUEIL_NATIVE.src,
  containerId: ACCUEIL_NATIVE.containerId,
};

/** Une pause tous les combien de profils jugés. */
export const DIXMAIS_PAUSE_TOUS_LES = 5;

/** Durée minimale de la pause, avant que le profil suivant soit accessible. */
export const DIXMAIS_PAUSE_DUREE_S = 5;

/** Faut-il une pause après ce nombre de profils jugés ? */
export function pauseDixmaisDue(profilsJuges: number): boolean {
  return DIXMAIS_PAUSE.enabled && profilsJuges > 0 && profilsJuges % DIXMAIS_PAUSE_TOUS_LES === 0;
}

export const SOCIAL_BAR: AdUnit = {
  enabled: false,
  src: 'https://bauval.org/14/68185e1c4ae03b3726a06b8ab25952ad',
};

export const POPUNDER: AdUnit = {
  enabled: false,
  src: 'https://abscloud.org/1/74f692d04f08eba7fcdc90ba9634f984',
};

/**
 * La pause publicitaire du Red Flag Test, entre la dernière réponse et le
 * résultat (voir `redflagtest/Interstitiel`). Demandée et assumée côté
 * produit le 2026-10-13, en connaissance des réserves ci-dessus.
 *
 * - L'encart reprend l'emplacement natif : c'est le seul format qui s'affiche
 *   *dans* l'écran, et c'est ce qui permet « la pub, puis le résultat ».
 * - Le pop-under s'arme sur cet écran et s'ouvre au clic sur « Voir mon
 *   résultat ». Jusqu'au 2026-10-28, il ne s'armait que si AdSense était absent
 *   de la page (règlement Google) : venu d'une autre page du site, presque
 *   personne ne l'avait. AdSense est retiré, il s'arme pour tous.
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

/**
 * Le pop-under dans les trois autres jeux, armé après un certain nombre de
 * tours (demandé côté produit le 2026-10-28) : verdicts de l'Oracle dans la
 * visite, duels de la partie du Pire des deux, profils jugés dans « C'est un
 * 10 mais… ». Une fois armé, il s'ouvre au clic suivant — « Encore »,
 * « Suivant », le profil d'après. Combien de fois il peut s'ouvrir se règle
 * dans le tableau de bord Adsterra (plafond de fréquence), pas ici.
 */
export const JEUX_POPUNDER: AdUnit = {
  enabled: true,
  src: POPUNDER.src,
};

/** À partir de combien de tours le pop-under s'arme, jeu par jeu. */
export const POPUNDER_APRES = {
  oracle: 4,
  pireDesDeux: 10,
  dixmais: 3,
} as const;

/** Durée minimale de la pause publicitaire, avant que le résultat soit accessible. */
export const RFT_INTERSTITIEL_DUREE_S = 5;

/**
 * Le Red Flag Test, avant la partie : l'encart natif sous le bouton de départ.
 * Demandé côté produit le 2026-10-28 (« sous le bouton Commencer »). Il est
 * posé sur les deux écrans de départ : le profil (« Commencer », vu une seule
 * fois) et le pari (« Je parie… » / « Passer »), que tout le monde voit.
 */
export const RFT_DEPART: NativeAdUnit = {
  enabled: true,
  src: NATIVE_BANNER.src,
  containerId: NATIVE_BANNER.containerId,
};

/**
 * Routes sans aucune publicité, ni bandeau de consentement.
 *
 * Un écran de jeu en cours n'a pas de place pour un encart. `/hors-ligne` est
 * servi sans réseau — un script tiers n'y chargerait jamais.
 */
export const AD_FREE_PATHS: RegExp[] = [
  /^\/admin(\/|$)/,
  /^\/dixmais\/admin(\/|$)/,
  // Aucun encart pendant un duel. La pause tous les cinq duels (JEU_PAUSE) a
  // son propre écran et ne passe pas par ce filtre.
  /^\/jeu\/jouer(\/|$)/,
  // `/jeu/recap` en est sorti le 2026-10-21 : la fin de partie porte l'encart
  // JEU_RECAP.
  /^\/hors-ligne(\/|$)/,
];

export function isAdFreePath(pathname: string): boolean {
  return AD_FREE_PATHS.some((re) => re.test(pathname));
}
