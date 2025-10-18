# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIQUAA is a full-stack monorepo for a QA platform in Paraguay, featuring:
- **Backend**: NestJS API with modular architecture
- **Frontend**: Next.js 13+ with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for performance optimization
- **Observability**: Pino logging, OpenTelemetry tracing, Sentry, Prometheus metrics

## Development Commands

### Setup and Installation
```bash
pnpm install                    # Install all dependencies
make db-up                      # Start PostgreSQL + Redis (Docker)
make db-seed                    # Run Prisma migrations and seed data
```

### Development
```bash
make dev                        # Start both frontend (port 3001) and backend (port 3001)
make dev-front                  # Start only frontend
make dev-back                   # Start only backend
pnpm dev:front                  # Alternative: frontend only
pnpm dev:back                   # Alternative: backend only
```

### Testing
```bash
# Backend tests
pnpm --filter @aiquaa/backend test              # Run unit tests
pnpm --filter @aiquaa/backend test:cov          # Run with coverage
pnpm --filter @aiquaa/backend test:watch        # Watch mode
pnpm --filter @aiquaa/backend test:contract     # API contract tests
pnpm --filter @aiquaa/backend test:bdd          # BDD tests

# Frontend tests
pnpm --filter @aiquaa/frontend test             # Run tests
pnpm --filter @aiquaa/frontend test:cov         # With coverage
pnpm --filter @aiquaa/frontend e2e              # Playwright E2E tests
pnpm --filter @aiquaa/frontend e2e:report       # View E2E report

# Performance tests
pnpm perf:forum                                 # k6 performance tests

# All tests
pnpm test                       # Run all tests across workspace
pnpm test:cov                   # Coverage for all packages
```

### Database Operations
```bash
cd apps/backend
pnpm prisma:generate            # Generate Prisma client
pnpm prisma:migrate             # Run migrations
pnpm prisma:seed                # Seed database
pnpm prisma:studio              # Open Prisma Studio
```

### Build and Deploy
```bash
pnpm build                      # Build all packages
pnpm build:backend              # Build backend only
pnpm build:vercel               # Build frontend for Vercel
pnpm start:prod                 # Start backend in production mode
```

### Linting and Formatting
```bash
pnpm lint                       # Lint all packages
pnpm format                     # Format code with Prettier
```

### Observability
```bash
make observability-up           # Start Jaeger + Prometheus + Grafana
make observability-down         # Stop observability services
make dev-observability          # Start dev with full observability
make test-observability         # Test observability system
```

### Architecture Decision Records (ADRs)
```bash
pnpm adr:new "Title"            # Create new ADR
pnpm adr:list                   # List all ADRs
```

## Architecture

### Backend Structure (NestJS Modular Monolith)
The backend follows a modular monolith pattern per ADR-001. Key modules:

- **`src/auth/`**: Authentication (JWT, OAuth, 2FA) and authorization
- **`src/users/`**: User management and profiles
- **`src/forum/`**: Forum system (threads, posts, categories, tags)
- **`src/billing/`**: Stripe integration for payments
- **`src/content/`**: Content management (courses, lessons)
- **`src/cache/`**: Redis cache management with tag-based invalidation (ADR-004)
- **`src/mailer/`**: Email service using Resend
- **`src/security/`**: Rate limiting, anti-spam, helmet headers
- **`src/observability/`**: Logging, tracing, metrics middleware
- **`src/prisma/`**: Database service and Prisma client
- **`src/health/`**: Health check endpoints

### Frontend Structure (Next.js App Router)
- **`src/app/`**: Next.js 13+ App Router pages and layouts
- **`src/components/`**: Reusable React components
- **`src/contexts/`**: React Context providers (Auth, Theme, etc.)
- **`src/services/`**: API client services
- **`src/hooks/`**: Custom React hooks
- **`src/lib/`**: Utility functions and configurations
- **`src/auth.ts`**: NextAuth v5 configuration

