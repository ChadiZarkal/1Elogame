/**
 * Types and constants for the Flag or Not game.
 */

export type GamePhase = 'profile-select' | 'idle' | 'loading' | 'reveal';

export type FlagOrNotGender = 'homme' | 'femme' | 'autre';
export type FlagOrNotAge = '16-18' | '19-22' | '23-26' | '27+';

export interface JudgmentResult {
  verdict: 'red' | 'green';
  justification: string;
  persisted?: boolean;
  persistenceWarning?: string;
  /** Aucune analyse n'a eu lieu : l'appel a échoué ou expiré. L'écran de
   *  révélation doit le dire plutôt que de laisser passer le repli pour un
   *  verdict, et proposer de relancer. */
  degraded?: boolean;
}

export interface HistoryItem extends JudgmentResult {
  text: string;
}

export interface CommunitySubmission {
  id: string;
  text: string;
  verdict: 'red' | 'green';
  emoji: string;
  timeAgo: string;
}

export const FALLBACK_SUGGESTIONS = [
  { emoji: '📱', text: 'Il regarde ton téléphone' },
  { emoji: '☀️', text: 'Elle te dit bonjour chaque matin' },
  { emoji: '❤️', text: 'Il like les photos de son ex' },
  { emoji: '☕', text: 'Elle te prépare un café' },
  { emoji: '❌', text: 'Il annule au dernier moment' },
  { emoji: '👋', text: 'Elle te présente à ses amis' },
  { emoji: '🔇', text: 'Il répond pas pendant 3h' },
  { emoji: '🎁', text: 'Elle te fait des surprises' },
  { emoji: '👀', text: 'Il check tes stories en premier' },
  { emoji: '🧠', text: 'Elle se souvient de tes goûts' },
  { emoji: '🚪', text: 'Il part sans dire au revoir' },
  { emoji: '💬', text: 'Elle prend de tes nouvelles' },
];

/* Les phrases de chargement et les exemples du champ de saisie vivent dans
 * `textes.ts`, en français et en anglais. */

export const MIN_LOADING_MS = 900;
