/**
 * Script de verificación de conexión a Railway PostgreSQL
 * Ejecutar: node verify-db-connection.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function verifyConnection() {
  console.log('🔍 Verificando conexión a Railway PostgreSQL...\n');

  try {
    // Test 1: Conexión básica
    console.log('📡 Test 1: Probando conexión básica...');
    await prisma.$connect();
    console.log('✅ Conexión establecida correctamente\n');

    // Test 2: Contar usuarios
    console.log('👥 Test 2: Contando usuarios en la base de datos...');
    const userCount = await prisma.user.count();
    console.log(`✅ Total de usuarios: ${userCount}\n`);

    // Test 3: Listar usuarios
    console.log('📋 Test 3: Listando usuarios...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });

    if (users.length > 0) {
      console.log('✅ Usuarios encontrados:');
      users.forEach(user => {
        console.log(`   - ID: ${user.id}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Nombre: ${user.name}`);
        console.log(`     Rol: ${user.role}`);
        console.log(`     Email verificado: ${user.emailVerifiedAt ? 'Sí' : 'No'}`);
        console.log(`     Creado: ${user.createdAt.toISOString()}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No hay usuarios en la base de datos');
      console.log('   Ejecuta: npm run prisma:seed\n');
    }

    // Test 4: Contar categorías
    console.log('📁 Test 4: Contando categorías...');
    const categoryCount = await prisma.category.count();
    console.log(`✅ Total de categorías: ${categoryCount}\n`);

    // Test 5: Listar categorías
    console.log('📂 Test 5: Listando categorías...');
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });

    if (categories.length > 0) {
      console.log('✅ Categorías encontradas:');
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug}): ${cat.description || 'Sin descripción'}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No hay categorías en la base de datos\n');
    }

    // Test 6: Verificar tablas
    console.log('🗄️  Test 6: Verificando estructura de la base de datos...');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('✅ Tablas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    console.log('');

    // Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Resumen:`);
    console.log(`   - Tablas: ${tables.length}`);
    console.log(`   - Usuarios: ${userCount}`);
    console.log(`   - Categorías: ${categoryCount}`);
    console.log('');
    console.log('🎉 La base de datos Railway está configurada correctamente!');

  } catch (error) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR EN LA VERIFICACIÓN');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);

    if (error.code === 'P1001') {
      console.error('\n🔧 Posible solución:');
      console.error('   - Verifica que DATABASE_URL esté configurado en .env');
      console.error('   - Verifica que la base de datos Railway esté corriendo');
      console.error('   - Verifica tu conexión a internet');
    }

    if (error.code === 'P2021') {
      console.error('\n🔧 Posible solución:');
      console.error('   - La tabla no existe. Ejecuta: npx prisma db push');
    }

    console.error('');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
verifyConnection()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
