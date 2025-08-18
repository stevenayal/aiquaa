import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await argon2.hash('admin123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aiquaa.com' },
    update: {},
    create: {
      email: 'admin@aiquaa.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
    },
  });

  // Create demo user
  const demoPassword = await argon2.hash('demo123');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@aiquaa.com' },
    update: {},
    create: {
      email: 'demo@aiquaa.com',
      name: 'Demo User',
      passwordHash: demoPassword,
      role: 'USER',
      emailVerifiedAt: new Date(),
    },
  });

  // Create default categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'general' },
      update: {},
      create: {
        name: 'General',
        description: 'Discusiones generales sobre QA y testing',
        slug: 'general',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'automation' },
      update: {},
      create: {
        name: 'Automatización',
        description: 'Herramientas y técnicas de automatización',
        slug: 'automation',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'manual-testing' },
      update: {},
      create: {
        name: 'Testing Manual',
        description: 'Técnicas y mejores prácticas de testing manual',
        slug: 'manual-testing',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tools' },
      update: {},
      create: {
        name: 'Herramientas',
        description: 'Herramientas y utilidades para QA',
        slug: 'tools',
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user created:', adminUser.email);
  console.log('👤 Demo user created:', demoUser.email);
  console.log('📁 Categories created:', categories.length);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
