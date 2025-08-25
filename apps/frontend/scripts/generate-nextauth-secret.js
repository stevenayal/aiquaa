#!/usr/bin/env node

/**
 * Script para generar un NextAuth secret seguro
 * Uso: node scripts/generate-nextauth-secret.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function main() {
  console.log('🔐 Generando NextAuth Secret...\n');
  
  const secret = generateSecret();
  
  console.log('✅ Secret generado exitosamente:');
  console.log('='.repeat(50));
  console.log(secret);
  console.log('='.repeat(50));
  
  console.log('\n📋 Copia este valor en tu archivo .env.local:');
  console.log(`NEXTAUTH_SECRET=${secret}`);
  
  console.log('\n⚠️  IMPORTANTE:');
  console.log('- Guarda este secret de forma segura');
  console.log('- No lo compartas ni lo subas al repositorio');
  console.log('- Usa un secret diferente para cada entorno (dev, staging, prod)');
  
  console.log('\n🔧 Para configurar en Vercel:');
  console.log('1. Ve a tu proyecto en Vercel');
  console.log('2. Settings → Environment Variables');
  console.log('3. Agrega NEXTAUTH_SECRET con este valor');
}

if (require.main === module) {
  main();
}

module.exports = { generateSecret };
