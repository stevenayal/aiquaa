import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyChallengeToken } from '../../_lib/jwt';
import { getOrCreateSession } from '../../_lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { accountId: string } }
) {
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

  // BUG #1: no ownership check — returns any account regardless of who owns it
  const account = session.accounts.find((a) => a.id === params.accountId);

  if (!account) {
    return NextResponse.json(
      { error: 'Cuenta no encontrada' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: account.id,
    alias: account.alias,
    type: account.type,
    currency: account.currency,
    balance: account.balance,
    ownerId: account.ownerId,
  });
}
