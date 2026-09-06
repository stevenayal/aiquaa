import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Destino del usuario recien confirmado.
 *
 * Antes caia en /ranking?welcome=1: una tabla de posiciones donde todavia tiene
 * 0 XP y no aparece por ningun lado, con un cartel de bienvenida que se va solo
 * a los 6 segundos. Nada que hacer ahi (Paradoja del Usuario Activo).
 *
 * /dashboard si tiene estados vacios accionables: "Completá tu primer simulador
 * para empezar a ganar XP", un examen recomendado con su enlace y accesos a
 * /labs. El ranking sigue a un click desde ahi.
 */
function getDefaultRedirect(audience?: string | null): string {
  if (audience === 'empresa') return '/empresa';
  return '/dashboard';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next');
  const errorParam = searchParams.get('error');

  if (errorParam) {
    const resultUrl = new URL(`${origin}/auth/confirm-result`);
    resultUrl.searchParams.set('error', errorParam);
    if (next) resultUrl.searchParams.set('next', next);
    return NextResponse.redirect(resultUrl.toString());
  }

  const supabase = await createClient();

  let failureCode = 'link_expired';

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const audience = data.user?.user_metadata?.audience;
      const destination = next ?? getDefaultRedirect(audience);

      if (next?.includes('reset-password')) {
        return NextResponse.redirect(`${origin}${destination}`);
      }

      const successUrl = new URL(`${origin}/auth/confirm-result`);
      successUrl.searchParams.set('success', 'true');
      successUrl.searchParams.set('next', destination);
      return NextResponse.redirect(successUrl.toString());
    }
    console.error(
      '[auth/confirm] exchangeCodeForSession failed:',
      error?.message
    );
    const msg = error?.message?.toLowerCase() ?? '';
    if (msg.includes('code verifier') || msg.includes('pkce')) {
      failureCode = 'pkce_error';
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email',
    });
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const audience = user?.user_metadata?.audience;
      const destination = next ?? getDefaultRedirect(audience);

      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}${destination}`);
      }

      const successUrl = new URL(`${origin}/auth/confirm-result`);
      successUrl.searchParams.set('success', 'true');
      successUrl.searchParams.set('next', destination);
      return NextResponse.redirect(successUrl.toString());
    }
    console.error('[auth/confirm] verifyOtp failed:', error?.message);
  }

  if (!code && !token_hash) {
    console.error(
      '[auth/confirm] no code or token_hash in request. params:',
      Object.fromEntries(searchParams)
    );
  }

  const fallbackUrl = new URL(`${origin}/auth/confirm-result`);
  fallbackUrl.searchParams.set('error', failureCode);
  if (next) fallbackUrl.searchParams.set('next', next);
  return NextResponse.redirect(fallbackUrl.toString());
}
