import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RequestIdMiddleware } from './observability/request-id.middleware';
import { GlobalExceptionFilter } from './observability/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global middleware for request ID
  app.use(new RequestIdMiddleware().use);

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    process.env.FRONT_ORIGIN,
    'https://aiquaa.vercel.app',
    'https://aiquaa-frontend.vercel.app',
  ].filter(Boolean); // Filtrar valores undefined/null

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
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

  // Health check endpoint is handled by HealthController

  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 AIQUAA Backend running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/v1/docs`);
  console.log(`📊 Metrics available at http://localhost:${port}/metrics`);
}

bootstrap();
