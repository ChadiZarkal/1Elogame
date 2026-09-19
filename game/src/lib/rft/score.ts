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

import type { Axe, Classement, Indice, Verdict } from './types';

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
