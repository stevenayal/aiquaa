/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aiquaa/allpairs-core'],
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.vercel.app' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  // Configuración de variables de entorno con valores por defecto
  env: {
    // En producción estas deben estar configuradas en Vercel
    // En desarrollo usa localhost
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'),
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
  },
  // Configuración para evitar errores durante el build estático
  typescript: {
    // Ignorar errores de TypeScript durante el build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignorar errores de ESLint durante el build
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
