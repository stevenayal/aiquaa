#!/usr/bin/env node

/**
 * Script para probar el sistema de observabilidad
 * Uso: node scripts/test-observability.js
 */

const http = require('http');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function testObservability() {
  console.log('🧪 Probando sistema de observabilidad...\n');

  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/api/v1/health`,
      method: 'GET',
    },
    {
      name: 'Metrics Endpoint',
      url: `${BASE_URL}/metrics`,
      method: 'GET',
    },
    {
      name: 'Error Test (404)',
      url: `${BASE_URL}/api/v1/nonexistent`,
      method: 'GET',
    },
  ];

  for (const test of tests) {
    try {
      console.log(`📊 Probando: ${test.name}`);
      
      const response = await makeRequest(test.url, test.method);
      
      if (response.headers['x-request-id']) {
        console.log(`✅ ${test.name} - Request ID: ${response.headers['x-request-id']}`);
      } else {
        console.log(`⚠️  ${test.name} - Sin Request ID`);
      }

      if (response.statusCode === 200) {
        console.log(`✅ ${test.name} - Status: ${response.statusCode}`);
      } else if (response.statusCode === 404 && test.name.includes('Error')) {
        console.log(`✅ ${test.name} - Status: ${response.statusCode} (esperado)`);
      } else {
        console.log(`❌ ${test.name} - Status: ${response.statusCode}`);
      }

      // Verificar formato JSON para errores
      if (response.statusCode >= 400 && response.headers['content-type']?.includes('application/problem+json')) {
        console.log(`✅ ${test.name} - Problem details JSON (correcto)`);
      }

    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎯 Pruebas completadas!');
  console.log('\n📝 Para verificar:');
  console.log(`   - Logs: Revisa la consola del backend`);
  console.log(`   - Métricas: ${BASE_URL}/metrics`);
  console.log(`   - Health: ${BASE_URL}/api/v1/health`);
  console.log(`   - Jaeger: http://localhost:16686 (si está corriendo)`);
  console.log(`   - Grafana: http://localhost:3001 (si está corriendo)`);
}

function makeRequest(url, method) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testObservability().catch(console.error);
}

module.exports = { testObservability };
