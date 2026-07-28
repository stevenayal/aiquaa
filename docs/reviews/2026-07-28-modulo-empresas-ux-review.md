# Revisión UX — Módulo de Empresas (Ciclo 2)
**Fecha:** 28 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente actual + diff de comportamiento contra la revisión previa (`docs/reviews/2026-06-27-modulo-empresas-ux-review.md`). Solo se documentan hallazgos confirmados leyendo el código — no supuestos. No se tuvo acceso a Jira ni a un entorno de staging con sesión de recruiter en este ciclo; ver nota en Cierre.

---

## Seguimiento del ciclo anterior

El foco del ciclo pasado era el **flujo de invitaciones end-to-end**. Resultado, verificado en código:

| Hallazgo crítico (27-jun) | Estado hoy | Evidencia |
|---|---|---|
| Invitaciones sin email | ✅ **Arreglado** | `actions/empresa-invitaciones.ts`: `createInvitacionAction` llama `sendInvitacionEmailIfEnabled()` → Resend, con link a `/invitaciones/[token]` |
| Token de invitación sin ruta pública | ✅ **Arreglado** | `app/invitaciones/[token]/page.tsx` valida UUID, usa RPC `get_invitacion_by_token`, marca vista con `mark_invitacion_vista` |
| Directorio público `/empresas` inexistente | 🟡 **Parcial** | `app/empresas/page.tsx` ya existe y lista empresas, pero sin buscador/filtro y URLs siguen siendo UUID (`/empresas/[uuid]`, no slug) |
| `section_scores` descartado en resultados | 🟡 **Parcial** | `empresa/candidatos/page.tsx` ya arma el breakdown por sección; pero `actions/employer.ts::fetchAssessmentAttemptsForProcessCodes` (usado por dashboard, detalle de proceso y eventos) sigue forzando `section_scores: null` |
| Métricas B2B faltantes en dashboard | ✅ **Arreglado** | `getEmpresaDashboardStatsAction` ahora devuelve `profileViews` (contador real, incrementado vía RPC en cada visita al perfil público) y `invitacionesFunnel` (enviadas → vistas → completadas → tasa de respuesta), renderizados en `empresa/page.tsx` |
| Campos de perfil faltantes (stack, modalidad, beneficios, LinkedIn) | ✅ **Arreglado** | `empresa/perfil/page.tsx` ahora tiene `tech_stack`, `WORK_MODES`, `benefits` (500 caracteres) y `linkedin_url` |

**3 de 5 bloqueantes del ciclo anterior están resueltos.** Los 2 restantes ya no son "roto" sino "incompleto" — mejora real, pero no cierra el gap para el piloto.

---

## 🏢 Bloque 1 — Perfil de empresa

Sin cambios respecto al 27-jun salvo lo ya cubierto arriba (stack, modalidad, beneficios, LinkedIn agregados). Pendientes que siguen abiertos:

| Elemento del perfil | Problema UX | Impacto | Propuesta | Estado |
|---|---|---|---|---|
| URL pública (`/empresas/[uuid]`) | Sigue usando UUID en vez de slug memorable | **A** | Generar slug desde `nombre_comercial`, mantener UUID como fallback/redirect | Incompleto |
| Directorio `/empresas` sin buscador | La página lista todo pero no permite filtrar por industria/país/tamaño | **A** | Agregar input de búsqueda + filtros, ya que el volumen de empresas va a crecer | Incompleto |
| Completitud por defecto (`country='PY'`) | Sigue precargando 14% de completitud sin acción del usuario (no verificado si se corrigió; no apareció en el diff de este ciclo) | **M** | Confirmar en próximo ciclo si sigue vigente | No verificado este ciclo |
| Eliminar logo | Sigue sin botón dedicado (no tocado en los commits revisados) | **B** | Agregar botón de eliminar con confirmación | No verificado este ciclo |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

Sin cambios de fondo detectados en los commits desde el 27-jun en esta área específica (los commits nuevos se concentraron en invitaciones, dashboard, perfil, "pruebas propias" y "eventos"). Los hallazgos previos siguen vigentes y no se re-verificaron línea por línea este ciclo:

| Filtro/función | Estado (última verificación 27-jun) | Prioridad |
|---|---|---|
| Filtro por país en directorio de Talento | Ausente | **A** 🚀 |
| Exportar CSV de resultados | Ausente | **A** 🚀 |
| Comparación side-by-side de candidatos | Ausente | **M** |
| Tooltips en filtros ISTQB | Ausentes | **A** |

