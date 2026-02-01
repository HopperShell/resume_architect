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
      [key: string]: {
        Row: { [key: string]: any }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
      }
    }
    Views: {
      [key: string]: {
        Row: { [key: string]: any }
      }
    }
    Functions: {
      [key: string]: {
        Args: { [key: string]: any }
        Returns: any
      }
    }
    Enums: {
      [key: string]: string[]
    }
  }
  resume_architect: {
    Tables: {
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'free' | 'premium' | 'enterprise'
          active: boolean
          created_at: string
          expires_at: string | null
          resume_count: number
          max_resumes_per_week: number
          canceled: boolean
        }
        Insert: {
          id?: string
          user_id: string
          tier?: 'free' | 'premium' | 'enterprise'
          active?: boolean
          created_at?: string
          expires_at?: string | null
          resume_count?: number
          max_resumes_per_week?: number
          canceled?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'free' | 'premium' | 'enterprise'
          active?: boolean
          created_at?: string
          expires_at?: string | null
          resume_count?: number
          max_resumes_per_week?: number
          canceled?: boolean
        }
      }
      resume_artifacts: {
        Row: {
          id: string
          user_id: string
          title: string
          html_content: string
          pdf_path: string | null
          job_posting: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          html_content: string
          pdf_path?: string | null
          job_posting: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          html_content?: string
          pdf_path?: string | null
          job_posting?: string
          created_at?: string
        }
      }
    }
    Views: {
      [key: string]: {
        Row: { [key: string]: any }
      }
    }
    Functions: {
      [key: string]: {
        Args: { [key: string]: any }
        Returns: any
      }
    }
    Enums: {
      [key: string]: string[]
    }
  }
}