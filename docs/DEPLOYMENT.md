# Guía de Despliegue - AIQUAA Blog

Esta guía te ayudará a desplegar el blog AIQUAA en diferentes plataformas.

## 🚀 Despliegue en Vercel (Recomendado)

### Opción 1: Despliegue Automático desde GitHub

1. **Preparar el repositorio**
   ```bash
   git add .
   git commit -m "Initial commit: AIQUAA Blog"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/aiquaa-blog.git
   git push -u origin main
   ```

2. **Conectar con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub
   - Haz clic en "New Project"
   - Importa tu repositorio `aiquaa-blog`
   - Vercel detectará automáticamente que es un proyecto Vite

3. **Configuración del proyecto**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Variables de entorno (opcional)**
   ```
   VITE_APP_TITLE=AIQUAA Blog
   VITE_APP_DESCRIPTION=Blog sobre testing de software y QA
   ```

5. **Desplegar**
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará tu aplicación automáticamente

### Opción 2: Despliegue Manual con Vercel CLI

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Construir el proyecto**
   ```bash
   npm run build
   ```

3. **Desplegar**
   ```bash
   vercel
   ```

## 🌐 Despliegue en Netlify

### Opción 1: Desde GitHub

1. **Subir código a GitHub** (ver pasos anteriores)

2. **Conectar con Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Inicia sesión con tu cuenta de GitHub
   - Haz clic en "New site from Git"
   - Selecciona tu repositorio

3. **Configuración**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (dejar vacío)

4. **Desplegar**
   - Haz clic en "Deploy site"

### Opción 2: Arrastrar y Soltar

1. **Construir el proyecto**
   ```bash
   npm run build
   ```

2. **Subir a Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Arrastra la carpeta `dist` al área de deploy

## 📦 Despliegue en GitHub Pages

### Opción 1: GitHub Actions (Recomendado)

1. **Crear workflow de GitHub Actions**
   Crea el archivo `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3

         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'

         - name: Install dependencies
           run: npm install

         - name: Build
           run: npm run build

         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Configurar GitHub Pages**
   - Ve a Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

### Opción 2: Manual

1. **Construir el proyecto**
   ```bash
   npm run build
   ```

2. **Crear rama gh-pages**
   ```bash
   git checkout -b gh-pages
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. **Configurar GitHub Pages** (ver pasos anteriores)

## 🔧 Configuración de Dominio Personalizado

### Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Settings > Domains
3. Agrega tu dominio personalizado
4. Configura los registros DNS según las instrucciones

### Netlify

1. Ve a tu sitio en Netlify Dashboard
2. Domain management > Add custom domain
3. Sigue las instrucciones para configurar DNS

### GitHub Pages

1. Ve a Settings > Pages
2. Custom domain
3. Agrega tu dominio
4. Configura los registros DNS

## 🔍 Verificación del Despliegue

Después del despliegue, verifica que:

1. **La aplicación carga correctamente**
2. **La navegación funciona**
3. **Los artículos se muestran**
4. **El modo oscuro funciona**
5. **La búsqueda y filtros funcionan**

## 🐛 Solución de Problemas

### Error: Build Failed

- Verifica que todas las dependencias estén instaladas
- Revisa los logs de build para errores específicos
- Asegúrate de que el Node.js version sea compatible

### Error: 404 en Rutas

Para SPA (Single Page Applications), configura redirects:

**Vercel** - Crea `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify** - Crea `_redirects`:
```
/*    /index.html   200
```

**GitHub Pages** - No es necesario, se maneja automáticamente

### Error: Imágenes no cargan

- Verifica que las URLs de las imágenes sean correctas
- Asegúrate de que las imágenes estén disponibles públicamente
- Considera usar un CDN para las imágenes

## 📈 Optimización de Performance

### Antes del Despliegue

1. **Optimizar imágenes**
   ```bash
   npm install -g imagemin-cli
   imagemin src/images/* --out-dir=dist/images
   ```

2. **Minificar CSS y JS**
   - Vite lo hace automáticamente en producción

3. **Configurar cache**
   - Vercel y Netlify configuran cache automáticamente

### Monitoreo

- **Vercel Analytics**: Integrado automáticamente
- **Google Analytics**: Agregar script en `index.html`
- **Lighthouse**: Ejecutar auditorías periódicas

## 🔄 Actualizaciones

Para actualizar el sitio:

1. **Hacer cambios en el código**
2. **Commit y push a GitHub**
3. **El despliegue automático se ejecutará**

```bash
git add .
git commit -m "Update: descripción de cambios"
git push origin main
```

## 📞 Soporte

Si tienes problemas con el despliegue:

- **Vercel**: [docs.vercel.com](https://docs.vercel.com)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **GitHub Pages**: [docs.github.com/pages](https://docs.github.com/pages)

---

¡Tu blog AIQUAA está listo para ser desplegado! 🎉 