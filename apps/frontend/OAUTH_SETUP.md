# 🔐 Configuración OAuth con NextAuth.js

## 📋 Resumen de Cambios

Hemos migrado de un sistema OAuth personalizado a **NextAuth.js** para manejar la autenticación con Google y GitHub de manera profesional y segura.

## 🚀 Instalación

Las dependencias ya están instaladas:
```bash
pnpm add next-auth @auth/core @auth/prisma-adapter
```

## ⚙️ Configuración de Variables de Entorno

### 1. Desarrollo Local (`.env.local`)

```bash
# Copia el archivo de ejemplo
cp env.local.example .env.local

# Edita .env.local con tus valores
```

```env
# NextAuth
NEXTAUTH_SECRET=tu-secret-aqui
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=tu-github-client-secret
```

### 2. Producción (Vercel)

Configura estas variables en tu proyecto de Vercel:

```env
NEXTAUTH_SECRET=tu-production-secret
NEXTAUTH_URL=https://aiquaa.com
GOOGLE_CLIENT_ID=tu-production-google-client-id
GOOGLE_CLIENT_SECRET=tu-production-google-client-secret
GITHUB_CLIENT_ID=tu-production-github-client-id
GITHUB_CLIENT_SECRET=tu-production-github-client-secret
```

## 🔑 Configuración de Google OAuth

### 1. Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**
4. Ve a **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configura:
   - **Application type**: Web application
   - **Name**: AIQUAA OAuth
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (desarrollo)
     - `https://aiquaa.com/api/auth/callback/google` (producción)

### 2. Obtener Credenciales

- **Client ID**: Se muestra en la consola
- **Client Secret**: Haz clic en "Download" para obtener el JSON

## 🐙 Configuración de GitHub OAuth

### 1. GitHub Developer Settings

1. Ve a [GitHub Settings](https://github.com/settings/developers)
2. Haz clic en **New OAuth App**
3. Configura:
   - **Application name**: AIQUAA
   - **Homepage URL**: `https://aiquaa.com`
   - **Authorization callback URL**:
     - `http://localhost:3000/api/auth/callback/github` (desarrollo)
     - `https://aiquaa.com/api/auth/callback/github` (producción)

### 2. Obtener Credenciales

- **Client ID**: Se muestra en la página de la app
- **Client Secret**: Haz clic en "Generate a new client secret"

## 🔐 Generar NextAuth Secret

```bash
# En Windows PowerShell
openssl rand -base64 32

# O usa un generador online
# https://generate-secret.vercel.app/32
```

## 📁 Estructura de Archivos

```
src/
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts          # Configuración NextAuth
├── contexts/
│   └── NextAuthContext.tsx           # Contexto de autenticación
├── types/
│   └── next-auth.d.ts               # Tipos TypeScript
└── components/
    └── auth/
        ├── LoginForm.tsx             # Formulario de login
        └── RegisterForm.tsx          # Formulario de registro
```

## 🧪 Pruebas

### 1. Desarrollo Local

1. Configura `.env.local` con tus credenciales
2. Inicia el servidor: `pnpm dev`
3. Ve a `http://localhost:3000/login`
4. Prueba los botones de Google y GitHub

### 2. Verificar Redirecciones

Los botones ahora redirigen a:
- **Google**: `https://accounts.google.com/o/oauth2/v2/auth?...`
- **GitHub**: `https://github.com/login/oauth/authorize?...`

**NO** a `/auth/google` o `/auth/github` (que causaban la pantalla negra).

## 🚨 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa**: La URI de redirección no coincide con la configurada en Google/GitHub.

**Solución**: 
1. Verifica que `NEXTAUTH_URL` coincida con tu dominio
2. Asegúrate de que las URIs autorizadas incluyan `/api/auth/callback/google` y `/api/auth/callback/github`

### Error: "redirect_uri is not associated with this application"

**Causa**: URI de redirección no configurada en GitHub.

**Solución**: Agrega la URI correcta en GitHub Developer Settings.

### Pantalla Negra en `/auth/google` o `/auth/github`

**Causa**: Estás usando el sistema OAuth obsoleto.

**Solución**: Asegúrate de usar NextAuth.js (los botones ahora redirigen directamente a Google/GitHub).

## 🔄 Migración desde el Sistema Anterior

### 1. Variables Obsoletas

❌ **NO USAR**:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_GITHUB_CLIENT_ID=...
```

✅ **USAR**:
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### 2. Archivos Obsoletos

- `src/config/oauth.ts` - Ya no se usa
- `src/services/authService.ts` - Los métodos OAuth ya no se usan

### 3. Nuevos Archivos

- `src/app/api/auth/[...nextauth]/route.ts` - API de NextAuth
- `src/contexts/NextAuthContext.tsx` - Contexto de autenticación
- `src/types/next-auth.d.ts` - Tipos TypeScript

## 📱 Flujo de Autenticación

1. **Usuario hace clic** en Google/GitHub
2. **NextAuth redirige** a la página oficial de OAuth
3. **Usuario autoriza** la aplicación
4. **Proveedor redirige** a `/api/auth/callback/[provider]`
5. **NextAuth procesa** el código de autorización
6. **Usuario es redirigido** a `/forum` (callbackUrl)

## 🔒 Seguridad

- **Client Secrets** nunca se exponen al frontend
- **NextAuth** maneja automáticamente la validación de tokens
- **Sesiones** se almacenan de forma segura
- **CSRF protection** incluida por defecto

## 📞 Soporte

Si encuentras problemas:

1. Verifica que las variables de entorno estén configuradas
2. Confirma que las URIs de redirección coincidan
3. Revisa la consola del navegador para errores
4. Verifica los logs del servidor

## 🎯 Próximos Pasos

1. **Configura** las credenciales OAuth en Google y GitHub
2. **Prueba** en desarrollo local
3. **Despliega** en staging con las nuevas variables
4. **Verifica** que OAuth funcione correctamente
5. **Actualiza** las credenciales de producción

## 🔧 Configuración de Registro

### Feature Flag para Registro

Para controlar el registro de usuarios sin necesidad de recompilar la aplicación:

```env
# Deshabilitar registro temporalmente
NEXT_PUBLIC_DISABLE_REGISTRATION=true

# Habilitar registro (por defecto)
NEXT_PUBLIC_DISABLE_REGISTRATION=false
```

**Uso**:
- **Desarrollo**: Siempre habilitado
- **Staging**: Configurable por variable de entorno
- **Producción**: Configurable por variable de entorno

**Ventajas**:
- Control granular sin recompilación
- Fácil habilitación/deshabilitación en producción
- Mantiene la funcionalidad OAuth intacta
