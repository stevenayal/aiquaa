import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aiquaa.com' },
    update: {},
    create: {
      email: 'admin@aiquaa.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
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
