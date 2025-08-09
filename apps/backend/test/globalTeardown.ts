import { PostgreSQLContainer } from '@testcontainers/postgresql';

let container: PostgreSQLContainer;

export default async function globalTeardown() {
  console.log('🧹 Limpiando contenedor de PostgreSQL...');
  
  if (container) {
    await container.stop();
    console.log('✅ Contenedor de PostgreSQL detenido');
  }
}
