import { Test, TestingModule } from '@nestjs/testing';
import { ForumService } from '../../src/forum/forum.service';
import { getPrismaClient } from '../utils/prisma';

// Mock Prisma
jest.mock('../utils/prisma', () => ({
  getPrismaClient: jest.fn(),
}));

describe('ForumService', () => {
  let service: ForumService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      thread: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      post: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    (getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);

    const module: TestingModule = await Test.createTestingModule({
      providers: [ForumService],
    }).compile();

    service = module.get<ForumService>(ForumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const createCategoryDto = {
        name: 'Test Category',
        description: 'Test category description',
        slug: 'test-category',
      };

      const expectedCategory = {
        id: 1,
        ...createCategoryDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.create.mockResolvedValue(expectedCategory);

      const result = await service.createCategory(createCategoryDto);

      expect(result).toEqual(expectedCategory);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: createCategoryDto,
      });
    });
  });

  describe('createThread', () => {
    it('should create a new thread', async () => {
      const createThreadDto = {
        title: 'Test Thread',
        content: 'Test thread content',
        slug: 'test-thread',
        authorId: 1,
        categoryId: 1,
      };

      const expectedThread = {
        id: 1,
        ...createThreadDto,
        isSticky: false,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.thread.create.mockResolvedValue(expectedThread);

      const result = await service.createThread(createThreadDto);

      expect(result).toEqual(expectedThread);
      expect(mockPrisma.thread.create).toHaveBeenCalledWith({
        data: createThreadDto,
        include: {
          author: true,
          category: true,
        },
      });
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const createPostDto = {
        content: 'Test post content',
        authorId: 1,
        threadId: 1,
      };

      const expectedPost = {
        id: 1,
        ...createPostDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.post.create.mockResolvedValue(expectedPost);

      const result = await service.createPost(createPostDto);

      expect(result).toEqual(expectedPost);
      expect(mockPrisma.post.create).toHaveBeenCalledWith({
        data: createPostDto,
        include: {
          author: true,
          thread: true,
        },
      });
    });
  });

  describe('getThreads', () => {
    it('should return threads with pagination', async () => {
      const expectedThreads = [
        {
          id: 1,
          title: 'Test Thread 1',
          content: 'Test content 1',
          slug: 'test-thread-1',
          authorId: 1,
          categoryId: 1,
          isSticky: false,
          isLocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.thread.findMany.mockResolvedValue(expectedThreads);

      const result = await service.getThreads({ page: 1, limit: 10 });

      expect(result).toEqual(expectedThreads);
      expect(mockPrisma.thread.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          author: true,
          category: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
