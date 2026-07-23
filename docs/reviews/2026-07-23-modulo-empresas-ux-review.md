# Revisión UX — Módulo de Empresas (Ciclo 2)
**Fecha:** 23 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)
**Ciclo anterior:** [2026-06-27](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, modelos de Supabase) mediante 4 sub-auditorías paralelas, cada una verificando el estado actual de los 10 hallazgos del ciclo anterior con evidencia de código (no supuestos), más evaluación UX fresca por bloque.

---

## 📌 Resumen de avance desde el ciclo anterior

Entre el 27/06 y hoy hubo trabajo real y sustancial en el módulo: `0491b6e feat: employer branding, invitation email, public company directory, analytics`, `ead7858 feat(empresa): add b2b candidate search`, `bbe0760 fix(empresas): section_scores + prep email sin enviar`, `b1630d9 fix: harden exam persistence and company notifications`, y el nuevo sistema paralelo `9b5e5ae feat(empresa): constructor de pruebas técnicas propias`.

De los **10 hallazgos críticos** del ciclo anterior: **3 quedaron completamente resueltos**, **5 parcialmente resueltos**, **2 siguen abiertos**. El hallazgo más importante de este ciclo es que **el bloqueante #1 (invitaciones sin email) no está realmente resuelto en producción** — el código de envío es real, pero vive detrás de un feature flag que no existe en ninguna configuración documentada del repo.

---

## 🏢 Bloque 1 — Perfil de empresa

### Estado de hallazgos previos

