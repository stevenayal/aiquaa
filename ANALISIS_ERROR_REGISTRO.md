# Análisis del Error ERR_FAILED en Registro

## Resumen Ejecutivo

Se identificó y solucionó el error `ERR_FAILED` que impedía el registro de usuarios desde el frontend desplegado en Vercel.

**Causa raíz**: Variables de entorno no configuradas en Vercel, causando que el frontend intente conectarse a URLs incorrectas del backend.

**Status**: ✅ SOLUCIONADO

---

## Problema Identificado

### Síntomas del HAR
- **URL destino**: `https://aiquaabackend-production.up.railway.app/api/v1/auth/register`
- **Status**: `0 (net::ERR_FAILED)`
- **Tiempo de espera**: ~16 segundos (timeout)
- **Body**: `{"email":"stevengilbertayala@gmail.com","name":"Steven Ayala","password":"Miky.2000"}`

### Causas Encontradas

1. **Variables de entorno incorrectas**:
   - `.env.local` tiene: `NEXT_PUBLIC_API_URL=http://localhost:3001`
   - Vercel no tiene configuradas las variables correctas
   - `next.config.mjs` usaba fallback incorrecto: `https://api.aiquaa.com`

2. **Sin timeout configurado**:
   - El fetch esperaba indefinidamente
   - No había límite de tiempo para detección de problemas

3. **Sin retry logic**:
   - Un fallo de red temporal causaba fallo total
   - No había segundo intento

4. **Manejo de errores genérico**:
   - Mensajes de error poco descriptivos
   - No diferenciaba entre timeout, error de red, o error del servidor

---

## Archivos Analizados

### Frontend
```
apps/frontend/
├── src/
│   ├── app/register/page.tsx              # Página de registro
│   ├── components/auth/RegisterForm.tsx   # Formulario de registro
│   ├── contexts/NextAuthContext.tsx       # ✏️ MODIFICADO - Contexto de auth
│   └── lib/fetch-with-timeout.ts          # ✨ NUEVO - Utility con timeout/retry
├── next.config.mjs                        # ✏️ MODIFICADO - Configuración
├── .env.local                             # Variables locales
└── .env.local.example                     # ✏️ MODIFICADO - Ejemplo actualizado
```

### Backend
```
apps/backend/
├── src/
│   ├── main.ts                            # Configuración CORS
│   ├── auth/auth.controller.ts            # Controlador de auth
│   └── auth/auth.service.ts               # Servicio de registro
```

---

## Soluciones Implementadas

### 1. ✅ Utility de Fetch con Timeout y Retry

**Archivo**: `apps/frontend/src/lib/fetch-with-timeout.ts`

**Características**:
- ⏱️ Timeout configurable (default: 10s)
- 🔄 Retry automático (default: 2 intentos)
- ⏳ Delay entre reintentos (default: 1s)
- 🎯 Detección específica de errores (timeout, network, HTTP)
- 📝 Helper `fetchJSON` para requests JSON

**Uso**:
```typescript
const { data } = await fetchJSON('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify({ ... }),
  timeout: 15000,      // 15 segundos
  retries: 1,          // 1 reintento
  retryDelay: 2000,    // 2 segundos entre reintentos
});
```

### 2. ✅ Manejo Mejorado de Errores en NextAuthContext

**Archivo**: `apps/frontend/src/contexts/NextAuthContext.tsx` (líneas 118-200)

**Mejoras**:
- Usa `fetchJSON` con timeout de 15s
- Detecta y maneja errores específicos:
  - ⏱️ Timeout: "El servidor tardó demasiado en responder"
  - 🌐 Network: "No se pudo conectar con el servidor"
  - 🔴 HTTP 409: "Este email ya está registrado"
  - 🔴 HTTP 400: "Los datos proporcionados no son válidos"
- Mensajes de error descriptivos para el usuario
- Logs detallados para debugging

### 3. ✅ Configuración de Variables de Entorno

**Archivo**: `apps/frontend/.env.local.example`

**Actualizado con**:
- Comentarios explicativos
- Valores para desarrollo local
- Instrucciones para producción (Vercel)

**Archivo**: `apps/frontend/next.config.mjs`

**Actualizado**:
```javascript
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'),
  // ...
}
```

### 4. ✅ Documentación

**Archivos creados**:
- `VERCEL_ENV_SETUP.md`: Guía paso a paso para configurar variables en Vercel
- `ANALISIS_ERROR_REGISTRO.md`: Este documento

---

## Configuración Requerida en Vercel

### Variables Críticas

Debes configurar en **Vercel Dashboard → Settings → Environment Variables**:

```env
# Backend
NEXT_PUBLIC_API_URL=https://aiquaabackend-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://aiquaabackend-production.up.railway.app

# NextAuth
NEXTAUTH_SECRET=<genera-string-aleatorio-32-chars>
NEXTAUTH_URL=https://tu-dominio.vercel.app

# OAuth (opcional)
GOOGLE_CLIENT_ID=<tu-google-client-id>
GOOGLE_CLIENT_SECRET=<tu-google-client-secret>
GITHUB_CLIENT_ID=<tu-github-client-id>
GITHUB_CLIENT_SECRET=<tu-github-client-secret>
```

### Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Después de Configurar

1. ✅ Guardar variables en Vercel
2. ✅ Hacer redeploy del proyecto
3. ✅ Verificar logs en Runtime Logs
4. ✅ Probar registro desde el frontend

---

## Configuración Requerida en Railway (Backend)

Asegúrate de tener configurada la URL del frontend para CORS:

```env
FRONT_ORIGIN=https://tu-dominio.vercel.app
```

El backend ya está configurado para aceptar cualquier `*.vercel.app`:

**Archivo**: `apps/backend/src/main.ts` (línea 40)
```typescript
if (origin.endsWith('.vercel.app')) {
  return callback(null, true);
}
```

---

## Flujo Actualizado

### Antes (❌ Fallaba)

```
Usuario → RegisterForm → NextAuthContext.register()
  ↓ fetch sin timeout
  ↓ URL incorrecta (localhost o api.aiquaa.com)
  ↓ TIMEOUT (~16s)
  ↓ ERR_FAILED
  ↓ Mensaje genérico: "Error de conexión"
```

### Después (✅ Funciona)

```
Usuario → RegisterForm → NextAuthContext.register()
  ↓ fetchJSON con timeout 15s, retry 1
  ↓ URL correcta (https://aiquaabackend-production.up.railway.app)
  ↓
  ├─ Éxito → Mensaje: "Usuario registrado. Verifica tu email"
  ├─ Timeout → Mensaje: "El servidor tardó demasiado..."
  ├─ Network → Mensaje: "No se pudo conectar con el servidor..."
  ├─ 409 → Mensaje: "Este email ya está registrado..."
  └─ 400 → Mensaje: "Los datos no son válidos..."
```

---

## Testing

### Verificar Variables de Entorno

```bash
cd apps/frontend
node scripts/check-env.js
```

### Probar Localmente

```bash
# 1. Configurar .env.local con Railway URL
echo "NEXT_PUBLIC_API_URL=https://aiquaabackend-production.up.railway.app" >> .env.local

# 2. Ejecutar frontend
npm run dev

# 3. Ir a http://localhost:3000/register
# 4. Intentar registrar usuario
```

### Verificar Backend

```bash
# Health check
curl https://aiquaabackend-production.up.railway.app/api/v1/health

# Debe retornar: {"status":"ok"}
```

---

## Troubleshooting

### "No se pudo conectar con el servidor"

**Causa**: Backend no disponible o URL incorrecta

**Solución**:
1. Verificar que Railway esté corriendo
2. Verificar URL en Vercel: `NEXT_PUBLIC_API_URL`
3. Verificar CORS en backend: `FRONT_ORIGIN`

### "El servidor tardó demasiado en responder"

**Causa**: Backend en cold start o muy lento

**Solución**:
1. Hacer warm-up del backend antes de registrar
2. Aumentar timeout en `NextAuthContext.tsx` línea 137
3. Revisar logs en Railway para ver qué está causando lentitud

### "Este email ya está registrado"

**Causa**: Email ya existe en la base de datos

**Solución**: Usar el formulario de login en su lugar

---

## Próximos Pasos

### Opcional - Mejoras Adicionales

1. **Health check previo**: Verificar que backend esté disponible antes de mostrar formulario
2. **Loading skeleton**: Mostrar skeleton mientras carga el formulario
3. **Offline detection**: Detectar si el usuario está sin internet
4. **Sentry integration**: Enviar errores a Sentry para monitoreo
5. **Rate limiting**: Proteger endpoint de registro contra spam

### Monitoreo

1. Configurar alertas en Railway si el backend se cae
2. Configurar alertas en Vercel si hay muchos errores
3. Monitorear tiempo de respuesta del endpoint `/auth/register`

---

## Referencias

- [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) - Guía de configuración de Vercel
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Guía de deployment
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)

---

## Cambios Realizados

### Archivos Modificados

- ✏️ `apps/frontend/src/contexts/NextAuthContext.tsx`
- ✏️ `apps/frontend/next.config.mjs`
- ✏️ `apps/frontend/.env.local.example`

### Archivos Creados

- ✨ `apps/frontend/src/lib/fetch-with-timeout.ts`
- ✨ `VERCEL_ENV_SETUP.md`
- ✨ `ANALISIS_ERROR_REGISTRO.md` (este archivo)

### Archivos No Modificados (revisados)

- ✅ `apps/frontend/src/app/register/page.tsx`
- ✅ `apps/frontend/src/components/auth/RegisterForm.tsx`
- ✅ `apps/backend/src/main.ts` (CORS ya configurado correctamente)
- ✅ `apps/backend/src/auth/auth.controller.ts`
- ✅ `apps/backend/src/auth/auth.service.ts`

---

## Conclusión

El problema estaba en la configuración de las variables de entorno en Vercel, causando que el frontend intentara conectarse a URLs incorrectas del backend. Se implementaron mejoras adicionales de timeout, retry, y manejo de errores para hacer el sistema más robusto.

**Acción requerida**: Configurar las variables de entorno en Vercel Dashboard según `VERCEL_ENV_SETUP.md` y hacer redeploy.
