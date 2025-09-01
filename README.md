# AIQUAA Monorepo

Plataforma de inteligencia artificial y desarrollo con herramientas, laboratorios y comunidad para QA en Paraguay.

## 🏗️ Estructura del Proyecto

```
aiquaa/
├── apps/
│   ├── frontend/          # Next.js 15 App Router
│   └── backend/           # NestJS API
├── packages/
│   └── shared/            # Tipos y utilidades compartidas
├── docs/
│   ├── adr/              # Architecture Decision Records
│   ├── observability.md  # Sistema de observabilidad
│   └── dashboard-kpis.md # KPIs y métricas
├── docker-compose.yml     # PostgreSQL + Redis
├── docker-compose.observability.yml # Jaeger + Prometheus + Grafana
├── Makefile              # Comandos útiles
└── package.json          # Workspace root
```

## 🚀 Requisitos

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd aiquaa
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copiar archivos de ejemplo
   cp env.example .env
   cp apps/frontend/env.local.example apps/frontend/.env.local
   
   # Configurar observabilidad (opcional)
   cp env.observability.example .env.observability
   ```

4. **Levantar servicios**
   ```bash
   make db-up
   ```

5. **Ejecutar migraciones y seed**
   ```bash
   make db-seed
   ```

## 🎯 Comandos Principales

### Desarrollo
```bash
# Iniciar frontend y backend
make dev

# Solo frontend (puerto 3001)
make dev-front

# Solo backend (puerto 3000)
make dev-back

# Con observabilidad completa
make dev-observability
```

### Base de Datos
```bash
# Levantar PostgreSQL y Redis
make db-up

# Detener servicios
make db-down

# Migraciones y seed
make db-seed
```

### Observabilidad
```bash
# Levantar servicios de observabilidad
make observability-up

# Detener servicios de observabilidad
make observability-down

# Probar sistema de observabilidad
make test-observability
```

### Build
```bash
# Build de todos los paquetes
make build

# Limpiar artifacts
make clean
```

## 📊 Observabilidad

AIQUAA incluye un sistema completo de observabilidad con:

- **Logging estructurado** con Pino
- **Tracing distribuido** con OpenTelemetry
- **Métricas** con Prometheus
- **Monitoreo de errores** con Sentry
- **Correlación** con Request IDs

### Endpoints de Observabilidad

- **Métricas**: `http://localhost:3000/metrics` (Prometheus)
- **Health Check**: `http://localhost:3000/api/v1/health`
- **Jaeger UI**: `http://localhost:16686` (tracing)
- **Grafana**: `http://localhost:3001` (dashboards)

### Configuración Rápida

1. **Variables de entorno**:
   ```bash
   # Backend
   LOG_LEVEL=info
   OTLP_ENDPOINT=http://localhost:4318
   SENTRY_DSN=your-sentry-dsn
   
   # Frontend
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   ```

2. **Servicios opcionales**:
   ```bash
   docker-compose -f docker-compose.observability.yml up -d
   ```

3. **Verificar funcionamiento**:
   ```bash
   node scripts/test-observability.js
   ```

Para más detalles, consulta [docs/observability.md](docs/observability.md).

## 🗄️ Data & Cache

### Redis Cache
El proyecto utiliza Redis para cachear consultas frecuentes y mejorar el rendimiento.

#### Configuración
```bash
# Variables de entorno
REDIS_URL=redis://localhost:6379
CACHE_TTL=60
CACHE_MAX_ITEMS=100
```

#### Invalidación
- **Threads**: Se invalida automáticamente al crear/editar/eliminar threads
- **Posts**: Se invalida automáticamente al crear/editar/eliminar posts
- **Patrones**: Soporte para invalidación por patrones (ej: `forum:threads:*`)

#### Monitoreo
- Logs de cache hit/miss disponibles
- Métricas de performance en desarrollo

### Soft Delete & Auditoría
- **Soft Delete**: Los registros se marcan como eliminados (`deletedAt`) en lugar de eliminarse físicamente
- **Auditoría**: Todos los cambios se registran automáticamente en `audit_logs`
- **Índices**: Optimizados para consultas frecuentes y búsquedas

## 🔍 SEO

### Sitemap y Robots
- **Generación automática**: `next-sitemap` genera `/sitemap.xml` y `/robots.txt`
- **Configuración**: `apps/frontend/next-sitemap.config.js`
- **Build**: Se ejecuta automáticamente después del build

### Metadata
- **Dinámica**: Metadata generada dinámicamente por ruta
- **Open Graph**: Soporte completo para redes sociales
- **JSON-LD**: Schema.org para mejor SEO

### Revalidación
- **API Route**: `/api/revalidate` para invalidar cache
- **Tokens**: Seguridad con `REVALIDATE_TOKEN`
- **Tags**: Revalidación granular por tags

## 📋 ADRs (Architecture Decision Records)

Los ADRs documentan decisiones arquitectónicas importantes del proyecto.

### Comandos
```bash
# Crear nuevo ADR
pnpm adr:new "Título del ADR"

# Listar ADRs existentes
pnpm adr:list
```

### ADRs Existentes
- [ADR-001: Monolito modular Nest](./docs/adr/ADR-001-monolito-modular-nest.md)
- [ADR-002: Next vs Nuxt](./docs/adr/ADR-002-next-vs-nuxt.md)
- [ADR-003: OpenAPI + codegen tipos compartidos](./docs/adr/ADR-003-openapi-codegen-tipos-compartidos.md)
- [ADR-004: Redis cache con invalidación por tags](./docs/adr/ADR-004-redis-cache-invalidacion-tags.md)
- [ADR-005: Soft delete + auditoría con Prisma](./docs/adr/ADR-005-soft-delete-auditoria-prisma.md)

