/**
 * @module components/ads/gardePopunder
 * Une ouverture de pop-under par moment choisi, pas une par tap.
 *
 * Le script de la régie s'installe une fois par visite (le site ne recharge
 * jamais la page) et pose deux écouteurs sur `document`, en capture :
 * `mousedown` et `touchstart`. À partir de là, il rouvre sa page tous les
 * quelques taps, où que soit le joueur. Constaté le 2026-10-28 dans le récap
 * du Red Flag Test : une pub à chaque « Continuer ». Et le tap qui ouvre la pub
 * n'arrive jamais au bouton — la fenêtre ouverte vole le relâché du doigt.
 *
 * La garde reprend la main :
 *  - elle enveloppe les écouteurs `mousedown`/`touchstart` posés en capture sur
 *    `document` — le site n'en pose aucun, seule la régie le fait — et ne les
 *    laisse passer que tant qu'une ouverture est permise ;
 *  - elle compte les ouvertures (`window.open`, que le site n'utilise pas
 *    non plus) et refuse celles qui dépassent.
 *
 * `armerPopunder()` permet une ouverture, au moment voulu (pause du Red Flag
 * Test, seuil de tours d'un jeu). Une fois la page de pub ouverte, plus rien ne
 * passe jusqu'au prochain armement : les taps suivants restent au jeu.
 *
 * Les écouteurs du site (le glissement des stories, sur la racine React) ne
 * sont pas concernés : rien n'est arrêté, seule la régie est muselée.
 */

type Ecouteur = EventListenerOrEventListenerObject;

let ouvertures = 0;
let installee = false;
const enveloppes = new WeakMap<Ecouteur, EventListener>();

const TYPES_SURVEILLES = new Set(['mousedown', 'touchstart']);

function enCapture(options?: boolean | AddEventListenerOptions | EventListenerOptions): boolean {
  return typeof options === 'boolean' ? options : Boolean(options?.capture);
}

/** Pose la garde. Sans effet après le premier appel ; à faire avant le script. */
export function installerGardePopunder(): void {
  if (installee || typeof window === 'undefined') return;
  installee = true;

  const ajouter = document.addEventListener.bind(document) as (
    type: string,
    ecouteur: Ecouteur | null,
    options?: boolean | AddEventListenerOptions,
  ) => void;
  const retirer = document.removeEventListener.bind(document) as (
    type: string,
    ecouteur: Ecouteur | null,
    options?: boolean | EventListenerOptions,
  ) => void;

  document.addEventListener = function (
    type: string,
    ecouteur: Ecouteur | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (ecouteur && TYPES_SURVEILLES.has(type) && enCapture(options)) {
      let enveloppe = enveloppes.get(ecouteur);
      if (!enveloppe) {
        enveloppe = function (this: Document, evenement: Event) {
          if (ouvertures <= 0) return;
          if (typeof ecouteur === 'function') ecouteur.call(this, evenement);
          else ecouteur.handleEvent(evenement);
        };
        enveloppes.set(ecouteur, enveloppe);
      }
      return ajouter(type, enveloppe, options);
    }
    return ajouter(type, ecouteur, options);
  } as typeof document.addEventListener;

  document.removeEventListener = function (
    type: string,
    ecouteur: Ecouteur | null,
    options?: boolean | EventListenerOptions,
  ) {
    return retirer(type, (ecouteur && enveloppes.get(ecouteur)) || ecouteur, options);
  } as typeof document.removeEventListener;

  const ouvrir = window.open.bind(window);
  window.open = function (...args: Parameters<typeof window.open>) {
    if (ouvertures <= 0) return null;
    ouvertures -= 1;
    return ouvrir(...args);
  };
}

/** Permet une ouverture de pop-under, au prochain tap. */
export function armerPopunder(): void {
  installerGardePopunder();
  ouvertures = 1;
}

/** Retire la permission en attente (nouvelle partie remise sous le seuil). */
export function desarmerPopunder(): void {
  ouvertures = 0;
}
