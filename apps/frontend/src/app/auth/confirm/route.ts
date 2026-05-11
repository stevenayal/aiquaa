import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getDefaultRedirect(audience?: string | null): string {
  if (audience === 'empresa') return '/empresa';
  return '/ranking?welcome=1';
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

  const supabase = createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const audience = data.user?.user_metadata?.audience;
      const destination = next ?? getDefaultRedirect(audience);
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email',
    });
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const audience = user?.user_metadata?.audience;
      const destination = next ?? getDefaultRedirect(audience);
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  const fallbackUrl = new URL(`${origin}/auth/confirm-result`);
  fallbackUrl.searchParams.set('error', 'link_expired');
  if (next) fallbackUrl.searchParams.set('next', next);
  return NextResponse.redirect(fallbackUrl.toString());
}
