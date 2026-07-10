// Database types for Supabase

// Catégories disponibles - 3 catégories 2026
// IMPORTANT: Doit correspondre aux clés dans src/config/categories.ts
export type Categorie = 
  | 'sexe'      // Sexe & Kinks - relations, dating, intimité, flirt
  | 'quotidien' // Quotidien - comportements et habitudes du quotidien
  | 'metiers';  // Métiers - comportements et attitudes au travail, professions

export type SexeVotant = 'homme' | 'femme' | 'autre';

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
  nb_participations_homme: number;
  nb_participations_femme: number;
  nb_participations_autre: number;
  nb_participations_16_18: number;
  nb_participations_19_22: number;
  nb_participations_23_26: number;
  nb_participations_27plus: number;
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

export interface FlashFlagTest {
  id: string;
  name: string;
  description: string | null;
  is_standard: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FlashFlagQuestion {
  id: string;
  test_id: string;
  position: number;
  question_text: string;
  time_limit_sec: number;
  created_at: string;
}

export interface FlashFlagOption {
  id: string;
  question_id: string;
  position: number;
  option_text: string;
  score: 0 | 1 | 2;
  created_at: string;
}

export interface FlashFlagSession {
  id: string;
  access_code: string;
  mode: 'local' | 'link';
  source_type: 'standard' | 'custom';
  test_id: string | null;
  custom_payload: unknown | null;
  subject_sex: SexeVotant;
  subject_age: number;
  status: 'pending' | 'in_progress' | 'completed';
  total_score: number;
  max_score: number;
  answered_count: number;
  timed_out_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface FlashFlagAnswer {
  id: string;
  session_id: string;
  question_index: number;
  question_text: string;
  selected_option: string | null;
  selected_score: 0 | 1 | 2;
  timed_out: boolean;
  time_spent_ms: number;
  created_at: string;
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
          nb_participations_homme?: number;
          nb_participations_femme?: number;
          nb_participations_autre?: number;
          nb_participations_16_18?: number;
          nb_participations_19_22?: number;
          nb_participations_23_26?: number;
          nb_participations_27plus?: number;
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
      flashflag_tests: {
        Row: FlashFlagTest;
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_standard?: boolean;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<FlashFlagTest, 'id' | 'created_at'>>;
      };
      flashflag_questions: {
        Row: FlashFlagQuestion;
        Insert: {
          id?: string;
          test_id: string;
          position: number;
          question_text: string;
          time_limit_sec?: number;
          created_at?: string;
        };
        Update: Partial<Omit<FlashFlagQuestion, 'id' | 'test_id' | 'created_at'>>;
      };
      flashflag_options: {
        Row: FlashFlagOption;
        Insert: {
          id?: string;
          question_id: string;
          position: number;
          option_text: string;
          score: 0 | 1 | 2;
          created_at?: string;
        };
        Update: Partial<Omit<FlashFlagOption, 'id' | 'question_id' | 'created_at'>>;
      };
      flashflag_sessions: {
        Row: FlashFlagSession;
        Insert: {
          id?: string;
          access_code: string;
          mode: 'local' | 'link';
          source_type: 'standard' | 'custom';
          test_id?: string | null;
          custom_payload?: unknown | null;
          subject_sex: SexeVotant;
          subject_age: number;
          status?: 'pending' | 'in_progress' | 'completed';
          total_score?: number;
          max_score?: number;
          answered_count?: number;
          timed_out_count?: number;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<FlashFlagSession, 'id' | 'created_at'>>;
      };
      flashflag_answers: {
        Row: FlashFlagAnswer;
        Insert: {
          id?: string;
          session_id: string;
          question_index: number;
          question_text: string;
          selected_option?: string | null;
          selected_score?: 0 | 1 | 2;
          timed_out?: boolean;
          time_spent_ms?: number;
          created_at?: string;
        };
        Update: Partial<Omit<FlashFlagAnswer, 'id' | 'session_id' | 'created_at'>>;
      };
      flagornot_submissions: {
        Row: {
          id: string;
          text: string;
          verdict: 'red' | 'green';
          justification: string | null;
          gender: 'homme' | 'femme' | 'autre' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          verdict: 'red' | 'green';
          justification?: string | null;
          gender?: 'homme' | 'femme' | 'autre' | null;
          created_at?: string;
        };
        Update: Partial<{
          text: string;
          verdict: 'red' | 'green';
          justification: string | null;
          gender: 'homme' | 'femme' | 'autre' | null;
        }>;
      };
      analytics_sessions: {
        Row: {
          id: string;
          session_id: string;
          started_at: number;
          flushed_at: number;
          duration: number;
          page_views: string[];
          game_entries: unknown;
          votes: number;
          ai_requests: number;
          choices_before_quit: number;
          category: string | null;
          sex: string | null;
          age: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          started_at: number;
          flushed_at: number;
          duration?: number;
          page_views?: string[];
          game_entries?: unknown;
          votes?: number;
          ai_requests?: number;
          choices_before_quit?: number;
          category?: string | null;
          sex?: string | null;
          age?: string | null;
          created_at?: string | null;
        };
        Update: Partial<{
          session_id: string;
          started_at: number;
          flushed_at: number;
          duration: number;
          page_views: string[];
          game_entries: unknown;
          votes: number;
          ai_requests: number;
          choices_before_quit: number;
          category: string | null;
          sex: string | null;
          age: string | null;
        }>;
      };
    };
  };
}
