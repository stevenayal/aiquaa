/* eslint-disable */
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando migración del foro...');

try {
  // Generar el cliente de Prisma
  console.log('📦 Generando cliente de Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente de Prisma generado');

  // Crear la migración
  console.log('📝 Creando migración del foro...');
  execSync('npx prisma migrate dev --name add_forum_features --create-only', {
    stdio: 'inherit',
  });
  console.log('✅ Migración creada');

  // Aplicar la migración
  console.log('🔧 Aplicando migración...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migración aplicada exitosamente');

  console.log('🎉 Foro migrado exitosamente!');
  console.log('📊 Puedes verificar el estado en tu proyecto Supabase');
} catch (error) {
  console.error('❌ Error durante la migración:', error.message);
  process.exit(1);
}
