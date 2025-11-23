# Suru - Guía de Implementación

## 📦 Estructura de Archivos

```
apps/frontend/src/
├── components/
│   └── Suru/
│       ├── SuruMascot.tsx          # Componente principal de la mascota
│       ├── SuruOnboarding.tsx      # Sistema de onboarding interactivo
│       ├── SuruFloating.tsx        # Mascota flotante en el sitio
│       └── index.ts                # Exportaciones
│
├── styles/
│   └── suru-animations.css         # Animaciones CSS para Suru
│
└── contexts/
    └── LanguageContext.tsx         # Traducciones de Suru (ES/EN)

public/images/suru/
├── static/
│   ├── suru-welcome.svg           # ✅ Creado
│   ├── suru-logo.svg              # ✅ Creado
│   ├── suru-avatar.svg            # ⏳ Pendiente (diseñador)
│   ├── suru-chibi.svg             # ⏳ Pendiente
│   ├── suru-explaining.svg        # ⏳ Pendiente
│   ├── suru-checklist.svg         # ⏳ Pendiente
│   ├── suru-teacher.svg           # ⏳ Pendiente
│   ├── suru-automator.svg         # ⏳ Pendiente
│   ├── suru-explorer.svg          # ⏳ Pendiente
│   ├── suru-performance.svg       # ⏳ Pendiente
│   ├── suru-loading.svg           # ⏳ Pendiente
│   ├── suru-success.svg           # ⏳ Pendiente
│   ├── suru-404.svg               # ⏳ Pendiente
│   ├── suru-error.svg             # ⏳ Pendiente
│   └── suru-thinking.svg          # ⏳ Pendiente
│
└── animated/ (Lottie JSON - opcional)
    ├── suru-swimming.json
    ├── suru-loading.json
    └── suru-celebrating.json
```

## 🚀 Uso Básico

### 1. Importar el Componente

```tsx
import { SuruMascot } from '@/components/Suru';

export default function MyPage() {
  return (
    <div>
      <SuruMascot
        pose="welcome"
        size="medium"
        animated
      />
    </div>
  );
}
```

### 2. Poses Disponibles

```typescript
type SuruPose =
  | 'welcome'      // Bienvenida con aleta levantada
  | 'logo'         // Versión simplificada para logos
  | 'avatar'       // Versión para avatares circulares
  | 'chibi'        // Versión super deformada (stickers)
  | 'explaining'   // Explicando con pizarra/burbujas
  | 'checklist'    // Sosteniendo una lista de tareas
  | 'teacher'      // Modo profesor con lentes
  | 'automator'    // Modo tech con engranajes
  | 'explorer'     // Con lupa (pruebas exploratorias)
  | 'performance'  // Con cronómetro y gráficos
  | 'loading'      // Nadando en círculo
  | 'success'      // Celebrando logro
  | '404'          // Perdido con mapa
  | 'error'        // Confundido tratando de arreglar
  | 'thinking';    // Pensando con nube de pensamiento
```

### 3. Tamaños Disponibles

```typescript
type SuruSize =
  | 'mini'    // 64×64px  - Notificaciones, favicon
  | 'small'   // 128×128px - Cards pequeñas
  | 'medium'  // 256×256px - Secciones normales
  | 'large'   // 512×512px - Hero sections
  | 'hero';   // 1024×1024px - Homepage principal
```

## 💬 Ejemplos de Uso

### Ejemplo 1: Bienvenida en Homepage

```tsx
'use client';

import { SuruMascot } from '@/components/Suru';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <section className="py-12">
      <div className="flex items-center justify-center gap-8">
        <SuruMascot
          pose="welcome"
          size="large"
          animated
          message={t('suru.welcome')}
        />
        <div>
          <h1>Bienvenido a AIQUAA</h1>
          <p>Tu plataforma de QA en Paraguay</p>
        </div>
      </div>
    </section>
  );
}
```

### Ejemplo 2: Onboarding Interactivo

```tsx
'use client';

import { SuruOnboarding } from '@/components/Suru';
import { useState } from 'react';

export default function Layout({ children }) {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <>
      {showOnboarding && (
        <SuruOnboarding
          onComplete={() => setShowOnboarding(false)}
          autoStart={true}
        />
      )}
      {children}
    </>
  );
}
```

