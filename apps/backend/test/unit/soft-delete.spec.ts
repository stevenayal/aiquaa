import { ForumService } from '../../src/forum/forum.service';
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
        update: jest.fn(),
      },
    };

    cacheService = {
      invalidateThreads: jest.fn(),
      invalidatePosts: jest.fn(),
      getOrSet: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;

    service = new ForumService(prisma as PrismaService, cacheService);
  });

  it('marks a thread as deleted instead of removing it', async () => {
    prisma.thread.findFirst.mockResolvedValue({ authorId: 9 });
    prisma.thread.update.mockResolvedValue({ id: 15, deletedAt: new Date() });

    const result = await service.deleteThread(15, 9);

    expect(prisma.thread.update).toHaveBeenCalledWith({
      where: { id: 15 },
      data: { deletedAt: expect.any(Date) },
    });
    expect(cacheService.invalidateThreads).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: 'Thread eliminado exitosamente',
    });
  });
});
