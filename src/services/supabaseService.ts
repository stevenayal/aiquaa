import { supabase } from '../lib/supabase'

export interface FeedbackData {
  nombre?: string
  temasQA: string[]
  herramientas: string[]
  participacion?: string
  formato?: string
  sugerencias?: string
  userAgent?: string
  sessionId?: string
  ip?: string
  pais?: string
  otrosTemas?: string
  otrasHerramientas?: string
}

export interface CommentData {
  name: string
  message: string
  isAnonymous?: boolean
  userAgent?: string
  ip?: string
}

export const supabaseService = {
  // Feedback methods
  async submitFeedback(data: FeedbackData) {
    const { data: feedback, error } = await supabase
      .from('feedbacks')
      .insert({
        nombre: data.nombre || null,
        temas_qa: data.temasQA.join(', '),
        herramientas: data.herramientas.join(', '),
        participacion: data.participacion || null,
        formato: data.formato || null,
        sugerencias: data.sugerencias || null,
        session_id: data.sessionId || null,
        user_agent: data.userAgent || null,
        ip: data.ip || null,
        pais: data.pais || null,
        otros_temas: data.otrosTemas || null,
        otras_herramientas: data.otrasHerramientas || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error submitting feedback:', error)
      throw new Error('Error al enviar el feedback')
    }

    return feedback
  },

  async getFeedbacks() {
    const { data: feedbacks, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('creado_en', { ascending: false })

    if (error) {
      console.error('Error fetching feedbacks:', error)
      throw new Error('Error al obtener los feedbacks')
    }

    return feedbacks
  },

  // Comment methods
  async submitComment(data: CommentData) {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        name: data.name,
        message: data.message,
        is_anonymous: data.isAnonymous || false,
        user_agent: data.userAgent || null,
        ip: data.ip || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error submitting comment:', error)
      throw new Error('Error al enviar el comentario')
    }

    return comment
  },

  async getComments() {
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error)
      throw new Error('Error al obtener los comentarios')
    }

    return comments
  },

  // User methods
  async createUser(userData: { email: string; nombre?: string; rol?: string }) {
    const { data: user, error } = await supabase
      .from('usuarios')
      .insert({
        email: userData.email,
        nombre: userData.nombre || null,
        rol: userData.rol || 'comunidad'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw new Error('Error al crear el usuario')
    }

    return user
  },

  async getUserByEmail(email: string) {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user:', error)
      throw new Error('Error al obtener el usuario')
    }

    return user
  },

  // Analytics methods
  async getFeedbackStats() {
    const { data: stats, error } = await supabase
      .from('feedbacks')
      .select('temas_qa, herramientas, participacion, formato')

    if (error) {
      console.error('Error fetching feedback stats:', error)
      throw new Error('Error al obtener estadísticas')
    }

    return stats
  },

  async getCommentsStats() {
    const { data: stats, error } = await supabase
      .from('comments')
      .select('is_anonymous, created_at')

    if (error) {
      console.error('Error fetching comment stats:', error)
      throw new Error('Error al obtener estadísticas de comentarios')
    }

    return stats
  }
} 