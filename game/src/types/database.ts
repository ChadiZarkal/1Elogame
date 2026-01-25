// Database types for Supabase

// Catégories disponibles - Nouvelles catégories 2026
// IMPORTANT: Doit correspondre aux clés dans src/config/categories.ts
export type Categorie = 
  | 'sexe'      // Sexe & Kinks - relations, dating, intimité
  | 'lifestyle' // Lifestyle - hobbies, passions, sport, activités
  | 'quotidien' // Quotidien - comportements et habitudes du quotidien
  | 'bureau'    // Bureau - comportements et attitudes au travail
  | string;     // Permet des catégories personnalisées

export type SexeVotant = 'homme' | 'femme' | 'nonbinaire' | 'autre';

export type AgeVotant = '16-18' | '19-22' | '23-26' | '27+';

export interface Element {
  id: string;
  texte: string;
  categorie: Categorie;
  niveau_provocation: 1 | 2 | 3 | 4;
  actif: boolean;
  
  // ELO Scores
  elo_global: number;
  elo_homme: number;
  elo_femme: number;
  elo_nonbinaire: number;
  elo_autre: number;
  elo_16_18: number;
  elo_19_22: number;
  elo_23_26: number;
  elo_27plus: number;
  
  nb_participations: number;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  element_gagnant_id: string;
  element_perdant_id: string;
  sexe_votant: SexeVotant;
  age_votant: AgeVotant;
  created_at: string;
}

export interface DuelFeedback {
  id: string;
  element_a_id: string;
  element_b_id: string;
  stars_count: number;
  thumbs_up_count: number;
  thumbs_down_count: number;
  updated_at: string;
}

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      elements: {
        Row: Element;
        Insert: Omit<Element, 'id' | 'created_at' | 'updated_at' | 'nb_participations' | 'elo_global' | 'elo_homme' | 'elo_femme' | 'elo_nonbinaire' | 'elo_autre' | 'elo_16_18' | 'elo_19_22' | 'elo_23_26' | 'elo_27plus'> & {
          elo_global?: number;
          elo_homme?: number;
          elo_femme?: number;
          elo_nonbinaire?: number;
          elo_autre?: number;
          elo_16_18?: number;
          elo_19_22?: number;
          elo_23_26?: number;
          elo_27plus?: number;
          nb_participations?: number;
        };
        Update: Partial<Omit<Element, 'id' | 'created_at'>>;
      };
      votes: {
        Row: Vote;
        Insert: Omit<Vote, 'id' | 'created_at'>;
        Update: Partial<Omit<Vote, 'id' | 'created_at'>>;
      };
      duel_feedback: {
        Row: DuelFeedback;
        Insert: Omit<DuelFeedback, 'id' | 'updated_at'>;
        Update: Partial<Omit<DuelFeedback, 'id'>>;
      };
    };
  };
}
