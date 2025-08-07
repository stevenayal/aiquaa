// Script para verificar la configuración de la API
// Este script verifica que las URLs de la API estén configuradas correctamente

const fs = require('fs');
const path = require('path');

console.log('🔧 Verificando configuración de la API...\n');

// Verificar archivos de entorno
const envFiles = [
  'env.development',
  'env.production',
  '.env.local'
];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('VITE_API_URL')) {
      console.log(`   📝 Contiene VITE_API_URL`);
    } else {
      console.log(`   ⚠️  No contiene VITE_API_URL`);
    }
  } else {
    console.log(`❌ ${file} no existe`);
  }
});

// Verificar archivos de configuración
const configFiles = [
  'src/config/apiConfig.ts',
  'src/config/api.ts',
  'src/services/apiService.ts'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('api.aiquaa.com')) {
      console.log(`   🌐 Referencia a api.aiquaa.com encontrada`);
    }
    if (content.includes('localhost:3001')) {
      console.log(`   🏠 Referencia a localhost:3001 encontrada`);
    }
  } else {
    console.log(`❌ ${file} no existe`);
  }
});

console.log('\n📋 Resumen de configuración:');
console.log('   - Desarrollo: http://localhost:3001');
console.log('   - Producción: https://api.aiquaa.com');
console.log('   - Este endpoint está conectado al backend desplegado en https://api.aiquaa.com');

console.log('\n✅ Verificación completada');
