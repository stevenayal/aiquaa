import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/perfil', '/empresa'];
const AUTH_ROUTES = ['/login', '/register'];
const PUBLIC_PATHS = ['/empresa/registro'];

export async function middleware(request: NextRequest) {
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

  // Verify session only for matched routes — avoids Supabase rate limiting from
  // calling getUser() on every single request across the entire site.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  const isProtected =
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) &&
    !PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    // Only store relative paths — prevents open redirect (e.g. ?redirectedFrom=//evil.com)
    if (pathname.startsWith('/') && !pathname.startsWith('//')) {
      loginUrl.searchParams.set('redirectedFrom', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/ranking', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/perfil/:path*',
    '/empresa',
    '/empresa/:path*',
    '/login',
    '/register',
  ],
};
