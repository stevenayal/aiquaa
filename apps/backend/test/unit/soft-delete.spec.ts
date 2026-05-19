import { ForumService } from '../../src/forum/forum.service';
import { ThreadService } from '../../src/forum/services/thread.service';
import { PostService } from '../../src/forum/services/post.service';
import { ForumMetaService } from '../../src/forum/services/forum-meta.service';
import { ThreadRepository } from '../../src/forum/repositories/thread.repository';
import { PostRepository } from '../../src/forum/repositories/post.repository';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CacheService } from '../../src/cache/cache.service';

describe('Soft Delete behavior', () => {
  let service: ForumService;
  let prisma: any;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    prisma = {
      thread: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
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

    cacheService = {
      invalidateThreads: jest.fn(),
      invalidatePosts: jest.fn(),
      getOrSet: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;

    const eventBus = { publish: jest.fn() } as any;
    const threadRepo = new ThreadRepository(prisma as PrismaService);
    const postRepo = new PostRepository(prisma as PrismaService);
    const threadSvc = new ThreadService(threadRepo, cacheService, eventBus);
    const postSvc = new PostService(postRepo, cacheService, eventBus);
    const metaSvc = new ForumMetaService(prisma as PrismaService);

    service = new ForumService(threadSvc, postSvc, metaSvc);
  });

  it('marks a thread as deleted instead of removing it', async () => {
    prisma.thread.findFirst.mockResolvedValue({
      id: 15,
      authorId: 9,
      isLocked: false,
    });
    prisma.thread.update.mockResolvedValue({ id: 15, deletedAt: new Date() });

    const result = await service.deleteThread(15, 9);

    expect(prisma.thread.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 15 },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
    expect(cacheService.invalidateThreads).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: 'Thread eliminado exitosamente',
    });
  });
});
