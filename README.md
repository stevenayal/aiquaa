# AIQUAA Blog

Un blog moderno enfocado en QA y tecnología, construido con React, TypeScript, TailwindCSS y React Router.

## 🚀 Características

- **React 18** con TypeScript
- **TailwindCSS** para estilos modernos y responsive
- **React Router** para navegación SPA
- **Vite** como bundler rápido
- **Diseño responsive** para móviles y desktop
- **Búsqueda y filtrado** de artículos
- **5 artículos de ejemplo** sobre QA y tecnología
- **Formulario de contacto** funcional
- **Configuración lista para deployment** (Vercel, Netlify, GitHub Pages)

## 📋 Requisitos

- **Node.js**: v16.18.0 o superior (probado con v16.18.0)
- **npm**: v8.19.2 o superior

## 🛠️ Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <tu-repositorio>
   cd aiquaa-blog
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
aiquaa-blog/
├── src/
│   ├── components/     # Componentes reutilizables
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── pages/         # Páginas de la aplicación
│   │   ├── Home.tsx
│   │   ├── Blog.tsx
│   │   ├── Article.tsx
│   │   ├── About.tsx
│   │   └── Contact.tsx
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

## 🎯 Próximos Pasos

- [ ] Integración con base de datos
- [ ] Sistema de autenticación
- [ ] Panel de administración
- [ ] CMS para gestión de contenido
- [ ] Comentarios en artículos
- [ ] Newsletter

## 📝 Licencia

MIT License - ver archivo LICENSE para detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**AIQUAA Blog** - Tu fuente de conocimiento en QA y tecnología 🚀
