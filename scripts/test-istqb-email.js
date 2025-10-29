/**
 * Script de prueba para enviar un email de prueba del sistema ISTQB
 *
 * Uso:
 *   node scripts/test-istqb-email.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';

const sampleExamData = {
  participantName: 'Juan Pérez (PRUEBA)',
  participantEmail: 'juan.perez@example.com',
  startTime: new Date(Date.now() - 3600 * 1000).toISOString(), // Hace 1 hora
  endTime: new Date().toISOString(),
  timeSpent: 3600, // 1 hora en segundos
  score: 32,
  totalQuestions: 40,
  correctAnswers: 32,
  incorrectAnswers: 8,
  percentage: 80.0,
  passed: true,
  mode: 'EXAM',
  answers: [
    {
      questionId: 1,
      questionText: '¿Cuál es el objetivo principal de las pruebas de software?',
      userAnswer: ['B'],
      correctAnswer: ['B'],
      isCorrect: true,
      learningObjective: 'FL-1.1.1',
      kLevel: 'K2',
      explanations: {
        A: { correct: false, explanation: 'Incorrecto: No es solo encontrar defectos' },
        B: { correct: true, explanation: 'Correcto: El objetivo es prevenir defectos y generar confianza' },
      },
    },
    {
      questionId: 2,
      questionText: '¿Qué es la verificación en el contexto de las pruebas?',
      userAnswer: ['A'],
      correctAnswer: ['B'],
      isCorrect: false,
      learningObjective: 'FL-1.1.2',
      kLevel: 'K1',
      explanations: {
        A: { correct: false, explanation: 'Incorrecto: Esa es la validación' },
        B: { correct: true, explanation: 'Correcto: La verificación verifica si el producto cumple con los requisitos' },
      },
    },
    {
      questionId: 3,
      questionText: '¿Cuál es la diferencia entre error, defecto y fallo?',
      userAnswer: ['C'],
      correctAnswer: ['C'],
      isCorrect: true,
      learningObjective: 'FL-1.2.1',
      kLevel: 'K2',
      explanations: {
        A: { correct: false, explanation: 'Incorrecto' },
        B: { correct: false, explanation: 'Incorrecto' },
        C: { correct: true, explanation: 'Correcto: Error es humano, defecto en código, fallo en ejecución' },
      },
    },
  ],
  learningObjectiveAnalysis: [
    {
      learningObjective: 'FL-1.1.1',
      totalQuestions: 5,
      correctAnswers: 4,
      percentage: 80.0,
    },
    {
      learningObjective: 'FL-1.1.2',
      totalQuestions: 3,
      correctAnswers: 2,
      percentage: 66.67,
    },
    {
      learningObjective: 'FL-1.2.1',
      totalQuestions: 4,
      correctAnswers: 4,
      percentage: 100.0,
    },
    {
      learningObjective: 'FL-2.1.1',
      totalQuestions: 5,
      correctAnswers: 3,
      percentage: 60.0,
    },
    {
      learningObjective: 'FL-2.2.1',
      totalQuestions: 6,
      correctAnswers: 5,
      percentage: 83.33,
    },
  ],
};

async function testEmailSend() {
  console.log('🧪 Iniciando prueba de envío de email ISTQB...\n');
  console.log(`📡 API URL: ${API_URL}/api/v1/istqb/submit-exam\n`);

  try {
    console.log('📤 Enviando datos de examen de prueba...');
    const response = await fetch(`${API_URL}/api/v1/istqb/submit-exam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleExamData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ Examen enviado exitosamente!');
      console.log('📊 Respuesta del servidor:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n📧 Verifica tu bandeja de entrada en admin@aiquaa.com para el email de informe');
      console.log(`\n🔗 ID del resultado: ${data.id}`);
    } else {
      console.error('\n❌ Error al enviar examen:');
      console.error(`Status: ${response.status}`);
      console.error('Respuesta:', data);
    }
  } catch (error) {
    console.error('\n💥 Error de conexión:');
    console.error(error.message);
    console.error('\n⚠️  Asegúrate de que el backend esté ejecutándose en', API_URL);
  }
}

// Ejecutar test
testEmailSend();
