import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as OpenAPIEnforcer from 'openapi-enforcer';

describe('Auth API Contracts', () => {
  let app: INestApplication;
  let openApiSpec: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obtener la especificación OpenAPI
    const response = await request(app.getHttpServer())
      .get('/api/v1/docs-json')
      .expect(200);
    
    openApiSpec = response.body;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should match OpenAPI schema for successful login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      // Validar contra el schema OpenAPI
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'POST',
        path: '/auth/login',
        status: 200,
        body: response.body,
      });

      expect(result.valid).toBe(true);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
    });

    it('should validate required fields', async () => {
      const invalidLoginData = {
        email: 'test@example.com',
        // password missing
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginData)
        .expect(400);
    });

    it('should handle invalid credentials', async () => {
      const invalidCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidCredentials)
        .expect(401);

      // Validar contra el schema OpenAPI para error
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'POST',
        path: '/auth/login',
        status: 401,
        body: response.body,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should match OpenAPI schema for token refresh', async () => {
      // Primero hacer login para obtener un token
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const refreshToken = loginResponse.body.refresh_token || loginResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      // Validar contra el schema OpenAPI
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'POST',
        path: '/auth/refresh',
        status: 200,
        body: response.body,
      });

      expect(result.valid).toBe(true);
      expect(response.body).toHaveProperty('access_token');
    });

    it('should handle invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid-token' })
        .expect(401);

      // Validar contra el schema OpenAPI para error
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'POST',
        path: '/auth/refresh',
        status: 401,
        body: response.body,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('POST /auth/logout', () => {
    it('should match OpenAPI schema for logout', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200);

      // Validar contra el schema OpenAPI
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'POST',
        path: '/auth/logout',
        status: 200,
        body: response.body,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('GET /auth/profile', () => {
    it('should match OpenAPI schema for user profile', async () => {
      // Primero hacer login para obtener un token
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const accessToken = loginResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Validar contra el schema OpenAPI
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'GET',
        path: '/auth/profile',
        status: 200,
        body: response.body,
      });

      expect(result.valid).toBe(true);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 401 without valid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });
});
