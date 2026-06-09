import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const attemptId = Number(params.attemptId);
  if (isNaN(attemptId)) {
    return NextResponse.json({ error: 'Invalid attemptId' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const [attemptRes, testCasesRes, bugReportsRes, scoreRes] = await Promise.all(
    [
      supabase.from('qac_attempts').select('*').eq('id', attemptId).single(),
      supabase
        .from('qac_test_cases')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('created_at'),
      supabase
        .from('qac_bug_reports')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('created_at'),
      supabase
        .from('qac_scores')
        .select('*')
        .eq('attempt_id', attemptId)
        .single(),
    ]
  );

  if (!attemptRes.data) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  return NextResponse.json({
    attempt: toAttempt(attemptRes.data),
    testCases: (testCasesRes.data ?? []).map(toTestCase),
    bugReports: (bugReportsRes.data ?? []).map(toBugReport),
    score: scoreRes.data ? toScore(scoreRes.data) : null,
  });
}

function toAttempt(r: any) {
  return {
    id: r.id,
    assessmentId: r.assessment_id,
    aiquaaUserId: r.aiquaa_user_id,
    candidateName: r.candidate_name,
    candidateEmail: r.candidate_email,
    status: r.status,
    startedAt: r.started_at,
    submittedAt: r.submitted_at,
    totalScore: r.total_score ? Number(r.total_score) : null,
    summary: r.summary,
  };
}

function toTestCase(r: any) {
  return {
    id: r.id,
    attemptId: r.attempt_id,
    title: r.title,
    preconditions: r.preconditions,
    steps: r.steps,
    expectedResult: r.expected_result,
    type: r.type,
    priority: r.priority,
    createdAt: r.created_at,
  };
}

function toBugReport(r: any) {
  return {
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
  };
}

function toScore(r: any) {
  return {
    id: r.id,
    attemptId: r.attempt_id,
    testDesignScore: Number(r.test_design_score),
    apiValidationScore: Number(r.api_validation_score),
    securityScore: Number(r.security_score),
    bugReportingScore: Number(r.bug_reporting_score),
    executiveSummaryScore: Number(r.executive_summary_score),
    totalScore: Number(r.total_score),
    bugsFound: r.bugs_found,
    bugsTotal: r.bugs_total,
    feedback: r.feedback,
  };
}
