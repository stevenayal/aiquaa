import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript (opcional)
export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: number
          nombre: string | null
          email: string
          rol: string
          creado_en: string
        }
        Insert: {
          id?: number
          nombre?: string | null
          email: string
          rol?: string
          creado_en?: string
        }
        Update: {
          id?: number
          nombre?: string | null
          email?: string
          rol?: string
          creado_en?: string
        }
      }
      feedbacks: {
        Row: {
          id: number
          usuario_id: number | null
          temas_qa: string
          herramientas: string
          participacion: string | null
          formato: string | null
          sugerencias: string | null
          session_id: string | null
          user_agent: string | null
          ip: string | null
          pais: string | null
          otros_temas: string | null
          otras_herramientas: string | null
          creado_en: string
        }
        Insert: {
          id?: number
          usuario_id?: number | null
          temas_qa: string
          herramientas: string
          participacion?: string | null
          formato?: string | null
          sugerencias?: string | null
          session_id?: string | null
          user_agent?: string | null
          ip?: string | null
          pais?: string | null
          otros_temas?: string | null
          otras_herramientas?: string | null
          creado_en?: string
        }
        Update: {
          id?: number
          usuario_id?: number | null
          temas_qa?: string
          herramientas?: string
          participacion?: string | null
          formato?: string | null
          sugerencias?: string | null
          session_id?: string | null
          user_agent?: string | null
          ip?: string | null
          pais?: string | null
          otros_temas?: string | null
          otras_herramientas?: string | null
          creado_en?: string
        }
      }
      comments: {
        Row: {
          id: number
          name: string
          message: string
          is_anonymous: boolean
          user_agent: string | null
          ip: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          message: string
          is_anonymous?: boolean
          user_agent?: string | null
          ip?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          message?: string
          is_anonymous?: boolean
          user_agent?: string | null
          ip?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 