import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateThreadDto, CreatePostDto } from './dto';

@Injectable()
export class ForumService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async getCategories() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async getTags() {
    const tags = await this.prisma.threadTag.findMany({
      orderBy: { name: 'asc' },
    });
    return tags.map(tag => tag.name);
  }

  async createThread(createThreadDto: CreateThreadDto & { authorId: number }) {
    const { tags, ...threadData } = createThreadDto;
    
    // Crear el thread
    const thread = await this.prisma.thread.create({
      data: {
        ...threadData,
        slug: this.generateSlug(threadData.title),
        threadTags: tags && tags.length > 0 ? {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        } : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          }
        },
        category: true,
        threadTags: true,
        _count: {
          select: { posts: true }
        }
      },
    });
    
    // Invalidate cache
    await this.cacheService.invalidateThreads();
    
    return this.formatThreadResponse(thread);
  }

  async createPost(createPostDto: CreatePostDto & { threadId: number; authorId: number }) {
    const post = await this.prisma.post.create({
      data: createPostDto,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          }
        },
        thread: {
          include: {
            category: true,
          }
        },
      },
    });
    
    // Incrementar el contador de posts del thread
    await this.prisma.thread.update({
      where: { id: createPostDto.threadId },
      data: { viewCount: { increment: 1 } }
    });
    
    // Invalidate cache for posts of this thread
    await this.cacheService.invalidatePosts(createPostDto.threadId);
    
    return post;
  }

  async getThreads(query: { 
    page?: number; 
    limit?: number; 
    search?: string;
    category?: string;
    tags?: string[];
    author?: string;
    sortBy?: 'newest' | 'oldest' | 'mostViewed' | 'mostReplied';
  } = {}) {
    const { page = 1, limit = 20, search, category, tags, author, sortBy = 'newest' } = query;
    const skip = (page - 1) * limit;

    // Create cache key
    const cacheKey = `threads:${JSON.stringify({ page, limit, search, category, tags, author, sortBy })}`;

    return this.cacheService.getOrSet(cacheKey, async () => {
      // Construir condiciones de búsqueda
      const where: any = { deletedAt: null };
      
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

      if (category) {
        where.category = {
          name: { equals: category, mode: 'insensitive' as const }
        };
      }

      if (tags && tags.length > 0) {
        where.threadTags = {
          some: {
            name: { in: tags }
          }
        };
      }

      if (author) {
        where.author = {
          name: { contains: author, mode: 'insensitive' as const }
        };
      }

      // Ordenamiento
      let orderBy: any = {};
      switch (sortBy) {
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'mostViewed':
          orderBy = { viewCount: 'desc' };
          break;
        case 'mostReplied':
          orderBy = { posts: { _count: 'desc' } };
          break;
      }

      // Obtener el total de hilos para la paginación
      const total = await this.prisma.thread.count({ where });

      const threads = await this.prisma.thread.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            }
          },
          category: true,
          threadTags: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy,
      });

      return {
        success: true,
        data: threads.map(thread => this.formatThreadResponse(thread)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }, 60); // Cache for 60 seconds
  }

  async getThread(id: number) {
    const thread = await this.prisma.thread.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          }
        },
        category: true,
        threadTags: true,
        posts: {
          where: { deletedAt: null },
          include: {
            author: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              }
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread no encontrado');
    }

    // Incrementar contador de vistas
    await this.prisma.thread.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    return {
      success: true,
      data: this.formatThreadResponse(thread),
    };
  }

  async getPosts(query: {
    threadId: number;
    page?: number;
    limit?: number;
  }) {
    const { threadId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Obtener el total de posts para la paginación
    const total = await this.prisma.post.count({
      where: { threadId, deletedAt: null },
    });

    const posts = await this.prisma.post.findMany({
      where: { threadId, deletedAt: null },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          }
        },
        thread: {
          include: {
            category: true,
          }
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateThread(id: number, updateData: Partial<CreateThreadDto>, userId: number) {
    // Verificar que el usuario sea el autor del thread
    const thread = await this.prisma.thread.findUnique({
      where: { id, deletedAt: null },
      select: { authorId: true }
    });

    if (!thread) {
      throw new NotFoundException('Thread no encontrado');
    }

    if (thread.authorId !== userId) {
      throw new Error('No tienes permisos para editar este thread');
    }

    const { tags, ...threadData } = updateData;
    
    const updatedThread = await this.prisma.thread.update({
      where: { id },
      data: {
        ...threadData,
        threadTags: tags ? {
          set: [],
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        } : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          }
        },
        category: true,
        threadTags: true,
        _count: {
          select: { posts: true }
        }
      },
    });

    await this.cacheService.invalidateThreads();
    
    return {
      success: true,
      data: this.formatThreadResponse(updatedThread),
    };
  }

  async deleteThread(id: number, userId: number) {
    // Verificar que el usuario sea el autor del thread
    const thread = await this.prisma.thread.findUnique({
      where: { id, deletedAt: null },
      select: { authorId: true }
    });

    if (!thread) {
      throw new NotFoundException('Thread no encontrado');
    }

    if (thread.authorId !== userId) {
      throw new Error('No tienes permisos para eliminar este thread');
    }

    // Soft delete
    await this.prisma.thread.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await this.cacheService.invalidateThreads();
    
    return {
      success: true,
      message: 'Thread eliminado exitosamente',
    };
  }

  async getForumStats() {
    const stats = await this.prisma.$transaction([
      this.prisma.thread.count({ where: { deletedAt: null } }),
      this.prisma.post.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      // Usuarios activos (que han creado contenido en los últimos 7 días)
      this.prisma.user.count({
        where: {
          deletedAt: null,
          OR: [
            { threads: { some: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } },
            { posts: { some: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } }
          ]
        }
      })
    ]);

    return {
      success: true,
      data: {
        totalThreads: stats[0],
        totalPosts: stats[1],
        totalUsers: stats[2],
        activeUsers: stats[3],
      },
    };
  }

  async search(query: string, filters: any = {}) {
    const { page = 1, limit = 20, category, tags, author, sortBy = 'newest' } = filters;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
      
    if (query) {
      where.OR = [
        {
          title: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
        {
          content: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
        {
          posts: {
            some: {
              content: {
                contains: query,
                mode: 'insensitive' as const,
              },
            },
          },
        },
      ];
    }

    if (category) {
      where.category = {
        name: { equals: category, mode: 'insensitive' as const }
      };
    }

    if (tags && tags.length > 0) {
      where.threadTags = {
        some: {
          name: { in: tags }
        }
      };
    }

    if (author) {
      where.author = {
        name: { contains: author, mode: 'insensitive' as const }
      };
    }

    // Ordenamiento
    let orderBy: any = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'mostViewed':
        orderBy = { viewCount: 'desc' };
        break;
      case 'mostReplied':
        orderBy = { posts: { _count: 'desc' } };
        break;
    }

    const total = await this.prisma.thread.count({ where });

    const threads = await this.prisma.thread.findMany({
      where,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          }
        },
        category: true,
        threadTags: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy,
    });

    return {
      success: true,
      data: {
        threads: threads.map(thread => this.formatThreadResponse(thread)),
        posts: [], // Por ahora solo threads
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private formatThreadResponse(thread: any) {
    return {
      id: thread.id.toString(),
      title: thread.title,
      content: thread.content,
      authorId: thread.authorId.toString(),
      author: {
        id: thread.author.id.toString(),
        username: thread.author.name || thread.author.email,
        email: thread.author.email,
      },
      category: thread.category.name,
      tags: thread.threadTags.map((tag: any) => tag.name),
      isPinned: thread.isSticky,
      isLocked: thread.isLocked,
      viewCount: thread.viewCount,
      replyCount: thread._count?.posts || 0,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
    };
  }
}
