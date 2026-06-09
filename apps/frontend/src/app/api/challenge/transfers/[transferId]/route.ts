import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyChallengeToken } from '../../_lib/jwt';
import { getOrCreateSession } from '../../_lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { transferId: string } }
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

  // BUG #7: no ownership check — returns any transfer regardless of who initiated it
  const transfer = session.transfers.find((t) => t.id === params.transferId);

  if (!transfer) {
    return NextResponse.json(
      { error: 'Transferencia no encontrada' },
      { status: 404 }
    );
  }

  return NextResponse.json({ transfer });
}
