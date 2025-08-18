#!/usr/bin/env node

/**
 * Script para verificar que las variables de entorno estén configuradas
 * Se ejecuta antes del build para evitar errores en producción
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_BACKEND_URL'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_SENTRY_DSN',
  'REVALIDATE_TOKEN'
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

console.log('\n🌍 Entorno:', process.env.NODE_ENV || 'development');

if (hasErrors) {
  console.log('\n❌ ERROR: Algunas variables de entorno requeridas no están configuradas.');
  console.log('💡 Solución: Configura las variables en Vercel o en tu archivo .env.local');
  console.log('📖 Ver VERCEL_DEPLOYMENT.md para más detalles');
  process.exit(1);
} else {
  console.log('\n✅ Todas las variables de entorno requeridas están configuradas.');
  console.log('🚀 El build debería funcionar correctamente.');
}
