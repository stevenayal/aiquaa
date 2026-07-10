import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

describe('test-app admin verify route', () => {
  it('authorizes with TEST_APP_ADMIN_KEY and rejects missing keys', async () => {
    vi.stubEnv('TEST_APP_ADMIN_KEY', 'server-secret');
    vi.stubEnv('ADMIN_KEY', '');

    const okRequest = new NextRequest(
      'http://localhost:3000/api/labs/test-app/admin/verify',
      {
        method: 'POST',
        body: JSON.stringify({ key: 'server-secret' }),
        headers: { 'content-type': 'application/json' },
      }
    );

    const okResponse = await POST(okRequest);
    expect(okResponse.status).toBe(200);
    await expect(okResponse.json()).resolves.toEqual({ authorized: true });
    expect(okResponse.cookies.get('testapp_admin_session')?.value).toBe('1');

    const badRequest = new NextRequest(
      'http://localhost:3000/api/labs/test-app/admin/verify',
      {
        method: 'POST',
        body: JSON.stringify({ key: 'wrong-secret' }),
        headers: { 'content-type': 'application/json' },
      }
    );

    const badResponse = await POST(badRequest);
    expect(badResponse.status).toBe(401);
    await expect(badResponse.json()).resolves.toEqual({ authorized: false });

    vi.unstubAllEnvs();
  });

  it('reads the existing admin session cookie on GET', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/labs/test-app/admin/verify',
      {
        headers: {
          cookie: 'testapp_admin_session=1',
        },
      }
    );

    const response = await GET(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ authorized: true });
  });
});
