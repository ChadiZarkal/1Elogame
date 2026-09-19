/**
 * @module lib/rft/score
 * Le calcul du Red Flag Test. Fonctions pures, sans accès réseau.
 *
 * LE BARÈME TIENT EN UNE PHRASE
 *   Un point vaut un point de pourcentage, et le score est leur somme. Il n'est
 *   pas plafonné : un test sévère peut rendre 137 %, et c'est une meilleure
 *   chute qu'un 100 % qui aurait l'air d'un maximum atteint. Rien n'est
 *   normalisé, rien n'est pondéré — c'est précisément ce qui rend le barème
 *   lisible dans l'admin, où l'on voit ce que chaque réponse coûte.
 *
 * LA SEULE EXCEPTION, ET ELLE EST JUSTIFIÉE
 *   Les axes du radar, eux, sont ramenés sur 100. Un axe portant vingt
 *   questions écraserait sinon un axe qui n'en porte que trois, à tempérament
 *   égal : la forme du radar parlerait du nombre de questions plutôt que de la
 *   personne. Chaque axe vaut donc la part des points qu'il était possible d'y
 *   prendre. Les points bruts restent transportés à côté.
 */

import type { Archetype, Axe, Classement, Indice, Ressource, Tag, Verdict } from './types';

/** Une réponse choisie, telle que le serveur la relit en base. */
export interface ChoixResolu {
  questionId: string;
  answerId: string;
  points: number;
  /** Les tags de la question. Les points comptent en entier dans chacun. */
  tagIds: string[];
}

/** Le maximum atteignable sur une question : sa réponse la plus chargée. */
export interface MaximumQuestion {
  questionId: string;
  maxPoints: number;
  tagIds: string[];
}

// ---------------------------------------------------------------------------
// Score
// ---------------------------------------------------------------------------

/**
 * La somme des points, et rien d'autre.
 *
 * Pas de plafond : voir l'en-tête. Le plancher est à zéro parce qu'un score
 * négatif n'a pas de sens sur un écran qui annonce « tu es X % red flag » —
 * les points négatifs servent à racheter, pas à descendre sous le sol.
 */
export function calculerScore(choix: ChoixResolu[]): number {
  return Math.max(0, choix.reduce((somme, c) => somme + c.points, 0));
}

/**
 * Le total maximum que le test peut rendre, tel qu'affiché dans l'admin.
 *
 * C'est ce nombre qui permet d'équilibrer le questionnaire : il répond à
 * « si quelqu'un coche tout ce qu'il y a de pire, il obtient combien ? ».
 */
