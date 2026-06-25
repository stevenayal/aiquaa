import { describe, expect, it } from 'vitest';
import {
  hasSupabaseAuthCookie,
  isAuthPath,
  isProtectedPath,
  isSupabaseAuthCookie,
  shouldVerifySupabaseUser,
} from '../src/middleware';

describe('auth middleware route guards', () => {
  it('detects Supabase auth cookies including chunked cookies', () => {
    expect(isSupabaseAuthCookie('sb-projectref-auth-token')).toBe(true);
    expect(isSupabaseAuthCookie('sb-projectref-auth-token.0')).toBe(true);
    expect(isSupabaseAuthCookie('supabase-auth-token')).toBe(true);
    expect(isSupabaseAuthCookie('sb-projectref-code-verifier')).toBe(false);
    expect(isSupabaseAuthCookie('next-auth.session-token')).toBe(false);
  });

  it('requires user verification only for protected paths with auth cookies', () => {
    const cookies = [{ name: 'sb-projectref-auth-token' }];

    expect(shouldVerifySupabaseUser('/perfil', cookies)).toBe(true);
    expect(shouldVerifySupabaseUser('/dashboard/settings', cookies)).toBe(true);
    expect(shouldVerifySupabaseUser('/empresa/procesos', cookies)).toBe(true);

    expect(shouldVerifySupabaseUser('/perfil', [])).toBe(false);
    expect(shouldVerifySupabaseUser('/login', cookies)).toBe(false);
    expect(shouldVerifySupabaseUser('/register', cookies)).toBe(false);
    expect(shouldVerifySupabaseUser('/empresa/registro', cookies)).toBe(false);
  });

  it('keeps auth routes out of server-side Supabase refresh checks', () => {
    expect(isAuthPath('/login')).toBe(true);
    expect(isAuthPath('/register')).toBe(true);
    expect(isAuthPath('/login/help')).toBe(false);
  });

  it('keeps only private areas protected', () => {
    expect(isProtectedPath('/perfil')).toBe(true);
    expect(isProtectedPath('/dashboard')).toBe(true);
    expect(isProtectedPath('/empresa')).toBe(true);
    expect(isProtectedPath('/empresa/registro')).toBe(false);
    expect(isProtectedPath('/ranking')).toBe(false);
  });

  it('does not treat unrelated cookies as an authenticated Supabase session', () => {
    expect(
      hasSupabaseAuthCookie([
        { name: 'theme' },
        { name: 'next-auth.csrf-token' },
      ])
    ).toBe(false);
  });
});
