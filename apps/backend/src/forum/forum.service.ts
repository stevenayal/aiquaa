import { Injectable } from '@nestjs/common';
import { CreateThreadDto, CreatePostDto } from './dto';
import { ThreadService } from './services/thread.service';
import { PostService } from './services/post.service';
import { ForumMetaService } from './services/forum-meta.service';

@Injectable()
export class ForumService {
  constructor(
    private readonly threadService: ThreadService,
    private readonly postService: PostService,
    private readonly metaService: ForumMetaService
  ) {}

  getCategories() {
    return this.metaService.getCategories();
  }
  getTags() {
    return this.metaService.getTags();
  }
  getForumStats() {
    return this.metaService.getStats();
  }

  createThread(dto: CreateThreadDto & { authorId: number }) {
    return this.threadService.create(dto);
  }
  getThreads(query?: any) {
    return this.threadService.findMany(query);
  }
  getThread(id: number) {
    return this.threadService.findOne(id);
  }
  updateThread(id: number, data: Partial<CreateThreadDto>, userId: number) {
    return this.threadService.update(id, data, userId);
  }
  deleteThread(id: number, userId: number) {
    return this.threadService.remove(id, userId);
  }
  search(query: string, filters?: any) {
    return this.threadService.search(query, filters);
  }

  createPost(dto: CreatePostDto & { threadId: number; authorId: number }) {
    return this.postService.create(dto);
  }
  getPosts(query: { threadId: number; page?: number; limit?: number }) {
    return this.postService.findByThread(query);
  }
}
