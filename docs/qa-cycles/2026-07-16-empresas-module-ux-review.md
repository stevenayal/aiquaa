# Ciclo QA — Módulo Empresas (aiquaa.com)

**Fecha de ejecución real:** 2026-07-16
**Reviewer:** Claude Code (QA Lead sintético, ciclo de mejora continua)
**Persona objetivo:** Recruiter / responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto de referencia:** CLT, Banco Continental SAECA (Paraguay)

## ⚠️ Nota de metodología (leer antes de usar este informe)

Este ciclo se ejecutó **sin sesión de navegador interactiva contra producción** (no hay credenciales de un recruiter real ni acceso a un browser headed contra aiquaa.com en este entorno). En su lugar, la auditoría se hizo con:

1. **Lectura exhaustiva del código fuente** del módulo Empresas (`apps/frontend/src/app/empresa/**`, `apps/frontend/src/actions/empresa*.ts`, migraciones SQL en `supabase/migrations/`).
2. **Consultas SQL de solo lectura contra la base de producción real** (proyecto Supabase `aiquaa`, `cbkctkpyxwbufvbwxogp`) para verificar datos reales de uso — no supuestos.
3. **Inspección de políticas RLS** (`pg_policies`/`pg_policy`) y del **advisor de seguridad de Supabase**.

Todo lo marcado como "✅ verificado" surge de (2) o (3). Todo lo marcado "🔍 inferido de código" es una lectura del código fuente pero no fue clickeado en vivo. No se reporta ningún hallazgo basado en suposición sin evidencia.

**Corrección de arquitectura:** CLAUDE.md describe un backend NestJS + Prisma. Ese backend **no existe en este repo**. La arquitectura real es Next.js (App Router) + Server Actions + Supabase Postgres directo (sin ORM, sin capa NestJS), con SQL crudo en `supabase/migrations/`. Este informe se basa en la arquitectura real.

**Hallazgo de contexto más importante:** el prompt de este ciclo asume que "el módulo de Empresas está incompleto". En código, **es lo opuesto**: las 5 áreas (perfil, búsqueda, evaluaciones, dashboard, registro) están implementadas de forma madura. El problema real no es "falta construir" — es que **hay bugs de producción activos y datos reales que muestran adopción casi nula**, incluyendo un bloqueo total de acceso para el cliente piloto CLT.

---

