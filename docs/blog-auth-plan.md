# Plan de implementación para login y blogs en AIQUAA

Este plan describe cómo adaptar las ideas del proyecto de referencia [RajAditya01/FullStack-Blogs](https://github.com/RajAditya01/FullStack-Blogs) para mejorar la autenticación, las conexiones a base de datos y la experiencia de blogs dentro del monorepo de AIQUAA. Se organiza en fases para coordinar cambios entre el backend en NestJS, el frontend en Next.js y la infraestructura de base de datos basada en PostgreSQL y Prisma.

## 1. Evaluación y alineación inicial

1. **Auditoría del estado actual en AIQUAA**
   - Revisar los módulos de autenticación (`apps/backend/src/auth/auth.module.ts`, `apps/backend/src/auth/auth.service.ts`) y usuarios (`apps/backend/src/users/users.service.ts`) para entender flujos, DTOs y políticas de seguridad existentes.【F:apps/backend/src/auth/auth.module.ts†L1-L40】【F:apps/backend/src/auth/auth.service.ts†L1-L120】【F:apps/backend/src/users/users.service.ts†L1-L60】
   - Identificar los componentes de frontend que gestionan el estado de sesión o llamadas al backend, en especial dentro de `apps/frontend/src/app` y `apps/frontend/src/modules` (layout, providers, hooks de sesión y formularios).【F:apps/frontend/src/app/layout.tsx†L1-L120】
   - Revisar el esquema de Prisma actual para mapear entidades disponibles (usuarios, posts del foro, cursos) y detectar campos reutilizables en la futura experiencia de blogs.【F:apps/backend/prisma/schema.prisma†L1-L220】

2. **Mapeo del repositorio de referencia**
   - Documentar patrones de la app FullStack-Blogs: estructura de modelos (Posts, Users, Comments), middleware de autenticación y flujos de login/signup (por ejemplo JWT con cookies HttpOnly, refresh tokens, validaciones con Zod/Joi).
   - Registrar componentes UI clave (formularios de login/register, editor de posts, listados con paginación) para reutilizar ideas de UX e interacciones.
   - Identificar integraciones de base de datos (ORM utilizado, migraciones) y endpoints REST/GraphQL disponibles para replicar en NestJS.

3. **Definición de alcance**
   - Alinear con stakeholders qué funcionalidades mínimas son necesarias para lanzar la sección de blogs (creación/edición de posts, comentarios, likes, búsquedas, permisos).
   - Establecer métricas de éxito (ej. tiempo de autenticación < 1s, tiempo de respuesta de endpoints de blogs < 300 ms, porcentaje de registro completado) en sintonía con los KPIs definidos para la plataforma.【F:docs/dashboard-kpis.md†L1-L120】

## 2. Diseño de dominio y base de datos

1. **Modelo de datos**
   - Extender `schema.prisma` con nuevas entidades específicas de blog (`BlogPost`, `BlogCategory`, `BlogTag`, `BlogComment`, `BlogReaction`) reutilizando relaciones y convenciones de soft-delete existentes.【F:apps/backend/prisma/schema.prisma†L13-L150】
   - Diseñar índices para consultas frecuentes (búsqueda por slug, autor, etiquetas) y campos de auditoría (`createdAt`, `updatedAt`, `deletedAt`).
   - Preparar migraciones de Prisma para ambientes `dev` y `prod`, incluyendo seeds iniciales (categorías base, usuario administrador) inspiradas en las semillas del foro (`seed-forum.ts`).【F:apps/backend/prisma/seed-forum.ts†L1-L160】

2. **Conectividad y configuración**
   - Validar que las variables de entorno necesarias (`DATABASE_URL`, `POSTGRES_URL`, credenciales de Supabase si aplica) estén definidas en los archivos `.env` compartidos y pipelines CI/CD.【F:env.example†L25-L76】
   - Actualizar los scripts de Docker y `Makefile` para garantizar que los servicios PostgreSQL/Redis estén disponibles para las pruebas integrales de blogs.【F:Makefile†L1-L160】
   - Incorporar nuevos seeds y migraciones en los pipelines de despliegue (Railway/Vercel) descritos en la documentación existente.【F:DEPLOYMENT.md†L1-L160】【F:DEPLOY_BACKEND_RAILWAY.md†L1-L160】

## 3. Backend: autenticación y endpoints de blogs

1. **Refactor de autenticación**
   - Evaluar la reutilización o refactor de la estrategia actual (JWT + refresh tokens) para alinearse con las buenas prácticas observadas en FullStack-Blogs (ej. validación de contraseñas, flujos de reseteo, verificación de correo).【F:apps/backend/src/auth/auth.service.ts†L1-L160】
   - Incorporar pruebas unitarias y e2e para los flujos de login y registro usando las configuraciones Jest existentes (`jest.config.ts`, `jest.e2e.config.ts`).【F:apps/backend/jest.config.ts†L1-L160】
   - Revisar los guardias existentes (por ejemplo, `AntiSpamGuard`, `RateLimitGuard`) para asegurar que cubran los nuevos endpoints de blogs y mantengan compatibilidad con OAuth (Google/GitHub) si se habilita.【F:apps/backend/src/security/anti-spam.guard.ts†L1-L80】【F:apps/backend/src/security/rate-limit.guard.ts†L1-L160】

2. **Módulo de blogs**
   - Crear un nuevo módulo NestJS (`apps/backend/src/blog`) que exponga controladores REST (o GraphQL, si se adopta) para CRUD de posts, gestión de categorías/etiquetas y comentarios, tomando como referencia la API del proyecto FullStack-Blogs.
   - Implementar servicios con Prisma Client para las nuevas entidades, asegurando transacciones y paginación consistente con las utilidades existentes como el decorador de roles en `apps/backend/src/common/decorators/roles.decorator.ts`.【F:apps/backend/src/common/decorators/roles.decorator.ts†L1-L40】
   - Integrar eventos de auditoría (registro en `AuditLog`) y métricas de observabilidad (traces OpenTelemetry, logs con `LoggerModule`).【F:apps/backend/src/logger/http.logger.ts†L1-L20】【F:docs/observability.md†L1-L200】

3. **Seguridad y validación**
   - Reutilizar pipes de validación global y DTOs con `class-validator`/`class-transformer` para sanitizar entradas.
   - Añadir rate limiting y protección CSRF si se expone login vía navegador, alineado con las recomendaciones en `SECURITY.md`.【F:SECURITY.md†L1-L200】

## 4. Frontend: experiencia de login y blogs

1. **Autenticación en Next.js**
   - Integrar el flujo de login/registro inspirado en FullStack-Blogs dentro del App Router de Next.js (`apps/frontend/src/app/login`), reutilizando componentes y estilos existentes (Tailwind).【F:apps/frontend/src/app/login/page.tsx†L1-L40】
   - Implementar proveedores de contexto o hooks (`useSession`) que consuman los endpoints del backend, gestionen tokens (almacenamiento seguro, refresco) y actualicen el layout global (navbar, menús, etc.).【F:apps/frontend/src/app/layout.tsx†L1-L160】
   - Ajustar middlewares (`middleware.ts`) para proteger rutas privadas y redirigir a usuarios autenticados, siguiendo los patrones ya implementados para otras secciones.【F:apps/frontend/middleware.ts†L1-L160】

2. **Módulos de blogs**
   - Crear páginas para listado de blogs, detalle, creación/edición y gestión de comentarios bajo `apps/frontend/src/app/(blogs)` reutilizando componentes de diseño y las prácticas vistas en FullStack-Blogs (por ejemplo, editores enriquecidos, paginación lado servidor).
   - Añadir componentes compartidos (tarjetas, badges, skeletons) dentro de `apps/frontend/src/components`, aprovechando patrones existentes como el layout general.【F:apps/frontend/src/components/Layout.tsx†L1-L40】
   - Implementar llamados a la API mediante fetchers reutilizables (`apps/frontend/src/lib/api`), manejando estados de carga, errores y revalidación con React Query o SWR, según se defina en el plan técnico.

3. **Accesibilidad y SEO**
   - Configurar metadatos dinámicos para blogs (OpenGraph, JSON-LD) aprovechando utilidades existentes (`next-sitemap.config.js`) y las guías de `SEO_IMPLEMENTATION.md`.【F:SEO_IMPLEMENTATION.md†L1-L200】
   - Garantizar que formularios y componentes cumplan con criterios de accesibilidad (labels, focus management) ya establecidos en otras mejoras de UX.【F:MEJORAS_UX_IMPLEMENTADAS.md†L1-L200】

## 5. Pruebas y calidad

1. **Cobertura automatizada**
   - Extender suites de Vitest/Playwright en el frontend (`apps/frontend/vitest.config.ts`, `apps/frontend/e2e`) con escenarios de login, creación y visualización de blogs.【F:apps/frontend/vitest.config.ts†L1-L160】
   - Añadir pruebas de integración en el backend utilizando supertest sobre los endpoints del módulo de blogs y los flujos de autenticación.
   - Configurar pipelines CI para ejecutar pruebas end-to-end utilizando los scripts disponibles en `test-api-endpoints.cjs` y `test-auth.sh`, incorporando nuevos casos para blogs.【F:test-api-endpoints.cjs†L1-L160】【F:test-auth.sh†L1-L160】

2. **Monitoreo continuo**
   - Asegurar que los dashboards de observabilidad incorporen métricas de uso de blogs (conteo de posts creados, latencia de endpoints, errores) y alertas en Prometheus/Grafana.【F:docs/observability.md†L1-L200】
   - Revisar logs estructurados para capturar fallos de login y validaciones de base de datos en tiempo real.【F:apps/backend/src/logger/http.logger.ts†L1-L20】

## 6. Despliegue y retroalimentación

1. **Despliegue gradual**
   - Preparar feature flags o rutas beta para liberar el módulo de blogs a un subconjunto de usuarios, aprovechando la infraestructura actual de Railway y Vercel.【F:VERCEL_DEPLOYMENT.md†L1-L200】
   - Actualizar `DEPLOYMENT.md` y guías relacionadas con pasos específicos para ejecutar migraciones de blogs en producción y rollback seguro.【F:DEPLOYMENT.md†L1-L160】

2. **Documentación y capacitación**
   - Agregar documentación en `docs/adr` con decisiones arquitectónicas clave (p.ej., elección de JWT vs. OAuth para blogs) y actualizar manuales de onboarding.
   - Preparar guías de uso para usuarios finales (cómo crear posts, moderar comentarios) y equipos internos (soporte, QA) apoyándose en los flujos descritos en `LABS_IMPLEMENTATION.md` y `FEEDBACK_SYSTEM.md`.【F:LABS_IMPLEMENTATION.md†L1-L200】【F:FEEDBACK_SYSTEM.md†L1-L200】

3. **Retroalimentación continua**
   - Establecer un bucle de feedback posterior al lanzamiento usando el sistema existente (formularios, analítica) para iterar sobre el login y las funcionalidades de blogs.
   - Programar revisiones periódicas de seguridad y performance enfocadas en la autenticación y consultas de base de datos, alineadas con las prácticas de `SECURITY.md`.

---

Siguiendo estas fases se integrarán las mejores prácticas observadas en FullStack-Blogs dentro del ecosistema de AIQUAA, garantizando un login robusto, conexiones a base de datos confiables y una experiencia completa de blogs para los usuarios.
