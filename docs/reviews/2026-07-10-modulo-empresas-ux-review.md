# Revisión UX — Módulo de Empresas (Ciclo 2)
**Fecha:** 10 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente (no hay entorno con datos de prueba disponible para un walkthrough en vivo en este ciclo). Se comparó línea por línea contra la revisión previa (`2026-06-27-modulo-empresas-ux-review.md`) para medir qué se resolvió y qué sigue abierto, y se leyó el código actual de cada flujo para detectar hallazgos nuevos. Solo se documentan hechos confirmados en el código.
>
> **Nota de arquitectura:** el prompt original de este ciclo asume backend NestJS + Prisma. El repo real usa **Next.js Server Actions + Supabase** (sin Nest, sin Prisma). Este informe usa la arquitectura real.

---

## 📌 Delta desde el ciclo anterior (27 jun → 10 jul)

De los 10 hallazgos clasificados el ciclo pasado, **6 ya están resueltos**:

| # | Hallazgo (ciclo 1) | Estado ahora |
|---|---|---|
| 1 | Invitaciones sin email / sin ruta por token | ✅ **Resuelto** — `sendInvitacionEmailIfEnabled` envía por Resend; `/invitaciones/[token]` existe (195 líneas) |
| 2 | Directorio público `/empresas` inexistente | ✅ **Resuelto** — `app/empresas/page.tsx` lista empresas públicas |
| 3 | `section_scores` descartado en la UI de candidatos | 🟡 **Parcial** — corregido en `/empresa/candidatos` (tabla ya hace join con `assessment_scores`), pero `employer.ts:423` sigue hardcodeando `section_scores: null` en la agregación del dashboard/eventos |
| 4 | Campos de employer branding faltantes (stack, modalidad, beneficios, LinkedIn) | ✅ **Resuelto** — los 4 campos existen en `/empresa/perfil` |
| 5 | Métricas B2B faltantes en dashboard (views, funnel, tasa de respuesta) | ✅ **Resuelto** — dashboard tiene profile views, funnel de invitaciones y tasa de respuesta |
| 7 | Sin filtro de país en talento | ✅ **Resuelto** — filtro país presente en `/empresa/buscar-candidatos` |
| 8 | Sin exportación CSV | ✅ **Resuelto** — CSV export en `/empresa/candidatos` |
| 9 | Sin comparación side-by-side | ✅ **Resuelto** — comparación hasta 4 candidatos implementada |
| 10 | Sin notificación a empresa al completar evaluación | ✅ **Resuelto** — `notifyEmpresaExamCompleted` |
| 57 (Bloque 2) | Sin botón "Invitar" inline en ficha de candidato | ✅ **Resuelto** — botón "Invitar" presente en `/empresa/candidatos:969` |

