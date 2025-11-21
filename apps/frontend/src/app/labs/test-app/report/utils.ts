import type { TechnicalReport, BugReport, ScoreCriteria } from './types';

// Helper function to convert file to base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Helper function to validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato no soportado. Use: JPG, PNG, GIF o WebP',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Imagen muy grande. Máximo 5MB',
    };
  }

  return { valid: true };
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export const SCORE_CRITERIA: ScoreCriteria = {
  bugsFound: {
    '1-2': 5,
    '3-4': 10,
    '5-6': 13,
    '7-8': 15,
  },
  reportQuality: {
    clearSteps: 5,
    correctSeverity: 3,
    evidence: 2,
  },
  coverage: {
    allSections: 3,
    edgeCases: 2,
  },
};

export function calculateBugsFoundPoints(bugsCount: number): number {
  if (bugsCount >= 7) return SCORE_CRITERIA.bugsFound['7-8'];
  if (bugsCount >= 5) return SCORE_CRITERIA.bugsFound['5-6'];
  if (bugsCount >= 3) return SCORE_CRITERIA.bugsFound['3-4'];
  if (bugsCount >= 1) return SCORE_CRITERIA.bugsFound['1-2'];
  return 0;
}

export function calculateReportQualityPoints(bugs: BugReport[]): number {
  let points = 0;

  // Evaluar pasos claros (5 pts)
  const bugsWithClearSteps = bugs.filter(
    (bug) => bug.stepsToReproduce.length >= 3 && bug.stepsToReproduce.every((step) => step.length > 10),
  );
  if (bugsWithClearSteps.length >= bugs.length * 0.8) {
    points += 5;
  } else if (bugsWithClearSteps.length >= bugs.length * 0.5) {
    points += 3;
  } else {
    points += 1;
  }

  // Evaluar severidad correcta (3 pts)
  const bugsWithSeverity = bugs.filter((bug) => bug.severity && bug.actualResult.length > 20);
  if (bugsWithSeverity.length >= bugs.length * 0.9) {
    points += 3;
  } else if (bugsWithSeverity.length >= bugs.length * 0.7) {
    points += 2;
  } else {
    points += 1;
  }

  // Evaluar evidencias (2 pts)
  const bugsWithEvidence = bugs.filter((bug) => bug.evidence && bug.evidence.length > 10);
  if (bugsWithEvidence.length >= bugs.length * 0.8) {
    points += 2;
  } else if (bugsWithEvidence.length >= bugs.length * 0.5) {
    points += 1;
  }

  return points;
}

export function calculateCoveragePoints(exploredSections: string[]): number {
  let points = 0;

  const requiredSections = ['catalog', 'product', 'cart', 'checkout', 'profile', 'support', 'history'];
  const exploredRequiredSections = requiredSections.filter((section) =>
    exploredSections.some((explored) => explored.includes(section)),
  );

  // Exploró todas las secciones (3 pts)
  if (exploredRequiredSections.length >= 6) {
    points += 3;
  } else if (exploredRequiredSections.length >= 4) {
    points += 2;
  } else {
    points += 1;
  }

  // Probó edge cases (2 pts) - detectar por acciones específicas en audit log
  // Por ahora, otorgar 1 punto por defecto si exploró más de 4 secciones
  if (exploredRequiredSections.length >= 5) {
    points += 2;
  }

  return points;
}

