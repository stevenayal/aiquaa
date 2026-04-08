import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ForumController } from '../../src/forum/forum.controller';
import { ForumService } from '../../src/forum/forum.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';

describe('ForumController (e2e)', () => {
  let app: INestApplication;
  let forumService: any;

  beforeEach(async () => {
    forumService = {
      getCategories: jest.fn(),
      getTags: jest.fn(),
      getThreads: jest.fn(),
      getThread: jest.fn(),
      createThread: jest.fn(),
      updateThread: jest.fn(),
      deleteThread: jest.fn(),
      getPosts: jest.fn(),
      createPost: jest.fn(),
      getForumStats: jest.fn(),
      search: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ForumController],
      providers: [
        { provide: ForumService, useValue: forumService },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn((context) => {
              const req = context.switchToHttp().getRequest();
              req.user = { id: 42 };
              return true;
            }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /forum/threads returns the current paginated contract', async () => {
    forumService.getThreads.mockResolvedValue({
      success: true,
      data: [{ id: '1', title: 'Thread 1' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    const response = await request(app.getHttpServer())
      .get('/forum/threads?page=1&limit=20')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: [{ id: '1', title: 'Thread 1' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  });

  it('POST /forum/threads injects the authenticated authorId', async () => {
    forumService.createThread.mockResolvedValue({ id: '10', title: 'Nuevo thread' });

    await request(app.getHttpServer())
      .post('/forum/threads')
      .send({
        title: 'Nuevo thread',
        content: 'Contenido suficientemente largo para pasar la validacion',
        categoryId: 2,
      })
      .expect(201);

    expect(forumService.createThread).toHaveBeenCalledWith({
      title: 'Nuevo thread',
      content: 'Contenido suficientemente largo para pasar la validacion',
      categoryId: 2,
      authorId: 42,
    });
  });

  it('POST /forum/threads/:id/posts injects threadId and authorId', async () => {
    forumService.createPost.mockResolvedValue({ id: 3, content: 'Respuesta' });

    await request(app.getHttpServer())
      .post('/forum/threads/15/posts')
      .send({ content: 'Respuesta' })
      .expect(201);

    expect(forumService.createPost).toHaveBeenCalledWith({
      content: 'Respuesta',
      threadId: 15,
      authorId: 42,
    });
  });
});
