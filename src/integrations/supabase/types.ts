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
      nhl_match_events: {
        Row: {
          assist1: string | null
          assist2: string | null
          created_at: string
          event_time: string | null
          event_type: string | null
          id: string
          match_id: string | null
          period: number | null
          scorer: string
          team: string
        }
        Insert: {
          assist1?: string | null
          assist2?: string | null
          created_at?: string
          event_time?: string | null
          event_type?: string | null
          id?: string
          match_id?: string | null
          period?: number | null
          scorer: string
          team: string
        }
        Update: {
          assist1?: string | null
          assist2?: string | null
          created_at?: string
          event_time?: string | null
          event_type?: string | null
          id?: string
          match_id?: string | null
          period?: number | null
          scorer?: string
          team?: string
        }
        Relationships: [
          {
            foreignKeyName: "nhl_match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "nhl_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      nhl_matches: {
        Row: {
          away_score: number | null
          away_team: string
          created_at: string
          home_score: number | null
          home_team: string
          id: string
          match_date: string
          match_time: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team: string
          created_at?: string
          home_score?: number | null
          home_team: string
          id?: string
          match_date: string
          match_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team?: string
          created_at?: string
          home_score?: number | null
          home_team?: string
          id?: string
          match_date?: string
          match_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      nhl_players: {
        Row: {
          assists: number | null
          created_at: string
          games_played: number | null
          goals: number | null
          id: string
          name: string
          position: string | null
          team_abbreviation: string
          updated_at: string
        }
        Insert: {
          assists?: number | null
          created_at?: string
          games_played?: number | null
          goals?: number | null
          id?: string
          name: string
          position?: string | null
          team_abbreviation: string
          updated_at?: string
        }
        Update: {
          assists?: number | null
          created_at?: string
          games_played?: number | null
          goals?: number | null
          id?: string
          name?: string
          position?: string | null
          team_abbreviation?: string
          updated_at?: string
        }
        Relationships: []
      }
      nhl_teams: {
        Row: {
          abbreviation: string
          created_at: string
          division: string | null
          goals_against: number | null
          goals_for: number | null
          id: string
          logo: string | null
          losses: number | null
          name: string
          otl: number | null
          updated_at: string
          wins: number | null
        }
        Insert: {
          abbreviation: string
          created_at?: string
          division?: string | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          logo?: string | null
          losses?: number | null
          name: string
          otl?: number | null
          updated_at?: string
          wins?: number | null
        }
        Update: {
          abbreviation?: string
          created_at?: string
          division?: string | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          logo?: string | null
          losses?: number | null
          name?: string
          otl?: number | null
          updated_at?: string
          wins?: number | null
        }
        Relationships: []
      }
      sheet_settings: {
        Row: {
          created_at: string
          id: string
          last_sync_at: string | null
          sheet_id: string
          sheet_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          sheet_id: string
          sheet_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          sheet_id?: string
          sheet_name?: string | null
          updated_at?: string
        }
        Relationships: []
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
