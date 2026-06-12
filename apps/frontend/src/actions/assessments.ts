'use server';

import { saveExamResultAction } from '@/actions/exams';
import { createClient } from '@/lib/supabase/server';
import {
  ASSESSMENT_REGISTRY,
  DEFAULT_ASSESSMENT_SLUG,
  type AssessmentRegistryEntry,
} from '@/app/assessments/_shared/registry';
import {
  ensureXpRules,
  grantGamificationXpEvent,
} from '@/lib/gamification/grant-xp';
import {
  buildAssessmentFeedback,
  deriveCandidateLevel,
  scoreAssessmentQuestion,
} from '@/app/assessments/_shared/lib/scoring';
import {
  mapAnswer,
  mapAssessment,
  mapAttempt,
  mapQuestion,
  mapSection,
  mapSectionScore,
} from '@/app/assessments/_shared/lib/serializers';
import type {
  AssessmentFeedback,
  AssessmentOverview,
  AssessmentResultSummary,
  AssessmentSectionPayload,
  AssessmentSectionScore,
  CandidateBand,
} from '@/app/assessments/_shared/types';

async function getAuthenticatedUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('No autenticado');
  }

  return { supabase, user };
}

async function awardAssessmentGamification(
  entry: AssessmentRegistryEntry,
  input: {
    userId: string;
    attemptId: string;
    passed: boolean;
    percentage: number;
    score: number;
    candidateLevel: string;
  }
) {
  await ensureXpRules(entry.gamificationRules);

  const events = entry.buildGamificationEvents({
    attemptId: input.attemptId,
    assessmentSlug: entry.slug,
    passed: input.passed,
    percentage: input.percentage,
    score: input.score,
    candidateLevel: input.candidateLevel,
  });

  for (const event of events) {
    await grantGamificationXpEvent({
      userId: input.userId,
      eventType: event.eventType,
      source: entry.gamificationSource,
      sourceId: event.sourceId,
      metadata: event.metadata,
    });
  }
}

// Memo por instancia: una vez verificada la versión del seed de un slug, las
// requests siguientes de esa lambda no vuelven a comparar metadata.
const verifiedSeedVersions = new Map<string, number>();

async function getAssessmentBySlug(slug: string) {
  const { supabase } = await getAuthenticatedUser();

  const fetchAssessment = () =>
    supabase
      .from('assessments')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

  let { data: assessment } = await fetchAssessment();

  const registryEntry = ASSESSMENT_REGISTRY[slug];

  if (
    registryEntry &&
    verifiedSeedVersions.get(slug) !== registryEntry.seedVersion
  ) {
    const seededVersion = (
      assessment?.metadata as Record<string, unknown> | null
    )?.seedVersion;

    if (!assessment || seededVersion !== registryEntry.seedVersion) {
      await registryEntry.ensureSeeded();
      ({ data: assessment } = await fetchAssessment());
    }

    if (assessment) {
      verifiedSeedVersions.set(slug, registryEntry.seedVersion);
    }
  }

  if (!assessment) {
    throw new Error('Assessment no encontrado');
  }

  return mapAssessment(assessment);
}

async function getAssessmentSections(assessmentId: string) {
  const { supabase } = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from('assessment_sections')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('order_index', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapSection(row));
}

async function getAttemptRecord(attemptId: string) {
  const { supabase, user } = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from('assessment_attempts')
    .select('*, assessments!inner(slug)')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) throw new Error('Intento no encontrado');

  const assessmentSlug = String(
    (data.assessments as { slug?: unknown } | null)?.slug ?? ''
  );

  return { ...mapAttempt(data), assessmentSlug };
}

async function loadSectionBundle(attemptId: string, sectionSlug: string) {
  const { supabase } = await getAuthenticatedUser();
  const attempt = await getAttemptRecord(attemptId);
  const assessment = await getAssessmentBySlug(attempt.assessmentSlug);
  const sections = await getAssessmentSections(assessment.id);
  const section = sections.find((item) => item.slug === sectionSlug);

  if (!section) throw new Error('Sección no encontrada');

  const [{ data: questions }, { data: answers }, { data: scores }] =
    await Promise.all([
      supabase
        .from('assessment_questions')
        .select('*')
        .eq('section_id', section.id)
        .order('order_index', { ascending: true }),
      supabase
        .from('assessment_answers')
        .select('*, assessment_questions!inner(section_id)')
        .eq('attempt_id', attemptId)
        .eq('assessment_questions.section_id', section.id),
      supabase
        .from('assessment_scores')
        .select('*')
        .eq('attempt_id', attemptId),
    ]);

  return {
    attempt,
    assessment,
    sections,
    section,
    questions: (questions ?? []).map((row) => mapQuestion(row)),
    answers: (answers ?? []).map((row) => mapAnswer(row)),
    scores: (scores ?? []).map((row) => mapSectionScore(row)),
  };
}

