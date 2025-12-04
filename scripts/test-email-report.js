/**
 * Script de prueba para verificar el envío de reportes de pruebas por email
 *
 * Este script envía un reporte de prueba de ejemplo para verificar que
 * el sistema de emails funciona correctamente.
 *
 * Uso:
 *   node scripts/test-email-report.js
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function sendTestReport() {
  console.log('🧪 AIQUAA - Test de Reporte de Pruebas por Email');
  console.log('='.repeat(60));
  console.log(`🔗 Backend URL: ${BACKEND_URL}`);
  console.log('📧 Destinatario: admin@aiquaa.com');
  console.log('='.repeat(60));

  // Datos de prueba de ejemplo
  const testData = {
    success: true,
    timestamp: new Date().toISOString(),
    duration: 45230,
    summary: {
      total: 156,
      passed: 152,
      failed: 3,
      skipped: 1
    },
    coverage: {
      statements: 85.42,
      branches: 78.91,
      functions: 88.15,
      lines: 85.67
    },
    failures: [
      {
        test: 'UserService › createUser › should validate email format',
        error: `Expected: valid email format
Received: "invalid.email"
at UserService.validateEmail (src/users/user.service.ts:145:15)
at UserService.createUser (src/users/user.service.ts:87:10)`
      },
      {
        test: 'AuthController › login › should return 401 for invalid credentials',
        error: `Expected status code 401
Received: 400
Response body: { "message": "Bad Request" }`
      },
      {
        test: 'ForumService › createThread › should check permissions',
        error: `AssertionError: expected true to be false
at Context.<anonymous> (test/forum.spec.ts:234:28)`
      }
    ],
    type: 'all'
  };

  console.log('\n📦 Enviando datos de prueba...\n');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n');

  try {
    console.log('🚀 Haciendo petición al endpoint...');

    const response = await fetch(`${BACKEND_URL}/api/v1/mailer/test-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();

    console.log('\n✅ Email enviado exitosamente!');
    console.log('📊 Respuesta del servidor:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n📧 Revisa tu email en admin@aiquaa.com');
    console.log('='.repeat(60));

    return true;

  } catch (error) {
    console.error('\n❌ Error enviando el reporte:');
    console.error('   ', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Sugerencias:');
      console.error('   1. Asegúrate de que el backend esté corriendo:');
      console.error('      pnpm dev:back');
      console.error('   2. Verifica la URL del backend:');
      console.error(`      BACKEND_URL=${BACKEND_URL}`);
    }

    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Ejecutar
sendTestReport();
