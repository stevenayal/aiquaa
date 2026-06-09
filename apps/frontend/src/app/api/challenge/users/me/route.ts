import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyChallengeToken } from '../../_lib/jwt';
import { getUserById } from '../../_lib/store';

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('authorization'));

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
  }

  // BUG #10: skip expiration check — expired tokens are accepted
  const claims = verifyChallengeToken(token, true);

  if (!claims) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  const user = getUserById(claims.sub as string);

  if (!user) {
    return NextResponse.json(
      { error: 'Usuario no encontrado' },
      { status: 404 }
    );
  }

  // BUG #6: exposes internalRiskScore — sensitive internal field
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    internalRiskScore: user.internalRiskScore,
  });
}
