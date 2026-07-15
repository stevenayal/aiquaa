# Revisión UX — Módulo de Empresas
**Fecha:** 15 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código — sesión ejecutada como rutina programada, sin sesión de navegador contra producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente actual (rama `claude/zen-noether-ss65lr`), leyendo directamente los archivos de páginas, server actions y migraciones SQL, y comparando contra la revisión previa (`docs/reviews/2026-06-27-modulo-empresas-ux-review.md`) para verificar qué se corrigió, qué sigue roto y qué regresó. No hubo acceso a una sesión de navegador logueada contra aiquaa.com producción ni a un entorno con Supabase corriendo en este ciclo, por lo tanto **no se reportan aquí observaciones de comportamiento en runtime** (ej. latencia real, mensajes de error de red) que no puedan confirmarse leyendo el código — donde el código no permite confirmar un comportamiento, se marca explícitamente como "no verificable en este ciclo" en vez de asumirlo.

> **Nota de arquitectura:** `CLAUDE.md` describe un backend NestJS + Prisma. Ese backend **no existe en este repo** — no hay `apps/backend/`. La arquitectura real es Next.js (App Router) + Supabase (Postgres/RLS/RPCs vía migraciones SQL en `supabase/migrations/`), con lógica de negocio en Server Actions (`apps/frontend/src/actions/*.ts`). Esta revisión se hizo contra la arquitectura real.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Mejor que en el ciclo anterior: la barra de completitud (`/empresa/perfil`) ahora referencia 8 campos con anchors, incluyendo los que antes faltaban (`work_mode`, `tech_stack`, `benefits`, `linkedin_url`, `qa_team_size` fueron agregados). Pero el bug de completitud falsa **sigue sin resolverse**: `country` es uno de los 8 campos de `PROFILE_FIELDS` (page.tsx:81-90) y tiene default `'PY'` tanto en el formulario (`country: 'PY'`, línea 124) como al cargar (`data.country ?? 'PY'`, línea 145). Una empresa recién registrada ve 13% (1/8) de completitud sin haber tocado nada.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Mejoró sustancialmente: `/empresa/perfil` ahora incluye stack tecnológico, modalidad de trabajo, beneficios y LinkedIn — los campos que el ciclo anterior identificó como faltantes están implementados. Pendiente: la URL pública sigue siendo un UUID (`/empresas/{uuid}`), no hay slug.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Completitud con default falso | `country` cuenta como campo completo por su default `'PY'` (form y fallback), infla el score a 13% sin acción del usuario | **A** | Excluir `country` del cálculo hasta que el usuario lo confirme explícitamente, o agregar un flag `country_confirmed` | **Incompleto — persiste desde el ciclo anterior, no corregido** |
| Campos de employer branding (stack, modalidad, beneficios, LinkedIn, tamaño de equipo QA) | — | — | — | **Completo — corregido desde el ciclo anterior** |
| RUC no adaptado a otros países | El label "RUC" es fijo y la validación de formato (`/^\d{6,8}-\d$/`) solo aplica si `country === 'PY'`, pero el label y el placeholder no cambian para AR/CO/otros países aunque el formulario ya soporta elegir otro país | **M** | Renombrar dinámicamente el campo (RUC/NIT/CUIT/RFC) según país seleccionado, no solo condicionar la validación | **Incompleto — validación mejoró parcialmente, label sigue sin adaptar** |
| URL pública del perfil | Sigue siendo UUID (`/empresas/{uuid}`), no memorable ni compartible en un email de outreach | **A** | Generar slug automático desde `nombre_comercial`, con fallback a UUID si hay colisión | **Incompleto — sin cambios desde el ciclo anterior** |
| Directorio público `/empresas` | No existía en el ciclo anterior | — | — | **Completo — corregido: página de listado implementada con badges de industria/país/modalidad** |
| Tipos de evaluación en perfil público | En `/empresas/[id]` los `exam_types` de los procesos activos se listan como strings crudos (`et` sin mapear a label descriptivo), sin explicar a un candidato qué evalúa cada uno | **M** | Reusar el mismo `EXAM_OPTIONS` con label+descripción que ya existe en `procesos/nuevo/page.tsx` para renderizar esta lista | **Incompleto — no corregido, la mejora se aplicó solo en la vista interna de la empresa, no en la pública** |
| Eliminar logo | No hay opción "Eliminar logo", solo "Cambiar logo" | **B** | Agregar botón de eliminar con confirmación | No re-verificado en este ciclo (sin cambios reportados) |
| Contador de caracteres | Pendiente de re-verificación puntual en este ciclo | **B** | — | No re-verificado en este ciclo |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Mejoró: ambas pantallas de búsqueda (`/empresa/candidatos` y `/empresa/buscar-candidatos`) ahora usan `ISTQB_LEVEL_LABELS` para mostrar etiquetas legibles en vez de códigos crudos (`ctfl`, `ctal_ta`). Filtro de país agregado en ambas.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Mejoró: hay botón "Invitar" inline en la ficha del candidato en ambas pantallas (ya no hay que saltar a otro módulo), y favoritos/shortlist están implementados (`empresa_favoritos`).

