# Open Graph Images - AIQUAA

Implementación de generación dinámica de imágenes Open Graph usando `@vercel/og` (Satori).

## 📍 Archivos Creados

### 1. Ruta API: `/app/api/og/route.tsx`
- Genera imágenes OG dinámicas de 1200x630px
- Ejecuta en Edge Runtime para máximo rendimiento
- Acepta parámetros query: `title`, `subtitle`, `section`

### 2. Metadatos Actualizados

#### Layout Principal (`/app/layout.tsx`)
- Metadatos generales para la Home y páginas sin layout específico
- Imagen OG: `/api/og?title=AIQUAA&subtitle=...&section=Home`

#### Layout de Labs (`/app/labs/layout.tsx`)
- Metadatos específicos para AIQUAA Labs
- Imagen OG: `/api/og?title=AIQUAA%20Labs&subtitle=...&section=Labs`

## 🚀 Uso Básico

### Llamar a la API directamente

```
/api/og?title=AIQUAA&subtitle=Comunidad%20QA&section=Home
```

### Parámetros disponibles

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `title` | string | "AIQUAA" | Título principal de la imagen |
| `subtitle` | string | "Comunidad y herramientas QA en español" | Subtítulo o descripción |
| `section` | string | "Sitio oficial" | Badge de sección (esquina superior derecha) |

## 🎨 Diseño Actual

- **Fondo**: Gradiente oscuro (Slate 900 → Slate 950)
- **Logo**: Cargado desde `/images/logo1.png`
- **Título**: 80px, bold, blanco
- **Subtítulo**: 32px, Slate 400, max-width 900px
- **Badge de sección**: Indigo 500, esquina superior derecha
- **Footer**: "🇵🇾 aiquaa.com" en la parte inferior

## 🔧 Extender a Otras Páginas

### Opción 1: Crear layout específico para una ruta

Ejemplo para `/recursos`:

```tsx
// apps/frontend/src/app/recursos/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recursos de QA | AIQUAA',
  description: 'Material de estudio ISTQB, JMeter y más',
  openGraph: {
    images: [
      {
        url: '/api/og?title=Recursos%20QA&subtitle=ISTQB%20y%20JMeter&section=Recursos',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RecursosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### Opción 2: Usar generateMetadata() para páginas dinámicas

Ejemplo para `/labs/[slug]/page.tsx`:

```tsx
// apps/frontend/src/app/labs/[slug]/page.tsx
import type { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const toolName = params.slug.replace(/-/g, ' ').toUpperCase();

  return {
    title: `${toolName} | AIQUAA Labs`,
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(toolName)}&subtitle=Herramienta%20gratuita&section=Labs`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default function LabToolPage({ params }: Props) {
  // ...
}
```

## 🏅 Crear API para Badges/Certificados

### 1. Crear nueva ruta API

```tsx
// apps/frontend/src/app/api/badge/route.tsx
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Genera badges/certificados para pruebas técnicas completadas
 *
 * Parámetros:
 * - name: Nombre del usuario
 * - exam: Nombre del examen (ej: "ISTQB CTFL v4.0")
 * - score: Puntaje obtenido (ej: "85%")
 * - date: Fecha de completitud
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name') || 'Usuario';
  const exam = searchParams.get('exam') || 'Prueba Técnica';
  const score = searchParams.get('score') || '100%';
  const date = searchParams.get('date') || new Date().toLocaleDateString('es-PY');

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
          backgroundColor: 'white',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Título del certificado */}
        <div style={{ fontSize: 48, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
          CERTIFICADO DE COMPLETITUD
        </div>

        {/* Nombre del usuario */}
        <div style={{ fontSize: 72, fontWeight: 'bold', color: 'white', marginBottom: 40 }}>
          {name}
        </div>

        {/* Detalles del examen */}
        <div style={{ fontSize: 36, color: 'rgba(255,255,255,0.9)', marginBottom: 20 }}>
          {exam}
        </div>

        {/* Puntaje */}
        <div style={{ fontSize: 64, fontWeight: 'bold', color: '#fbbf24', marginBottom: 20 }}>
          {score}
        </div>

        {/* Fecha */}
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }}>
          {date}
        </div>

        {/* Logo AIQUAA */}
        <div style={{ position: 'absolute', bottom: 40, fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>
          🇵🇾 AIQUAA Labs
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
```

### 2. Uso del Badge

```tsx
// En un componente de React
<img
  src={`/api/badge?name=Juan%20Pérez&exam=ISTQB%20CTFL&score=92%25&date=${new Date().toLocaleDateString('es-PY')}`}
  alt="Certificado ISTQB"
  width={1200}
  height={630}
/>

// Como enlace compartible
const badgeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/badge?name=Juan%20Pérez&exam=ISTQB%20CTFL&score=92%25`;
```

## 📊 Imágenes OG Específicas por Lab

Para crear imágenes OG únicas para cada herramienta en Labs:

```tsx
// apps/frontend/src/app/labs/allpairs/opengraph-image.tsx
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';
export const alt = 'All Pairs Generator - AIQUAA Labs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        // ... diseño personalizado para All Pairs
      }}>
        <h1>All Pairs Generator</h1>
        <p>Pairwise Testing Tool</p>
      </div>
    ),
    { ...size },
  );
}
```

## 🎨 Personalizar Diseño

Para modificar colores, fuentes o layout, edita `/app/api/og/route.tsx`:

```tsx
// Cambiar colores de fondo
backgroundColor: '#1e293b', // Tu color personalizado

// Cambiar tamaño de fuente
fontSize: 100, // Más grande o más pequeño

// Agregar elementos nuevos
<div style={{ position: 'absolute', top: 20, left: 20 }}>
  <span>🏆</span>
</div>
```

## ✅ Testing

### 1. Probar la API directamente

Visita en tu navegador:
```
http://localhost:3001/api/og?title=Test&subtitle=Prueba&section=Testing
```

### 2. Validar metadatos

Usa herramientas como:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### 3. Verificar en producción

```bash
curl -I https://aiquaa.com/api/og?title=AIQUAA
```

Deberías ver `Content-Type: image/png` en la respuesta.

## 🚨 Troubleshooting

### Error: "Failed to load image"

**Problema**: El logo no se carga en Edge Runtime.

**Solución**: Usa URL absoluta para el logo:
```tsx
const logoUrl = `https://aiquaa.com/images/logo1.png`;
```

### Error: "Font not found"

**Problema**: Las fuentes personalizadas no están disponibles en Edge.

**Solución**: Usa fuentes del sistema o carga fuentes via fetch:
```tsx
const fontData = await fetch(
  new URL('./fonts/Inter-Bold.ttf', import.meta.url),
).then((res) => res.arrayBuffer());

return new ImageResponse(
  // ...JSX,
  {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: fontData,
        style: 'normal',
        weight: 700,
      },
    ],
  },
);
```

### Cache Issues

Si los cambios no se reflejan, limpia cache:
```bash
# Development
rm -rf .next/cache

# Production (Vercel)
# Redeploy o usa "Clear Cache" en dashboard
```

## 📚 Referencias

- [@vercel/og Documentation](https://vercel.com/docs/functions/edge-functions/og-image-generation)
- [Satori Playground](https://og-playground.vercel.app/)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

## 🎯 Próximos Pasos

1. ✅ Implementado: Imagen OG genérica
2. ✅ Implementado: Metadatos Home y Labs
3. 🔜 Por hacer: API de badges/certificados
4. 🔜 Por hacer: OG específicos por herramienta individual
5. 🔜 Por hacer: Agregar fuentes personalizadas
6. 🔜 Por hacer: Templates con más variaciones de diseño
