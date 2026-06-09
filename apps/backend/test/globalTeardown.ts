import { PostgreSqlContainer } from '@testcontainers/postgresql';

let container: InstanceType<typeof PostgreSqlContainer>;

export default async function globalTeardown() {
  console.log('🧹 Limpiando contenedor de PostgreSQL...');

  if (container) {
    await container.stop();
    console.log('✅ Contenedor de PostgreSQL detenido');
  }
}
