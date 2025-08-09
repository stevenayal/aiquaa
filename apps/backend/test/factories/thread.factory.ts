import { getPrismaClient } from '../utils/prisma';
import { UserFactory } from './user.factory';
import { CategoryFactory } from './category.factory';

export interface CreateThreadData {
  title?: string;
  content?: string;
  slug?: string;
  authorId?: number;
  categoryId?: number;
  isSticky?: boolean;
  isLocked?: boolean;
}

export class ThreadFactory {
  private static prisma = getPrismaClient();

  static async create(data: CreateThreadData = {}) {
    const defaultData = {
      title: `Test Thread ${Date.now()}`,
      content: 'This is a test thread content',
      slug: `test-thread-${Date.now()}`,
      isSticky: false,
      isLocked: false,
    };

    const threadData = { ...defaultData, ...data };

    // Crear usuario y categoría si no se proporcionan
    if (!threadData.authorId) {
      const user = await UserFactory.create();
      threadData.authorId = user.id;
    }

    if (!threadData.categoryId) {
      const category = await CategoryFactory.create();
      threadData.categoryId = category.id;
    }

    return this.prisma.thread.create({
      data: threadData,
      include: {
        author: true,
        category: true,
      },
    });
  }

  static async createMany(count: number, data: CreateThreadData = {}) {
    const threads = [];
    for (let i = 0; i < count; i++) {
      threads.push(
        this.create({
          ...data,
          title: `Test Thread ${Date.now()}-${i}`,
          slug: `test-thread-${Date.now()}-${i}`,
        })
      );
    }
    return Promise.all(threads);
  }
}
