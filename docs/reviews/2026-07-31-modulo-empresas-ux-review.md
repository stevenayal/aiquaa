# Revisión UX — Módulo de Empresas (Ciclo 2)
**Fecha:** 31 de julio de 2026
**Ciclo:** Mejora continua · 60 min · Ciclo anterior: [2026-06-27](./2026-06-27-modulo-empresas-ux-review.md)
**Reviewer:** QA Lead (revisión de código + datos reales de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología de este ciclo:** (1) Lectura del código fuente actual (Server Actions, páginas, migraciones SQL) para ver qué cambió desde el 27/06. (2) Consultas SQL directas contra el proyecto Supabase de **producción** (`aiquaa`, ref `cbkctkpyxwbufvbwxogp`) para verificar uso real, no solo existencia de código. (3) Intento de walkthrough en vivo de `aiquaa.com/empresas*`: **bloqueado por protección anti-bot (HTTP 403)** en ambas URLs probadas — no se pudo confirmar maquetación, copy exacto ni comportamiento de clics este ciclo. Todo lo marcado "código" o "DB" está verificado; nada se reporta por supuesto.

### Corrección de contexto importante
El prompt de este ciclo asume backend NestJS + Prisma. **Eso no existe en este repo.** El módulo de Empresas corre 100% sobre Next.js Server Actions + Supabase Postgres (RPCs y RLS), sin `apps/backend`. El ADR-001 que documenta la decisión de NestJS nunca se implementó. Esto no es un hallazgo UX, pero condiciona cómo se arman los tickets técnicos.

---

## 🏢 Bloque 1 — Perfil de empresa

### Qué cambió desde el 27/06
Fixes confirmados en código: se agregaron `work_mode`, `tech_stack`, `benefits`, `linkedin_url`, `qa_team_size` a `empresas`; se creó el directorio público `/empresas` (antes no existía).

### Hallazgo nuevo y crítico (dato de producción)
La empresa piloto **CLT** (`id 765269d3-b928-4059-a27b-fcdbb61b24b9`, creada 19/06/2026) existe en la tabla `empresas` pero:
- **`empresa_miembros` tiene 0 filas para CLT.** Nadie tiene una cuenta vinculada a esta empresa — no hay owner, no hay admin, no hay member. Es un registro huérfano.
- Su perfil está **100% vacío**: sin logo, sin descripción, sin industria, sin team_size, sin tech_stack, sin beneficios, sin LinkedIn. Único valor no-null es `country='PY'` (el default).
- `profile_views = 0`.

Esto es más grave que cualquier problema de copy o de campos faltantes: **el cliente piloto nombrado en este ciclo no puede acceder al producto porque su cuenta nunca fue provisionada con un usuario.** No se puede evaluar "¿el perfil inspira confianza?" cuando literalmente nadie del lado de CLT puede loguearse a editarlo.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Cuenta de CLT sin miembros | `empresa_miembros` = 0 filas para CLT; nadie puede loguearse como CLT | **CRÍTICO** 🚀 | Investigar cómo se creó el registro (¿script/seed manual?) y completar el alta real: invitar a un contacto de CLT como owner | Roto |
| Perfil de CLT vacío | 0 de 12 campos de branding completados | **A** 🚀 | Consecuencia directa del punto anterior — no accionable hasta resolverlo | Incompleto |
| Stack tecnológico / modalidad / beneficios / LinkedIn | Ya existen como campos (fix desde ciclo anterior) | — | Verificado en código; falta confirmar UX real con browser en próximo ciclo | Completo (código) |
| Directorio público `/empresas` | Ya existe (fix desde ciclo anterior) | — | Confirmar en próximo ciclo que lista a CLT/Banco Continental una vez tengan datos | Completo (código) |
| URL pública del perfil | Sigue siendo UUID (`/empresas/765269d3-...`), no memorable | **M** | Slug desde `nombre_comercial` (pendiente desde ciclo 1) | Incompleto |
| `country='PY'` precargado | Sigue generando % de completitud falso sin acción del usuario | **B** | Pendiente desde ciclo 1 | Incompleto |
| Duplicados "Aiquaa" / "AIQUAA" | Dos registros de empresa casi idénticos para la propia AIQUAA (creados con 51 min de diferencia) | **B** | Limpiar datos de prueba en producción o marcar como test accounts | Roto (higiene de datos) |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Qué cambió desde el 27/06
Confirmado en código: filtro de país agregado, exportación CSV agregada — ambos eran hallazgos 🚀 del ciclo anterior. `get_empresa_candidate_sourcing()` existe y corre en producción (verificado con `pg_proc`).

### Hallazgo nuevo y crítico (dato de producción)
De **104 perfiles de candidatos** en `profiles`, solo **1** tiene `talent_visible_to_empresas = true`. Solo 1 tiene `open_to_work = true`. Solo 1 tiene `istqb_level` cargado.

Sin importar qué tan bien estén hechos los filtros, **un recruiter que busca hoy ve como máximo 1 candidato.** El problema ya no es de UX de búsqueda — es que el lado candidato del marketplace nunca fue activado. Probablemente porque no hay ningún CTA visible en el perfil del candidato que explique el beneficio de "hacerte visible a empresas" (no verificado en código este ciclo — queda como acción para el próximo).

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Pool de candidatos visibles | 1 de 104 perfiles con `talent_visible_to_empresas=true` | El feature de búsqueda es funcionalmente inútil sin oferta | Auditar el flujo de opt-in del candidato: ¿existe toggle visible? ¿hay incentivo explicado? Campaña a usuarios existentes para activarlo | **CRÍTICO** 🚀 |
| Filtro por país | Implementado (fix desde ciclo 1) | — | Confirmar con browser que funciona con datos reales | Completo (código) |
| Exportar CSV | Implementado (fix desde ciclo 1) | — | Confirmar con browser | Completo (código) |
| Filtros ISTQB sin descripción | Sin cambios: `ctfl`, `ctal_ta` sin tooltip | Recruiter no-QA no entiende los valores | Pendiente desde ciclo 1 | **A** |
| Límite hardcoded 500 en `exam_results` | Sin cambios | Riesgo de truncado silencioso a futuro | Pendiente desde ciclo 1 | **M** |
| Comparación side-by-side | Ahora existe una vista de 4 tarjetas resumen en `/empresa/candidatos`, no tabla atributo-por-atributo completa | Mejora parcial, no vista comparativa real | Evaluar si la tarjeta resumen ya resuelve el caso de uso antes de invertir en tabla completa | **B** (bajó de prioridad) |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Qué cambió desde el 27/06 (fixes confirmados en código)
- `createInvitacionAction` ahora envía email vía Resend cuando `EMAIL_SENDING_ENABLED='true'`.
- Ruta pública `/invitaciones/[token]` existe y usa `get_invitacion_by_token` (verificado que el RPC corre en producción).
- `section_scores` ya no se descarta: se muestra desglose por sección uniendo `assessment_scores`/`assessment_sections`.

Estos tres eran los hallazgos **CRÍTICO** del cierre del ciclo anterior. Los tres están resueltos en código.

### Hallazgo nuevo (dato de producción): el flujo arreglado nunca fue probado con datos reales
`empresa_invitaciones` tiene **0 filas en producción**. Ninguna empresa —incluida AIQUAA usándose a sí misma como test— ha creado una invitación desde que se implementó el fix. Esto significa:
- No hay confirmación end-to-end de que el email realmente sale (depende de `EMAIL_SENDING_ENABLED`, que no se puede verificar por SQL — queda pendiente confirmar el valor de esa env var en Railway/Vercel el próximo ciclo).
- El código está "completo" pero el flujo sigue sin evidencia de funcionar en producción real.

También: `empresa_pruebas`, `empresa_preguntas`, `empresa_prueba_invitaciones`, `empresa_intentos` (el constructor de pruebas propias de la empresa) tienen **0 filas cada una**. Existe el esquema completo pero nadie lo usó nunca.

### Tabla de hallazgos

| Paso del flujo | Estado (código) | Estado (uso real) | Problema UX | Prioridad |
|---|---|---|---|---|
| Invitar candidato con email | Completo (fix ciclo 1) | **0 invitaciones creadas jamás** | Sin datos reales para confirmar que el email sale; probar manualmente el flujo end-to-end con una cuenta de prueba | **A** 🚀 |
| Candidato accede a invitación por token | Completo (fix ciclo 1) | No probado (0 invitaciones) | Mismo bloqueo que arriba | **A** |
| Desglose `section_scores` visible | Completo (fix ciclo 1) | No verificable sin browser | Confirmar visualmente en próximo ciclo | **B** (bajó de CRÍTICO) |
| Constructor de pruebas propias (`empresa_pruebas`) | Esquema completo | **0 uso jamás** | Investigar si la entrada a esta feature es descubrible en la UI, o si simplemente nadie la necesitó todavía | **M** |
| `max_attempts` configurable / badge "vence pronto" | Sin cambios | — | Pendiente desde ciclo 1 | **B** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Qué cambió desde el 27/06 (fixes confirmados en código)
- Widget de funnel invitaciones (Enviadas → Vistas → Completadas) implementado.
- `profile_views` con RPC `increment_empresa_profile_views` existe en producción.

### Hallazgo
No se pudo confirmar si `/empresas/[id]` efectivamente llama al RPC de incremento en cada vista (el Explore de código no lo verificó con certeza, y `profile_views=0` en CLT es consistente tanto con "nadie vio el perfil" como con "el contador no se dispara" — con 0 filas no se puede distinguir una causa de la otra). Para las otras dos empresas (Aiquaa/AIQUAA, uso interno) tampoco hay señal porque no se consultó su `profile_views` — pendiente para el próximo ciclo si se quiere aislar la causa.

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Funnel invitación → vista → completada | Sí (fix ciclo 1) | Con 0 invitaciones en DB, el widget probablemente muestra un funnel vacío para toda empresa real hoy | Confirmar visualmente + asegurar buen empty state para "0 invitaciones enviadas" | Alto (cuando haya datos) |
| Perfil visto por candidatos (`profile_views`) | Sí, columna + RPC (fix ciclo 1) | No confirmado si se incrementa en cada GET público | Confirmar con prueba manual: abrir `/empresas/{id}` sin sesión y verificar que el contador sube | **A** |
| Comparación entre procesos / top skills del mes | No | Sin cambios desde ciclo 1 | Pendiente | Medio |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 La empresa piloto CLT no tiene ningún usuario asociado** (`empresa_miembros`=0). No es un problema de UX — es que el cliente piloto nombrado en este ciclo literalmente no puede entrar al producto. Tipo: **gap de proceso/onboarding**, bloqueante absoluto para el piloto. 🚀
2. **🚨 El pool de candidatos visibles a empresas es de 1 sobre 104.** El módulo de búsqueda, aunque bien construido en código (filtros de país, ISTQB, skills, CSV), no tiene oferta real que mostrar. Tipo: **gap de producto** (activación del lado candidato), bloqueante para demostrar valor a cualquier empresa piloto. 🚀
3. **✅ Los 3 hallazgos CRÍTICO del ciclo anterior (email de invitación, ruta pública por token, desglose de secciones) están resueltos en código** — pero con 0 invitaciones creadas nunca en producción, siguen sin confirmación de que funcionan end-to-end con datos reales. Tipo: **verificación pendiente**, no bug conocido.
4. **⚠️ El constructor de pruebas propias de la empresa (`empresa_pruebas` y tablas relacionadas) tiene 0 uso desde que existe.** Posible indicador de que la feature no es descubrible, o de que se construyó antes de validar la necesidad. Tipo: **gap de descubribilidad o de producto**.
5. **⚠️ Existe un segundo esquema paralelo (`talent_companies`, `talent_selection_processes`, etc.) con solo 2 empresas y 0 postulaciones**, aparentemente un intento de sistema más nuevo (nombres en camelCase estilo TypeORM/Prisma, enums `CompanyStatus`/`CompanyRole`) con una columna `aiquaaEmpresaId` sin poblar — sugiere una migración planeada pero no completada entre el sistema `empresas` actual y uno nuevo. Riesgo de duplicar esfuerzo de ingeniería. Tipo: **riesgo arquitectónico**, vale la pena una decisión explícita (¿se migra o se abandona?).

### Progreso desde el ciclo anterior (27/06 → 31/07)
6 de 10 hallazgos del cierre anterior están resueltos en código: invitaciones con email, ruta `/invitaciones/[token]`, `section_scores`, filtro de país, export CSV, funnel de invitaciones. Buen ritmo de ejecución — pero ninguno de los 6 tiene evidencia de uso real en producción todavía.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | CLT sin usuario asociado (`empresa_miembros`=0) | Gap de proceso/onboarding | **Sí — el más crítico** 🚀 |
| 2 | Pool de candidatos visibles ≈ 0 (1/104) | Gap de producto | Sí 🚀 |
| 3 | Flujo de invitación arreglado pero sin uso real (0 filas) | Verificación pendiente | Sí |
| 4 | Constructor de pruebas propias sin uso (0 filas) | Gap de descubribilidad | Parcial |
| 5 | Esquema `talent_*` paralelo sin terminar de integrar | Riesgo arquitectónico | No (pero sí para roadmap) |
| 6 | URL pública con UUID (no slug) | UX problem | Parcial (arrastrado del ciclo 1) |
| 7 | ISTQB sin tooltips para recruiter no-técnico | UX problem | Sí (arrastrado del ciclo 1) |
| 8 | `profile_views` sin confirmar que se incrementa | Verificación pendiente | Sí (para métricas B2B) |
| 9 | Duplicados de empresa AIQUAA en datos de producción | Higiene de datos | No |
| 10 | Comparación de candidatos solo parcial (4 tarjetas, no tabla completa) | Mejora UX | No |

### Bloqueantes reales para cliente piloto (CLT / Banco Continental) — actualizado
1. **CLT no puede entrar al producto** (sin usuario) — esto bloquea todo lo demás, es el prerequisito de cualquier otro hallazgo.
2. Aunque CLT pudiera entrar, **no encontraría candidatos** (pool visible ≈ 0).
3. El flujo de invitación a candidatos externos, aunque arreglado en código, **no tiene ni una sola ejecución real** para confirmar que funciona.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀
- Los 3 fixes CRÍTICOS del ciclo 1 (email, token, desglose) ya están en código — buena velocidad de ejecución para mostrar progreso a inversores.
- Filtro de país y export CSV: diferenciadores LATAM ya implementados.
- El gap más grande ya no es "el código no existe" sino "**activación**": conseguir que CLT tenga un usuario real y que candidatos activen su visibilidad. Ese es un problema de producto/growth resolvible sin escribir código nuevo, lo cual es una buena noticia para el pitch de velocidad.

### Tickets recomendados (no se pudieron crear en Jira — sin acceso a `aiquaa.atlassian.net` configurado en este ciclo; quedan listos para copiar)

**[CRÍTICO] Onboardear al usuario real de CLT en el módulo Empresas**
- Descripción: El registro `empresas.id=765269d3-b928-4059-a27b-fcdbb61b24b9` (CLT) no tiene ninguna fila en `empresa_miembros`. Nadie puede loguearse como CLT ni editar su perfil.
- Pasos para reproducir: `select * from empresa_miembros where empresa_id='765269d3-b928-4059-a27b-fcdbb61b24b9'` → 0 filas.
- Impacto: Bloqueante total para el piloto.
- Prioridad: Crítica.

**[ALTO] Activar el opt-in de candidatos visibles a empresas**
- Descripción: Solo 1 de 104 perfiles tiene `talent_visible_to_empresas=true`. Auditar si el toggle es descubrible en `/perfil` y considerar campaña de activación.
- Impacto: El buscador de candidatos no tiene oferta real que mostrar a ninguna empresa.
- Prioridad: Alta.

**[ALTO] Confirmar end-to-end el flujo de invitación con datos reales**
- Descripción: El código del flujo de invitación (email + token + página pública) está completo desde el ciclo anterior, pero `empresa_invitaciones` tiene 0 filas en producción — nunca se ejecutó. Confirmar valor de `EMAIL_SENDING_ENABLED` en el entorno de producción y correr una invitación de prueba real.
- Prioridad: Alta.

### Foco del próximo ciclo (1 hora)
**Prioridad: Activación, no más código.** El módulo tiene suficiente funcionalidad construida; lo que falta es gente real usándolo.
1. Resolver el onboarding de CLT (ticket crítico arriba) — sin esto, todo lo demás es teórico.
2. Correr una invitación de prueba real de punta a punta y confirmar que el email llega.
3. Revisar/mejorar el flujo de opt-in de candidatos (`talent_visible_to_empresas`) para subir el pool de 1 a un número demostrable.
4. Retomar el walkthrough visual en navegador (bloqueado este ciclo por protección anti-bot) para validar los fixes de UI del ciclo 1 que solo se confirmaron por código.

---

*Revisión generada automáticamente — 2026-07-31 · Rama: `claude/zen-noether-c89jff` · Fuente de datos: proyecto Supabase `aiquaa` (producción)*
