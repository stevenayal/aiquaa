const https = require('https');
const http = require('http');

// Configuración
const API_BASE_URL = 'https://api.aiquaa.com';
const TEST_COMMENT = {
  name: 'Test User',
  message: 'Este es un comentario de prueba para verificar que la API funciona correctamente. 🚀',
  isAnonymous: false
};

// Función para hacer requests HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Aiquaa-API-Test/1.0',
        ...options.headers
      }
    };

    if (options.body) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Función para probar el health check
async function testHealthCheck() {
  console.log('🔍 Probando health check...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/`);
    console.log(`✅ Health check: ${response.status} - ${response.data}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Health check falló: ${error.message}`);
    return false;
  }
}

// Función para probar GET /api/comments
async function testGetComments() {
  console.log('📝 Probando GET /api/comments...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/comments`);
    console.log(`✅ GET /api/comments: ${response.status}`);
    console.log(`📊 Comentarios encontrados: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('📋 Primer comentario:', {
        id: response.data[0].id,
        name: response.data[0].name,
        message: response.data[0].message?.substring(0, 50) + '...',
        createdAt: response.data[0].createdAt
      });
    }
    
    return response.status === 200;
  } catch (error) {
    console.log(`❌ GET /api/comments falló: ${error.message}`);
    return false;
  }
}

// Función para probar POST /api/comments
async function testPostComment() {
  console.log('📝 Probando POST /api/comments...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      body: JSON.stringify(TEST_COMMENT)
    });
    
    console.log(`✅ POST /api/comments: ${response.status}`);
    console.log('📋 Comentario creado:', {
      id: response.data.id,
      name: response.data.name,
      message: response.data.message?.substring(0, 50) + '...',
      createdAt: response.data.createdAt
    });
    
    return response.status === 201;
  } catch (error) {
    console.log(`❌ POST /api/comments falló: ${error.message}`);
    return false;
  }
}

// Función para probar GET /api/feedback
async function testGetFeedback() {
  console.log('📊 Probando GET /api/feedback...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/feedback`);
    console.log(`✅ GET /api/feedback: ${response.status}`);
    console.log(`📊 Feedbacks encontrados: ${response.data.length}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ GET /api/feedback falló: ${error.message}`);
    return false;
  }
}

// Función para probar POST /api/feedback
async function testPostFeedback() {
  console.log('📊 Probando POST /api/feedback...');
  try {
    const testFeedback = {
      nombre: 'Test User',
      temasQA: ['automatizacion', 'api'],
      herramientas: ['cypress', 'postman'],
      participacion: 'taller',
      formato: 'videos',
      sugerencias: 'Excelente iniciativa para la comunidad de QA en Paraguay!',
      sessionId: 'test-session-' + Date.now(),
      userAgent: 'Aiquaa-API-Test/1.0'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      body: JSON.stringify(testFeedback)
    });
    
    console.log(`✅ POST /api/feedback: ${response.status}`);
    console.log('📋 Feedback creado:', {
      id: response.data.id,
      nombre: response.data.nombre,
      temasQA: response.data.temasQA,
      creadoEn: response.data.creadoEn
    });
    
    return response.status === 200;
  } catch (error) {
    console.log(`❌ POST /api/feedback falló: ${error.message}`);
    return false;
  }
}

// Función para probar CORS
async function testCORS() {
  console.log('🌐 Probando CORS...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/comments`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://aiquaa.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`✅ CORS OPTIONS: ${response.status}`);
    console.log('🌐 CORS Headers:', {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    });
    
    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.log(`❌ CORS test falló: ${error.message}`);
    return false;
  }
}

// Función principal de pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de la API de Aiquaa');
  console.log(`📍 URL base: ${API_BASE_URL}`);
  console.log('=' .repeat(60));
  
  const results = {
    healthCheck: false,
    getComments: false,
    postComment: false,
    getFeedback: false,
    postFeedback: false,
    cors: false
  };
  
  // Ejecutar pruebas
  results.healthCheck = await testHealthCheck();
  console.log('');
  
  results.getComments = await testGetComments();
  console.log('');
  
  results.postComment = await testPostComment();
  console.log('');
  
  results.getFeedback = await testGetFeedback();
  console.log('');
  
  results.postFeedback = await testPostFeedback();
  console.log('');
  
  results.cors = await testCORS();
  console.log('');
  
  // Resumen de resultados
  console.log('=' .repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('=' .repeat(60));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`✅ Health Check: ${results.healthCheck ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ GET /api/comments: ${results.getComments ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ POST /api/comments: ${results.postComment ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ GET /api/feedback: ${results.getFeedback ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ POST /api/feedback: ${results.postFeedback ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ CORS: ${results.cors ? 'PASÓ' : 'FALLÓ'}`);
  
  console.log('');
  console.log(`📈 Resultado: ${passedTests}/${totalTests} pruebas pasaron`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡Todas las pruebas pasaron! La API está funcionando correctamente.');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa los logs anteriores.');
  }
  
  return results;
}

// Ejecutar las pruebas si el script se ejecuta directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, makeRequest }; 