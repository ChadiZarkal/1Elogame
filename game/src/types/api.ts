// API request and response types

import { Duel, VoteResult, FeedbackType, DashboardStats, ElementRanking } from './game';
import { SexeVotant, AgeVotant, Element, Categorie } from './database';

// Generic API response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// GET /api/duel
export interface DuelRequest {
  seenDuels?: string; // Comma-separated "id1-id2" pairs
}

export type DuelResponse = ApiResponse<Duel>;

// POST /api/vote
export interface VoteRequest {
  winnerId: string;
  loserId: string;
  sexe: SexeVotant;
  age: AgeVotant;
}

export type VoteResponse = ApiResponse<VoteResult>;

// POST /api/feedback
export interface FeedbackRequest {
  elementAId: string;
  elementBId: string;
  type: FeedbackType;
}

export type FeedbackResponse = ApiResponse<{ success: boolean }>;

// GET /api/elements (admin)
export interface ElementsListRequest {
  page?: number;
  limit?: number;
  category?: Categorie;
  active?: boolean;
  search?: string;
}

export type ElementsListResponse = ApiResponse<Element[]> & {
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// POST /api/elements (admin)
export interface CreateElementRequest {
  texte: string;
  categorie: Categorie;
  niveau_provocation?: 1 | 2 | 3 | 4;
}

export type CreateElementResponse = ApiResponse<Element>;

// PUT /api/elements/:id (admin)
export interface UpdateElementRequest {
  texte?: string;
  categorie?: Categorie;
  niveau_provocation?: 1 | 2 | 3 | 4;
  actif?: boolean;
}

export type UpdateElementResponse = ApiResponse<Element>;

// GET /api/stats (admin)
export type StatsResponse = ApiResponse<DashboardStats>;

// GET /api/rankings (admin)
export interface RankingsRequest {
  type: 'red' | 'green';
  limit?: number;
  category?: Categorie;
  segment?: SexeVotant | AgeVotant;
}

export type RankingsResponse = ApiResponse<ElementRanking[]>;
