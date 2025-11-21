/**
 * Script de prueba para envío de email del examen GIT
 *
 * Uso:
 *   node test-git-email.js
 *
 * Este script envía un resultado de examen de prueba al endpoint del backend
 */

const http = require('http');

// Datos de prueba del examen
const testExamResult = {
  participantName: "Juan Pérez Test",
  githubProfile: "https://github.com/juanperez",
  examPurpose: "postulacion",
  companyName: "Google",
  score: 32,
  totalQuestions: 40,
  correctAnswers: 32,
  incorrectAnswers: 8,
  passed: true,
  percentage: 80,
  timeSpent: 2400,
  answers: [
    {
      questionId: 1,
      questionText: "¿Qué comando se usa para inicializar un repositorio Git?",
      userAnswer: ["git init"],
      correctAnswer: ["git init"],
      isCorrect: true,
      learningObjective: "Git Básico",
      kLevel: "K1",
      explanations: {
        "A": { correct: true, explanation: "git init inicializa un nuevo repositorio" }
      }
    },
    {
      questionId: 2,
      questionText: "¿Qué comando se usa para clonar un repositorio?",
      userAnswer: ["git pull"],
      correctAnswer: ["git clone"],
      isCorrect: false,
      learningObjective: "Git Básico",
      kLevel: "K1",
      explanations: {
        "A": { correct: false, explanation: "git pull actualiza, no clona" },
        "B": { correct: true, explanation: "git clone crea una copia local del repositorio" }
      }
    },
    {
      questionId: 3,
      questionText: "¿Cuál es el comando para ver el estado de los archivos?",
      userAnswer: ["git status"],
      correctAnswer: ["git status"],
      isCorrect: true,
      learningObjective: "Comandos Básicos",
      kLevel: "K1",
      explanations: {
        "A": { correct: true, explanation: "git status muestra el estado del working directory" }
      }
    }
  ],
  learningObjectiveAnalysis: [
    {
      learningObjective: "Git Básico",
      totalQuestions: 15,
      correctAnswers: 12,
      percentage: 80
    },
    {
      learningObjective: "Ramas y Merge",
      totalQuestions: 10,
      correctAnswers: 8,
      percentage: 80
    },
    {
      learningObjective: "Repositorios Remotos",
      totalQuestions: 8,
      correctAnswers: 7,
      percentage: 87.5
    },
    {
      learningObjective: "Comandos Básicos",
      totalQuestions: 7,
      correctAnswers: 5,
      percentage: 71.4
    }
  ]
};

// Configuración del request
const postData = JSON.stringify({
  examResult: testExamResult
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/labs/git/send-result',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Iniciando prueba de envío de email del examen GIT...\n');
console.log('📋 Datos de prueba:');
console.log(`   Nombre: ${testExamResult.participantName}`);
console.log(`   GitHub: ${testExamResult.githubProfile}`);
console.log(`   Motivo: ${testExamResult.examPurpose}`);
console.log(`   Empresa: ${testExamResult.companyName}`);
console.log(`   Resultado: ${testExamResult.passed ? 'APROBADO' : 'NO APROBADO'}`);
console.log(`   Puntaje: ${testExamResult.score}/${testExamResult.totalQuestions} (${testExamResult.percentage}%)\n`);

console.log(`🌐 Endpoint: http://${options.hostname}:${options.port}${options.path}\n`);
console.log('📤 Enviando request...\n');

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log(`📊 Headers:`, res.headers);
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📨 Respuesta del servidor:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      console.log('\n✅ PRUEBA EXITOSA! El correo debería haber sido enviado a admin@aiquaa.com');
      console.log('\n💡 Próximos pasos:');
      console.log('   1. Verifica los logs del backend para confirmar el envío');
      console.log('   2. Revisa la bandeja de entrada de admin@aiquaa.com');
      console.log('   3. Si no llega, verifica la carpeta de spam');
      console.log('   4. Confirma que la API key de Resend sea válida');
    } catch (e) {
      console.log(data);
      console.log('\n⚠️  La respuesta no es JSON válido');
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ ERROR al conectar con el servidor:');
  console.error(error.message);
  console.error('\n🔍 Posibles causas:');
  console.error('   1. El backend no está corriendo');
  console.error('   2. El backend está en un puerto diferente a 3001');
  console.error('   3. Firewall o antivirus bloqueando la conexión');
  console.error('\n💡 Solución:');
  console.error('   1. Ejecuta: pnpm dev:back (o npm run dev:back)');
  console.error('   2. Verifica que el backend responda en http://localhost:3001/api/v1/health');
  console.error('   3. Vuelve a ejecutar este script');
});

// Enviar los datos
req.write(postData);
req.end();