**Hallazgo nuevo y relevante:** existen **dos pantallas de búsqueda de candidatos paralelas** — `/empresa/candidatos` (con tabs "Talento"/"Evaluados", exportación CSV, comparación) y `/empresa/buscar-candidatos` (más nueva, RPC dedicada `get_empresa_candidate_sourcing()`, con favoritos). Tienen sets de filtros parcialmente distintos y fuentes de datos distintas (una hace joins client-side, la otra usa un RPC dedicado). Para un recruiter esto es confuso: ¿cuál es "la" búsqueda de candidatos de AIQUAA? No hay navegación cruzada visible entre ambas en el código revisado.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Dos pantallas de búsqueda paralelas | `/empresa/candidatos` y `/empresa/buscar-candidatos` coexisten con filtros y fuentes de datos distintos | Confunde al recruiter sobre cuál usar; duplica mantenimiento de lógica de filtrado | Unificar en una sola pantalla, o diferenciar claramente el propósito de cada una en el nav (`Header.tsx` ya las lista con nombres distintos: "Buscar talento" vs. la ruta de candidatos existente) | **A** |
| Filtro por país | Implementado en ambas pantallas | — | — | **Corregido** 🚀 |
| Etiquetas ISTQB legibles | Implementado (`ISTQB_LEVEL_LABELS`) en ambas pantallas | — | — | **Corregido** |
| Botón "Invitar" inline | Implementado en ambas pantallas (línea ~970 en `candidatos/page.tsx`) | — | — | **Corregido** 🚀 |
| Exportar CSV | Implementado en `/empresa/candidatos` (`exportCSV`) | No confirmado en `/empresa/buscar-candidatos` — solo se verificó su presencia en `candidatos/page.tsx` | Confirmar y replicar exportación CSV en `buscar-candidatos` si aplica al mismo caso de uso | **M** |
| Comparación de candidatos | Implementada (checkbox multi-select, máx. 4) en `/empresa/candidatos` | No confirmada en `/empresa/buscar-candidatos` | Evaluar si debe existir en ambas o solo en una, dado el hallazgo de duplicación | **B** |
| Desglose `section_scores` | Se muestra correctamente en `/empresa/candidatos` (merge de `sectionScoresByAttempt`, línea 316) | **Persiste parcialmente**: en `actions/employer.ts::fetchAssessmentAttemptsForProcessCodes` (línea 417) sigue hardcoded a `null`, lo cual alimenta `/empresa/procesos/[id]`, `/empresa/eventos/[id]` y el dashboard — el recruiter no ve el desglose por sección en esas vistas | Aplicar el mismo fix de merge de `sectionScoresByAttempt` usado en `candidatos/page.tsx` también en `employer.ts` | **A** — bug reabierto parcialmente, no está resuelto en todas las superficies |
| Límite 500 resultados hardcoded | No re-verificado puntualmente en este ciclo | — | Confirmar en el próximo ciclo si sigue existiendo el límite sin paginación/alerta | **M** (pendiente de re-verificación) |
| Empty state sin candidatos | Implementado en `/empresa/buscar-candidatos`: "Sin candidatos para estos filtros" con texto secundario | — | — | **Corregido** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
Mejoró en la creación interna del proceso: `procesos/nuevo/page.tsx` ahora usa `EXAM_OPTIONS` con `label` + `description` por tipo de examen. Pero esa mejora **no se propagó** a la vista pública del perfil de empresa (Bloque 1) ni fue verificada en la vista de resultados.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Parcial: donde el desglose por sección se muestra (`/empresa/candidatos`), sí. Donde no (`/empresa/procesos/[id]`, `/empresa/eventos/[id]`, dashboard), el recruiter solo ve aprobado/reprobado y el score total.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Crear proceso con tipo de evaluación | Completo | `EXAM_OPTIONS` ahora incluye descripción por tipo | — | **Corregido** |
| Invitar candidato — envío de email | **Incompleto / requiere verificación de config en prod** | El código de envío de email (`empresa-invitaciones.ts::sendInvitacionEmailIfEnabled`) está implementado y usa Resend correctamente, **pero está condicionado a la variable de entorno `EMAIL_SENDING_ENABLED === 'true'`**, que no aparece definida en ningún archivo de configuración del repo (`.env.example`, `railway.toml`, etc. — no se encontró ninguna referencia fuera del propio código y la migración SQL). Si esa variable no está seteada como `'true'` en Railway/Vercel producción, las invitaciones **se crean en base de datos pero nunca se envían por email**, silenciosamente desde la perspectiva del recruiter (aunque ahora sí queda registrado el motivo en `email_error` en la fila de la invitación) | Confirmar en el panel de Railway/Vercel si `EMAIL_SENDING_ENABLED=true` está seteado en producción; si no, es un bloqueante idéntico al reportado en el ciclo anterior pero ahora "oculto" detrás de una flag no documentada | **CRÍTICO** 🚀 — no se pudo verificar el valor real de la env var en este ciclo (solo código); requiere confirmación fuera de este repo |
| Candidato accede a su invitación por token | Implementado, **pero con una inconsistencia de código**: existen dos rutas casi duplicadas, `/invitacion/[token]` (singular) y `/invitaciones/[token]` (plural), con lógica de exam-label y de redirección distinta entre sí. El email que sí se genera enlaza a `/invitaciones/${token}` (plural, confirmado en el código, línea 73 de `empresa-invitaciones.ts`). La ruta singular **no está referenciada desde ningún lugar del código** (`grep` de enlaces la confirma huérfana) | El código muerto no es user-facing hoy, pero es un riesgo de mantenimiento: alguien podría enlazar la ruta equivocada en el futuro, o ambas podrían divergir en corrección de bugs | Eliminar `/invitacion/[token]` (singular) o unificarla con la plural | **M** — no es bloqueante para el candidato hoy, pero es deuda técnica real y verificada |
| Empresa ve resultados por candidato — desglose por sección | Parcial (ver Bloque 2) | `section_scores` sigue descartado en `employer.ts` para procesos/eventos/dashboard | Igual que Bloque 2 | **A** |
| Notificación a la empresa cuando el candidato completa una evaluación | Implementado (`notifyEmpresaExamCompleted`, llamado desde `actions/exams.ts` y la ruta de submit de assessments) | **Inconsistencia de política de envío**: a diferencia del email de invitación, este no está condicionado por `EMAIL_SENDING_ENABLED` — se envía siempre que `RESEND_API_KEY` esté seteada. Dos flujos de "notificar por email" en el mismo módulo con dos políticas de activación distintas | Unificar bajo el mismo flag de control, o documentar explícitamente por qué difieren | **M** — corregido funcionalmente, pero con una inconsistencia de diseño nueva |
| Comparar candidatos entre sí | Implementado en `/empresa/candidatos` (checkbox, máx. 4) | No confirmado en `/empresa/buscar-candidatos` | Ver Bloque 2 | **Corregido parcialmente** |
| Fecha límite / timeout de proceso | `expires_at` existe, se usa para un badge binario expirado/no-expirado | Sigue sin existir alerta de "vence pronto" (&lt;7 días) | Agregar estado intermedio en el badge | **M** — sin cambios desde el ciclo anterior |
| Política de reintentos configurable | En `hiring_processes` sigue sin campo `max_attempts` | — pero el módulo nuevo de pruebas propias de empresa (`empresa_prueba_invitaciones`) **sí tiene** `max_attempts` (default 1) | Llevar el mismo patrón a `hiring_processes`, o documentar por qué solo aplica al módulo de pruebas propias | **B** — sin cambios en el flujo principal, pero ya existe precedente implementado en un módulo hermano |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Preguntas UX clave