## 🧪 Pruebas y Cobertura

### Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
pnpm test

# Ejecutar pruebas con cobertura
pnpm test:cov
```

## 🎯 Etapa 2: Pruebas y Funcionalidades Post-v1

### E2E Testing con Playwright

```bash
# Ejecutar tests E2E
pnpm e2e

# Ver reporte de E2E
pnpm e2e:report
```

**Tests incluidos:**
- `health.spec.ts` - Verificación de health check
- `forum.crud.spec.ts` - Flujo completo CRUD del foro
- `auth.spec.ts` - Autenticación y autorización
- `a11y.spec.ts` - Tests de accesibilidad con axe-core

### Contratos de API

```bash
# Ejecutar tests de contratos
pnpm test:contract
```

**Tests incluidos:**
- `contracts.forum.spec.ts` - Validación de endpoints del foro
- `contracts.auth.spec.ts` - Validación de endpoints de autenticación

### Performance Testing con k6

```bash
# Ejecutar tests de performance
pnpm perf:forum
```

**Métricas:**
- P95 < 400ms para requests HTTP
- Error rate < 1%
- Tests de carga para endpoints del foro

### Búsqueda y Paginación

**Endpoints implementados:**
- `GET /forum/threads?search=&page=&limit=` - Búsqueda y paginación de hilos
- `GET /forum/posts?threadId=&page=&limit=` - Paginación de posts
- `GET /forum/search?q=&page=&limit=` - Búsqueda avanzada

### Seguridad y Anti-spam

**Funcionalidades implementadas:**
- Rate limiting (100 requests/15min por IP)
- Anti-spam con honeypot y time-gate (>2s)
- Headers de seguridad (helmet)

**Tests de seguridad:**
- `security.rate-limit.spec.ts` - Validación de rate limiting
- `security.antispam.spec.ts` - Validación de anti-spam

### Stripe Integration (Sandbox)

**Endpoints implementados:**
- `POST /billing/checkout` - Crear sesión de checkout
- `POST /billing/webhook` - Procesar eventos de Stripe

**Tests incluidos:**
- `billing.webhook.spec.ts` - Validación de webhooks

### Accesibilidad y SEO

**Funcionalidades:**
- Tests de accesibilidad automáticos con axe-core
- Meta tags dinámicos
- ARIA labels en componentes
- Estructura de headings semántica

### Analytics

**Implementación:**
- Eventos de "CreateThread" y "ReplyPost"
- Endpoint `/analytics/mock` para desarrollo
- Tests RTL para verificar tracking

### CI/CD Gates

**Workflow actualizado:**
- Tests unitarios y de integración
- Tests de contratos de API
- Tests E2E con Playwright
- Tests de performance con k6
- Cobertura mínima 75% (backend y frontend)
- Linting y build verification

### Variables de Entorno Requeridas

```bash
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-jwt-secret
NODE_ENV=development
PORT=3000

# Frontend
FRONTEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3000

# Performance Testing
BACKEND_URL=http://localhost:3000
```

### Definition of Done

Para que una PR sea considerada completa, debe cumplir:

1. ✅ `pnpm --filter @aiquaa/backend test:contract` pasa contra OpenAPI actual
2. ✅ `pnpm --filter @aiquaa/frontend e2e` pasa (health, foro CRUD, a11y sin violaciones críticas)
3. ✅ `pnpm perf:forum` cumple thresholds p95 < 400ms, error_rate < 1%
4. ✅ Rate limit y anti-spam activos en endpoints definidos
5. ✅ Webhook Stripe (mock) crea Enrollment/Purchase idempotente
6. ✅ Coverage ≥ 75% en backend y frontend
7. ✅ README actualizado con pasos y variables

## 🔐 Autenticación con NextAuth v5

### Configuración de Variables de Entorno

**Variables requeridas en Vercel:**
```bash
# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Control de registro (opcional)
NEXT_PUBLIC_DISABLE_REGISTRATION=true
```

### URLs de Callback Autorizadas

**Google Cloud Console:**
- `https://your-domain.vercel.app/api/auth/callback/google`

**GitHub Developer Settings:**
- `https://your-domain.vercel.app/api/auth/callback/github`

### Control de Registro

**Habilitar/Deshabilitar registro:**
```bash
# Permitir registro libre
NEXT_PUBLIC_DISABLE_REGISTRATION=false

# Bloquear nuevos registros
NEXT_PUBLIC_DISABLE_REGISTRATION=true
```

**Dominios autorizados (cuando registro está deshabilitado):**
```bash
# Solo emails de dominio específico
ALLOWED_DOMAIN=tuempresa.com
```

### Verificación de Autenticación

**Script de verificación:**
```bash
# Verificar que /api/auth/signin responde correctamente
pnpm auth:check
```

**CI/CD:**
- Ejecutar `pnpm auth:check` en Preview y Production
- Verificar que las variables de entorno estén configuradas

### Rutas Protegidas

El middleware protege automáticamente:
- `/dashboard/*` - Panel de control
- `/labs/*` - Laboratorios

**Personalizar protección:**
```typescript
// middleware.ts
export const config = { 
  matcher: ["/dashboard/:path*", "/labs/:path*", "/admin/:path*"] 
};
```
