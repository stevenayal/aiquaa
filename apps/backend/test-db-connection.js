/**
 * Quick database connection test
 * Usage: node test-db-connection.js
 */

const { PrismaClient } = require('@prisma/client');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

async function testConnection() {
  console.log(`\n${colors.blue}🔍 Testing database connection...${colors.reset}\n`);

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    console.log(`${colors.red}❌ DATABASE_URL not found in environment variables${colors.reset}`);
    console.log(`${colors.yellow}Set it with: export DATABASE_URL="postgresql://..."${colors.reset}\n`);
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  // Mask password for display
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`${colors.blue}📍 Database URL: ${maskedUrl}${colors.reset}\n`);

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    console.log(`${colors.yellow}⏳ Attempting to connect...${colors.reset}`);
    await prisma.$connect();
    console.log(`${colors.green}✅ Connection successful!${colors.reset}\n`);

    // Try a simple query
    console.log(`${colors.yellow}⏳ Testing query...${colors.reset}`);
    const result = await prisma.$queryRaw`SELECT current_database(), version()`;
    console.log(`${colors.green}✅ Query successful!${colors.reset}`);
    console.log(`${colors.blue}Database:${colors.reset}`, result[0].current_database);
    console.log(`${colors.blue}Version:${colors.reset}`, result[0].version.split(' ').slice(0, 2).join(' '));

    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `;

    console.log(`${colors.blue}Tables:${colors.reset}`, tables[0].count, 'tables found\n');

    await prisma.$disconnect();
    console.log(`${colors.green}✅ All checks passed!${colors.reset}\n`);
    process.exit(0);
  } catch (error) {
    console.log(`${colors.red}❌ Connection failed!${colors.reset}\n`);
    console.error(`${colors.red}Error:${colors.reset}`, error.message);

    if (error.message.includes('P1001')) {
      console.log(`\n${colors.yellow}💡 Common causes:${colors.reset}`);
      console.log(`   - Database server is not running`);
      console.log(`   - Wrong host or port`);
      console.log(`   - Firewall blocking connection`);
    } else if (error.message.includes('P1000')) {
      console.log(`\n${colors.yellow}💡 Authentication failed:${colors.reset}`);
      console.log(`   - Check username and password`);
    }

    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