**¿El primer golpe de vista le dice a la empresa qué está pasando con su proceso de selección?**
Mejoró sustancialmente respecto al ciclo anterior: ahora hay un `FunnelWidget` (enviadas → vistas → completadas + tasa de respuesta, calculada como `completadas/total*100` en `getEmpresaDashboardStatsAction`) y el contador de vistas del perfil público (`profile_views`, incrementado vía RPC `increment_empresa_profile_views` en `/empresas/[id]`) — ambos eran huecos críticos señalados en el ciclo anterior y ahora están resueltos.

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Perfil visto por candidatos | **Sí (nuevo)** | Se implementó el contador (`profile_views`) y el RPC de incremento; no se verificó en este ciclo si el widget del dashboard efectivamente lo muestra al recruiter (se confirmó el dato en DB/RPC, no la superficie visual exacta) | Confirmar visualmente que el número aparece en `/empresa` con un label claro ("X candidatos vieron tu perfil este mes") | **Alto** 🚀 |
| Funnel invitación → vista → completada | **Sí (nuevo)** | Implementado como `FunnelWidget`, con tasa de respuesta calculada | — | **Crítico — corregido** 🚀 |
| Tasa de respuesta a invitaciones | **Sí (nuevo)** | Calculada dentro del mismo funnel (`completadas/total*100`) | — | **Alto — corregido** 🚀 |
| Tiempo promedio de evaluación | Sí | Presente (`avgTimeSpentMinutes`), sin benchmark de plataforma como referencia | Agregar "p75 de la plataforma: X min" | Medio — sin cambios |
| Top skills QA disponibles este mes | **No** | Sigue sin existir esta métrica de market intelligence | Widget "Skills más evaluados en AIQUAA este mes", usando `qa_skills` de `profiles` | Medio — sin cambios desde el ciclo anterior |
| Comparación entre procesos (tabla KPIs proceso-a-proceso) | No re-verificado en este ciclo | — | — | Pendiente de re-verificación |
| Empty state sin actividad | Sí (reportado como bueno en el ciclo anterior) | No re-verificado puntualmente en este ciclo | — | Bueno (asumido estable, sin cambios reportados en el código) |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨 El envío de email de invitación depende de una env var no documentada (`EMAIL_SENDING_ENABLED`)** que no aparece en ningún archivo de configuración del repo. Si no está en `'true'` en producción, el bloqueante del ciclo anterior ("invitaciones sin email") sigue vigente hoy, solo que ahora de forma menos visible (queda registrado en `email_error` pero el candidato sigue sin recibir el email). **Esto requiere una verificación fuera del código** (panel de Railway/Vercel) que no pudo hacerse en este ciclo. Tipo: **bug / gap de configuración**.

