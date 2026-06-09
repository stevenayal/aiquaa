'use server';

import { saveExamResultAction } from '@/actions/exams';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { API_TESTING_FUNDAMENTALS_SLUG } from '@/app/assessments/api-testing-fundamentals/data/assessment-definition';
import {
  API_TESTING_GAMIFICATION_RULES,
  buildApiTestingGamificationEvents,
  calculateXpLevel,
} from '@/app/assessments/api-testing-fundamentals/lib/gamification';
import {
  buildAssessmentFeedback,
  deriveCandidateLevel,
  scoreAssessmentQuestion,
} from '@/app/assessments/api-testing-fundamentals/lib/scoring';
import {
  mapAnswer,
  mapAssessment,
  mapAttempt,
  mapQuestion,
  mapSection,
  mapSectionScore,
} from '@/app/assessments/api-testing-fundamentals/lib/serializers';
import { ensureApiTestingFundamentalsSeeded } from '@/app/assessments/api-testing-fundamentals/lib/seed';
import type {
  AssessmentFeedback,
  AssessmentOverview,
  AssessmentResultSummary,
  AssessmentSectionPayload,
  AssessmentSectionScore,
} from '@/app/assessments/api-testing-fundamentals/types';

type XpRuleRow = {
  id: string | number;
  event_type: string;
  xp_amount: number;
  description: string;
  daily_limit: number | null;
  is_active: boolean;
};

type UserXpRow = {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  current_streak: number | null;
  longest_streak: number | null;
};

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

async function ensureApiTestingGamificationRules() {
  const admin = createAdminClient();

  const payload = API_TESTING_GAMIFICATION_RULES.map((rule) => ({
    event_type: rule.eventType,
    xp_amount: rule.xpAmount,
    description: rule.description,
    daily_limit: rule.dailyLimit,
    is_active: true,
  }));

  const { error } = await admin
    .from('xp_rules')
    .upsert(payload, { onConflict: 'event_type' });

  if (error) {
    throw new Error(error.message);
  }
}

async function grantGamificationXpEvent(input: {
  userId: string;
  eventType: string;
  source: string;
  sourceId: string;
  metadata: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const deduplicationKey = `${input.eventType}:${input.sourceId}`;

  const [
    { data: rule, error: ruleError },
    { data: existing, error: existingError },
  ] = await Promise.all([
    admin
      .from('xp_rules')
      .select('id, event_type, xp_amount, description, daily_limit, is_active')
      .eq('event_type', input.eventType)
      .eq('is_active', true)
      .maybeSingle<XpRuleRow>(),
    admin
      .from('xp_history')
      .select('id')
      .eq('user_id', input.userId)
      .eq('deduplication_key', deduplicationKey)
      .maybeSingle(),
  ]);

  if (ruleError) throw new Error(ruleError.message);
  if (existingError) throw new Error(existingError.message);
  if (!rule || existing) return;

  if (rule.daily_limit !== null && rule.daily_limit !== undefined) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const { count, error: countError } = await admin
      .from('xp_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', input.userId)
      .eq('event_type', input.eventType)
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', tomorrowStart.toISOString());

    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= rule.daily_limit) return;
  }

  const { data: currentXp, error: currentXpError } = await admin
    .from('user_xp')
    .select('id, user_id, total_xp, level, current_streak, longest_streak')
    .eq('user_id', input.userId)
    .maybeSingle<UserXpRow>();

  if (currentXpError) throw new Error(currentXpError.message);

  const nextTotalXp = (currentXp?.total_xp ?? 0) + rule.xp_amount;
  const nextLevel = calculateXpLevel(nextTotalXp);
  const now = new Date().toISOString();

  const { error: historyError } = await admin.from('xp_history').insert({
    user_id: input.userId,
    xp_rule_id: rule.id,
    event_type: input.eventType,
    xp_amount: rule.xp_amount,
    source: input.source,
    source_id: input.sourceId,
    deduplication_key: deduplicationKey,
    metadata: input.metadata,
  });

  if (historyError) throw new Error(historyError.message);

  const { error: userXpError } = await admin.from('user_xp').upsert(
    {
      user_id: input.userId,
      total_xp: nextTotalXp,
      level: nextLevel,
      current_streak: currentXp?.current_streak ?? 0,
      longest_streak: currentXp?.longest_streak ?? 0,
      last_activity_at: now,
      updated_at: now,
    },
    { onConflict: 'user_id' }
  );

  if (userXpError) throw new Error(userXpError.message);
}

async function awardApiTestingGamification(input: {
  userId: string;
  attemptId: string;
  passed: boolean;
  percentage: number;
  score: number;
  candidateLevel: string;
}) {
  await ensureApiTestingGamificationRules();

  const events = buildApiTestingGamificationEvents({
    attemptId: input.attemptId,
    assessmentSlug: API_TESTING_FUNDAMENTALS_SLUG,
    passed: input.passed,
    percentage: input.percentage,
    score: input.score,
    candidateLevel: input.candidateLevel,
  });

  for (const event of events) {
    await grantGamificationXpEvent({
      userId: input.userId,
      eventType: event.eventType,
      source: 'API_TESTING_FUNDAMENTALS',
      sourceId: event.sourceId,
      metadata: event.metadata,
    });
  }
}

async function getAssessmentBySlug(slug: string) {
  if (slug === API_TESTING_FUNDAMENTALS_SLUG) {
    await ensureApiTestingFundamentalsSeeded();
  }

  const { supabase } = await getAuthenticatedUser();
  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !assessment) {
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
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) throw new Error('Intento no encontrado');
  return mapAttempt(data);
}

async function loadSectionBundle(attemptId: string, sectionSlug: string) {
  const { supabase } = await getAuthenticatedUser();
  const attempt = await getAttemptRecord(attemptId);
  const assessment = await getAssessmentBySlug(API_TESTING_FUNDAMENTALS_SLUG);
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

function getSectionScoringMode(
  sectionSlug: string
): AssessmentSectionScore['scoring_mode'] {
  return sectionSlug === 'level-1-concepts' ||
    sectionSlug === 'level-2-doc-interpretation' ||
    sectionSlug === 'level-4-response-analysis'
    ? 'automatic'
    : 'heuristic';
}

export async function getAssessmentOverviewAction(
  slug = API_TESTING_FUNDAMENTALS_SLUG
): Promise<AssessmentOverview> {
  const assessment = await getAssessmentBySlug(slug);
  const sections = await getAssessmentSections(assessment.id);

  return { assessment, sections };
}

export async function startAssessmentAttemptAction(input?: {
  slug?: string;
  processCode?: string;
}) {
  const slug = input?.slug ?? API_TESTING_FUNDAMENTALS_SLUG;
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
    return {
      attempt: mapAttempt(existingAttempt),
      sectionSlug:
        existingAttempt.current_section_slug ||
        firstSectionSlug ||
        sections[0]?.slug,
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

  const scoringMode = getSectionScoringMode(bundle.section.slug);
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

  const assessment = await getAssessmentBySlug(API_TESTING_FUNDAMENTALS_SLUG);
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
  const candidateLevel = deriveCandidateLevel(totalScore);
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

  await saveExamResultAction({
    exam_type: 'api-testing-fundamentals',
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

  try {
    await awardApiTestingGamification({
      userId: user.id,
      attemptId,
      passed,
      percentage,
      score: totalScore,
      candidateLevel,
    });
  } catch (error) {
    console.warn(
      '[assessments] api-testing-fundamentals gamification sync failed',
      error
    );
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
  const assessment = await getAssessmentBySlug(API_TESTING_FUNDAMENTALS_SLUG);
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
