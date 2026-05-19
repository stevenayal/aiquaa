import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { CacheService } from '../../cache/cache.service';
import { CreatePostDto } from '../dto';
import { PostRepository } from '../repositories/post.repository';
import { PostCreatedEvent } from '../events/post-created.event';

@Injectable()
export class PostService {
  constructor(
    private readonly posts: PostRepository,
    private readonly cache: CacheService,
    private readonly eventBus: EventBus
  ) {}

  async create(dto: CreatePostDto & { threadId: number; authorId: number }) {
    const thread = await this.posts.findThreadForPost(dto.threadId);
    if (!thread) throw new NotFoundException('Thread no encontrado');
    if (thread.isLocked)
      throw new ForbiddenException('El thread está bloqueado');

    const post = await this.posts.create(dto);
    await this.cache.invalidateThreads();
    await this.cache.invalidatePosts(dto.threadId);
    this.eventBus.publish(
      new PostCreatedEvent(dto.authorId, post.id, dto.threadId)
    );
    return post;
  }

  async findByThread(query: {
    threadId: number;
    page?: number;
    limit?: number;
  }) {
    const { threadId, page = 1, limit = 20 } = query;
    const { posts, total } = await this.posts.findByThread(
      threadId,
      page,
      limit
    );
    return {
      success: true,
      data: posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
