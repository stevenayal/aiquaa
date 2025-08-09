import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as OpenAPIEnforcer from 'openapi-enforcer';

describe('Forum API Contracts', () => {
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

  describe('GET /forum/threads', () => {
    it('should match OpenAPI schema for threads list', async () => {
      const response = await request(app.getHttpServer())
        .get('/forum/threads')
        .expect(200);

      // Validar contra el schema OpenAPI
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'GET',
        path: '/forum/threads',
        status: 200,
        body: response.body,
      });

      expect(result.valid).toBe(true);
    });

    it('should handle pagination parameters correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/forum/threads?page=1&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
    });
  });

  describe('POST /forum/threads', () => {
    it('should match OpenAPI schema for thread creation', async () => {
      const threadData = {
        title: 'Test Thread',
        content: 'Test content',
        categoryId: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/forum/threads')
        .send(threadData)
        .expect(201);

      // Validar contra el schema OpenAPI
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'POST',
        path: '/forum/threads',
        status: 201,
        body: response.body,
      });

      expect(result.valid).toBe(true);
    });

    it('should validate required fields', async () => {
      const invalidThreadData = {
        content: 'Test content without title',
      };

      await request(app.getHttpServer())
        .post('/forum/threads')
        .send(invalidThreadData)
        .expect(400);
    });
  });

  describe('GET /forum/threads/:id', () => {
    it('should match OpenAPI schema for thread detail', async () => {
      // Primero crear un hilo para obtener su ID
      const threadData = {
        title: 'Test Thread for Detail',
        content: 'Test content',
        categoryId: 1,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/forum/threads')
        .send(threadData)
        .expect(201);

      const threadId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/forum/threads/${threadId}`)
        .expect(200);

      // Validar contra el schema OpenAPI
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'GET',
        path: '/forum/threads/{id}',
        status: 200,
        body: response.body,
      });

      expect(result.valid).toBe(true);
    });

    it('should return 404 for non-existent thread', async () => {
      await request(app.getHttpServer())
        .get('/forum/threads/999999')
        .expect(404);
    });
  });

  describe('POST /forum/threads/:id/posts', () => {
    it('should match OpenAPI schema for post creation', async () => {
      // Primero crear un hilo
      const threadData = {
        title: 'Test Thread for Posts',
        content: 'Test content',
        categoryId: 1,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/forum/threads')
        .send(threadData)
        .expect(201);

      const threadId = createResponse.body.id;

      const postData = {
        content: 'Test post content',
      };

      const response = await request(app.getHttpServer())
        .post(`/forum/threads/${threadId}/posts`)
        .send(postData)
        .expect(201);

      // Validar contra el schema OpenAPI
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'POST',
        path: '/forum/threads/{id}/posts',
        status: 201,
        body: response.body,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('GET /forum/categories', () => {
    it('should match OpenAPI schema for categories list', async () => {
      const response = await request(app.getHttpServer())
        .get('/forum/categories')
        .expect(200);

      // Validar contra el schema OpenAPI
      const enforcer = OpenAPIEnforcer(openApiSpec);
      const result = await enforcer.validateResponse({
        method: 'GET',
        path: '/forum/categories',
        status: 200,
        body: response.body,
      });

      expect(result.valid).toBe(true);
    });
  });
});
