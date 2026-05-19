import { Injectable } from '@nestjs/common';
import { IdeaStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface IdeaFilters {
  categoryId?: number;
  status?: IdeaStatus;
  search?: string;
  tags?: string[];
  authorId?: number;
  orderBy?: 'newest' | 'oldest' | 'topVoted' | 'trending';
  page?: number;
  limit?: number;
}

const IDEA_AUTHOR_SELECT = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
};

const IDEA_INCLUDE = {
  author: { select: IDEA_AUTHOR_SELECT },
  category: true,
  _count: { select: { votes: true, comments: true } },
};

@Injectable()
export class IdeaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters: IdeaFilters) {
    const {
      categoryId,
      status,
      search,
      tags,
      authorId,
      orderBy = 'topVoted',
      page = 1,
      limit = 20,
    } = filters;

    const where: any = { deletedAt: null };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [ideas, total] = await Promise.all([
      this.prisma.idea.findMany({
        where,
        include: IDEA_INCLUDE,
        orderBy: this.buildOrderBy(orderBy),
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.idea.count({ where }),
    ]);

    return { ideas, total, page, limit };
  }

  async findById(id: number) {
    return this.prisma.idea.findUnique({
      where: { id, deletedAt: null },
      include: {
        ...IDEA_INCLUDE,
        comments: {
          where: { deletedAt: null },
          include: { author: { select: IDEA_AUTHOR_SELECT } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findTopByScore(limit: number) {
    return this.prisma.idea.findMany({
      where: { deletedAt: null },
      orderBy: { voteScore: 'desc' },
      take: limit,
      include: IDEA_INCLUDE,
    });
  }

  async create(data: {
    title: string;
    description: string;
    slug: string;
    categoryId: number;
    authorId: number;
    tags: string[];
  }) {
    return this.prisma.idea.create({ data, include: IDEA_INCLUDE });
  }

  async update(id: number, data: any) {
    return this.prisma.idea.update({
      where: { id },
      data,
      include: IDEA_INCLUDE,
    });
  }

  async softDelete(id: number) {
    return this.prisma.idea.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async incrementViewCount(id: number) {
    return this.prisma.idea.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  async updateScore(ideaId: number) {
    const [aggregation, upvotes, downvotes] = await Promise.all([
      this.prisma.ideaVote.aggregate({
        where: { ideaId },
        _sum: { value: true },
      }),
      this.prisma.ideaVote.count({ where: { ideaId, value: 1 } }),
      this.prisma.ideaVote.count({ where: { ideaId, value: -1 } }),
    ]);

    return this.prisma.idea.update({
      where: { id: ideaId },
      data: { voteScore: aggregation._sum.value || 0, upvotes, downvotes },
    });
  }

  async findCategoryById(categoryId: number) {
    return this.prisma.ideaCategory.findUnique({
      where: { id: categoryId, deletedAt: null },
    });
  }

  async findCategories() {
    return this.prisma.ideaCategory.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { ideas: { where: { deletedAt: null } } } },
      },
    });
  }

  async generateUniqueSlug(title: string, excludeId?: number): Promise<string> {
    const baseSlug = this.toSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.idea.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  private toSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private buildOrderBy(orderBy: string) {
    switch (orderBy) {
      case 'newest':
        return { createdAt: 'desc' as const };
      case 'oldest':
        return { createdAt: 'asc' as const };
      default:
        return { voteScore: 'desc' as const };
    }
  }
}
