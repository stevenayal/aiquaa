import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RequestIdMiddleware } from './observability/request-id.middleware';
import { GlobalExceptionFilter } from './observability/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy para Railway
  app.set('trust proxy', true);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global middleware for request ID
  app.use(new RequestIdMiddleware().use);

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS configuration robusta
  app.enableCors({
    origin: [
      'https://aiquaa.com',
      /\.vercel\.app$/, // allow all vercel previews and prod
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization', 
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
    credentials: true,
    maxAge: 86400,
    exposedHeaders: ['Location']
  });

  // Manejar OPTIONS explícitamente si está detrás de un proxy
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

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AIQUAA API')
    .setDescription('API para la plataforma AIQUAA - Herramientas de QA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Health check endpoint simple usando middleware
  app.use('/health', (req, res) => {
    if (req.method === 'GET') {
      res.status(200).json({ 
        status: 'ok', 
        time: new Date().toISOString(),
        uptime: process.uptime()
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  });

  const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
  await app.listen(port, '0.0.0.0'); // Railway requiere escuchar en 0.0.0.0
  console.log(`🚀 AIQUAA Backend running on port ${port}`);
  console.log(`📚 API Documentation available at /api/v1/docs`);
  console.log(`📊 Metrics available at /metrics`);
}

bootstrap();
