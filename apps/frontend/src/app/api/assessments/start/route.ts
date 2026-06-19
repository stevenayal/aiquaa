import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getExamUserDefaults } from '@/lib/exam-user-defaults';
import { signChallengeToken } from '../../challenge/_lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const { processCode } = body ?? {};

    const authClient = createClient();
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Iniciá sesión para rendir este challenge.' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    const defaults = getExamUserDefaults(user);
    const candidateName =
      profile?.display_name?.trim() ||
      defaults.fullName ||
      defaults.email ||
      `Usuario ${user.id.slice(0, 8)}`;
    const candidateEmail = defaults.email || null;

    // Validar código de proceso si fue provisto
    let resolvedProcessCode: string | null = null;
    if (typeof processCode === 'string' && processCode.trim()) {
      const { data: process } = await supabase
        .from('hiring_processes')
        .select('code, status, expires_at')
        .ilike('code', processCode.trim())
        .eq('status', 'active')
        .maybeSingle();

      const expired =
        process?.expires_at && new Date(process.expires_at) < new Date();

      if (!process || expired) {
        return NextResponse.json(
          { error: 'Código de proceso inválido, vencido o cerrado.' },
          { status: 400 }
        );
      }

      resolvedProcessCode = process.code;
    }

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
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        aiquaa_user_id: user.id,
        process_code: resolvedProcessCode,
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
      { attemptId: attempt.id, challengeToken, sessionId, candidateName },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
