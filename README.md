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
├── docker-compose.yml     # PostgreSQL
├── Makefile              # Comandos útiles
└── package.json          # Workspace root
```

## 🚀 Requisitos

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 16

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
   ```

4. **Levantar base de datos**
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
```

### Base de Datos
```bash
# Levantar PostgreSQL
make db-up

# Detener PostgreSQL
make db-down

# Migraciones y seed
make db-seed
```

### Build
```bash
# Build de todos los paquetes
make build

# Limpiar artifacts
make clean
```

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
