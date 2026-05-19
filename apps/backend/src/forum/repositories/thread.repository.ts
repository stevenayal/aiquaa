import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ThreadFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tags?: string[];
  author?: string;
  sortBy?: 'newest' | 'oldest' | 'mostViewed' | 'mostReplied';
}

const THREAD_AUTHOR_SELECT = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
};

const THREAD_INCLUDE = {
  author: { select: THREAD_AUTHOR_SELECT },
  category: true,
  threadTags: true,
  _count: { select: { posts: true } },
};

@Injectable()
export class ThreadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters: ThreadFilters) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      tags,
      author,
      sortBy = 'newest',
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    if (category) {
      where.category = {
        name: { equals: category, mode: 'insensitive' as const },
      };
    }
    if (tags && tags.length > 0) {
      where.threadTags = { some: { name: { in: tags } } };
    }
    if (author) {
      where.author = {
        name: { contains: author, mode: 'insensitive' as const },
      };
    }

    const orderBy = this.buildOrderBy(sortBy);

    const [threads, total] = await Promise.all([
      this.prisma.thread.findMany({
        where,
        skip,
        take: limit,
        include: THREAD_INCLUDE,
        orderBy,
      }),
      this.prisma.thread.count({ where }),
    ]);

    return { threads, total, page, limit };
  }

  async findManyWithSearch(query: string, filters: any) {
    const {
      page = 1,
      limit = 20,
      category,
      tags,
      author,
      sortBy = 'newest',
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' as const } },
        { content: { contains: query, mode: 'insensitive' as const } },
        {
          posts: {
            some: {
              content: { contains: query, mode: 'insensitive' as const },
            },
          },
        },
      ];
    }
    if (category) {
      where.category = {
        name: { equals: category, mode: 'insensitive' as const },
      };
    }
    if (tags && tags.length > 0) {
      where.threadTags = { some: { name: { in: tags } } };
    }
    if (author) {
      where.author = {
        name: { contains: author, mode: 'insensitive' as const },
      };
    }

    const orderBy = this.buildOrderBy(sortBy);
    const [threads, total] = await Promise.all([
      this.prisma.thread.findMany({
        where,
        skip,
        take: limit,
        include: THREAD_INCLUDE,
        orderBy,
      }),
      this.prisma.thread.count({ where }),
    ]);

    return { threads, total, page, limit };
  }

  async findById(id: number) {
    return this.prisma.thread.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: THREAD_AUTHOR_SELECT },
        category: true,
        threadTags: true,
        posts: {
          where: { deletedAt: null },
          include: { author: { select: THREAD_AUTHOR_SELECT } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByIdShallow(id: number) {
    return this.prisma.thread.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, authorId: true, title: true, isLocked: true },
    });
  }

  async create(data: any, tags?: string[]) {
    return this.prisma.thread.create({
      data: {
        ...data,
        threadTags:
          tags && tags.length > 0
            ? {
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              }
            : undefined,
      },
      include: THREAD_INCLUDE,
    });
  }

  async update(id: number, data: any, tags?: string[]) {
    return this.prisma.thread.update({
      where: { id },
      data: {
        ...data,
        threadTags: tags
          ? {
              set: [],
              connectOrCreate: tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },
      include: THREAD_INCLUDE,
    });
  }

  async softDelete(id: number) {
    return this.prisma.thread.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async incrementViewCount(id: number) {
    return this.prisma.thread.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  async generateUniqueSlug(title: string, excludeId?: number): Promise<string> {
    const baseSlug = this.toSlug(title);
    const existing = await this.prisma.thread.findMany({
      where: {
        slug: { startsWith: baseSlug },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { slug: true },
    });

    if (!existing.some((t) => t.slug === baseSlug)) return baseSlug;

    let suffix = 2;
    let candidate = `${baseSlug}-${suffix}`;
    while (existing.some((t) => t.slug === candidate)) {
      suffix++;
      candidate = `${baseSlug}-${suffix}`;
    }
    return candidate;
  }

  private toSlug(title: string): string {
    const normalized = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return normalized || 'thread';
  }

  private buildOrderBy(sortBy: string) {
    switch (sortBy) {
      case 'oldest':
        return { createdAt: 'asc' as const };
      case 'mostViewed':
        return { viewCount: 'desc' as const };
      case 'mostReplied':
        return { posts: { _count: 'desc' as const } };
      default:
        return { createdAt: 'desc' as const };
    }
  }
}