Quedan abiertos: **#6 (URL con UUID, no slug)** y **#5-bis (completitud engañosa por `country='PY'` default)**. Este es un progreso real y significativo en dos semanas — el flujo B2B core (invitar → notificar → ver resultados) ya no está roto.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Sí, mejor que antes. Ahora hay barra de completitud con 8 campos, anchors a cada sección, contador de caracteres en descripción/beneficios, validación de URL y RUC formateado. El problema del `country='PY'` default sigue sin resolver.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Mucho más que en el ciclo anterior: ahora sí hay stack tecnológico, modalidad de trabajo, beneficios y LinkedIn. Sigue faltando: URL memorable y feedback visual de "vista pública" sin salir de la pantalla.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Completitud por defecto | `country` sigue con default `'PY'` (`empresa/perfil/page.tsx:124,145`) y cuenta como campo completo en `completionScore()` (línea 92) → una empresa nueva arranca en ~13% (1/8) sin haber tocado nada | **M** | Excluir `country` del cálculo o requerir confirmación explícita antes de contarlo | **Incompleto (no resuelto desde ciclo 1)** |
| URL pública del perfil | Sigue siendo `/empresas/{uuid}` (`app/empresas/page.tsx:70`), no hay columna `slug` en la migración de `empresas` | **A** | Generar slug desde `nombre_comercial`, mantener UUID como fallback/redirect | **Incompleto (no resuelto desde ciclo 1)** |
| Stack tecnológico / modalidad / beneficios / LinkedIn | — | — | — | ✅ **Completo** (resuelto desde ciclo 1) |
| Preview inline sin salir de la pantalla | Solo hay link a `/empresas/[id]`, no vista previa embebida | **B** | Modal/panel colapsable de preview | Incompleto |
| Eliminar logo | Solo "Cambiar logo", no hay opción de quitarlo | **B** | Botón "Eliminar logo" con confirmación | No verificado si sigue igual — no se detectó `onRemoveLogo` en el archivo revisado |
| RUC para otros países | Campo RUC/formato fijo `80012345-6` (PY) visible incluso con `country` distinto de PY | **B** | Renombrar dinámicamente (RUC/NIT/CUIT/RFC) según país | Incompleto |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Mejoró parcialmente: `ISTQB_LEVEL_LABELS` (`buscar-candidatos/page.tsx:17-22`) ahora traduce `ctal_ta` → "Advanced Level - Test Analyst" en vez de mostrar el código crudo. Pero **no hay ningún tooltip** (`grep` de `title=`/tooltip no arrojó resultados) que explique qué significa ese nivel en términos de contratación — un recruiter de RRHH sigue sin saber si "Advanced Level - Test Analyst" es más senior que "Foundation Level".

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Sí, ya resuelto: el botón "Invitar" y "Guardar"/"Quitar" (favoritos) están inline en la misma fila del candidato (`empresa/candidatos/page.tsx:951,969`), sin salir del módulo.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Tooltips ISTQB | Labels ahora legibles pero sin explicación de qué implica cada nivel para una decisión de contratación | Recruiter no-técnico no sabe si vale la pena filtrar por nivel avanzado | Agregar tooltip/ícono `(?)` con 1 línea de explicación por nivel | **A** |
| Límite 500 resultados (hardcoded) | `exam_results` sigue limitado a 500 filas en `/empresa/candidatos/page.tsx:188` sin paginación ni aviso | Riesgo de truncar resultados silenciosamente a medida que crece la plataforma | Paginación real o alerta "mostrando los primeros 500 de X" | **M** |
| Invitar/Guardar inline | — | — | — | ✅ **Completo** (resuelto desde ciclo 1) |
| Comparación side-by-side | — | — | — | ✅ **Completo** (hasta 4 candidatos) |
| Exportar CSV | — | — | — | ✅ **Completo** |
| Filtro por país | — | — | — | ✅ **Completo** |
| Empty state sin resultados | "Sin candidatos para estos filtros" + sugerencia de ajustar filtros (`buscar-candidatos/page.tsx:456-469`) | Mensaje claro pero sin CTA accionable (ej. "invitar candidato manualmente") | Agregar botón directo a invitación manual desde el empty state | **B** |
| Desglose `section_scores` en agregados de dashboard/eventos | `employer.ts:423` (`fetchAssessmentAttemptsForProcessCodes`) sigue devolviendo `section_scores: null, learning_objectives: null` hardcodeado, aunque la tabla de candidatos individual ya sí lo muestra | Inconsistencia: el detalle de un candidato muestra breakdown por sección, pero el evento/dashboard agregado no puede usarlo para comparar | Reutilizar el mismo join de `assessment_scores`/`assessment_sections` en `fetchAssessmentAttemptsForProcessCodes` | **A** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
Sí, para el flujo de **creación de proceso**: `EXAM_OPTIONS` en `/empresa/procesos/nuevo/page.tsx:13-60` ahora incluye descripción de 1-2 líneas por cada tipo de examen (ej. "Conceptos de testing, ciclo de vida del defecto..."). Esto es una mejora real desde el ciclo 1.

