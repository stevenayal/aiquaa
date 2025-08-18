import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ForumService } from '../../src/forum/forum.service';
import { CacheService } from '../../src/cache/cache.service';

describe('Soft Delete', () => {
  let module: TestingModule;
  let prismaService: PrismaService;
  let forumService: ForumService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        ForumService,
        {
          provide: CacheService,
          useValue: {
            invalidateThreads: jest.fn(),
            invalidatePosts: jest.fn(),
            getOrSet: jest.fn(),
          },
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    forumService = module.get<ForumService>(ForumService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should mark thread as deleted instead of hard delete', async () => {
    // Create a test thread
    const thread = await prismaService.thread.create({
      data: {
        title: 'Test Thread',
        content: 'Test Content',
        slug: 'test-thread',
        authorId: 1,
        categoryId: 1,
      },
    });

    // Delete the thread (should be soft delete)
    await prismaService.thread.delete({
      where: { id: thread.id },
    });

    // Verify thread is marked as deleted
    const deletedThread = await prismaService.thread.findUnique({
      where: { id: thread.id },
    });

    expect(deletedThread).toBeNull();

    // Verify thread exists with includeDeleted flag
    const softDeletedThread = await prismaService.thread.findUnique({
      where: { id: thread.id, includeDeleted: true },
    });

    expect(softDeletedThread).toBeDefined();
    expect(softDeletedThread?.deletedAt).toBeDefined();
  });

  it('should not return deleted threads in normal queries', async () => {
    // Create and delete a thread
    const thread = await prismaService.thread.create({
      data: {
        title: 'Test Thread',
        content: 'Test Content',
        slug: 'test-thread-2',
        authorId: 1,
        categoryId: 1,
      },
    });

    await prismaService.thread.delete({
      where: { id: thread.id },
    });

    // Verify thread is not returned in normal queries
    const threads = await prismaService.thread.findMany();
    const deletedThreadInList = threads.find(t => t.id === thread.id);
    expect(deletedThreadInList).toBeUndefined();
  });
});
