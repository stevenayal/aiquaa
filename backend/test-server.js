const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Configuración de CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://aiquaa.com',
    'https://www.aiquaa.com',
    'https://aiquaa.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (_, res) => res.send('API Aiquaa funcionando 🚀'));

// Endpoint de comentarios GET
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
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint de comentarios POST
app.post('/api/comments', async (req, res) => {
  console.log('📝 POST /api/comments - Request received:', {
    body: req.body,
    headers: req.headers,
    ip: req.ip
  });
  
  try {
    const { name, message, isAnonymous } = req.body;
    
    console.log('📝 Processing comment data:', { name, message: message?.substring(0, 50) + '...', isAnonymous });
    
    if (!message || !message.trim()) {
      console.log('❌ Validation failed: message is required');
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const commentData = {
      name: isAnonymous ? 'Anónimo' : (name || 'Usuario'),
      message: message.trim(),
      isAnonymous: isAnonymous || false,
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.connection.remoteAddress || ''
    };

    console.log('📝 Creating comment with data:', commentData);

    const comment = await prisma.comment.create({
      data: commentData
    });
    
    console.log('✅ Comment created successfully:', comment);
    res.status(201).json(comment);
  } catch (error) {
    console.error('❌ Error creating comment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba corriendo en http://localhost:${PORT}`);
  console.log(`📝 Endpoint de comentarios: http://localhost:${PORT}/api/comments`);
}); 