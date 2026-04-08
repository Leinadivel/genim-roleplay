export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          role: 'learner' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: 'learner' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: 'learner' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      scenarios: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          industry: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          objective: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          industry?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          objective?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          industry?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          objective?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      buyer_personas: {
        Row: {
          id: string
          scenario_id: string
          name: string
          title: string | null
          company_name: string | null
          company_size: string | null
          tone: string | null
          background: string | null
          hidden_pain_points: Json
          common_objections: Json
          goals: Json
          constraints: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scenario_id: string
          name: string
          title?: string | null
          company_name?: string | null
          company_size?: string | null
          tone?: string | null
          background?: string | null
          hidden_pain_points?: Json
          common_objections?: Json
          goals?: Json
          constraints?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          scenario_id?: string
          name?: string
          title?: string | null
          company_name?: string | null
          company_size?: string | null
          tone?: string | null
          background?: string | null
          hidden_pain_points?: Json
          common_objections?: Json
          goals?: Json
          constraints?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'buyer_personas_scenario_id_fkey'
            columns: ['scenario_id']
            isOneToOne: false
            referencedRelation: 'scenarios'
            referencedColumns: ['id']
          },
        ]
      }

      scoring_rubrics: {
        Row: {
          id: string
          scenario_id: string
          name: string
          description: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scenario_id: string
          name: string
          description?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          scenario_id?: string
          name?: string
          description?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'scoring_rubrics_scenario_id_fkey'
            columns: ['scenario_id']
            isOneToOne: false
            referencedRelation: 'scenarios'
            referencedColumns: ['id']
          },
        ]
      }

      scoring_rubric_items: {
        Row: {
          id: string
          rubric_id: string
          category_key: string
          category_label: string
          max_score: number
          weight: number
          sort_order: number
          guidance: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rubric_id: string
          category_key: string
          category_label: string
          max_score: number
          weight?: number
          sort_order?: number
          guidance?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rubric_id?: string
          category_key?: string
          category_label?: string
          max_score?: number
          weight?: number
          sort_order?: number
          guidance?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'scoring_rubric_items_rubric_id_fkey'
            columns: ['rubric_id']
            isOneToOne: false
            referencedRelation: 'scoring_rubrics'
            referencedColumns: ['id']
          },
        ]
      }

      roleplay_sessions: {
        Row: {
          id: string
          user_id: string
          scenario_id: string
          buyer_persona_id: string | null
          rubric_id: string | null
          mode: 'voice' | 'text'
          status: 'draft' | 'live' | 'completed' | 'evaluated' | 'failed'
          started_at: string | null
          ended_at: string | null
          duration_seconds: number | null
          transcript_text: string | null
          summary: string | null
          overall_score: number | null
          strengths: Json
          improvements: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scenario_id: string
          buyer_persona_id?: string | null
          rubric_id?: string | null
          mode?: 'voice' | 'text'
          status?: 'draft' | 'live' | 'completed' | 'evaluated' | 'failed'
          started_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
          transcript_text?: string | null
          summary?: string | null
          overall_score?: number | null
          strengths?: Json
          improvements?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scenario_id?: string
          buyer_persona_id?: string | null
          rubric_id?: string | null
          mode?: 'voice' | 'text'
          status?: 'draft' | 'live' | 'completed' | 'evaluated' | 'failed'
          started_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
          transcript_text?: string | null
          summary?: string | null
          overall_score?: number | null
          strengths?: Json
          improvements?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'roleplay_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'roleplay_sessions_scenario_id_fkey'
            columns: ['scenario_id']
            isOneToOne: false
            referencedRelation: 'scenarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'roleplay_sessions_buyer_persona_id_fkey'
            columns: ['buyer_persona_id']
            isOneToOne: false
            referencedRelation: 'buyer_personas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'roleplay_sessions_rubric_id_fkey'
            columns: ['rubric_id']
            isOneToOne: false
            referencedRelation: 'scoring_rubrics'
            referencedColumns: ['id']
          },
        ]
      }

      session_messages: {
        Row: {
          id: string
          session_id: string
          speaker: 'user' | 'assistant' | 'system'
          message_text: string
          turn_index: number
          started_at: string | null
          ended_at: string | null
          audio_url: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          speaker: 'user' | 'assistant' | 'system'
          message_text: string
          turn_index: number
          started_at?: string | null
          ended_at?: string | null
          audio_url?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          speaker?: 'user' | 'assistant' | 'system'
          message_text?: string
          turn_index?: number
          started_at?: string | null
          ended_at?: string | null
          audio_url?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_messages_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'roleplay_sessions'
            referencedColumns: ['id']
          },
        ]
      }

      session_scores: {
        Row: {
          id: string
          session_id: string
          rubric_item_id: string | null
          category_key: string
          category_label: string
          score: number
          max_score: number
          feedback: string | null
          evidence: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          rubric_item_id?: string | null
          category_key: string
          category_label: string
          score?: number
          max_score?: number
          feedback?: string | null
          evidence?: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          rubric_item_id?: string | null
          category_key?: string
          category_label?: string
          score?: number
          max_score?: number
          feedback?: string | null
          evidence?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_scores_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'roleplay_sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_scores_rubric_item_id_fkey'
            columns: ['rubric_item_id']
            isOneToOne: false
            referencedRelation: 'scoring_rubric_items'
            referencedColumns: ['id']
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