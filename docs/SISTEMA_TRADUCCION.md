# 🌍 Sistema de Traducción (i18n) - AIQUAA

## Resumen Ejecutivo

Se ha implementado un **sistema completo de internacionalización (i18n)** para AIQUAA que permite cambiar entre **Español (Paraguay)** e **Inglés (EEUU)** de forma dinámica con **banderas SVG** visuales.

---

## ✅ Componentes Creados

### 1. LanguageContext
**Archivo:** `apps/frontend/src/contexts/LanguageContext.tsx`

**Funcionalidades:**
- ✅ Gestión de estado del idioma seleccionado (`es` | `en`)
- ✅ Persistencia en localStorage
- ✅ Detección automática del idioma del navegador
- ✅ Función de traducción `t(key)` para traducir textos
- ✅ Diccionario de traducciones incluido

**Traducciones disponibles:**
```typescript
translations = {
  es: {
    'nav.home': 'Inicio',
    'nav.labs': 'Labs',
    'common.welcome': 'Bienvenido a AIQUAA',
    'common.loading': 'Cargando...',
    // ... más traducciones
  },
  en: {
    'nav.home': 'Home',
    'nav.labs': 'Labs',
    'common.welcome': 'Welcome to AIQUAA',
    'common.loading': 'Loading...',
    // ... más traducciones
  }
}
```

### 2. LanguageSelector Component
**Archivo:** `apps/frontend/src/components/LanguageSelector.tsx`

**Características:**
- 🎨 **Banderas SVG** - Renderizado vectorial de banderas de Paraguay (rojo/blanco/azul con estrella) y EEUU (barras y estrellas)
- 🖥️ Diseño responsive con soporte para dark mode
- ✨ Animaciones suaves de transición
- 🔄 Cambio instantáneo de idioma
- 💾 Guardado automático en localStorage
- ♿ Accesible con aria-labels

**Nota sobre las banderas:**
Las banderas están implementadas como SVG inline para garantizar:
- ✅ Renderizado consistente en todos los navegadores y sistemas operativos
- ✅ Escalado perfecto sin pérdida de calidad
- ✅ No depende de emojis Unicode que pueden verse diferentes según el sistema
- ✅ Control total sobre los colores y diseño

**Diseño visual:**
```
┌───────────────────────────────────┐
│  [🇵🇾 SVG] ES | [🇺🇸 SVG] EN    │
│   [activo]    |   [inactivo]      │
└───────────────────────────────────┘
```

### 3. Integración en Layout
**Archivos modificados:**
- `apps/frontend/src/app/layout.tsx` - Agregado LanguageProvider
- `apps/frontend/src/components/Header.tsx` - Agregado LanguageSelector y traducciones de navegación
- `apps/frontend/src/app/page.tsx` - Página de inicio traducida

**Ubicación:**
- **Desktop:** En el header, entre la navegación y el botón de dark mode
- **Mobile:** Primera opción en el menú hamburguesa

**Páginas ya traducidas:**
- ✅ Header (navegación principal)
- ✅ Página de inicio (hero section, banner, títulos principales)
- 📝 Resto de páginas: Listas para traducir siguiendo el mismo patrón

---

## 🚀 Cómo Usar

### Para Desarrolladores

