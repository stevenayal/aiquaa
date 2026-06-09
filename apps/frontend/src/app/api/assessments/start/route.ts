import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { signChallengeToken } from '../../challenge/_lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateName, candidateEmail, aiquaaUserId } = body ?? {};

    if (!candidateName?.trim()) {
      return NextResponse.json(
        { error: 'candidateName is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find the api-banking assessment
    const { data: assessment, error: aErr } = await supabase
      .from('qac_catalog')
      .select('id')
      .eq('slug', 'api-banking')
      .eq('is_active', true)
      .single();

    if (aErr || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Create attempt
    const { data: attempt, error: attemptErr } = await supabase
      .from('qac_attempts')
      .insert({
        catalog_id: assessment.id,
        candidate_name: candidateName.trim(),
        candidate_email: candidateEmail?.trim() ?? null,
        aiquaa_user_id: aiquaaUserId ?? null,
        status: 'in_progress',
      })
      .select('id')
      .single();

    if (attemptErr || !attempt) {
      return NextResponse.json(
        { error: 'Failed to create attempt' },
        { status: 500 }
      );
    }

    // Create challenge session (default to usr_001 — candidate picks via login)
    const sessionId = crypto.randomUUID();
    await supabase.from('challenge_sessions').insert({
      id: sessionId,
      attempt_id: attempt.id,
      user_id: 'usr_001',
    });

    const challengeToken = await signChallengeToken(sessionId, 'usr_001');

    return NextResponse.json(
      { attemptId: attempt.id, challengeToken, sessionId },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
