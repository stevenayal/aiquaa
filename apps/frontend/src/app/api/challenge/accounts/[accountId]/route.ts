import { NextRequest, NextResponse } from 'next/server';
import { verifyChallengeToken, unauthorized } from '../../_lib/auth';
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
  const { data: account, error } = await supabase
    .from('challenge_accounts')
    .select('*')
    .eq('id', params.accountId)
    .single();

  if (error || !account) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Account not found' },
      { status: 404 }
    );
  }

  // BUG #1: no ownership check — any authenticated user can see any account
  // Should be: if (account.user_id !== session.userId) return 403

  // BUG #8: returns 'balance' not 'availableBalance' as documented in OpenAPI
  return NextResponse.json({
    id: account.id,
    userId: account.user_id,
    accountNumber: account.account_number,
    currency: account.currency,
    balance: Number(account.balance),
  });
}