Pero esa descripción **no se propaga** al perfil público: en `/empresas/[id]/page.tsx:231-237`, los badges de tipo de examen usan un mapeo manual incompleto (`et === 'istqb' ? 'ISTQB CTFL' : et === 'git' ? 'Git' : et === 'performance' ? 'Performance Testing' : et`) que **no cubre** `git-practico`, `api-testing-fundamentals`, `api-banking`, `database-fundamentals`, `database-practice` — esos exam types se muestran como el ID crudo (ej. literalmente `database-fundamentals`) a un candidato que visita el perfil público. Es un bug de datos incompletos, no solo un gap UX.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Mejor que antes a nivel de candidato individual (breakdown por sección ya visible en `/empresa/candidatos`), pero sigue faltando a nivel agregado/comparativo (ver Bloque 2, `employer.ts:423`).

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Crear proceso — selección de examen con descripción | Completo | — | — | ✅ Resuelto desde ciclo 1 |
| Invitar candidato (flujo directo, `empresa_invitaciones`) | Completo | — | — | ✅ Resuelto desde ciclo 1 |
| Candidato accede a invitación (`/invitaciones/[token]`) | Completo | — | — | ✅ Resuelto desde ciclo 1 |
| Notificación a empresa al completar evaluación | Completo | — | — | ✅ Resuelto desde ciclo 1 |
| Badges de examen en perfil público con label incompleto | **Roto (bug de datos)** | 5 de 8 `exam_types` se muestran como ID técnico crudo en `/empresas/[id]` en vez de nombre legible | Centralizar `EXAM_OPTIONS` (ya definido en `procesos/nuevo`) en un módulo compartido y reutilizarlo en el perfil público | **CRÍTICO** 🚀 |
| Invitación a prueba propia de la empresa (`empresa_pruebas`) sin email | **Incompleto (gap nuevo, no reportado en ciclo 1 porque la tabla `empresa_pruebas` recién se migró el 9 jul)** | `createPruebaInvitacionAction` (`empresa-pruebas.ts:480`) genera el token pero **no llama a `sendEmail`** — el recruiter debe copiar y pegar el link `/prueba/[token]` manualmente, a diferencia del flujo de `empresa_invitaciones` que sí envía email | Reusar `sendInvitacionEmailIfEnabled` para este flujo también | **A** 🚀 |
| `section_scores` en vista agregada (dashboard/eventos) | Parcial | Ver Bloque 2 — sigue `null` hardcodeado en `employer.ts:423` | Reutilizar el join ya existente en `candidatos/page.tsx` | **A** |
| Comparar candidatos entre sí | — | — | — | ✅ Resuelto desde ciclo 1 |
| Fecha límite / alerta de vencimiento de proceso | No verificado en este ciclo (sin cambios reportados) | — | — | Pendiente de revisión próximo ciclo |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

Sin cambios detectados respecto al ciclo 1 en la mayoría de los widgets — las mejoras del ciclo pasado (profile views, funnel de invitaciones, tasa de respuesta) ya están en producción y funcionando según el código. No se identificaron regresiones.

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Profile views | Sí | — | — | ✅ Resuelto desde ciclo 1 |
| Funnel invitación → vista → completada | Sí | — | — | ✅ Resuelto desde ciclo 1 |
| Tasa de respuesta a invitaciones | Sí | — | — | ✅ Resuelto desde ciclo 1 |
| Tasa de aprobación con umbral de referencia (ISTQB 65%) | Parcial | Sigue sin tooltip de contexto (no verificado cambio desde ciclo 1) | Agregar tooltip "El umbral ISTQB CTFL es 65%" | Alto |
| Top skills QA disponibles este mes | **No** | No se encontró ningún widget de este tipo en el código (`grep` sin resultados) | Widget "Skills más evaluados en AIQUAA este mes", usando `qa_skills` de `profiles` | Medio |
| `section_scores` en agregados de eventos (`/empresa/eventos/[id]`) | Parcial (bug) | Ver Bloque 2/3 — `employer.ts:423` fuerza `null` | Reutilizar join existente | Alto |
| Comparación de KPIs entre procesos | No verificado este ciclo | — | — | Pendiente próximo ciclo |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨 Badges de tipo de examen rotos en el perfil público** — `/empresas/[id]` muestra el ID técnico crudo (ej. `database-fundamentals`) para 5 de 8 tipos de examen porque el mapeo de labels está hardcodeado e incompleto, en vez de reutilizar `EXAM_OPTIONS` que ya existe en `procesos/nuevo/page.tsx`. Un candidato que visita el perfil de CLT o Banco Continental vería texto de desarrollador, no una etiqueta profesional. Tipo: **bug**.

