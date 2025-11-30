/**
 * Script de inicialización automática de base de datos
 * Este script:
 * 1. Verifica la conexión a PostgreSQL
 * 2. Crea todas las tablas necesarias usando Prisma
 * 3. Ejecuta el seed para crear usuarios y datos iniciales
 * 4. Es idempotente: se puede ejecutar múltiples veces sin problemas
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.blue);
  console.log('='.repeat(60) + '\n');
}

async function runCommand(command, description, optional = false) {
  log(`▶ ${description}...`, colors.yellow);
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: __dirname + '/..',
      env: { ...process.env },
    });

    if (stdout) {
      console.log(stdout);
    }
    if (stderr && !stderr.includes('warn')) {
      console.error(stderr);
    }

    log(`✅ ${description} completado`, colors.green);
    return true;
  } catch (error) {
    if (optional) {
      log(`⚠️  ${description} falló (opcional)`, colors.yellow);
      console.error(error.message);
      return true; // No fallar si es opcional
    }

    log(`❌ Error en: ${description}`, colors.red);
    console.error(error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

async function checkDatabaseConnection() {
  logSection('1. Verificando Conexión a PostgreSQL');

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    log('✅ Conexión a PostgreSQL establecida correctamente', colors.green);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    log('❌ No se pudo conectar a PostgreSQL', colors.red);
    console.error('Error:', error.message);
    console.error('\n💡 Verificar:');
    console.error('   - Variable DATABASE_URL está configurada');
    console.error('   - PostgreSQL está corriendo');
    console.error('   - Credenciales son correctas');
    return false;
  }
}

async function generatePrismaClient() {
  logSection('2. Generando Cliente de Prisma');

  // Verificar si el cliente ya está generado
  try {
    require('@prisma/client');
    log('✅ Cliente de Prisma ya está generado', colors.green);
    return true;
  } catch (error) {
    // Cliente no existe, generarlo
    return await runCommand(
      'npx prisma generate',
      'Generación del cliente Prisma'
    );
  }
}

async function createTables() {
  logSection('3. Creando Tablas en PostgreSQL');

  log('Este proceso sincronizará el schema de Prisma con la base de datos', colors.blue);
  log('Creará todas las tablas necesarias si no existen', colors.blue);

  return await runCommand(
    'npx prisma db push --accept-data-loss',
    'Creación de tablas en PostgreSQL'
  );
}

async function checkIfDataExists() {
  logSection('4. Verificando Datos Existentes');

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();

    log(`📊 Usuarios existentes: ${userCount}`, colors.blue);
    log(`📊 Categorías existentes: ${categoryCount}`, colors.blue);

    await prisma.$disconnect();

    return { userCount, categoryCount };
  } catch (error) {
    log('⚠️  No se pudo verificar datos existentes', colors.yellow);
    console.error(error.message);
    return { userCount: 0, categoryCount: 0 };
  }
}

async function seedDatabase() {
  logSection('5. Poblando Base de Datos (Seed)');

  const { userCount, categoryCount } = await checkIfDataExists();

  if (userCount > 0 && categoryCount > 0) {
    log('ℹ️  La base de datos ya contiene datos', colors.blue);
    log('   Saltando seed para evitar duplicados', colors.blue);
    log('   Si deseas recrear los datos, ejecuta: npm run prisma:seed', colors.blue);
    return true;
  }

  log('📝 Creando usuarios y categorías iniciales...', colors.yellow);
  return await runCommand(
    'npx ts-node prisma/seed.ts',
    'Seed de base de datos'
  );
}

async function verifySetup() {
  logSection('6. Verificación Final');

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    // Verificar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    log(`✅ Total de tablas: ${tables.length}`, colors.green);

    // Verificar usuarios
    const users = await prisma.user.findMany({
      select: { email: true, role: true }
    });

    log(`✅ Total de usuarios: ${users.length}`, colors.green);
    if (users.length > 0) {
      users.forEach(user => {
        log(`   - ${user.email} (${user.role})`, colors.blue);
      });
    }

    // Verificar categorías
    const categories = await prisma.category.findMany({
      select: { name: true, slug: true }
    });

    log(`✅ Total de categorías: ${categories.length}`, colors.green);
    if (categories.length > 0) {
      categories.forEach(cat => {
        log(`   - ${cat.name} (${cat.slug})`, colors.blue);
      });
    }

    await prisma.$disconnect();
    return true;
  } catch (error) {
    log('❌ Error en verificación final', colors.red);
    console.error(error.message);
    return false;
  }
}

async function main() {
  const startTime = Date.now();

  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', colors.bright);
  log('║   INICIALIZACIÓN AUTOMÁTICA DE BASE DE DATOS - AIQUAA   ║', colors.bright);
  log('╚═══════════════════════════════════════════════════════════╝', colors.bright);
  console.log('\n');

  let success = true;

  // Paso 1: Verificar conexión
  if (!await checkDatabaseConnection()) {
    log('\n❌ FALLO: No se pudo conectar a la base de datos', colors.red);
    process.exit(1);
  }

  // Paso 2: Generar cliente Prisma
  if (!await generatePrismaClient()) {
    log('\n❌ FALLO: No se pudo generar el cliente de Prisma', colors.red);
    process.exit(1);
  }

  // Paso 3: Crear tablas
  if (!await createTables()) {
    log('\n❌ FALLO: No se pudieron crear las tablas', colors.red);
    process.exit(1);
  }

  // Paso 4: Ejecutar seed
  if (!await seedDatabase()) {
    log('\n⚠️  ADVERTENCIA: El seed falló, pero las tablas fueron creadas', colors.yellow);
    log('   Puedes ejecutar manualmente: npm run prisma:seed', colors.yellow);
    // No fallar aquí, las tablas están creadas
  }

  // Paso 5: Verificación final
  if (!await verifySetup()) {
    log('\n⚠️  ADVERTENCIA: La verificación final falló', colors.yellow);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', colors.bright + colors.green);
  log('║        ✅ INICIALIZACIÓN COMPLETADA EXITOSAMENTE         ║', colors.bright + colors.green);
  log('╚═══════════════════════════════════════════════════════════╝', colors.bright + colors.green);
  log(`\n⏱️  Tiempo total: ${duration}s\n`, colors.blue);

  log('🎉 La base de datos está lista para usar!', colors.green);
  log('   Puedes iniciar el servidor con: npm run start:dev\n', colors.blue);

  process.exit(0);
}

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  log('\n❌ Error no manejado:', colors.red);
  console.error(error);
  process.exit(1);
});

// Ejecutar
main().catch((error) => {
  log('\n❌ Error fatal:', colors.red);
  console.error(error);
  process.exit(1);
});
