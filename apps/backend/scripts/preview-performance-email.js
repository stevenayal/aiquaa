/**
 * Script para previsualizar el email de Performance Testing
 * Genera un archivo HTML que puedes abrir en el navegador
 * Uso: node scripts/preview-performance-email.js
 */

const fs = require('fs');
const path = require('path');

async function previewPerformanceEmail() {
  console.log('🎨 Generando preview del email de Performance Testing\n');

  // Datos de prueba
  const testExamData = {
    participantName: 'Juan Pérez',
    githubProfile: '@juanperez',
    examPurpose: 'practica',
    companyName: null,
    startTime: new Date('2024-12-02T10:00:00Z'),
    endTime: new Date('2024-12-02T10:45:00Z'),
    timeSpentSeconds: 2700,
    score: 22,
    totalQuestions: 26,
    percentage: 84.62,
    passed: true,
    mode: 'exam',
    answers: [
      {
        questionId: 1,
        questionText: '¿Cuál es el objetivo principal del Performance Testing?',
        userAnswer: ['A'],
        correctAnswer: ['A'],
        isCorrect: true,
        section: 'Fundamentos de Performance Testing',
        tags: ['K2', 'fundamentals']
      },
      {
        questionId: 2,
        questionText: '¿Qué métrica representa el número de transacciones procesadas por segundo?',
        userAnswer: ['B'],
        correctAnswer: ['A'],
        isCorrect: false,
        section: 'Métricas y KPIs',
        tags: ['K1', 'metrics']
      },
      {
        questionId: 3,
        questionText: '¿Cuál herramienta NO es comúnmente usada para Performance Testing?',
        userAnswer: ['C'],
        correctAnswer: ['D'],
        isCorrect: false,
        section: 'Herramientas y Mejores Prácticas',
        tags: ['K1', 'tools']
      },
      {
        questionId: 4,
        questionText: '¿Qué tipo de prueba verifica el comportamiento bajo carga extrema?',
        userAnswer: ['A'],
        correctAnswer: ['B'],
        isCorrect: false,
        section: 'Fundamentos de Performance Testing',
        tags: ['K2', 'types']
      }
    ],
    sectionAnalysis: [
      {
        section: 'Fundamentos de Performance Testing',
        totalQuestions: 9,
        correctAnswers: 7,
        percentage: 77.78,
        weight: 35
      },
      {
        section: 'Métricas y KPIs',
        totalQuestions: 9,
        correctAnswers: 8,
        percentage: 88.89,
        weight: 35
      },
      {
        section: 'Herramientas y Mejores Prácticas',
        totalQuestions: 8,
        correctAnswers: 7,
        percentage: 87.50,
        weight: 30
      }
    ]
  };

  const resultId = 1;
  const examDate = testExamData.startTime.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const purposeLabels = {
    capacitacion: 'Capacitación',
    postulacion: 'Postulación / Proceso de Selección',
    practica: 'Práctica',
    otro: 'Otro'
  };

  // Generar HTML del email
  const htmlContent = getPerformanceExamReportTemplate(
    testExamData,
    resultId,
    examDate,
    purposeLabels[testExamData.examPurpose]
  );

  // Guardar en archivo
  const outputPath = path.join(__dirname, 'performance-email-preview.html');
  fs.writeFileSync(outputPath, htmlContent, 'utf8');

  console.log('✅ Preview generado exitosamente!');
  console.log('📁 Ubicación:', outputPath);
  console.log('\n💡 Abre el archivo en tu navegador para ver el email\n');

  // También mostrar estadísticas del email
  console.log('📊 Estadísticas del email:');
  console.log(`   - Tamaño HTML: ${(htmlContent.length / 1024).toFixed(2)} KB`);
  console.log(`   - Participante: ${testExamData.participantName}`);
  console.log(`   - Resultado: ${testExamData.passed ? '✅ APROBADO' : '❌ NO APROBADO'}`);
  console.log(`   - Puntaje: ${testExamData.score}/${testExamData.totalQuestions} (${testExamData.percentage}%)`);
  console.log(`   - Secciones analizadas: ${testExamData.sectionAnalysis.length}`);
  console.log(`   - Respuestas incorrectas mostradas: ${Math.min(3, testExamData.answers.filter(a => !a.isCorrect).length)}`);
}