2. **⚠️ Completitud de perfil sigue siendo falsa por el default `country='PY'`** — reportado hace 3 semanas, sigue sin corregirse pese a que se agregaron 5 campos nuevos al perfil. Tipo: **bug de implementación, no corregido**.

3. **⚠️ `section_scores` sigue descartándose (`null`) en `employer.ts`**, lo cual afecta la vista de procesos, eventos y dashboard (aunque sí se corrigió en la pantalla de candidatos) — el fix se aplicó a medias. Tipo: **bug parcialmente corregido**.

4. **🆕 Dos pantallas de búsqueda de candidatos en paralelo** (`/empresa/candidatos` vs. `/empresa/buscar-candidatos`) con filtros y fuentes de datos distintos — riesgo de confusión para el recruiter y de deuda técnica de mantenimiento doble. Tipo: **gap de consistencia UX, hallazgo nuevo**.

5. **🚀 Buenas noticias:** los 5 hallazgos más críticos del ciclo anterior (directorio público, funnel de invitaciones, page views, campos de employer branding, notificación a empresa al completar evaluación) están **efectivamente resueltos en el código**. El módulo avanzó de forma real en las últimas 3 semanas.

### Clasificación completa (delta vs. ciclo anterior)

| # | Hallazgo | Tipo | Estado vs. ciclo anterior | Bloqueante para piloto |
|---|---|---|---|---|
| 1 | Envío de email de invitación depende de flag no documentada | Bug / config | Persiste (forma distinta) | Sí, pendiente de verificar env var 🚀 |
| 2 | Completitud de perfil falsa por default de país | Bug | **No corregido** | Parcial (mala primera impresión, no bloquea uso) |
| 3 | `section_scores` descartado en procesos/eventos/dashboard | Bug | **Corregido parcialmente** (sí en candidatos, no en el resto) | Sí — afecta decisión de contratación 🚀 |
| 4 | Dos pantallas de búsqueda de candidatos paralelas | Gap de consistencia | **Nuevo** | Parcial (confuso, no bloquea) |
| 5 | Ruta huérfana `/invitacion/[token]` (singular) | Deuda técnica | **Nuevo** | No |
| 6 | Dos proveedores de email (Resend + SendGrid) en el mismo módulo | Inconsistencia operativa | **Nuevo** | No |
| 7 | Directorio público `/empresas` | Gap de funcionalidad | **Corregido** ✅ | — |
| 8 | Campos de employer branding faltantes | Gap de funcionalidad | **Corregido** ✅ | — |
| 9 | Funnel de invitaciones + tasa de respuesta | Gap de funcionalidad | **Corregido** ✅ 🚀 | — |
| 10 | Page views de perfil de empresa | Gap de funcionalidad | **Corregido** ✅ 🚀 | — |
| 11 | Notificación a empresa al completar evaluación | Gap de funcionalidad | **Corregido** ✅ 🚀 | — |
| 12 | Filtro por país en candidatos | Gap de funcionalidad | **Corregido** ✅ 🚀 | — |
| 13 | Exportación CSV | Gap de funcionalidad | **Corregido** ✅ 🚀 | — |
| 14 | URL pública con UUID (no slug) | UX problem | Sin cambios | Parcial |
| 15 | RUC no adaptado a país | UX problem | Sin cambios (validación mejoró, label no) | No |
| 16 | Tipos de evaluación sin descripción en perfil público | UX problem | Sin cambios (se corrigió solo internamente) | No |
| 17 | "Vence pronto" / `max_attempts` en `hiring_processes` | Gap de funcionalidad | Sin cambios | No |
| 18 | "Top skills" en dashboard | Gap de funcionalidad | Sin cambios | No |

