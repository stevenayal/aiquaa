import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { signChallengeToken } from '../../_lib/auth';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid request' }, // bug #12: ambiguous error
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('challenge_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid request' },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid request' },
        { status: 401 }
      );
    }

    const sessionId = crypto.randomUUID();

    await supabase.from('challenge_sessions').insert({
      id: sessionId,
      user_id: user.id,
    });

    const token = await signChallengeToken(sessionId, user.id);

    return NextResponse.json({ token, userId: user.id }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
