# AIQUAA

Plataforma educativa y de herramientas para la comunidad QA en Paraguay.

---

## Arquitectura de producción

```
Browser
  └── Next.js (Vercel)
        ├── App Router + Server Components
        ├── Server Actions  →  Supabase (PostgreSQL + Auth + Storage)
        ├── API Routes      →  GitHub API / dev.to API / AWS SES SMTP
        └── Client Components (React)
```

### Stack

| Capa              | Tecnología                                      |
| ----------------- | ----------------------------------------------- |
| Frontend + SSR    | Next.js 13 (App Router) en Vercel               |
| Base de datos     | Supabase PostgreSQL                             |
| Autenticación     | Supabase Auth (email/password con verificación) |
| Email             | AWS SES SMTP via nodemailer                     |
| Bug reports       | GitHub Issues via Octokit                       |
| Contenido técnico | dev.to API                                      |
| Cache frontend    | `next: { revalidate }` en fetch calls           |

---

## Funcionalidades

### Autenticación

- Registro con email y verificación por link (SES SMTP)
- Login con email y contraseña
- Reset de contraseña por email
- Rutas protegidas via middleware (`/labs/*`, `/perfil`, `/dashboard/*`)

### Laboratorios

| Lab                     | Descripción                                                    |
| ----------------------- | -------------------------------------------------------------- |
| **ISTQB CTFL v4.0**     | Simulacro de 40 preguntas, modo examen y entrenamiento         |
| **Performance Testing** | Examen sobre fundamentos y herramientas de performance         |
| **Examen GIT**          | Evaluación técnica de control de versiones                     |
| **All Pairs**           | Generador pairwise para diseño de pruebas                      |
| **Test App**            | App ficticia con bugs intencionales para ejercitar exploración |
| **Cron Validator**      | Validador y explicador de expresiones cron                     |
| **JSON / YAML / JWT**   | Validadores y decodificadores                                  |
| **Risk Matrix**         | Matriz de riesgo para planificación de pruebas                 |
| **Req Lint**            | Análisis de calidad de requerimientos                          |
| **Checklist**           | Generador de checklists de pruebas                             |
| **Data Generator**      | Generador de datos de prueba                                   |

### Gamificación

- **XP** por completar exámenes, crear contenido en el foro e ideas board
- **Niveles** calculados sobre XP acumulado
- **Logros** desbloqueables con criterios configurables en Supabase (`xp_rules`, `achievements`)
- **Ranking** público con XP, nivel y racha
- **Check-in diario** con bonus de racha

### Foro

- Threads con categorías, tags, paginación y búsqueda
- Slug único generado automáticamente

### Ideas Board

- Proponer y votar ideas con score calculado
- Comentarios y estados (PENDING → APPROVED / IN_PROGRESS / COMPLETED / REJECTED)

### Ranking

- Leaderboard por XP
- Leaderboard por tipo de examen: GIT, ISTQB, Performance
- Tab **Reportadores**: usuarios con issues abiertos/resueltos en GitHub

### Perfil

- Historial de exámenes con scores y estado
- Progreso de XP y logros
- Actualización de avatar

### Comunidad

- Timeline de hitos y eventos
- Integración con GitHub Issues y Discussions
- Widget de reporte de bugs (crea issues automáticamente)
- Artículos técnicos via dev.to API

---

## 📁 Estructura del monorepo

```
aiquaa/
├── apps/
│   ├── frontend/              # Next.js 13 — app de producción (Vercel)
│   │   └── src/
│   │       ├── app/           # Páginas y API routes (App Router)
│   │       ├── actions/       # Server Actions (Supabase)
│   │       ├── components/
│   │       ├── contexts/
│   │       ├── hooks/
│   │       ├── lib/           # Clientes Supabase, utilidades
│   │       └── services/      # Clientes HTTP para APIs externas
│   └── backend/               # NestJS + Prisma — solo desarrollo local
│       └── src/
│           ├── auth/          # JWT, 2FA, OAuth, refresh tokens
│           ├── forum/         # Facade → ThreadService + PostService + ForumMetaService
│           │   ├── repositories/
│           │   └── services/
│           ├── ideas-board/   # Facade → IdeaService + IdeaVoteService
│           │   ├── repositories/
│           │   └── services/
│           ├── gamification/  # XP, logros, ranking, check-in
│           │   └── handlers/  # EventBus handlers (CQRS)
│           ├── istqb/         # Simulacro ISTQB + EventBus
│           ├── performance/   # Examen Performance + EventBus
│           ├── labs/          # AllPairs tracking + EventBus
│           ├── cache/         # Redis tag-based invalidation
│           ├── mailer/        # AWS SES SMTP
│           └── security/      # Rate limiting, anti-spam, helmet
├── packages/
│   ├── allpairs-core/         # Algoritmo pairwise (TypeScript puro, 52 tests)
│   └── shared/                # Tipos compartidos
├── docs/
│   └── adr/                   # Architecture Decision Records
└── Makefile
```

