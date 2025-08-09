import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('OpenAPI (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api-json (GET)', () => {
    it('should return OpenAPI documentation', () => {
      return request(app.getHttpServer())
        .get('/api-json')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('openapi');
          expect(res.body).toHaveProperty('info');
          expect(res.body).toHaveProperty('paths');
          expect(res.body).toHaveProperty('components');
        });
    });

    it('should contain health endpoint documentation', () => {
      return request(app.getHttpServer())
        .get('/api-json')
        .expect(200)
        .expect((res) => {
          expect(res.body.paths).toHaveProperty('/health');
          expect(res.body.paths['/health']).toHaveProperty('get');
        });
    });

    it('should contain auth endpoints documentation', () => {
      return request(app.getHttpServer())
        .get('/api-json')
        .expect(200)
        .expect((res) => {
          expect(res.body.paths).toHaveProperty('/auth/login');
          expect(res.body.paths).toHaveProperty('/auth/refresh');
        });
    });

    it('should contain forum endpoints documentation', () => {
      return request(app.getHttpServer())
        .get('/api-json')
        .expect(200)
        .expect((res) => {
          // Verificar que existen endpoints de foro
          const paths = Object.keys(res.body.paths);
          const forumPaths = paths.filter(path => path.includes('/forum'));
          expect(forumPaths.length).toBeGreaterThan(0);
        });
    });

    it('should contain schemas for Thread and Post', () => {
      return request(app.getHttpServer())
        .get('/api-json')
        .expect(200)
        .expect((res) => {
          expect(res.body.components).toHaveProperty('schemas');
          const schemas = res.body.components.schemas;
          
          // Verificar que existen esquemas para Thread y Post
          const schemaNames = Object.keys(schemas);
          expect(schemaNames.some(name => name.includes('Thread'))).toBe(true);
          expect(schemaNames.some(name => name.includes('Post'))).toBe(true);
        });
    });
  });
});