### Database Schema
Key models in Prisma schema:
- **User**: With soft delete, OAuth accounts, refresh tokens
- **Thread/Post**: Forum system with categories and tags
- **Course/Lesson**: Educational content
- **Enrollment/Purchase**: Billing and access control
- **AuditLog**: Audit trail for all operations (ADR-005)

**Soft Delete**: All main entities use `deletedAt` timestamp instead of hard deletes (ADR-005).

### Authentication Flow
- **NextAuth v5** on frontend handles sessions and OAuth (Google, GitHub)
- **Backend JWT**: NestJS validates JWTs and manages refresh tokens
- **OAuth providers**: Google and GitHub configured in `apps/backend/src/auth/`
- **Middleware**: `apps/frontend/src/middleware.ts` protects routes like `/dashboard/*` and `/labs/*`

### Cache Strategy (ADR-004)
- **Redis** with tag-based invalidation
- Auto-invalidation on create/update/delete operations for threads and posts
- Cache keys use pattern: `forum:threads:*`, `forum:posts:*`
- TTL and max items configurable via env vars

### API Documentation
- **Swagger UI**: Available at `/api/v1/docs` (dev: http://localhost:3001/api/v1/docs)
- **OpenAPI Spec**: Auto-generated from NestJS decorators (ADR-003)
- **Type Generation**: OpenAPI types shared between frontend/backend via `@aiquaa/shared` package

## Testing Strategy

### Coverage Requirements
- **Minimum 75%** coverage for both backend and frontend
- CI/CD pipeline enforces this threshold

### Test Types
1. **Unit Tests**: Jest for backend and Vitest for frontend
2. **Contract Tests**: Validate API against OpenAPI spec (`test/contracts/`)
3. **E2E Tests**: Playwright tests (`apps/frontend/e2e/`)
   - Health checks
   - Forum CRUD flows
   - Auth flows
   - Accessibility tests (axe-core)
4. **Performance Tests**: k6 for load testing (`perf/k6/`)
   - Target: p95 < 400ms, error rate < 1%
5. **Security Tests**: Rate limiting and anti-spam validation
6. **BDD Tests**: Cucumber for behavior-driven tests

### Test Execution in CI/CD
CI runs: unit tests → contract tests → E2E tests → performance tests → build verification

## Environment Variables

### Backend Required
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
POSTGRES_URL=postgresql://...  # Direct URL for Prisma
JWT_SECRET=your-jwt-secret
NODE_ENV=development|production|test
PORT=3001
REDIS_URL=redis://localhost:6379

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Email
RESEND_API_KEY=...

# Observability (optional)
LOG_LEVEL=info|debug|warn|error
OTLP_ENDPOINT=http://localhost:4318
SENTRY_DSN=...
```

### Frontend Required
```bash
FRONTEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3001

# OAuth (same as backend)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Registration control
NEXT_PUBLIC_DISABLE_REGISTRATION=false|true
ALLOWED_DOMAIN=domain.com  # When registration disabled

# Observability
NEXT_PUBLIC_SENTRY_DSN=...
```

## Observability Endpoints

- **API Docs**: http://localhost:3001/api/v1/docs
- **OpenAPI JSON**: http://localhost:3001/api/v1/docs-json
- **Health Check**: http://localhost:3001/health
- **Metrics**: http://localhost:3001/metrics (Prometheus format)
- **Jaeger UI**: http://localhost:16686 (when observability stack is running)
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

## Labs

### All Pairs Generator (`/labs/allpairs`)

A web-based pairwise test generation tool:

**Location**: `apps/frontend/src/app/labs/allpairs/`

**Core Package**: `packages/allpairs-core/` - TypeScript pairwise algorithm

**Features**:
- Visual parameter editor
- JSON/YAML input support
- CSV export functionality
- Example datasets
- Pagination for large result sets
- LocalStorage persistence

**Testing**:
```bash
# Core package tests
cd packages/allpairs-core && pnpm test:cov

# E2E tests
pnpm --filter @aiquaa/frontend e2e -- allpairs
```

**Documentation**: See `docs/tools/allpairs.md` for complete usage guide

## Important Patterns and Conventions

### Adding New Features
1. Create feature module in backend (`src/<feature>/`)
2. Add Swagger decorators to controllers for API docs
3. Update Prisma schema if database changes needed
4. Run `pnpm prisma:migrate` to create migration
5. Add tests (unit, contract, e2e as needed)
6. Update corresponding frontend service in `apps/frontend/src/services/`

### API Contract Changes
When modifying API endpoints:
1. Update NestJS controller with proper Swagger decorators
2. Run backend to regenerate OpenAPI spec
3. Contract tests will validate the spec
4. Frontend types auto-sync via OpenAPI spec (ADR-003)

### Database Changes
1. Modify `apps/backend/prisma/schema.prisma`
2. Run `pnpm --filter @aiquaa/backend prisma:migrate` (creates migration)
3. Migration files are in `apps/backend/prisma/migrations/`
4. Always use soft delete pattern (`deletedAt` field) for main entities
5. Add audit logging for sensitive operations

### Logging Best Practices
- Use structured logging with Pino: `logger.info({ context }, 'message')`
- Request IDs are automatically added to all logs
- Use appropriate log levels: trace/debug/info/warn/error
- Logs are sent to Seq (configured via `LOG_LEVEL` and Seq endpoint)

### Cache Invalidation
- Cache auto-invalidates on mutations (create/update/delete)
- Manual invalidation: `cacheService.invalidateByTag('forum:threads')`
- Use patterns for bulk invalidation: `forum:threads:*`

## Git Workflow

- **Main branch**: `main` (protected)
- **Feature branches**: Create from `main`, PR back to `main`
- **Commit conventions**: Commitizen + Conventional Commits (husky pre-commit hooks)
- **Pre-commit**: Runs lint-staged (linting + formatting)

## Deployment

### Frontend (Vercel)
- Auto-deploys from `main` branch
- Build command: `pnpm build:vercel`
- Environment variables configured in Vercel dashboard

### Backend (Railway)
- Deployed via `railway.toml` configuration
- Build command: `pnpm --filter @aiquaa/backend build`
- Start command: `pnpm start:prod`
- Environment variables configured in Railway dashboard

## Definition of Done (for PRs)

A PR is complete when:
1. All tests pass: `pnpm test:cov` (backend and frontend)
2. Contract tests pass: `pnpm test:contract`
3. E2E tests pass: `pnpm e2e`
4. Performance tests meet thresholds: `pnpm perf:forum` (p95 < 400ms, error < 1%)
5. Coverage ≥ 75% for both backend and frontend
6. Linting passes: `pnpm lint`
7. Build succeeds: `pnpm build`
8. No accessibility violations (critical) in E2E tests

## Common Issues and Solutions

### Database Connection Issues
- Ensure PostgreSQL is running: `make db-up`
- Check `DATABASE_URL` in `.env`
- Verify migrations: `cd apps/backend && pnpm prisma:migrate`

### Redis Connection Issues
- Ensure Redis is running (included in `docker-compose.yml`)
- Check `REDIS_URL` environment variable
- Cache failures are logged but don't break the app

### OAuth Issues
- Verify callback URLs match in provider settings
- Google: `https://your-domain/api/auth/callback/google`
- GitHub: `https://your-domain/api/auth/callback/github`
- Check client IDs and secrets in environment variables

### CORS Errors
- Allowed origins configured in `apps/backend/src/main.ts`
- Add new origins to the allowlist for development or production
- Pattern matching supported for Vercel preview deployments

### Build Failures
- Run `pnpm install` to ensure dependencies are up to date
- Clear build cache: `pnpm build` or `make clean && pnpm install`
- Check for TypeScript errors: `pnpm --filter @aiquaa/backend build`
