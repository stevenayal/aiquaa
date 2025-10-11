#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando entorno de desarrollo para AIQUAA Backend...\n');

// Verificar si existe el archivo .env
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.development.example');
const envLocalPath = path.join(__dirname, 'env.development.local');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creando archivo .env desde env.development.local...');
  
  if (fs.existsSync(envLocalPath)) {
    fs.copyFileSync(envLocalPath, envPath);
    console.log('✅ Archivo .env creado exitosamente');
  } else if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Archivo .env creado desde ejemplo');
  } else {
    console.log('❌ No se encontró archivo de configuración de ejemplo');
    process.exit(1);
  }
} else {
  console.log('✅ Archivo .env ya existe');
}

// Verificar conexiones a servicios externos
console.log('\n🔍 Verificando conexiones a servicios...');

// Verificar Jenkins
try {
  const { execSync } = require('child_process');
  execSync('curl -I http://localhost:9090', { stdio: 'pipe' });
  console.log('✅ Jenkins está disponible en http://localhost:9090');
} catch (error) {
  console.log('⚠️  Jenkins no está disponible en http://localhost:9090');
}

// Verificar SonarQube
try {
  execSync('curl -I http://localhost:9000', { stdio: 'pipe' });
  console.log('✅ SonarQube está disponible en http://localhost:9000');
} catch (error) {
  console.log('⚠️  SonarQube no está disponible en http://localhost:9000');
}

console.log('\n🎯 Configuración completada!');
console.log('📋 Próximos pasos:');
console.log('   1. Configura las credenciales de Jenkins y SonarQube en el archivo .env');
console.log('   2. Configura la base de datos PostgreSQL');
console.log('   3. Ejecuta: npm run prisma:migrate');
console.log('   4. Ejecuta: npm run start:dev');
console.log('\n🔗 URLs de servicios:');
console.log('   - Jenkins: http://localhost:9090');
console.log('   - SonarQube: http://localhost:9000');
console.log('   - Backend: http://localhost:3001');