function getProcessCodeFromAttemptMetadata(
  metadata: Record<string, unknown> | undefined
) {
  const processCode = metadata?.processCode;
  return typeof processCode === 'string' && processCode.trim()
    ? processCode.trim().toUpperCase()
    : undefined;
}

function getSectionScoringMode(): AssessmentSectionScore['scoring_mode'] {
  return 'automatic';
}

export async function getAssessmentOverviewAction(
  slug = DEFAULT_ASSESSMENT_SLUG
): Promise<AssessmentOverview> {
  const assessment = await getAssessmentBySlug(slug);
  const sections = await getAssessmentSections(assessment.id);

  return { assessment, sections };
}

export async function startAssessmentAttemptAction(input?: {
  slug?: string;
  processCode?: string;
}) {
  const slug = input?.slug ?? DEFAULT_ASSESSMENT_SLUG;
  const assessment = await getAssessmentBySlug(slug);
  const sections = await getAssessmentSections(assessment.id);
  const firstSectionSlug = sections[0]?.slug ?? null;
  const { supabase, user } = await getAuthenticatedUser();

  const { data: existingAttempt } = await supabase
    .from('assessment_attempts')
    .select('*')
    .eq('assessment_id', assessment.id)
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingAttempt) {
    const savedSlug = existingAttempt.current_section_slug;
    const slugValid = sections.some((s) => s.slug === savedSlug);
    return {
      attempt: mapAttempt(existingAttempt),
      sectionSlug: slugValid
        ? savedSlug
        : firstSectionSlug || sections[0]?.slug,
    };
  }

  const { data, error } = await supabase
    .from('assessment_attempts')
    .insert({
      assessment_id: assessment.id,
      user_id: user.id,
      status: 'in_progress',
      current_section_slug: firstSectionSlug,
      max_score: assessment.total_score,
      metadata: {
        processCode: input?.processCode?.trim().toUpperCase() || null,
      },
    })
    .select('*')
    .single();

  if (error || !data)
    throw new Error(error?.message ?? 'No se pudo iniciar el intento');

  return {
    attempt: mapAttempt(data),
    sectionSlug: firstSectionSlug,
  };
}

export async function getAssessmentSectionAction(
  attemptId: string,
  sectionSlug: string
): Promise<AssessmentSectionPayload> {
  const bundle = await loadSectionBundle(attemptId, sectionSlug);

  return {
    attempt: bundle.attempt,
    section: bundle.section,
    questions: bundle.questions,
    answers: bundle.answers,
    scores: bundle.scores,
    sections: bundle.sections,
  };
}

export async function saveAssessmentAnswerAction(input: {
  attemptId: string;
  questionId: string;
  answer: unknown;
  currentSectionSlug?: string;
}) {
  const { supabase } = await getAuthenticatedUser();
  await getAttemptRecord(input.attemptId);

  const timestamp = new Date().toISOString();

  const { error: answerError } = await supabase
    .from('assessment_answers')
    .upsert(
      {
        attempt_id: input.attemptId,
        question_id: input.questionId,
        answer: input.answer ?? {},
        updated_at: timestamp,
      },
      { onConflict: 'attempt_id,question_id' }
    );

  if (answerError) throw new Error(answerError.message);

  const { error: attemptError } = await supabase
    .from('assessment_attempts')
    .update({
      current_section_slug: input.currentSectionSlug ?? null,
      updated_at: timestamp,
    })
    .eq('id', input.attemptId);

  if (attemptError) throw new Error(attemptError.message);

  return { success: true };
}

