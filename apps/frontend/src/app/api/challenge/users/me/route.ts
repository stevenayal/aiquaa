import { NextRequest, NextResponse } from 'next/server';
import {
  verifyChallengeToken,
  getSessionUser,
  unauthorized,
} from '../../_lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // BUG #10: skips exp validation — accepts expired tokens on this endpoint
  const session = await verifyChallengeToken(req, { skipExpCheck: true });
  if (!session) return unauthorized();

  const user = await getSessionUser(session.userId);
  if (!user) return unauthorized('Usuario no encontrado');

  // BUG #6: exposes internal field internalRiskScore — should not be in the response
  return NextResponse.json({
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    internalRiskScore: user.internal_risk_score, // intentional sensitive data exposure
  });
}