export function calculateScore(report: TechnicalReport): typeof report.score {
  const bugsFoundPoints = calculateBugsFoundPoints(report.bugsFound.length);
  const reportQualityPoints = calculateReportQualityPoints(report.bugsFound);
  const coveragePoints = calculateCoveragePoints(report.testSession.exploredSections);

  const totalPoints = bugsFoundPoints + reportQualityPoints + coveragePoints;
  const maxPoints = 30;
  const percentage = (totalPoints / maxPoints) * 100;

  return {
    bugsFoundPoints,
    reportQualityPoints,
    coveragePoints,
    totalPoints,
    maxPoints,
    percentage,
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} minutos`;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Critical':
      return '#991B1B'; // red-800
    case 'High':
      return '#DC2626'; // red-600
    case 'Medium':
      return '#F59E0B'; // amber-500
    case 'Low':
      return '#3B82F6'; // blue-500
    default:
      return '#6B7280'; // gray-500
  }
}

export function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case 'Critical':
      return '#FEE2E2'; // red-100
    case 'High':
      return '#FECACA'; // red-200
    case 'Medium':
      return '#FEF3C7'; // amber-100
    case 'Low':
      return '#DBEAFE'; // blue-100
    default:
      return '#F3F4F6'; // gray-100
  }
}

export async function generatePDF(report: TechnicalReport): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = 20;

  // Helper function to check if we need a new page
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Load and add AIQUAA logo
  try {
    const logoResponse = await fetch('/images/aiquaa-logo.png');
    const logoBlob = await logoResponse.blob();
    const logoBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(logoBlob);
    });

    // Add logo centered at the top
    const logoWidth = 40;
    const logoHeight = 15;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logoBase64, 'PNG', logoX, yPosition, logoWidth, logoHeight);
    yPosition += logoHeight + 5;
  } catch (error) {
    console.error('Error loading logo:', error);
    // Continue without logo if it fails
  }

  // Title
  doc.setFontSize(24);
  doc.setTextColor(249, 115, 22); // Orange
  doc.text('AIQUAA | Informe Técnico', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('Evaluación: Exploratory Testing & Bug Hunt', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Result Badge
  checkPageBreak(20);
  const passed = report.score.percentage >= 70;
  doc.setFontSize(18);
  doc.setTextColor(passed ? 22 : 220, passed ? 163 : 38, passed ? 74 : 38);
  doc.text(
    `${report.score.totalPoints}/${report.score.maxPoints} puntos (${report.score.percentage.toFixed(1)}%)`,
    pageWidth / 2,
    yPosition,
    { align: 'center' },
  );
  yPosition += 15;

  // Candidate Info
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Información del Candidato', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Nombre: ${report.candidateInfo.fullName}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Email: ${report.candidateInfo.email}`, margin, yPosition);
  yPosition += 6;

  if (report.candidateInfo.githubProfile) {
    doc.text(`GitHub: ${report.candidateInfo.githubProfile}`, margin, yPosition);
    yPosition += 6;
  }

  doc.text(`Candidate ID: ${report.candidateInfo.candidateId}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Fecha: ${new Date(report.candidateInfo.testDate).toLocaleDateString('es-ES')}`, margin, yPosition);
  yPosition += 12;

  // Test Session
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Sesión de Prueba', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Duración: ${formatDuration(report.testSession.duration)}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Secciones exploradas: ${report.testSession.exploredSections.length}`, margin, yPosition);
  yPosition += 12;

  // Score Breakdown
  checkPageBreak(50);
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Desglose de Puntuación', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Bugs encontrados: ${report.score.bugsFoundPoints}/15 pts`, margin, yPosition);
  yPosition += 6;
  doc.text(`Calidad del reporte: ${report.score.reportQualityPoints}/10 pts`, margin, yPosition);
  yPosition += 6;
  doc.text(`Cobertura: ${report.score.coveragePoints}/5 pts`, margin, yPosition);
  yPosition += 12;

  // Bugs Found
  checkPageBreak(20);
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text(`Bugs Encontrados (${report.bugsFound.length})`, margin, yPosition);
  yPosition += 10;

  report.bugsFound.forEach((bug, index) => {
    checkPageBreak(50);

    // Bug Title
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const bugTitle = `Bug #${index + 1}: ${bug.title}`;
    doc.text(bugTitle, margin, yPosition);
    yPosition += 7;

    // Severity
    doc.setFontSize(9);
    const severityColor = getSeverityColor(bug.severity);
    const [r, g, b] = severityColor.match(/\w\w/g)!.map((x) => parseInt(x, 16));
    doc.setTextColor(r, g, b);
    doc.text(`Severidad: ${bug.severity}`, margin + 5, yPosition);
    yPosition += 6;

    // Category
    doc.setTextColor(75, 85, 99);
    doc.text(`Categoría: ${bug.category}`, margin + 5, yPosition);
    yPosition += 8;

    // Steps to Reproduce
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Pasos para Reproducir:', margin + 5, yPosition);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    bug.stepsToReproduce.forEach((step, i) => {
      checkPageBreak(6);
      const lines = doc.splitTextToSize(`${i + 1}. ${step}`, pageWidth - margin * 2 - 10);
      lines.forEach((line: string) => {
        doc.text(line, margin + 10, yPosition);
        yPosition += 5;
      });
    });
    yPosition += 3;

    // Expected vs Actual
    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Resultado Esperado:', margin + 5, yPosition);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    const expectedLines = doc.splitTextToSize(bug.expectedResult, pageWidth - margin * 2 - 10);
    expectedLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 10, yPosition);
      yPosition += 5;
    });
    yPosition += 3;

    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Resultado Real:', margin + 5, yPosition);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    const actualLines = doc.splitTextToSize(bug.actualResult, pageWidth - margin * 2 - 10);
    actualLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 10, yPosition);
      yPosition += 5;
    });
    yPosition += 3;

    // Embed images if any
    if (bug.images && bug.images.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Capturas de Pantalla:', margin + 5, yPosition);
      yPosition += 7;

      for (const image of bug.images) {
        try {
          checkPageBreak(60);

          // Extract format from mimeType or base64 data
          let format = 'JPEG';
          if (image.mimeType.includes('png')) format = 'PNG';
          else if (image.mimeType.includes('gif')) format = 'GIF';
          else if (image.mimeType.includes('webp')) format = 'WEBP';

          // Calculate image dimensions (max width: 160, maintain aspect ratio)
          const maxWidth = pageWidth - margin * 2 - 20;
          const maxHeight = 80;

          // Add image
          doc.addImage(image.base64Data, format, margin + 10, yPosition, maxWidth, maxHeight);
          yPosition += maxHeight + 5;

          // Image caption
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          const caption = `${image.fileName} (${formatFileSize(image.size)})`;
          doc.text(caption, margin + 10, yPosition);
          yPosition += 7;
        } catch (error) {
          console.error(`Error embedding image ${image.fileName}:`, error);
          // Continue with next image if one fails
          doc.setFontSize(8);
          doc.setTextColor(220, 38, 38);
          doc.text(`[Error al cargar imagen: ${image.fileName}]`, margin + 10, yPosition);
          yPosition += 7;
        }
      }

      yPosition += 5;
    } else {
      yPosition += 10;
    }
  });

  // Footer
  if (yPosition > pageHeight - 30) {
    doc.addPage();
    yPosition = margin;
  }
  yPosition = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `© ${new Date().getFullYear()} AIQUAA. Generado automáticamente el ${new Date().toLocaleString('es-ES')}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' },
  );

  // Download
  const fileName = `Informe-Tecnico-${report.candidateInfo.fullName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  doc.save(fileName);
}

export function exportToJSON(report: TechnicalReport): void {
  const dataStr = JSON.stringify(report, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-tecnico-${report.candidateInfo.candidateId}-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
