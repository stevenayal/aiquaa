import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { autoScore } from '@/app/assessments/api-banking/lib/scoring';

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
    .select('id, status')
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
  await supabase
    .from('qac_attempts')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      total_score: scoreResult.totalScore,
      summary: summary ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', attemptId);

  return NextResponse.json({ ok: true, score: scoreResult }, { status: 200 });
}
