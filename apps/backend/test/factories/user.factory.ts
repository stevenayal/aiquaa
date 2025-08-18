import { PrismaClient, Role } from '@prisma/client';
import { getPrismaClient } from '../utils/prisma';

export interface CreateUserData {
  email?: string;
  name?: string;
  password?: string;
  role?: Role;
}

export class UserFactory {
  private static prisma = getPrismaClient();

  static async create(data: CreateUserData = {}) {
    const defaultData = {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      password: 'hashedPassword123',
      role: Role.USER,
    };

    const userData = { ...defaultData, ...data };

    return this.prisma.user.create({
      data: userData,
    });
  }

  static async createAdmin(data: CreateUserData = {}) {
    return this.create({
      ...data,
      role: Role.ADMIN,
      email: data.email || `admin-${Date.now()}@example.com`,
    });
  }

  static async createMany(count: number, data: CreateUserData = {}) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(
        this.create({
          ...data,
          email: `test-${Date.now()}-${i}@example.com`,
        })
      );
    }
    return Promise.all(users);
  }
}