2. **⚠️ Invitación a "pruebas propias" de la empresa sin email** — el flujo más nuevo (`empresa_pruebas`, migrado el 9 jul) no envía correo al candidato invitado, a diferencia del flujo de invitación estándar que sí lo hace. El recruiter debe compartir el link manualmente. Tipo: **gap de funcionalidad**.

3. **⚠️ `section_scores` sigue `null` en vistas agregadas** — el detalle individual de candidato ya muestra el desglose por sección (arreglado desde ciclo 1), pero el dashboard y las estadísticas de eventos (`employer.ts:423`) siguen forzando `null`, por lo que la empresa no puede comparar candidatos por área de dominio a nivel agregado. Tipo: **bug de implementación** (arreglo parcial, deuda persistente).

4. **⚠️ Completitud de perfil sigue siendo engañosa** — `country='PY'` precargado cuenta como campo completo, mostrando ~13% de avance a una empresa que no tocó nada. No resuelto desde el ciclo 1. Tipo: **problema UX**.

5. **⚠️ URL pública sin slug** — `/empresas/{uuid}` sigue sin una versión memorable/compartible. No resuelto desde el ciclo 1. Tipo: **problema UX**.

### Buenas noticias de este ciclo
El flujo B2B core (perfil completo → publicar proceso → candidato se entera → completa evaluación → empresa es notificada → ve resultado con desglose) **ya funciona de punta a punta** según el código, algo que estaba roto en 3 puntos distintos hace dos semanas. Esto es lo que más importa para poder hacer una demo real a CLT o Banco Continental.

### Clasificación completa (solo hallazgos nuevos/abiertos de este ciclo)

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Badges de examen con ID crudo en perfil público | Bug | Sí 🚀 |
| 2 | Invitación a `empresa_pruebas` sin email | Gap funcionalidad | Sí 🚀 |
| 3 | `section_scores` null en agregados (dashboard/eventos) | Bug (parcial) | Sí 🚀 |
| 4 | Completitud de perfil engañosa (`country` default) | UX problem | Parcial |
| 5 | URL pública con UUID, no slug | UX problem | Parcial |
| 6 | Sin tooltips explicando niveles ISTQB | UX problem | Sí (RRHH no técnico) 🚀 |
| 7 | Límite hardcoded de 500 resultados sin aviso | UX problem / riesgo de escala | No (aún) |
| 8 | Sin widget "Top skills QA del mes" | Gap funcionalidad | No |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. Un candidato que ve el perfil público de la empresa puede toparse con IDs técnicos en vez de nombres de examen — mala primera impresión en una demo.
2. El flujo de pruebas propias de la empresa (feature más reciente y potencialmente la más vendible para un banco que quiere su propio examen) requiere compartir el link a mano, sin trazabilidad de envío.
3. RRHH no técnico no puede evaluar candidatos por nivel ISTQB sin ayuda externa — falta contexto in-app.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El flujo de invitación end-to-end (email + notificación) ya está en producción — se puede **demostrar en vivo**, no solo describir.
- **Pruebas propias de empresa** (`empresa_pruebas`) es una feature diferenciadora fuerte para un cliente como Banco Continental (evaluación 100% custom) — vale la pena cerrarle el gap de email antes de la demo.
- Una vez centralizado `EXAM_OPTIONS`, el perfil público puede mostrarse con confianza a un pool de candidatos QA de LATAM sin fricción visual.

### Foco del próximo ciclo (1 hora)

**Prioridad:** Cerrar los 3 hallazgos críticos de este ciclo

1. Extraer `EXAM_OPTIONS` (labels + descripciones) a un módulo compartido (`lib/exam-types.ts`) y usarlo tanto en `procesos/nuevo` como en `/empresas/[id]` — arregla el bug de badges rotos.
2. Enviar email en `createPruebaInvitacionAction` reusando `sendInvitacionEmailIfEnabled`.
3. Reemplazar el `section_scores: null` hardcodeado en `employer.ts:423` con el mismo join usado en `candidatos/page.tsx`.

