const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    // Probar conexión básica
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Probar consulta de comentarios
    const comments = await prisma.comment.findMany({
      take: 5
    });
    console.log(`✅ Consulta de comentarios exitosa. Encontrados: ${comments.length} comentarios`);
    
    // Probar creación de un comentario de prueba
    const testComment = await prisma.comment.create({
      data: {
        name: 'Test User',
        message: 'Este es un comentario de prueba',
        isAnonymous: false,
        userAgent: 'Test Script',
        ip: '127.0.0.1'
      }
    });
    console.log('✅ Creación de comentario exitosa:', testComment.id);
    
    // Eliminar el comentario de prueba
    await prisma.comment.delete({
      where: { id: testComment.id }
    });
    console.log('✅ Eliminación de comentario de prueba exitosa');
    
  } catch (error) {
    console.error('❌ Error en la conexión a la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection(); 