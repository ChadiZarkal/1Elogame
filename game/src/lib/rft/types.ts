/**
 * @module lib/rft/types
 * Les formes échangées par le Red Flag Test.
 *
 * LA LIGNE DE PARTAGE, ET ELLE EST LE POINT LE PLUS IMPORTANT DU MODULE
 *   `QuestionAdmin` porte les points. `QuestionPublique` ne les porte pas.
 *   Ce sont deux types distincts plutôt qu'un seul avec un champ optionnel,
 *   parce qu'un champ optionnel se laisse oublier : il suffirait d'un `spread`
 *   distrait pour que le barème parte dans la réponse HTTP, et le test
 *   deviendrait truquable par quiconque ouvre l'inspecteur.
 *
 *   Le navigateur reçoit un `indice` de 0 à 2 à la place. C'est assez pour que
 *   l'aiguille ne mente jamais sur le sens, et trop grossier pour reconstituer
 *   un barème.
 */

import type { AgeVotant, SexeVotant } from '@/types/database';

// ---------------------------------------------------------------------------
// Contenu
// ---------------------------------------------------------------------------

export interface Tag {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  color: string | null;
  position: number;
  isActive: boolean;
}

export interface ReponseAdmin {
  id: string;
  position: number;
  texte: string;
  /** Points de pourcentage ajoutés au score. Peut être négatif. */
  points: number;
  /** La pique des highlights. Sans elle, la réponse ne peut pas être retenue. */
  pique: string | null;
}

export interface QuestionAdmin {
  id: string;
  position: number;
  texte: string;
  precision: string | null;
  active: boolean;
  tagIds: string[];
  reponses: ReponseAdmin[];
}

// ---------------------------------------------------------------------------
// Ce que le navigateur reçoit
// ---------------------------------------------------------------------------

/**
 * Sens du déplacement de l'aiguille, sans son amplitude.
 *
 * 0 : la réponse la moins chargée de sa question — l'aiguille recule.
 * 2 : la plus chargée — elle avance.
 * 1 : tout le reste, et le cas d'une question dont toutes les réponses valent
 *     pareil.
 *
 * Établi par rapport aux autres réponses de LA MÊME question, jamais sur une
 * échelle globale : on ne peut donc pas comparer deux questions entre elles à
 * partir de ce champ.
 */
export type Indice = 0 | 1 | 2;

export interface ReponsePublique {
  id: string;
  texte: string;
  indice: Indice;
}

export interface QuestionPublique {
  id: string;
  texte: string;
  precision: string | null;
  reponses: ReponsePublique[];
}

export interface QuizPublic {
  questions: QuestionPublique[];
  /** Les axes du radar, dans l'ordre d'affichage. */
  tags: Array<Pick<Tag, 'id' | 'label' | 'color'>>;
}

// ---------------------------------------------------------------------------
// Verdicts
// ---------------------------------------------------------------------------

export interface Verdict {
  id: string;
  /** Palier ouvert vers le haut : s'applique dès que le score l'atteint. */
  minScore: number;
  emoji: string | null;
  titre: string;
  soustitre: string | null;
}

// ---------------------------------------------------------------------------
// Partie et résultat
// ---------------------------------------------------------------------------

export interface Soumission {
  choix: Array<{ questionId: string; answerId: string }>;
  sexe: SexeVotant | null;
  age: AgeVotant | null;
  dureeMs: number | null;
}

export interface Classement {
  /** « Top X % » : la part des joueurs qui ont fait aussi fort ou plus fort. */
  top: number;
  effectif: number;
  /** Renseigné quand la cohorte est trop mince pour que le rang veuille dire quelque chose. */
  avertissement: string | null;
}

export interface Axe {
  tagId: string;
  label: string;
  color: string | null;
  /** 0 à 100 : part des points de cet axe réellement pris. */
  valeur: number;
  /** Les points bruts, pour l'admin et pour l'explication. */
  points: number;
  maximum: number;
}

export interface Highlight {
  question: string;
  reponse: string;
  pique: string;
  /** Part des joueurs ayant choisi cette réponse, en pourcentage. */
  part: number;
}

export interface Resultat {
  /** Somme des points. Peut dépasser 100 — c'est voulu. */
  score: number;
  verdict: Verdict | null;
  classements: { sexe: Classement | null; age: Classement | null };
  axes: Axe[];
  /**
   * L'axe qui domine nettement les autres, quand il y en a un.
   *
   * `null` sur un profil uniforme : désigner un point noir séparé du deuxième
   * par un point d'écart, c'est nommer le hasard des arrondis.
   */
  pointNoir: Axe | null;
  /**
   * L'écart à la moyenne d'une cohorte, quand elle est assez fournie.
   *
   * « Top 39 % » est un rang, et un rang est abstrait. « 12 points au-dessus de
   * la moyenne des hommes de ton âge » se comprend sans effort.
   */
  comparaison: ComparaisonPublique | null;
  highlights: Highlight[];
  /** Nombre total de parties enregistrées, celle-ci comprise. */
  participants: number;
}

export interface ComparaisonPublique {
  /** Quelle population sert de repère — l'écran en tire sa formulation. */
  cohorte: 'tous' | 'sexe' | 'age' | 'sexe_age';
  /** Points au-dessus (positif) ou en dessous. Zéro quand l'écart est du bruit. */
  ecart: number;
  moyenne: number;
  effectif: number;
}
