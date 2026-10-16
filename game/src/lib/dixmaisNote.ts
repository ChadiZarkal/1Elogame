/**
 * @module lib/dixmaisNote
 * La note qu'une info obtient des joueurs, sur l'échelle du jeu (0 à 15).
 *
 * Partagé par le jeu (la « note des autres » au verdict et au bilan) et par le
 * serveur (le classement public, la console d'admin) : tous affichent le même
 * chiffre pour la même phrase.
 *
 * UNIQUEMENT LES NOTES DE LA MÉCANIQUE ACTUELLE
 *   Chaque info notée seule, de 0 à 15 (`dixmais_notes`, migration 030).
 *
 *   Les votes de l'ancienne mécanique ne servent plus, même en repli. Ils
 *   mesuraient ce qu'une révélation retirait à une note cumulée, plafonnée à
 *   10 : ramenés sur la nouvelle échelle, ils donnaient des moyennes fausses,
 *   et basses pour toutes les qualités. Une info qui n'a pas assez de notes
 *   n'a simplement pas de note des autres — la ligne ne s'affiche pas.
 */

export const NOTE_DEPART = 10;
export const NOTE_MIN = 0;
export const NOTE_MAX = 15;

/**
 * Sous ce nombre de notes, la moyenne d'une info n'est pas citée.
 *
 * Trois et non cinq : les notes viennent de démarrer, et à cinq, la plupart
 * des infos seraient restées sans comparaison pendant des jours. Trois avis
 * suffisent à ne pas montrer au joueur sa seule propre note ou celle d'un
 * inconnu isolé ; les moyennes de profil et de session agrègent ensuite
 * plusieurs infos, ce qui lisse le reste.
 */
export const NOTES_MIN_COMPARAISON = 3;

export interface CompteursEnonce {
  notes_count?: number | null;
  notes_total?: number | null;
}

export interface NoteMesuree {
  /** Moyenne des notes, de 0 à 15. */
  note: number;
  /** Nombre de notes derrière le chiffre. */
  echantillon: number;
}

const borner = (n: number) => Math.min(NOTE_MAX, Math.max(NOTE_MIN, n));

export function noteMesuree(s: CompteursEnonce): NoteMesuree | null {
  const notes = Number(s.notes_count ?? 0);
  if (notes < NOTES_MIN_COMPARAISON) return null;
  return { note: borner(Number(s.notes_total ?? 0) / notes), echantillon: notes };
}
