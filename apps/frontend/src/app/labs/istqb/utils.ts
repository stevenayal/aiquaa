import type {
  ExamData,
  ExamQuestion,
  ExamResult,
  AnswerDetail,
  LearningObjectiveResult,
} from './types';

import questionsModelA from './data/questions-modelo-a.json';
import questionsEnModelA from './data/questions-en-model-a.json';
import questionsEnModelB from './data/questions-en-model-b.json';
import questionsEnModelC from './data/questions-en-model-c.json';
import questionsEsModelB from './data/questions-es-model-b.json';
import questionsEsModelC from './data/questions-es-model-c.json';

export function loadExamData(examId: string = 'es-model-a'): ExamData {
  switch (examId) {
    case 'es-model-a':
      return questionsModelA as unknown as ExamData;
    case 'es-model-b':
      return questionsEsModelB as unknown as ExamData;
    case 'es-model-c':
      return questionsEsModelC as unknown as ExamData;
    case 'en-model-a':
      return questionsEnModelA as unknown as ExamData;
    case 'en-model-b':
      return questionsEnModelB as unknown as ExamData;
    case 'en-model-c':
      return questionsEnModelC as unknown as ExamData;
    default:
      return questionsModelA as unknown as ExamData;
  }
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
    'Learning Objective',
    'K-Level',
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
