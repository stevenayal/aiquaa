import { PostgreSQLContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { join } from 'path';

let container: PostgreSQLContainer;

export default async function globalSetup() {
  console.log('🚀 Iniciando contenedor de PostgreSQL para tests...');
  
  // Crear contenedor PostgreSQL
  container = new PostgreSQLContainer('postgres:15-alpine')
    .withDatabase('test')
    .withUsername('test')
    .withPassword('test')
    .withExposedPorts(5432);

  await container.start();

  // Obtener URL de conexión
  const databaseUrl = container.getConnectionUri();
  process.env.TEST_DATABASE_URL = databaseUrl;
  process.env.DATABASE_URL = databaseUrl;

  console.log(`📊 Base de datos de prueba iniciada en: ${databaseUrl}`);

  // Ejecutar migraciones
  try {
    console.log('🔄 Ejecutando migraciones...');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
    });

    console.log('🌱 Ejecutando seed...');
    execSync('npx ts-node prisma/seed.ts', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('❌ Error ejecutando migraciones o seed:', error);
    throw error;
  }

  console.log('✅ Configuración global completada');
}