### Bloqueantes reales para cliente piloto (CLT / Banco Continental) hoy

1. **Verificar si `EMAIL_SENDING_ENABLED=true` está seteado en producción.** Es la única forma de saber si el flujo de invitación a candidatos externos —el caso de uso B2B core— funciona hoy de punta a punta. Esto no se puede confirmar leyendo el repo; requiere acceso al panel de Railway/Vercel o una prueba real de invitación en producción.
2. `section_scores` no visible en procesos/eventos/dashboard limita la info que un líder técnico de Banco Continental necesita para decidir, aunque sí funciona en la pantalla de candidatos.
3. Los demás bloqueantes del ciclo anterior (directorio, filtro país, CSV, employer branding, notificaciones) **ya no bloquean** — están resueltos.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El funnel de invitaciones y las page views del perfil —ambos señalados el ciclo pasado como el pitch más fuerte— **ya están implementados**, lo cual es una historia de progreso real y demostrable para Moonshot.
- El módulo de pruebas propias de empresa (`empresa_pruebas` / `empresa_preguntas` / `empresa_intentos`) es una capacidad B2B diferenciadora no contemplada en el ciclo anterior: permite a una empresa autoría su propio examen técnico, no solo usar los de la plataforma. Vale la pena incluirlo explícitamente en el pitch.
- El RPC dedicado `get_empresa_candidate_sourcing()` protege el email del candidato (privacy-by-design) — un argumento de cumplimiento/compliance útil para un banco como Banco Continental.

### Foco del próximo ciclo (1 hora)

**Prioridad 1:** Confirmar el estado real de `EMAIL_SENDING_ENABLED` en producción y, si está apagado, activarlo y probar una invitación real de punta a punta (envío de email → candidato hace clic en `/invitaciones/[token]` → completa examen → empresa recibe notificación). Este es el único hallazgo crítico de este ciclo que no se pudo cerrar solo con lectura de código.

**Prioridad 2:** Aplicar el mismo fix de `sectionScoresByAttempt` de `candidatos/page.tsx` a `employer.ts` para que el desglose por sección se vea también en procesos/eventos/dashboard.

**Prioridad 3:** Decidir el futuro de `/empresa/candidatos` vs. `/empresa/buscar-candidatos` — consolidar o diferenciar explícitamente su propósito en el nav, antes de que la duplicación crezca más.

---

*Revisión generada automáticamente — 2026-07-15 · Rama: `claude/zen-noether-ss65lr` · Ciclo anterior de referencia: 2026-06-27*
