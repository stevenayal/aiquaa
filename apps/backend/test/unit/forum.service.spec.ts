import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForumService } from '../../src/forum/forum.service';
import { ThreadService } from '../../src/forum/services/thread.service';
import { PostService } from '../../src/forum/services/post.service';
import { ForumMetaService } from '../../src/forum/services/forum-meta.service';
import { ThreadRepository } from '../../src/forum/repositories/thread.repository';
import { PostRepository } from '../../src/forum/repositories/post.repository';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CacheService } from '../../src/cache/cache.service';

function makeThreadRepo(prisma: any): ThreadRepository {
  const repo = new ThreadRepository(prisma as PrismaService);
  return repo;
}

function makePostRepo(prisma: any): PostRepository {
  return new PostRepository(prisma as PrismaService);
}

describe('ForumService (facade + sub-services)', () => {
  let service: ForumService;
  let prisma: any;
  let cache: jest.Mocked<CacheService>;

  beforeEach(() => {
    prisma = {
      thread: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      post: {
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      category: { findMany: jest.fn() },
      threadTag: { findMany: jest.fn() },
      user: { count: jest.fn() },
      $transaction: jest.fn(),
    };

    cache = {
      invalidateThreads: jest.fn(),
      invalidatePosts: jest.fn(),
      getOrSet: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;

    const eventBus = { publish: jest.fn() } as any;
    const threadRepo = makeThreadRepo(prisma);
    const postRepo = makePostRepo(prisma);
    const threadSvc = new ThreadService(threadRepo, cache, eventBus);
    const postSvc = new PostService(postRepo, cache, eventBus);
    const metaSvc = new ForumMetaService(prisma as PrismaService);

    service = new ForumService(threadSvc, postSvc, metaSvc);
  });

  it('creates a unique slug when the base slug already exists', async () => {
    prisma.thread.findMany.mockResolvedValue([{ slug: 'mi-thread' }]);
    prisma.thread.create.mockResolvedValue({
      id: 1,
      title: 'Mi Thread',
      content: 'Contenido suficientemente largo para pasar la validacion',
      slug: 'mi-thread-2',
      authorId: 2,
      author: { id: 2, email: 'author@example.com', name: 'Autor' },
      category: { name: 'General' },
      threadTags: [],
      _count: { posts: 0 },
      isSticky: false,
      isLocked: false,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createThread({
      title: 'Mi Thread',
      content: 'Contenido suficientemente largo para pasar la validacion',
      categoryId: 1,
      authorId: 2,
      tags: [],
    });

    expect(prisma.thread.create.mock.calls[0][0].data.slug).toBe('mi-thread-2');
    expect(cache.invalidateThreads).toHaveBeenCalled();
    expect(result.title).toBe('Mi Thread');
  });

  it('rejects post creation when the thread does not exist', async () => {
    prisma.thread.findFirst.mockResolvedValue(null);

    await expect(
      service.createPost({ threadId: 10, authorId: 1, content: 'respuesta' })
    ).rejects.toThrow(NotFoundException);
  });

  it('invalidates thread and post caches when creating a post without mutating viewCount', async () => {
    prisma.thread.findFirst.mockResolvedValue({ id: 10, isLocked: false });
    prisma.post.create.mockResolvedValue({ id: 99, content: 'respuesta' });
    prisma.thread.update = jest.fn();

    await service.createPost({
      threadId: 10,
      authorId: 1,
      content: 'respuesta',
    });

    expect(cache.invalidateThreads).toHaveBeenCalled();
    expect(cache.invalidatePosts).toHaveBeenCalledWith(10);
    expect(prisma.thread.update).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when a non-owner updates a thread', async () => {
    prisma.thread.findFirst.mockResolvedValue({
      id: 12,
      authorId: 7,
      title: 'Original',
      isLocked: false,
    });

    await expect(
      service.updateThread(12, { title: 'Nuevo titulo' }, 3)
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when a non-owner deletes a thread', async () => {
    prisma.thread.findFirst.mockResolvedValue({
      id: 12,
      authorId: 7,
      isLocked: false,
    });

    await expect(service.deleteThread(12, 3)).rejects.toThrow(
      ForbiddenException
    );
  });
});
