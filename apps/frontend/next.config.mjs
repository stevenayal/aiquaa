/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost', 'vercel.app'],
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
