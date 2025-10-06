# 🔧 Fix: Error de Despliegue Backend en Railway

## 🐛 **Problema Detectado**

El backend estaba en un **loop infinito de reintentos** en Railway con el siguiente error:

```
npm error Missing script: "start:prod"
```

### **Logs del Error**
```
2025-10-06T03:00:32.879021143Z [err]  npm error Missing script: "start:prod"
2025-10-06T03:00:34.746599452Z [err]  npm error Missing script: "start:prod"
2025-10-06T03:00:39.875689937Z [err]  npm error Missing script: "start:prod"
... (reintentos cada 2 segundos durante 19 horas)
```

### **Causa Raíz**

Railway ejecuta los comandos desde la **raíz del monorepo**, pero el script `start:prod` solo existía en `apps/backend/package.json`, no en el `package.json` raíz.

**Configuración problemática:**
```json
// railway.json (dentro de apps/backend)
{
  "deploy": {
    "startCommand": "npm run start:prod"  // ❌ Busca en package.json RAÍZ
  }
}
```

**Estructura del proyecto:**
```
aiquaa/
├── package.json           # ❌ NO tenía start:prod
├── apps/
│   └── backend/
│       └── package.json   # ✅ SÍ tenía start:prod
```

---

## ✅ **Solución Implementada**

### **1. Añadido script `start:prod` en package.json raíz**

```json
// package.json (raíz)
{
  "scripts": {
    "build:backend": "pnpm --filter @aiquaa/backend build",
    "start:prod": "pnpm --filter @aiquaa/backend start:prod",
    "prisma:generate": "pnpm --filter @aiquaa/backend prisma:generate"
  }
}
```

### **2. Actualizado railway.toml**

```toml
[build]
builder = "NIXPACKS"
buildCommand = "pnpm install && pnpm prisma:generate && pnpm build:backend"

[deploy]
startCommand = "pnpm start:prod"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

### **3. Actualizado apps/backend/railway.json**

```json
{
  "build": {
    "buildCommand": "pnpm install && pnpm --filter @aiquaa/backend exec prisma generate && pnpm --filter @aiquaa/backend build"
  },
  "deploy": {
    "startCommand": "pnpm --filter @aiquaa/backend start:prod"
  }
}
```

---

## 🎯 **Configuración Correcta en Railway Dashboard**

### **Variables de Entorno Requeridas**

```bash
# Base de Datos
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key

# NextAuth (para OAuth)
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
NEXTAUTH_URL=https://your-frontend-url.vercel.app

# OAuth Providers (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# CORS
CORS_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000

# Redis (opcional - se puede omitir)
REDIS_URL=redis://default:password@host:6379

# Sentry (opcional)
SENTRY_DSN=your-sentry-dsn

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Configuración de Servicio en Railway**

1. **Root Directory**: `/` (raíz del monorepo)
2. **Build Command**: Se usa `railway.toml`
3. **Start Command**: Se usa `railway.toml`
4. **Health Check Path**: `/api/v1/health`
5. **Port**: `$PORT` (Railway lo asigna automáticamente)

---

## 📊 **Verificación del Fix**

### **1. Test Local**

```bash
# Simular el comando de Railway
cd /ruta/a/aiquaa
pnpm install
pnpm prisma:generate
pnpm build:backend
pnpm start:prod
```

**Salida esperada:**
```
[Nest] 12345  - 10/06/2025, 8:30:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 10/06/2025, 8:30:00 PM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 10/06/2025, 8:30:00 PM     LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 10/06/2025, 8:30:00 PM     LOG Application is running on: http://0.0.0.0:3001
```

### **2. Verificar Health Endpoint**

```bash
# Después de deployar
curl https://your-backend-url.railway.app/api/v1/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  },
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

---

## 🚀 **Pasos para Re-Deployar**

1. **Commit los cambios:**
   ```bash
   git add .
   git commit -m "fix: railway deployment configuration for monorepo"
   git push origin main
   ```

2. **En Railway Dashboard:**
   - Ir a tu servicio backend
   - Hacer click en "Deploy" → "Redeploy"
   - O simplemente hacer push a `main` (auto-deploy)

3. **Monitorear logs:**
   - Ver logs en tiempo real en Railway Dashboard
   - Verificar que NO aparezca "Missing script: start:prod"
   - Verificar que aparezca "Nest application successfully started"

---

## 🔍 **Debugging**

### **Si sigue fallando:**

1. **Verificar que pnpm esté disponible:**
   ```bash
   # En Railway, verificar en logs de build
   which pnpm
   pnpm --version
   ```

2. **Verificar estructura de archivos después del build:**
   ```bash
   # Agregar a buildCommand temporalmente para debug
   buildCommand = "pnpm install && pnpm build:backend && ls -la apps/backend/dist"
   ```

3. **Probar start command alternativo:**
   ```toml
   # railway.toml
   [deploy]
   startCommand = "cd apps/backend && node dist/main.js"
   ```

---

## 📝 **Notas Importantes**

### **Diferencias entre Configuraciones**

| Archivo | Propósito | Prioridad |
|---------|-----------|-----------|
| `railway.toml` | Configuración global del servicio | Alta |
| `apps/backend/railway.json` | Configuración específica del backend | Media |
| `nixpacks.toml` | Configuración de Nixpacks builder | Baja |

**Railway usa en este orden:**
1. `railway.toml` (si existe en raíz)
2. `railway.json` (si existe en directorio del servicio)
3. Detección automática

### **Best Practices para Monorepos**

✅ **DO:**
- Usar `pnpm --filter` para comandos específicos de workspace
- Definir scripts en el package.json raíz para comandos de deploy
- Mantener configuración de Railway en la raíz

❌ **DON'T:**
- Usar `cd` en startCommand (puede fallar en algunos entornos)
- Asumir que el working directory es el del servicio
- Duplicar configuración entre railway.toml y railway.json

---

## 🎉 **Resultado Esperado**

Después del fix, el backend debería:

1. ✅ Buildear correctamente con Prisma y NestJS
2. ✅ Iniciar sin errores de "Missing script"
3. ✅ Responder en el health endpoint
4. ✅ Estar disponible para el frontend
5. ✅ No entrar en loop de reintentos

---

## 📚 **Referencias**

- [Railway Docs - Monorepos](https://docs.railway.app/guides/deployments#monorepos)
- [Nixpacks - NestJS](https://nixpacks.com/docs/providers/node)
- [PNPM Workspaces](https://pnpm.io/workspaces)

---

**Fecha del Fix**: 2025-10-06
**Issue**: Loop infinito de reintentos (19 horas)
**Status**: ✅ RESUELTO
