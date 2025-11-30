/**
 * Script de Pruebas E2E Post-Deployment
 * Verifica que el flujo completo de login funcione en producción
 *
 * Ejecutar: node scripts/e2e-post-deployment.js
 */

const https = require('https');
const http = require('http');

// Configuración
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://aiquaa.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Usuario de prueba (creado automáticamente por el seed)
const TEST_USER = {
  email: 'demo@aiquaa.com',
  password: 'Demo123!'
};

// Colores para logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, colors.bright + colors.blue);
  console.log('='.repeat(70) + '\n');
}

function logTest(testName) {
  log(`🧪 Test: ${testName}`, colors.cyan);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

/**
 * Función helper para hacer requests HTTP/HTTPS
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AIQUAA-E2E-Test/1.0',
        ...options.headers,
      },
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data,
          });
        } catch (error) {
          // Si no es JSON, devolver raw data
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Test 1: Verificar que el backend esté accesible
 */
async function testBackendHealth() {
  logTest('Backend Health Check');

  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);

    if (response.status === 200) {
      logSuccess('Backend está accesible');
      logInfo(`Status: ${response.status}`);
      if (response.data) {
        logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
      }
      return true;
    } else {
      logError(`Backend respondió con status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`No se pudo conectar al backend: ${error.message}`);
    logWarning(`URL probada: ${BACKEND_URL}/health`);
    return false;
  }
}

/**
 * Test 2: Verificar que Swagger esté disponible
 */
async function testSwaggerDocs() {
  logTest('Swagger API Documentation');

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/docs-json`);

    if (response.status === 200 && response.data) {
      logSuccess('Swagger docs disponibles');
      logInfo(`API Title: ${response.data.info?.title || 'N/A'}`);
      logInfo(`API Version: ${response.data.info?.version || 'N/A'}`);

      // Contar endpoints
      const paths = Object.keys(response.data.paths || {});
      logInfo(`Total endpoints: ${paths.length}`);

      return true;
    } else {
      logError(`Swagger docs respondió con status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`No se pudo acceder a Swagger: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Probar login con credenciales válidas
 */
async function testLoginValid() {
  logTest('Login con credenciales válidas (demo@aiquaa.com)');

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      body: {
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    });

    if (response.status === 200 || response.status === 201) {
      logSuccess('Login exitoso');

      if (response.data) {
        logInfo(`Usuario: ${response.data.user?.email || 'N/A'}`);
        logInfo(`Rol: ${response.data.user?.role || 'N/A'}`);
        logInfo(`Access Token: ${response.data.access_token ? '✅ Presente' : '❌ Ausente'}`);

        if (response.data.access_token) {
          // Guardar token para pruebas posteriores
          return { success: true, token: response.data.access_token };
        }
      }

      return { success: true };
    } else {
      logError(`Login falló con status ${response.status}`);
      if (response.data) {
        logError(`Error: ${JSON.stringify(response.data, null, 2)}`);
      }
      return { success: false };
    }
  } catch (error) {
    logError(`Error al intentar login: ${error.message}`);
    return { success: false };
  }
}

/**
 * Test 4: Probar login con credenciales inválidas
 */
async function testLoginInvalid() {
  logTest('Login con credenciales inválidas');

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      body: {
        email: TEST_USER.email,
        password: 'contraseña-incorrecta-123',
      },
    });

    if (response.status === 401) {
      logSuccess('El backend rechaza credenciales inválidas correctamente');
      return true;
    } else if (response.status === 200) {
      logError('¡PROBLEMA DE SEGURIDAD! El backend aceptó credenciales inválidas');
      return false;
    } else {
      logWarning(`Respuesta inesperada: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Error al intentar login inválido: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Verificar endpoint /me con token válido
 */
async function testAuthenticatedEndpoint(token) {
  if (!token) {
    logWarning('No hay token disponible, saltando test de endpoint autenticado');
    return true;
  }

  logTest('Endpoint autenticado /auth/me');

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      logSuccess('Endpoint autenticado funciona correctamente');
      if (response.data) {
        logInfo(`Usuario autenticado: ${response.data.email || 'N/A'}`);
        logInfo(`Nombre: ${response.data.name || 'N/A'}`);
      }
      return true;
    } else {
      logError(`Endpoint /me respondió con status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Error al acceder a endpoint autenticado: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Verificar que el frontend esté accesible
 */
async function testFrontendAccessible() {
  logTest('Frontend accesible en Vercel');

  try {
    const response = await makeRequest(FRONTEND_URL);

    if (response.status === 200) {
      logSuccess('Frontend está accesible');
      logInfo(`URL: ${FRONTEND_URL}`);

      // Verificar que sea HTML
      if (response.rawData && response.rawData.includes('<html')) {
        logSuccess('Respuesta es HTML válida');
      }

      return true;
    } else {
      logError(`Frontend respondió con status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`No se pudo acceder al frontend: ${error.message}`);
    logWarning(`URL probada: ${FRONTEND_URL}`);
    return false;
  }
}

/**
 * Test 7: Verificar página de login
 */
async function testLoginPage() {
  logTest('Página de login /login');

  try {
    const response = await makeRequest(`${FRONTEND_URL}/login`);

    if (response.status === 200) {
      logSuccess('Página de login accesible');

      // Verificar que contenga elementos esperados
      const hasLoginElements =
        response.rawData.includes('login') ||
        response.rawData.includes('email') ||
        response.rawData.includes('password');

      if (hasLoginElements) {
        logSuccess('Página contiene elementos de login');
      } else {
        logWarning('No se detectaron elementos de login en la página');
      }

      return true;
    } else {
      logError(`Página de login respondió con status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Error al acceder a página de login: ${error.message}`);
    return false;
  }
}

/**
 * Test 8: Verificar CORS
 */
async function testCORS() {
  logTest('Configuración CORS');

  try {
    const response = await makeRequest(`${BACKEND_URL}/health`, {
      headers: {
        'Origin': FRONTEND_URL,
      },
    });

    const corsHeader = response.headers['access-control-allow-origin'];

    if (corsHeader) {
      if (corsHeader === '*' || corsHeader === FRONTEND_URL) {
        logSuccess('CORS configurado correctamente');
        logInfo(`Access-Control-Allow-Origin: ${corsHeader}`);
        return true;
      } else {
        logWarning(`CORS permite: ${corsHeader}`);
        logWarning(`Frontend esperado: ${FRONTEND_URL}`);
        return false;
      }
    } else {
      logError('No se encontró header CORS');
      return false;
    }
  } catch (error) {
    logError(`Error al verificar CORS: ${error.message}`);
    return false;
  }
}

/**
 * Función principal
 */
async function runE2ETests() {
  const startTime = Date.now();

  console.log('\n');
  log('╔════════════════════════════════════════════════════════════════════╗', colors.bright);
  log('║         PRUEBAS E2E POST-DEPLOYMENT - AIQUAA                      ║', colors.bright);
  log('╚════════════════════════════════════════════════════════════════════╝', colors.bright);
  console.log('\n');

  log('📋 Configuración:', colors.bright);
  logInfo(`Frontend: ${FRONTEND_URL}`);
  logInfo(`Backend: ${BACKEND_URL}`);
  logInfo(`Usuario de prueba: ${TEST_USER.email}`);
  console.log('');

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  const tests = [
    { name: 'Backend Health Check', fn: testBackendHealth },
    { name: 'Swagger API Docs', fn: testSwaggerDocs },
    { name: 'Login Válido', fn: testLoginValid },
    { name: 'Login Inválido', fn: testLoginInvalid },
    { name: 'Frontend Accesible', fn: testFrontendAccessible },
    { name: 'Página de Login', fn: testLoginPage },
    { name: 'Configuración CORS', fn: testCORS },
  ];

  let authToken = null;

  for (const test of tests) {
    logSection(`Test ${results.total + 1}/${tests.length}: ${test.name}`);

    try {
      const result = await test.fn(authToken);

      // Si el test de login devuelve un token, guardarlo
      if (test.name === 'Login Válido' && result?.token) {
        authToken = result.token;
      }

      const success = result === true || result?.success === true;

      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }

      results.total++;

      console.log('');
    } catch (error) {
      logError(`Error inesperado: ${error.message}`);
      results.failed++;
      results.total++;
      console.log('');
    }
  }

  // Si obtuvimos un token, probar endpoint autenticado
  if (authToken) {
    logSection(`Test ${results.total + 1}/${tests.length + 1}: Endpoint Autenticado`);
    const result = await testAuthenticatedEndpoint(authToken);
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    results.total++;
    console.log('');
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Resumen final
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════════════╗', colors.bright);
  log('║                      RESUMEN DE PRUEBAS                           ║', colors.bright);
  log('╚════════════════════════════════════════════════════════════════════╝', colors.bright);
  console.log('');

  log(`📊 Total de pruebas: ${results.total}`, colors.bright);
  logSuccess(`Exitosas: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Fallidas: ${results.failed}`);
  } else {
    logSuccess(`Fallidas: ${results.failed}`);
  }
  console.log('');
  logInfo(`⏱️  Tiempo total: ${duration}s`);
  console.log('');

  if (results.failed === 0) {
    log('╔════════════════════════════════════════════════════════════════════╗', colors.bright + colors.green);
    log('║          ✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE               ║', colors.bright + colors.green);
    log('╚════════════════════════════════════════════════════════════════════╝', colors.bright + colors.green);
    console.log('');
    logSuccess('El sistema está funcionando correctamente en producción');
    console.log('');
    process.exit(0);
  } else {
    log('╔════════════════════════════════════════════════════════════════════╗', colors.bright + colors.red);
    log('║          ❌ ALGUNAS PRUEBAS FALLARON                              ║', colors.bright + colors.red);
    log('╚════════════════════════════════════════════════════════════════════╝', colors.bright + colors.red);
    console.log('');
    logError('Revisa los errores arriba y corrige los problemas');
    console.log('');
    process.exit(1);
  }
}

// Ejecutar pruebas
runE2ETests().catch((error) => {
  logError(`Error fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
