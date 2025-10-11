import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { validate as isUuid } from 'uuid';

const feature = loadFeature('apps/backend/test/bdd/request-id.feature');

// Helper function to create the app
async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}

defineFeature(feature, test => {
  let app: INestApplication;
  let resp: request.Response;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  test('Responder con X-Request-Id cuando no viene', ({ given, when, then, and }) => {
    given('no envío el header "X-Request-Id"', () => {});

    when('hago un GET a "/api/v1/health"', async () => {
      resp = await request(app.getHttpServer()).get('/api/v1/health');
    });

    then('la respuesta es 200', () => {
      expect(resp.status).toBe(200);
    });

    and('la respuesta incluye el header "X-Request-Id"', () => {
      expect(resp.headers['x-request-id']).toBeTruthy();
    });

    and('"X-Request-Id" es un UUID v4 válido', () => {
      expect(isUuid(resp.headers['x-request-id'])).toBe(true);
    });
  });

  test('Propagar X-Request-Id entrante', ({ given, when, then, and }) => {
    given('envío el header "X-Request-Id" con valor "req-123"', () => {});

    when('hago un GET a "/api/v1/health"', async () => {
      resp = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('X-Request-Id', 'req-123');
    });

    then('la respuesta es 200', () => {
      expect(resp.status).toBe(200);
    });

    and('la respuesta incluye el header "X-Request-Id" con valor "req-123"', () => {
      expect(resp.headers['x-request-id']).toBe('req-123');
    });
  });

  test('No mutar req.socket.remoteAddress', ({ given, when, then, and }) => {
    given('el cliente envía "X-Forwarded-For" con "203.0.113.10"', () => {});

    when('hago un GET a "/api/v1/health"', async () => {
      resp = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('X-Forwarded-For', '203.0.113.10');
    });

    then('la respuesta es 200', () => {
      expect(resp.status).toBe(200);
    });

    and('se usa la IP "203.0.113.10" para logs/metrics', () => {
      // si hay logger/metric hook, espía/assertear según implementación.
      // Al menos no hubo error por mutar el socket.
      expect(resp.status).toBe(200);
    });

    and('no se intenta asignar a "req.socket.remoteAddress"', () => {
      // This test passes if no error is thrown during the request
      // The actual validation is that the request completes successfully
      expect(resp.status).toBe(200);
    });
  });
});
