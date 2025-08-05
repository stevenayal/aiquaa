const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Probando API Aiquaa...\n');

  try {
    // Test health check
    console.log('1. Probando health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/`);
    const healthText = await healthResponse.text();
    console.log('✅ Health check:', healthText);

    // Test create user
    console.log('\n2. Probando crear usuario...');
    const userResponse = await fetch(`${API_BASE_URL}/api/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: 'Test User',
        email: 'test@example.com'
      }),
    });
    const userData = await userResponse.json();
    console.log('✅ Usuario creado:', userData);

    // Test create feedback
    console.log('\n3. Probando crear feedback...');
    const feedbackResponse = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: 'Test User',
        temasQA: ['automatizacion', 'api'],
        herramientas: ['cypress', 'postman'],
        participacion: 'taller',
        formato: 'videos',
        sugerencias: 'Excelente iniciativa!',
        sessionId: 'test-session-123',
        userAgent: 'Test Browser'
      }),
    });
    const feedbackData = await feedbackResponse.json();
    console.log('✅ Feedback creado:', feedbackData);

    // Test get feedback
    console.log('\n4. Probando obtener feedback...');
    const getFeedbackResponse = await fetch(`${API_BASE_URL}/api/feedback`);
    const allFeedback = await getFeedbackResponse.json();
    console.log('✅ Feedback obtenido:', allFeedback.length, 'registros');

    // Test get metrics
    console.log('\n5. Probando obtener métricas...');
    const metricsResponse = await fetch(`${API_BASE_URL}/api/feedback/metrics`);
    const metrics = await metricsResponse.json();
    console.log('✅ Métricas obtenidas:', metrics.totalSubmissions, 'total de respuestas');

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

testAPI(); 