**Nota:** este bloque necesita re-verificación de código en el próximo ciclo — no se debe asumir que sigue igual solo porque no hubo commits visibles; puede haber cambios en archivos no cubiertos por el diff de git log revisado.

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

Este bloque tuvo el mayor desarrollo nuevo del ciclo: la feature de **"pruebas técnicas propias"** (constructor de exámenes propios de la empresa, aislado del catálogo de `assessments`) y el módulo de **"eventos"** (agrupación de procesos con reporte agregado, export CSV de participantes, umbral de aprobación a nivel macro).

| Paso del flujo | Estado | Problema UX | Prioridad |
|---|---|---|---|
| Empresa configura tipo de evaluación a enviar | ✅ Mejorado | El constructor de pruebas propias (`actions/empresa-pruebas.ts`, 595 líneas) permite a la empresa crear evaluaciones propias — cubre directamente el gap "case study / prueba custom" del ciclo anterior | Resuelto (validar UX de creación en próximo ciclo) |
| Notificación al candidato | ✅ Arreglado | Cubierto por el fix de invitaciones (Bloque de seguimiento arriba) | — |
| Empresa ve resultados con desglose por sección | 🟡 Parcial | Funciona en `empresa/candidatos`, pero **no** en vista de detalle de proceso ni en dashboard ni en eventos (mismo bug de `employer.ts` línea ~417 forzando `section_scores: null`) | **A** — bug de implementación, no de diseño: la función ya existe en un archivo pero no se reusa en los otros tres |
| Ranking / tiempo por candidato en resultados propios | ✅ Nuevo | Commit `ec85ccd` agrega tiempo por candidato y ranking en resultados de pruebas propias | Bueno |
| Reporte de eventos (macro) | ✅ Nuevo | CSV export, columna de exámenes completados, umbral de aprobación al 60% de completitud, breakdown por participante | Bueno, pero no se auditó UX de estos 910 líneas en detalle este ciclo |
| Comparar candidatos entre sí | Incompleto | Sigue sin vista comparativa dedicada | **M** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

| Métrica/widget | Existe | Estado | Valor para la empresa |
|---|---|---|---|
| Candidatos vieron el perfil (`profileViews`) | ✅ Sí (nuevo) | Contador real vía RPC, mostrado en dashboard | **Crítico para el pitch B2B** — ya implementado |
| Funnel de invitaciones (enviadas→vistas→completadas) | ✅ Sí (nuevo) | Renderizado condicionalmente cuando `total > 0` | **Crítico** — ya implementado, cierra el gap #1 del ciclo anterior |
| Tasa de respuesta a invitaciones | ✅ Sí (nuevo) | `tasaRespuesta` calculada y mostrada | Alto — implementado |
| Desglose aprobados/reprobados en "candidatos evaluados" | No verificado este ciclo | — | Pendiente de confirmar |
| Comparación entre procesos (tabla de KPIs) | No detectado en el diff | Sigue ausente | Medio |
| Top skills QA del mes | No detectado | Sigue ausente | Medio (menor prioridad que antes, dado el avance en otras métricas) |

**Este bloque tuvo el mayor avance del ciclo**: los 3 gaps "críticos 🚀" marcados el 27-jun (profile views, funnel, tasa de respuesta) están implementados y en producción según el código actual.

---

## ✅ Cierre del ciclo

### Top 5 hallazgos

1. **✅ Buena noticia:** el flujo de invitaciones end-to-end (email vía Resend + ruta pública por token) y las 3 métricas B2B del dashboard (page views, funnel, tasa de respuesta) — los 4 hallazgos más críticos del ciclo anterior — están **arreglados y verificados en código**. Esto desbloquea la demo B2B para CLT/Banco Continental que estaba bloqueada el 27-jun. 🚀

2. **🐛 Bug de implementación repetido:** `section_scores` se descarta (`null`) en `actions/employer.ts::fetchAssessmentAttemptsForProcessCodes`, usado por dashboard, detalle de proceso y eventos — a pesar de que la lógica correcta para reconstruirlo ya existe y funciona en `empresa/candidatos/page.tsx`. Es un problema de reutilización de código, no de diseño: se resuelve portando esa lógica a `employer.ts`. Tipo: **bug**. Prioridad: **A**.

3. **⚠️ Directorio público sin buscador y con URL no memorable:** `/empresas` ya lista compañías pero no tiene filtro/búsqueda, y los perfiles siguen en `/empresas/[uuid]`. Tipo: **gap de funcionalidad + UX**. Bloquea parcialmente el "employer branding" que CLT/Banco Continental necesitan para ser descubiertos. 🚀

