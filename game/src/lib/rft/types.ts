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
  /**
   * Au-delà de ce pourcentage sur l'axe, le récap cesse de faire de l'humour et
   * propose quelque chose. `null` : jamais.
   *
   * Le seuil vit sur la catégorie parce que c'est elle qui sait de quoi elle
   * parle. Un seuil global sur le score total afficherait un texte sur la
   * violence à quelqu'un de simplement déloyal.
   */
  ressourceSeuil: number | null;
  ressourceTexte: string | null;
  ressourceLien: string | null;
}

/**
 * Le nom donné au profil, lu sur les deux axes dominants.
 *
 * « ÇA SE VOIT DE LOIN » décrit un score. « LE CONTRÔLEUR AFFECTUEUX » décrit
 * une personne, et c'est cela qu'on répète.
 */
export interface Archetype {
  id: string;
  tagA: string;
  /** `null` quand un seul axe se détache vraiment. */
  tagB: string | null;
  emoji: string | null;
  titre: string;
  soustitre: string | null;
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

/**
 * La teinte du drapeau. Trois valeurs seulement, parce que les images de la
 * feuille de référence n'existent qu'en trois versions.
 */
export type CouleurDrapeau = 'red' | 'orange' | 'green';

export interface Classement {
  /** « Top X % » : la part des joueurs qui ont fait aussi fort ou plus fort. */
  top: number;
  /**
   * La population, en toutes lettres : « de tout le monde », « des hommes ».
   *
   * Calculée par le serveur et non par l'écran, parce que la page d'un résultat
   * partagé ne connaît ni le sexe ni l'âge de celui qui a joué. Sans cela, les
   * drapeaux disparaissaient de cette page — c'est-à-dire de celle que le plus
   * de monde voit.
   */
  legende: string;
  couleur: CouleurDrapeau;
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

/**
 * Un renvoi vers une vraie ressource, quand le test cesse d'être un jeu.
 *
 * C'est ce qui le sépare d'un quiz de magazine, et c'est la chose à faire quand
 * quelqu'un vient de cocher « oui » à la violence.
 */
export interface Ressource {
  /** La catégorie qui l'a déclenchée, pour que le joueur sache pourquoi. */
  label: string;
  texte: string;
  lien: string | null;
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
  /**
   * Trois cohortes, du plus large au plus precis. « Tout le monde » repond a la
   * question qu'on se pose d'abord ; les deux autres a celle qu'on se pose
   * ensuite.
   */
  classements: {
    tous: Classement | null;
    sexe: Classement | null;
    age: Classement | null;
  };
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
  /** Le nom du profil, quand un axe se détache assez pour en mériter un. */
  archetype: Archetype | null;
  /**
   * La réponse qui a coûté le plus cher, quand elle pèse assez pour être citée.
   *
   * `null` sur un profil régulier : prétendre qu'une réponse à deux points « a
   * fait la différence » serait faux.
   */
  reponseDecisive: { question: string; reponse: string; points: number } | null;
  /** Les ressources déclenchées par les axes les plus hauts. */
  ressources: Ressource[];
  highlights: Highlight[];
  /** Nombre total de parties enregistrées, celle-ci comprise. */
  participants: number;
  /** L'adresse publique de cette partie, pour la partager. */
  codePartage: string | null;
}

// ---------------------------------------------------------------------------
// Statistiques publiques
// ---------------------------------------------------------------------------

/**
 * Une réponse et sa popularité, au total et par sexe.
 *
 * Les trois dénominateurs sont transportés séparément : comparer une part
 * d'hommes au total général donnerait des pourcentages qui ne somment pas à
 * cent et des écarts inventés de toutes pièces.
 */
export interface StatReponse {
  answerId: string;
  texte: string;
  points: number;
  choix: number;
  choixH: number;
  choixF: number;
}

export interface StatQuestion {
  questionId: string;
  texte: string;
  total: number;
  totalH: number;
  totalF: number;
  reponses: StatReponse[];
}

export interface ComparaisonPublique {
  /** Quelle population sert de repère. */
  cohorte: 'tous' | 'sexe' | 'age' | 'sexe_age';
  /** Cette population en toutes lettres, écrite par le serveur. */
  legende: string;
  /** Points au-dessus (positif) ou en dessous. Zéro quand l'écart est du bruit. */
  ecart: number;
  moyenne: number;
  effectif: number;
}