## 🏢 Perfil de empresa

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Acceso a `/empresa/perfil` para **cualquier** empresa | ✅ **BUG CONFIRMADO EN VIVO**: `getMyEmpresaAction()` (`apps/frontend/src/actions/empresa-admin.ts:43-58`) hace `supabase.from('empresas').select('*').single()` **sin filtro `.eq()`**, confiando 100% en RLS para acotar a "mi empresa". Pero la tabla `empresas` tiene una policy `empresas_public_select` con `USING (true)` para roles `{anon, authenticated}` (verificado vía `pg_policy`). Como las policies permisivas de SELECT se combinan con OR, la query **siempre devuelve todas las filas de `empresas`** (hoy: 3 filas reales en prod), y `.single()` de Supabase falla con error cuando hay más de 1 fila. | **Alto/Crítico** 🚀 | Agregar `.eq('id', callerEmpresaId)` explícito (vía `profiles.empresa_id` o `is_active_empresa_member()`) en `getMyEmpresaAction`, no depender solo de RLS cuando existe una policy pública de solo-lectura sobre la misma tabla. | **Roto** — afecta `/empresa` (dashboard), `/empresa/perfil` y `/empresa/admin/usuarios`, las 3 páginas que llaman esta acción. Confirmado: hay 3 empresas reales en prod hoy, por lo que el bug está activo ahora mismo para todas las cuentas. |
| Cuenta del cliente piloto **CLT** | ✅ **VERIFICADO**: la empresa "CLT" (`id 765269d3-...`) tiene **0 filas en `empresa_miembros`** (0 owners, 0 members). El usuario real `talentohumano@clt.com.py` tiene `profiles.empresa_id` apuntando a CLT pero **no tiene membership activa**. Toda acción gateada por `getCallerMembership()` (perfil, invitar miembros, etc.) lo rechaza con "no pertenecés a ninguna empresa" o similar. | **Crítico** 🚀 | Insertar manualmente la fila `empresa_miembros` (role `owner`, status `active`) para este usuario, y auditar el flujo de alta manual de empresas piloto para que siempre pase por el trigger `handle_new_user()` (que sí crea la membresía atómicamente en el signup normal). | **Roto** — el contacto de CLT no puede hoy administrar su perfil ni gestionar su cuenta. |
| Completitud real de perfiles | ✅ **VERIFICADO** vía SQL: de 3 empresas en prod, **0 tienen logo, 0 tienen descripción, 0 tienen sitio web, 0 tienen industria** cargada. Solo `country` está poblado (probablemente default). El widget de "completion score" existe en `empresa/perfil/page.tsx` (línea 92) pero no logra que ninguna cuenta complete su perfil. | **Alto** | Para CLT esto es consecuencia directa del bug de acceso de arriba, no falta de motivación. Una vez arreglado el acceso, medir si el nudge de completitud funciona. Considerar bloquear/advertir en el directorio público (`/empresas`) cuando un perfil tiene <30% de completitud, en vez de mostrarlo vacío a los candidatos. | **Incompleto** en la práctica (0/3), aunque el schema y el formulario ya cubren todos los campos que un recruiter necesitaría (logo, descripción, industria, país, tamaño, modalidad, stack tecnológico, beneficios, LinkedIn, tamaño del equipo QA). |
| Campos del formulario (`empresa/perfil/page.tsx`) | 🔍 Cobertura de campos ya es completa: razón social, RUC (validado con regex PY `^\d{6,8}-\d$`), logo (upload, límite 2MB), descripción (800 caracteres), sitio web (validado como URL), industria, país (11 países LATAM), tamaño de equipo, modalidad de trabajo, tamaño del equipo QA, stack tecnológico (tags), beneficios, LinkedIn. | Bajo | Ninguna — este bloque del prompt (campos faltantes) ya está resuelto en código. | **Completo** a nivel de esquema/formulario. |
| Directorio público `/empresas` | 🔍 Empty state existe ("Todavía no hay empresas publicadas"), `revalidate = 300`. Con 0/3 perfiles completos, un candidato que visite el directorio público hoy vería tarjetas vacías o casi vacías — lo opuesto a "transmitir confianza". | **Medio** 🚀 | Filtrar del directorio público las empresas con completitud por debajo de un umbral, hasta que carguen datos mínimos (nombre + descripción + industria). | 🔍 No verificado en vivo (requiere click-through), pero consistente con los datos de completitud reales. |

---

