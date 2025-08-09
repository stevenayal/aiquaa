import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ForumService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async createCategory(createCategoryDto: any) {
    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });
    
    // Invalidate cache
    await this.cacheService.invalidateThreads();
    
    return category;
  }

  async createThread(createThreadDto: any) {
    const thread = await this.prisma.thread.create({
      data: createThreadDto,
      include: {
        author: true,
        category: true,
      },
    });
    
    // Invalidate cache
    await this.cacheService.invalidateThreads();
    
    return thread;
  }

  async createPost(createPostDto: any) {
    const post = await this.prisma.post.create({
      data: createPostDto,
      include: {
        author: true,
        thread: true,
      },
    });
    
    // Invalidate cache for posts of this thread
    await this.cacheService.invalidatePosts(createPostDto.threadId);
    
    return post;
  }

  async getThreads(query: { 
    page?: number; 
    limit?: number; 
    search?: string;
    categoryId?: number;
  } = {}) {
    const { page = 1, limit = 10, search, categoryId } = query;
    const skip = (page - 1) * limit;

    // Create cache key
    const cacheKey = `threads:${JSON.stringify({ page, limit, search, categoryId })}`;

    return this.cacheService.getOrSet(cacheKey, async () => {
      // Construir condiciones de búsqueda
      const where: any = {};
      
      if (search) {
        where.OR = [
          {
            title: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            content: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ];
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      // Obtener el total de hilos para la paginación
      const total = await this.prisma.thread.count({ where });

      const threads = await this.prisma.thread.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: true,
          category: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        data: threads,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
      };
    }, 60); // Cache for 60 seconds
  }

  async getPosts(query: {
    threadId: number;
    page?: number;
    limit?: number;
  }) {
    const { threadId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Obtener el total de posts para la paginación
    const total = await this.prisma.post.count({
      where: { threadId },
    });

    const posts = await this.prisma.post.findMany({
      where: { threadId },
      skip,
      take: limit,
      include: {
        author: true,
        thread: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      data: posts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getThread(id: number) {
    return this.prisma.thread.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        posts: {
          include: {
            author: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany();
  }

  async searchThreads(searchTerm: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        },
        {
          content: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        },
        {
          posts: {
            some: {
              content: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
          },
        },
      ],
    };

    const total = await this.prisma.thread.count({ where });

    const threads = await this.prisma.thread.findMany({
      where,
      skip,
      take: limit,
      include: {
        author: true,
        category: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: threads,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
        searchTerm,
      },
    };
  }
}
