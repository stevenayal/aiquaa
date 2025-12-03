import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedIdeasBoardCategories() {
  console.log('🌱 Seeding Ideas Board categories...');

  const categories = [
    {
      name: 'Herramientas QA',
      description:
        'Propuestas de nuevas herramientas para testers (frameworks, bibliotecas, integraciones)',
      icon: '🧪',
      order: 1,
    },
    {
      name: 'Mejoras de Plataforma',
      description:
        'Sugerencias para mejorar AIQUAA (nuevas features, UX, performance)',
      icon: '🚀',
      order: 2,
    },
    {
      name: 'Recursos Educativos',
      description:
        'Ideas de cursos, tutoriales, workshops y contenido educativo',
      icon: '📚',
      order: 3,
    },
    {
      name: 'Integraciones',
      description:
        'Propuestas de integraciones con otras herramientas y servicios',
      icon: '🔗',
      order: 4,
    },
    {
      name: 'Comunidad',
      description:
        'Ideas para fortalecer la comunidad de QA en Paraguay',
      icon: '👥',
      order: 5,
    },
    {
      name: 'Eventos',
      description:
        'Propuestas de meetups, workshops, hackathons y conferencias',
      icon: '🎉',
      order: 6,
    },
  ];

  for (const category of categories) {
    await prisma.ideaCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
  }

  console.log(`✅ Created/Updated ${categories.length} categories`);
}

// Si se ejecuta directamente
if (require.main === module) {
  seedIdeasBoardCategories()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
