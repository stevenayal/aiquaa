import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RequestIdMiddleware } from '../../src/observability/request-id.middleware';
import { GlobalExceptionFilter } from '../../src/observability/exception.filter';
import { httpLogger } from '../../src/logger/http.logger';
import { getClientIp } from '../../src/observability/ip.util';

// Módulo de prueba simplificado sin base de datos
class TestAppModule {}

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Enable trust proxy for testing
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  // Solo agregar los middlewares que necesitamos probar
  app.use(new RequestIdMiddleware().use);
  app.use(httpLogger);
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Endpoint de prueba simple
  app.getHttpAdapter().get('/api/v1/health', (req, res) => {
    const ip = getClientIp(req);
    res.status(200).json({
      status: 'ok',
      requestId: (req as any).requestId,
      clientIp: ip,
      timestamp: new Date().toISOString()
    });
  });

  await app.init();
  return app;
}
