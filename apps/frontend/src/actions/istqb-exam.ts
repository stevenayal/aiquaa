'use server';

import type {
  ExamQuestion,
  ExamResult,
  Explanation,
  PublicExamQuestion,
} from '@/app/labs/istqb/types';
import {
  generateExamResult,
  prepareExamQuestions,
} from '@/app/labs/istqb/utils';
import { loadExamData } from '@/app/labs/istqb/exam-data.server';

function toPublicQuestion(question: ExamQuestion): PublicExamQuestion {
  // eslint-disable-next-line no-unused-vars
  const { correctAnswer, explanations, ...rest } = question;
  return { ...rest, answerCount: correctAnswer.length };
}

export async function getExamConfigAction(examId: string) {
  const examData = loadExamData(examId);
  return {
    examInfo: examData.examInfo,
    availableQuestions: examData.questions.length,
  };
}

export async function startExamAction(params: {
  examId: string;
  count: number;
  shuffleOptions?: boolean;
}) {
  const examData = loadExamData(params.examId);
  const prepared = prepareExamQuestions(
    examData.questions,
    params.count,
    params.shuffleOptions ?? true
  );

  return {
    questions: prepared.map(toPublicQuestion),
    examInfo: examData.examInfo,
  };
}

export async function checkAnswerAction(params: {
  examId: string;
  questionId: number;
  userAnswer: string[];
}): Promise<{
  isCorrect: boolean;
  correctAnswer: string[];
  explanations: Record<string, Explanation>;
} | null> {
  const examData = loadExamData(params.examId);
  const question = examData.questions.find((q) => q.id === params.questionId);
  if (!question) return null;

  const sortedUser = [...params.userAnswer].sort();
  const sortedCorrect = [...question.correctAnswer].sort();
  const isCorrect =
    sortedUser.length === sortedCorrect.length &&
    sortedUser.every((ans, idx) => ans === sortedCorrect[idx]);

  return {
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanations: question.explanations,
  };
}

export async function submitExamAction(params: {
  examId: string;
  participantName: string;
  questionIds: number[];
  answers: Record<number, string[]>;
  questionDurations: Record<number, number>;
  timeSpent: number;
}): Promise<ExamResult> {
  const examData = loadExamData(params.examId);
  const byId = new Map(examData.questions.map((q) => [q.id, q]));

  const orderedQuestions = params.questionIds
    .map((id) => byId.get(id))
    .filter((q): q is ExamQuestion => Boolean(q));

  const answers = new Map<number, string[]>(
    Object.entries(params.answers).map(([id, value]) => [Number(id), value])
  );
  const questionDurations = new Map<number, number>(
    Object.entries(params.questionDurations).map(([id, value]) => [
      Number(id),
      Number(value),
    ])
  );

  return generateExamResult(
    params.participantName,
    orderedQuestions,
    answers,
    params.timeSpent,
    examData.examInfo.passingScore,
    questionDurations
  );
}
