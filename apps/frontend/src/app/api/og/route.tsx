import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

// Configuración para ejecutar en Edge Runtime (más rápido y eficiente)
export const runtime = 'edge';

/**
 * Ruta API para generar imágenes Open Graph dinámicas
 *
 * Uso:
 * - /api/og?title=AIQUAA&subtitle=Comunidad%20QA&section=Home
 *
 * Parámetros query:
 * - title: Título principal de la imagen (default: "AIQUAA")
 * - subtitle: Subtítulo o descripción (default: "Comunidad y herramientas QA en español")
 * - section: Sección del sitio (default: "Sitio oficial")
 *
 * Extensibilidad futura:
 * - Crear /api/badge para certificados/badges de pruebas técnicas
 * - Crear OG específicos por Lab: /labs/[slug]/opengraph-image.tsx
 * - Agregar parámetros para personalizar colores, iconos, etc.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extraer parámetros con valores por defecto
    const title = searchParams.get('title') || 'AIQUAA';
    const subtitle = searchParams.get('subtitle') || 'Comunidad y herramientas QA en español';
    const section = searchParams.get('section') || 'Sitio oficial';

    // Cargar logo desde la URL base del sitio
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiquaa.com';
    const logoUrl = `${baseUrl}/images/logo1.png`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a', // Slate 900 - Branding oscuro de AIQUAA
            backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
          }}
        >
          {/* Logo AIQUAA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="AIQUAA Logo"
              width={120}
              height={120}
              style={{
                borderRadius: '20px',
              }}
            />
          </div>

          {/* Título principal */}
          <div
            style={{
              display: 'flex',
              fontSize: 80,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '20px',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          {/* Subtítulo */}
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              color: '#94a3b8', // Slate 400
              marginBottom: '40px',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>

          {/* Badge de sección */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#6366f1', // Indigo 500
              color: 'white',
              padding: '12px 24px',
              borderRadius: '9999px',
              fontSize: 24,
              fontWeight: '600',
            }}
          >
            {section}
          </div>

          {/* Footer con marca de agua */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 20,
              color: '#64748b', // Slate 500
            }}
          >
            <span style={{ marginRight: '8px' }}>🇵🇾</span>
            <span>aiquaa.com</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('Error generando imagen OG:', error);

    // Retornar una imagen de fallback en caso de error
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            color: 'white',
            fontSize: 40,
          }}
        >
          AIQUAA - Error generando imagen
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }
}
