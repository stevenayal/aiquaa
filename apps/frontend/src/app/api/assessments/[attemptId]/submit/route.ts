import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { autoScore } from '@/app/assessments/api-banking/lib/scoring';
import {
  API_BANKING_GAMIFICATION_RULES,
  API_BANKING_PASS_THRESHOLD,
  buildApiBankingGamificationEvents,
} from '@/app/assessments/api-banking/lib/gamification';
import {
  ensureXpRules,
  grantGamificationXpEvent,
} from '@/lib/gamification/grant-xp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const attemptId = Number(params.attemptId);
  if (isNaN(attemptId))
    return NextResponse.json({ error: 'Invalid attemptId' }, { status: 400 });

  const supabase = createAdminClient();

  // Fetch attempt
  const { data: attempt } = await supabase
    .from('qac_attempts')
    .select(
      'id, status, started_at, aiquaa_user_id, candidate_name, candidate_email, process_code'
    )
    .eq('id', attemptId)
    .single();

  if (!attempt)
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  if (attempt.status !== 'in_progress') {
    return NextResponse.json(
      { error: 'Attempt already submitted' },
      { status: 409 }
    );
  }

  // Get summary from body if provided
  let summary: string | undefined;
  try {
    const body = await req.json();
    summary = body?.summary;
  } catch {
    /* summary optional */
  }

  // Fetch test cases and bug reports
  const [tcRes, brRes] = await Promise.all([
    supabase.from('qac_test_cases').select('*').eq('attempt_id', attemptId),
    supabase.from('qac_bug_reports').select('*').eq('attempt_id', attemptId),
  ]);

  const testCases = (tcRes.data ?? []).map((r: any) => ({
    id: r.id,
    attemptId: r.attempt_id,
    title: r.title,
    preconditions: r.preconditions,
    steps: r.steps,
    expectedResult: r.expected_result,
    type: r.type,
    priority: r.priority,
    createdAt: r.created_at,
  }));

  const bugReports = (brRes.data ?? []).map((r: any) => ({
    id: r.id,
    attemptId: r.attempt_id,
    title: r.title,
    description: r.description,
    stepsToReproduce: r.steps_to_reproduce,
    actualResult: r.actual_result,
    expectedResult: r.expected_result,
    severity: r.severity,
    priority: r.priority,
    endpoint: r.endpoint,
    evidence: r.evidence,
    bugTag: r.bug_tag,
    createdAt: r.created_at,
  }));

  const scoreResult = autoScore(testCases as any, bugReports as any, summary);

  // Persist score
  await supabase.from('qac_scores').upsert({
    attempt_id: attemptId,
    test_design_score: scoreResult.testDesignScore,
    api_validation_score: scoreResult.apiValidationScore,
    security_score: scoreResult.securityScore,
    bug_reporting_score: scoreResult.bugReportingScore,
    executive_summary_score: scoreResult.executiveSummaryScore,
    total_score: scoreResult.totalScore,
    bugs_found: scoreResult.bugsFound,
    bugs_total: scoreResult.bugsTotal,
    feedback: scoreResult.feedback,
  });

  // Update attempt status
  const submittedAt = new Date().toISOString();
  await supabase
    .from('qac_attempts')
    .update({
      status: 'submitted',
      submitted_at: submittedAt,
      total_score: scoreResult.totalScore,
      summary: summary ?? null,
      updated_at: submittedAt,
    })
    .eq('id', attemptId);

  // Resultado para ranking/dashboard de empresa + XP (solo usuarios autenticados:
  // exam_results.user_id es NOT NULL). Nunca debe romper el submit del candidato.
  if (attempt.aiquaa_user_id) {
    const totalScore = Math.round(scoreResult.totalScore);
    const passed = totalScore >= API_BANKING_PASS_THRESHOLD;
    const timeSpentSeconds = Math.max(
      60,
      Math.round(
        (new Date(submittedAt).getTime() -
          new Date(attempt.started_at).getTime()) /
          1000
      )
    );

    const { error: examResultError } = await supabase
      .from('exam_results')
      .insert({
        user_id: attempt.aiquaa_user_id,
        exam_type: 'api-banking',
        exam_mode: 'exam',
        score: totalScore,
        total_questions: scoreResult.bugsTotal,
        max_possible_score: 100,
        correct_answers: scoreResult.bugsFound,
        incorrect_answers: Math.max(
          0,
          scoreResult.bugsTotal - scoreResult.bugsFound
        ),
        passing_score: API_BANKING_PASS_THRESHOLD,
        passed,
        percentage: totalScore,
        time_spent: timeSpentSeconds,
        process_code: attempt.process_code ?? null,
        participant_name: attempt.candidate_name,
        participant_email: attempt.candidate_email,
        metadata: {
          qac_attempt_id: attemptId,
          test_design_score: scoreResult.testDesignScore,
          api_validation_score: scoreResult.apiValidationScore,
          security_score: scoreResult.securityScore,
          bug_reporting_score: scoreResult.bugReportingScore,
          executive_summary_score: scoreResult.executiveSummaryScore,
          bugs_found: scoreResult.bugsFound,
          bugs_total: scoreResult.bugsTotal,
        },
      });

    if (examResultError) {
      console.warn(
        '[api-banking] no se pudo guardar exam_results',
        examResultError.message
      );
    }

    try {
      await ensureXpRules(API_BANKING_GAMIFICATION_RULES);
      const events = buildApiBankingGamificationEvents({
        attemptId,
        totalScore,
        bugsFound: scoreResult.bugsFound,
        bugsTotal: scoreResult.bugsTotal,
      });
      for (const event of events) {
        await grantGamificationXpEvent({
          userId: attempt.aiquaa_user_id,
          eventType: event.eventType,
          source: 'API_BANKING',
          sourceId: event.sourceId,
          metadata: event.metadata,
        });
      }
    } catch (gamificationError) {
      console.warn('[api-banking] gamification sync failed', gamificationError);
    }
  }

  return NextResponse.json({ ok: true, score: scoreResult }, { status: 200 });
}
