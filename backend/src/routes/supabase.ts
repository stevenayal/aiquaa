import express from 'express'
import { supabase } from '../lib/supabase'

const router = express.Router()

// Obtener todos los feedbacks desde Supabase
router.get('/feedbacks', async (req, res) => {
  try {
    const { data: feedbacks, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('creado_en', { ascending: false })

    if (error) {
      console.error('Error fetching feedbacks:', error)
      return res.status(500).json({ error: 'Error al obtener los feedbacks' })
    }

    res.json(feedbacks)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener todos los comentarios desde Supabase
router.get('/comments', async (req, res) => {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error)
      return res.status(500).json({ error: 'Error al obtener los comentarios' })
    }

    res.json(comments)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Crear un nuevo comentario en Supabase
router.post('/comments', async (req, res) => {
  try {
    const { name, message, isAnonymous, userAgent, ip } = req.body

    if (!name || !message) {
      return res.status(400).json({ error: 'Nombre y mensaje son requeridos' })
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        name,
        message,
        is_anonymous: isAnonymous || false,
        user_agent: userAgent || null,
        ip: ip || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return res.status(500).json({ error: 'Error al crear el comentario' })
    }

    res.status(201).json(comment)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener estadísticas de feedback
router.get('/stats/feedback', async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .from('feedbacks')
      .select('temas_qa, herramientas, participacion, formato, creado_en')

    if (error) {
      console.error('Error fetching feedback stats:', error)
      return res.status(500).json({ error: 'Error al obtener estadísticas' })
    }

    // Procesar estadísticas
    const processedStats = {
      totalFeedbacks: stats.length,
      temasQA: {} as Record<string, number>,
      herramientas: {} as Record<string, number>,
      participacion: {} as Record<string, number>,
      formato: {} as Record<string, number>,
      ultimos7Dias: 0
    }

    const sieteDiasAtras = new Date()
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7)

    stats.forEach(feedback => {
      // Contar temas QA
      feedback.temas_qa?.split(', ').forEach((tema: string) => {
        processedStats.temasQA[tema] = (processedStats.temasQA[tema] || 0) + 1
      })

      // Contar herramientas
      feedback.herramientas?.split(', ').forEach((herramienta: string) => {
        processedStats.herramientas[herramienta] = (processedStats.herramientas[herramienta] || 0) + 1
      })

      // Contar participación
      if (feedback.participacion) {
        processedStats.participacion[feedback.participacion] = (processedStats.participacion[feedback.participacion] || 0) + 1
      }

      // Contar formato
      if (feedback.formato) {
        processedStats.formato[feedback.formato] = (processedStats.formato[feedback.formato] || 0) + 1
      }

      // Contar últimos 7 días
      if (new Date(feedback.creado_en) > sieteDiasAtras) {
        processedStats.ultimos7Dias++
      }
    })

    res.json(processedStats)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router 