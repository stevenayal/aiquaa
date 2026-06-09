import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { createAdminClient } from '@/lib/supabase/admin';

const SECRET = new TextEncoder().encode(
  process.env.CHALLENGE_JWT_SECRET ?? 'challenge-dev-secret-change-in-prod'
);

export interface ChallengeTokenPayload {
  sub: string; // sessionId
  userId: string;
  iat: number;
  exp: number;
}

export async function signChallengeToken(
  sessionId: string,
  userId: string
): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sessionId)
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET);
}

export async function verifyChallengeToken(
  req: NextRequest,
  options: { skipExpCheck?: boolean } = {}
): Promise<{ sessionId: string; userId: string } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      clockTolerance: options.skipExpCheck ? 99999999 : 0,
    });
    return {
      sessionId: payload.sub as string,
      userId: payload['userId'] as string,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('challenge_users')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export function unauthorized(message = 'Token inválido o ausente') {
  return Response.json({ error: 'Unauthorized', message }, { status: 401 });
}
