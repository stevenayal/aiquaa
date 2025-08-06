import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// CORS configuration - Allow all origins for now
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (_, res) => {
  res.json({
    message: 'API Aiquaa funcionando 🚀',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Test endpoint for debugging
app.get('/api/test', (_, res) => {
  res.json({
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasDbVars: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL
    }
  });
});

// Community comments endpoints
app.post('/api/comments', async (req, res) => {
  console.log('📝 POST /api/comments - Request received');
  
  try {
    const { name, message, isAnonymous } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const commentData = {
      name: isAnonymous ? 'Anónimo' : (name || 'Usuario'),
      message: message.trim(),
      isAnonymous: isAnonymous || false,
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.connection.remoteAddress || ''
    };

    const comment = await prisma.comment.create({
      data: commentData
    });
    
    console.log('✅ Comment created successfully');
    res.status(201).json(comment);
  } catch (error: any) {
    console.error('❌ Error creating comment:', error);
    
    if (error.code === 'P1001') {
      res.status(401).json({ error: 'Error de conexión a la base de datos' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

app.get('/api/comments', async (req, res) => {
  console.log('📝 GET /api/comments - Request received');
  
  try {
    const comments = await prisma.comment.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
    
    console.log(`✅ Retrieved ${comments.length} comments successfully`);
    res.json(comments);
  } catch (error: any) {
    console.error('❌ Error fetching comments:', error);
    
    if (error.code === 'P1001') {
      res.status(401).json({ error: 'Error de conexión a la base de datos' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Export for Vercel
export default app; 