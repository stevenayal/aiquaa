# Bug Report Widget - GitHub Integration Setup

Esta guía explica cómo configurar la integración de GitHub para el Bug Report Widget.

## 🔑 Crear GitHub Personal Access Token

### Paso 1: Ir a GitHub Settings

1. Ve a https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**

### Paso 2: Configurar el Token

Completa los siguientes campos:

- **Note**: `AIQUAA Bug Report Widget`
- **Expiration**: Selecciona una duración apropiada (recomendado: 90 días o sin expiración para producción)

### Paso 3: Seleccionar Permisos (Scopes)

Marca **SOLO** el scope `repo`:

```
✅ repo
   ✅ repo:status
   ✅ repo_deployment
   ✅ public_repo
   ✅ repo:invite
   ✅ security_events
```

**Importante:** El scope `repo` da acceso completo a repositorios privados y públicos. Si solo usas repositorios públicos, puedes usar únicamente `public_repo`.

### Paso 4: Generar Token

1. Scroll hasta el final y click en **"Generate token"**
2. **IMPORTANTE:** Copia el token inmediatamente. GitHub solo lo mostrará una vez.
3. El token se verá así: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🔧 Configuración Local

### Archivo .env.local

Crea o edita el archivo `apps/frontend/.env.local`:

```bash
# Bug Report Widget - GitHub Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=stevenayal/aiquaa
```

**Notas:**
- `GITHUB_TOKEN`: El token que acabas de crear
- `GITHUB_REPO`: En formato `owner/repository`
- **NUNCA** commitees este archivo a Git (ya está en .gitignore)

## ☁️ Configuración en Vercel

### Método 1: Vercel Dashboard (Recomendado)

1. Ve a tu proyecto en Vercel: https://vercel.com/[tu-usuario]/aiquaa
2. Ve a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

| Name | Value | Environment |
|------|-------|-------------|
| `GITHUB_TOKEN` | `ghp_xxxxx...` | Production, Preview, Development |
| `GITHUB_REPO` | `stevenayal/aiquaa` | Production, Preview, Development |

4. Click **"Save"**
5. **Redeploy** tu aplicación para que tome las nuevas variables

### Método 2: Vercel CLI

```bash
cd apps/frontend

# Agregar variables para producción
vercel env add GITHUB_TOKEN production
# Pega tu token cuando te lo pida

vercel env add GITHUB_REPO production
# Ingresa: stevenayal/aiquaa

# Opcional: agregar para preview y development
vercel env add GITHUB_TOKEN preview
vercel env add GITHUB_TOKEN development
```

## 🧪 Probar la Integración

### Prueba Local

1. Asegúrate de tener las variables en `.env.local`
2. Reinicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
3. Ve a http://localhost:3001/labs
4. Click en el botón de "Report bug" (esquina inferior derecha)
5. Completa el formulario y envía
6. Revisa tu repositorio de GitHub para el nuevo issue

### Verificar el Issue Creado

El issue debería:
- ✅ Tener el título con prefijo `[Bug]`
- ✅ Contener toda la información del formulario
- ✅ Tener labels automáticos: `bug`, `priority: *`, `impact: *`
- ✅ Si hay adjuntos, tener comentarios con las imágenes/archivos

## 🔒 Seguridad

### ⚠️ Protección del Token

- **NUNCA** expongas el token en el código frontend
- **NUNCA** commitees el token a Git
- **NUNCA** compartas el token públicamente
- **Usa variables de entorno** siempre

### ✅ Buenas Prácticas

1. **Rotación de tokens**: Renueva el token cada 90 días
2. **Principio de mínimo privilegio**: Usa solo el scope `public_repo` si es posible
3. **Monitoring**: Revisa el uso del token en GitHub Settings → Applications
4. **Revocación**: Si sospechas que el token fue comprometido, revócalo inmediatamente

### 🚨 Si el Token se Compromete

1. Ve a https://github.com/settings/tokens
2. Click en el token comprometido
3. Click **"Delete"** o **"Regenerate token"**
4. Genera un nuevo token siguiendo los pasos arriba
5. Actualiza las variables de entorno en Vercel y localmente

## 🛠️ Troubleshooting

### Error: "GITHUB_TOKEN environment variable is not set"

**Solución:**
1. Verifica que `.env.local` existe en `apps/frontend/`
2. Verifica que `GITHUB_TOKEN` está definido en el archivo
3. Reinicia el servidor de desarrollo

### Error: "Invalid GITHUB_REPO format"

**Solución:**
- El formato debe ser `owner/repository`
- Ejemplo correcto: `stevenayal/aiquaa`
- Ejemplo incorrecto: `aiquaa`, `github.com/stevenayal/aiquaa`

### Error: "Bad credentials" o "401 Unauthorized"

**Solución:**
1. Verifica que el token es correcto (empieza con `ghp_`)
2. Verifica que el token no ha expirado
3. Verifica que el token tiene el scope `repo` o `public_repo`
4. Regenera el token si es necesario

### Error: "Not Found" o "404"

**Solución:**
- Verifica que el repositorio existe
- Verifica que el nombre del repositorio es correcto
- Verifica que el token tiene acceso al repositorio

### Issues no se crean

**Solución:**
1. Revisa los logs del servidor: `pnpm dev` (output en consola)
2. Revisa las DevTools del navegador (pestaña Network)
3. Verifica que el token tiene permisos de escritura en el repo
4. Intenta crear un issue manualmente en GitHub para verificar que no hay restricciones

## 📚 Referencias

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub API - Issues](https://docs.github.com/en/rest/issues/issues)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Octokit REST API](https://octokit.github.io/rest.js/)

## 💡 Tips

- **Para desarrollo**: Usa un repositorio de prueba separado
- **Para producción**: Asegúrate de que el token esté en Vercel
- **Logs**: Los errores se loguean en la consola del servidor y en Vercel Logs
- **Testing**: Prueba primero en local antes de deployar

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o consulta la documentación completa en `/docs/widgets/BUG_REPORT_WIDGET.md`
