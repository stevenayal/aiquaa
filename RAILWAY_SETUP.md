# 🚂 Guía de Despliegue en Railway - AIQUAA Backend

## 📋 Problema Común

Si Railway no reconoce tu backend, es porque hay configuraciones conflictivas.

## ✅ Configuración Correcta

### 1. Archivo de Configuración

Usa **SOLO** el archivo `apps/backend/railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm -w install --frozen-lockfile && pnpm --filter @aiquaa/backend exec prisma generate && pnpm --filter @aiquaa/backend build"
  },
  "deploy": {
    "startCommand": "pnpm --filter @aiquaa/backend start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

### 2. Pasos en Railway Dashboard

#### A. Crear Nuevo Proyecto

1. Ve a [Railway.app](https://railway.app)
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Conecta tu repositorio `aiquaa`

#### B. Configurar el Servicio

1. **Root Directory**: Déjalo en `/` (raíz del monorepo)
2. **Build Command**: Railway detectará automáticamente desde `railway.json`
3. **Start Command**: Railway usará `pnpm --filter @aiquaa/backend start:prod`

#### C. Variables de Entorno Requeridas

Agrega estas variables en Railway Dashboard:

```bash
# Base de datos (Railway te da esto automáticamente si conectas PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_URL=postgresql://user:password@host:port/database

# Node
NODE_ENV=production
PORT=3001

# JWT
JWT_SECRET=tu-secreto-super-seguro-aqui

# Redis (opcional, pero recomendado)
REDIS_URL=redis://default:password@host:port

# Email (Resend)
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=noreply@aiquaa.com
ADMIN_EMAIL=admin@aiquaa.com

# OAuth (si usas)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=tu-github-client-secret

# App URL
APP_URL=https://aiquaa.com
```

#### D. Agregar PostgreSQL

1. En tu proyecto de Railway, click en **"+ New"**
2. Selecciona **"Database"** → **"PostgreSQL"**
3. Railway creará automáticamente las variables:
   - `DATABASE_URL`
   - `POSTGRES_URL`

#### E. Agregar Redis (Opcional)

1. Click en **"+ New"**
2. Selecciona **"Database"** → **"Redis"**
3. Railway creará automáticamente `REDIS_URL`

### 3. Estructura Esperada

Railway necesita detectar el proyecto desde la raíz del monorepo:

```
aiquaa/                          ← Railway clona AQUÍ
├── apps/
│   └── backend/
│       ├── railway.json         ← Configuración de Railway
│       ├── package.json
│       ├── prisma/
│       │   └── schema.prisma
│       └── src/
│           └── main.ts
├── package.json                 ← Workspace root
└── pnpm-workspace.yaml
```

### 4. Comandos que Railway Ejecutará

#### Build:
```bash
# 1. Instalar dependencias
pnpm -w install --frozen-lockfile

# 2. Generar Prisma client
pnpm --filter @aiquaa/backend exec prisma generate

# 3. Compilar TypeScript
pnpm --filter @aiquaa/backend build
```

#### Start:
```bash
# Iniciar aplicación
pnpm --filter @aiquaa/backend start:prod
```

Esto ejecuta (en `apps/backend/package.json`):
```json
{
  "scripts": {
    "start:prod": "node dist/main"
  }
}
```

### 5. Healthcheck

Railway verificará automáticamente:
- **URL**: `https://tu-app.railway.app/health`
- **Timeout**: 300 segundos
- **Política de reinicio**: ON_FAILURE (máximo 10 reintentos)

### 6. Verificar Despliegue

Después del despliegue, verifica:

1. **Logs**: Revisa los logs en Railway Dashboard
2. **Health Check**: Abre `https://tu-app.railway.app/health`
3. **API Docs**: Abre `https://tu-app.railway.app/api/v1/docs`

### 7. Troubleshooting

#### Error: "pnpm: command not found"

Railway debería detectar pnpm automáticamente desde `packageManager` en `package.json`:

```json
{
  "packageManager": "pnpm@8.15.0"
}
```

Si no funciona, agrega variable de entorno:
```bash
NIXPACKS_INSTALL_CMD=npm install -g pnpm@8.15.0
```

#### Error: "Prisma Client not generated"

Asegúrate de que el buildCommand incluya:
```bash
pnpm --filter @aiquaa/backend exec prisma generate
```

#### Error: "Port already in use"

Railway asigna automáticamente el puerto. Tu código en `main.ts` debe usar:
```typescript
const port = process.env.PORT || 3001;
await app.listen(port);
```

#### Error: "Cannot find module 'dist/main'"

El startCommand debe ejecutarse desde la raíz del monorepo:
```bash
pnpm --filter @aiquaa/backend start:prod
```

NO uses:
```bash
cd apps/backend && node dist/main  ❌
```

### 8. Configuración Avanzada

#### Custom Nixpacks

Si necesitas configuración personalizada, crea `nixpacks.toml` en la raíz:

```toml
[phases.setup]
nixPkgs = ['nodejs-18_x', 'pnpm']

[phases.install]
cmd = 'pnpm install --frozen-lockfile'

[phases.build]
cmd = 'pnpm --filter @aiquaa/backend exec prisma generate && pnpm --filter @aiquaa/backend build'

[start]
cmd = 'pnpm --filter @aiquaa/backend start:prod'
```

## ✅ Checklist de Despliegue

- [ ] Eliminado o renombrado `railway.toml` de la raíz
- [ ] Verificado que existe `apps/backend/railway.json`
- [ ] Agregadas todas las variables de entorno en Railway
- [ ] Conectado PostgreSQL en Railway
- [ ] (Opcional) Conectado Redis en Railway
- [ ] Verificado que `packageManager: "pnpm@8.15.0"` existe en `package.json`
- [ ] Pusheado código a GitHub
- [ ] Desplegado en Railway
- [ ] Verificado `/health` endpoint
- [ ] Verificado `/api/v1/docs` endpoint

## 🎯 Comando de Prueba Local

Antes de desplegar, prueba localmente que el build funciona:

```bash
# Simular el build de Railway
pnpm -w install --frozen-lockfile
pnpm --filter @aiquaa/backend exec prisma generate
pnpm --filter @aiquaa/backend build

# Simular el start
pnpm --filter @aiquaa/backend start:prod
```

## 📚 Referencias

- [Railway Docs - Monorepos](https://docs.railway.app/guides/monorepo)
- [Nixpacks Docs](https://nixpacks.com/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
