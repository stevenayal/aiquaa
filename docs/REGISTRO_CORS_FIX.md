# Fix del Flujo de Registro - CORS y Status 0

## Problema Identificado
El flujo de registro tradicional fallaba con `status=0` debido a problemas de CORS mal configurado y llamadas directas desde el frontend al backend de Railway.

## Solución Implementada

### 1. Proxy Serverless en Next.js
- **Archivo**: `apps/frontend/src/app/api/register/route.ts`
- **Propósito**: Evitar problemas de CORS llamando al backend desde el servidor Next.js
- **Características**:
  - Validación de seguridad server-side
  - Logging detallado con request ID
  - Manejo de timeouts (30s)
  - Sanitización de datos
  - Reenvío transparente al backend

### 2. Actualización del Cliente API
- **Archivo**: `apps/frontend/src/lib/api.ts`
- **Cambios**:
  - Eliminado `mode: 'cors'` explícito (usa modo por defecto)
  - Implementado routing inteligente: `/api/v1/auth/register` → `/api/register`
  - Mejorado manejo de errores

### 3. Configuración CORS en Backend
- **Archivo**: `apps/backend/src/main.ts`
- **Mejoras**:
  - CORS configurado ANTES que GlobalExceptionFilter
  - Headers adicionales para proxy (X-Request-ID, X-Forwarded-*)
  - Métodos HTTP completos incluyendo PATCH
  - Exposed headers para debugging

### 4. Variables de Entorno
- **Nuevas variables**:
  - `NEXT_PUBLIC_API_BASE`: Base URL para proxy (vacía = rutas relativas)
  - `BACKEND_URL`: URL del backend para el proxy serverless
  - `NEXTAUTH_URL_INTERNAL`: URL interna para App Router

### 5. Configuración NextAuth Mejorada
- **Archivo**: `apps/frontend/src/auth.ts`
- **Mejoras**:
  - Configuración de cookies segura
  - Domain específico para producción (.aiquaa.com)
  - SameSite: 'lax' para mejor compatibilidad

### 6. Validación de Seguridad
- Validación de email con regex
- Longitud mínima de contraseña (8 caracteres)
- Sanitización de nombres (remover caracteres peligrosos)
- Validación de longitud de nombre (mínimo 2 caracteres)

### 7. Tests E2E
- **Archivo**: `apps/frontend/e2e/register.spec.ts`
- **Cobertura**:
  - Validación de formulario
  - Validación de campos requeridos
  - Validación de formato de email
  - Validación de contraseñas coincidentes
  - Validación de longitud de contraseña
  - Flujo exitoso de registro
  - Manejo de errores (email duplicado, conexión)

## Configuración de Variables de Entorno

### Frontend (Vercel)
```env
# Producción
NEXT_PUBLIC_API_URL=https://aiquaabackend-production.up.railway.app
NEXT_PUBLIC_API_BASE=
BACKEND_URL=https://aiquaabackend-production.up.railway.app
NEXTAUTH_URL=https://aiquaa.com
NEXTAUTH_URL_INTERNAL=https://aiquaa.com

# Preview/Development
NEXT_PUBLIC_API_URL=https://aiquaabackend-production.up.railway.app
NEXT_PUBLIC_API_BASE=
BACKEND_URL=https://aiquaabackend-production.up.railway.app
NEXTAUTH_URL=https://<VERCEL_URL>
NEXTAUTH_URL_INTERNAL=https://<VERCEL_URL>
```

### Backend (Railway)
```env
# CORS ya configurado en el código
# No requiere variables adicionales
```

## Callback URLs para OAuth

### Google Cloud Console
- Producción: `https://aiquaa.com/api/auth/callback/google`
- Preview: `https://<VERCEL_URL>/api/auth/callback/google`

### GitHub Developer Settings
- Producción: `https://aiquaa.com/api/auth/callback/github`
- Preview: `https://<VERCEL_URL>/api/auth/callback/github`

## Flujo de Registro Actualizado

1. **Frontend**: Usuario llena formulario de registro
2. **Validación**: Validación client-side + server-side en proxy
3. **Proxy**: `/api/register` recibe request y la reenvía al backend
4. **Backend**: Procesa registro y devuelve respuesta
5. **Proxy**: Reenvía respuesta al frontend
6. **Frontend**: Muestra resultado y redirige si es exitoso

## Beneficios

- ✅ Eliminado problema de CORS
- ✅ Status 0 resuelto
- ✅ Validación de seguridad robusta
- ✅ Logging detallado para debugging
- ✅ Tests E2E para validar funcionalidad
- ✅ Manejo de errores mejorado
- ✅ Configuración de cookies segura

## Commits Realizados

1. `feat: implementar proxy serverless para registro`
2. `fix: corregir configuración CORS en backend`
3. `feat: agregar validación de seguridad en proxy`
4. `feat: mejorar configuración NextAuth`
5. `feat: agregar tests e2e para registro`
6. `docs: documentar fix de CORS y registro`

## Testing

Para probar localmente:
```bash
# Frontend
cd apps/frontend
npm run dev

# Backend
cd apps/backend
npm run start:dev

# Tests E2E
npm run test:e2e
```

Para probar en producción:
1. Verificar que las variables de entorno estén configuradas
2. Verificar que los callback URLs estén configurados en OAuth providers
3. Probar registro con email válido
4. Verificar logs en Vercel y Railway
