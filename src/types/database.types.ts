export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          working_hours_start: string
          working_hours_end: string
          working_days: string[]
          buffer_percentage: number
          theme: string
          notifications_push: boolean
          notifications_email: boolean
          quiet_hours_start: string | null
          quiet_hours_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          working_hours_start?: string
          working_hours_end?: string
          working_days?: string[]
          buffer_percentage?: number
          theme?: string
          notifications_push?: boolean
          notifications_email?: boolean
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          working_hours_start?: string
          working_hours_end?: string
          working_days?: string[]
          buffer_percentage?: number
          theme?: string
          notifications_push?: boolean
          notifications_email?: boolean
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      google_tokens: {
        Row: {
          id: string
          user_id: string
          access_token_encrypted: string
          refresh_token_encrypted: string
          token_expiry: string
          granted_scopes: string[]
          connection_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token_encrypted: string
          refresh_token_encrypted: string
          token_expiry: string
          granted_scopes?: string[]
          connection_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token_encrypted?: string
          refresh_token_encrypted?: string
          token_expiry?: string
          granted_scopes?: string[]
          connection_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      commitments: {
        Row: {
          id: string
          user_id: string
          title: string | null
          raw_input: string
          source_type: string
          type: string | null
          deadline: string | null
          status: string
          health_score: number | null
          importance: number
          stakeholders: Json | null
          metadata: Json | null
          tags: string[] | null
          confidence_score: number | null
          required_minutes: number | null
          available_minutes: number | null
          deadline_confidence: number | null
          risk_explanation: string | null
          completed_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          raw_input: string
          source_type?: string
          type?: string | null
          deadline?: string | null
          status?: string
          health_score?: number | null
          importance?: number
          stakeholders?: Json | null
          metadata?: Json | null
          tags?: string[] | null
          confidence_score?: number | null
          required_minutes?: number | null
          available_minutes?: number | null
          deadline_confidence?: number | null
          risk_explanation?: string | null
          completed_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          raw_input?: string
          source_type?: string
          type?: string | null
          deadline?: string | null
          status?: string
          health_score?: number | null
          importance?: number
          stakeholders?: Json | null
          metadata?: Json | null
          tags?: string[] | null
          confidence_score?: number | null
          required_minutes?: number | null
          available_minutes?: number | null
          deadline_confidence?: number | null
          risk_explanation?: string | null
          completed_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          commitment_id: string
          user_id: string
          title: string
          description: string | null
          estimated_minutes: number
          actual_minutes: number | null
          type: string
          execution_type: string
          classification: string | null
          rationale: string | null
          status: string
          sort_order: number
          scheduled_start: string | null
          scheduled_end: string | null
          google_calendar_event_id: string | null
          google_doc_id: string | null
          gmail_draft_id: string | null
          google_slides_id: string | null
          completed_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          commitment_id: string
          user_id: string
          title: string
          description?: string | null
          estimated_minutes: number
          actual_minutes?: number | null
          type: string
          execution_type: string
          classification?: string | null
          rationale?: string | null
          status?: string
          sort_order?: number
          scheduled_start?: string | null
          scheduled_end?: string | null
          google_calendar_event_id?: string | null
          google_doc_id?: string | null
          gmail_draft_id?: string | null
          google_slides_id?: string | null
          completed_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          commitment_id?: string
          user_id?: string
          title?: string
          description?: string | null
          estimated_minutes?: number
          actual_minutes?: number | null
          type?: string
          execution_type?: string
          classification?: string | null
          rationale?: string | null
          status?: string
          sort_order?: number
          scheduled_start?: string | null
          scheduled_end?: string | null
          google_calendar_event_id?: string | null
          google_doc_id?: string | null
          gmail_draft_id?: string | null
          google_slides_id?: string | null
          completed_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_dependencies: {
        Row: {
          id: string
          task_id: string
          depends_on_task_id: string
        }
        Insert: {
          id?: string
          task_id: string
          depends_on_task_id: string
        }
        Update: {
          id?: string
          task_id?: string
          depends_on_task_id?: string
        }
      }
      executions: {
        Row: {
          id: string
          user_id: string
          title: string
          raw_input: string
          source_type: string
          status: string
          created_at: string
          type: 'writing' | 'coding' | 'research' | 'admin' | 'creative' | 'meeting' | 'health' | 'learning' | 'unknown' | 'rescue'
          importance: number
          deadline: string | null
          available_minutes: number | null
          required_minutes: number | null
          recovered_minutes: number | null
          confidence_score: number | null
          risk_explanation: string | null
          constraints: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          raw_input: string
          source_type?: string
          status?: string
          created_at?: string
          type?: 'writing' | 'coding' | 'research' | 'admin' | 'creative' | 'meeting' | 'health' | 'learning' | 'unknown' | 'rescue'
          importance?: number
          deadline?: string | null
          available_minutes?: number | null
          required_minutes?: number | null
          recovered_minutes?: number | null
          confidence_score?: number | null
          risk_explanation?: string | null
          constraints?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          raw_input?: string
          source_type?: string
          status?: string
          created_at?: string
          type?: 'writing' | 'coding' | 'research' | 'admin' | 'creative' | 'meeting' | 'health' | 'learning' | 'unknown' | 'rescue'
          importance?: number
          deadline?: string | null
          available_minutes?: number | null
          required_minutes?: number | null
          recovered_minutes?: number | null
          confidence_score?: number | null
          risk_explanation?: string | null
          constraints?: string[] | null
        }
      }
      nexus_items: {
        Row: {
          id: string
          user_id: string
          commitment_id: string | null
          execution_id: string | null
          type: string
          title: string
          details: string | null
          link: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          commitment_id?: string | null
          execution_id?: string | null
          type: string
          title: string
          details?: string | null
          link?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          commitment_id?: string | null
          execution_id?: string | null
          type?: string
          title?: string
          details?: string | null
          link?: string | null
          status?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          commitment_id: string
          agent: 'breakdown' | 'scheduling' | 'planner' | 'maker' | 'recovery' | 'calendar'
          action_type: 'decompose' | 'estimate' | 'schedule' | 'plan' | 'generate_artifact' | 'recover' | 'calendar_connect' | 'calendar_create' | 'calendar_fallback'
          status: string
          input_data: Json
          output_data: Json
          created_at: string
          error_message: string | null
        }
        Insert: {
          id?: string
          user_id: string
          commitment_id: string
          agent: 'breakdown' | 'scheduling' | 'planner' | 'maker' | 'recovery' | 'calendar'
          action_type: 'decompose' | 'estimate' | 'schedule' | 'plan' | 'generate_artifact' | 'recover' | 'calendar_connect' | 'calendar_create' | 'calendar_fallback'
          status: string
          input_data: Json
          output_data: Json
          created_at?: string
          error_message?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          commitment_id?: string
          agent?: 'breakdown' | 'scheduling' | 'planner' | 'maker' | 'recovery' | 'calendar'
          action_type?: 'decompose' | 'estimate' | 'schedule' | 'plan' | 'generate_artifact' | 'recover' | 'calendar_connect' | 'calendar_create' | 'calendar_fallback'
          status?: string
          input_data?: Json
          output_data?: Json
          created_at?: string
          error_message?: string | null
        }
      }
      artifacts: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          type: string
          title: string
          content: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          type: string
          title: string
          content?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          type?: string
          title?: string
          content?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
