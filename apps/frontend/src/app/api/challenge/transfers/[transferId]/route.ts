import { NextRequest, NextResponse } from 'next/server';
import { verifyChallengeToken, unauthorized } from '../../_lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { transferId: string } }
) {
  const session = await verifyChallengeToken(req);
  if (!session) return unauthorized();

  const supabase = createAdminClient();
  const { data: transfer, error } = await supabase
    .from('challenge_transfers')
    .select('*')
    .eq('id', params.transferId)
    .single();

  if (error || !transfer) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Transfer not found' },
      { status: 404 }
    );
  }

  // BUG #7: no ownership check — any user can query any transfer by id
  // Should be: if (transfer.session_id !== session.sessionId) return 403

  return NextResponse.json({
    id: transfer.id,
    fromAccountId: transfer.from_account_id,
    toAccountId: transfer.to_account_id,
    amount: Number(transfer.amount),
    currency: transfer.currency,
    description: transfer.description,
    idempotencyKey: transfer.idempotency_key,
    status: transfer.status,
    createdAt: transfer.created_at,
  });
}
