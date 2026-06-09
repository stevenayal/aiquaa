import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

export async function GET(
  _req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('assessment_bug_reports')
    .select('*')
    .eq('attempt_id', Number(params.attemptId))
    .order('created_at');

  if (error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const attemptId = Number(params.attemptId);
  if (isNaN(attemptId))
    return NextResponse.json({ error: 'Invalid attemptId' }, { status: 400 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const items = Array.isArray(body) ? body : [body];
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const r = items[i];
    if (!r.title?.trim()) errors.push(`[${i}] title is required`);
    if (!r.endpoint?.trim()) errors.push(`[${i}] endpoint is required`);
    if (!r.stepsToReproduce?.trim())
      errors.push(`[${i}] stepsToReproduce is required`);
    if (!r.actualResult?.trim()) errors.push(`[${i}] actualResult is required`);
    if (!r.expectedResult?.trim())
      errors.push(`[${i}] expectedResult is required`);
    if (!VALID_PRIORITIES.includes(r.severity))
      errors.push(
        `[${i}] severity must be one of ${VALID_PRIORITIES.join(', ')}`
      );
    if (!VALID_PRIORITIES.includes(r.priority))
      errors.push(
        `[${i}] priority must be one of ${VALID_PRIORITIES.join(', ')}`
      );
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Validation failed', details: errors },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const rows = items.map((r: any) => ({
    attempt_id: attemptId,
    title: r.title.trim(),
    description: r.description?.trim() ?? null,
    steps_to_reproduce: r.stepsToReproduce.trim(),
    actual_result: r.actualResult.trim(),
    expected_result: r.expectedResult.trim(),
    severity: r.severity,
    priority: r.priority,
    endpoint: r.endpoint.trim(),
    evidence: r.evidence?.trim() ?? null,
    bug_tag: r.bugTag ?? null,
  }));

  const { data, error } = await supabase
    .from('assessment_bug_reports')
    .insert(rows)
    .select();

  if (error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id)
    return NextResponse.json({ error: 'id param required' }, { status: 400 });

  const supabase = createAdminClient();
  await supabase
    .from('assessment_bug_reports')
    .delete()
    .eq('id', Number(id))
    .eq('attempt_id', Number(params.attemptId));

  return NextResponse.json({ ok: true });
}
