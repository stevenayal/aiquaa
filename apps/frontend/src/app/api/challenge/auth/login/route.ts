import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, generateId } from '../../_lib/store';
import { signChallengeToken } from '../../_lib/jwt';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    // BUG #12: vague error message — doesn't say which field is missing
    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 400 }
    );
  }

  const user = getUserByEmail(email);

  if (!user) {
    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    );
  }

  // Simplified password check for the challenge (not production auth)
  // Accepts the literal password "Test1234!" to avoid bcrypt in browser
  const passwordValid = password === 'Test1234!';
  if (!passwordValid) {
    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    );
  }

  const challengeToken = generateId('tok');
  const jwt = signChallengeToken({
    sub: user.id,
    email: user.email,
    challengeToken,
  });

  return NextResponse.json(
    {
      accessToken: jwt,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    },
    { status: 200 }
  );
}
