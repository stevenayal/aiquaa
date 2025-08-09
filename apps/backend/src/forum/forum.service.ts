import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ForumService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createCategory(createCategoryDto: any) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async createThread(createThreadDto: any) {
    return this.prisma.thread.create({
      data: createThreadDto,
      include: {
        author: true,
        category: true,
      },
    });
  }

  async createPost(createPostDto: any) {
    return this.prisma.post.create({
      data: createPostDto,
      include: {
        author: true,
        thread: true,
      },
    });
  }

  async getThreads(query: { 
    page?: number; 
    limit?: number; 
    search?: string;
    categoryId?: number;
  } = {}) {
    const { page = 1, limit = 10, search, categoryId } = query;
    const skip = (page - 1) * limit;

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