## 🔍 Búsqueda y filtro de candidatos QA

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Pool real de candidatos buscables | ✅ **VERIFICADO**: solo **1 candidato** en toda la plataforma tiene `talent_visible_to_empresas = true` (y ese mismo es el único `open_to_work = true`). | Cualquier búsqueda con más de un filtro básico devolverá 0 o 1 resultado. La feature está construida (filtros por ISTQB, país, disponibilidad, skills) pero es **inútil en la práctica** por falta de opt-in de candidatos. | Antes de vender esto a CLT/Banco Continental: campaña de opt-in a candidatos existentes (banner en dashboard candidato: "hacete visible a empresas"), o default opt-in con opción de salir. Sin esto, cualquier demo con un recruiter real mostrará un directorio casi vacío. | **Máxima** 🚀 |
| Dos implementaciones paralelas de "directorio de talento" | 🔍 `empresa/buscar-candidatos/page.tsx` usa el RPC `get_empresa_candidate_sourcing()` (SECURITY DEFINER, oculta email). La pestaña "Talento QA" dentro de `empresa/candidatos/page.tsx` reconstruye la misma lógica **del lado del cliente** en `candidateDirectory.ts`, consultando `profiles`/`exam_results` directo, con orden/filtros ligeramente distintos y — en algunos casos — exponiendo `contactEmail` que el RPC deliberadamente esconde. | Riesgo de inconsistencia entre las dos vistas (un recruiter puede ver resultados distintos para el mismo filtro según qué pantalla use) y de fuga de email por una ruta no diseñada para eso. | Unificar en una sola fuente de verdad (el RPC server-side), eliminar la reconstrucción client-side. | **Alta** |
| Filtros (ISTQB, país, disponibilidad, skills) | 🔍 Cubren lo esperado por un recruiter QA de LATAM (nivel ISTQB, país, disponibilidad activo/pasivo/no disponible, skills como chips). | 🔍 No verificado en vivo si un recruiter sin contexto QA entiende "ISTQB Foundation" vs "Advanced" sin tooltip — no se pudo clickear la UI real este ciclo. | Agregar tooltip/glosario breve en cada filtro técnico (ISTQB, tipos de skill) pensado para RRHH no técnico. | Media |
| Shortlist / Favoritos | ✅ **VERIFICADO**: tabla `empresa_favoritos` existe, con 0 filas en producción (nadie la usó todavía). Funcionalmente completa (toggle en `buscar-candidatos`, tab "Favoritos" en `candidatos`). | Feature completa pero sin adopción — probablemente porque el pool de candidatos visibles es casi nulo (ver arriba), no por defecto de UX. | Resolver el problema de fondo (pool de candidatos) antes de invertir más en esta feature. | Media |
| Contacto / Invitar | 🔍 Para candidatos "evaluados" (que ya rindieron un examen del proceso), botón "Contactar" vía `mailto:`. Para candidatos del directorio de talento (opt-in, email oculto), el único camino es "Invitar" in-app vía `empresa_invitaciones`. | ✅ **VERIFICADO**: 0 invitaciones creadas en producción hasta hoy. Coherente con el pool casi vacío. | — | Media |
| Paginación de resultados | 🔍 `buscar-candidatos` y `candidatos` traen listas completas (`.limit(500)`) y filtran/ordenan en memoria en el cliente. | No escala más allá de unos cientos de candidatos; con 20 `hiring_processes` reales hoy no es un problema aún, pero es una deuda técnica a anticipar antes de un piloto con volumen. | Mover paginación/orden al servidor (RPC con `LIMIT`/`OFFSET` o cursor). | Baja (por ahora) |
| Empty state sin resultados | 🔍 No verificado en vivo este ciclo. | — | Pendiente de prueba en el próximo ciclo con browser real. | — |

---

