import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyChallengeToken } from '../../../_lib/jwt';
import { getOrCreateSession } from '../../../_lib/store';

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

  const account = session.accounts.find(
    (a) => a.id === params.accountId && a.ownerId === claims.sub
  );

  if (!account) {
    return NextResponse.json(
      { error: 'Cuenta no encontrada' },
      { status: 404 }
    );
  }

  const movements = session.movements
    .filter((m) => m.accountId === params.accountId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return NextResponse.json({ movements, total: movements.length });
}
