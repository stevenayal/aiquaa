#!/usr/bin/env node

/**
 * Script para verificar que las variables de entorno estén configuradas
 * Se ejecuta antes del build para evitar errores en producción
 */

// Cargar variables de entorno desde .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
console.log('🔍 Buscando archivo .env.local en:', envPath);
console.log('📁 Archivo existe:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 Contenido del archivo:', envContent);
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !process.env[key]) {
        process.env[key] = value;
        console.log(`✅ Cargada variable: ${key}=${value}`);
      }
    }
  });
}

const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_BACKEND_URL'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_SENTRY_DSN',
  'REVALIDATE_TOKEN'
];

const oauthEnvVars = [
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_GITHUB_CLIENT_ID'
];

console.log('🔍 Verificando variables de entorno...\n');

let hasErrors = false;

// Verificar variables requeridas
console.log('📋 Variables requeridas:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ❌ ${varName}: NO CONFIGURADA`);
    hasErrors = true;
  }
});

console.log('\n📋 Variables opcionales:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: NO CONFIGURADA (opcional)`);
  }
});

console.log('\n🔐 Variables de OAuth:');
oauthEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: NO CONFIGURADA (OAuth no funcionará)`);
  }
});

console.log('\n🌍 Entorno:', process.env.NODE_ENV || 'development');

if (hasErrors) {
  console.log('\n❌ ERROR: Algunas variables de entorno requeridas no están configuradas.');
  console.log('💡 Solución: Configura las variables en Vercel o en tu archivo .env.local');
  console.log('📖 Ver VERCEL_DEPLOYMENT.md para más detalles');
  process.exit(1);
} else {
  console.log('\n✅ Todas las variables de entorno requeridas están configuradas.');
  console.log('🚀 El build debería funcionar correctamente.');
  
  // Verificar si OAuth está configurado
  const oauthConfigured = oauthEnvVars.some(varName => process.env[varName]);
  if (oauthConfigured) {
    console.log('🔐 OAuth está configurado y funcionará correctamente.');
  } else {
    console.log('⚠️  OAuth no está configurado. Los botones de Google/GitHub no funcionarán.');
  }
}
