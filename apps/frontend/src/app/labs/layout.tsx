import type { Metadata } from 'next';

/**
 * Layout y metadatos específicos para AIQUAA Labs
 *
 * Este layout:
 * - Define metadatos específicos para la sección Labs
 * - Genera una imagen OG personalizada con parámetros de Labs
 * - Sobrescribe los metadatos del layout raíz para esta ruta
 *
 * Extensibilidad futura:
 * - Crear metadatos específicos por herramienta individual en /labs/[slug]/page.tsx
 * - Agregar generateMetadata() dinámico basado en el slug de la herramienta
 * - Ejemplo: /labs/allpairs tendría su propia imagen OG con title="All Pairs Generator"
 */
export const metadata: Metadata = {
  title: 'AIQUAA Labs - Herramientas de Testing Gratuitas',
  description:
    'Herramientas gratuitas para testers: Generador All Pairs, Validadores, Simuladores ISTQB y JMeter. Todo en español y open source.',
  keywords: [
    'AIQUAA Labs',
    'herramientas QA',
    'all pairs',
    'pairwise testing',
    'ISTQB simulator',
    'JMeter',
    'testing tools',
    'Paraguay',
  ],
  openGraph: {
    title: 'AIQUAA Labs - Herramientas de Testing Gratuitas',
    description: 'Herramientas gratuitas para testers funcionales, automatizadores y QA manual.',
    images: [
      {
        url: '/api/og?title=AIQUAA%20Labs&subtitle=Herramientas%20de%20testing%20gratuitas%20en%20español&section=Labs',
        width: 1200,
        height: 630,
        alt: 'AIQUAA Labs - Herramientas QA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIQUAA Labs - Herramientas de Testing',
    description: 'Herramientas gratuitas para testers en español',
    images: ['/api/og?title=AIQUAA%20Labs&subtitle=Herramientas%20de%20testing&section=Labs'],
  },
};

export default function LabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
