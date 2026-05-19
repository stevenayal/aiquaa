import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { CacheService } from '../../cache/cache.service';
import { CreateThreadDto } from '../dto';
import { ThreadRepository } from '../repositories/thread.repository';
import { ThreadCreatedEvent } from '../events/thread-created.event';

@Injectable()
export class ThreadService {
  constructor(
    private readonly threads: ThreadRepository,
    private readonly cache: CacheService,
    private readonly eventBus: EventBus
  ) {}

  async create(dto: CreateThreadDto & { authorId: number }) {
    const { tags, ...threadData } = dto;
    const slug = await this.threads.generateUniqueSlug(threadData.title);
    const thread = await this.threads.create({ ...threadData, slug }, tags);
    await this.cache.invalidateThreads();
    this.eventBus.publish(
      new ThreadCreatedEvent(dto.authorId, thread.id, dto.categoryId)
    );
    return this.format(thread);
  }

  async findMany(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      tags?: string[];
      author?: string;
      sortBy?: 'newest' | 'oldest' | 'mostViewed' | 'mostReplied';
    } = {}
  ) {
    const cacheKey = `threads:${JSON.stringify(query)}`;
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const { threads, total, page, limit } =
          await this.threads.findMany(query);
        return {
          success: true,
          data: threads.map((t) => this.format(t)),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      60
    );
  }

  async findOne(id: number) {
    const thread = await this.threads.findById(id);
    if (!thread) throw new NotFoundException('Thread no encontrado');
    await this.threads.incrementViewCount(id);
    return { success: true, data: this.format(thread) };
  }

  async update(
    id: number,
    updateData: Partial<CreateThreadDto>,
    userId: number
  ) {
    const thread = await this.threads.findByIdShallow(id);
    if (!thread) throw new NotFoundException('Thread no encontrado');
    if (thread.authorId !== userId)
      throw new ForbiddenException(
        'No tienes permisos para editar este thread'
      );

    const { tags, ...threadData } = updateData;
    const slug = threadData.title
      ? await this.threads.generateUniqueSlug(threadData.title, id)
      : undefined;
    const updated = await this.threads.update(
      id,
      { ...threadData, slug },
      tags
    );
    await this.cache.invalidateThreads();
    return { success: true, data: this.format(updated) };
  }

  async remove(id: number, userId: number) {
    const thread = await this.threads.findByIdShallow(id);
    if (!thread) throw new NotFoundException('Thread no encontrado');
    if (thread.authorId !== userId)
      throw new ForbiddenException(
        'No tienes permisos para eliminar este thread'
      );
    await this.threads.softDelete(id);
    await this.cache.invalidateThreads();
    return { success: true, message: 'Thread eliminado exitosamente' };
  }

  async search(query: string, filters: any = {}) {
    const { page = 1, limit = 20 } = filters;
    const { threads, total } = await this.threads.findManyWithSearch(
      query,
      filters
    );
    return {
      success: true,
      data: { threads: threads.map((t) => this.format(t)), posts: [] },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private format(thread: any) {
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
