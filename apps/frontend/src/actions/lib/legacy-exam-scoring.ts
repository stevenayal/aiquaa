import {
  generateExamResult as generateGitExamResult,
  loadExamData as loadGitExamData,
} from '@/app/labs/git/utils';
import {
  generateExamResult as generateIstqbExamResult,
  loadExamData as loadIstqbExamData,
} from '@/app/labs/istqb/utils';
import {
  generateExamResult as generatePerformanceExamResult,
  loadExamData as loadPerformanceExamData,
} from '@/app/labs/performance/utils';

type LegacyExamType = 'git' | 'istqb' | 'performance';

type LegacyAnswer = {
  questionId?: unknown;
  userAnswer?: unknown;
  timeSpent?: unknown;
};

type LegacyPayload = {
  exam_type: string;
  participant_name?: string;
  github_profile?: string;
  exam_purpose?: string;
  company_name?: string;
  model?: string;
  language?: string;
  answers?: object;
};

function isLegacyExamType(value: string): value is LegacyExamType {
  return value === 'git' || value === 'istqb' || value === 'performance';
}

function normalizeAnswerRows(answers: object | undefined): LegacyAnswer[] {
  return Array.isArray(answers) ? (answers as LegacyAnswer[]) : [];
}

function answersToMap(rows: LegacyAnswer[]) {
  const map = new Map<number, string[]>();
  for (const row of rows) {
    const questionId = Number(row.questionId);
    const userAnswer = Array.isArray(row.userAnswer)
      ? row.userAnswer.filter(
          (item): item is string => typeof item === 'string'
        )
      : [];
    if (Number.isFinite(questionId)) {
      map.set(questionId, userAnswer);
    }
  }
  return map;
}

function durationsToMap(rows: LegacyAnswer[]) {
  const map = new Map<number, number>();
  for (const row of rows) {
    const questionId = Number(row.questionId);
    const timeSpent = Number(row.timeSpent);
    if (Number.isFinite(questionId) && Number.isFinite(timeSpent)) {
      map.set(questionId, timeSpent);
    }
  }
  return map;
}

export function recalculateLegacyExamPayload<T extends LegacyPayload>(
  payload: T
): T {
  if (!isLegacyExamType(payload.exam_type)) return payload;

  const answerRows = normalizeAnswerRows(payload.answers);
  if (answerRows.length === 0) return payload;

  const answerMap = answersToMap(answerRows);
  const questionIds = new Set(answerRows.map((row) => Number(row.questionId)));
  const questionDurations = durationsToMap(answerRows);

  if (payload.exam_type === 'istqb') {
    const language = payload.language === 'en' ? 'en' : 'es';
    const model = ['A', 'B', 'C'].includes(String(payload.model))
      ? String(payload.model).toLowerCase()
      : 'a';
    const examData = loadIstqbExamData(`${language}-model-${model}`);
    const questions = examData.questions.filter((question) =>
      questionIds.has(question.id)
    );
    const result = generateIstqbExamResult(
      payload.participant_name ?? '',
      questions,
      answerMap,
      0,
      examData.examInfo.passingScore,
      questionDurations
    );
    return {
      ...payload,
      score: result.score,
      total_questions: result.totalQuestions,
      correct_answers: result.correctAnswers,
      incorrect_answers: result.incorrectAnswers,
      passed: result.passed,
      percentage: result.percentage,
      answers: result.answers,
      learning_objectives: result.learningObjectiveAnalysis,
    };
  }

  if (payload.exam_type === 'git') {
    const examData = loadGitExamData();
    const questions = examData.questions.filter((question) =>
      questionIds.has(question.id)
    );
    const result = generateGitExamResult(
      payload.participant_name ?? '',
      payload.github_profile ?? '',
      (payload.exam_purpose as 'capacitacion') ?? 'capacitacion',
      payload.company_name,
      questions,
      answerMap,
      0,
      examData.examInfo.passingScore
    );
    return {
      ...payload,
      score: result.score,
      total_questions: result.totalQuestions,
      correct_answers: result.correctAnswers,
      incorrect_answers: result.incorrectAnswers,
      passed: result.passed,
      percentage: result.percentage,
      answers: result.answers,
      learning_objectives: result.learningObjectiveAnalysis,
    };
  }

  const examData = loadPerformanceExamData();
  const questions = examData.questions.filter((question) =>
    questionIds.has(question.id)
  );
  const result = generatePerformanceExamResult(
    payload.participant_name ?? '',
    payload.github_profile ?? '',
    (payload.exam_purpose as 'capacitacion') ?? 'capacitacion',
    payload.company_name,
    questions,
    answerMap,
    0,
    examData.examInfo.passingScore
  );
  return {
    ...payload,
    score: result.score,
    total_questions: result.totalQuestions,
    max_possible_score: result.maxPossibleScore,
    correct_answers: result.correctAnswers,
    incorrect_answers: result.incorrectAnswers,
    passed: result.passed,
    percentage: result.percentage,
    answers: result.answers,
    learning_objectives: result.learningObjectiveAnalysis,
  };
}
