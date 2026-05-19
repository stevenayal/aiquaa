/** @type {import('next').NextConfig} */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiquaa.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://*.supabase.co';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Security headers applied to every response.
 * CSP uses nonce-based approach (Vercel injects __NEXT_NONCE__) — for now we
 * use a strict-but-compatible policy. Tighten `script-src` further once
 * inline script hashes are audited.
 */
const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Force HTTPS for 1 year, include subdomains
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Control referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Cross-origin isolation (allows SharedArrayBuffer if needed)
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Content-Security-Policy',
    value: [
      // Only load resources from own origin + specific trusted CDNs
      `default-src 'self'`,
      // Scripts: self + Next.js inline (unsafe-inline needed until nonce impl) + Vercel Analytics
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live`,
      // Styles: self + inline (Tailwind) + Google Fonts
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      // Fonts: Google Fonts
      `font-src 'self' https://fonts.gstatic.com`,
      // Images: self + Supabase Storage + GitHub avatars + Google avatars + YouTube thumbnails
      `img-src 'self' data: blob: ${SUPABASE_URL} https://*.supabase.co https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://img.youtube.com https://*.vercel.app`,
      // API connections: Supabase + backend + Vercel
      `connect-src 'self' ${SUPABASE_URL} https://*.supabase.co ${BACKEND_URL} https://vercel.live wss://*.supabase.co`,
      // Frames: only self (no iframes from third parties)
      `frame-src 'self' https://www.youtube.com`,
      // Form submissions only to self
      `form-action 'self'`,
      // No plugins
      `object-src 'none'`,
      // Upgrade insecure requests in production
      process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
    ]
      .filter(Boolean)
      .join('; '),
  },
];

const nextConfig = {
  transpilePackages: ['@aiquaa/allpairs-core'],
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      // Narrow: only the app's own Supabase project (not all *.supabase.co)
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // Configuración de variables de entorno con valores por defecto
  env: {
    // En producción estas deben estar configuradas en Vercel
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'),
    NEXT_PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