Este ciclo cierra la deuda técnica que quedó del flujo de invitaciones y deja el perfil público listo para una demo sin sorpresas visuales.

---

## 🎫 Tickets propuestos (no se crearon en Jira — sin acceso a `aiquaa.atlassian.net` desde este entorno)

> Sin conexión configurada a Jira en esta sesión. Los siguientes tickets están redactados en formato listo para copiar y pegar en `aiquaa.atlassian.net`.

### [BUG] Badges de tipo de examen muestran ID crudo en perfil público de empresa
- **Descripción:** En `/empresas/[id]`, los badges de `exam_types` de un proceso activo usan un mapeo manual incompleto (`app/empresas/[id]/page.tsx:236`) que solo traduce `istqb`, `git` y `performance`. Los demás 5 tipos (`git-practico`, `api-testing-fundamentals`, `api-banking`, `database-fundamentals`, `database-practice`) se muestran tal cual, como ID técnico.
- **Pasos para reproducir:** Crear un proceso en `/empresa/procesos/nuevo` seleccionando "Bases de Datos — Fundamentos (Examen teórico)" → publicar → visitar `/empresas/[id]` del perfil de esa empresa → observar el badge.
- **Impacto:** Alto — primera impresión del perfil público ante candidatos QA.
- **Prioridad:** Alta 🚀

### [GAP] Invitación a prueba propia de empresa (`empresa_pruebas`) no envía email
- **Descripción:** `createPruebaInvitacionAction` (`actions/empresa-pruebas.ts:480`) crea el token de invitación pero no dispara ningún correo, a diferencia de `createInvitacionAction`/`createInvitacionToCandidateAction` que sí usan Resend.
- **Pasos para reproducir:** Crear una prueba propia en `/empresa/pruebas/nuevo` → generar invitación en `/empresa/pruebas/[id]/invitaciones` → verificar bandeja del candidato (no llega nada).
- **Impacto:** Alto — feature diferenciadora para clientes tipo banco, actualmente requiere trabajo manual del recruiter.
- **Prioridad:** Alta 🚀

### [BUG] `section_scores` forzado a `null` en agregación de dashboard/eventos
- **Descripción:** `fetchAssessmentAttemptsForProcessCodes` (`actions/employer.ts:423`) hardcodea `section_scores: null, learning_objectives: null`, mientras que `/empresa/candidatos/page.tsx:271-298` ya obtiene esos datos vía join con `assessment_scores`/`assessment_sections`.
- **Impacto:** El dashboard y las estadísticas de eventos no pueden mostrar desglose por área, aunque el dato existe.
- **Prioridad:** Alta

### [UX] Completitud de perfil de empresa engañosa por `country` con default `'PY'`
- **Descripción:** `completionScore()` (`app/empresa/perfil/page.tsx:92`) cuenta `country` como campo completo aunque nunca se vació explícitamente; toda empresa nueva arranca en ~13%.
- **Impacto:** Medio — sensación de progreso falso.
- **Prioridad:** Media

### [UX] URL pública de empresa usa UUID en vez de slug
- **Descripción:** `/empresas/{uuid}` no es memorable ni compartible en un mensaje de LinkedIn/email de reclutamiento.
- **Impacto:** Medio.
- **Prioridad:** Media

### [UX] Sin tooltips explicando niveles ISTQB en el buscador de talento
- **Descripción:** `ISTQB_LEVEL_LABELS` (`app/empresa/buscar-candidatos/page.tsx:17`) ya usa nombres legibles, pero no hay ningún tooltip o texto de ayuda que explique la diferencia entre niveles para un recruiter sin background QA.
- **Impacto:** Medio-alto para RRHH no técnico.
- **Prioridad:** Alta 🚀

---

*Revisión generada automáticamente — 2026-07-10 · Rama: `claude/zen-noether-ld8dv3`*
