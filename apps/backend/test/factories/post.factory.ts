import { getPrismaClient } from '../utils/prisma';
import { UserFactory } from './user.factory';
import { ThreadFactory } from './thread.factory';

export interface CreatePostData {
  content?: string;
  authorId?: number;
  threadId?: number;
}

export class PostFactory {
  private static prisma = getPrismaClient();

  static async create(data: CreatePostData = {}) {
    const defaultData = {
      content: 'This is a test post content',
    };

    const postData = { ...defaultData, ...data };

    // Crear usuario y hilo si no se proporcionan
    if (!postData.authorId) {
      const user = await UserFactory.create();
      postData.authorId = user.id;
    }

    if (!postData.threadId) {
      const thread = await ThreadFactory.create();
      postData.threadId = thread.id;
    }

    return this.prisma.post.create({
      data: postData,
      include: {
        author: true,
        thread: true,
      },
    });
  }

  static async createMany(count: number, data: CreatePostData = {}) {
    const posts = [];
    for (let i = 0; i < count; i++) {
      posts.push(
        this.create({
          ...data,
          content: `Test post content ${i + 1}`,
        })
      );
    }
    return Promise.all(posts);
  }
}
