/* eslint-disable */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Insertando datos de prueba del foro en Supabase...');

  try {
    // Crear categorías por defecto
    const categories = [
      {
        name: 'General',
        description: 'Discusiones generales sobre QA y testing',
        slug: 'general',
      },
      {
        name: 'Tecnología',
        description: 'Herramientas y tecnologías de testing',
        slug: 'tecnologia',
      },
      {
        name: 'QA',
        description: 'Preguntas específicas sobre Quality Assurance',
        slug: 'qa',
      },
      {
        name: 'Testing',
        description: 'Técnicas y metodologías de testing',
        slug: 'testing',
      },
      {
        name: 'Herramientas',
        description: 'Herramientas y software de testing',
        slug: 'herramientas',
      },
      {
        name: 'Carrera',
        description: 'Desarrollo profesional y oportunidades laborales',
        slug: 'carrera',
      },
      {
        name: 'Eventos',
        description: 'Eventos, conferencias y meetups',
        slug: 'eventos',
      },
    ];

    console.log('📂 Creando categorías...');
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
      'selenium',
      'cypress',
      'playwright',
      'jest',
      'junit',
      'testng',
      'automation',
      'manual-testing',
      'api-testing',
      'performance',
      'security',
      'mobile',
      'web',
      'desktop',
      'ci-cd',
      'devops',
    ];

    console.log('🏷️ Creando tags...');
    for (const tagName of tags) {
      await prisma.threadTag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
    }
    console.log('✅ Tags creados exitosamente');

    // Crear un usuario de prueba si no existe
    console.log('👤 Creando usuario de prueba...');
    const testUser = await prisma.user.upsert({
      where: { email: 'test@aiquaa.com' },
      update: {},
      create: {
        email: 'test@aiquaa.com',
        name: 'Usuario de Prueba',
        role: 'USER',
        emailVerifiedAt: new Date(),
      },
    });
    console.log('✅ Usuario de prueba creado:', testUser.email);

    // Crear algunos threads de ejemplo
    const generalCategory = await prisma.category.findUnique({
      where: { slug: 'general' },
    });

    if (generalCategory) {
      console.log('📝 Creando threads de ejemplo...');
      const exampleThreads = [
        {
          title: '¿Cómo empezar en QA Automation?',
          content:
            'Hola comunidad! Soy nuevo en QA y me gustaría saber cuáles son los primeros pasos para aprender automation. ¿Qué herramientas recomiendan para principiantes? ¿Hay algún curso o recurso que consideren esencial?',
          categoryId: generalCategory.id,
          authorId: testUser.id,
          slug: 'como-empezar-en-qa-automation',
          tags: ['automation', 'qa'],
          viewCount: 25,
        },
        {
          title: 'Comparación: Selenium vs Cypress vs Playwright',
          content:
            'Estoy evaluando diferentes herramientas de testing para mi proyecto. He usado Selenium pero quiero explorar alternativas más modernas. ¿Alguien puede compartir su experiencia con Cypress y Playwright? ¿Cuáles son las ventajas y desventajas de cada uno?',
          categoryId: generalCategory.id,
          authorId: testUser.id,
          slug: 'comparacion-selenium-cypress-playwright',
          tags: ['selenium', 'cypress', 'playwright', 'automation'],
          viewCount: 42,
        },
        {
          title: 'Mejores prácticas para testing de APIs',
          content:
            'Estoy desarrollando tests para una API REST y me gustaría conocer las mejores prácticas. ¿Cómo organizan sus tests? ¿Qué herramientas usan para mockear servicios externos? ¿Cómo manejan la limpieza de datos de prueba?',
          categoryId: generalCategory.id,
          authorId: testUser.id,
          slug: 'mejores-practicas-testing-apis',
          tags: ['api-testing', 'automation', 'best-practices'],
          viewCount: 18,
        },
      ];

      for (const threadData of exampleThreads) {
        const { tags, ...thread } = threadData;

        await prisma.thread.upsert({
          where: { slug: thread.slug },
          update: {},
          create: {
            ...thread,
            threadTags: {
              connectOrCreate: tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            },
          },
        });
      }

      console.log('✅ Threads de ejemplo creados exitosamente');
    }

    console.log(
      '🎉 Datos de prueba del foro insertados exitosamente en Supabase!'
    );
    console.log('🌐 Puedes verificar en tu proyecto Supabase');
  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en el script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
