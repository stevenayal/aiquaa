import { getPrismaClient } from '../utils/prisma';

export interface CreateCategoryData {
  name?: string;
  description?: string;
  slug?: string;
}

export class CategoryFactory {
  private static prisma = getPrismaClient();

  static async create(data: CreateCategoryData = {}) {
    const defaultData = {
      name: `Test Category ${Date.now()}`,
      description: 'Test category description',
      slug: `test-category-${Date.now()}`,
    };

    const categoryData = { ...defaultData, ...data };

    return this.prisma.category.create({
      data: categoryData,
    });
  }

  static async createMany(count: number, data: CreateCategoryData = {}) {
    const categories = [];
    for (let i = 0; i < count; i++) {
      categories.push(
        this.create({
          ...data,
          name: `Test Category ${Date.now()}-${i}`,
          slug: `test-category-${Date.now()}-${i}`,
        })
      );
    }
    return Promise.all(categories);
  }
}