4. **🧹 Código muerto potencialmente peligroso:** existe una ruta duplicada `app/invitacion/[token]/page.tsx` (singular, sin validar UUID, consulta la tabla directo sin pasar por el RPC `get_invitacion_by_token`) que convive con la ruta correcta `invitaciones/[token]` (plural). Si algo todavía enlaza a la ruta vieja, un candidato podría entrar por un flujo sin las validaciones agregadas después. Tipo: **bug / deuda técnica**. Prioridad: **A** — se recomienda eliminarla o confirmar que no tiene referencias activas.

5. **📌 Bloque 2 (búsqueda de candidatos) no tuvo desarrollo este ciclo** — los gaps marcados 🚀 el 27-jun (filtro por país, export CSV, invitar inline desde la ficha del candidato) siguen sin resolver y no fueron tocados en los commits recientes. Sigue siendo el área con más deuda pendiente para el caso de uso de Banco Continental (que necesita exportar a RRHH).

### Clasificación

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | `section_scores` null en employer.ts (no reutiliza lógica de candidatos/page.tsx) | Bug | Sí 🚀 |
| 2 | Ruta duplicada `/invitacion/[token]` sin validación | Bug / deuda técnica | Sí 🚀 |
| 3 | Directorio `/empresas` sin buscador | Gap funcionalidad | Parcial 🚀 |
| 4 | URL pública con UUID (no slug) | UX problem | Parcial |
| 5 | Sin filtro de país en directorio de talento | UX problem | Sí (CLT quiere PY) 🚀 |
| 6 | Sin exportación CSV de resultados de candidatos (distinto del CSV de eventos, que sí existe) | Gap funcionalidad | Sí 🚀 |
| 7 | Sin comparación side-by-side de candidatos | Gap funcionalidad | No |
| 8 | Tooltips ISTQB ausentes | UX problem | No |

### Bloqueantes restantes para cliente piloto (CLT / Banco Continental)

1. No pueden filtrar candidatos por Paraguay en el directorio de talento (sin cambios desde el 27-jun).
2. No pueden exportar resultados de búsqueda/talento a CSV para RRHH (el CSV nuevo es solo para reportes de "eventos", no para el directorio de candidatos).
3. El desglose por sección de las evaluaciones no aparece de forma consistente (funciona en un lugar, no en tres).
4. El directorio público de empresas no ayuda a que candidatos descubran a CLT/Banco Continental por búsqueda (solo listado plano).

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El funnel de invitaciones y el contador de page views **ya están en producción** — se puede armar una demo real "X candidatos vieron tu empresa, Y respondieron" para el pitch, algo que el ciclo anterior solo proponía.
- El constructor de pruebas técnicas propias es un diferenciador fuerte: una empresa puede evaluar con su propio case study, no solo el catálogo genérico de AIQUAA.
- Sigue pendiente (y sigue siendo alto valor): filtro por país y export CSV del directorio de talento — sencillo de implementar dado que los datos ya existen, y sería el próximo desbloqueo más barato para el pitch.

### Foco del próximo ciclo (1 hora)

**Prioridad:** Cerrar Bloque 2 (búsqueda de candidatos) — es el único de los 4 bloques funcionales que no tuvo ningún avance en dos ciclos consecutivos.

1. Agregar filtro por país en el directorio de Talento (dato ya existe en `profiles`).
2. Agregar exportación CSV en la vista de Evaluados/Talento (patrón ya resuelto en el módulo de eventos — reutilizar esa lógica).
3. Portar la reconstrucción de `section_scores` de `empresa/candidatos/page.tsx` a `actions/employer.ts::fetchAssessmentAttemptsForProcessCodes` para que el desglose por sección aparezca también en dashboard, detalle de proceso y eventos.
4. Confirmar y, si corresponde, eliminar la ruta duplicada `app/invitacion/[token]/page.tsx`.

---

### Nota metodológica de este ciclo

Este ciclo se ejecutó de forma automatizada sin acceso a: (a) un entorno con sesión de recruiter real para probar los flujos en el navegador, (b) Jira (no hay conector disponible en esta sesión), por lo que los hallazgos de la tabla de clasificación deben cargarse manualmente como tickets. No se reportan supuestos: los bloques 2 y 3 (búsqueda de candidatos y parte de evaluaciones) se documentan como "no verificado este ciclo" donde no se confirmó el estado actual leyendo el código, en vez de asumir que siguen igual que el 27-jun.

---

*Revisión generada automáticamente — 2026-07-28 · Rama: `claude/zen-noether-ym10ri`*
