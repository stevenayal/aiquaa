import { NextRequest, NextResponse } from 'next/server';
import { verifyChallengeToken, unauthorized } from '../_lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await verifyChallengeToken(req);
  if (!session) return unauthorized();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const {
    fromAccountId,
    toAccountId,
    amount,
    currency,
    description,
    idempotencyKey,
  } = body ?? {};

  if (!fromAccountId || !toAccountId || amount === undefined || !currency) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Invalid request' }, // bug #12: ambiguous
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // BUG #2 + #3: accepts amount === 0 and negative amounts
  // Should be: if (amount <= 0) return 400
  if (amount < 0) {
    // BUG #3: still processes negative amounts (this check is wrong)
    // The real check should catch both 0 and negative
  }

  // BUG #9: no description length validation
  // Should be: if (description && description.length > 120) return 400

  const { data: fromAccount } = await supabase
    .from('challenge_accounts')
    .select('*')
    .eq('id', fromAccountId)
    .single();

  if (!fromAccount) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Source account not found' },
      { status: 404 }
    );
  }

  if (fromAccount.user_id !== session.userId) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Access denied' },
      { status: 403 }
    );
  }

  const { data: toAccount } = await supabase
    .from('challenge_accounts')
    .select('*')
    .eq('id', toAccountId)
    .single();

  if (!toAccount) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Destination account not found' },
      { status: 404 }
    );
  }

  if (fromAccount.currency !== toAccount.currency) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Currency mismatch' },
      { status: 400 }
    );
  }

  // BUG #5: incorrect balance check — allows transfer when balance equals amount exactly in some edge cases
  // Should be: if (fromAccount.balance < amount)
  const currentBalance = Number(fromAccount.balance);
  if (currentBalance < amount && amount > 0) {
    // BUG #4 + #5: returns 200 instead of 400 for insufficient balance in some cases
    // The condition is slightly wrong — amount === 0 slips through entirely
    return NextResponse.json(
      { error: 'Bad Request', message: 'Insufficient balance' },
      { status: 200 } // BUG #4: should be 400
    );
  }

  // BUG #11: no idempotency check when idempotencyKey is absent
  // Should check: if idempotencyKey is present, query for existing transfer with same key+session
  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from('challenge_transfers')
      .select('id')
      .eq('session_id', session.sessionId)
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Duplicate idempotency key' },
        { status: 409 }
      );
    }
  }
  // If no idempotencyKey → duplicates are processed (bug #11)

  const transferId = `txn_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  await supabase.from('challenge_transfers').insert({
    id: transferId,
    session_id: session.sessionId,
    from_account_id: fromAccountId,
    to_account_id: toAccountId,
    amount,
    currency,
    description: description ?? null,
    idempotency_key: idempotencyKey ?? null,
    status: 'completed',
  });

  // Generate debit + credit movements
  const debitId = `mov_${crypto.randomUUID().slice(0, 8)}`;
  const creditId = `mov_${crypto.randomUUID().slice(0, 8)}`;

  await supabase.from('challenge_movements').insert([
    {
      id: debitId,
      session_id: session.sessionId,
      account_id: fromAccountId,
      transfer_id: transferId,
      type: 'debit',
      amount,
      currency,
      description: description ?? `Transferencia a ${toAccountId}`,
    },
    {
      id: creditId,
      session_id: session.sessionId,
      account_id: toAccountId,
      transfer_id: transferId,
      type: 'credit',
      amount,
      currency,
      description: description ?? `Transferencia desde ${fromAccountId}`,
    },
  ]);

  return NextResponse.json(
    {
      id: transferId,
      fromAccountId,
      toAccountId,
      amount,
      currency,
      description: description ?? null,
      idempotencyKey: idempotencyKey ?? null,
      status: 'completed',
      createdAt: now,
    },
    { status: 201 }
  );
}
