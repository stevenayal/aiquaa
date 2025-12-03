# 🚀 Configuración de GitHub y Deploy para AIQUAA Blog

## 📋 Pasos para Publicar el Proyecto

### 1. Crear Repositorio en GitHub

1. **Ve a GitHub.com** y inicia sesión
2. **Haz clic en "New repository"** (botón verde)
3. **Configura el repositorio:**
   - **Repository name**: `aiquaa-blog`
   - **Description**: `Blog sobre testing de software y QA - Comunidad paraguaya`
   - **Visibility**: Public (recomendado)
   - **NO marques** "Add a README file" (ya tenemos uno)
   - **NO marques** "Add .gitignore" (ya tenemos uno)
4. **Haz clic en "Create repository"**

### 2. Conectar Repositorio Local con GitHub

Ejecuta estos comandos en tu terminal (ya estás en el directorio correcto):

```bash
# Conectar con el repositorio remoto (reemplaza TU_USUARIO con tu nombre de usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/aiquaa-blog.git

# Cambiar a la rama main
git branch -M main

# Hacer push inicial
git push -u origin main
```

### 3. Deploy en Vercel (Recomendado)

1. **Ve a [vercel.com](https://vercel.com)**
2. **Inicia sesión con tu cuenta de GitHub**
3. **Haz clic en "New Project"**
4. **Importa el repositorio `aiquaa-blog`**
5. **Configuración automática:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. **Haz clic en "Deploy"**

### 4. Configurar Dominio Personalizado (Opcional)

1. **En Vercel**, ve a tu proyecto
2. **Settings → Domains**
3. **Agrega tu dominio personalizado**
4. **Configura los DNS** según las instrucciones de Vercel

## 🎯 URLs Importantes

- **Repositorio**: `https://github.com/TU_USUARIO/aiquaa-blog`
- **Sitio en Vercel**: `https://aiquaa-blog.vercel.app` (o tu dominio personalizado)
- **Local**: `http://localhost:5173`

## 📝 Comandos Útiles

```bash
# Ver estado de Git
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir cambios a GitHub
git push

# Ver logs de commits
git log --oneline
```

## 🔧 Troubleshooting

### Si hay problemas con el push:
```bash
# Verificar configuración de Git
git config --list

# Verificar remote
git remote -v

# Forzar push (solo si es necesario)
git push -f origin main
```

### Si hay problemas con Vercel:
1. Verifica que el repositorio esté público
2. Asegúrate de que el `package.json` tenga los scripts correctos
3. Revisa los logs de build en Vercel

## 🎉 ¡Listo!

Una vez completados estos pasos, tu blog AIQUAA estará:
- ✅ En GitHub para control de versiones
- ✅ Desplegado en Vercel para acceso público
- ✅ Con dominio personalizado (si lo configuraste)
- ✅ Listo para actualizaciones automáticas

---

**¿Necesitas ayuda con algún paso?** ¡No dudes en preguntar! 