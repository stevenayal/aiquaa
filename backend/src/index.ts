import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Comunidad Aiquaa',
      version: '1.0.0',
      description: 'Documentación de endpoints para la API de Aiquaa, incluyendo comentarios de la comunidad',
      contact: {
        name: 'Equipo Aiquaa',
        url: 'https://aiquaa.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        Comment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del comentario'
            },
            name: {
              type: 'string',
              nullable: true,
              description: 'Nombre del autor del comentario (null si es anónimo)'
            },
            message: {
              type: 'string',
              description: 'Contenido del mensaje'
            },
            isAnonymous: {
              type: 'boolean',
              description: 'Indica si el comentario es anónimo'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de creación del comentario'
            }
          },
          required: ['id', 'message', 'isAnonymous', 'createdAt']
        },
        CommentRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del autor (opcional si isAnonymous es true)'
            },
            message: {
              type: 'string',
              description: 'Contenido del mensaje (requerido)'
            },
            isAnonymous: {
              type: 'boolean',
              description: 'Permite publicar sin nombre'
            }
          },
          required: ['message']
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            }
          }
        }
      }
    }
  },
  apis: ['./src/index.ts'] // Archivo donde están definidos los endpoints
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors({
  origin: [
    'http://localhost:5173', // Frontend en desarrollo
    'http://localhost:3000', // Frontend en desarrollo (alternativo)
    'http://localhost:4173', // Frontend en preview
    'https://aiquaa.com', // Frontend en producción
    'https://www.aiquaa.com', // Frontend en producción con www
    'https://aiquaa.vercel.app', // Frontend en Vercel
    'https://aiquaa-backend.vercel.app' // Backend en Vercel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent', 'Origin', 'Accept', 'X-Requested-With']
}));

// Middleware para manejar preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check
 *     description: Endpoint para verificar que la API está funcionando correctamente
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           text/plain:
 *             example: "API Aiquaa funcionando 🚀"
 */
// Health check endpoint
app.get('/', (_, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent, Origin, Accept, X-Requested-With');
  res.send('API Aiquaa funcionando 🚀');
});

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

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Crear un nuevo comentario
 *     description: Permite crear un comentario en la comunidad. El mensaje es obligatorio y se puede publicar de forma anónima.
 *     tags: [Comentarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentRequest'
 *           examples:
 *             comentario_normal:
 *               summary: Comentario con nombre
 *               value:
 *                 name: "Juan Pérez"
 *                 message: "¡Excelente iniciativa! Me encanta la comunidad."
 *                 isAnonymous: false
 *             comentario_anonimo:
 *               summary: Comentario anónimo
 *               value:
 *                 message: "Muy buena plataforma para aprender QA."
 *                 isAnonymous: true
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Juan Pérez"
 *               message: "¡Excelente iniciativa! Me encanta la comunidad."
 *               isAnonymous: false
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "El mensaje es requerido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Community comments endpoints
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

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Obtener comentarios de la comunidad
 *     description: Devuelve los últimos 50 comentarios ordenados por fecha de creación (más recientes primero)
 *     tags: [Comentarios]
 *     responses:
 *       200:
 *         description: Lista de comentarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *             example:
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "María García"
 *                 message: "¡Excelente iniciativa! Me encanta la comunidad."
 *                 isAnonymous: false
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *               - id: "123e4567-e89b-12d3-a456-426614174001"
 *                 name: null
 *                 message: "Muy buena plataforma para aprender QA."
 *                 isAnonymous: true
 *                 createdAt: "2024-01-15T09:15:00.000Z"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/comments', async (req, res) => {
  console.log('📝 GET /api/comments - Request received');
  
  try {
    const comments = await prisma.comment.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to last 50 comments
    });
    
    console.log(`✅ Retrieved ${comments.length} comments successfully`);
    res.json(comments);
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
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

// Middleware de manejo de errores
app.use((error: any, req: any, res: any, next: any) => {
  console.error('❌ Error no manejado:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`)); 