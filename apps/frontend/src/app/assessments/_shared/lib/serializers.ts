import type {
  Assessment,
  AssessmentAnswer,
  AssessmentAttempt,
  AssessmentQuestion,
  AssessmentSection,
  AssessmentSectionScore,
} from '../types';

export function mapAssessment(row: Record<string, unknown>): Assessment {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description),
    level: String(row.level),
    type: String(row.type),
    duration_minutes: Number(row.duration_minutes ?? 90),
    total_score: Number(row.total_score ?? 100),
    is_active: Boolean(row.is_active),
    metadata: (row.metadata as Record<string, unknown> | undefined) ?? {},
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export function mapSection(row: Record<string, unknown>): AssessmentSection {
  return {
    id: String(row.id),
    assessment_id: String(row.assessment_id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description),
    order_index: Number(row.order_index ?? 0),
    max_score: Number(row.max_score ?? 0),
    metadata: (row.metadata as Record<string, unknown> | undefined) ?? {},
    created_at: row.created_at ? String(row.created_at) : undefined,
  };
}

export function mapQuestion(row: Record<string, unknown>): AssessmentQuestion {
  return {
    id: String(row.id),
    section_id: String(row.section_id),
    question_type: row.question_type as AssessmentQuestion['question_type'],
    prompt: String(row.prompt),
    description: row.description ? String(row.description) : null,
    options: ((row.options as Array<{ label: string; value: string }> | null) ??
      []) as Array<{
      label: string;
      value: string;
    }>,
    correct_answer: row.correct_answer ?? null,
    expected_keywords: ((row.expected_keywords as string[] | null) ??
      []) as string[],
    explanation: row.explanation ? String(row.explanation) : null,
    metadata: (row.metadata as Record<string, unknown> | undefined) ?? {},
    scoring_rules:
      (row.scoring_rules as Record<string, unknown> | undefined) ?? {},
    rubric: (row.rubric as Record<string, unknown> | undefined) ?? {},
    points: Number(row.points ?? 0),
    order_index: Number(row.order_index ?? 0),
    created_at: row.created_at ? String(row.created_at) : undefined,
  };
}

/**
 * Strips answer-key fields from a mapped question before it is sent to the
 * client while a candidate is actively answering. mapQuestion() keeps these
 * fields because it also backs server-only scoring paths (loadSectionBundle /
 * submitAssessmentSectionAction in actions/assessments.ts) that need the
 * full row — only the client-facing return value should go through this.
 */
export function stripAnswerKey(
  question: AssessmentQuestion
): AssessmentQuestion {
  return {
    ...question,
    correct_answer: null,
    expected_keywords: [],
    scoring_rules: {},
    rubric: {},
  };
}

export function mapAttempt(row: Record<string, unknown>): AssessmentAttempt {
  return {
    id: String(row.id),
    assessment_id: String(row.assessment_id),
    user_id: String(row.user_id),
    status: row.status as AssessmentAttempt['status'],
    current_section_slug: row.current_section_slug
      ? String(row.current_section_slug)
      : null,
    started_at: String(row.started_at),
    submitted_at: row.submitted_at ? String(row.submitted_at) : null,
    total_score:
      row.total_score === null || row.total_score === undefined
        ? null
        : Number(row.total_score),
    max_score: Number(row.max_score ?? 100),
    percentage:
      row.percentage === null || row.percentage === undefined
        ? null
        : Number(row.percentage),
    passed:
      row.passed === null || row.passed === undefined
        ? null
        : Boolean(row.passed),
    candidate_level:
      (row.candidate_level as AssessmentAttempt['candidate_level']) ?? null,
    strengths: ((row.strengths as string[] | null) ?? []) as string[],
    weaknesses: ((row.weaknesses as string[] | null) ?? []) as string[],
    recommendations: ((row.recommendations as string[] | null) ??
      []) as string[],
    metadata: (row.metadata as Record<string, unknown> | undefined) ?? {},
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export function mapAnswer(row: Record<string, unknown>): AssessmentAnswer {
  return {
    id: String(row.id),
    attempt_id: String(row.attempt_id),
    question_id: String(row.question_id),
    answer: row.answer ?? {},
    is_correct:
      row.is_correct === null || row.is_correct === undefined
        ? null
        : Boolean(row.is_correct),
    score: Number(row.score ?? 0),
    feedback: row.feedback ? String(row.feedback) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export function mapSectionScore(
  row: Record<string, unknown>
): AssessmentSectionScore {
  return {
    id: String(row.id),
    attempt_id: String(row.attempt_id),
    section_id: String(row.section_id),
    score: Number(row.score ?? 0),
    max_score: Number(row.max_score ?? 0),
    scoring_mode: row.scoring_mode as AssessmentSectionScore['scoring_mode'],
    feedback: row.feedback ? String(row.feedback) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}
