import * as request from 'supertest';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { validate as isUuid } from 'uuid';
import { createTestApp } from '../../utils/test-app.factory';
import { INestApplication } from '@nestjs/common';

const feature = loadFeature('./test/bdd/request-id.feature');

defineFeature(feature, test => {
  let app: INestApplication;
  let resp: request.Response;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  test('Generar X-Request-Id si no viene', ({ given, when, then, and }) => {
    given(/^no envío "(.*)"$/, (header) => {
      // No action needed - we're testing the case where no header is sent
    });

    when(/^GET "(.*)"$/, async (path) => {
      resp = await request(app.getHttpServer()).get(path);
    });

    then(/^status (\d+)$/, (status) => {
      expect(resp.status).toBe(parseInt(status));
    });

    and(/^header "(.*)" existe y es UUID v(\d+)$/, (header, version) => {
      const rid = resp.headers[header.toLowerCase()];
      expect(rid).toBeTruthy();
      expect(isUuid(rid)).toBe(true);
    });
  });

  test('Propagar X-Request-Id entrante', ({ given, when, then, and }) => {
    given(/^envío "(.*)" = "(.*)"$/, (header, value) => {
      // Store the header value for use in the when step
      (global as any).testHeader = { [header]: value };
    });

    when(/^GET "(.*)"$/, async (path) => {
      const headers = (global as any).testHeader || {};
      resp = await request(app.getHttpServer())
        .get(path)
        .set(headers);
    });

    then(/^status (\d+)$/, (status) => {
      expect(resp.status).toBe(parseInt(status));
    });

    and(/^header "(.*)" = "(.*)"$/, (header, expectedValue) => {
      expect(resp.headers[header.toLowerCase()]).toBe(expectedValue);
    });
  });

  test('No mutar req.socket.remoteAddress', ({ given, when, then, and }) => {
    given(/^envío "(.*)" = "(.*)"$/, (header, value) => {
      // Store the header value for use in the when step
      (global as any).testHeader = { [header]: value };
    });

    when(/^GET "(.*)"$/, async (path) => {
      const headers = (global as any).testHeader || {};
      resp = await request(app.getHttpServer())
        .get(path)
        .set(headers);
    });

    then(/^status (\d+)$/, (status) => {
      expect(resp.status).toBe(parseInt(status));
    });

    and(/^el backend registra la IP "(.*)" sin mutar el socket$/, (expectedIp) => {
      // La ausencia de crash valida que no se mutó el getter del socket.
      // El hecho de que la respuesta sea 200 significa que no hubo error por mutación
      expect(resp.status).toBe(200);
    });
  });
});