## 📋 Evaluaciones técnicas para candidatos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Flujo A — Procesos de contratación (`hiring_processes` + `empresa_invitaciones`) | **Completo y en uso real** ✅ — 20 procesos en producción, 18 vinculados a una empresa. | Es, con diferencia, el flujo más usado hoy. | Ninguna — mantener. | — |
| Notificación al candidato por email (Resend) al ser invitado | Completo, pero **detrás de un feature flag** `EMAIL_SENDING_ENABLED` — si está apagado, la invitación se crea igual mostrando `email_sent: false` con motivo. | 🔍 No verificado si el flag está en `true` en prod hoy — si está en `false`, el recruiter debe compartir el link manualmente sin que la UI lo advierta claramente. | Verificar valor real del flag en Railway/Vercel prod; si está apagado, agregar aviso explícito en la UI ("el candidato no recibirá email, copiá el link"). | Alta |
| Notificación a la empresa cuando un candidato completa una evaluación | Implementado (`notifyEmpresaExamCompleted`) para el flujo legacy de exámenes y el nuevo flujo `assessments/submit`. | Funciona para el 100% del uso real actual (20 procesos vía Flow A). | Ninguna. | — |
| Flujo B — Pruebas propias de la empresa (`empresa_pruebas`, constructor de tests custom) | ✅ **VERIFICADO: 0 filas en `empresa_pruebas` y 0 en `empresa_intentos`** en producción. Feature construida (CRUD de preguntas, scoring, invitaciones por token, resultados con ranking) pero **nunca usada por ninguna empresa real**. | Puede ser por descubribilidad (no está claro si está enlazada desde el dashboard) o porque el valor de "crear tu propio test" no es evidente frente a usar los exámenes estándar de la plataforma. | Antes de invertir más en esta feature, confirmar con 1-2 empresas piloto si la necesitan; si no, no priorizar. | Media |
| Notificación de finalización para Flow B | ✅ **VERIFICADO por grep**: no hay ningún llamado a Resend/`sendEmail` en `empresa-pruebas*.ts` ni en las rutas de `empresa/pruebas/**`. A diferencia del Flow A, una empresa que reciba un test propio **no se entera por email** cuando un candidato lo completa — debe entrar manualmente a revisar. Tampoco se envía email al crear la invitación al test (el link debe compartirse a mano). | Gap real y concreto de paridad entre los dos flujos de evaluación. | Reusar `notifyEmpresaExamCompleted`/`sendInvitacionEmailIfEnabled` como base para el flujo de pruebas propias. | Media (baja urgencia dado el uso real = 0, pero bloquea si CLT llega a usar esta feature) |
| Comparación de candidatos / scoring | Completo — comparación de hasta 4 candidatos, desglose de score por sección, gráficos (top candidatos, volumen semanal). | 🔍 No verificado en vivo si un líder técnico sin documentación externa entiende cada sección del score. | Prueba de usabilidad con un recruiter real en el próximo ciclo. | Media |
| Timeout / fecha límite | 🔍 Confirmado en código para Flow B (`empresa_intentos`: `max_attempts`, `expires_at`, límite de tiempo con 2 min de gracia server-side). Para Flow A (procesos estándar) no se relevó en este ciclo. | — | Verificar Flow A en próximo ciclo. | — |

---

## 📊 Dashboard de empresa con métricas

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Procesos totales/activos/cerrados, candidatos totales/aprobados, pass rate, tiempo promedio | Sí — con datos reales (`getEmpresaDashboardStatsAction`, `apps/frontend/src/actions/employer.ts:492-708`). | Ninguno detectado. | — | Alto — es la métrica que un recruiter mira primero. |
| Prospectos/invitaciones pendientes | Sí, con badges. | ✅ Con 0 invitaciones reales en prod, este widget hoy muestra 0 para todas las empresas — coherente, no es un bug. | — | Medio |
| **`profile_views` (vistas del perfil público)** | Parcial/dudoso — ✅ **VERIFICADO**: el RPC `increment_empresa_profile_views` existe y está enlazado en `apps/frontend/src/app/empresas/[id]/page.tsx:56`, pero se llama con `.then(() => {})` **sin manejo de error** (fire-and-forget). En prod, **las 3 empresas tienen `profile_views = 0`**, sin excepción. | No se pudo determinar en este ciclo si es porque (a) nadie visitó un perfil público de empresa todavía (consistente con la adopción general casi nula) o (b) el RPC falla silenciosamente. Requiere una visita de prueba real + revisar logs de Postgres/Supabase para confirmar cuál es. | Agregar `.catch()` con log explícito; hacer una visita de prueba y confirmar que el contador sube. | Medio — es una métrica que sí importa para justificar el módulo ante un cliente piloto. |
| Embudo de invitaciones (enviadas/vistas/completadas/tasa de respuesta) | Sí, con datos reales. | Con 0 invitaciones reales, el embudo está vacío para las 3 empresas — coherente con datos, no bug. | — | Alto, una vez haya volumen. |
| Empty state para empresa sin actividad | Sí — banner + CTA "¡Empezá a reclutar talento QA!" cuando `totalProcesses === 0`. | 🔍 No verificado en vivo. | — | — |
| Métricas sugeridas por el prompt (candidatos que vieron el perfil, tasa de respuesta a evaluaciones, tiempo promedio de completado, top skills del mes) | 3 de 4 ya existen (tasa de respuesta = embudo de invitaciones; tiempo promedio de completado = `avgTimeSpentMinutes`; vistas de perfil = `profile_views`, aunque dudoso). Falta únicamente "top skills QA disponibles este mes" agregado a nivel plataforma. | — | Agregar agregación de `qa_skills`/`istqb_level` sobre `talent_visible_to_empresas = true` — aunque con solo 1 candidato opt-in hoy, esta métrica no aportaría valor real todavía. | Bajo hasta que el pool de candidatos crezca. |

