import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}

export async function cleanDatabase() {
  const client = getPrismaClient();
  
  // Limpiar tablas en orden correcto (respetando foreign keys)
  await client.post.deleteMany();
  await client.thread.deleteMany();
  await client.category.deleteMany();
  await client.user.deleteMany();
  await client.role.deleteMany();
}

export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
  }
}
