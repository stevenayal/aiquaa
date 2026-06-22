# Cómo Generar las Variables de Entorno

## 1. NEXTAUTH_SECRET

Esta es una clave secreta aleatoria para encriptar las sesiones de NextAuth.

### Opción A: Usando OpenSSL (Linux/Mac/Git Bash en Windows)

```bash
openssl rand -base64 32
```

**Ejemplo de salida**:

```
8K9xL2mN5pQ7rT3vW6yZ1aC4dF8gH0jK2mN5pQ7rT3vW
```

### Opción B: Usando Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Opción C: Online (si no tienes acceso a terminal)

Ve a: https://generate-secret.vercel.app/32

### Opción D: Manualmente

Genera un string aleatorio de mínimo 32 caracteres. Ejemplo:

```
my-super-secret-key-2024-aiquaa-production-min32chars
```

---

## 2. NEXTAUTH_URL

Esta es la URL de tu aplicación frontend desplegada en Vercel.

### Cómo obtenerla:

1. Ve a tu [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en tu proyecto
3. En la pestaña principal verás el dominio asignado

**Ejemplos**:

```
# Dominio automático de Vercel
https://aiquaa-l6ypbd8fe-stevenayals-projects.vercel.app

# O si tienes dominio personalizado
https://aiquaa.vercel.app
https://app.aiquaa.com
```

**⚠️ IMPORTANTE**:

- Debe comenzar con `https://` (no `http://`)
- No debe terminar con `/`

---

## 3. NEXT_PUBLIC_API_URL y NEXT_PUBLIC_BACKEND_URL

Estas son las URLs de tu backend desplegado en Railway.

### Cómo obtenerla:

1. Ve a tu [Railway Dashboard](https://railway.app/dashboard)
2. Click en tu proyecto backend
3. Click en la pestaña "Settings"
4. Busca la sección "Domains"
5. Verás algo como: `aiquaabackend-production.up.railway.app`

**Valor a usar**:

```
https://aiquaabackend-production.up.railway.app
```

**⚠️ IMPORTANTE**:

- Debe comenzar con `https://` (no `http://`)
- No debe incluir `/api/v1` al final
- No debe terminar con `/`

**Ambas variables deben tener el mismo valor** (están duplicadas por compatibilidad).

---

## 4. Variables de OAuth (Opcionales)

### Google OAuth

Si quieres permitir login con Google:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Ve a "APIs & Services" → "Credentials"
4. Click en "Create Credentials" → "OAuth 2.0 Client ID"
5. Configura:
   - **Application type**: Web application
   - **Name**: Aiquaa Frontend
   - **Authorized JavaScript origins**:
     ```
     https://tu-dominio.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     https://tu-dominio.vercel.app/api/auth/callback/google
     ```
6. Click "Create"
7. Copia el **Client ID** y **Client Secret**

**Variables**:

```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
```

### GitHub OAuth

Si quieres permitir login con GitHub:

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Click en "New OAuth App"
3. Configura:
   - **Application name**: Aiquaa
   - **Homepage URL**: `https://tu-dominio.vercel.app`
   - **Authorization callback URL**: `https://tu-dominio.vercel.app/api/auth/callback/github`
4. Click "Register application"
5. Copia el **Client ID**
6. Click en "Generate a new client secret"
7. Copia el **Client Secret** (solo se muestra una vez)

**Variables**:

```env
GITHUB_CLIENT_ID=<YOUR_GITHUB_CLIENT_ID>
GITHUB_CLIENT_SECRET=abc123def456ghi789jkl012mno345pqr678
```

---

## Resumen de Valores a Configurar

```env
# Seguridad NextAuth
NEXTAUTH_SECRET=<genera con: openssl rand -base64 32>
NEXTAUTH_URL=<tu-url-de-vercel>

# Backend Railway
NEXT_PUBLIC_API_URL=https://aiquaabackend-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://aiquaabackend-production.up.railway.app

# OAuth Google (opcional)
GOOGLE_CLIENT_ID=<tu-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<tu-google-client-secret>

# OAuth GitHub (opcional)
GITHUB_CLIENT_ID=<tu-github-client-id>
GITHUB_CLIENT_SECRET=<tu-github-client-secret>
```

---

## Cómo Configurar en Vercel

### Opción 1: Dashboard Web

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Click en "Settings" (arriba)
4. Click en "Environment Variables" (menú izquierdo)
5. Para cada variable:
   - **Key**: Nombre de la variable (ej: `NEXTAUTH_SECRET`)
   - **Value**: El valor generado
   - **Environments**: Selecciona `Production`, `Preview`, y `Development`
   - Click "Save"
6. Cuando termines, ve a "Deployments"
7. Click en los 3 puntos del último deployment → "Redeploy"

### Opción 2: Vercel CLI

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Ir al directorio del frontend
cd apps/frontend

# Configurar variables
vercel env add NEXTAUTH_SECRET production
# Pega el valor cuando te lo pida

vercel env add NEXTAUTH_URL production
# Pega: https://tu-dominio.vercel.app

vercel env add NEXT_PUBLIC_API_URL production
# Pega: https://aiquaabackend-production.up.railway.app

vercel env add NEXT_PUBLIC_BACKEND_URL production
# Pega: https://aiquaabackend-production.up.railway.app

# Si tienes OAuth:
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GITHUB_CLIENT_ID production
vercel env add GITHUB_CLIENT_SECRET production

# Redeploy
vercel --prod
```

---

## Verificación

### 1. Verificar que las variables estén configuradas

En Vercel Dashboard → Settings → Environment Variables, deberías ver todas las variables listadas.

### 2. Verificar después del deployment

```bash
# Verificar que el backend esté disponible
curl https://aiquaabackend-production.up.railway.app/api/v1/health

# Debería retornar:
# {"status":"ok"}
```

### 3. Probar registro

1. Ve a tu app: `https://tu-dominio.vercel.app/register`
2. Intenta registrar un usuario de prueba
3. Debería funcionar sin el error `ERR_FAILED`

---

## Troubleshooting

### Error: "NEXTAUTH_SECRET required"

- Verifica que `NEXTAUTH_SECRET` esté configurada en Vercel
- Verifica que tenga al menos 32 caracteres
- Haz redeploy después de configurarla

### Error: "Failed to fetch"

- Verifica que `NEXT_PUBLIC_API_URL` esté configurada correctamente
- Verifica que apunte a Railway (no a localhost)
- Verifica que el backend esté corriendo en Railway

### OAuth no funciona

- Verifica que las URLs de callback en Google/GitHub coincidan con tu dominio de Vercel
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén configuradas
- Verifica que no tengan espacios ni caracteres extra

---

## Script de Ayuda

Puedes usar este script para generar todas las variables:

```bash
#!/bin/bash

echo "🔐 Generador de Variables de Entorno para Aiquaa"
echo "================================================"
echo ""

# Generar NEXTAUTH_SECRET
echo "1. NEXTAUTH_SECRET (generado automáticamente):"
SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET=$SECRET"
echo ""

# Pedir URL de Vercel
echo "2. NEXTAUTH_URL"
read -p "Ingresa la URL de tu app en Vercel (ej: https://aiquaa.vercel.app): " VERCEL_URL
echo "NEXTAUTH_URL=$VERCEL_URL"
echo ""

# URLs del backend
echo "3. Backend URLs (Railway)"
echo "NEXT_PUBLIC_API_URL=https://aiquaabackend-production.up.railway.app"
echo "NEXT_PUBLIC_BACKEND_URL=https://aiquaabackend-production.up.railway.app"
echo ""

echo "================================================"
echo "✅ Variables generadas. Cópialas a Vercel Dashboard."
echo ""
echo "📖 Para OAuth (opcional), sigue las instrucciones en GENERAR_VARIABLES.md"
```

Guarda este script como `generate-env.sh` y ejecútalo:

```bash
chmod +x generate-env.sh
./generate-env.sh
```
