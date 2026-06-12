import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { signChallengeToken } from '../../challenge/_lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateName, candidateEmail, processCode } = body ?? {};

    if (!candidateName?.trim()) {
      return NextResponse.json(
        { error: 'candidateName is required' },
        { status: 400 }
      );
    }

    // Resolver el usuario server-side (no confiar en el body); null si invitado
    let aiquaaUserId: string | null = null;
    try {
      const authClient = createClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();
      aiquaaUserId = user?.id ?? null;
    } catch {
      aiquaaUserId = null;
    }

    const supabase = createAdminClient();

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
        candidate_name: candidateName.trim(),
        candidate_email: candidateEmail?.trim() ?? null,
        aiquaa_user_id: aiquaaUserId,
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
