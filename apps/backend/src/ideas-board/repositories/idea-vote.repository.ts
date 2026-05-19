import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IdeaVoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(ideaId: number, userId: number, value: number) {
    return this.prisma.ideaVote.upsert({
      where: { ideaId_userId: { ideaId, userId } },
      update: { value, updatedAt: new Date() },
      create: { ideaId, userId, value },
    });
  }

  async delete(ideaId: number, userId: number) {
    return this.prisma.ideaVote.delete({
      where: { ideaId_userId: { ideaId, userId } },
    });
  }

  async findByUser(userId: number, page: number = 1, limit: number = 20) {
    const [votes, total] = await Promise.all([
      this.prisma.ideaVote.findMany({
        where: { userId },
        include: {
          idea: {
            include: {
              author: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
              category: true,
              _count: { select: { votes: true, comments: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.ideaVote.count({ where: { userId } }),
    ]);
    return { votes, total, page, limit };
  }

  async findByUserForIdeas(userId: number, ideaIds: number[]) {
    return this.prisma.ideaVote.findMany({
      where: { userId, ideaId: { in: ideaIds } },
    });
  }

  async findByUserForIdea(userId: number, ideaId: number) {
    return this.prisma.ideaVote.findUnique({
      where: { ideaId_userId: { ideaId, userId } },
    });
  }
}
