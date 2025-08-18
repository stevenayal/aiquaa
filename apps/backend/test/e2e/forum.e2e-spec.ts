import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { cleanDatabase, getPrismaClient } from '../utils/prisma';
import { UserFactory } from '../factories/user.factory';
import { CategoryFactory } from '../factories/category.factory';
import { ThreadFactory } from '../factories/thread.factory';

describe('ForumController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = getPrismaClient();
    await cleanDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
    await app.close();
  });

  describe('/forum/categories (GET)', () => {
    it('should return all categories', async () => {
      // Crear categorías de prueba
      const category1 = await CategoryFactory.create({ name: 'Category 1' });
      const category2 = await CategoryFactory.create({ name: 'Category 2' });

      return request(app.getHttpServer())
        .get('/forum/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
          expect(res.body.some((cat: any) => cat.name === 'Category 1')).toBe(true);
          expect(res.body.some((cat: any) => cat.name === 'Category 2')).toBe(true);
        });
    });
  });

  describe('/forum/threads (GET)', () => {
    it('should return threads with pagination', async () => {
      // Crear hilos de prueba
      const user = await UserFactory.create();
      const category = await CategoryFactory.create();
      const thread1 = await ThreadFactory.create({
        title: 'Thread 1',
        authorId: user.id,
        categoryId: category.id,
      });
      const thread2 = await ThreadFactory.create({
        title: 'Thread 2',
        authorId: user.id,
        categoryId: category.id,
      });

      return request(app.getHttpServer())
        .get('/forum/threads?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
          expect(res.body.some((t: any) => t.title === 'Thread 1')).toBe(true);
          expect(res.body.some((t: any) => t.title === 'Thread 2')).toBe(true);
        });
    });
  });

  describe('/forum/threads (POST)', () => {
    it('should create a new thread when authenticated', async () => {
      const user = await UserFactory.create();
      const category = await CategoryFactory.create();

      const threadData = {
        title: 'New Thread',
        content: 'Thread content',
        categoryId: category.id,
      };

      // Primero hacer login para obtener token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        })
        .expect(200);

      const accessToken = loginResponse.body.access_token;

      return request(app.getHttpServer())
        .post('/forum/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(threadData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(threadData.title);
          expect(res.body.content).toBe(threadData.content);
          expect(res.body.categoryId).toBe(category.id);
        });
    });

    it('should return 401 when not authenticated', async () => {
      const category = await CategoryFactory.create();
      const threadData = {
        title: 'New Thread',
        content: 'Thread content',
        categoryId: category.id,
      };

      return request(app.getHttpServer())
        .post('/forum/threads')
        .send(threadData)
        .expect(401);
    });
  });

  describe('/forum/threads/:id/posts (POST)', () => {
    it('should create a new post when authenticated', async () => {
      const user = await UserFactory.create();
      const category = await CategoryFactory.create();
      const thread = await ThreadFactory.create({
        authorId: user.id,
        categoryId: category.id,
      });

      const postData = {
        content: 'New post content',
      };

      // Primero hacer login para obtener token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        })
        .expect(200);

      const accessToken = loginResponse.body.access_token;

      return request(app.getHttpServer())
        .post(`/forum/threads/${thread.id}/posts`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(postData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe(postData.content);
          expect(res.body.threadId).toBe(thread.id);
        });
    });
  });
});
