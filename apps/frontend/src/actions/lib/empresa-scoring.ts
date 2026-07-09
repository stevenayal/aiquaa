// Standalone scoring for empresa_pruebas — deliberately does not import from
// apps/frontend/src/app/assessments/_shared/lib/scoring.ts to avoid coupling
// the two domains' data shapes. Only 3 question types, so this stays small.

export type EmpresaQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_text';

export interface EmpresaPregunta {
  id: string;
  question_type: EmpresaQuestionType;
  correct_answer: unknown;
  expected_keywords?: string[] | null;
  points: number;
}

export interface EmpresaScoreResult {
  questionId: string;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  autoScored: boolean;
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function parseStringAnswer(answer: unknown): string {
  if (typeof answer === 'string') return answer;
  if (answer && typeof answer === 'object' && 'value' in answer) {
    const value = (answer as { value?: unknown }).value;
    return typeof value === 'string' ? value : '';
  }
  return '';
}

function parseBooleanAnswer(answer: unknown): boolean {
  if (typeof answer === 'boolean') return answer;
  if (answer && typeof answer === 'object' && 'value' in answer) {
    return Boolean((answer as { value?: unknown }).value);
  }
  return false;
}

function countKeywordMatches(text: string, keywords: string[]) {
  const normalized = normalizeText(text);
  return keywords.filter((keyword) =>
    normalized.includes(normalizeText(keyword))
  ).length;
}

function scoreMultipleChoice(
  pregunta: EmpresaPregunta,
  answer: unknown
): EmpresaScoreResult {
  const expected =
    (pregunta.correct_answer as { value?: string } | null)?.value ?? '';
  const actual = parseStringAnswer(answer);
  const isCorrect =
    normalizeText(actual) === normalizeText(expected) && actual !== '';
  return {
    questionId: pregunta.id,
    score: isCorrect ? pregunta.points : 0,
    maxScore: pregunta.points,
    isCorrect,
    autoScored: false,
  };
}

function scoreTrueFalse(
  pregunta: EmpresaPregunta,
  answer: unknown
): EmpresaScoreResult {
  const expected = Boolean(
    (pregunta.correct_answer as { value?: boolean } | null)?.value
  );
  const actual = parseBooleanAnswer(answer);
  const isCorrect = actual === expected;
  return {
    questionId: pregunta.id,
    score: isCorrect ? pregunta.points : 0,
    maxScore: pregunta.points,
    isCorrect,
    autoScored: false,
  };
}

function scoreShortText(
  pregunta: EmpresaPregunta,
  answer: unknown
): EmpresaScoreResult {
  const keywords = pregunta.expected_keywords ?? [];
  const answerText = parseStringAnswer(answer);

  if (keywords.length === 0 || !answerText.trim()) {
    return {
      questionId: pregunta.id,
      score: 0,
      maxScore: pregunta.points,
      isCorrect: false,
      autoScored: true,
    };
  }

  const matches = countKeywordMatches(answerText, keywords);
  const ratio = matches / keywords.length;
  const score = Math.min(
    pregunta.points,
    Math.max(0, Math.round(pregunta.points * ratio))
  );

  return {
    questionId: pregunta.id,
    score,
    maxScore: pregunta.points,
    isCorrect: ratio >= 0.6,
    autoScored: true,
  };
}

export function scoreEmpresaPregunta(
  pregunta: EmpresaPregunta,
  answer: unknown
): EmpresaScoreResult {
  switch (pregunta.question_type) {
    case 'multiple_choice':
      return scoreMultipleChoice(pregunta, answer);
    case 'true_false':
      return scoreTrueFalse(pregunta, answer);
    case 'short_text':
      return scoreShortText(pregunta, answer);
    default:
      return {
        questionId: pregunta.id,
        score: 0,
        maxScore: pregunta.points,
        isCorrect: false,
        autoScored: true,
      };
  }
}

export interface EmpresaScoringSummary {
  score: number;
  maxScore: number;
  breakdown: EmpresaScoreResult[];
}

export function scoreEmpresaIntento(
  preguntas: EmpresaPregunta[],
  answers: Record<string, unknown>
): EmpresaScoringSummary {
  const breakdown = preguntas.map((pregunta) =>
    scoreEmpresaPregunta(pregunta, answers[pregunta.id])
  );

  return {
    score: breakdown.reduce((sum, result) => sum + result.score, 0),
    maxScore: breakdown.reduce((sum, result) => sum + result.maxScore, 0),
    breakdown,
  };
}
