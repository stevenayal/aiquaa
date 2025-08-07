# AIQUAA Blog

Un blog moderno enfocado en QA y tecnología, construido con React, TypeScript, TailwindCSS y React Router. **Frontend independiente** con funcionalidades completas de blog.

## 🚀 Características

- **React 18** con TypeScript
- **TailwindCSS** para estilos modernos y responsive
- **React Router** para navegación SPA
- **Vite** como bundler rápido
- **Diseño responsive** para móviles y desktop
- **Búsqueda y filtrado** de artículos
- **5 artículos de ejemplo** sobre QA y tecnología
- **Formulario de contacto** funcional
- **Sistema de feedback** integrado
- **Modo oscuro** implementado
- **Sección Labs** con herramientas de desarrollo
- **Configuración lista para deployment** (Vercel, Netlify, GitHub Pages)

## 📋 Requisitos

- **Node.js**: v16.18.0 o superior (probado con v16.18.0)
- **npm**: v8.19.2 o superior

## 🛠️ Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <tu-repositorio>
   cd aiquaa
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   ```
   http://localhost:5173
   ```

## 📁 Estructura del Proyecto

```
aiquaa/
├── src/
│   ├── components/     # Componentes reutilizables
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   ├── FeedbackForm.tsx
│   │   └── Labs/       # Herramientas de desarrollo
│   ├── pages/         # Páginas de la aplicación
│   │   ├── Home.tsx
│   │   ├── Blog.tsx
│   │   ├── Article.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Labs.tsx
│   │   └── Feedback.tsx
│   ├── contexts/      # Contextos de React
│   │   └── ThemeContext.tsx
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Punto de entrada
├── data/
│   └── articles.json  # Datos simulados de artículos
├── public/            # Archivos estáticos
└── package.json       # Dependencias y scripts
```

## 🎨 Páginas Disponibles

- **Home** (`/`): Página principal con artículos destacados
- **Blog** (`/blog`): Lista de todos los artículos con búsqueda
- **Article** (`/article/:slug`): Vista detallada de cada artículo
- **About** (`/about`): Información sobre AIQUAA
- **Contact** (`/contact`): Formulario de contacto
- **Labs** (`/labs`): Herramientas de desarrollo (JWT Decoder, JSON Validator, etc.)
- **Feedback** (`/feedback`): Sistema de feedback y métricas

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build
- `npm run lint` - Ejecutar ESLint

## 🚀 Deployment

El proyecto está configurado para deployment en:

- **Vercel**: Configuración automática con `vercel.json`
- **Netlify**: Configuración con `public/_redirects`
- **GitHub Pages**: Configuración manual

Ver `DEPLOYMENT.md` para instrucciones detalladas.

## 🎯 Funcionalidades Implementadas

### ✅ Completadas
- [x] Blog completo con artículos y búsqueda
- [x] Sistema de feedback con métricas
- [x] Modo oscuro/claro
- [x] Diseño responsive
- [x] Sección Labs con herramientas
- [x] SEO optimizado
- [x] Formularios funcionales
- [x] Navegación completa

### 🔄 Próximos Pasos
- [ ] Integración con CMS headless
- [ ] Sistema de comentarios
- [ ] Newsletter subscription
- [ ] Panel de administración
- [ ] Más herramientas en Labs

## 📝 Licencia

MIT License - ver archivo LICENSE para detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🧹 Limpieza del Repositorio

### Archivos Eliminados (Redundantes)
Se han eliminado los siguientes archivos `.md` que ya no son relevantes después del desacoplamiento del backend:

- `BACKEND_SETUP.md` - Configuración de backend (ya no aplica)
- `BACKEND_VERIFICATION.md` - Verificación de backend (ya no aplica)
- `BACKEND_URL_CONFIGURATION.md` - Configuración de URLs de backend (ya no aplica)
- `SUPABASE_SETUP.md` - Configuración de Supabase (ya no aplica)
- `RESUMEN_VERIFICACION_BACKEND.md` - Resumen de verificación de backend (ya no aplica)
- `VERCEL_DEPLOYMENT.md` - Redundante con DEPLOYMENT.md
- `VERCEL_ENV_SETUP.md` - Redundante con DEPLOYMENT.md
- `PROJECT_SUMMARY.md` - Redundante con README.md
- `SOLUCIONES_IMPLEMENTADAS.md` - Redundante
- `COMUNIDAD_FIX.md` - Fix específico ya no necesario
- `README-TEST-DATA.md` - Datos de prueba de backend (ya no aplica)

### Archivos Mantenidos (Esenciales)
- `README.md` - Documentación principal actualizada
- `DEPLOYMENT.md` - Guía de despliegue consolidada
- `GITHUB_SETUP.md` - Configuración de GitHub
- `FEEDBACK_SYSTEM.md` - Sistema de feedback del frontend
- `SEO_IMPLEMENTATION.md` - SEO del frontend
- `DARK_MODE_IMPLEMENTATION.md` - Implementación del modo oscuro
- `RESPONSIVE_IMPROVEMENTS.md` - Mejoras responsive
- `LABS_IMPLEMENTATION.md` - Implementación de Labs
- `src/components/Labs/README.md` - Documentación específica de Labs

### Estado Actual
✅ **Frontend completamente funcional y estable**
✅ **Todas las rutas activas y funcionando**
✅ **Blog y artículos disponibles**
✅ **Sistema de feedback operativo**
✅ **Labs con herramientas de desarrollo**
✅ **Modo oscuro implementado**
✅ **Diseño responsive optimizado**
✅ **SEO configurado**
✅ **Listo para deployment**

---

**AIQUAA Blog** - Tu fuente de conocimiento en QA y tecnología 🚀
