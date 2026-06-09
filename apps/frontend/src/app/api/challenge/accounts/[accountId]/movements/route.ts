import { NextRequest, NextResponse } from 'next/server';
import { verifyChallengeToken, unauthorized } from '../../../_lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { accountId: string } }
) {
  const session = await verifyChallengeToken(req);
  if (!session) return unauthorized();

  const supabase = createAdminClient();

  // Verify account exists
  const { data: account } = await supabase
    .from('challenge_accounts')
    .select('id, user_id')
    .eq('id', params.accountId)
    .single();

  if (!account) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Account not found' },
      { status: 404 }
    );
  }

  if (account.user_id !== session.userId) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Access denied' },
      { status: 403 }
    );
  }

  const { data: movements } = await supabase
    .from('challenge_movements')
    .select('*')
    .eq('account_id', params.accountId)
    .eq('session_id', session.sessionId)
    .order('created_at', { ascending: false });

  return NextResponse.json(
    (movements ?? []).map((m) => ({
      id: m.id,
      accountId: m.account_id,
      transferId: m.transfer_id,
      type: m.type,
      amount: Number(m.amount),
      currency: m.currency,
      description: m.description,
      createdAt: m.created_at,
    }))
  );
}
