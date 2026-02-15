// Game-specific types

import { SexeVotant, AgeVotant, Element } from './database';

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
}

// Duel for game display
export interface Duel {
  elementA: ElementDTO;
  elementB: ElementDTO;
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
  isOptimistic?: boolean; // true = données provisoires, en attente de l'API
}

// Feedback types
export type FeedbackType = 'star' | 'thumbs_up' | 'thumbs_down';

// Selection strategy for duel algorithm
export type SelectionStrategy = 'elo_close' | 'cross_category' | 'starred' | 'random';

// Admin element with full details (alias for Element with potential extensions)
export type ElementAdmin = Element & {
  // Computed fields can be added here
  winRate?: number;
};

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