### Ejemplo 3: Mascota Flotante

```tsx
'use client';

import { SuruFloating } from '@/components/Suru';

export default function RootLayout({ children }) {
  return (
    <>
      {children}

      {/* Suru flotante solo en home, labs y about */}
      <SuruFloating
        position="bottom-right"
        showOnPages={['/', '/labs', '/about']}
        hideOnPages={['/dashboard', '/admin']}
        pose="welcome"
      />
    </>
  );
}
```

### Ejemplo 4: Página 404 con Suru

```tsx
'use client';

import { SuruMascot } from '@/components/Suru';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <SuruMascot
        pose="404"
        size="large"
        animated
        message={t('suru.error.404')}
      />

      <h1 className="text-4xl font-bold mt-8 mb-4">
        Página no encontrada
      </h1>

      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
```

### Ejemplo 5: Estado de Carga

```tsx
'use client';

import { SuruMascot } from '@/components/Suru';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoadingState() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <SuruMascot
        pose="loading"
        size="medium"
        animated
        message={t('suru.loading')}
      />
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        Cargando datos...
      </p>
    </div>
  );
}
```

### Ejemplo 6: Examen Completado

```tsx
'use client';

import { SuruMascot } from '@/components/Suru';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExamResultProps {
  passed: boolean;
  score: number;
}

export default function ExamResult({ passed, score }: ExamResultProps) {
  const { t } = useLanguage();

  return (
    <div className="text-center">
      <SuruMascot
        pose={passed ? "success" : "error"}
        size="large"
        animated
        message={passed ? t('suru.success') : t('suru.error.500')}
      />

      <h2 className="text-2xl font-bold mt-6">
        {passed ? '¡Aprobado!' : 'Sigue practicando'}
      </h2>

      <p className="text-xl mt-2">
        Puntaje: {score}%
      </p>
    </div>
  );
}
```

### Ejemplo 7: Herramienta Labs con Suru Explicando

```tsx
'use client';

import { SuruMascot } from '@/components/Suru';

export default function AllPairsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Explicación con Suru */}
        <div className="flex items-center justify-center">
          <SuruMascot
            pose="explaining"
            size="large"
            animated
            message="All Pairs testing reduce combinaciones de prueba manteniendo alta cobertura"
          />
        </div>

        {/* Contenido de la herramienta */}
        <div>
          <h1 className="text-3xl font-bold mb-4">
            Generador All Pairs
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Optimiza tus casos de prueba combinatorios...
          </p>
        </div>
      </div>

      {/* Resto de la herramienta */}
    </div>
  );
}
```

## 🎨 Importar Estilos de Animación

En tu archivo `app/globals.css` o layout principal:

```css
@import '../styles/suru-animations.css';
```

O en tu componente de layout:

```tsx
import '@/styles/suru-animations.css';
```

## 🌐 Traducciones

Todas las traducciones de Suru están en `LanguageContext.tsx`:

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

const { t } = useLanguage();

// Usar traducciones
t('suru.welcome')               // "¡Hola! Soy Suru, tu guía en AIQUAA"
t('suru.onboarding.welcome')    // Mensaje de onboarding
t('suru.tooltip.labs')          // Tooltip para labs
t('suru.error.404')             // Mensaje de error 404
t('suru.loading')               // "Nadando por los datos..."
t('suru.success')               // "¡Excelente trabajo! Test aprobado"
```

## 🎭 Props del Componente SuruMascot

```typescript
interface SuruMascotProps {
  pose?: SuruPose;              // Pose de Suru (default: 'welcome')
  size?: SuruSize;              // Tamaño (default: 'medium')
  animated?: boolean;           // Animaciones activadas (default: false)
  className?: string;           // Clases CSS adicionales
  message?: string;             // Mensaje en burbuja de diálogo
  onInteraction?: () => void;   // Callback al hacer click
  autoAnimate?: boolean;        // Auto-mostrar mensaje (default: true)
}
```

## 🎬 Animaciones CSS Disponibles

```tsx
// Clases de animación que puedes usar:
<div className="animate-fade-in-up">    // Aparece desde abajo
<div className="animate-float">         // Flotación suave
<div className="animate-swim">          // Movimiento de nado
<div className="animate-bubble-rise">   // Burbujas subiendo
<div className="animate-pulse-glow">    // Resplandor pulsante
<div className="animate-wiggle">        // Menear/sacudir
<div className="suru-hover-lift">       // Efecto hover con elevación
```

## 📱 Responsividad

Los componentes de Suru son totalmente responsivos:

```tsx
<SuruMascot
  size="hero"    // Desktop: 1024px
  className="md:w-[512px] sm:w-[256px] w-[128px]"
