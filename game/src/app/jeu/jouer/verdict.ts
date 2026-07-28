/**
 * @module jeu/jouer/verdict
 * Échelle de gravité et verdicts de tour.
 *
 * Le malentendu central du jeu était binaire : les joueurs cherchaient « le red
 * flag » parmi les propositions, et se bloquaient quand aucune ne leur semblait
 * en être un. Rien dans l'interface ne disait que ces comportements sont rangés
 * sur un **continuum** de gravité, où le pire est toujours relatif aux autres.
 *
 * D'où cette échelle : au dépouillement, les propositions sont teintées du rouge
 * (le plus mal supporté du lot) au vert (le plus toléré). La question « lequel
 * est le pire ? » devient alors visiblement légitime, même entre quatre
 * comportements anodins.
 */

import type { VoteResult } from '@/types/game';

/** Rouge (position 0, le pire du tour) → vert (le plus toléré). */
const SEVERITY_RAMP = ['#FF2D55', '#FB7185', '#FBBF24', '#4ADE80'];

export const ACCENT = '#FF2D55';

export function severityColor(position: number, total: number): string {
  if (total <= 1) return SEVERITY_RAMP[0];
  const ratio = position / (total - 1);
  const index = Math.round(ratio * (SEVERITY_RAMP.length - 1));
  return SEVERITY_RAMP[Math.min(SEVERITY_RAMP.length - 1, Math.max(0, index))];
}

export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

/** Étiquette de position au dépouillement. */
export function positionLabel(position: number, total: number): string {
  if (position === 0) return 'LE PIRE';
  if (position === total - 1) return 'LE PLUS TOLÉRÉ';
  return `N°${position + 1}`;
}

export interface RoundVerdict {
  title: string;
  subtitle: string;
  tone: 'hit' | 'near' | 'miss';
}

/**
 * `position` : rang du choix du joueur dans le classement de la communauté,
 * 0 étant le comportement le plus mal supporté.
 */
export function roundVerdict(position: number, total: number, agreement: number): RoundVerdict {
  if (position === 0) {
    return {
      title: 'DANS LE MILLE',
      subtitle: `La communauté aussi désigne celui-là. ${agreement}% d'accord avec toi.`,
      tone: 'hit',
    };
  }

  if (position === 1) {
    return {
      title: 'À UN CHEVEU',
      subtitle: 'Il y avait pire, mais de peu. Ton choix arrive juste derrière.',
      tone: 'near',
    };
  }

  if (position === total - 1) {
    return {
      title: 'TOTALEMENT À CONTRE-COURANT',
      subtitle: 'Tu as désigné celui que les autres supportent le mieux. Assume.',
      tone: 'miss',
    };
  }

  return {
    title: 'PAS TOUT À FAIT',
    subtitle: `Ton choix arrive ${position + 1}ᵉ sur ${total} chez les autres joueurs.`,
    tone: 'miss',
  };
}

/**
 * Ordonne les propositions du tour selon le classement de la communauté.
 * Renvoie l'ordre d'affichage inchangé si le classement est indisponible — mieux
 * vaut ne pas dépouiller que dépouiller au hasard.
 */
export function orderByRanking<T extends { id: string }>(
  elements: T[],
  ranking: NonNullable<VoteResult['ranking']>,
): T[] {
  if (!ranking.length) return elements;
  const position = new Map(ranking.map((entry, index) => [entry.id, index]));
  return [...elements].sort(
    (a, b) => (position.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (position.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  );
}