export async function submitAssessmentSectionAction(input: {
  attemptId: string;
  sectionSlug: string;
}) {
  const { supabase } = await getAuthenticatedUser();
  const bundle = await loadSectionBundle(input.attemptId, input.sectionSlug);

  let sectionScore = 0;
  const feedbackMessages: string[] = [];

  for (const question of bundle.questions) {
    const currentAnswer = bundle.answers.find(
      (answer) => answer.question_id === question.id
    );
    const scoreResult = scoreAssessmentQuestion(
      question,
      currentAnswer?.answer ?? null
    );

    sectionScore += scoreResult.score;
    if (scoreResult.feedback) {
      feedbackMessages.push(
        `Q${question.order_index}: ${scoreResult.feedback}`
      );
    }

    const { error } = await supabase.from('assessment_answers').upsert(
      {
        attempt_id: input.attemptId,
        question_id: question.id,
        answer: currentAnswer?.answer ?? {},
        is_correct: scoreResult.isCorrect,
        score: scoreResult.score,
        feedback: scoreResult.feedback,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'attempt_id,question_id' }
    );

    if (error) throw new Error(error.message);
  }

  const scoringMode = getSectionScoringMode();
  const sectionFeedback = feedbackMessages.join(' ');

  const { data: savedScore, error: scoreError } = await supabase
    .from('assessment_scores')
    .upsert(
      {
        attempt_id: input.attemptId,
        section_id: bundle.section.id,
        score: sectionScore,
        max_score: bundle.section.max_score,
        scoring_mode: scoringMode,
        feedback: sectionFeedback,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'attempt_id,section_id' }
    )
    .select('*')
    .single();

  if (scoreError || !savedScore)
    throw new Error(scoreError?.message ?? 'No se pudo guardar el score');

  const nextSection = bundle.sections.find(
    (section) => section.order_index === bundle.section.order_index + 1
  );

  const { error: attemptError } = await supabase
    .from('assessment_attempts')
    .update({
      current_section_slug: nextSection?.slug ?? bundle.section.slug,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.attemptId);

  if (attemptError) throw new Error(attemptError.message);

  return {
    score: mapSectionScore(savedScore),
    nextSectionSlug: nextSection?.slug ?? null,
  };
}

export async function finalizeAssessmentAttemptAction(attemptId: string) {
  const { supabase, user } = await getAuthenticatedUser();
  const attempt = await getAttemptRecord(attemptId);

  if (attempt.status === 'graded') {
    return getAssessmentResultAction(attemptId);
  }

  const assessment = await getAssessmentBySlug(attempt.assessmentSlug);
  const registryEntry = ASSESSMENT_REGISTRY[assessment.slug];
  const sections = await getAssessmentSections(assessment.id);
  const [{ data: scoresRows }, { data: feedbackRows }] = await Promise.all([
    supabase.from('assessment_scores').select('*').eq('attempt_id', attemptId),
    supabase
      .from('assessment_feedback')
      .select('*')
      .eq('attempt_id', attemptId),
  ]);

  const sectionScores = (scoresRows ?? []).map((row) => mapSectionScore(row));

  if (sectionScores.length < sections.length) {
    throw new Error('Todavía faltan secciones por corregir.');
  }

  const totalScore = sectionScores.reduce((sum, item) => sum + item.score, 0);
  const percentage = Math.max(
    0,
    Math.min(100, Math.round((totalScore / assessment.total_score) * 100))
  );
  const candidateLevel = deriveCandidateLevel(
    totalScore,
    assessment.metadata?.candidateBands as CandidateBand[] | undefined
  );
  const passed = totalScore >= Number(assessment.metadata?.passingScore ?? 60);
  const generatedFeedback = buildAssessmentFeedback(
    sections,
    sectionScores,
    attemptId
  );

  if ((feedbackRows ?? []).length === 0) {
    const { error: feedbackError } = await supabase
      .from('assessment_feedback')
      .insert(generatedFeedback.feedbackEntries);

    if (feedbackError) throw new Error(feedbackError.message);
  } else {
    for (const entry of generatedFeedback.feedbackEntries) {
      const { error: feedbackUpdateError } = await supabase
        .from('assessment_feedback')
        .upsert(entry, { onConflict: 'attempt_id,level' });

      if (feedbackUpdateError) throw new Error(feedbackUpdateError.message);
    }
  }

  const submittedAt = new Date().toISOString();
  const timeSpentSeconds = Math.max(
    60,
    Math.round(
      (new Date(submittedAt).getTime() -
        new Date(attempt.started_at).getTime()) /
        1000
    )
  );

  const { error: attemptError } = await supabase
    .from('assessment_attempts')
    .update({
      status: 'graded',
      submitted_at: submittedAt,
      total_score: totalScore,
      percentage,
      passed,
      candidate_level: candidateLevel,
      strengths: generatedFeedback.strengths,
      weaknesses: generatedFeedback.weaknesses,
      recommendations: generatedFeedback.recommendations,
      updated_at: submittedAt,
    })
    .eq('id', attemptId);

  if (attemptError) throw new Error(attemptError.message);

  const [{ data: answersRows }, { data: feedbackAfter }] = await Promise.all([
    supabase.from('assessment_answers').select('*').eq('attempt_id', attemptId),
    supabase
      .from('assessment_feedback')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('level', { ascending: true }),
  ]);

  const answers = (answersRows ?? []).map((row) => mapAnswer(row));
  const correctAnswers = answers.filter((answer) => answer.is_correct).length;
  const incorrectAnswers = Math.max(0, answers.length - correctAnswers);

  if (registryEntry) {
    const examResult = await saveExamResultAction({
      exam_type: registryEntry.examType,
      exam_mode: 'exam',
      score: totalScore,
      total_questions: answers.length,
      max_possible_score: assessment.total_score,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
      passing_score: Number(assessment.metadata?.passingScore ?? 60),
      passed,
      percentage,
      time_spent: timeSpentSeconds,
      process_code: getProcessCodeFromAttemptMetadata(attempt.metadata),
      metadata: {
        assessment_attempt_id: attemptId,
        candidate_level: candidateLevel,
        section_scores: sectionScores.map((score) => ({
          section_id: score.section_id,
          score: score.score,
          max_score: score.max_score,
        })),
        strengths: generatedFeedback.strengths,
        weaknesses: generatedFeedback.weaknesses,
        recommendations: generatedFeedback.recommendations,
      },
    });

    if (examResult?.error) {
      console.warn(
        `[assessments] no se pudo guardar exam_results para ${assessment.slug}`,
        examResult.error
      );
    }

    try {
      await awardAssessmentGamification(registryEntry, {
        userId: user.id,
        attemptId,
        passed,
        percentage,
        score: totalScore,
        candidateLevel,
      });
    } catch (error) {
      console.warn(
        `[assessments] ${assessment.slug} gamification sync failed`,
        error
      );
    }
  }

  const updatedAttempt = await getAttemptRecord(attemptId);
  const feedback = ((feedbackAfter ?? []) as Record<string, unknown>[]).map(
    (row) =>
      ({
        id: String(row.id),
        attempt_id: String(row.attempt_id),
        level: Number(row.level),
        message: String(row.message),
        recommendations: ((row.recommendations as string[] | null) ??
          []) as string[],
        created_at: row.created_at ? String(row.created_at) : undefined,
      }) satisfies AssessmentFeedback
  );

  return {
    attempt: updatedAttempt,
    assessment,
    sections: sections.map((section) => {
      const score = sectionScores.find(
        (item) => item.section_id === section.id
      );
      return {
        ...section,
        score: score?.score ?? 0,
        feedback: score?.feedback ?? '',
      };
    }),
    feedback,
  } satisfies AssessmentResultSummary;
}

export async function getAssessmentResultAction(
  attemptId: string
): Promise<AssessmentResultSummary> {
  const { supabase } = await getAuthenticatedUser();
  const attempt = await getAttemptRecord(attemptId);
  const assessment = await getAssessmentBySlug(attempt.assessmentSlug);
  const sections = await getAssessmentSections(assessment.id);

  const [{ data: scoresRows }, { data: feedbackRows }] = await Promise.all([
    supabase.from('assessment_scores').select('*').eq('attempt_id', attemptId),
    supabase
      .from('assessment_feedback')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('level', { ascending: true }),
  ]);

  const sectionScores = (scoresRows ?? []).map((row) => mapSectionScore(row));
  const feedback = ((feedbackRows ?? []) as Record<string, unknown>[]).map(
    (row) =>
      ({
        id: String(row.id),
        attempt_id: String(row.attempt_id),
        level: Number(row.level),
        message: String(row.message),
        recommendations: ((row.recommendations as string[] | null) ??
          []) as string[],
        created_at: row.created_at ? String(row.created_at) : undefined,
      }) satisfies AssessmentFeedback
  );

  return {
    attempt,
    assessment,
    sections: sections.map((section) => {
      const score = sectionScores.find(
        (item) => item.section_id === section.id
      );
      return {
        ...section,
        score: score?.score ?? 0,
        feedback: score?.feedback ?? '',
      };
    }),
    feedback,
  };
}
