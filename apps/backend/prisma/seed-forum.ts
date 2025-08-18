import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Insertando datos de prueba del foro...');

  // Crear categorías por defecto
  const categories = [
    { name: 'General', description: 'Discusiones generales sobre QA y testing', slug: 'general' },
    { name: 'Tecnología', description: 'Herramientas y tecnologías de testing', slug: 'tecnologia' },
    { name: 'QA', description: 'Preguntas específicas sobre Quality Assurance', slug: 'qa' },
    { name: 'Testing', description: 'Técnicas y metodologías de testing', slug: 'testing' },
    { name: 'Herramientas', description: 'Herramientas y software de testing', slug: 'herramientas' },
    { name: 'Carrera', description: 'Desarrollo profesional y oportunidades laborales', slug: 'carrera' },
    { name: 'Eventos', description: 'Eventos, conferencias y meetups', slug: 'eventos' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categorías creadas exitosamente');

  // Crear algunos tags populares
  const tags = [
    'selenium', 'cypress', 'playwright', 'jest', 'junit', 'testng',
    'automation', 'manual-testing', 'api-testing', 'performance',
    'security', 'mobile', 'web', 'desktop', 'ci-cd', 'devops'
  ];

  for (const tagName of tags) {
    await prisma.threadTag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
  }

  console.log('✅ Tags creados exitosamente');

  // Crear algunos threads de ejemplo
  const generalCategory = await prisma.category.findUnique({ where: { slug: 'general' } });
  
  if (generalCategory) {
    const exampleThreads = [
      {
        title: '¿Cómo empezar en QA Automation?',
        content: 'Hola comunidad! Soy nuevo en QA y me gustaría saber cuáles son los primeros pasos para aprender automation. ¿Qué herramientas recomiendan para principiantes? ¿Hay algún curso o recurso que consideren esencial?',
        categoryId: generalCategory.id,
        authorId: 1, // Asumiendo que existe un usuario con ID 1
        slug: 'como-empezar-en-qa-automation',
        tags: ['automation', 'qa'],
        viewCount: 25,
      },
      {
        title: 'Comparación: Selenium vs Cypress vs Playwright',
        content: 'Estoy evaluando diferentes herramientas de testing para mi proyecto. He usado Selenium pero quiero explorar alternativas más modernas. ¿Alguien puede compartir su experiencia con Cypress y Playwright? ¿Cuáles son las ventajas y desventajas de cada uno?',
        categoryId: generalCategory.id,
        authorId: 1,
        slug: 'comparacion-selenium-cypress-playwright',
        tags: ['selenium', 'cypress', 'playwright', 'automation'],
        viewCount: 42,
      },
      {
        title: 'Mejores prácticas para testing de APIs',
        content: 'Estoy desarrollando tests para una API REST y me gustaría conocer las mejores prácticas. ¿Cómo organizan sus tests? ¿Qué herramientas usan para mockear servicios externos? ¿Cómo manejan la limpieza de datos de prueba?',
        categoryId: generalCategory.id,
        authorId: 1,
        slug: 'mejores-practicas-testing-apis',
        tags: ['api-testing', 'automation', 'best-practices'],
        viewCount: 18,
      }
    ];

    for (const threadData of exampleThreads) {
      const { tags, ...thread } = threadData;
      
      await prisma.thread.upsert({
        where: { slug: thread.slug },
        update: {},
        create: {
          ...thread,
          tags: {
            connectOrCreate: tags.map(tag => ({
              where: { name: tag },
              create: { name: tag }
            }))
          }
        },
      });
    }

    console.log('✅ Threads de ejemplo creados exitosamente');
  }

  console.log('🎉 Datos de prueba del foro insertados exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error insertando datos de prueba:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
