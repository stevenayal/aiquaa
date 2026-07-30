# Revisión UX — Módulo de Empresas
**Fecha:** 30 de julio de 2026
**Ciclo:** Mejora continua · 60 min (ciclo #2)
**Reviewer:** QA Lead (revisión de código + inspección de datos de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, RPCs de Supabase) **más inspección read-only de la base de datos de producción** (proyecto Supabase `aiquaa`, `cbkctkpyxwbufvbwxogp`) para verificar qué está realmente en uso, no solo qué está implementado. No se crearon cuentas, procesos, invitaciones ni se envió ningún email real durante este ciclo — cualquier acción de escritura en producción (crear una empresa, invitar a un candidato) queda fuera de este ciclo y requiere confirmación explícita antes de ejecutarse. Se comparan los hallazgos contra la [revisión anterior (2026-06-27)](./2026-06-27-modulo-empresas-ux-review.md).

---

## 🎯 Resumen ejecutivo (léase primero)

**El equipo implementó, en el commit `0491b6e` (2026-06-27, mismo día del ciclo anterior), los 3 bloqueantes críticos del ciclo pasado**: email de invitación vía Resend, ruta pública `/invitaciones/[token]`, y el widget de funnel del dashboard. Eso es una vuelta de ciclo completa y exitosa — buena señal de velocidad de ejecución.

**Pero la inspección de producción revela el verdadero bloqueante ahora**: **la cuenta de CLT (cliente piloto) tiene el perfil de empresa 100% vacío, cero procesos de contratación creados y cero invitaciones enviadas.** El código está listo; el piloto no ha arrancado. Este ciclo cambia el foco de "¿qué falta construir?" a "¿por qué el piloto no está usando lo que ya existe?" — ver bloque de cierre.

---

## 🏢 Bloque 1 — Perfil de empresa

### Qué se verificó
Código: `apps/frontend/src/app/empresa/perfil/page.tsx`, `apps/frontend/src/actions/empresa-admin.ts`, migraciones `20260505_000000`, `20260602_000000`, `20260627_000000`.
Producción (SQL read-only sobre `public.empresas`, 3 filas — todas las que existen): **Aiquaa**, **AIQUAA** (probable duplicado de prueba/QA interno) y **CLT** (cliente piloto real).

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
El formulario en sí es claro (barra de completitud, anchors a campos faltantes, contador de caracteres en `description`). Pero eso es irrelevante si nadie lo completa: **las 3 empresas en producción tienen `industry`, `work_mode`, `tech_stack`, `benefits`, `linkedin_url`, `logo_url` y `description` en `NULL`**, incluyendo CLT. El formulario existe pero no hay ningún nudge (email, banner persistente, bloqueo de otras acciones) que empuje a completar el perfil tras el registro.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Hoy, no. `/empresas/[id]` para CLT renderizaría una tarjeta esencialmente vacía: sin logo, sin descripción, sin stack, sin modalidad de trabajo. `profile_views = 0` en las 3 empresas — nadie ha visto ningún perfil todavía (consistente con que el directorio público es nuevo, del mismo commit `0491b6e`).

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Adopción del formulario (dato de producción) | Las 3 empresas reales en DB, incluyendo CLT, tienen el perfil vacío pese a que el formulario está completo desde `0491b6e` | **A** 🚀 | Onboarding activo: email post-registro "completá tu perfil en 2 min", banner persistente en `/empresa/*` mientras `profile_views`-worthy campos falten | Construido pero sin adopción |
| URL pública del perfil | Sigue siendo UUID (`/empresas/{uuid}`), no slug | **M** | Generar slug desde `nombre_comercial` (ya señalado en ciclo anterior, sin cambios) | Incompleto (sin cambios) |
| Completitud por defecto | `country='PY'` sigue precargado → completitud no arranca en 0% | **B** | Calcular completitud solo tras primer guardado explícito (sin cambios) | Incompleto (sin cambios) |
| Eliminar logo | Sigue sin opción de eliminar, solo reemplazar | **B** | Botón "Eliminar logo" con confirmación (sin cambios) | Incompleto (sin cambios) |
| Duplicado "Aiquaa" / "AIQUAA" | Dos empresas con nombre casi idéntico en producción — probablemente un registro de prueba interno que quedó en la base real | **M** | Confirmar con el equipo si `AIQUAA` (o `Aiquaa`) es descartable; si es de prueba, no debería convivir con datos de clientes reales | Dato sucio en prod |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Qué se verificó
Código: `apps/frontend/src/app/empresa/buscar-candidatos/page.tsx`, `apps/frontend/src/app/empresa/candidatos/page.tsx`, `apps/frontend/src/actions/employer.ts`. Migración `20260702_220000_empresa_candidate_sourcing.sql`.

### Novedades desde el ciclo anterior (mejoras confirmadas)
- **Filtro por país** — implementado (el ciclo pasado lo marcaba como bloqueante 🚀). Confirmado en `get_empresa_candidate_sourcing` RPC.
- **Botón "Invitar" inline** en la ficha del candidato — implementado, con modal de confirmación (`empresa-invitaciones.ts`).
- **Exportación CSV** de la pestaña Evaluados — implementada (`exportCSV`, botón "📥 Exportar CSV").

### Hallazgo persistente (verificado en código, no en el archivo que se creía arreglado)
El ciclo anterior reportó que `section_scores` se descartaba (`null`) al normalizar `assessment_attempts`, y el commit `bbe0760` (27/06) dice haberlo corregido. **Es un arreglo parcial**: corrigió la ruta usada por `apps/frontend/src/app/empresa/candidatos/page.tsx` (join contra `assessment_scores`), pero **`fetchAssessmentAttemptsForProcessCodes` en `apps/frontend/src/actions/employer.ts` (línea ~417) sigue hardcodeando `section_scores: null, learning_objectives: null`**. Esta función alimenta la vista de resultados por proceso — es decir, el recruiter que entra desde `/empresa/procesos/[id]` sigue sin ver el desglose, aunque el que entra desde `/empresa/candidatos` ahora sí lo ve. Inconsistencia entre dos pantallas que deberían mostrar el mismo dato.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Desglose `section_scores` en vista por proceso | Sigue en `null` en `employer.ts:417` (`fetchAssessmentAttemptsForProcessCodes`) mientras que `candidatos/page.tsx` ya lo corrigió | Dos pantallas de resultados muestran distinta cantidad de información para el mismo candidato | Reusar el mismo join de `assessment_scores` en `employer.ts` que ya se usa en `candidatos/page.tsx` | **A** |
| Comparar candidatos | No existe vista side-by-side (sin cambios desde ciclo anterior) | Recruiter compara manualmente | Checkbox multi-select + modal comparativo (max 3) | **M** |
| Tooltips ISTQB (`ctfl`, `ctal_ta`) | Sin cambios — siguen sin descripción | Recruiter no técnico no entiende el filtro | Etiquetas completas + tooltip | **M** |
| Límite 500 filas en `exam_results` | No re-verificado línea por línea este ciclo; se mantiene como hallazgo abierto del ciclo anterior | Riesgo de truncado silencioso a medida que crece la plataforma | Paginación real | **M** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Qué se verificó
Código: `apps/frontend/src/actions/empresa-invitaciones.ts`, `apps/frontend/src/app/invitaciones/[token]/page.tsx`, `apps/frontend/src/actions/empresa-result-notifications.ts`.
Producción: tabla `empresa_invitaciones` — **0 filas**. Ninguna empresa, incluyendo CLT, ha enviado una sola invitación desde que la funcionalidad existe.

### El flujo que estaba "roto" el ciclo pasado ahora está construido de punta a punta
1. `createInvitacionAction` envía email real vía Resend (gateado por `EMAIL_SENDING_ENABLED`), y registra `email_sent`/`email_error` si falla.
2. `/invitaciones/[token]` es una ruta pública real, valida el token, muestra la tarjeta de la empresa y el proceso.
3. `notifyEmpresaExamCompleted` avisa por email a la empresa cuando el candidato termina.

**Esto no fue probado en vivo en este ciclo** (no se creó ninguna invitación real para no enviar un email de producción sin autorización explícita) — la verificación es por lectura de código, no por ejecución end-to-end. Dado que son 0 filas en producción, **tampoco hay ningún caso real que confirme que el flujo funcionó alguna vez fuera de desarrollo.**

Punto abierto que no pude verificar con las herramientas disponibles: si la variable `EMAIL_SENDING_ENABLED` está efectivamente en `true` en el entorno de producción de Vercel. El código trata su ausencia como "no enviar" sin error visible para el recruiter — si está apagada en prod, el botón "Invitar" del recruiter parece funcionar pero el candidato nunca recibe nada.

### Tabla de hallazgos

| Paso del flujo | Estado (código) | Estado (uso real) | Problema UX | Prioridad |
|---|---|---|---|---|
| Invitar candidato → email Resend | Completo | **Sin ningún caso de uso real** (0 filas en `empresa_invitaciones`) | No se puede confirmar en este ciclo si el email realmente llega al candidato en producción | **A** 🚀 (verificar antes de la demo a CLT) |
| Flag `EMAIL_SENDING_ENABLED` en prod | Desconocido (sin acceso a variables de entorno de Vercel desde este ciclo) | — | Si está apagada, la empresa cree que invitó y el candidato nunca se entera, sin error visible | **CRÍTICO** 🚀 |
| Candidato accede por token | Completo | No probado en vivo este ciclo | — | — |
| Notificación a empresa al completar | Completo | No probado en vivo este ciclo (0 casos) | — | — |
| Desglose de sección en resultado | Parcial (ver Bloque 2) | — | Inconsistente entre pantallas | **A** |
| `max_attempts` configurable | Sin cambios — sigue sin existir | — | — | **B** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Qué se verificó
Código: `apps/frontend/src/app/empresa/page.tsx`, `apps/frontend/src/actions/employer.ts` (`getEmpresaDashboardStatsAction`).
Producción: para CLT, todos los insumos del dashboard son cero (`profile_views=0`, 0 `hiring_processes`, 0 `empresa_invitaciones`).

### Confirmado: los 3 gaps "Crítico" del ciclo anterior están resueltos en código
Profile views, funnel de invitaciones (enviadas → vistas → completadas) y tasa de respuesta están implementados y usan datos reales de `empresas.profile_views` y `empresa_invitaciones.viewed_at/completed_at`.

### Pero el dashboard de CLT hoy es, necesariamente, un empty state total
No es un bug — es el resultado esperado de que CLT no haya usado la plataforma. Vale la pena confirmarlo visualmente (no se hizo en este ciclo por no autenticarse como el usuario de CLT en producción): que el empty state con las 2 CTAs bien diseñadas (según el ciclo anterior) sea lo primero que ve alguien de CLT si entra hoy, y que no haya ningún estado intermedio confuso (ej. tarjetas en blanco sin mensaje).

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Perfil visto por candidatos | Sí (nuevo desde ciclo anterior) | Sin datos reales aún para validar en producción | Confirmar visualmente con una cuenta real antes de la demo a CLT | Alto |
| Funnel invitación → vista → completada | Sí (nuevo) | Sin datos reales aún (0 invitaciones) | Idem | Alto |
| Comparación entre procesos | No | Sin cambios desde ciclo anterior | Tabla resumen por proceso | Medio |
| Top skills QA este mes | No | Sin cambios | Widget de market intelligence | Medio |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨 El cliente piloto CLT tiene el perfil de empresa vacío, cero procesos y cero invitaciones en producción.** El código para todo el flujo ya existe. Esto no es un problema de la plataforma — es un problema de activación/onboarding del piloto. Tipo: **gap de adopción / proceso, no de código**. 🚀
2. **🚨 No hay confirmación de que el envío de email de invitaciones funcione en producción** — 0 casos reales, y no se pudo verificar si `EMAIL_SENDING_ENABLED` está activo en Vercel. Si está apagado, el flujo B2B core parece funcionar para el recruiter pero falla silenciosamente para el candidato. Tipo: **riesgo operativo, posible bug de configuración**. 🚀
3. **⚠️ `section_scores` sigue en `null` en la ruta de resultados por proceso** (`employer.ts:417`), aunque se corrigió en la ruta de "Evaluados". Inconsistencia entre dos pantallas del mismo dato. Tipo: **bug, arreglo parcial del ciclo anterior**.
4. **⚠️ Datos sucios en producción**: dos empresas casi idénticas ("Aiquaa"/"AIQUAA") probablemente de prueba, conviviendo con CLT en la misma tabla real. Tipo: **higiene de datos**.
5. **✅ Los 3 bloqueantes críticos del ciclo anterior (invitación sin email, sin ruta pública, sin funnel en dashboard) están resueltos en código** — buena velocidad de ejecución del equipo, vale la pena registrarlo como señal positiva, no solo hallazgos negativos.

### Clasificación

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | CLT sin perfil/procesos/invitaciones reales en producción | Gap de adopción (no de código) | Sí 🚀 |
| 2 | Sin confirmación de envío real de emails de invitación | Riesgo operativo / posible config | Sí 🚀 |
| 3 | `section_scores` null en vista por proceso (`employer.ts:417`) | Bug (arreglo parcial) | Parcial |
| 4 | Empresas duplicadas/de prueba en tabla de producción | Higiene de datos | No |
| 5 | Sin URL con slug, sin eliminar logo, sin comparación de candidatos, sin tooltips ISTQB | UX / gap funcionalidad (heredado, sin cambios) | No |

### Tickets sugeridos (borrador — **no se crearon en Jira**: esta sesión no tiene acceso configurado a `aiquaa.atlassian.net`; quedan listos para copiar/pegar o para que una sesión con integración de Jira los cree)

**[EMPRESAS-1] Verificar y activar envío real de email de invitación en producción**
- Descripción: Confirmar el valor de `EMAIL_SENDING_ENABLED` en Vercel prod y ejecutar una invitación de prueba end-to-end (empresa de staging → email real → `/invitaciones/[token]`) antes de cualquier demo a CLT.
- Pasos para reproducir: Revisar variables de entorno del proyecto en Vercel; si no hay forma de confirmar sin acceso, documentar como riesgo abierto.
- Impacto: Alto — flujo B2B core podría estar fallando silenciosamente.
- Prioridad: Crítica.

**[EMPRESAS-2] Unificar el desglose de `section_scores` entre `/empresa/candidatos` y `/empresa/procesos/[id]`**
- Descripción: `employer.ts:417` (`fetchAssessmentAttemptsForProcessCodes`) sigue devolviendo `section_scores: null`; reusar el join contra `assessment_scores` ya implementado en `candidatos/page.tsx`.
- Impacto: Medio-alto — inconsistencia de información según desde dónde entra el recruiter.
- Prioridad: Alta.

**[EMPRESAS-3] Onboarding activo de perfil de empresa post-registro**
- Descripción: Ninguna de las 3 empresas reales en producción (incluyendo CLT) completó su perfil pese a que el formulario existe. Agregar email transaccional + banner persistente hasta completar campos clave (industria, stack, modalidad).
- Impacto: Alto — el perfil público, que debería atraer talento QA, está vacío para el piloto.
- Prioridad: Alta. 🚀

**[EMPRESAS-4] Limpiar registro de empresa duplicado/de prueba en producción**
- Descripción: Confirmar si "Aiquaa"/"AIQUAA" es un registro de QA interno; si lo es, eliminarlo o marcarlo como no público para no ensuciar el directorio `/empresas` que verán candidatos reales.
- Impacto: Bajo-medio.
- Prioridad: Media.

### Bloqueantes reales para el piloto (CLT / Banco Continental) — actualizado

A diferencia del ciclo anterior (donde los bloqueantes eran de código), **hoy el bloqueante es de activación**: el producto tiene el flujo B2B completo construido, pero nadie del lado de CLT lo está usando todavía. Antes de la próxima demo:
1. Confirmar que el envío de email funciona en producción (riesgo #2 arriba).
2. Completar manualmente o acompañar a CLT a completar su perfil de empresa.
3. Crear al menos un proceso de contratación y una invitación de prueba con CLT para validar el flujo end-to-end con datos reales, no solo en código.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀
- El equipo resolvió en un solo ciclo los 3 bloqueantes técnicos identificados la semana anterior — buena historia de velocidad para el pitch.
- Todo el instrumental de métricas (profile views, funnel, tasa de respuesta) ya está construido y listo para mostrarse en cuanto haya datos reales de CLT.
- El riesgo de adopción (piloto sin activar) es accionable en días, no semanas — no requiere desarrollo nuevo, solo trabajo de éxito de cliente/CS con CLT.

### Foco del próximo ciclo (1 hora)

**Prioridad: activación real del piloto, no más código nuevo.**
1. Confirmar `EMAIL_SENDING_ENABLED` en producción y correr una invitación de prueba real de punta a punta.
2. Acompañar a CLT a completar su perfil de empresa y crear su primer proceso real.
3. Arreglar la inconsistencia de `section_scores` en `employer.ts:417` (fix chico, alto valor).
4. Revisar y limpiar el registro de empresa duplicado en producción.

---

*Revisión generada automáticamente — 2026-07-30 · Rama: `claude/zen-noether-a30jyf` · Ciclo #2, construye sobre [2026-06-27-modulo-empresas-ux-review.md](./2026-06-27-modulo-empresas-ux-review.md)*
