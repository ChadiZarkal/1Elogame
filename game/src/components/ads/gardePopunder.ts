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
 *  - elle enveloppe les écouteurs de tap (`mousedown`, `touchstart`, `click`,
 *    leurs relâchés, les `pointer*`) posés en capture sur `document` — le site
 *    n'en pose aucun, seule la régie le fait — et ne les laisse passer que tant
 *    qu'une ouverture est permise ;
 *  - elle compte les ouvertures et refuse celles qui dépassent : par
 *    `window.open`, que le site n'utilise pas non plus, et par la perte de
 *    l'onglet (masqué ou défocalisé) juste après un tap laissé passer.
 *
 *  - elle neutralise le voile de la régie hors armement (voir plus bas).
 *
 * LE VOILE. Constaté le 2026-11-06 dans « C'est un 10 mais » : une page de pub
 * à chaque tap, où qu'il soit, et le jeu figé sur « Toujours un 10 ». La
 * régie pose sur tout l'écran un calque invisible — `div` en `position:
 * fixed`, `z-index` maximal, opacité 0,01 — qui contient un lien
 * `target=_blank` vers sa page. Chaque tap tombe sur ce lien : le navigateur
 * ouvre la pub de lui-même, sans écouteur ni `window.open` que la garde
 * puisse filtrer, et le bouton du jeu ne reçoit jamais le tap. La garde
 * repère ce calque dès qu'il est posé et le retire de l'affichage
 * (`display: none`) tant que le pop-under n'est pas armé ; armé, il reprend
 * sa place pour un tap.
 *
 * Les écouteurs de tap surveillés vont au-delà de `mousedown`/`touchstart` :
 * après sa première ouverture, la régie pose aussi un `click` en capture. Et
 * une ouverture compte aussi quand l'onglet du site est masqué ou défocalisé
 * juste après un tap, ce qui couvre les ouvertures par le lien du voile.
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
/** Instant du dernier tap laissé passer à la régie. */
let dernierPassage = -Infinity;
const enveloppes = new WeakMap<Ecouteur, EventListener>();

const TYPES_SURVEILLES = new Set([
  'mousedown',
  'mouseup',
  'touchstart',
  'touchend',
  'click',
  'auxclick',
  'pointerdown',
  'pointerup',
]);

/** Délai pendant lequel la perte de l'onglet est imputée au tap laissé passer. */
const DELAI_OUVERTURE_MS = 1500;

/** Les calques plein écran de la régie, repérés à leur pose. */
const voiles = new Set<HTMLElement>();

/** Calque de la régie : fixe, au `z-index` maximal. Le site n'en pose aucun. */
function estVoile(noeud: Node): noeud is HTMLElement {
  if (!(noeud instanceof HTMLElement)) return false;
  const style = getComputedStyle(noeud);
  return style.position === 'fixed' && Number(style.zIndex) >= 2147483000;
}

/** Retire les voiles de l'affichage hors armement, les rend une fois armé. */
function appliquerVoiles(): void {
  for (const voile of voiles) {
    if (!voile.isConnected) voiles.delete(voile);
    else if (ouvertures > 0) voile.style.removeProperty('display');
    else voile.style.setProperty('display', 'none', 'important');
  }
}

function fixerOuvertures(n: number): void {
  ouvertures = n;
  appliquerVoiles();
}

function consommerSiOuverture(): void {
  if (ouvertures > 0 && performance.now() - dernierPassage < DELAI_OUVERTURE_MS) fixerOuvertures(0);
}

/** Surveille les ajouts à `body` : la régie y pose son voile. */
function surveillerVoiles(): void {
  const examiner = (noeud: Node) => {
    if (voiles.has(noeud as HTMLElement) || !estVoile(noeud)) return;
    voiles.add(noeud);
    // La régie peut réécrire le style de son calque : on repasse derrière.
    new MutationObserver(appliquerVoiles).observe(noeud, { attributes: true, attributeFilter: ['style'] });
  };
  const observateur = new MutationObserver((mutations) => {
    let vu = false;
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        examiner(n);
        vu = true;
      }
    }
    if (vu) appliquerVoiles();
  });
  // Les enfants directs de `body` seulement : c'est là que la régie pose son
  // calque, et le reste de la page change à chaque animation.
  const brancher = () => {
    for (const n of document.body.children) examiner(n);
    observateur.observe(document.body, { childList: true });
    appliquerVoiles();
  };
  if (document.body) brancher();
  else document.addEventListener('DOMContentLoaded', brancher, { once: true });
}

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
          dernierPassage = performance.now();
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

  // Le tap qui vise le voile : refusé hors armement (si son style a échappé à
  // la garde), noté sinon. Posé avant la régie, cet écouteur passe le premier.
  ajouter(
    'click',
    (evenement: Event) => {
      const cible = evenement.target;
      const surVoile = cible instanceof Node && [...voiles].some((v) => v.contains(cible));
      if (!surVoile) return;
      if (ouvertures <= 0) {
        evenement.preventDefault();
        evenement.stopImmediatePropagation();
        return;
      }
      dernierPassage = performance.now();
      // Le lien ouvre la page de pub ; ensuite, plus rien.
      setTimeout(() => fixerOuvertures(0), 0);
    },
    true,
  );
  ajouter('pointerdown', () => {
    if (ouvertures > 0) dernierPassage = performance.now();
  }, true);

  // L'onglet masqué ou défocalisé juste après un tap laissé passer : une page
  // s'est ouverte, même sans notre `window.open`.
  window.addEventListener('blur', consommerSiOuverture);
  ajouter('visibilitychange', () => {
    if (document.visibilityState === 'hidden') consommerSiOuverture();
  });

  const ouvrir = window.open.bind(window);
  window.open = function (...args: Parameters<typeof window.open>) {
    if (ouvertures <= 0) return null;
    fixerOuvertures(ouvertures - 1);
    return ouvrir(...args);
  };

  surveillerVoiles();
}

/** Permet une ouverture de pop-under, au prochain tap. */
export function armerPopunder(): void {
  installerGardePopunder();
  dernierPassage = -Infinity;
  fixerOuvertures(1);
}

/** Retire la permission en attente (nouvelle partie remise sous le seuil). */
export function desarmerPopunder(): void {
  dernierPassage = -Infinity;
  fixerOuvertures(0);
}
