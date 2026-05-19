import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const POST_INCLUDE = {
  author: { select: { id: true, email: true, name: true, avatarUrl: true } },
  thread: { include: { category: true } },
};

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByThread(threadId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { threadId, deletedAt: null },
        skip,
        take: limit,
        include: POST_INCLUDE,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.post.count({ where: { threadId, deletedAt: null } }),
    ]);
    return { posts, total, page, limit };
  }

  async create(data: { threadId: number; authorId: number; content: string }) {
    return this.prisma.post.create({ data, include: POST_INCLUDE });
  }

  async findThreadForPost(threadId: number) {
    return this.prisma.thread.findFirst({
      where: { id: threadId, deletedAt: null },
      select: { id: true, isLocked: true },
    });
  }
}
