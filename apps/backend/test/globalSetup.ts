import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { join } from 'path';

let container: StartedPostgreSqlContainer;

export default async function globalSetup() {
  console.log('🚀 Iniciando contenedor de PostgreSQL para tests...');

  try {
    container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('test')
      .withUsername('test')
      .withPassword('test')
      .withExposedPorts(5432)
      .start();
  } catch (err) {
    console.warn('⚠️ Docker no disponible — tests de integración omitidos.');
    process.env.SKIP_INTEGRATION_TESTS = 'true';
    return;
  }

  const databaseUrl = container.getConnectionUri();
  process.env.TEST_DATABASE_URL = databaseUrl;
  process.env.DATABASE_URL = databaseUrl;

  console.log(`📊 Base de datos de prueba iniciada en: ${databaseUrl}`);

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