---

## ✅ Cierre & registro del ciclo

### Resumen ejecutivo (5 hallazgos críticos)

1. 🚀 **[BUG confirmado en producción]** `getMyEmpresaAction()` no filtra por empresa y depende de una política RLS pública (`USING true`) sobre `empresas`. Con 3 empresas reales en la base, la consulta `.single()` falla siempre — **rompe el dashboard, el perfil y la administración de usuarios para el 100% de las cuentas empresa activas ahora mismo**. Es el hallazgo de mayor severidad de todo el ciclo.
2. 🚀 **[BUG confirmado, bloquea al piloto CLT]** El usuario real `talentohumano@clt.com.py` (empresa CLT) no tiene fila en `empresa_miembros` — no puede administrar su cuenta ni pasar los checks de rol que gatean casi toda acción de escritura del módulo. Combinado con el hallazgo #1, **CLT no puede usar el módulo Empresas hoy**.
3. **[Gap de funcionalidad / adopción]** Solo 1 candidato en toda la plataforma es visible para empresas (`talent_visible_to_empresas = true`). La búsqueda de candidatos está completamente construida pero es funcionalmente inútil sin un pool real — cualquier demo a un recruiter mostrará resultados casi vacíos.
4. **[Gap de funcionalidad]** El constructor de pruebas propias de la empresa (`empresa_pruebas`) tiene 0 usos reales y, a diferencia del flujo estándar de exámenes, no envía email a la empresa cuando un candidato completa el test ni al candidato cuando se lo invita.
5. **[Deuda de calidad]** Duplicación de lógica de búsqueda de candidatos entre `buscar-candidatos` (RPC server-side) y la pestaña "Talento QA" de `candidatos` (reconstrucción client-side), con riesgo de inconsistencia y de exponer email donde el diseño original lo protegía.

### Clasificación de hallazgos

| # | Hallazgo | Tipo |
|---|---|---|
| 1 | `.single()` sin filtro + RLS pública rompe perfil/dashboard/admin | Bug |
| 2 | CLT sin `empresa_miembros` | Bug (dato/config, no de código) |
| 3 | Pool de candidatos visibles ≈ 0 | Gap de funcionalidad / producto (no UX pura) |
| 4 | Sin email de finalización en `empresa_pruebas` | Gap de funcionalidad |
| 5 | Búsqueda duplicada (RPC vs. client-side) | Bug potencial / deuda técnica |
| — | 0/3 perfiles completos | Consecuencia del bug #1/#2, no un problema de UX de formulario |
| — | Directorio público sin filtrar por completitud | Mejora de diseño |
| — | `profile_views` en 0 sin causa confirmada | Bug posible (a verificar) |
| — | Rutas legacy `/employer/*` no enlazadas | Deuda técnica / limpieza |
| — | Sin paginación server-side en listas de candidatos | Deuda técnica (riesgo de escala) |
| — | Cobertura de tests automatizados casi nula en páginas interactivas de empresa | Gap de calidad/QA |

### Tickets listos para crear en Jira (aiquaa.atlassian.net)

