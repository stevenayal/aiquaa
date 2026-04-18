import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { IdeaStatus, Role } from '@prisma/client';
import {
  CreateIdeaDto,
  UpdateIdeaDto,
  VoteIdeaDto,
  CreateCommentDto,
  UpdateStatusDto,
} from './dto';

interface IdeaFilters {
  categoryId?: number;
  status?: IdeaStatus;
  search?: string;
  tags?: string[];
  authorId?: number;
  orderBy?: 'newest' | 'oldest' | 'topVoted' | 'trending';
  page?: number;
  limit?: number;
}

@Injectable()
export class IdeasBoardService {
  private readonly logger = new Logger(IdeasBoardService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  /**
   * Crear una nueva idea
   */
  async createIdea(createIdeaDto: CreateIdeaDto, authorId: number) {
    this.logger.log(`Creating idea: ${createIdeaDto.title} by user ${authorId}`);

    // Generar slug único
    const baseSlug = this.generateSlug(createIdeaDto.title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Verificar que la categoría existe
    const category = await this.prisma.ideaCategory.findUnique({
      where: { id: createIdeaDto.categoryId, deletedAt: null },
    });

    if (!category) {
      throw new BadRequestException('La categoría especificada no existe');
    }

    const idea = await this.prisma.idea.create({
      data: {
        title: createIdeaDto.title,
        description: createIdeaDto.description,
        slug,
        categoryId: createIdeaDto.categoryId,
        authorId,
        tags: createIdeaDto.tags || [],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: true,
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    });

    // Invalidar cache
    await this.cacheService.invalidateByTag('ideas');

    return idea;
  }

  /**
   * Obtener lista de ideas con filtros
   */
  async getIdeas(filters: IdeaFilters = {}, userId?: number) {
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

    const cacheKey = `ideas:list:${JSON.stringify(filters)}:${userId || 'guest'}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = {
          deletedAt: null,
        };

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
          where.tags = {
            hasSome: tags,
          };
        }

        const orderByClause = this.getOrderByClause(orderBy);

        const [ideas, total] = await Promise.all([
          this.prisma.idea.findMany({
            where,
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
              category: true,
              _count: {
                select: {
                  votes: true,
                  comments: true,
                },
              },
            },
            orderBy: orderByClause,
            skip: (page - 1) * limit,
            take: limit,
          }),
          this.prisma.idea.count({ where }),
        ]);

        // Si hay un usuario logueado, obtener sus votos
        let ideasWithUserVotes = ideas;
        if (userId) {
          const ideaIds = ideas.map((idea) => idea.id);
          const userVotes = await this.prisma.ideaVote.findMany({
            where: {
              userId,
              ideaId: { in: ideaIds },
            },
          });

          const voteMap = new Map(userVotes.map((v) => [v.ideaId, v.value]));

          ideasWithUserVotes = ideas.map((idea) => ({
            ...idea,
            userVote: voteMap.get(idea.id) || null,
          }));
        }

        return {
          data: ideasWithUserVotes,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      60, // Cache por 60 segundos
    );
  }

  /**
   * Obtener una idea específica por ID
   */
  async getIdea(id: number, userId?: number) {
    const cacheKey = `ideas:${id}:${userId || 'guest'}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const idea = await this.prisma.idea.findUnique({
          where: { id, deletedAt: null },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            category: true,
            comments: {
              where: { deletedAt: null },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
            _count: {
              select: {
                votes: true,
                comments: true,
              },
            },
          },
        });

        if (!idea) {
          throw new NotFoundException('Idea no encontrada');
        }

        // Incrementar view count
        await this.prisma.idea.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        });

        // Obtener voto del usuario
        let userVote = null;
        if (userId) {
          const vote = await this.prisma.ideaVote.findUnique({
            where: {
              ideaId_userId: {
                ideaId: id,
                userId,
              },
            },
          });
          userVote = vote?.value || null;
        }

        return {
          ...idea,
          userVote,
        };
      },
      60, // Cache por 60 segundos
    );
  }

  /**
   * Actualizar una idea
   */
  async updateIdea(
    id: number,
    updateIdeaDto: UpdateIdeaDto,
    userId: number,
    userRole: Role,
  ) {
    const idea = await this.prisma.idea.findUnique({
      where: { id, deletedAt: null },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    // Solo el autor o un admin pueden editar
    if (idea.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para editar esta idea');
    }

    // Si se actualiza el título, regenerar slug
    let slug = idea.slug;
    if (updateIdeaDto.title && updateIdeaDto.title !== idea.title) {
      const baseSlug = this.generateSlug(updateIdeaDto.title);
      slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    const updatedIdea = await this.prisma.idea.update({
      where: { id },
      data: {
        ...updateIdeaDto,
        slug,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: true,
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    });

    // Invalidar cache
    await this.cacheService.invalidate(`ideas:${id}`);
    await this.cacheService.invalidateByTag('ideas');

    return updatedIdea;
  }

  /**
   * Eliminar una idea (soft delete)
   */
  async deleteIdea(id: number, userId: number, userRole: Role) {
    const idea = await this.prisma.idea.findUnique({
      where: { id, deletedAt: null },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    // Solo el autor o un admin pueden eliminar
    if (idea.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para eliminar esta idea');
    }

    await this.prisma.idea.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Invalidar cache
    await this.cacheService.invalidate(`ideas:${id}`);
    await this.cacheService.invalidateByTag('ideas');

    return { message: 'Idea eliminada exitosamente' };
  }

  /**
   * Votar por una idea
   */
  async voteIdea(ideaId: number, userId: number, voteDto: VoteIdeaDto) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId, deletedAt: null },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    // Upsert: crear o actualizar voto
    const vote = await this.prisma.ideaVote.upsert({
      where: {
        ideaId_userId: {
          ideaId,
          userId,
        },
      },
      update: {
        value: voteDto.value,
        updatedAt: new Date(),
      },
      create: {
        ideaId,
        userId,
        value: voteDto.value,
      },
    });

    // Recalcular score de la idea
    await this.recalculateIdeaScore(ideaId);

    // Invalidar cache
    await this.cacheService.invalidate(`ideas:${ideaId}`);
    await this.cacheService.invalidateByTag('ideas');

    return vote;
  }

  /**
   * Quitar voto de una idea
   */
  async removeVote(ideaId: number, userId: number) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId, deletedAt: null },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    try {
      await this.prisma.ideaVote.delete({
        where: {
          ideaId_userId: {
            ideaId,
            userId,
          },
        },
      });

      // Recalcular score
      await this.recalculateIdeaScore(ideaId);

      // Invalidar cache
      await this.cacheService.invalidate(`ideas:${ideaId}`);
      await this.cacheService.invalidateByTag('ideas');

      return { message: 'Voto removido exitosamente' };
    } catch (error) {
      throw new NotFoundException('No has votado por esta idea');
    }
  }

  /**
   * Agregar comentario a una idea
   */
  async addComment(
    ideaId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId, deletedAt: null },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    const comment = await this.prisma.ideaComment.create({
      data: {
        content: createCommentDto.content,
        ideaId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Invalidar cache
    await this.cacheService.invalidate(`ideas:${ideaId}`);

    return comment;
  }

  /**
   * Actualizar estado de una idea (solo admins)
   */
  async updateStatus(
    id: number,
    updateStatusDto: UpdateStatusDto,
    _userId: number,
    userRole: Role,
  ) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo administradores pueden cambiar el estado de las ideas',
      );
    }

    const idea = await this.prisma.idea.findUnique({
      where: { id, deletedAt: null },
    });

    if (!idea) {
      throw new NotFoundException('Idea no encontrada');
    }

    const updatedIdea = await this.prisma.idea.update({
      where: { id },
      data: { status: updateStatusDto.status },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: true,
      },
    });

    // Invalidar cache
    await this.cacheService.invalidate(`ideas:${id}`);
    await this.cacheService.invalidateByTag('ideas');

    return updatedIdea;
  }

  /**
   * Obtener top ideas por votos
   */
  async getTopIdeas(limit: number = 10, userId?: number) {
    return this.cacheService.getOrSet(
      `ideas:top:${limit}:${userId || 'guest'}`,
      async () => {
        const ideas = await this.prisma.idea.findMany({
          where: { deletedAt: null },
          orderBy: { voteScore: 'desc' },
          take: limit,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            category: true,
            _count: {
              select: {
                votes: true,
                comments: true,
              },
            },
          },
        });

        // Agregar votos del usuario
        if (userId) {
          const ideaIds = ideas.map((idea) => idea.id);
          const userVotes = await this.prisma.ideaVote.findMany({
            where: {
              userId,
              ideaId: { in: ideaIds },
            },
          });

          const voteMap = new Map(userVotes.map((v) => [v.ideaId, v.value]));

          return ideas.map((idea) => ({
            ...idea,
            userVote: voteMap.get(idea.id) || null,
          }));
        }

        return ideas;
      },
      300, // Cache por 5 minutos
    );
  }

  /**
   * Obtener categorías
   */
  async getCategories() {
    return this.cacheService.getOrSet(
      'ideas:categories',
      async () => {
        return this.prisma.ideaCategory.findMany({
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                ideas: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        });
      },
      600, // Cache por 10 minutos
    );
  }

  /**
   * Obtener ideas votadas por el usuario
   */
  async getUserVotedIdeas(userId: number, page: number = 1, limit: number = 20) {
    const votes = await this.prisma.ideaVote.findMany({
      where: { userId },
      include: {
        idea: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            category: true,
            _count: {
              select: {
                votes: true,
                comments: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.ideaVote.count({ where: { userId } });

    return {
      data: votes.map((v) => ({
        ...v.idea,
        userVote: v.value,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // MÉTODOS PRIVADOS
  // ============================================================

  /**
   * Recalcular el score de votos de una idea
   */
  private async recalculateIdeaScore(ideaId: number) {
    const aggregation = await this.prisma.ideaVote.aggregate({
      where: { ideaId },
      _sum: { value: true },
      _count: { value: true },
    });

    const upvotes = await this.prisma.ideaVote.count({
      where: { ideaId, value: 1 },
    });

    const downvotes = await this.prisma.ideaVote.count({
      where: { ideaId, value: -1 },
    });

    await this.prisma.idea.update({
      where: { id: ideaId },
      data: {
        voteScore: aggregation._sum.value || 0,
        upvotes,
        downvotes,
      },
    });
  }

  /**
   * Generar slug a partir del título
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^\w\s-]/g, '') // Quitar caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios por guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno solo
      .trim();
  }

  /**
   * Asegurar que el slug es único
   */
  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: number,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.idea.findUnique({
        where: { slug },
      });

      if (!existing || existing.id === excludeId) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Obtener cláusula de ordenamiento según filtro
   */
  private getOrderByClause(orderBy: string) {
    switch (orderBy) {
      case 'newest':
        return { createdAt: 'desc' as const };
      case 'oldest':
        return { createdAt: 'asc' as const };
      case 'topVoted':
        return { voteScore: 'desc' as const };
      case 'trending':
        // Trending: combina votos recientes con score total
        // Por simplicidad, usamos voteScore descendente
        // En producción, podrías calcular un "trending score" más sofisticado
        return { voteScore: 'desc' as const };
      default:
        return { voteScore: 'desc' as const };
    }
  }
}
