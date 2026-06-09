import { createHmac } from 'crypto';

const SECRET = process.env.CHALLENGE_JWT_SECRET ?? 'challenge-dev-secret';

function b64url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function decodeB64url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

export interface ChallengeClaims {
  sub: string;
  email: string;
  challengeToken: string;
  iat: number;
  exp: number;
}

export function signChallengeToken(payload: {
  sub: string;
  email: string;
  challengeToken: string;
}): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const claims: ChallengeClaims = {
    ...payload,
    iat: now,
    exp: now + 7200, // 2 hours
  };
  const body = b64url(JSON.stringify(claims));
  const sig = createHmac('sha256', SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyChallengeToken(
  token: string,
  skipExpCheck = false
): ChallengeClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, sig] = parts;
    const expectedSig = createHmac('sha256', SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (sig !== expectedSig) return null;

    const claims = JSON.parse(decodeB64url(body)) as ChallengeClaims;

    if (!skipExpCheck && claims.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return claims;
  } catch {
    return null;
  }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