> No se pudo acceder a Jira desde este entorno (sin conector/credenciales configuradas en esta sesión). Se dejan los tickets redactados y listos para copiar/pegar.

**[BUG-CRIT-1] `getMyEmpresaAction` rompe perfil/dashboard cuando hay >1 empresa en la base**
- Descripción: la Server Action hace `select('*').single()` sobre `empresas` sin filtrar por la empresa del caller, confiando en RLS. La policy `empresas_public_select` (`USING true`, roles `anon,authenticated`) hace que la query devuelva todas las filas, y `.single()` falla con >1 fila.
- Pasos para reproducir: con ≥2 filas en `public.empresas` (ya es el caso en prod, hay 3), iniciar sesión como cualquier usuario `audience = 'empresa'` y visitar `/empresa`, `/empresa/perfil` o `/empresa/admin/usuarios`.
- Impacto: Crítico — bloquea el uso del módulo completo para toda cuenta empresa.
- Prioridad: Máxima.

**[BUG-CRIT-2] Empresa CLT sin membresía activa — cuenta piloto bloqueada**
- Descripción: `talentohumano@clt.com.py` tiene `profiles.empresa_id` seteado a la empresa CLT pero no existe fila correspondiente en `empresa_miembros`.
- Pasos para reproducir: consultar `empresa_miembros` filtrando por `empresa_id` de CLT — 0 filas.
- Impacto: Crítico — el cliente piloto no puede operar la cuenta.
- Prioridad: Máxima.

**[GAP-1] Pool de candidatos visibles para empresas es casi nulo**
- Descripción: solo 1 perfil en toda la plataforma tiene `talent_visible_to_empresas = true`. La feature de búsqueda/filtro está completa pero no tiene datos para mostrar.
- Impacto: Alto — compromete cualquier demo o uso real por parte de un recruiter.
- Prioridad: Alta.

**[GAP-2] Sin notificación por email al completar/crear invitación de pruebas propias de empresa**
- Descripción: a diferencia del flujo estándar de exámenes, `empresa_pruebas`/`empresa_intentos` no dispara Resend ni al invitar ni al completar.
- Impacto: Medio (bajo uso real hoy, pero bloquea si se adopta).
- Prioridad: Media.

**[DEBT-1] Lógica de búsqueda de candidatos duplicada entre `buscar-candidatos` y `candidatos` (Talento QA)**
- Descripción: dos implementaciones independientes de la misma lógica de filtrado/ranking, una server-side vía RPC (oculta email) y otra client-side (puede exponer `contactEmail`).
- Impacto: Medio — riesgo de inconsistencia y de fuga de email no intencional.
- Prioridad: Media.

### ¿Qué bloquea el uso real hoy por CLT / Banco Continental?

- CLT **no puede usar el módulo en absoluto** en su estado actual (bugs #1 y #2 combinados).
- Aunque se arreglen esos bugs, la búsqueda de candidatos no tendrá candidatos reales que mostrar (hallazgo #3) — un problema de producto/adopción, no solo de código.
- El directorio público de empresas mostrará perfiles vacíos si se hace la demo antes de resolver el bug de acceso (ya que ni CLT ni las cuentas de prueba han podido completar su perfil).

### Foco del próximo ciclo (1 hora)

1. Verificar en vivo (con browser real) que el fix del bug #1 y #2 resuelve el acceso de CLT de punta a punta: login → dashboard → perfil → guardar cambios → ver reflejado en `/empresas/[id]`.
2. Sesión de click-through real de búsqueda de candidatos y evaluaciones con credenciales de prueba, para cubrir lo que este ciclo no pudo probar en vivo (empty states, comprensión de filtros ISTQB por un RRHH no técnico, flujo de notificación por email con el flag `EMAIL_SENDING_ENABLED` en su valor real de prod).
3. Confirmar causa raíz de `profile_views = 0` (¿tráfico real cero o RPC fallando silenciosamente?).
