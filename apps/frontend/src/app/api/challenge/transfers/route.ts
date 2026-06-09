import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyChallengeToken } from '../_lib/jwt';
import { getOrCreateSession, generateId } from '../_lib/store';

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('authorization'));

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
  }

  const claims = verifyChallengeToken(token);

  if (!claims) {
    return NextResponse.json(
      { error: 'Token inválido o expirado' },
      { status: 401 }
    );
  }

  const session = getOrCreateSession(
    claims.challengeToken as string,
    claims.sub as string
  );

  const body = await req.json().catch(() => ({}));
  const { fromAccountId, toAccountId, amount, description } = body as {
    fromAccountId?: string;
    toAccountId?: string;
    amount?: number;
    description?: string;
  };

  // BUG #11: no idempotency key check — duplicate requests create duplicate transfers
  // (Idempotency-Key header is ignored entirely)

  if (!fromAccountId || !toAccountId) {
    // BUG #12: ambiguous error — doesn't specify which field is missing
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // BUG #2 + #3: accepts amount === 0 and amount < 0 (no validation)
  if (amount === undefined || amount === null) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // BUG #9: accepts description longer than 120 chars
  // (no length validation at all)

  const fromAccount = session.accounts.find((a) => a.id === fromAccountId);
  const toAccount = session.accounts.find((a) => a.id === toAccountId);

  if (!fromAccount) {
    // BUG #4: returns 200 instead of 404 for unknown source account
    return NextResponse.json(
      { success: false, message: 'Cuenta de origen no encontrada' },
      { status: 200 }
    );
  }

  if (!toAccount) {
    return NextResponse.json(
      { error: 'Cuenta de destino no encontrada' },
      { status: 404 }
    );
  }

  // BUG #5: uses < instead of <= so exact-balance transfer is incorrectly rejected
  // Correct logic should be: fromAccount.balance < amount
  if (fromAccount.balance < amount) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 422 });
  }

  fromAccount.balance -= amount;
  toAccount.balance += amount;

  const transferId = generateId('txf');
  const now = new Date().toISOString();

  const transfer = {
    id: transferId,
    fromAccountId,
    toAccountId,
    amount,
    description: description ?? '',
    status: 'completed' as const,
    ownerId: claims.sub as string,
    createdAt: now,
  };

  session.transfers.push(transfer);

  session.movements.push({
    id: generateId('mov'),
    accountId: fromAccountId,
    transferId,
    type: 'debit',
    amount,
    description: description ?? `Transferencia a ${toAccountId}`,
    balance: fromAccount.balance,
    createdAt: now,
  });

  session.movements.push({
    id: generateId('mov'),
    accountId: toAccountId,
    transferId,
    type: 'credit',
    amount,
    description: description ?? `Transferencia de ${fromAccountId}`,
    balance: toAccount.balance,
    createdAt: now,
  });

  return NextResponse.json({ transfer }, { status: 201 });
}
