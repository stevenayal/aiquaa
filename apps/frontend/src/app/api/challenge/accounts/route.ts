import { NextRequest, NextResponse } from 'next/server';
import { verifyChallengeToken, unauthorized } from '../_lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await verifyChallengeToken(req);
  if (!session) return unauthorized();

  const supabase = createAdminClient();
  const { data: accounts } = await supabase
    .from('challenge_accounts')
    .select('*')
    .eq('user_id', session.userId);

  // BUG #8: returns 'balance' field but OpenAPI documents 'availableBalance'
  const mapped = (accounts ?? []).map((a) => ({
    id: a.id,
    userId: a.user_id,
    accountNumber: a.account_number,
    currency: a.currency,
    balance: Number(a.balance), // field name mismatch with OpenAPI spec
  }));

  return NextResponse.json(mapped);
}
