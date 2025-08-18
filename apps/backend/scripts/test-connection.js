const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔌 Probando conexión a Supabase...');
  
  try {
    // Probar conexión básica
    console.log('📊 Probando consulta simple...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexión exitosa:', result);

    // Verificar si existen las tablas del foro
    console.log('📋 Verificando estructura de tablas...');
    
    try {
      const categories = await prisma.category.findMany({ take: 1 });
      console.log('✅ Tabla categories existe');
    } catch (error) {
      console.log('❌ Tabla categories no existe:', error.message);
    }

    try {
      const threads = await prisma.thread.findMany({ take: 1 });
      console.log('✅ Tabla threads existe');
    } catch (error) {
      console.log('❌ Tabla threads no existe:', error.message);
    }

    try {
      const posts = await prisma.post.findMany({ take: 1 });
      console.log('✅ Tabla posts existe');
    } catch (error) {
      console.log('❌ Tabla posts no existe:', error.message);
    }

    try {
      const threadTags = await prisma.threadTag.findMany({ take: 1 });
      console.log('✅ Tabla thread_tags existe');
    } catch (error) {
      console.log('❌ Tabla thread_tags no existe:', error.message);
    }

    console.log('\n🎯 Resumen de la conexión:');
    console.log('✅ Base de datos: Conectada');
    console.log('✅ Prisma Client: Funcionando');
    console.log('⚠️  Tablas del foro: Necesitan migración');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