function getPerformanceExamReportTemplate(examData, resultId, examDate, purposeLabel) {
  const timeFormatted = formatTime(examData.timeSpentSeconds);
  const incorrectAnswers = examData.answers
    .filter(a => !a.isCorrect)
    .slice(0, 3);

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resultado de Examen - Performance Testing</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎯 AIQUAA | Examen de Performance Testing</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Fundamentos, Métricas y Herramientas</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e5e7eb;">
        <div style="background-color: ${examData.passed ? '#d1fae5' : '#fee2e2'}; border-left: 4px solid ${examData.passed ? '#10b981' : '#ef4444'}; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <h2 style="margin: 0 0 10px 0; color: ${examData.passed ? '#065f46' : '#991b1b'}; font-size: 24px;">
            ${examData.passed ? '✅ APROBADO' : '❌ NO APROBADO'}
          </h2>
          <p style="margin: 0; font-size: 18px; color: ${examData.passed ? '#047857' : '#dc2626'};">
            <strong>${examData.score}/${examData.totalQuestions}</strong> preguntas correctas
            (<strong>${examData.percentage.toFixed(2)}%</strong>)
          </p>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0; color: #1f2937; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">
            📋 Información del Participante
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Nombre:</strong></td>
              <td style="padding: 8px 0;">${examData.participantName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>GitHub:</strong></td>
              <td style="padding: 8px 0;">${examData.githubProfile}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Motivo:</strong></td>
              <td style="padding: 8px 0;">${purposeLabel}</td>
            </tr>
            ${examData.companyName ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Empresa:</strong></td>
              <td style="padding: 8px 0;">${examData.companyName}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Fecha:</strong></td>
              <td style="padding: 8px 0;">${examDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Tiempo:</strong></td>
              <td style="padding: 8px 0;">${timeFormatted}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Modo:</strong></td>
              <td style="padding: 8px 0;">${examData.mode === 'exam' ? 'Examen' : 'Entrenamiento'}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0; color: #1f2937; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">
            📊 Desglose por Sección
          </h3>
          ${examData.sectionAnalysis.map(section => `
            <div style="margin-bottom: 15px; padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #06b6d4;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="color: #1f2937; font-size: 16px;">${section.section}</strong>
                <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: bold;">
                  ${section.weight}%
                </span>
              </div>
              <div style="color: #4b5563; margin-top: 5px;">
                ✓ ${section.correctAnswers}/${section.totalQuestions} correctas
                <strong style="color: ${section.percentage >= 70 ? '#10b981' : '#ef4444'};">
                  (${section.percentage.toFixed(1)}%)
                </strong>
              </div>
              <div style="background-color: #e5e7eb; height: 8px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%); height: 100%; width: ${section.percentage}%; border-radius: 4px;"></div>
              </div>
            </div>
          `).join('')}
        </div>

        ${incorrectAnswers.length > 0 ? `
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0; color: #1f2937; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">
            ❌ Top 3 Respuestas Incorrectas
          </h3>
          ${incorrectAnswers.map((answer, index) => `
            <div style="margin-bottom: 15px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: bold;">
                ${index + 1}. ${answer.questionText}
              </p>
              <p style="margin: 5px 0; color: #dc2626;">
                <strong>Tu respuesta:</strong> ${answer.userAnswer.join(', ')}
              </p>
              <p style="margin: 5px 0; color: #059669;">
                <strong>Respuesta correcta:</strong> ${answer.correctAnswer.join(', ')}
              </p>
              <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">
                📚 Sección: ${answer.section}
              </p>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>📌 ID del Resultado:</strong> #${resultId}
          </p>
          <p style="margin: 10px 0 0 0; color: #1e40af; font-size: 14px;">
            Este resultado ha sido guardado en la base de datos de AIQUAA.
          </p>
        </div>
      </div>

      <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} AIQUAA - Plataforma de QA en Paraguay</p>
        <p style="margin: 10px 0 0 0;">
          Este correo fue generado automáticamente. No responder.
        </p>
      </div>
    </body>
    </html>
  `;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Ejecutar el preview
previewPerformanceEmail().catch(console.error);