#### 1. Usar el hook de idioma:
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MiComponente() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>Idioma actual: {language}</p>
      <button onClick={() => setLanguage('en')}>
        Cambiar a inglés
      </button>
    </div>
  );
}
```

#### 2. Agregar nuevas traducciones:

Edita `apps/frontend/src/contexts/LanguageContext.tsx`:

```typescript
const translations: Record<Language, Record<string, string>> = {
  es: {
    // ... traducciones existentes
    'mi.nueva.clave': 'Mi texto en español',
  },
  en: {
    // ... traducciones existentes
    'mi.nueva.clave': 'My text in English',
  },
};
```

#### 3. Usar en componentes:

```typescript
'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function MiPagina() {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t('mi.nueva.clave')}</h1>
    </div>
  );
}
```

### Para Usuarios

1. **Cambiar idioma:**
   - Desktop: Clic en la bandera deseada (🇵🇾 o 🇺🇸) en el header
   - Mobile: Abrir menú hamburguesa y seleccionar bandera

2. **Persistencia:**
   - El idioma seleccionado se guarda automáticamente
   - Se mantiene entre sesiones y recargas de página

3. **Detección automática:**
   - Si es la primera visita, detecta el idioma del navegador
   - Español por defecto para usuarios de Paraguay/LATAM

---

## 📋 Categorías de Traducciones

### Navegación (`nav.*`)
- `nav.home` - Inicio / Home
- `nav.labs` - Labs
- `nav.dashboard` - Dashboard
- `nav.forum` - Foro / Forum
- `nav.courses` - Cursos / Courses
- `nav.profile` - Perfil / Profile
- `nav.login` - Iniciar Sesión / Login
- `nav.logout` - Cerrar Sesión / Logout
- `nav.register` - Registrarse / Register

### Común (`common.*`)
- `common.welcome` - Bienvenido a AIQUAA / Welcome to AIQUAA
- `common.loading` - Cargando... / Loading...
- `common.error` - Error
- `common.success` - Éxito / Success
- `common.save` - Guardar / Save
- `common.cancel` - Cancelar / Cancel
- `common.delete` - Eliminar / Delete
- `common.edit` - Editar / Edit
- `common.search` - Buscar / Search

### Labs (`labs.*`)
- `labs.title` - Laboratorio de Herramientas QA / QA Tools Laboratory
- `labs.subtitle` - Herramientas interactivas... / Interactive tools...
- `labs.allpairs` - Generador All Pairs / All Pairs Generator
- `labs.git` - Examen Técnico GIT / GIT Technical Exam
- `labs.report` - Generador de Informes / Report Generator

### Footer (`footer.*`)
- `footer.rights` - Todos los derechos reservados / All rights reserved
- `footer.about` - Acerca de / About
- `footer.contact` - Contacto / Contact
- `footer.privacy` - Privacidad / Privacy
- `footer.terms` - Términos / Terms

---

## 🎨 Diseño Visual

### Selector de Idioma - Modo Claro
```
┌──────────────────────────────┐
│ [🇵🇾 ES - seleccionado]      │
│  bg: amber-100               │
│  border: amber-500           │
│  text: amber-700             │
│                              │
│ [🇺🇸 EN - no seleccionado]  │
│  bg: gray-100                │
│  text: gray-700              │
└──────────────────────────────┘
```

### Selector de Idioma - Modo Oscuro
```
┌──────────────────────────────┐
│ [🇵🇾 ES - seleccionado]      │
│  bg: amber-900/30            │
│  border: amber-500           │
│  text: amber-400             │
│                              │
│ [🇺🇸 EN - no seleccionado]  │
│  bg: slate-700               │
│  text: slate-300             │
└──────────────────────────────┘
```

---

## 🔧 Tecnologías Utilizadas

- **React Context API** - Gestión de estado global
- **localStorage** - Persistencia del idioma
- **TypeScript** - Type safety completo
- **TailwindCSS** - Estilos responsivos
- **Emojis Unicode** - Banderas (🇵🇾 🇺🇸)

---

## 📁 Estructura de Archivos

```
apps/frontend/src/
├── contexts/
│   └── LanguageContext.tsx      ✅ Contexto de idioma con traducciones
├── components/
│   ├── LanguageSelector.tsx     ✅ Selector de idioma con banderas
│   └── Header.tsx                ✅ Actualizado con LanguageSelector
└── app/
    └── layout.tsx                ✅ Integrado LanguageProvider
```

---

## 🌟 Características Principales

✅ **Cambio instantáneo** - Sin recarga de página
✅ **Persistencia** - Guarda preferencia en localStorage
✅ **Detección automática** - Usa idioma del navegador
✅ **Dark mode support** - Estilos adaptativos
✅ **Responsive** - Funciona en desktop y mobile
✅ **Type-safe** - TypeScript completo
✅ **Extensible** - Fácil agregar más idiomas o traducciones
✅ **Banderas visuales** - 🇵🇾 Paraguay y 🇺🇸 EEUU

---

## 🎯 Próximos Pasos (Opcionales)

### Mejoras Futuras

- [ ] Agregar más idiomas (Portugués 🇧🇷, Francés 🇫🇷, etc.)
- [ ] Sistema de traducción para contenido dinámico
- [ ] Integración con i18next para traducciones más complejas
- [ ] Traducción automática de mensajes de error
- [ ] Exportar/importar traducciones desde archivos JSON
- [ ] Panel de administración para gestionar traducciones
- [ ] Pluralización y formato de números/fechas por idioma
- [ ] Carga lazy de traducciones por ruta

---

## 📞 Uso del Sistema

### Ejemplo Completo

```typescript
'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

export default function MiPagina() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      {/* Selector de idioma */}
      <LanguageSelector />

      {/* Contenido traducido */}
      <h1>{t('common.welcome')}</h1>
      <p>{t('labs.subtitle')}</p>

      {/* Idioma actual */}
      <p>Idioma: {language === 'es' ? 'Español' : 'English'}</p>

      {/* Cambio programático */}
      <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>
        {t('common.language.toggle')}
      </button>
    </div>
  );
}
```

---

## ✨ Ventajas del Sistema

### Para Usuarios
✅ Experiencia personalizada en su idioma
✅ Interfaz intuitiva con banderas
✅ Cambio rápido sin recargar

### Para Desarrolladores
✅ API simple y clara (`t(key)`)
✅ Type-safe con TypeScript
✅ Fácil de extender
✅ Patrón consistente en toda la app

### Para AIQUAA
✅ Alcance internacional
✅ Mejor experiencia de usuario
✅ Código mantenible y escalable
✅ Branding consistente (🇵🇾 Paraguay como base)

---

**¡El sistema de traducción está listo para usar!** 🎉🌍

Los usuarios ahora pueden cambiar entre Español e Inglés con un simple clic en las banderas 🇵🇾 🇺🇸 ubicadas en el header de AIQUAA.
