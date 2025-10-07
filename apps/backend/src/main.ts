import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { RequestIdMiddleware } from './observability/request-id.middleware';
import { GlobalExceptionFilter } from './observability/exception.filter';
import { logger } from './logger/seq.logger';
import { HttpLoggingInterceptor } from './observability/http-logging.interceptor';
import { LoggingContextMiddleware } from './observability/logging-context.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false, bufferLogs: true });

  // Integrar Pino + Seq como logger de Nest
  app.useLogger({
    log: (message, context) => logger.info({ context }, message),
    error: (message, trace) => logger.error({ trace }, message),
    warn: (message, context) => logger.warn({ context }, message),
    debug: (message, context) => logger.debug({ context }, message),
    verbose: (message, context) => logger.trace({ context }, message),
  });

  // Trust proxy para Railway
  app.use((req, res, next) => {
    req.connection.remoteAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
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

  // Logging básico de requests (se reemplazará por interceptor global opcional)
  app.use((req, res, next) => {
    logger.info(
      {
        ...(req as any).logContext,
        origin: req.headers.origin,
        referer: req.headers.referer,
      },
      'HTTP Request',
    );
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
    .setDescription('API para la plataforma AIQUAA - Herramientas de QA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

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
