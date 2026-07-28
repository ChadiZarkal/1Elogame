// Game-specific types

import { SexeVotant, AgeVotant } from './database';

// Player profile (stored in LocalStorage)
export interface PlayerProfile {
  sex: SexeVotant;
  age: AgeVotant;
}

// Session data (stored in LocalStorage)
export interface GameSession {
  profile: PlayerProfile;
  seenDuels: string[];  // "id1-id2" format, sorted alphabetically
  streak: number;
  duelCount: number;
  /** Circular buffer of recent element IDs (for cooldown) */
  recentElementIds?: string[];
  /** Count of appearances per element this session (for max-appearances) */
  elementAppearances?: Record<string, number>;
}

/**
 * Un tour de jeu : les propositions parmi lesquelles le joueur doit désigner la
 * pire. Deux à quatre éléments — le jeu en sert quatre, l'API en accepte deux
 * pour les appelants historiques.
 */
export interface Duel {
  elements: ElementDTO[];
}

// Element DTO for client display (minimal data)
export interface ElementDTO {
  id: string;
  texte: string;
  categorie: string;
}

// Vote result for display
export interface VoteResult {
  winner: {
    id: string;
    percentage: number;
    participations: number;
    rank?: number; // Rang global dans le classement
    totalElements?: number; // Nombre total d'éléments
  };
  loser: {
    id: string;
    percentage: number;
    participations: number;
    rank?: number; // Rang global dans le classement
    totalElements?: number; // Nombre total d'éléments
  };
  streak: {
    matched: boolean;
    current: number;
  };
  /**
   * Les éléments du tour classés par la communauté, du plus red flag au moins
   * red flag. Vide quand les rangs ne sont pas calculables : c'est le signal
   * qu'il ne faut pas afficher de dépouillement.
   */
  ranking?: Array<{ id: string; rank?: number; totalElements?: number; percentage?: number }>;
  /** Accord moyen avec la communauté sur l'ensemble des duels du tour, en %. */
  agreement?: number;
  isOptimistic?: boolean; // true = données provisoires, en attente de l'API
}

// Feedback types
export type FeedbackType = 'star' | 'thumbs_up' | 'thumbs_down';

// Selection strategy for duel algorithm
export type SelectionStrategy = 'elo_close' | 'cross_category' | 'starred' | 'random';

// Dashboard statistics
export interface DashboardStats {
  totalVotes: number;
  activeElements: number;
  sessionsLast24h: number;
  avgDuelsPerSession: number;
  avgLatencyMs: number;
}

// Element rankings
export interface ElementRanking {
  id: string;
  texte: string;
  categorie: string;
  elo_global: number;
  nb_participations: number;
}