| # | Hallazgo (27/06) | Estado |
|---|---|---|
| 1 | Faltan stack tecnológico, modalidad, beneficios, LinkedIn | ✅ **FIXED** |
| 2 | URL pública con UUID, no slug | ❌ **ABIERTO** |
| 3 | Directorio público `/empresas` inexistente | 🟡 **PARCIAL** (existe pero sin buscador/filtro/paginación) |
| 4 | Sin preview inline | ❌ **ABIERTO** |
| 5 | `country` default `'PY'` da completitud engañosa | ❌ **ABIERTO** (empeoró: ahora ~25% falso con 8 campos) |
| 6 | Sin redes sociales | 🟡 **PARCIAL** (LinkedIn sí, Instagram/X no) |
| 7 | Sin "eliminar logo" | ❌ **ABIERTO** |
| 8 | Sin contador de caracteres | ❌ **ABIERTO** |
| 9 | RUC no adaptado por país | 🟡 **PARCIAL** (valida por país, pero label fijo "RUC") |
| 10 | Empty state con % engañoso | ❌ **ABIERTO** (mismo root cause que #5) |

### Tabla de hallazgos (evaluación fresca)

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Completitud del perfil (`country` default) | `country='PY'` por default en DB y form da ~25% de avance falso desde el registro | **A** | No contar `country` salvo edición explícita del usuario | Incompleto |
| URL pública `/empresas/[id]` | UUID crudo, no memorable para compartir en LinkedIn o email de outreach | **A** | Columna `slug` generada desde `nombre_comercial` con fallback a UUID | Incompleto |
| Directorio `/empresas` | Existe pero sin buscador, sin filtro industria/país/modalidad, sin paginación (`select` sin `limit`/`range`) | **A** | Agregar búsqueda, filtros y paginación | Incompleto |
| Caché del directorio | `revalidate = 300` (ISR 5 min): cambios de perfil tardan en reflejarse en el listado público | **M** | `revalidatePath` al guardar el perfil | Parcial |
| Campos de compensación/ubicación | Sin rango salarial, ciudad/ubicación, nivel de inglés requerido | **A** | Sección "Compensación y requisitos" | Incompleto |
| Preview del perfil público | Solo "Ver perfil →" en pestaña nueva, sin panel embebido | **M** | Modal/panel lateral de preview en vivo | Incompleto |
| Campo LinkedIn sin validación de URL | A diferencia de `website_url`, se puede guardar cualquier texto | **M** | Aplicar misma regex de URL | Incompleto |
| Botón "eliminar logo" | Solo existe "cambiar logo" | **B** | Botón secundario "Eliminar" con confirmación | Incompleto |
| Contador de caracteres | `razon_social`/`nombre_comercial` tienen `maxLength` pero no `{n}/max}` visual | **B** | Replicar patrón ya usado en `description`/`benefits` | Incompleto |
| RUC / identificador fiscal | Label fijo "RUC" para todos los países | **B** | Renombrar dinámicamente (RUC/NIT/CUIT/RFC) | Parcial |

**Preguntas clave:** El % de completitud sigue siendo engañoso desde el segundo 1 (mismo bug, ahora diluido entre más campos). El perfil público **sí mejoró de forma real** — stack, modalidad, beneficios y LinkedIn ya se muestran — pero la URL en UUID sigue restando profesionalismo para compartir con candidatos.

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Nota de arquitectura
El módulo se dividió en **dos pantallas que no comparten filtros ni features**: `/empresa/buscar-candidatos` (nueva, sourcing vía RPC) y `/empresa/candidatos` (original, tabs Evaluados/Talento/Shortlist). Esto genera inconsistencias de UX entre ambas.

### Estado de hallazgos previos

| # | Hallazgo (27/06) | Estado |
|---|---|---|
| 1 | Sin filtro de país | ✅ **FIXED** (ambas pantallas) |
| 2 | ISTQB sin tooltip | 🟡 **PARCIAL** (labels legibles, sin explicación del nivel) |
| 3 | Búsqueda inconsistente entre tabs | 🟡 **PARCIAL** (sigue distinto alcance por tab sin indicarlo) |
| 4 | Límite 500 hardcodeado | 🟡 **PARCIAL** (Evaluados ya no trunca; Talento QA sigue con límite 500 global) |
| 5 | Sin botón "Invitar" inline en Talento | 🟡 **PARCIAL** (fixed en `buscar-candidatos`; sigue faltando en tab Talento de `/empresa/candidatos` para candidatos opt-in puros) |
| 6 | Sin comparación side-by-side | 🟡 **PARCIAL** (existe en `/empresa/candidatos`, ausente en `/empresa/buscar-candidatos`) |
| 7 | Sin exportación CSV | ✅ **FIXED** |
| 8 | Sin filtro "disponible" dedicado | 🟡 **PARCIAL** (existe en `buscar-candidatos`, ausente en `candidatos`) |
| 9 | Empty state sin verificar | ✅ **FIXED** (verificado, funciona bien) |
| 10 | `section_scores` forzado a null | ✅ **FIXED** (en este módulo específico) |

**Bonus verificado:** el flujo de invitación completo (token público, marca de vista) también quedó resuelto a nivel de ruta — ver detalle crítico en Bloque 3.

### Tabla de hallazgos (evaluación fresca)

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Envío de email de invitación | Implementado (HTML + Resend) pero gateado por `EMAIL_SENDING_ENABLED==='true'`, no seteado en ningún `.env`/config del repo | Invitación se crea pero el candidato nunca recibe el email en un despliegue con la config documentada | Confirmar/setear el flag en prod antes del piloto; indicador de estado en UI | **CRÍTICO** 🚀 |
| Invitar desde tab "Talento QA" (`/empresa/candidatos`) | Botón "Invitar" solo aparece si `contactEmail` está poblado; `buildTalentDirectory` nunca lo popula por diseño de privacidad | Candidato opt-in puro no se puede invitar desde esta pantalla | Cablear `createInvitacionToCandidateAction` (por `candidate_id`) también aquí | **A** |
| Filtros "Proceso"/"Aprobado" en tabs Talento/Shortlist | Se renderizan sin condición de `viewMode`, pero no filtran nada en esas vistas | El recruiter cambia el filtro y no ve efecto — confuso | Ocultar esos selects cuando `viewMode !== 'evaluados'` | **A** |
| Límite 500 filas (`candidatos/page.tsx`) | Sigue hardcodeado para "Talento QA", sin paginación/aviso | Candidatos con actividad antigua pueden dejar de aparecer sin que nadie lo note | Reemplazar por conteo agregado o paginar | **M** |
| Buscador único compartido entre 3 tabs | Un solo input/placeholder fijo, pero el alcance real cambia por tab | Recruiter no sabe que en "Talento" puede buscar por país/certificación | Placeholder dinámico por `viewMode` | **M** |
| Filtro de país inconsistente entre pantallas | `buscar-candidatos` usa códigos crudos (PY, AR); `candidatos` usa banderas/etiquetas | Inconsistencia visual entre dos pantallas del mismo flujo | Reusar `COUNTRY_LABELS` en ambas | **M** |
| Comparación side-by-side | Solo en `/empresa/candidatos`, ausente en `/empresa/buscar-candidatos` (pantalla de sourcing principal) | Recruiter debe cambiar de página para comparar | Portar el mismo patrón | **B** |
| Tooltip explicativo ISTQB | Labels legibles pero sin explicación de jerarquía/peso de cada nivel | Recruiter sin contexto QA no entiende la diferencia entre niveles | Ícono de ayuda con descripción breve | **B** |

**Privacidad verificada (positivo):** ningún candidato opt-in expone su email en los directorios de descubrimiento; el email solo aparece para candidatos que ya rindieron un examen bajo un proceso propio — diseño correcto y consistente.

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### 🚨 Hallazgo crítico del ciclo: el flujo de invitación sigue roto en producción

El commit `0491b6e` sí implementó un envío real de email vía Resend (HTML completo, `empresa-invitaciones.ts:101-105`) — no es un stub. **Pero** ese envío está detrás de `EMAIL_SENDING_ENABLED === 'true'` (línea 6), una variable que **no aparece en `.env.local.example`, `vercel.json`, `railway.toml`, `check-env.js` ni en ninguna doc del repo**. Con la configuración documentada, el flag es `false` por default y **el email nunca sale**. El commit `bbe0760` lo confirma explícitamente en su mensaje: *"prep email sin enviar"*, y la migración correspondiente dice textualmente *"WITHOUT yet wiring Resend or sending any real email"*.

La UI es honesta al respecto (`/empresa/invitaciones` muestra "No entregado" + botón "Reenviar" + tooltip con el error), pero el bloqueante de junio **sigue vigente en la práctica**, solo que ahora escondido detrás de un flag no documentado en lugar de código faltante.

### Estado de hallazgos previos

| # | Hallazgo (27/06) | Estado |
|---|---|---|
| 1 | `exam_types` sin descripción | 🟡 **PARCIAL** (fixed en creación de proceso; falta en perfil público) |
| 2 | 🚨 CRÍTICO: invitación sin email | 🟡 **PARCIAL — efectivamente roto en producción** (ver arriba) |
| 3 | 🚨 CRÍTICO: sin ruta pública por token | ✅ **FIXED** (con duplicación confusa — ver hallazgo nuevo) |
| 4 | Código de proceso no vinculado a invitación | 🟡 **PARCIAL** (back-end cierra el vínculo; front no precarga el código) |
| 5 | `section_scores` descartado | 🟡 **PARCIAL** (fixed en directorio de Talento/Evaluados; `employer.ts:417` sigue con `null` hardcodeado, usado por `/empresa/procesos/[id]`) |
| 6 | 🚨 CRÍTICO: sin notificación a empresa al completar | ✅ **FIXED** (email real, sin flag, funciona hoy) |
| 7 | Sin comparación side-by-side | ✅ **FIXED** |
| 8 | Sin alerta de vencimiento <7 días | ❌ **ABIERTO** |
| 9 | Sin `max_attempts` configurable | ❌ **ABIERTO** en el flujo core (existe en el sistema paralelo nuevo "pruebas propias") |
| 10 | Perfil público sin descripción de tipos de examen | 🟡 **PARCIAL** (solo 3 de 12 tipos traducidos) |

### Hallazgo nuevo: ruta duplicada/huérfana
Existen **dos** rutas de invitación por token: `/invitaciones/[token]` (la real, usada por el email, solo muestra el código para copiar) y `/invitacion/[token]` (singular, huérfana, sin referencias entrantes, con **mejor UX** — links directos "Rendir →" precargados). Es deuda técnica que además desperdicia la mejor implementación.

### Hallazgo nuevo: el sistema paralelo "pruebas propias" repite el gap de notificación
`empresa-pruebas.ts` no tiene ninguna llamada a `sendEmail` — la invitación es por link para copiar/pegar manualmente. Es diseño deliberado, no bug, pero perpetúa la fricción de "invitar sin notificación automática" en la superficie nueva. Este sistema sí tiene fortalezas reales: `max_attempts`, `expires_at`, `duration_minutes` con enforcement server-side, auto-scoring y ranking — funcionalidad que no se portó al flujo original de `hiring_processes`.

### Tabla de hallazgos (evaluación fresca)

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Empresa invita candidato externo por email | **Roto en producción** | Código de Resend real pero gateado por flag no documentado | Setear `EMAIL_SENDING_ENABLED=true` en prod + documentar en `.env.local.example`/`check-env.js` + aviso visible si está apagado | **CRÍTICA** |
| Candidato abre el link de invitación | Incompleto | Ruta real solo muestra código para copiar; ruta huérfana con mejor UX no se usa | Unificar en una ruta, llevar directo al examen con `?code=` precargado | Alta |
| Candidato completa la evaluación | Completo | El back-end vincula correctamente invitación↔intento | — | — |
| Empresa recibe notificación de resultado | Completo | Email real sin flag de apagado | — | — |
| Empresa ve resultado con desglose por sección | Incompleto | Se ve en directorio de Talento, no en `/empresa/procesos/[id]` (campo ni se pide ahí) | Portar el mismo join a la ficha de proceso | Alta |
| Empresa compara candidatos | Completo | Selección múltiple + tarjetas comparativas | Agregar desglose por sección en la comparación | Baja |
| Alerta de vencimiento del proceso | Incompleto | Solo "Vence"/"Venció", sin aviso anticipado | Badge ámbar si `expires_at - now() < 7 días` | Media |
| Límite de reintentos configurable | Incompleto | No existe en `hiring_processes`; sí en "pruebas propias" | Portar `max_attempts` al modelo original | Media |

**Veredicto:** el flujo B2B core no funciona de punta a punta con la configuración documentada del repo. Antes de anunciar esto como resuelto a CLT/Banco Continental, hay que verificar en el entorno de producción real si `EMAIL_SENDING_ENABLED=true` está seteado.

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Estado de hallazgos previos

| # | Hallazgo (27/06) | Estado |
|---|---|---|
| 1 | Procesos activos sin breakdown por candidato | ❌ **ABIERTO** |
| 2 | Candidatos evaluados sin distinguir aprobados/reprobados | ❌ **ABIERTO** |
| 3 | Tasa de aprobación sin umbral ISTQB 65% | ❌ **ABIERTO** |
| 4 | Tiempo promedio sin benchmark | ❌ **ABIERTO** |
| 5 | 🚀 CRÍTICO: sin page-view counter | ✅ **FIXED** (con caveat de calidad de dato) |
| 6 | 🚀 CRÍTICO: sin funnel de invitaciones | ✅ **FIXED** |
| 7 | 🚀 Sin tasa de respuesta a invitaciones | ✅ **FIXED** (integrada al funnel) |
| 8 | Sin comparación entre procesos | 🟡 **PARCIAL** (solo dentro de "eventos" agrupados manualmente) |
| 9 | Sin "top skills del mes" | ❌ **ABIERTO** |
| 10 | Gráficos sin línea de tendencia | ❌ **ABIERTO** |

### Hallazgos nuevos
- **Page-view counter sin dedup**: el incremento de `profile_views` es incondicional (sin dedup por sesión/IP, sin excluir a los propios miembros de la empresa) — puede inflar la métrica y restar credibilidad al pitch B2B.
- **Conteo de candidatos no deduplicado**: `totalCandidates` cuenta filas/intentos, no personas únicas — un candidato con reintentos se cuenta varias veces. Esto contrasta con `/empresa/eventos`, que sí deduplica — **la misma empresa puede ver números distintos entre el dashboard principal y la vista de eventos para los mismos datos**.
- **Desincronización skeleton/grid**: loading state renderiza 8 skeletons pero la grilla real tiene 9 cards — salto de layout perceptible al cargar.
- **Jerarquía visual**: 9 stat cards sin agrupación/orden de prioridad; el funnel y gráficos quedan debajo de los quick-links, rompiendo la narrativa natural "awareness → funnel → acción".

### Tabla de métricas/widgets (evaluación fresca)

| Métrica/widget | Existe | Problema UX | Propuesta | Valor |
|---|---|---|---|---|
| Candidatos evaluados | Sí (parcial) | No distingue aprobados/reprobados; cuenta intentos, no personas | Mostrar "X aprobados / Y reprobados"; deduplicar como en `/empresa/eventos` | Alto |
| Visitas al perfil | Sí | Incremento sin dedup — infla el número | Dedupe por sesión/24h | Crítico (ya corregido, con caveat) |
| Funnel de invitaciones | Sí | Solo visible si `total > 0`; buen diseño | Agregar % por paso | Crítico (corregido) |
| Comparación entre procesos | Parcial | Solo dentro de "eventos" agrupados manualmente | Traer la tabla al dashboard/`/empresa/procesos` para todos los procesos | Alto |
| Tasa de aprobación | Sí | Sin referencia ISTQB 65% | Tooltip con umbral | Alto |
| Top skills QA del mes | No | Sigue sin existir | Widget de market intelligence | Medio |
| Gráficos 6 meses | Sí | Sin línea de tendencia | Agregar `Line` de Recharts | Bueno |
| Badge en pendientes / Empty state | Sí | Funcionan bien | — | Bueno |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 Invitación por email sigue rota en producción** — El código de Resend es real y correcto (`empresa-invitaciones.ts`), pero está detrás de `EMAIL_SENDING_ENABLED`, flag ausente de toda configuración documentada (`.env.example`, `vercel.json`, `railway.toml`, `check-env.js`). Con la config actual del repo, ningún email de invitación sale. Tipo: **bug de configuración / gap de despliegue**. Bloqueante directo para CLT/Banco Continental.

2. **🚨 Métricas B2B clave ya implementadas, pero con calidad de dato cuestionable** — El funnel de invitaciones y el contador de visitas al perfil (ambos críticos para el pitch de Moonshot) están construidos y funcionando, pero el contador de visitas no deduplica (infla el número) y el conteo de "candidatos evaluados" del dashboard difiere del de `/empresa/eventos` para los mismos datos subyacentes — riesgo de mostrar números inconsistentes a un cliente piloto. Tipo: **bug de implementación**.

3. **⚠️ Desglose de evaluación (`section_scores`) resuelto a medias** — Se ve correctamente en el directorio de Talento/Evaluados, pero `employer.ts:417` sigue forzando `null` en la función usada por la ficha de detalle de proceso (`/empresa/procesos/[id]`) — el lugar donde un recruiter normalmente revisaría el resultado de un candidato específico. Tipo: **bug de implementación**.

4. **⚠️ Fragmentación entre dos pantallas de búsqueda de candidatos** — `/empresa/buscar-candidatos` y `/empresa/candidatos` no comparten filtros (disponibilidad, comparación, formato de país) ni el botón de invitar funciona igual en ambas. Un recruiter puede terminar en la pantalla "equivocada" para la acción que necesita. Tipo: **gap UX**.

5. **⚠️ Deuda técnica: ruta de invitación duplicada/huérfana** — `/invitacion/[token]` (singular, con mejor UX — link directo al examen) no se usa; el email real apunta a `/invitaciones/[token]` (plural, solo muestra código para copiar). Confunde el mantenimiento y desperdicia la mejor implementación ya escrita. Tipo: **bug / deuda técnica**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | `EMAIL_SENDING_ENABLED` no configurado — invitaciones sin enviar | Bug de configuración | Sí 🚀 |
| 2 | `section_scores` null en ficha de proceso | Bug | Sí 🚀 |
| 3 | Page-view counter sin dedup | Bug | Parcial 🚀 |
| 4 | Candidatos evaluados: conteo inconsistente dashboard vs eventos | Bug | Sí 🚀 |
| 5 | Dos pantallas de búsqueda sin paridad de filtros/acciones | Gap UX | Sí |
| 6 | Ruta de invitación duplicada/huérfana | Deuda técnica | No (pero riesgo de mantenimiento) |
| 7 | Directorio `/empresas` sin buscador/filtro/paginación | Gap funcionalidad | Parcial |
| 8 | `country='PY'` sigue dando completitud engañosa | UX problem | No |
| 9 | URL pública con UUID (sin slug) | UX problem | Parcial 🚀 |
| 10 | Sin alerta de vencimiento <7 días / sin `max_attempts` en `hiring_processes` | Gap funcionalidad | No |
| 11 | Sin widget "top skills del mes" | Gap funcionalidad | No |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. **El flujo de invitación externo sigue sin funcionar de punta a punta** con la configuración documentada — el flag `EMAIL_SENDING_ENABLED` debe verificarse/activarse en el entorno real antes de cualquier demo.
2. El desglose de evaluación por sección no aparece en la ficha de proceso — el lugar natural donde un recruiter decide sobre un candidato.
3. Los números del dashboard y de `/empresa/eventos` pueden no coincidir para la misma empresa — riesgo de credibilidad ante RRHH.
4. La búsqueda de candidatos está fragmentada en dos pantallas con capacidades distintas.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- **Funnel de invitaciones y visitas al perfil**: ya implementados y visibles en el dashboard — listos para el pitch, condicionado a resolver el dedup de visitas.
- **Filtro de país + exportación CSV**: ya resueltos, diferenciador LATAM confirmado en código.
- **Employer branding completo** (stack, modalidad, beneficios, LinkedIn): mejora real y verificada en el perfil público.
- **Notificación automática a la empresa al completar evaluación**: funciona hoy sin gates, listo para destacar en el pitch.
- Condición para poder usar lo anterior en una demo real: **resolver el punto #1 (flag de email)** — de lo contrario el funnel mostrará "0% de respuesta" porque las invitaciones nunca llegan.

### Foco del próximo ciclo (1 hora)

**Prioridad:** Cerrar la brecha de configuración de email + consistencia de datos del dashboard

1. Verificar y/o activar `EMAIL_SENDING_ENABLED=true` en el entorno de producción real (Vercel/Railway); documentarlo en `.env.local.example` y como variable requerida en `check-env.js`; agregar aviso visible en `/empresa/invitaciones` si el flag está apagado.
2. Portar el join de `section_scores` (ya usado en `candidatos/page.tsx`) a `fetchAssessmentAttemptsForProcessCodes` (`employer.ts:417`) y a `/empresa/procesos/[id]`.
3. Unificar el conteo de "candidatos evaluados" entre el dashboard principal y `/empresa/eventos` (deduplicar por candidato en ambos) y dedupear el contador de `profile_views`.
4. Eliminar la ruta huérfana `/invitacion/[token]` o fusionarla con `/invitaciones/[token]`, llevando al candidato directo al examen con el código precargado.

Este ciclo cierra el bloqueante real más crítico (email) y elimina el riesgo de mostrar datos inconsistentes a un cliente piloto.

---

## 📎 Tickets sugeridos (formato listo para Jira — aiquaa.atlassian.net)

> Nota: esta sesión no tiene acceso configurado al conector de Jira; los tickets se documentan aquí en formato listo para copiar/pegar en aiquaa.atlassian.net.

**[CRÍTICO] Invitaciones de empresa no envían email en producción (flag no configurado)**
- *Descripción:* `EMAIL_SENDING_ENABLED` (`apps/frontend/src/actions/empresa-invitaciones.ts:6`) controla si se envía el email real de invitación vía Resend. La variable no está definida en `.env.local.example`, `vercel.json`, `railway.toml` ni `check-env.js`, por lo que en cualquier despliegue con la configuración documentada del repo el flag es `false` y el email nunca se envía.
- *Pasos para reproducir:* Crear un proceso de contratación → invitar a un candidato externo por email desde `/empresa/invitaciones` → revisar el estado de entrega (muestra "No entregado" con error `EMAIL_SENDING_ENABLED is not true`).
- *Impacto:* Bloquea el caso de uso B2B core (invitar candidatos externos). Bloqueante directo para demo a CLT/Banco Continental.
- *Prioridad:* Crítica.

**[BUG] `section_scores` no se muestra en la ficha de detalle de proceso**
- *Descripción:* `fetchAssessmentAttemptsForProcessCodes` (`apps/frontend/src/actions/employer.ts:417`) hardcodea `section_scores: null`, usado por `/empresa/procesos/[id]/page.tsx`, que ni siquiera define el campo en su tipo `ExamResult`. El desglose por sección sí funciona correctamente en `/empresa/candidatos`.
- *Pasos para reproducir:* Ir a un proceso con al menos un intento ISTQB completado → abrir `/empresa/procesos/[id]` → el detalle del candidato no muestra desglose por sección, aunque sí existe en la base de datos.
- *Impacto:* El recruiter no puede ver en qué área falló/aprobó el candidato desde el lugar natural de revisión.
- *Prioridad:* Alta.

**[BUG] Conteos inconsistentes entre dashboard principal y `/empresa/eventos`**
- *Descripción:* El dashboard (`employer.ts:666`, `totalCandidates = results.length`) cuenta filas de intento, no personas únicas; `/empresa/eventos/[id]` sí deduplica por `candidateKey`. La misma empresa ve números distintos para los mismos datos subyacentes.
- *Impacto:* Riesgo de credibilidad frente a RRHH de un cliente piloto al mostrar cifras que no cuadran entre pantallas.
- *Prioridad:* Alta.

**[MEJORA] Fragmentación entre `/empresa/buscar-candidatos` y `/empresa/candidatos`**
- *Descripción:* Ambas pantallas cubren búsqueda de talento pero no comparten filtro de disponibilidad, formato de país, ni comparación side-by-side; el botón "Invitar" no aparece en la tab Talento de `/empresa/candidatos` para candidatos opt-in puros.
- *Impacto:* UX fragmentada, recruiter debe cambiar de pantalla según la acción que necesite.
- *Prioridad:* Media-Alta.

**[DEUDA TÉCNICA] Ruta de invitación duplicada (`/invitacion/[token]` vs `/invitaciones/[token]`)**
- *Descripción:* Existen dos rutas para el mismo propósito; la real (usada por el email) tiene peor UX que la huérfana (sin referencias entrantes en el código).
- *Impacto:* Confusión de mantenimiento; se está usando la implementación menos pulida.
- *Prioridad:* Media.

---

*Revisión generada automáticamente — 2026-07-23 · Rama: `claude/zen-noether-yrnj3a` · Ciclo 2 de mejora continua*
