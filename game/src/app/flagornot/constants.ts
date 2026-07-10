/**
 * Types and constants for the Flag or Not game.
 */

export type GamePhase = 'gender-select' | 'idle' | 'loading' | 'reveal';

export interface JudgmentResult {
  verdict: 'red' | 'green';
  justification: string;
  persisted?: boolean;
  persistenceWarning?: string;
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

export const LOADING_PHRASES: string[] = [
  'Analyse en cours… 🔍',
  'Hmm, laisse-moi réfléchir… 🤔',
  'Consultation du tribunal des flags… ⚖️',
  "C'est chaud là, je calcule… 🔥",
  'Le verdict arrive… 🧠',
  "L'Oracle délibère… ⏳",
  'Ça sent le flag… 👃',
  'Analyse comportementale en cours… 🔮',
];

export const PLACEHOLDERS: string[] = [
  '"Il regarde ton téléphone…"',
  '"Elle te dit je t\'aime en premier…"',
  '"Il met 3 jours à répondre…"',
  '"Elle se souvient de ton plat préféré…"',
  '"Il parle de son ex au 1er date…"',
  '"Elle te prépare des surprises…"',
  '"Il te follow/unfollow sur Insta…"',
  '"Elle rit à toutes tes blagues…"',
];

export const MIN_LOADING_MS = 900;
