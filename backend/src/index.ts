import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (_, res) => res.send('API Aiquaa funcionando 🚀'));

// Create user
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nombre, email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const user = await prisma.usuario.create({ 
      data: { nombre, email } 
    });
    
    res.json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'El email ya existe' });
    } else {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Get all users
app.get('/api/usuarios', async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      include: {
        feedbacks: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Save feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { 
      usuarioId, 
      temasQA, 
      herramientas, 
      participacion, 
      formato, 
      sugerencias,
      sessionId,
      userAgent,
      ip,
      pais,
      otrosTemas,
      otrasHerramientas
    } = req.body;

    const feedback = await prisma.feedback.create({
      data: {
        usuarioId: usuarioId || null,
        temasQA: Array.isArray(temasQA) ? JSON.stringify(temasQA) : temasQA,
        herramientas: Array.isArray(herramientas) ? JSON.stringify(herramientas) : herramientas,
        participacion,
        formato,
        sugerencias,
        sessionId,
        userAgent,
        ip,
        pais,
        otrosTemas,
        otrasHerramientas
      },
      include: {
        usuario: true
      }
    });
    
    res.json(feedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Get all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await prisma.feedback.findMany({
      include: {
        usuario: true
      },
      orderBy: {
        creadoEn: 'desc'
      }
    });
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Get feedback metrics
app.get('/api/feedback/metrics', async (req, res) => {
  try {
    const totalSubmissions = await prisma.feedback.count();
    
    // Get all feedback for analysis
    const allFeedback = await prisma.feedback.findMany();
    
    // Count topics
    const temasCount: Record<string, number> = {};
    allFeedback.forEach(item => {
      try {
        const temas = JSON.parse(item.temasQA);
        if (Array.isArray(temas)) {
          temas.forEach(tema => {
            temasCount[tema] = (temasCount[tema] || 0) + 1;
          });
        }
      } catch (e) {
        // If it's not JSON, treat as single string
        temasCount[item.temasQA] = (temasCount[item.temasQA] || 0) + 1;
      }
    });

    // Count tools
    const herramientasCount: Record<string, number> = {};
    allFeedback.forEach(item => {
      try {
        const herramientas = JSON.parse(item.herramientas);
        if (Array.isArray(herramientas)) {
          herramientas.forEach(herramienta => {
            herramientasCount[herramienta] = (herramientasCount[herramienta] || 0) + 1;
          });
        }
      } catch (e) {
        // If it's not JSON, treat as single string
        herramientasCount[item.herramientas] = (herramientasCount[item.herramientas] || 0) + 1;
      }
    });

    // Count participation types
    const participacionCount: Record<string, number> = {};
    allFeedback.forEach(item => {
      if (item.participacion) {
        participacionCount[item.participacion] = (participacionCount[item.participacion] || 0) + 1;
      }
    });

    // Count formats
    const formatosCount: Record<string, number> = {};
    allFeedback.forEach(item => {
      if (item.formato) {
        formatosCount[item.formato] = (formatosCount[item.formato] || 0) + 1;
      }
    });

    // Count submissions by date
    const dateCount: Record<string, number> = {};
    allFeedback.forEach(item => {
      const date = new Date(item.creadoEn).toLocaleDateString('es-PY');
      dateCount[date] = (dateCount[date] || 0) + 1;
    });

    // Get common suggestions (non-empty)
    const suggestions = allFeedback
      .map(item => item.sugerencias)
      .filter(suggestion => suggestion && suggestion.trim().length > 0);

    const metrics = {
      totalSubmissions,
      topTemasQA: Object.entries(temasCount)
        .map(([tema, count]) => ({ tema, count }))
        .sort((a, b) => b.count - a.count),
      topHerramientas: Object.entries(herramientasCount)
        .map(([herramienta, count]) => ({ herramienta, count }))
        .sort((a, b) => b.count - a.count),
      topParticipacion: Object.entries(participacionCount)
        .map(([tipo, count]) => ({ tipo, count }))
        .sort((a, b) => b.count - a.count),
      topFormatos: Object.entries(formatosCount)
        .map(([formato, count]) => ({ formato, count }))
        .sort((a, b) => b.count - a.count),
      submissionsByDate: Object.entries(dateCount)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      commonSuggestions: suggestions
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error calculating metrics:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Community comments endpoints
app.post('/api/comments', async (req, res) => {
  try {
    const { name, message, isAnonymous } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const comment = await prisma.comment.create({
      data: {
        name: isAnonymous ? 'Anónimo' : (name || 'Usuario'),
        message: message.trim(),
        isAnonymous: isAnonymous || false,
        userAgent: req.headers['user-agent'] || '',
        ip: req.ip || req.connection.remoteAddress || ''
      }
    });
    
    res.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/comments', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to last 50 comments
    });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`)); 