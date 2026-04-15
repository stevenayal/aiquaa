# AIQUAA

Plataforma educativa y de herramientas para la comunidad QA en Paraguay.

---

## ¿Cómo funciona AIQUAA hoy?

AIQUAA es una aplicación **Next.js desplegada en Vercel** que usa **Supabase** como backend-as-a-service (base de datos, autenticación y storage). No existe un servidor backend propio en producción.

```
Browser
  └── Next.js (Vercel)
        ├── App Router + Server Components
        ├── Server Actions  →  Supabase (PostgreSQL + Auth + Storage)
        ├── API Routes      →  GitHub API / AWS SES SMTP
        └── Client Components (React)
```

### Stack de producción

| Capa | Tecnología |
|---|---|
| Frontend + SSR | Next.js 13 (App Router) en Vercel |
| Base de datos | Supabase PostgreSQL |
| Autenticación | Supabase Auth (email/password con verificación) |
| Email | AWS SES SMTP via nodemailer |
| Bug reports | GitHub Issues via Octokit |
| Cache API externa | `next: { revalidate }` en fetch calls |

### NestJS — solo desarrollo local

El directorio `apps/backend/` contiene una API NestJS con Prisma que se usa únicamente en desarrollo local. **No está desplegado en producción.** Si quieres correrlo localmente para explorar o hacer pruebas, sigue las instrucciones de la sección [Desarrollo local](#-desarrollo-local).

---

## Funcionalidades actuales

### Autenticación
- Registro con email y verificación por link (SES SMTP)
- Login con email y contraseña
- Reset de contraseña por email
- Rutas protegidas via middleware (`/labs/*`, `/perfil`)

### Laboratorios (Labs)

Todos los exámenes requieren cuenta y guardan resultados en Supabase (`exam_results`).

| Lab | Descripción |
|---|---|
| **ISTQB CTFL v4.0** | Simulacro de 40 preguntas, modo examen y entrenamiento |
| **Examen GIT** | Evaluación técnica de control de versiones |
| **Performance Testing** | Examen sobre fundamentos y herramientas de performance |
| **All Pairs** | Generador de combinaciones pairwise para diseño de pruebas |
| **Test App** | App ficticia con bugs intencionales para ejercitar exploración |
| **Cron Validator** | Validador y explicador de expresiones cron |
| **JSON Validator** | Validador y formateador de JSON |
| **YAML Validator** | Validador de YAML |
| **JWT Decoder** | Decodificador de tokens JWT |
| **Risk Matrix** | Matriz de riesgo para planificación de pruebas |
| **Req Lint** | Análisis de calidad de requerimientos |
| **Checklist** | Generador de checklists de pruebas |
| **Data Generator** | Generador de datos de prueba |

### Ranking
- Leaderboard por tipo de examen: **GIT**, **ISTQB**, **Performance**
- Tab **Reportadores**: lista de usuarios que abrieron issues en el repositorio de GitHub, con conteo de issues abiertos/resueltos y links directos

### Foro
- Categorías, hilos y posts gestionados directamente en Supabase
- RLS (Row Level Security) para control de acceso
- Categorías precargadas al iniciar el proyecto

### Comunidad
- Página de comunidad con timeline de hitos, eventos pasados y sección de YouTube
- Integración con GitHub Issues y Discussions
- Widget de reporte de bugs (crea issues en GitHub automáticamente)

### Ideas Board
- Los usuarios pueden proponer y votar ideas para la plataforma

### Perfil
- Historial de exámenes del usuario con scores, fechas y estado aprobado/reprobado
- Actualización de avatar

---

## 📁 Estructura del monorepo

```
aiquaa/
├── apps/
│   ├── frontend/          # Next.js 13 — app de producción (Vercel)
│   │   └── src/
│   │       ├── app/       # Páginas y API routes (App Router)
│   │       ├── actions/   # Server Actions (Supabase)
│   │       ├── components/
│   │       ├── contexts/
│   │       ├── hooks/
│   │       ├── lib/       # Clientes Supabase, utilidades
│   │       └── services/
│   └── backend/           # NestJS + Prisma — solo desarrollo local
├── packages/
│   ├── allpairs-core/     # Algoritmo pairwise (TypeScript puro)
│   └── shared/            # Tipos compartidos
├── docs/
│   └── adr/               # Architecture Decision Records
└── Makefile
```

---

## 🚀 Desarrollo local

### Requisitos

- Node.js 20+
- pnpm 9+
- Cuenta en [Supabase](https://supabase.com) (o proyecto existente)

### Frontend (producción-equivalente)

```bash
pnpm install

# Configurar variables de entorno del frontend
cp apps/frontend/.env.local.example apps/frontend/.env.local
# Editar con tus claves de Supabase

# Iniciar frontend (puerto 3001)
make dev-front
# o
pnpm dev:front
```

### Variables de entorno — Frontend

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # solo servidor

# Email (AWS SES SMTP)
SES_SMTP_HOST=email-smtp.<region>.amazonaws.com
SES_SMTP_PORT=587
SES_SMTP_USER=<iam-smtp-user>
SES_SMTP_PASS=<iam-smtp-password>
SES_FROM_EMAIL=noreply@tudominio.com

# URLs
NEXT_PUBLIC_SITE_URL=https://tuapp.vercel.app
FRONTEND_URL=https://tuapp.vercel.app

# Bug reports
GITHUB_TOKEN=<personal-access-token>
GITHUB_REPO=owner/repo

# Registro
NEXT_PUBLIC_DISABLE_REGISTRATION=false
```

### Backend NestJS (opcional, solo local)

Solo necesario si quieres explorar o probar la API NestJS localmente:

```bash
# Requiere Docker para PostgreSQL y Redis
make db-up
make db-seed

# Iniciar backend (puerto 3000)
make dev-back
```

Variables adicionales para el backend:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/aiquaa
JWT_SECRET=tu-jwt-secret
PORT=3000
REDIS_URL=redis://localhost:6379
```

---

## 🗄️ Base de datos (Supabase)

Las tablas principales en producción:

| Tabla | Descripción |
|---|---|
| `profiles` | Perfil público del usuario (display_name, avatar_url) |
| `exam_results` | Resultados de exámenes (ISTQB, GIT, Performance) |
| `forum_categories` | Categorías del foro |
| `forum_threads` | Hilos del foro |
| `forum_posts` | Posts/respuestas del foro |

### RLS
Todas las tablas tienen Row Level Security activo. Los usuarios solo pueden leer/escribir sus propios registros donde corresponde.

### Funciones RPC
- `get_leaderboard(p_exam_type, p_limit)` — ranking por tipo de examen
- `increment_thread_views(thread_id)` — vistas de hilos
- `increment_thread_replies(thread_id)` — conteo de respuestas

---

## 📧 Emails

Solo se envían dos tipos de emails vía AWS SES SMTP:

1. **Verificación de cuenta** — al registrarse
2. **Reset de contraseña** — al solicitar cambio de clave

No se envían emails de exámenes, notificaciones de foro ni bienvenida.

---

## 🧪 Pruebas

```bash
# Tests unitarios backend
pnpm --filter @aiquaa/backend test

# Tests unitarios frontend
pnpm --filter @aiquaa/frontend test

# Tests del paquete allpairs-core (52 tests)
cd packages/allpairs-core && pnpm test:cov

# E2E con Playwright
pnpm --filter @aiquaa/frontend e2e
```

---

## 🚢 Despliegue

### Frontend → Vercel
- Auto-deploy desde rama `main`
- Comando de build: `pnpm build:vercel`
- Variables de entorno configuradas en el dashboard de Vercel

### Base de datos → Supabase
- Migraciones aplicadas via MCP de Supabase o Supabase CLI
- No se usa Prisma en producción

---

## 📋 ADRs

- [ADR-001: Monolito modular NestJS](./docs/adr/ADR-001-monolito-modular-nest.md)
- [ADR-002: Next.js vs Nuxt](./docs/adr/ADR-002-next-vs-nuxt.md)
- [ADR-003: OpenAPI + codegen tipos compartidos](./docs/adr/ADR-003-openapi-codegen-tipos-compartidos.md)
- [ADR-004: Redis cache con invalidación por tags](./docs/adr/ADR-004-redis-cache-invalidacion-tags.md)
- [ADR-005: Soft delete + auditoría con Prisma](./docs/adr/ADR-005-soft-delete-auditoria-prisma.md)