### NestJS — solo desarrollo local

El directorio `apps/backend/` contiene una API NestJS con Prisma que se usa únicamente en desarrollo local para explorar y probar la arquitectura del sistema. **No está desplegado en producción.** En producción toda la lógica corre en Vercel (Next.js) con Supabase.

**Patrones implementados en el backend local:**

- **EventBus (CQRS)** — módulos desacoplados: ISTQB, Labs y Performance publican eventos; Gamification los consume via handlers
- **Repository Pattern** — queries complejas encapsuladas (ThreadRepository, IdeaRepository, etc.)
- **Facade Pattern** — ForumService e IdeasBoardService delegan a sub-servicios especializados

---

## 🚀 Desarrollo local

### Requisitos

- Node.js 20+
- pnpm 9+

### Frontend (equivalente a producción)

```bash
pnpm install
cp apps/frontend/.env.local.example apps/frontend/.env.local
# Completar con claves de Supabase

make dev-front
# o
pnpm dev:front
```

### Backend NestJS (opcional)

Solo necesario para explorar o probar la API localmente. Requiere Docker.

```bash
make db-up       # PostgreSQL + Redis via Docker
make db-seed     # Migraciones Prisma + seed

make dev-back
```

---

## Variables de entorno

### Frontend (`apps/frontend/.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Email (AWS SES SMTP)
SES_SMTP_HOST=email-smtp.<region>.amazonaws.com
SES_SMTP_PORT=587
SES_SMTP_USER=<iam-smtp-user>
SES_SMTP_PASS=<iam-smtp-password>
SES_FROM_EMAIL=noreply@tudominio.com

# URLs
NEXT_PUBLIC_SITE_URL=https://tuapp.vercel.app
FRONTEND_URL=https://tuapp.vercel.app

# Integraciones externas
GITHUB_TOKEN=<personal-access-token>
GITHUB_REPO=owner/repo

# Registro
NEXT_PUBLIC_DISABLE_REGISTRATION=false
```

### Backend NestJS (`apps/backend/.env`) — solo local

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/aiquaa
JWT_SECRET=tu-jwt-secret
PORT=3001
REDIS_URL=redis://localhost:6379
SES_SMTP_HOST=...
SES_SMTP_USER=...
SES_SMTP_PASS=...
SES_FROM_EMAIL=...
FRONTEND_URL=http://localhost:3001
```

---

## 🗄️ Base de datos (Supabase)

| Tabla               | Descripción                                      |
| ------------------- | ------------------------------------------------ |
| `profiles`          | Perfil público del usuario                       |
| `exam_results`      | Resultados de exámenes (ISTQB, GIT, Performance) |
| `xp_rules`          | Reglas de XP por tipo de evento (configurable)   |
| `xp_history`        | Historial de XP otorgado (con deduplicación)     |
| `user_xp`           | XP total, nivel y racha por usuario              |
| `achievements`      | Definición de logros                             |
| `user_achievements` | Logros desbloqueados por usuario                 |

**Funciones RPC:**

- `get_leaderboard(p_exam_type, p_limit)` — ranking por tipo de examen
- `ranking_candidatos` — view para ranking XP

**RLS:** todas las tablas con Row Level Security activo.

---

## 📧 Emails

Se envían vía AWS SES SMTP desde las API routes de Next.js:

1. **Verificación de cuenta** — al registrarse
2. **Reset de contraseña** — al solicitar cambio de clave

---

## 🧪 Tests

```bash
# Backend — unit tests (config local)
cd apps/backend && npx jest --config jest.unit.local.config.ts

# Backend — contract tests
pnpm --filter @aiquaa/backend test:contract

# Frontend — unit tests
pnpm --filter @aiquaa/frontend test

# Frontend — E2E (Playwright)
pnpm --filter @aiquaa/frontend e2e

# allpairs-core (52 tests)
cd packages/allpairs-core && pnpm test:cov
```

---

## 🚢 Despliegue

### Frontend → Vercel

- Auto-deploy desde `main`
- Build: `pnpm build:vercel`
- Variables de entorno en el dashboard de Vercel

### Base de datos → Supabase

- Migraciones via MCP de Supabase o Supabase CLI

---

## 📋 ADRs

- [ADR-001: Monolito modular NestJS](./docs/adr/ADR-001-monolito-modular-nest.md)
- [ADR-002: Next.js vs Nuxt](./docs/adr/ADR-002-next-vs-nuxt.md)
- [ADR-003: OpenAPI + codegen tipos compartidos](./docs/adr/ADR-003-openapi-codegen-tipos-compartidos.md)
- [ADR-004: Redis cache con invalidación por tags](./docs/adr/ADR-004-redis-cache-invalidacion-tags.md)
- [ADR-005: Soft delete + auditoría con Prisma](./docs/adr/ADR-005-soft-delete-auditoria-prisma.md)
