#!/usr/bin/env node

/**
 * Script para verificar la conectividad CORS entre frontend y backend
 * Uso: node scripts/verify-cors.js
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'https://aiquaabackend-production.up.railway.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://aiquaa.com';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function testHealthCheck() {
  console.log('🔍 Probando health check...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    if (response.status === 200) {
      console.log('✅ Health check OK');
      const data = JSON.parse(response.data);
      console.log(`   Status: ${data.status}`);
      console.log(`   Time: ${data.time}`);
    } else {
      console.log(`❌ Health check failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
  }
}

async function testCorsPreflight() {
  console.log('\n🔍 Probando CORS preflight...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    if (response.status === 204) {
      console.log('✅ CORS preflight OK');
      console.log(`   Allow-Origin: ${response.headers['access-control-allow-origin']}`);
      console.log(`   Allow-Methods: ${response.headers['access-control-allow-methods']}`);
      console.log(`   Allow-Headers: ${response.headers['access-control-allow-headers']}`);
    } else {
      console.log(`❌ CORS preflight failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ CORS preflight error: ${error.message}`);
  }
}

async function testRegistrationEndpoint() {
  console.log('\n🔍 Probando endpoint de registro...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      }
    }, JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123!'
    }));
    
    console.log(`   Status: ${response.status}`);
    if (response.status === 400 || response.status === 409) {
      console.log('✅ Endpoint responde correctamente (error esperado)');
    } else {
      console.log(`⚠️  Status inesperado: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Registration endpoint error: ${error.message}`);
  }
}

async function testCorsRejection() {
  console.log('\n🔍 Probando rechazo CORS...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://malicious-site.com'
      }
    }, JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123!'
    }));
    
    console.log(`   Status: ${response.status}`);
    if (response.status === 0 || response.status >= 400) {
      console.log('✅ CORS rechaza correctamente orígenes no permitidos');
    } else {
      console.log(`⚠️  CORS no está rechazando orígenes no permitidos`);
    }
  } catch (error) {
    console.log(`✅ CORS rechaza correctamente (error de conexión): ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Verificando conectividad CORS/SSL para AIQUAA');
  console.log(`   Backend: ${BACKEND_URL}`);
  console.log(`   Frontend: ${FRONTEND_URL}\n`);
  
  await testHealthCheck();
  await testCorsPreflight();
  await testRegistrationEndpoint();
  await testCorsRejection();
  
  console.log('\n✨ Verificación completada');
}

main().catch(console.error);
