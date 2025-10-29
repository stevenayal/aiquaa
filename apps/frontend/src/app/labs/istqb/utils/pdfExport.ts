import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExamResult } from '../types';
import { AIQUAA_LOGO_BASE64 } from './logoBase64';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}


export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

export function generateExamPDF(result: ExamResult, mode: 'exam' | 'training'): void {

// Helper function to draw performance chart - OCULTA (no se ve bien en PDF)
// function drawPerformanceChart(
//   doc: jsPDF,
//   learningObjectives: Array<{ learningObjective: string; percentage: number; correctAnswers: number; totalQuestions: number }>,
//   startY: number,
//   pageWidth: number
// ): number {
//   const chartWidth = pageWidth - 40;
//   const barHeight = 8;
//   const marginLeft = 20;
//   const labelWidth = 40;

//   // Title
//   doc.setFontSize(13);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(31, 41, 55);
//   doc.text('Análisis Visual de Rendimiento por Tema', marginLeft, startY);

//   let currentY = startY + 10;

//   // Sort by percentage (lowest first to highlight areas needing improvement)
//   const sortedLOs = [...learningObjectives].sort((a, b) => a.percentage - b.percentage);

//   sortedLOs.forEach((lo) => {
//     // LO Label
//     doc.setFontSize(8);
//     doc.setTextColor(31, 41, 55);
//     doc.setFont('helvetica', 'normal');
//     const loLabel = lo.learningObjective.length > 12 ? lo.learningObjective.substring(0, 10) + '..' : lo.learningObjective;
//     doc.text(loLabel, marginLeft, currentY + 6);

//     // Bar background (light gray)
//     doc.setFillColor(229, 231, 235);
//     doc.rect(marginLeft + labelWidth, currentY, chartWidth - labelWidth - 35, barHeight, 'F');

//     // Performance bar (colored)
//     const barWidth = ((chartWidth - labelWidth - 35) * lo.percentage) / 100;
//     let barColor: [number, number, number];

//     if (lo.percentage >= 70) {
//       barColor = [34, 197, 94]; // Green-500
//     } else if (lo.percentage >= 50) {
//       barColor = [251, 146, 60]; // Orange-400
//     } else {
//       barColor = [239, 68, 68]; // Red-500
//     }

//     doc.setFillColor(barColor[0], barColor[1], barColor[2]);
//     doc.rect(marginLeft + labelWidth, currentY, barWidth, barHeight, 'F');

//     // Percentage text
//     doc.setFontSize(8);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(barColor[0], barColor[1], barColor[2]);
//     doc.text(`${lo.percentage.toFixed(0)}%`, marginLeft + labelWidth + chartWidth - labelWidth - 28, currentY + 6);

//     currentY += barHeight + 4;
//   });

//   // Legend
//   currentY += 6;
//   doc.setFontSize(7);
//   doc.setFont('helvetica', 'normal');

//   // Green legend
//   doc.setFillColor(34, 197, 94);
//   doc.rect(marginLeft, currentY - 3, 3, 3, 'F');
//   doc.setTextColor(107, 114, 128);
//   doc.text('≥70% Excelente', marginLeft + 5, currentY);

//   // Orange legend
//   doc.setFillColor(251, 146, 60);
//   doc.rect(marginLeft + 40, currentY - 3, 3, 3, 'F');
//   doc.text('50-69% Mejorable', marginLeft + 45, currentY);

//   // Red legend
//   doc.setFillColor(239, 68, 68);
//   doc.rect(marginLeft + 85, currentY - 3, 3, 3, 'F');
//   doc.text('<50% Reforzar', marginLeft + 90, currentY);

//   return currentY + 8;
// }
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // ===== HEADER =====
  // Background gradient effect - AIQUAA brand colors (indigo gradient)
  doc.setFillColor(15, 23, 42); // Slate-900 (AIQUAA brand)
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFillColor(30, 27, 75); // Indigo-950
  doc.rect(0, 25, pageWidth, 25, 'F');

  // Logo AIQUAA
  // Dimensiones originales: 810x527 (ratio 1.54)
  // Tamaño en PDF: 35mm ancho
  const logoWidth = 35;
  const logoHeight = logoWidth / 1.54; // Mantener proporción
  const logoX = (pageWidth - logoWidth) / 2; // Centrado
  const logoY = 8;

  try {
    doc.addImage(AIQUAA_LOGO_BASE64, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    // Si falla la carga del logo, mostrar texto
    console.warn('No se pudo cargar el logo:', error);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('AIQUAA', pageWidth / 2, 18, { align: 'center' });
  }

  // Subtítulos debajo del logo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Simulador ISTQB CTFL v4.0', pageWidth / 2, 38, { align: 'center' });

  doc.setFontSize(10);
  doc.text('Informe de Resultados del Examen', pageWidth / 2, 45, { align: 'center' });

  yPosition = 58;

  // ===== ESTADO DEL EXAMEN =====
  doc.setTextColor(31, 41, 55); // Dark
  const statusBgColor = result.passed
    ? [222, 247, 236] // Success light
    : [254, 226, 226]; // Error light
  const statusTextColor = result.passed ? [22, 163, 74] : [220, 38, 38];
  const statusIcon = result.passed ? '✓' : '✗';
  const statusText = result.passed ? 'APROBADO' : 'NO APROBADO';

  // Status box
  doc.setFillColor(statusBgColor[0], statusBgColor[1], statusBgColor[2]);
  doc.roundedRect(15, yPosition, pageWidth - 30, 25, 3, 3, 'F');

  // Status icon and text
  doc.setFontSize(20);
  doc.setTextColor(statusTextColor[0], statusTextColor[1], statusTextColor[2]);
  doc.text(statusIcon, 25, yPosition + 12);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, 35, yPosition + 12);

  // Score
  doc.setFontSize(14);
  doc.setTextColor(107, 114, 128);
  const scoreText = `${result.score}/${result.totalQuestions} (${result.percentage.toFixed(2)}%)`;
  doc.text(scoreText, pageWidth - 25, yPosition + 12, { align: 'right' });

  yPosition += 35;

  // ===== INFORMACIÓN DEL PARTICIPANTE =====
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Información del Participante', 15, yPosition);
  yPosition += 8;

  // Info table
  const participantInfo = [
    ['Nombre:', result.participantName],
    ['Fecha:', new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })],
    ['Tiempo Empleado:', formatTime(result.timeSpent)],
    ['Modo:', mode === 'exam' ? 'EXAMEN' : 'ENTRENAMIENTO'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: participantInfo,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [107, 114, 128],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, textColor: [107, 114, 128] },
      1: { textColor: [31, 41, 55] },
    },
    margin: { left: 15, right: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ===== RESUMEN DE RESULTADOS =====
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Resumen de Resultados', 15, yPosition);
  yPosition += 8;

  const summaryData = [
    ['Puntaje Total', result.score.toString()],
    ['Respuestas Correctas', result.correctAnswers.toString()],
    ['Respuestas Incorrectas', result.incorrectAnswers.toString()],
    ['Porcentaje de Acierto', `${result.percentage.toFixed(2)}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: summaryData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600 (AIQUAA brand) // Primary
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 15, right: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 12;

  // ===== DESGLOSE POR LEARNING OBJECTIVES =====
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Desglose por Learning Objectives', 15, yPosition);
  yPosition += 8;

  const loData = result.learningObjectiveAnalysis.map((lo) => {
    const percentage = lo.percentage.toFixed(0) + '%';
    return [
      lo.learningObjective,
      `${lo.correctAnswers}/${lo.totalQuestions}`,
      percentage,
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Learning Objective', 'Resultado', 'Porcentaje']],
    body: loData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600 (AIQUAA brand)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center', cellWidth: 35 },
      2: { halign: 'center', cellWidth: 35 },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 2) {
        const percentage = parseFloat(data.cell.text[0]);
        if (percentage >= 70) {
          data.cell.styles.textColor = [22, 163, 74]; // Green
          data.cell.styles.fontStyle = 'bold';
        } else if (percentage >= 50) {
          data.cell.styles.textColor = [251, 146, 60]; // Orange-400 (warning)
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // Red
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 15, right: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 12;

  // ===== DETALLE DE PREGUNTAS =====

  // ===== GRÁFICO DE ANÁLISIS VISUAL =====
  // Gráfico oculto - no se ve bien en PDF
  // if (yPosition > pageHeight - 80) {
  //   doc.addPage();
  //   yPosition = 20;
  // }
  // yPosition = drawPerformanceChart(doc, result.learningObjectiveAnalysis, yPosition, pageWidth);

  // ===== RESUMEN EJECUTIVO CON ESTÉTICA MEJORADA =====
  // Crear una nueva página para el resumen ejecutivo
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = 20;
  }

  // Título del resumen ejecutivo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Resumen Ejecutivo', 15, yPosition);
  yPosition += 12;

  // Box principal del resumen con gradiente sutil
  const summaryBoxHeight = 60;
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(15, yPosition, pageWidth - 30, summaryBoxHeight, 8, 8, 'F');

  // Borde sutil
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(1);
  doc.roundedRect(15, yPosition, pageWidth - 30, summaryBoxHeight, 8, 8, 'S');

  // Contenido del resumen
  const summaryY = yPosition + 8;

  // Estado general
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const overallStatus = result.passed ? 'APROBADO' : 'NO APROBADO';
  const statusColor = result.passed ? [22, 163, 74] : [220, 38, 38];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Estado General: ${overallStatus}`, 25, summaryY);

  // Puntaje destacado
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text(`${result.score}/${result.totalQuestions} (${result.percentage.toFixed(1)}%)`, 25, summaryY + 8);

  // Tiempo empleado
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Tiempo empleado: ${formatTime(result.timeSpent)}`, 25, summaryY + 18);

  // Modo de examen
  doc.text(`Modo: ${mode === 'exam' ? 'EXAMEN' : 'ENTRENAMIENTO'}`, 25, summaryY + 28);

  yPosition += summaryBoxHeight + 15;

  // ===== ANÁLISIS DE RENDIMIENTO =====
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Análisis de Rendimiento', 15, yPosition);
  yPosition += 10;

  // Separar temas por rendimiento
  const excellentTopics = result.learningObjectiveAnalysis.filter(lo => lo.percentage >= 70);
  const weakTopics = result.learningObjectiveAnalysis.filter(lo => lo.percentage < 70).sort((a, b) => a.percentage - b.percentage);

  // Fortalezas (temas con buen rendimiento)
  if (excellentTopics.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74); // Verde
    doc.text('✓ Fortalezas:', 15, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);

    excellentTopics.slice(0, 3).forEach((topic) => {
      doc.text(`• ${topic.learningObjective}: ${topic.percentage.toFixed(0)}%`, 20, yPosition);
      yPosition += 4;
    });
    yPosition += 5;
  }

  // Áreas de mejora
  if (weakTopics.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38); // Rojo
    doc.text('⚠ Áreas de Mejora:', 15, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);

    weakTopics.slice(0, 3).forEach((topic) => {
      const priority = topic.percentage < 50 ? '🔴' : '🟠';
      doc.text(`${priority} ${topic.learningObjective}: ${topic.percentage.toFixed(0)}%`, 20, yPosition);
      yPosition += 4;
    });
    yPosition += 5;
  }

  // Recomendación general
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Recomendación:', 15, yPosition);
  yPosition += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);

  if (result.passed) {
    doc.text('¡Felicitaciones! Has aprobado el examen. Continúa practicando para mantener tus conocimientos.', 20, yPosition);
  } else {
    doc.text('Se recomienda revisar los temas con menor rendimiento y realizar más ejercicios de práctica.', 20, yPosition);
  }

  yPosition += 15;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de Preguntas', 15, yPosition);
  yPosition += 10;

  result.answers.forEach((answer, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Question number and status
    const statusIcon = answer.isCorrect ? '✓' : '✗';
    const statusColor = answer.isCorrect
      ? [22, 163, 74] // Green
      : [220, 38, 38]; // Red

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(`Pregunta ${index + 1}`, 15, yPosition);

    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusIcon, 50, yPosition);

    // LO and K-Level badges
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`${answer.learningObjective} | ${answer.kLevel}`, 55, yPosition);

    yPosition += 7;

    // Question text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(31, 41, 55);
    const questionLines = doc.splitTextToSize(
      answer.questionText,
      pageWidth - 35,
    );
    doc.text(questionLines, 15, yPosition);
    yPosition += questionLines.length * 5;

    // User answer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const answerColor = answer.isCorrect
      ? [22, 163, 74]
      : [220, 38, 38];
    doc.setTextColor(answerColor[0], answerColor[1], answerColor[2]);
    doc.text(
      `${answer.isCorrect ? '✓' : '✗'} Tu respuesta: ${answer.userAnswer.join(', ') || 'Sin responder'}`,
      15,
      yPosition,
    );
    yPosition += 5;

    // Correct answer (if incorrect)
    if (!answer.isCorrect) {
      doc.setTextColor(22, 163, 74);
      doc.text(
        `✓ Correcta: ${answer.correctAnswer.join(', ')}`,
        15,
        yPosition,
      );
      yPosition += 5;

      // Explanations
      if (answer.explanations && Object.keys(answer.explanations).length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128);
        doc.text('Explicación:', 15, yPosition);
        yPosition += 4;

        Object.entries(answer.explanations).forEach(([label, exp]: [string, any]) => {
          const expText = `${label}: ${exp.explanation}`;
          const expLines = doc.splitTextToSize(expText, pageWidth - 40);
          if (exp.correct) { doc.setTextColor(22, 163, 74); } else { doc.setTextColor(107, 114, 128); }
          doc.text(expLines as string | string[], 20, yPosition);
          yPosition += expLines.length * 4;

          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }
    }

    // Separator
    yPosition += 3;
    doc.setDrawColor(229, 231, 235);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;
  });

  // ===== FOOTER ON ALL PAGES =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `© ${new Date().getFullYear()} AIQUAA - Simulador ISTQB CTFL v4.0`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' },
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 15,
      pageHeight - 10,
      { align: 'right' },
    );
  }

  // ===== SAVE PDF =====
  const filename = `ISTQB-${result.participantName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
