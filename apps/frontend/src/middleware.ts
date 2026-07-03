import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/perfil', '/dashboard', '/empresa', '/talento'];
const AUTH_ROUTES = ['/login', '/register'];
const PUBLIC_PATHS = ['/empresa/registro'];
const SUPABASE_AUTH_COOKIE_PATTERN = /^sb-.+-auth-token(?:\.\d+)?$/;

type CookieLike = {
  name: string;
};

export function isSupabaseAuthCookie(name: string) {
  return (
    name === 'supabase-auth-token' || SUPABASE_AUTH_COOKIE_PATTERN.test(name)
  );
}

export function hasSupabaseAuthCookie(cookies: CookieLike[]) {
  return cookies.some((cookie) => isSupabaseAuthCookie(cookie.name));
}

export function isProtectedPath(pathname: string) {
  return (
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) &&
    !PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  );
}

export function isAuthPath(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route);
}

export function shouldVerifySupabaseUser(
  pathname: string,
  cookies: CookieLike[]
) {
  return isProtectedPath(pathname) && hasSupabaseAuthCookie(cookies);
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  const { pathname } = request.nextUrl;

  loginUrl.pathname = '/login';
  if (pathname.startsWith('/') && !pathname.startsWith('//')) {
    loginUrl.searchParams.set('redirectedFrom', pathname);
  }

  return NextResponse.redirect(loginUrl);
}

function clearSupabaseAuthCookies(
  request: NextRequest,
  response: NextResponse
) {
  request.cookies
    .getAll()
    .filter((cookie) => isSupabaseAuthCookie(cookie.name))
    .forEach((cookie) => {
      response.cookies.set(cookie.name, '', {
        expires: new Date(0),
        maxAge: 0,
        path: '/',
      });
    });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestCookies = request.cookies.getAll();

  if (isAuthPath(pathname)) {
    return NextResponse.next({ request });
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next({ request });
  }

  if (!shouldVerifySupabaseUser(pathname, requestCookies)) {
    return redirectToLogin(request);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.warn('[auth middleware] Supabase user lookup failed', {
      code: error.code,
      message: error.message,
      pathname,
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
    });

    const response = redirectToLogin(request);
    clearSupabaseAuthCookies(request, response);
    return response;
  }

  if (!user) {
    return redirectToLogin(request);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/perfil/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/empresa',
    '/empresa/:path*',
    '/talento/:path*',
    '/login',
    '/register',
  ],
};
