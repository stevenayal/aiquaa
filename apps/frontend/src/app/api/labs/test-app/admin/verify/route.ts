import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/labs/test-app/admin/verify
 *
 * Verifies the admin key server-side (TEST_APP_ADMIN_KEY is a server-only env var,
 * never exposed to the client bundle). On success, sets an httpOnly cookie
 * so the client doesn't need to keep resubmitting the key.
 *
 * Request body: { key: string }
 * Response: { authorized: boolean }
 *
 * GET /api/labs/test-app/admin/verify
 *
 * Checks the existing session cookie (used on page reload).
 * Response: { authorized: boolean }
 */
const COOKIE_NAME = 'testapp_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 4; // 4 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const key = typeof body?.key === 'string' ? body.key : '';
    const adminKey =
      process.env.TEST_APP_ADMIN_KEY || process.env.ADMIN_KEY || '';

    // Empty ADMIN_KEY means admin is disabled — reject even empty-string match
    if (!adminKey || key !== adminKey) {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }

    const response = NextResponse.json({ authorized: true }, { status: 200 });
    response.cookies.set(COOKIE_NAME, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/labs/test-app',
      maxAge: COOKIE_MAX_AGE,
    });
    return response;
  } catch (error: any) {
    console.error('Error verifying test-app admin key:', error);
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authorized = request.cookies.get(COOKIE_NAME)?.value === '1';
  return NextResponse.json({ authorized }, { status: 200 });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
