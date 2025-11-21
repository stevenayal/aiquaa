import type {
  ExamData,
  ExamQuestion,
  ExamResult,
  AnswerDetail,
  LearningObjectiveResult,
} from './types';

export function loadExamData(): ExamData {
  const data = require('./data/questions-git.json');
  return data;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function selectRandomQuestions(
  questions: ExamQuestion[],
  count: number,
): ExamQuestion[] {
  const shuffled = shuffleArray(questions);
  return shuffled.slice(0, count);
}

export function shuffleQuestionOptions(
  question: ExamQuestion,
): ExamQuestion {
  const shuffledOptions = shuffleArray(question.options);
  return {
    ...question,
    options: shuffledOptions,
  };
}

export function prepareExamQuestions(
  questions: ExamQuestion[],
  count: number,
  shuffleOptions: boolean = true,
): ExamQuestion[] {
  const selected = selectRandomQuestions(questions, count);

  if (shuffleOptions) {
    return selected.map(shuffleQuestionOptions);
  }

  return selected;
}

export function checkAnswer(
  userAnswer: string[],
  correctAnswer: string[],
): boolean {
  if (userAnswer.length !== correctAnswer.length) {
    return false;
  }

  const sortedUser = [...userAnswer].sort();
  const sortedCorrect = [...correctAnswer].sort();

  return sortedUser.every((ans, idx) => ans === sortedCorrect[idx]);
}

export function calculateScore(
  questions: ExamQuestion[],
  answers: Map<number, string[]>,
): number {
  let score = 0;

  questions.forEach((question) => {
    const userAnswer = answers.get(question.id) || [];
    if (checkAnswer(userAnswer, question.correctAnswer)) {
      score += question.points;
    }
  });

  return score;
}

export function generateExamResult(
  participantName: string,
  githubProfile: string,
  examPurpose: 'capacitacion' | 'postulacion' | 'practica' | 'otro',
  companyName: string | undefined,
  questions: ExamQuestion[],
  answers: Map<number, string[]>,
  timeSpent: number,
  passingScore: number,
): ExamResult {
  const answerDetails: AnswerDetail[] = questions.map((question) => {
    const userAnswer = answers.get(question.id) || [];
    const isCorrect = checkAnswer(userAnswer, question.correctAnswer);

    return {
      questionId: question.id,
      questionText: question.questionText,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      learningObjective: question.learningObjective,
      kLevel: question.kLevel,
      explanations: question.explanations,
    };
  });

  const score = calculateScore(questions, answers);
  const correctAnswers = answerDetails.filter((a) => a.isCorrect).length;
  const incorrectAnswers = answerDetails.length - correctAnswers;
  const percentage = (score / questions.length) * 100;
  const passed = score >= passingScore;

  const learningObjectiveAnalysis = calculateLearningObjectiveAnalysis(
    answerDetails,
  );

  return {
    participantName,
    githubProfile,
    examPurpose,
    companyName,
    score,
    totalQuestions: questions.length,
    correctAnswers,
    incorrectAnswers,
    passed,
    percentage,
    timeSpent,
    answers: answerDetails,
    learningObjectiveAnalysis,
  };
}

export function calculateLearningObjectiveAnalysis(
  answers: AnswerDetail[],
): LearningObjectiveResult[] {
  const loMap = new Map<string, { total: number; correct: number }>();

  answers.forEach((answer) => {
    const lo = answer.learningObjective;
    if (!loMap.has(lo)) {
      loMap.set(lo, { total: 0, correct: 0 });
    }

    const stats = loMap.get(lo)!;
    stats.total += 1;
    if (answer.isCorrect) {
      stats.correct += 1;
    }
  });

  const results: LearningObjectiveResult[] = [];
  loMap.forEach((stats, lo) => {
    results.push({
      learningObjective: lo,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      percentage: (stats.correct / stats.total) * 100,
    });
  });

  return results.sort((a, b) =>
    a.learningObjective.localeCompare(b.learningObjective),
  );
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function exportToCSV(result: ExamResult): string {
  const headers = [
    'Pregunta ID',
    'Texto de la Pregunta',
    'Respuesta del Usuario',
    'Respuesta Correcta',
    'Correcto',
    'Área de Conocimiento',
    'Nivel',
  ];

  const rows = result.answers.map((answer) => [
    answer.questionId.toString(),
    `"${answer.questionText.replace(/"/g, '""')}"`,
    answer.userAnswer.join(', '),
    answer.correctAnswer.join(', '),
    answer.isCorrect ? 'Sí' : 'No',
    answer.learningObjective,
    answer.kLevel,
  ]);

  const csv = [
    `Participante: ${result.participantName}`,
    `Puntaje: ${result.score}/${result.totalQuestions}`,
    `Porcentaje: ${result.percentage.toFixed(2)}%`,
    `Resultado: ${result.passed ? 'APROBADO' : 'NO APROBADO'}`,
    '',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csv;
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToPDF(result: ExamResult): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(249, 115, 22); // Orange color
  doc.text('AIQUAA | Examen Técnico GIT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Fundamentos de Control de Versiones', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Result Status
  doc.setFontSize(16);
  if (result.passed) {
    doc.setTextColor(22, 163, 74); // Green
  } else {
    doc.setTextColor(220, 38, 38); // Red
  }
  doc.text(result.passed ? '¡APROBADO!' : 'NO APROBADO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`${result.score}/${result.totalQuestions} preguntas correctas (${result.percentage.toFixed(2)}%)`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Participant Info
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text('Información del Participante', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Nombre: ${result.participantName}`, margin, yPosition);
  yPosition += 6;

  doc.text(`GitHub: ${result.githubProfile}`, margin, yPosition);
  yPosition += 6;

  // Motivo del examen
  const purposeLabels = {
    capacitacion: 'Capacitación',
    postulacion: 'Postulación / Proceso de Selección',
    practica: 'Práctica',
    otro: 'Otro'
  };
  doc.text(`Motivo: ${purposeLabels[result.examPurpose]}`, margin, yPosition);
  yPosition += 6;

  // Empresa (solo si el motivo es postulación)
  if (result.examPurpose === 'postulacion' && result.companyName) {
    doc.text(`Empresa: ${result.companyName}`, margin, yPosition);
    yPosition += 6;
  }

  const timeFormatted = formatTime(result.timeSpent);
  doc.text(`Tiempo Empleado: ${timeFormatted}`, margin, yPosition);
  yPosition += 6;

  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
  yPosition += 12;

  // Summary
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text('Resumen de Resultados', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Puntaje: ${result.score}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Correctas: ${result.correctAnswers}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Incorrectas: ${result.incorrectAnswers}`, margin, yPosition);
  yPosition += 12;

  // Learning Objectives Analysis
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text('Desglose por Áreas de Conocimiento', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  result.learningObjectiveAnalysis.forEach((lo) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setTextColor(75, 85, 99);
    doc.text(`${lo.learningObjective}: ${lo.correctAnswers}/${lo.totalQuestions} (${lo.percentage.toFixed(0)}%)`, margin, yPosition);
    yPosition += 6;
  });

  // Footer
  if (yPosition > 260) {
    doc.addPage();
    yPosition = 20;
  }
  yPosition = 280;
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(`© ${new Date().getFullYear()} AIQUAA. Generado automáticamente.`, pageWidth / 2, yPosition, { align: 'center' });

  // Download
  doc.save(`Examen-Git-${result.participantName.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
}

export async function sendResultByEmail(result: ExamResult): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const fullUrl = `${apiUrl}/api/v1/labs/git/send-result`;

  console.log('Enviando resultado al endpoint:', fullUrl);
  console.log('Datos a enviar:', { examResult: result });

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        examResult: result,
      }),
    });

    console.log('Respuesta del servidor:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error del servidor:', errorText);
      throw new Error(`Error al enviar el correo: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Correo enviado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('Error en sendResultByEmail:', error);
    throw error;
  }
}
