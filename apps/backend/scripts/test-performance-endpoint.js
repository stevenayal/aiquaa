/**
 * Script de prueba para el endpoint de Performance Testing
 * Prueba el endpoint POST /api/v1/performance/submit-exam
 * Uso: node scripts/test-performance-endpoint.js
 */

require('dotenv').config();

async function testPerformanceEndpoint() {
  console.log('🧪 Probando endpoint de Performance Testing\n');

  const backendUrl = 'http://localhost:3001'; // Forzar localhost para pruebas
  const endpoint = `${backendUrl}/api/v1/performance/submit-exam`;

  console.log(`📡 Endpoint: ${endpoint}\n`);

  // Datos de prueba completos
  const testPayload = {
    participantName: 'María González',
    githubProfile: '@mariagonzalez',
    examPurpose: 'postulacion',
    companyName: 'Tech Solutions Paraguay',
    startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
    endTime: new Date().toISOString(),
    timeSpent: 3420, // 57 minutos en segundos
    score: 19,
    totalQuestions: 26,
    correctAnswers: 19,
    incorrectAnswers: 7,
    percentage: 73.08,
    passed: true,
    mode: 'exam',
    answers: [
      {
        questionId: 1,
        questionText: '¿Qué es el Performance Testing?',
        userAnswer: ['A'],
        correctAnswer: ['A'],
        isCorrect: true,
        learningObjective: 'Fundamentos de Performance Testing',
        kLevel: 'K1',
        explanations: {}
      },
      {
        questionId: 2,
        questionText: '¿Cuál NO es un tipo de prueba de rendimiento?',
        userAnswer: ['B'],
        correctAnswer: ['C'],
        isCorrect: false,
        learningObjective: 'Fundamentos de Performance Testing',
        kLevel: 'K2',
        explanations: {}
      },
      {
        questionId: 3,
        questionText: '¿Qué métrica mide el tiempo de respuesta?',
        userAnswer: ['A'],
        correctAnswer: ['A'],
        isCorrect: true,
        learningObjective: 'Métricas y KPIs',
        kLevel: 'K1',
        explanations: {}
      }
    ],
    learningObjectiveAnalysis: [
      {
        learningObjective: 'Fundamentos de Performance Testing',
        totalQuestions: 9,
        correctAnswers: 6,
        percentage: 66.67
      },
      {
        learningObjective: 'Métricas y KPIs',
        totalQuestions: 9,
        correctAnswers: 7,
        percentage: 77.78
      },
      {
        learningObjective: 'Herramientas y Mejores Prácticas',
        totalQuestions: 8,
        correctAnswers: 6,
        percentage: 75.00
      }
    ]
  };

  console.log('📦 Payload de prueba:');
  console.log(`   Participante: ${testPayload.participantName}`);
  console.log(`   GitHub: ${testPayload.githubProfile}`);
  console.log(`   Empresa: ${testPayload.companyName}`);
  console.log(`   Motivo: ${testPayload.examPurpose}`);
  console.log(`   Puntaje: ${testPayload.score}/${testPayload.totalQuestions} (${testPayload.percentage}%)`);
  console.log(`   Estado: ${testPayload.passed ? '✅ APROBADO' : '❌ NO APROBADO'}\n`);

  console.log('🚀 Enviando request al backend...\n');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:');
      console.error(errorText);
      process.exit(1);
    }

    const data = await response.json();
    console.log('\n✅ Respuesta exitosa:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n📧 Email enviado a:', process.env.ADMIN_EMAIL || 'admin@aiquaa.com');
    console.log('💾 Resultado guardado en base de datos con ID:', data.id);
    console.log('\n✅ ¡Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error al hacer la petición:');
    console.error(error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
testPerformanceEndpoint().catch(console.error);
