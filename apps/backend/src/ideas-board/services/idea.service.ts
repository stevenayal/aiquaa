import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Role } from '@prisma/client';
import { CacheService } from '../../cache/cache.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateIdeaDto,
  UpdateIdeaDto,
  CreateCommentDto,
  UpdateStatusDto,
} from '../dto';
import { IdeaFilters, IdeaRepository } from '../repositories/idea.repository';
import { IdeaVoteRepository } from '../repositories/idea-vote.repository';
import { IdeaCreatedEvent } from '../events/idea-created.event';
import { CommentAddedEvent } from '../events/comment-added.event';

@Injectable()
export class IdeaService {
  private readonly logger = new Logger(IdeaService.name);

  constructor(
    private readonly ideas: IdeaRepository,
    private readonly votes: IdeaVoteRepository,
    private readonly cache: CacheService,
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus
  ) {}

  async create(dto: CreateIdeaDto, authorId: number) {
    this.logger.log(`Creating idea: ${dto.title} by user ${authorId}`);
    const category = await this.ideas.findCategoryById(dto.categoryId);
    if (!category)
      throw new BadRequestException('La categoría especificada no existe');

    const slug = await this.ideas.generateUniqueSlug(dto.title);
    const idea = await this.ideas.create({
      title: dto.title,
      description: dto.description,
      slug,
      categoryId: dto.categoryId,
      authorId,
      tags: dto.tags || [],
    });

    await this.cache.invalidateByTag('ideas');
    this.eventBus.publish(
      new IdeaCreatedEvent(authorId, idea.id, dto.categoryId)
    );
    return idea;
  }

  async findMany(filters: IdeaFilters = {}, userId?: number) {
    const cacheKey = `ideas:list:${JSON.stringify(filters)}:${userId || 'guest'}`;
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const { ideas, total, page, limit } =
          await this.ideas.findMany(filters);

        let ideasWithVotes = ideas;
        if (userId) {
          const userVotes = await this.votes.findByUserForIdeas(
            userId,
            ideas.map((i) => i.id)
          );
          const voteMap = new Map(userVotes.map((v) => [v.ideaId, v.value]));
          ideasWithVotes = ideas.map((idea) => ({
            ...idea,
            userVote: voteMap.get(idea.id) || null,
          }));
        }

        return {
          data: ideasWithVotes,
          meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
      },
      60
    );
  }

  async findOne(id: number, userId?: number) {
    const cacheKey = `ideas:${id}:${userId || 'guest'}`;
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const idea = await this.ideas.findById(id);
        if (!idea) throw new NotFoundException('Idea no encontrada');

        await this.ideas.incrementViewCount(id);

        let userVote = null;
        if (userId) {
          const vote = await this.votes.findByUserForIdea(userId, id);
          userVote = vote?.value || null;
        }

        return { ...idea, userVote };
      },
      60
    );
  }

  async update(id: number, dto: UpdateIdeaDto, userId: number, userRole: Role) {
    const idea = await this.ideas.findById(id);
    if (!idea) throw new NotFoundException('Idea no encontrada');
    if (idea.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para editar esta idea');
    }

    let slug = idea.slug;
    if (dto.title && dto.title !== idea.title) {
      slug = await this.ideas.generateUniqueSlug(dto.title, id);
    }

    const updated = await this.ideas.update(id, { ...dto, slug });
    await this.cache.invalidate(`ideas:${id}`);
    await this.cache.invalidateByTag('ideas');
    return updated;
  }

  async remove(id: number, userId: number, userRole: Role) {
    const idea = await this.ideas.findById(id);
    if (!idea) throw new NotFoundException('Idea no encontrada');
    if (idea.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para eliminar esta idea');
    }

    await this.ideas.softDelete(id);
    await this.cache.invalidate(`ideas:${id}`);
    await this.cache.invalidateByTag('ideas');
    return { message: 'Idea eliminada exitosamente' };
  }

  async addComment(ideaId: number, userId: number, dto: CreateCommentDto) {
    const idea = await this.ideas.findById(ideaId);
    if (!idea) throw new NotFoundException('Idea no encontrada');

    const comment = await this.prisma.ideaComment.create({
      data: { content: dto.content, ideaId, authorId: userId },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    await this.cache.invalidate(`ideas:${ideaId}`);
    this.eventBus.publish(new CommentAddedEvent(userId, ideaId, comment.id));
    return comment;
  }

  async updateStatus(
    id: number,
    dto: UpdateStatusDto,
    _userId: number,
    userRole: Role
  ) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo administradores pueden cambiar el estado de las ideas'
      );
    }

    const idea = await this.ideas.findById(id);
    if (!idea) throw new NotFoundException('Idea no encontrada');

    const updated = await this.ideas.update(id, { status: dto.status });
    await this.cache.invalidate(`ideas:${id}`);
    await this.cache.invalidateByTag('ideas');
    return updated;
  }

  async getTopIdeas(limit: number = 10, userId?: number) {
    return this.cache.getOrSet(
      `ideas:top:${limit}:${userId || 'guest'}`,
      async () => {
        const ideas = await this.ideas.findTopByScore(limit);

        if (userId) {
          const userVotes = await this.votes.findByUserForIdeas(
            userId,
            ideas.map((i) => i.id)
          );
          const voteMap = new Map(userVotes.map((v) => [v.ideaId, v.value]));
          return ideas.map((idea) => ({
            ...idea,
            userVote: voteMap.get(idea.id) || null,
          }));
        }

        return ideas;
      },
      300
    );
  }

  async getCategories() {
    return this.cache.getOrSet(
      'ideas:categories',
      () => this.ideas.findCategories(),
      600
    );
  }

  async getUserVotedIdeas(
    userId: number,
    page: number = 1,
    limit: number = 20
  ) {
    const { votes, total } = await this.votes.findByUser(userId, page, limit);
    return {
      data: votes.map((v) => ({ ...v.idea, userVote: v.value })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
