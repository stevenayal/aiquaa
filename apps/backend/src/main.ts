import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { RequestIdMiddleware } from './observability/request-id.middleware';
import { GlobalExceptionFilter } from './observability/exception.filter';
import { logger } from './logger/seq.logger';
import { httpLogger } from './logger/http.logger';
import { HttpLoggingInterceptor } from './observability/http-logging.interceptor';
import { LoggingContextMiddleware } from './observability/logging-context.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false, bufferLogs: true });

  // Enable trust proxy for proper IP handling
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  // Integrar Pino + Seq como logger de Nest
  app.useLogger({
    log: (message, context) => logger.info({ context }, message),
    error: (message, trace) => logger.error({ trace }, message),
    warn: (message, context) => logger.warn({ context }, message),
    debug: (message, context) => logger.debug({ context }, message),
    verbose: (message, context) => logger.trace({ context }, message),
  });

  // Trust proxy para Railway - no mutar socket.remoteAddress
  app.use((req, res, next) => {
    // Solo configurar req.ip para que Express maneje X-Forwarded-For
    next();
  });

  // Helmet sin bloquear recursos de front
  app.use(helmet({ crossOriginResourcePolicy: false }));

  // CORS configuration robusta con función de validación - DEBE IR ANTES que otros middlewares
  const allowlist = [
    'https://aiquaa.com',
    /^https:\/\/.*\.vercel\.app$/,
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Verificar si el origin está en la allowlist
      const isAllowed = allowlist.some((allowedOrigin) => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        }
        return allowedOrigin.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked: ${origin}`);
        callback(new Error(`CORS blocked: ${origin}`), false);
      }
    },
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'X-Request-ID',
      'X-Forwarded-For',
      'X-Forwarded-Proto',
      'X-Forwarded-Host'
    ],
    credentials: true,
    maxAge: 86400,
    exposedHeaders: ['Location', 'X-Request-ID']
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global middleware for request ID
  app.use(new RequestIdMiddleware().use);

  // HTTP logging con pino-http (después del RequestIdMiddleware)
  app.use(httpLogger);

  // Enriquecer el request con contexto común para logging
  app.use(new LoggingContextMiddleware().use);

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Manejar OPTIONS explícitamente
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Interceptor global de logging
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AIQUAA API')
    .setDescription(`
      ## 🚀 API para la plataforma AIQUAA - Herramientas de QA en Paraguay

      ### Acerca de AIQUAA
      AIQUAA es una plataforma paraguaya de herramientas y recursos para profesionales de QA (Quality Assurance).
      El nombre proviene del guaraní "aikuaa" que significa "saber" o "conocer", combinando AI (Inteligencia Artificial)
      con QA (Quality Assurance).

      ### 📦 Módulos Disponibles

      #### 🔐 Autenticación
      - Registro y login con email/password
      - Autenticación OAuth (Google, GitHub)
      - Autenticación de dos factores (2FA)
      - Gestión de tokens JWT y refresh tokens
      - Recuperación de contraseña
      - Verificación de email

      #### 💬 Foro
      - Gestión de threads y posts
      - Categorías y tags
      - Sistema de búsqueda avanzada
      - Suscripciones a threads
      - Reportes y moderación
      - Estadísticas del foro

      #### 👥 Usuarios
      - Perfiles de usuario
      - Gestión de roles (USER, ADMIN, MODERATOR)
      - Historial de actividad

      #### 💳 Billing (En desarrollo)
      - Integración con Stripe
      - Gestión de suscripciones
      - Historial de pagos

      #### 🏥 Health & Monitoring
      - Health checks
      - Métricas (Prometheus)
      - Trazabilidad (OpenTelemetry)

      ### 🔐 Autenticación

      La mayoría de endpoints requieren autenticación JWT. Para usarlos:

      1. Obtén un token usando \`POST /auth/login\` o \`POST /auth/register\`
      2. Haz clic en el botón "Authorize" arriba
      3. Ingresa tu token en formato: \`Bearer <tu-token>\`
      4. Los endpoints protegidos mostrarán un candado 🔒

      ### 📚 Documentación Adicional

      - **Swagger UI**: Esta interfaz interactiva
      - **OpenAPI JSON**: [/api/v1/docs-json](/api/v1/docs-json)
      - **Sitio Web**: [https://aiquaa.com](https://aiquaa.com)
      - **Labs (Herramientas)**: [https://aiquaa.com/labs](https://aiquaa.com/labs)

      ### 🌐 Entornos

      - **Desarrollo**: http://localhost:3001/api/v1
      - **Producción**: https://aiquaa-backend-production.up.railway.app/api/v1

      ### 📊 Observabilidad

      - **Métricas**: [/metrics](/metrics) (formato Prometheus)
      - **Health Check**: [/health](/health)
      - **Request IDs**: Cada request tiene un header \`X-Request-ID\` para trazabilidad

      ### 🔧 Tecnologías

      - **Framework**: NestJS
      - **Base de Datos**: PostgreSQL + Prisma ORM
      - **Cache**: Redis
      - **Autenticación**: JWT, Passport
      - **Logging**: Pino + Seq
      - **Métricas**: Prometheus
      - **Tracing**: OpenTelemetry + Jaeger

      ### 📝 Notas

      - Todos los endpoints usan el prefijo \`/api/v1\`
      - Las respuestas siguen un formato estándar JSON
      - Los errores incluyen códigos HTTP descriptivos
      - La paginación está disponible en endpoints de listado
    `)
    .setVersion('1.0.0')
    .setContact('AIQUAA Team', 'https://aiquaa.com', 'contact@aiquaa.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setTermsOfService('https://aiquaa.com/terms')
    .addServer('http://localhost:3001', 'Desarrollo Local')
    .addServer('https://aiquaa-backend-production.up.railway.app', 'Producción (Railway)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresá tu token JWT obtenido del endpoint /auth/login',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Auth', '🔐 Autenticación y autorización - Login, registro, 2FA, OAuth')
    .addTag('Users', '👥 Gestión de usuarios y perfiles')
    .addTag('Forum', '💬 Sistema de foro - Threads, posts, categorías y tags')
    .addTag('Billing', '💳 Gestión de suscripciones y pagos (Stripe)')
    .addTag('Health', '🏥 Monitoreo y estado del sistema')
    .addTag('Labs', '🧪 Herramientas de QA - All Pairs, validadores, generadores')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // Configurar Swagger UI con opciones personalizadas
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      syntaxHighlight: {
        activate: true,
        theme: 'agate'
      },
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      displayOperationId: false,
      requestInterceptor: (req) => {
        // Agregar headers personalizados si es necesario
        return req;
      },
    },
    customSiteTitle: 'AIQUAA API - Documentación',
    customfavIcon: 'https://aiquaa.com/favicon.ico',
    customCss: `
      .swagger-ui .topbar {
        background-color: #1e293b;
        padding: 10px 0;
      }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info { margin: 30px 0; }
      .swagger-ui .info .title {
        color: #2563eb;
        font-size: 36px;
        font-weight: bold;
      }
      .swagger-ui .info .description {
        font-size: 14px;
        line-height: 1.6;
      }
      .swagger-ui .info .description h2 {
        color: #334155;
        font-size: 24px;
        margin-top: 30px;
        margin-bottom: 15px;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 8px;
      }
      .swagger-ui .info .description h3 {
        color: #475569;
        font-size: 18px;
        margin-top: 20px;
        margin-bottom: 10px;
      }
      .swagger-ui .info .description h4 {
        color: #64748b;
        font-size: 16px;
        margin-top: 15px;
        margin-bottom: 8px;
      }
      .swagger-ui .scheme-container {
        background: #f1f5f9;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .swagger-ui .auth-wrapper {
        margin-top: 20px;
      }
      .swagger-ui .opblock-tag {
        font-size: 18px;
        font-weight: 600;
        border-bottom: 2px solid #e2e8f0;
        padding: 12px 0;
        margin-bottom: 10px;
      }
      .swagger-ui .opblock {
        margin-bottom: 15px;
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .swagger-ui .opblock.opblock-post {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.05);
      }
      .swagger-ui .opblock.opblock-get {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.05);
      }
      .swagger-ui .opblock.opblock-put {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.05);
      }
      .swagger-ui .opblock.opblock-delete {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.05);
      }
      .swagger-ui .opblock.opblock-patch {
        border-color: #8b5cf6;
        background: rgba(139, 92, 246, 0.05);
      }
      .swagger-ui .btn.authorize {
        background-color: #2563eb;
        border-color: #2563eb;
      }
      .swagger-ui .btn.authorize:hover {
        background-color: #1d4ed8;
        border-color: #1d4ed8;
      }
      .swagger-ui .btn.execute {
        background-color: #10b981;
        border-color: #10b981;
      }
      .swagger-ui .btn.execute:hover {
        background-color: #059669;
        border-color: #059669;
      }
      .swagger-ui a {
        color: #2563eb;
      }
      .swagger-ui a:hover {
        color: #1d4ed8;
      }
    `,
  });

  // Endpoint adicional para obtener la especificación OpenAPI en JSON
  app.use('/api/v1/docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  // Health check endpoint usando el adaptador HTTP
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      time: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
  await app.listen(port, '0.0.0.0'); // Railway requiere escuchar en 0.0.0.0
  logger.info({ port }, 'Backend listo y conectado a Seq');
  logger.info({}, '📚 API Documentation available at /api/v1/docs');
  logger.info({}, '📊 Metrics available at /metrics');
}

bootstrap();