/>
```

## ♿ Accesibilidad

Todos los componentes incluyen:
- ✅ `aria-label` descriptivos
- ✅ Soporte para `prefers-reduced-motion`
- ✅ Contraste de color accesible
- ✅ Keyboard navigation

## 🎯 Casos de Uso Recomendados

### Homepage
```tsx
<SuruMascot pose="welcome" size="hero" animated message={t('suru.welcome')} />
```

### Labs Section
```tsx
<SuruMascot pose="explaining" size="large" animated />
```

### ISTQB Simulator
```tsx
<SuruMascot pose="teacher" size="medium" animated />
```

### Test App (Bug Hunting)
```tsx
<SuruMascot pose="explorer" size="medium" animated />
```

### Loading States
```tsx
<SuruMascot pose="loading" size="small" animated message={t('suru.loading')} />
```

### Success States
```tsx
<SuruMascot pose="success" size="medium" animated message={t('suru.success')} />
```

### Error Pages
```tsx
<SuruMascot pose="error" size="large" animated message={t('suru.error.500')} />
```

### 404 Pages
```tsx
<SuruMascot pose="404" size="large" animated message={t('suru.error.404')} />
```

## 🔧 Personalización Avanzada

### Cambiar colores de Suru dinámicamente

```tsx
<div style={{
  '--suru-primary': '#8B5CF6',  // Púrpura custom
  '--suru-accent': '#EC4899',   // Rosa custom
} as React.CSSProperties}>
  <SuruMascot pose="welcome" size="medium" />
</div>
```

### Trigger animaciones programáticamente

```tsx
const handleSuccess = () => {
  // Mostrar Suru celebrando
  setSuruPose('success');

  // Después de 3 segundos, volver a normal
  setTimeout(() => setSuruPose('welcome'), 3000);
};
```

## 🧪 Testing

```tsx
import { render, screen } from '@testing-library/react';
import { SuruMascot } from '@/components/Suru';

describe('SuruMascot', () => {
  it('renders with welcome pose', () => {
    render(<SuruMascot pose="welcome" />);
    const img = screen.getByAltText('Suru - welcome');
    expect(img).toBeInTheDocument();
  });

  it('shows message bubble when provided', () => {
    render(<SuruMascot message="Hello!" />);
    expect(screen.getByText('Hello!')).toBeInTheDocument();
  });
});
```

## 📊 Performance

- ✅ SVG vectorial - escalable sin pérdida de calidad
- ✅ Lazy loading con Next.js Image
- ✅ Animaciones CSS (no JavaScript)
- ✅ Optimizado para 60fps
- ✅ Archivos < 50KB cada SVG

## 🚧 Próximos Pasos (Pendientes)

1. **Diseño profesional**: Contratar diseñador para crear las 15 poses faltantes
2. **Animaciones Lottie**: Convertir SVGs a animaciones Lottie JSON
3. **Stickers**: Exportar versiones para Discord, Telegram, WhatsApp
4. **3D (opcional)**: Versión 3D con Three.js/React Three Fiber
5. **Voice lines (opcional)**: Audio de Suru hablando

## 📚 Recursos Adicionales

- [Especificación de Diseño Completa](./SURU_DESIGN_SPEC.md)
- [Lottie Files](https://lottiefiles.com/) - Para animaciones
- [Rive](https://rive.app/) - Animaciones interactivas avanzadas
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Optimizar SVGs

---

**Última actualización**: 2025-11-22
**Versión**: 1.0
**Estado**: ✅ Base implementada | ⏳ Diseños profesionales pendientes
