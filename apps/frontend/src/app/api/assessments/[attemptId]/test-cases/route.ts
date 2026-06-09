import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_TYPES = [
  'positive',
  'negative',
  'boundary',
  'security',
  'contract',
];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

export async function GET(
  _req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('qac_test_cases')
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

  // Accept single object or array
  const items = Array.isArray(body) ? body : [body];
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const tc = items[i];
    if (!tc.title?.trim()) errors.push(`[${i}] title is required`);
    if (!tc.steps?.trim()) errors.push(`[${i}] steps is required`);
    if (!tc.expectedResult?.trim())
      errors.push(`[${i}] expectedResult is required`);
    if (!VALID_TYPES.includes(tc.type))
      errors.push(`[${i}] type must be one of ${VALID_TYPES.join(', ')}`);
    if (tc.priority && !VALID_PRIORITIES.includes(tc.priority))
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

  const rows = items.map((tc: any) => ({
    attempt_id: attemptId,
    title: tc.title.trim(),
    preconditions: tc.preconditions?.trim() ?? null,
    steps: tc.steps.trim(),
    expected_result: tc.expectedResult.trim(),
    type: tc.type,
    priority: tc.priority ?? 'medium',
  }));

  const { data, error } = await supabase
    .from('qac_test_cases')
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
    .from('qac_test_cases')
    .delete()
    .eq('id', Number(id))
    .eq('attempt_id', Number(params.attemptId));

  return NextResponse.json({ ok: true });
}
