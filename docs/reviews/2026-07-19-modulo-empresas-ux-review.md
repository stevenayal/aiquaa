# Revisión UX — Módulo de Empresas (ciclo 2)
**Fecha:** 19 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión de código + datos de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)
**Baseline:** [`2026-06-27-modulo-empresas-ux-review.md`](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología:** Este ciclo combina revisión estática de código (Next.js Server Actions,
> `apps/frontend/src/app/empresa/**`) con **consulta directa a la base de producción
> (Supabase, proyecto `aiquaa`)** vía MCP para verificar qué pasa con datos reales, no solo
> con el código. Todo lo marcado "confirmado en prod" viene de una query SQL ejecutada
> contra la base viva — no es una suposición.

---

## 🚨 Hallazgo crítico nuevo: el perfil de CLT en producción está vacío y sin dueño

Se consultó la tabla `empresas` en producción. Solo existen 3 registros: dos cuentas de
prueba internas (`Aiquaa` / `AIQUAA`) y **una fila real: `CLT`**, creada el 2026-06-19.

**Estado real de esa fila:**

| Campo | Valor |
|---|---|
| `logo_url` | `null` |
| `description` | `null` |
| `website_url` | `null` |
| `industry` | `null` |
| `team_size` | `null` |
| `work_mode` | `null` |
| `tech_stack` | `null` |
| `benefits` | `null` |
| `linkedin_url` | `null` |
| `qa_team_size` | `null` |
| `profile_views` | `0` |

Es decir: el cliente piloto que este mismo ciclo de revisión usa como vara de medida
(§ prompt) tiene un perfil **100% vacío** en producción, tres semanas y medio después de
creado.

Peor aún: `empresa_miembros` (la tabla que decide quién puede administrar una empresa)
**no tiene ninguna fila para el `empresa_id` de CLT**. Los únicos dos miembros activos en
todo el sistema son los dueños de las cuentas de prueba `Aiquaa`/`AIQUAA`. El acceso al
dashboard de empresa se resuelve vía `empresa_miembros` (`empresa-admin.ts`,
`employer.ts:192`, `empresa-pruebas.ts:75`), así que **hoy no existe ningún usuario que
pueda loguearse y administrar el perfil de CLT** — el registro es huérfano.

**Y hay una segunda identidad de CLT, desconectada de la primera.** El módulo de procesos
de selección (`talent_companies`, sistema separado con 2 procesos activos y 3 etapas
configuradas) tiene su propia fila para CLT: `"CENTRO LOGISTICO DE TECNOLOGIA SA"`
(creada 2026-05-21, un mes antes que el registro en `empresas`). Su columna
`aiquaaEmpresaId` — el FK pensado para enlazar ambos sistemas — está en `null`. Los dos
registros de CLT nunca se vincularon.

**Impacto para el piloto:** un recruiter de CLT que hoy entre a AIQUAA ve un perfil público
en blanco (o inaccesible, según cómo resuelva el enlace `/empresas/[id]`), no puede
editarlo porque no es "miembro" de ninguna empresa, y sus procesos de selección viven en un
sistema que ni siquiera sabe que el perfil `empresas` existe. Esto no es un problema de
diseño de UI — es un bloqueante operativo real, hoy, para el cliente piloto nombrado en
este mismo prompt. 🚀

**Prioridad:** CRÍTICA. Acción recomendada: (1) enlazar manualmente
`talent_companies.aiquaaEmpresaId` → `empresas.id` para CLT, (2) dar de alta al contacto de
CLT como `owner` en `empresa_miembros`, (3) agregar una validación/alerta que detecte
empresas sin ningún miembro activo (huérfanas) para que esto no vuelva a pasar en
silencio.

---

## ✅ Progreso confirmado desde el ciclo del 27 de junio

El ciclo anterior marcó 5 hallazgos como bloqueantes 🚀 para el piloto. Se verificó el
código actual y **la mayoría ya está resuelta**:

| # | Hallazgo (27-jun) | Estado hoy | Evidencia |
|---|---|---|---|
| 1 | Invitaciones no envían email | ✅ **Resuelto** | `empresa-invitaciones.ts` importa y usa `sendEmail` de `@/lib/resend` (línea 101) |
| 2 | Ruta pública `/invitaciones/[token]` no existe | ✅ **Resuelto** | Existe `apps/frontend/src/app/invitaciones/[token]/` |
| 3 | Directorio público `/empresas` inexistente | ✅ **Resuelto** | Existe `apps/frontend/src/app/empresas/page.tsx` (listing) y `/empresas/[id]` (perfil público) |
| 4 | Sin filtro de país en búsqueda de candidatos | ✅ **Resuelto** | `buscar-candidatos/page.tsx` tiene selector "Todos los países" con lista dinámica |
| 5 | Sin exportación CSV de resultados | ✅ **Resuelto** | CSV export presente en `empresa/candidatos/page.tsx` y `empresa/eventos/[id]/page.tsx` |
| 6 | `section_scores` descartado en la UI | ⚠️ **Parcialmente resuelto** — ver hallazgo nuevo abajo | — |

Buen ritmo de cierre de gaps — 5 de 6 bloqueantes del ciclo anterior están cerrados. El
foco recomendado del ciclo pasado (flujo de invitaciones end-to-end) se ejecutó como se
pidió.

---

## ⚠️ Hallazgo nuevo: `section_scores` inconsistente entre vistas de empresa

El ciclo anterior marcó que `section_scores` se descartaba (`null`) al normalizar
resultados de `assessment_attempts`. Eso ahora está **arreglado en una vista pero no en
otra**:

- `apps/frontend/src/app/empresa/candidatos/page.tsx` (directorio de talento, línea 316):
  hace join con `sectionScoresByAttempt` y **sí muestra** el desglose por sección.
- `apps/frontend/src/actions/employer.ts`, función `fetchAssessmentAttemptsForProcessCodes`
  (línea 417): sigue devolviendo `section_scores: null, learning_objectives: null` a mano.
  Esta función alimenta `getProcessCandidatesAction`, usada por `/empresa/procesos`,
  `/empresa/procesos/nuevo` y `/empresa/eventos/[id]` — es decir, **el flujo principal de
  "creé un proceso, invité candidatos, veo resultados"** sigue sin desglose por sección.

**Problema UX:** un recruiter que gestiona resultados desde el módulo de Procesos/Eventos
(el camino más natural — "creé el proceso, ahora reviso quién lo dio") no ve en qué área
falló o aprobó el candidato. El mismo dato sí aparece si en cambio navega al directorio
general de Talento/Candidatos. Es una inconsistencia entre dos vistas que muestran datos
que deberían ser idénticos.

**Prioridad:** Alta. Acción recomendada: reusar el mismo join de `candidatos/page.tsx` en
`fetchAssessmentAttemptsForProcessCodes`, o extraer la lógica a una función compartida.

---

## 📋 Cierre del ciclo

### Resumen ejecutivo (top hallazgos)

1. 🚨 **CLT, el cliente piloto nombrado en este ciclo, tiene un perfil de empresa vacío,
   sin ningún miembro con acceso, y duplicado sin vincular entre `empresas` y
   `talent_companies`.** Confirmado con datos reales de producción, no es una hipótesis.
   Tipo: **bug de datos / gap operativo**. 🚀
2. ✅ Los 5 bloqueantes críticos del ciclo del 27-jun (email de invitación, ruta pública
   por token, directorio `/empresas`, filtro de país, export CSV) están resueltos.
3. ⚠️ `section_scores` se muestra en el directorio de Talento pero **no** en la vista de
   Procesos/Eventos — mismo dato, dos comportamientos distintos según por dónde entre el
   recruiter. Tipo: **bug de implementación**.
4. El resto de los gaps de diseño menores del ciclo anterior (slug en vez de UUID en la
   URL pública, completitud de perfil engañosa por `country='PY'` default, botón "eliminar
   logo") siguen abiertos — no se re-verificaron en detalle este ciclo por límite de
   tiempo; quedan para el próximo ciclo.

### Clasificación

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Perfil de CLT vacío, huérfano (sin miembros) y duplicado sin vincular entre `empresas`/`talent_companies` | Bug de datos / gap operativo | **Sí — hoy** 🚀 |
| 2 | `section_scores` no se muestra en vista Procesos/Eventos (sí en Talento) | Bug | Sí 🚀 |

### Nota sobre creación de tickets en Jira

Esta sesión automatizada no tiene acceso configurado a `aiquaa.atlassian.net` (no hay
conector MCP de Jira disponible), por lo que los tickets no pudieron crearse directamente
ahí. Se dejan redactados abajo, listos para pegar:

**Ticket 1 — [CRÍTICO] Perfil de empresa CLT vacío y sin miembros en producción**
- **Descripción:** El registro de CLT en `empresas` (id creado 2026-06-19) no tiene
  ningún campo de perfil completado y no tiene ninguna fila asociada en
  `empresa_miembros`, por lo que ningún usuario puede administrarlo. Existe además un
  registro separado y no vinculado de CLT en `talent_companies`
  (`d438a219-147d-4e0d-9ceb-5fa180da0ea5`, "CENTRO LOGISTICO DE TECNOLOGIA SA") con
  `aiquaaEmpresaId = null`.
- **Pasos para reproducir:** Consultar `select * from empresas where razon_social='CLT'`
  y `select * from empresa_miembros where empresa_id = <ese id>` en el proyecto Supabase
  `aiquaa` (`cbkctkpyxwbufvbwxogp`) — el segundo query devuelve 0 filas.
- **Impacto:** Alto — bloquea el uso real de la plataforma por el cliente piloto CLT.
- **Prioridad:** Crítica.

**Ticket 2 — [ALTA] `section_scores` no visible en resultados desde Procesos/Eventos**
- **Descripción:** `fetchAssessmentAttemptsForProcessCodes` en
  `apps/frontend/src/actions/employer.ts:417` fuerza `section_scores` y
  `learning_objectives` a `null`, mientras que `apps/frontend/src/app/empresa/candidatos/page.tsx`
  sí los completa correctamente para la misma fuente de datos (`assessment_attempts`).
- **Pasos para reproducir:** Comparar el resultado de un mismo candidato en
  `/empresa/procesos/[id]` (o `/empresa/eventos/[id]`) vs. `/empresa/candidatos` — el
  desglose por sección solo aparece en la segunda vista.
- **Impacto:** Medio-alto — inconsistencia de datos entre pantallas del mismo módulo.
- **Prioridad:** Alta.

### Foco del próximo ciclo (1 hora)

**Prioridad 1:** Reparar el caso CLT en producción (vincular `talent_companies` ↔
`empresas`, asignar owner) y agregar una alerta/reporte de "empresas sin miembros
activos" para detectar huérfanos futuros — este tipo de bug es invisible en revisión de
código y solo aparece consultando datos reales.

**Prioridad 2:** Unificar `fetchAssessmentAttemptsForProcessCodes` con el join de
`section_scores` que ya funciona en `candidatos/page.tsx`.

**Prioridad 3:** Retomar los hallazgos de diseño menores pendientes del ciclo del 27-jun
(slug de URL pública, completitud de perfil, comparación side-by-side de candidatos).

---

*Revisión generada automáticamente — 2026-07-19 · Rama: `claude/zen-noether-g03d9j`*
