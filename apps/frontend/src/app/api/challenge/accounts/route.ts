import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyChallengeToken } from '../_lib/jwt';
import { getOrCreateSession } from '../_lib/store';

export async function GET(req: NextRequest) {
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

  const userAccounts = session.accounts.filter((a) => a.ownerId === claims.sub);

  // BUG #8: field is named "balance" but OpenAPI spec documents it as "availableBalance"
  return NextResponse.json({
    accounts: userAccounts.map((a) => ({
      id: a.id,
      alias: a.alias,
      type: a.type,
      currency: a.currency,
      balance: a.balance,
    })),
  });
}
