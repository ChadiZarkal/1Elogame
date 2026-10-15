/**
 * @module lib/dixmaisNote
 * La note qu'une info obtient des joueurs, sur l'échelle du jeu (0 à 15).
 *
 * Partagé par le jeu (la « note des autres » au verdict) et par le serveur
 * (le classement public) : les deux doivent afficher le même chiffre.
 *
 * DEUX SOURCES, PAR ORDRE DE PRÉFÉRENCE
 *   1. les notes de la mécanique actuelle (`dixmais_notes`, migration 030) :
 *      chaque info notée seule, de 0 à 15 — c'est la vraie mesure ;
 *   2. à défaut, une estimation tirée des votes de l'ancienne mécanique, qui
 *      mesuraient ce qu'une révélation retirait à une note cumulée : 10 plus
 *      ce delta moyen. Sous-estimée pour les green flags, l'ancienne note
 *      étant plafonnée à 10.
 */

export const NOTE_DEPART = 10;
export const NOTE_MIN = 0;
export const NOTE_MAX = 15;

/** Sous ce nombre de notes (ou de votes), la moyenne est trop bruitée pour
 * être opposée au joueur. */
export const NOTES_MIN_COMPARAISON = 5;

export interface CompteursEnonce {
  notes_count?: number | null;
  notes_total?: number | null;
  votes_count?: number | null;
  total_delta?: number | null;
  avg_delta?: number | null;
}

export interface NoteMesuree {
  note: number;
  /** `notes` : moyenne des vraies notes ; `estimation` : tirée des anciens votes. */
  source: 'notes' | 'estimation';
  /** Nombre de notes (ou de votes) derrière le chiffre. */
  echantillon: number;
}

const borner = (n: number) => Math.min(NOTE_MAX, Math.max(NOTE_MIN, n));

export function noteMesuree(s: CompteursEnonce): NoteMesuree | null {
  const notes = Number(s.notes_count ?? 0);
  if (notes >= NOTES_MIN_COMPARAISON) {
    return { note: borner(Number(s.notes_total ?? 0) / notes), source: 'notes', echantillon: notes };
  }

  const votes = Number(s.votes_count ?? 0);
  if (votes >= NOTES_MIN_COMPARAISON) {
    const delta = s.avg_delta ?? Number(s.total_delta ?? 0) / votes;
    return { note: borner(NOTE_DEPART + Number(delta)), source: 'estimation', echantillon: votes };
  }

  return null;
}
