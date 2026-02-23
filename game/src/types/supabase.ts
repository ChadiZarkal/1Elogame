export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_sessions: {
        Row: {
          age: string | null
          ai_requests: number
          category: string | null
          choices_before_quit: number
          created_at: string | null
          duration: number
          flushed_at: number
          game_entries: Json
          id: string
          page_views: string[]
          session_id: string
          sex: string | null
          started_at: number
          votes: number
        }
        Insert: {
          age?: string | null
          ai_requests?: number
          category?: string | null
          choices_before_quit?: number
          created_at?: string | null
          duration?: number
          flushed_at: number
          game_entries?: Json
          id?: string
          page_views?: string[]
          session_id: string
          sex?: string | null
          started_at: number
          votes?: number
        }
        Update: {
          age?: string | null
          ai_requests?: number
          category?: string | null
          choices_before_quit?: number
          created_at?: string | null
          duration?: number
          flushed_at?: number
          game_entries?: Json
          id?: string
          page_views?: string[]
          session_id?: string
          sex?: string | null
          started_at?: number
          votes?: number
        }
        Relationships: []
      }
      duel_feedback: {
        Row: {
          element_a_id: string
          element_b_id: string
          id: string
          stars_count: number | null
          thumbs_down_count: number | null
          thumbs_up_count: number | null
          updated_at: string | null
        }
        Insert: {
          element_a_id: string
          element_b_id: string
          id?: string
          stars_count?: number | null
          thumbs_down_count?: number | null
          thumbs_up_count?: number | null
          updated_at?: string | null
        }
        Update: {
          element_a_id?: string
          element_b_id?: string
          id?: string
          stars_count?: number | null
          thumbs_down_count?: number | null
          thumbs_up_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duel_feedback_element_a_id_fkey"
            columns: ["element_a_id"]
            isOneToOne: false
            referencedRelation: "elements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_feedback_element_b_id_fkey"
            columns: ["element_b_id"]
            isOneToOne: false
            referencedRelation: "elements"
            referencedColumns: ["id"]
          },
        ]
      }
      elements: {
        Row: {
          actif: boolean | null
          categorie: string
          created_at: string | null
          elo_16_18: number | null
          elo_19_22: number | null
          elo_23_26: number | null
          elo_27plus: number | null
          elo_autre: number | null
          elo_femme: number | null
          elo_global: number | null
          elo_homme: number | null
          elo_nonbinaire: number | null
          id: string
          nb_participations: number | null
          niveau_provocation: number | null
          texte: string
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          categorie: string
          created_at?: string | null
          elo_16_18?: number | null
          elo_19_22?: number | null
          elo_23_26?: number | null
          elo_27plus?: number | null
          elo_autre?: number | null
          elo_femme?: number | null
          elo_global?: number | null
          elo_homme?: number | null
          elo_nonbinaire?: number | null
          id?: string
          nb_participations?: number | null
          niveau_provocation?: number | null
          texte: string
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          categorie?: string
          created_at?: string | null
          elo_16_18?: number | null
          elo_19_22?: number | null
          elo_23_26?: number | null
          elo_27plus?: number | null
          elo_autre?: number | null
          elo_femme?: number | null
          elo_global?: number | null
          elo_homme?: number | null
          elo_nonbinaire?: number | null
          id?: string
          nb_participations?: number | null
          niveau_provocation?: number | null
          texte?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      flagornot_submissions: {
        Row: {
          created_at: string | null
          id: string
          text: string
          verdict: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          text: string
          verdict: string
        }
        Update: {
          created_at?: string | null
          id?: string
          text?: string
          verdict?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          age_votant: string | null
          created_at: string | null
          element_gagnant_id: string
          element_perdant_id: string
          id: string
          sexe_votant: string | null
        }
        Insert: {
          age_votant?: string | null
          created_at?: string | null
          element_gagnant_id: string
          element_perdant_id: string
          id?: string
          sexe_votant?: string | null
        }
        Update: {
          age_votant?: string | null
          created_at?: string | null
          element_gagnant_id?: string
          element_perdant_id?: string
          id?: string
          sexe_votant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_element_gagnant_id_fkey"
            columns: ["element_gagnant_id"]
            isOneToOne: false
            referencedRelation: "elements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_element_perdant_id_fkey"
            columns: ["element_perdant_id"]
            isOneToOne: false
            referencedRelation: "elements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const