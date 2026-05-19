import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ForumMetaService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: { name: true },
    });
    return { success: true, data: categories.map((c) => c.name) };
  }

  async getTags() {
    const tags = await this.prisma.threadTag.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: tags.map((tag) => tag.name) };
  }

  async getStats() {
    const stats = await this.prisma.$transaction([
      this.prisma.thread.count({ where: { deletedAt: null } }),
      this.prisma.post.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: {
          deletedAt: null,
          OR: [
            {
              threads: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
            {
              posts: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
          ],
        },
      }),
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
}
