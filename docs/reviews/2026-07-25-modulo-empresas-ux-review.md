# Revisión UX — Módulo de Empresas
**Fecha:** 25 de julio de 2026
**Ciclo:** Mejora continua · 60 min (ciclo #2)
**Reviewer:** QA Lead (revisión de código + inspección de datos de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Este ciclo combina revisión estática del código (Next.js Server Actions + Supabase, no NestJS/Prisma — ver nota de arquitectura abajo) con **consultas directas al proyecto Supabase de producción** (`aiquaa` / `cbkctkpyxwbufvbwxogp`) para verificar qué está realmente en uso, y con `get_advisors` para postura de seguridad. No hubo sesión de browser interactiva como recruiter logueado (sin credenciales ni URL de producción confirmada en el repo) — todo hallazgo de UI está anclado a líneas de código específicas, no a click-through real. Se marca explícitamente cuando un hallazgo viene de datos reales de producción vs. de código.

> **Nota de arquitectura:** El brief de este ciclo asume un backend NestJS + Prisma. Eso no existe en este repo. La arquitectura real es **Next.js Server Actions + Supabase (Postgres/RLS)**. Los ADRs 001 y 005 (monolito Nest + Prisma) describen un plan de diciembre 2024 nunca implementado — no deben usarse como referencia de "qué existe hoy".

> **Comparación con ciclo anterior:** Existe una revisión previa (`docs/reviews/2026-06-27-modulo-empresas-ux-review.md`). De sus 5 hallazgos críticos, **4 de 5 ya están resueltos en código** (ver sección de cierre). Este documento se enfoca en verificar esos fixes contra datos reales y en hallazgos nuevos.

---

## 🏢 Bloque 1 — Perfil de empresa

### Verificación contra ciclo anterior

Los campos de employer branding que el ciclo anterior marcó como faltantes (**A**, "Faltan campos clave en perfil de empresa") **ya existen en schema y UI**: `tech_stack`, `work_mode`, `benefits`, `linkedin_url` están en la tabla `empresas` y son editables en `apps/frontend/src/app/empresa/perfil/page.tsx` (líneas 89, 126-152, 586-730). Contador de caracteres agregado para `benefits` (`{form.benefits.length}/500`, línea 720).

### 🚨 Hallazgo nuevo, con evidencia de producción

Consulté la tabla `empresas` en el proyecto Supabase de producción. Hay **3 empresas registradas en total**, y una de ellas es **CLT — el cliente piloto objetivo de este ciclo**:

| id | nombre_comercial | profile_views | tech_stack | work_mode | benefits | linkedin_url |
|---|---|---|---|---|---|---|
| 765269d3-… | **CLT** | 0 | `null` | `null` | ausente | ausente |
| c409526c-… | Aiquaa | 0 | `null` | `null` | ausente | ausente |
| 398c9feb-… | AIQUAA | 0 | `null` | `null` | ausente | ausente |

**El perfil de CLT en producción está vacío** — ninguno de los campos de employer branding que este mismo ciclo iba a pedir está completado, y `profile_views = 0`. Esto no es un problema de código: la funcionalidad existe y funciona. Es un gap de **activación**: nadie completó el perfil del cliente piloto real. Además hay **dos empresas duplicadas** ("Aiquaa" y "AIQUAA") en la base — apenas cosmético hoy, pero si el directorio público `/empresas` las lista tal cual, un candidato ve una plataforma con datos de prueba sin limpiar.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Perfil de CLT (piloto) vacío en producción | Cero campos de employer branding completados, 0 visitas | **CRÍTICO** 🚀 | Acción operativa, no de código: completar el perfil de CLT antes de cualquier demo | Roto (dato real) |
| Empresas duplicadas "Aiquaa" / "AIQUAA" en prod | Ensucia el futuro directorio público | **M** | Eliminar/consolidar entradas de prueba antes de exponer `/empresas` a candidatos reales | Bug de datos |
| URL pública del perfil | Sigue siendo UUID (`params: Promise<{ id: string }>`, `apps/frontend/src/app/empresas/[id]/page.tsx:41`), sin slug | **A** | Generar slug desde `nombre_comercial` con fallback a UUID | Incompleto (sin cambios desde el ciclo anterior) |
| Completitud por defecto | `country: 'PY'` sigue precargado (`empresa/perfil/page.tsx:124`) — completitud falsa desde el registro | **B** | Calcular completitud solo tras guardado explícito del usuario | Incompleto (sin cambios) |
| Stack tecnológico / modalidad / beneficios / LinkedIn | Ya implementado y editable | — | — | ✅ Resuelto desde el ciclo anterior |
| Contador de caracteres en `benefits` | Implementado (`{n}/500`) | — | — | ✅ Resuelto |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Verificación contra ciclo anterior

Cuatro de los hallazgos marcados 🚀 en el ciclo anterior están **resueltos en código**:
- **Filtro por país**: existe (`empresa/candidatos/page.tsx:1193`, dropdown "Todos los países" + `filterCountry`).
- **Etiquetas ISTQB legibles**: `ISTQB_LEVEL_LABELS` mapea `ctfl` → `"Foundation Level (CTFL)"` (línea 85) en vez de mostrar el código crudo.
- **Exportar CSV**: botón "📥 Exportar CSV" funcional (línea 1215-1218).
- **Comparación de candidatos**: existe selección múltiple y panel de comparación (`selectedForComparison.length >= 2`, línea 1055).

### Gaps que persisten

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Tooltips explicativos por nivel ISTQB | Solo se expandió el label (`ctfl` → `Foundation Level (CTFL)`) | Un recruiter de RRHH sin trasfondo QA sigue sin saber qué diferencia hay entre Foundation y Advanced | Agregar tooltip con 1 línea de descripción por nivel | **M** (bajó de A a M — el label ya ayuda) |
| Botón "Invitar" inline en ficha de candidato del directorio de Talento | No verificado en este ciclo — no se encontró en el rango de código revisado | El flujo de invitar sigue potencialmente fragmentado | Confirmar en próximo ciclo con click-through real | **A** (pendiente de re-verificar) |
| Límite hardcodeado en `exam_results` | No re-verificado este ciclo | Riesgo de truncar resultados silenciosamente al crecer | Re-confirmar límite y agregar alerta o paginación real | **M** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### 🐛 Bug confirmado, sin resolver desde el ciclo anterior

`section_scores` sigue forzado a `null` para resultados que vienen de `assessment_attempts`:

```ts
// apps/frontend/src/actions/employer.ts:417-418
section_scores: null,
learning_objectives: null,
```

Esto alimenta el dashboard (`empresa/page.tsx`), `empresa/procesos/*` y `empresa/eventos/*`. **Inconsistencia nueva detectada este ciclo:** `apps/frontend/src/app/empresa/candidatos/page.tsx:316` **sí** obtiene `section_scores` correctamente (`sectionScoresByAttempt[row.id] ?? null`) para la misma tabla `assessment_attempts`. Es decir, ya existe el código que resuelve esto — simplemente no se replicó a `employer.ts`. Es un fix de bajo esfuerzo: portar la misma lógica de `candidatos/page.tsx` a `fetchAssessmentAttemptsForProcessCodes` en `employer.ts`.

### ✅ Resuelto desde el ciclo anterior

- **Notificación a la empresa al completar evaluación**: `notifyEmpresaExamCompleted()` (`empresa-result-notifications.ts`) está conectada en ambos puntos de envío de examen (`actions/exams.ts:161` y `api/assessments/[attemptId]/submit/route.ts:204`), envía email a miembros `owner`/`admin` activos vía Resend. Esto invalida el hallazgo "Roto" del ciclo anterior.

### 🚨 Hallazgo nuevo, con evidencia de producción: el flujo de invitación nunca se usó

La tabla `empresa_invitaciones` en producción tiene **0 filas**. El ciclo anterior marcó como bug crítico "invitaciones sin email"; ese código ya fue arreglado (`empresa-invitaciones.ts` tiene integración Resend completa con `sendInvitacionEmailIfEnabled`), pero **nadie lo ha probado ni usado en producción todavía** — ni siquiera para QA interno. Dos causas posibles, no verificables desde este entorno:
1. `EMAIL_SENDING_ENABLED` es un flag por string (`process.env.EMAIL_SENDING_ENABLED === 'true'`, `empresa-invitaciones.ts:6`) que **no está documentado en ningún `.env.example`** del repo — es fácil que quede sin setear en Vercel y el flujo falle en silencio (`email_error: 'EMAIL_SENDING_ENABLED is not true'`, guardado en DB pero sin alerta visible).
2. El flujo simplemente no ha sido descubierto/usado por las 3 empresas registradas (coherente con que `empresa_pruebas` también tiene 0 filas — las pruebas propias de empresa tampoco se usaron nunca).

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Invitar candidato + email | Completo en código, **0 usos reales** | Sin verificación end-to-end en producción; flag no documentado | Documentar `EMAIL_SENDING_ENABLED` en `.env.local.example`, confirmar que está `true` en Vercel prod, y hacer una prueba real antes de la demo a CLT | **CRÍTICO** 🚀 |
| Notificación a empresa al completar evaluación | ✅ Completo y conectado | — | — | Resuelto |
| Desglose `section_scores` en dashboard/procesos | Roto (inconsistente con `candidatos/page.tsx`) | Recruiter no ve por qué área falló el candidato fuera de la vista de Talento | Portar el fetch de `section_scores` de `candidatos/page.tsx` a `employer.ts` | **A** |
| `empresa_pruebas` (evaluaciones propias de la empresa) | Existe en schema, **0 filas en producción** | Feature nunca probada end-to-end | Verificar con click-through real en el próximo ciclo | **M** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### ✅ Resuelto desde el ciclo anterior (verificado en código, `employer.ts:575-645`)

- **Funnel de invitaciones** (enviadas → vistas → completadas, `InvitacionesFunnel` con `tasaRespuesta`) — implementado.
- **Perfil visto por candidatos** — `profile_views` se incrementa vía RPC `increment_empresa_profile_views` desde `empresas/[id]/page.tsx:56` y se muestra en el dashboard.
- **Tasa de respuesta a invitaciones** — calculada como `completadas / total * 100` en el mismo funnel.

Las tres métricas que el ciclo anterior marcó como "Crítico faltante" 🚀 ya están implementadas. Dado que `empresa_invitaciones` tiene 0 filas en producción, **estos widgets están construidos pero nunca se han visto con datos reales** — vale la pena una verificación visual (¿el estado vacío del funnel se ve bien con 0/0/0, o se rompe la división?).

### Gaps que persisten

| Métrica/widget | Existe | Problema UX | Propuesta | Valor |
|---|---|---|---|---|
| Top skills QA disponibles este mes | No | Oportunidad de market intelligence sin explotar | Widget de skills más evaluados en la plataforma | Medio |
| Comparación proceso-a-proceso (pass rate, avg score) | No verificado este ciclo | — | Re-confirmar en próximo ciclo | Alto |
| División de `funnelTotal > 0` en `tasaRespuesta` | Código correcto (`funnelTotal > 0 ? ... : 0`) | — | Sin riesgo de división por cero — verificado | Bueno |

---

## 🔒 Hallazgo transversal: postura de seguridad (relevante para Banco Continental)

`get_advisors` sobre el proyecto de producción reporta **funciones `SECURITY DEFINER` invocables directamente vía `/rest/v1/rpc/...` por el rol `anon`** (sin login), incluyendo dos del módulo de empresas:

- `get_invitacion_by_token(p_token uuid)` — invocable por `anon`. Es intencional (el candidato invitado no está logueado), pero debe confirmarse que la función **no filtra más que lo necesario** (nombre del proceso, no datos de otros candidatos).
- `increment_empresa_profile_views(p_empresa_id uuid)` — invocable por `anon`, sin rate-limit visible en el código (`empresas/[id]/page.tsx:56` la llama en cada carga de página). Riesgo: cualquiera puede inflar `profile_views` con un script simple, contaminando la métrica que el dashboard va a mostrarle a la empresa como KPI de negocio.
- `current_user_is_empresa()` invocable por `anon` — a confirmar si tiene sentido fuera de sesión autenticada.

Ninguno es explotable de forma catastrófica hoy, pero **para un piloto bancario (Banco Continental)**, un security review formal de estas funciones antes del pitch es razonable — son exactamente el tipo de hallazgo que un equipo de seguridad de un banco va a encontrar en su propia auditoría.

También activo: `auth_leaked_password_protection` deshabilitado a nivel de Supabase Auth — no específico del módulo Empresas, pero vale mencionarlo dado el contexto bancario.

---

## ✅ Cierre & registro del ciclo

### Top 5 hallazgos de este ciclo

1. **🚨 El perfil de CLT (cliente piloto) está vacío en producción** — 0% de employer branding completado, 0 visitas. La funcionalidad para arreglarlo ya existe; es una acción operativa, no de desarrollo. Tipo: **gap operativo/de activación**. 🚀
2. **🚨 El flujo de invitación por email nunca se usó en producción** (`empresa_invitaciones` = 0 filas) pese a estar arreglado en código desde el ciclo anterior — el flag `EMAIL_SENDING_ENABLED` no está documentado y su estado en producción no puede confirmarse desde este entorno. Tipo: **riesgo operativo / posible bug de configuración**. 🚀
3. **🐛 `section_scores` sigue null en el dashboard/procesos** (`employer.ts:417`) pese a que la misma lógica ya está resuelta en `candidatos/page.tsx` — fix de bajo esfuerzo, solo falta portarlo. Tipo: **bug de implementación** (inconsistencia entre dos rutas de código).
4. **🔒 `increment_empresa_profile_views` es invocable sin autenticación y sin rate-limit** — la métrica que el dashboard le va a vender a la empresa como KPI (visitas al perfil) puede inflarse artificialmente. Tipo: **bug de seguridad/integridad de datos**.
5. **⚠️ Empresas duplicadas de prueba ("Aiquaa"/"AIQUAA") visibles en el futuro directorio público** — limpieza de datos pendiente antes de exponer `/empresas` a candidatos reales. Tipo: **gap operativo**.

### Buenas noticias: progreso real desde el ciclo anterior

4 de los 5 hallazgos críticos del 27 de junio están resueltos en código y verificados en este ciclo: employer branding fields, filtro de país, CSV export, comparación de candidatos, notificación a empresa, funnel de invitaciones, profile views — todo implementado. El equipo avanzó rápido en un mes.

### Bloqueantes reales para el piloto (CLT / Banco Continental), en base a evidencia de producción

1. El perfil de CLT necesita completarse manualmente antes de cualquier demo — la feature funciona, los datos no están cargados.
2. El flujo de invitación por email debe probarse end-to-end en producción al menos una vez antes de confiar en él frente al cliente.
3. Limpiar empresas duplicadas de prueba de la base de producción.
4. Revisar seguridad de `increment_empresa_profile_views` antes de mostrar esa métrica como KPI a un banco.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El funnel de invitaciones, profile views y tasa de respuesta ya están construidos y listos para demo — solo falta poblarlos con uso real.
- Employer branding completo (stack, modalidad, beneficios, LinkedIn) ya es editable — CLT puede tener un perfil competitivo hoy mismo, solo falta completarlo.
- Notificación automática a la empresa cuando un candidato termina una evaluación — reduce fricción de seguimiento, buen argumento de producto "vivo".

### Nota sobre tickets

Este ciclo no tuvo acceso a Jira (`aiquaa.atlassian.net`) desde el entorno de ejecución — no se crearon tickets directamente. Los 5 hallazgos de arriba están redactados en formato listo para copiar a Jira (título + descripción + impacto + prioridad ya incluidos en cada bullet).

### Foco del próximo ciclo (1 hora)

**Prioridad:** Activación del piloto, no más funcionalidad nueva

1. Completar manualmente el perfil de CLT en producción (tech stack, modalidad, beneficios, LinkedIn) y limpiar las empresas duplicadas de prueba.
2. Confirmar `EMAIL_SENDING_ENABLED` en Vercel prod y ejecutar una invitación real de punta a punta (creación → email recibido → `/invitaciones/[token]` → candidato completa evaluación → notificación a la empresa).
3. Portar el fix de `section_scores` de `candidatos/page.tsx` a `employer.ts` (bajo esfuerzo, desbloquea el desglose por sección en dashboard/procesos).
4. Agregar rate-limit o autenticación mínima a `increment_empresa_profile_views` antes de usar esa métrica en un pitch a Banco Continental.

Este ciclo ya no está bloqueado por funcionalidad faltante — está bloqueado por datos y verificación de producción.

---

*Revisión generada automáticamente — 2026-07-25 · Rama: `claude/zen-noether-ff3uv8` · Incluye inspección directa de Supabase (proyecto `aiquaa`, `cbkctkpyxwbufvbwxogp`)*
