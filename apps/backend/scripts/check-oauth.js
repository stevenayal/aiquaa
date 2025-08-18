#!/usr/bin/env node

/**
 * Script para verificar la configuración OAuth del backend
 * Se ejecuta para verificar que las variables estén configuradas correctamente
 */

require('dotenv').config();

const oauthConfigs = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    name: 'Google OAuth'
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    name: 'GitHub OAuth'
  }
};

console.log('🔍 Verificando configuración OAuth del backend...\n');

let totalConfigured = 0;
let totalOAuth = Object.keys(oauthConfigs).length;

Object.entries(oauthConfigs).forEach(([provider, config]) => {
  console.log(`📋 ${config.name}:`);
  
  const hasClientId = !!config.clientId;
  const hasClientSecret = !!config.clientSecret;
  const isConfigured = hasClientId && hasClientSecret;
  
  if (isConfigured) {
    totalConfigured++;
    console.log(`  ✅ Client ID: ${config.clientId ? 'Configurado' : 'NO CONFIGURADO'}`);
    console.log(`  ✅ Client Secret: ${config.clientSecret ? 'Configurado' : 'NO CONFIGURADO'}`);
    console.log(`  🚀 ${config.name} está listo para usar`);
  } else {
    console.log(`  ❌ Client ID: ${config.clientId ? 'Configurado' : 'NO CONFIGURADO'}`);
    console.log(`  ❌ Client Secret: ${config.clientSecret ? 'Configurado' : 'NO CONFIGURADO'}`);
    console.log(`  ⚠️  ${config.name} no está configurado`);
  }
  
  console.log('');
});

console.log('📊 Resumen de configuración:');
console.log(`  ✅ OAuth configurados: ${totalConfigured}/${totalOAuth}`);
console.log(`  ⚠️  OAuth pendientes: ${totalOAuth - totalConfigured}/${totalOAuth}`);

if (totalConfigured === 0) {
  console.log('\n❌ ERROR: Ningún proveedor OAuth está configurado');
  console.log('💡 Solución: Configura al menos Google OAuth o GitHub OAuth');
  console.log('📖 Ver OAUTH_SETUP.md para más detalles');
  process.exit(1);
} else if (totalConfigured < totalOAuth) {
  console.log('\n⚠️  ADVERTENCIA: Algunos proveedores OAuth no están configurados');
  console.log('💡 Recomendación: Configura todos los proveedores para mejor experiencia de usuario');
} else {
  console.log('\n✅ Todos los proveedores OAuth están configurados correctamente');
  console.log('🚀 El backend está listo para autenticación OAuth');
}

console.log('\n🌍 Entorno:', process.env.NODE_ENV || 'development');
console.log('🔗 Backend URL:', process.env.APP_URL || 'http://localhost:3001');
console.log('🌐 Frontend Origin:', process.env.FRONT_ORIGIN || 'http://localhost:3000');