export function maximumAtteignable(maxima: MaximumQuestion[]): number {
  return maxima.reduce((somme, q) => somme + Math.max(0, q.maxPoints), 0);
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

/**
 * Le palier qui s'applique : le plus haut `minScore` que le score atteint.
 *
 * Les paliers sont ouverts vers le haut, donc le dernier attrape tout ce qui
 * dépasse — y compris les scores au-delà de cent, qui existent.
 */
export function verdictPour(score: number, verdicts: Verdict[]): Verdict | null {
  return (
    verdicts
      .filter((v) => score >= v.minScore)
      .sort((a, b) => b.minScore - a.minScore)[0] ?? null
  );
}

// ---------------------------------------------------------------------------
// Axes du radar
// ---------------------------------------------------------------------------

/**
 * Un axe par tag, exprimé en part des points qu'il était possible d'y prendre.
 *
 * Un axe dont le maximum est nul ou négatif est écarté : il n'y a rien à y
 * prendre, et le ramener sur 100 exigerait une division par zéro ou
 * retournerait un pourcentage d'une quantité négative, ce qui ne veut rien
 * dire. Mieux vaut un axe de moins qu'un axe faux.
 */
export function calculerAxes(
  choix: ChoixResolu[],
  maxima: MaximumQuestion[],
  tags: Array<{ id: string; label: string; color: string | null }>,
): Axe[] {
  const pris = new Map<string, number>();
  const possible = new Map<string, number>();

  for (const c of choix) {
    for (const tagId of c.tagIds) {
      pris.set(tagId, (pris.get(tagId) ?? 0) + c.points);
    }
  }
  for (const q of maxima) {
    for (const tagId of q.tagIds) {
      possible.set(tagId, (possible.get(tagId) ?? 0) + q.maxPoints);
    }
  }

  return tags
    .map((tag) => {
      const maximum = possible.get(tag.id) ?? 0;
      const points = pris.get(tag.id) ?? 0;
      return {
        tagId: tag.id,
        label: tag.label,
        color: tag.color,
        valeur: maximum > 0 ? borne(Math.round((points / maximum) * 100), 0, 100) : 0,
        points,
        maximum,
      };
    })
    .filter((axe) => axe.maximum > 0);
}

// ---------------------------------------------------------------------------
// Classements
// ---------------------------------------------------------------------------

/**
 * En dessous de ce nombre de parties, un rang se lit comme une opinion.
 *
 * Vingt n'a rien de magique : c'est le seuil en dessous duquel un déplacement
 * d'une seule place change le pourcentage de plus de cinq points. On affiche
 * quand même le rang — le cacher serait pire — mais on dit ce qu'il vaut.
 */
export const COHORTE_MINCE = 20;

/**
 * Le « Top X % ».
 *
 * La partie qui vient d'être jouée est déjà enregistrée quand on appelle ceci :
 * `effectif` la contient, `plusHauts` ne la contient pas. Le rang du joueur est
 * donc `plusHauts + 1`, exactement.
 *
 * Arrondi vers le haut, jamais au plus proche : premier sur trois, c'est
 * « top 34 % », pas « top 33 % ». Annoncer un rang meilleur que le rang réel
 * est le seul mensonge que cet écran ne peut pas se permettre.
 */
export function classement(effectif: number, plusHauts: number): Classement | null {
  if (effectif <= 0) return null;
  return {
    top: borne(Math.ceil(((plusHauts + 1) / effectif) * 100), 1, 100),
    effectif,
    avertissement:
      effectif < COHORTE_MINCE ? `seulement ${effectif} participant${effectif > 1 ? 's' : ''}` : null,
  };
}

// ---------------------------------------------------------------------------
// Le point noir
// ---------------------------------------------------------------------------

/**
 * En dessous de cette valeur, l'axe le plus haut n'est pas un point noir : il
 * est juste le moins bas d'un profil globalement sain.
 */
export const POINT_NOIR_MINIMUM = 40;

/**
 * Et il doit dominer le deuxième d'au moins cela.
 *
 * Sans cet écart, un radar presque rond — six axes à 52, 51, 50, 49, 48, 47 —
 * désignerait un « point noir » choisi par un point d'écart, c'est-à-dire par
 * le hasard des arrondis. Le profil de quelqu'un d'uniformément problématique
 * n'a pas de point noir, et le dire serait inventer une information.
 */
export const POINT_NOIR_ECART = 12;

/**
 * L'axe qui domine nettement les autres, ou rien.
 *
 * C'est la phrase que le joueur répète à voix haute — « mon point noir c'est la
 * loyauté » — donc elle doit être vraie. Mieux vaut ne rien dire que nommer un
 * axe qui ne se distingue pas.
 */
export function pointNoir(axes: Axe[]): Axe | null {
  if (axes.length < 2) return null;

  const tries = [...axes].sort((a, b) => b.valeur - a.valeur);
  const [premier, second] = tries;

  if (premier.valeur < POINT_NOIR_MINIMUM) return null;
  if (premier.valeur - second.valeur < POINT_NOIR_ECART) return null;
  return premier;
}

// ---------------------------------------------------------------------------
// L'archétype
// ---------------------------------------------------------------------------

/**
 * En dessous de cette valeur sur l'axe dominant, personne n'a d'archétype.
 *
 * Nommer « LE SURVEILLANT » quelqu'un dont l'axe le plus haut est à 20 % serait
 * lui coller une étiquette que ses réponses ne portent pas. Un profil sain n'a
 * pas d'archétype, et c'est une bonne nouvelle à lui annoncer autrement.
 */
export const ARCHETYPE_MINIMUM = 34;

/**
 * Le deuxième axe entre dans l'archétype s'il est à moins de cela du premier.
 *
 * Au-delà, ce n'est plus un profil à deux dominantes : c'est un seul axe qui
 * écrase le reste, et l'archétype doit le dire seul plutôt que de traîner un
 * second thème qui n'existe pas.
 */
export const ARCHETYPE_ECART = 20;

/** Les deux axes qui définissent l'archétype, ou rien. */
export interface PaireDominante {
  tagA: string;
  /** `null` quand un seul axe se détache vraiment. */
  tagB: string | null;
}

export function paireDominante(axes: Axe[]): PaireDominante | null {
  if (axes.length === 0) return null;

  const tries = [...axes].sort((a, b) => b.valeur - a.valeur);
  const [premier, second] = tries;
  if (premier.valeur < ARCHETYPE_MINIMUM) return null;

  const accompagne = second !== undefined && premier.valeur - second.valeur <= ARCHETYPE_ECART;
  return { tagA: premier.tagId, tagB: accompagne ? second.tagId : null };
}

/**
 * La clé de recherche d'une paire, rangée dans l'ordre.
 *
 * La base impose `tag_a < tag_b` pour qu'« Emprise + Loyauté » et
 * « Loyauté + Emprise » soient la même ligne. Le tri doit donc être refait ici,
 * sans quoi la moitié des recherches ne trouverait rien — et de façon
 * imprévisible, selon l'ordre des axes.
 */
export function clePaire(paire: PaireDominante): string {
  if (paire.tagB === null) return `${paire.tagA}|`;
  const [a, b] = [paire.tagA, paire.tagB].sort();
  return `${a}|${b}`;
}

// ---------------------------------------------------------------------------
// La réponse la plus chère
// ---------------------------------------------------------------------------

/**
 * La part du score qu'une seule réponse doit peser pour mériter d'être citée.
 *
 * Sur un test bien réparti, la réponse la plus chère pèse un dixième du total :
 * l'annoncer serait dire une banalité. C'est quand une seule réponse porte le
 * cinquième du score que la phrase devient une gifle — et qu'elle est vraie.
 */
export const PART_DECISIVE = 0.2;

/** Elle doit aussi valoir quelque chose en absolu : trois points sur douze, non. */
export const POINTS_DECISIFS = 5;

/**
 * La réponse qui a coûté le plus cher, quand elle pèse assez pour compter.
 *
 * `null` sur un profil régulier — c'est le cas le plus courant, et prétendre
 * qu'une réponse à deux points « a fait la différence » serait faux.
 */
export function reponseLaPlusChere(choix: ChoixResolu[], score: number): ChoixResolu | null {
  if (choix.length === 0 || score <= 0) return null;

  const pire = choix.reduce((max, c) => (c.points > max.points ? c : max), choix[0]);
  if (pire.points < POINTS_DECISIFS) return null;
  if (pire.points / score < PART_DECISIVE) return null;
  return pire;
}

// ---------------------------------------------------------------------------
// La comparaison à la moyenne
// ---------------------------------------------------------------------------

export type NomCohorte = 'tous' | 'sexe' | 'age' | 'sexe_age';

/** Une cohorte telle que la base la rend. */
export interface CohorteBrute {
  cohorte: NomCohorte;
  effectif: number;
  plusHauts: number;
  /** `null` quand la cohorte est vide : il n'y a pas de moyenne de rien. */
  moyenne: number | null;
}

/**
 * En dessous de ce nombre de parties, une moyenne n'en est pas une.
 *
 * Plus bas que le seuil des rangs (vingt), parce qu'une moyenne est une
 * statistique plus stable qu'un rang : elle bouge de quelques points quand un
 * joueur s'ajoute, là où un rang peut sauter de vingt pour cent. L'effectif est
 * transporté malgré tout, pour que l'écran puisse le citer.
 */
export const COMPARAISON_MIN = 8;

/**
 * Un écart en deçà duquel il n'y a rien à annoncer.
 *
 * « Un point au-dessus de la moyenne » n'est pas une information, c'est du
 * bruit d'arrondi présenté comme un verdict.
 */
export const ECART_NEGLIGEABLE = 2;

export interface Comparaison {
  cohorte: NomCohorte;
  /** Score moins moyenne, arrondi. Zéro quand l'écart est négligeable. */
  ecart: number;
  moyenne: number;
  effectif: number;
}

/**
 * La cohorte la plus précise qui soit assez fournie pour être citée.
 *
 * L'ordre de préférence va du plus parlant au plus général : « les hommes de
 * 23-26 ans » dit davantage que « les hommes », qui dit davantage que « les
 * joueurs ». On descend d'un cran chaque fois que la cohorte est trop mince,
 * plutôt que de renoncer à comparer.
 */
const PREFERENCE: NomCohorte[] = ['sexe_age', 'sexe', 'age', 'tous'];

export function comparaison(score: number, cohortes: CohorteBrute[]): Comparaison | null {
  for (const nom of PREFERENCE) {
    const c = cohortes.find((x) => x.cohorte === nom);
    if (!c || c.moyenne === null || c.effectif < COMPARAISON_MIN) continue;

    const brut = score - c.moyenne;
    return {
      cohorte: nom,
      ecart: Math.abs(brut) < ECART_NEGLIGEABLE ? 0 : Math.round(brut),
      moyenne: Math.round(c.moyenne),
      effectif: c.effectif,
    };
  }
  return null;
}

/** L'archétype correspondant aux deux axes dominants, s'il a été écrit. */
export function trouverArchetype(axes: Axe[], archetypes: Archetype[]): Archetype | null {
  const paire = paireDominante(axes);
  if (!paire) return null;

  const cherchee = clePaire(paire);
  const trouve = archetypes.find((a) => clePaire({ tagA: a.tagA, tagB: a.tagB }) === cherchee);
  if (trouve) return trouve;

  // Rien pour cette paire : on se rabat sur l'axe dominant seul plutôt que de
  // ne rien afficher. Un archétype manquant est un trou dans le contenu, pas
  // une raison de priver le joueur de sa ligne.
  const seul = clePaire({ tagA: paire.tagA, tagB: null });
  return archetypes.find((a) => clePaire({ tagA: a.tagA, tagB: a.tagB }) === seul) ?? null;
}

/**
 * Les ressources déclenchées, une par catégorie ayant dépassé son seuil.
 *
 * Triées par gravité décroissante : quand deux s'appliquent, celle de l'axe le
 * plus haut passe en premier.
 */
export function ressourcesPour(axes: Axe[], tags: Tag[]): Ressource[] {
  const parId = new Map(tags.map((t) => [t.id, t]));

  return axes
    .filter((axe) => {
      const tag = parId.get(axe.tagId);
      return tag?.ressourceSeuil != null && tag.ressourceTexte && axe.valeur >= tag.ressourceSeuil;
    })
    .sort((a, b) => b.valeur - a.valeur)
    .map((axe) => {
      const tag = parId.get(axe.tagId)!;
      return { label: tag.label, texte: tag.ressourceTexte!, lien: tag.ressourceLien };
    });
}

// ---------------------------------------------------------------------------
// Aiguille
// ---------------------------------------------------------------------------

/**
 * L'indice envoyé au navigateur à la place des points.
 *
 * Établi par rapport aux autres réponses de la même question : la plus chargée
 * vaut 2, la moins chargée 0, le reste 1. Quand toutes se valent, tout vaut 1 —
 * l'aiguille ne bouge pas, ce qui est la vérité.
 */
export function indicePour(points: number, tousLesPoints: number[]): Indice {
  const max = Math.max(...tousLesPoints);
  const min = Math.min(...tousLesPoints);
  if (max === min) return 1;
  if (points === max) return 2;
  if (points === min) return 0;
  return 1;
}

/**
 * Où va l'aiguille après une réponse.
 *
 * Le pas est calé sur la longueur du test pour qu'une partie entièrement rouge
 * traverse tout le cadran, quel que soit le nombre de questions : avec un pas
 * fixe, l'aiguille se collait en butée au bout de cinq réponses et restait
 * morte pour les trente suivantes.
 */
export function avancerAiguille(position: number, indice: Indice, nbQuestions: number): number {
  const pas = nbQuestions > 0 ? 50 / nbQuestions : 10;
  return borne(position + (indice - 1) * pas, 0, 100);
}

// ---------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------

function borne(valeur: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valeur));
}

/** Part en pourcentage, arrondie, avec zéro plutôt qu'une division par zéro. */
export function part(numerateur: number, denominateur: number): number {
  if (denominateur <= 0) return 0;
  return Math.round((numerateur / denominateur) * 100);
}
