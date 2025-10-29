import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExamResult } from '../types';

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
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // ===== HEADER =====
  // Background gradient effect (simulated with rectangles)
  doc.setFillColor(245, 158, 11); // Primary color
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AIQUAA', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Simulador ISTQB CTFL v4.0', pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(11);
  doc.text('Informe de Resultados del Examen', pageWidth / 2, 35, { align: 'center' });

  yPosition = 50;

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
      fillColor: [245, 158, 11], // Primary
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
      fillColor: [245, 158, 11],
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
          data.cell.styles.textColor = [245, 158, 11]; // Amber
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
  doc.addPage();
  yPosition = 20;

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
