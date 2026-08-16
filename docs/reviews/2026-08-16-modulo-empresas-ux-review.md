# Revisión UX — Módulo de Empresas
**Fecha:** 16 de agosto de 2026
**Ciclo:** Mejora continua · 60 min (ciclo 2, sigue a [2026-06-27](./2026-06-27-modulo-empresas-ux-review.md))
**Reviewer:** QA Lead (revisión automatizada — código + base de datos en producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología y limitaciones de este ciclo:** no hubo acceso de navegador al sitio en vivo (aiquaa.com está bloqueado por egress desde este entorno) ni credenciales de recruiter, así que **no se pudo hacer click-through real**. En cambio, se combinó: (1) revisión estática del código (Next.js Server Actions + Supabase — **no NestJS/Prisma como describe el CLAUDE.md del repo**, ver nota de arquitectura abajo), y (2) **consulta directa a la base de datos de producción (Supabase) vía MCP**, incluyendo conteos de filas y datos reales de las 3 empresas registradas hoy. Esto permitió verificar no solo si el código existe, sino si **alguna vez fue usado**. No se crearon tickets en Jira — no hay conector de Jira disponible en este entorno; la sección de cierre entrega los tickets en formato listo para pegar. Todo hallazgo está anclado a código o a una fila real de base de datos, no a suposiciones.

### Corrección de arquitectura
El CLAUDE.md del repo describe un backend NestJS + Prisma. Eso nunca se implementó para este módulo (no existe `apps/backend`, no hay `schema.prisma`). El stack real es **Next.js Server Actions llamando directo a Supabase**, con lógica de negocio en `apps/frontend/src/actions/*.ts` y el modelo de datos en migraciones SQL (`supabase/migrations/`) con RLS. El ADR-001 (NestJS) describe una decisión que quedó obsoleta — vale la pena archivarlo o actualizarlo para no confundir a alguien nuevo en el equipo.

---

## 🚨 Hallazgo destacado del ciclo: esquema de datos huérfano con actividad real de CLT

Antes de entrar a los 5 bloques, esto merece ir primero porque cambia la lectura de todo lo demás: **la base de datos de producción tiene dos modelos de "empresa" completamente separados y sin conectar.**

El que usa la app hoy es `empresas` / `empresa_*` (Spanish, snake_case) — es el que describe el resto de este informe. Pero además existe un segundo grupo de tablas — `talent_companies`, `talent_company_users`, `talent_selection_processes`, `talent_process_stages`, `talent_applications`, `talent_assessment_templates`, `talent_assessment_responses`, `talent_application_metric_snapshots` — con nomenclatura camelCase y patrón de soft-delete (`deletedAt`), es decir, con la huella de un backend Prisma/NestJS. **Ese backend ya no existe en el repo** (`grep` de `talent_companies` sobre `apps/frontend/src` no devuelve ningún archivo) — es un esquema huérfano que quedó vivo en Supabase después de que el equipo migró a Server Actions.

Lo que lo hace crítico y no solo un tema de limpieza técnica: **tiene datos reales de un cliente piloto.**

| Tabla huérfana | Filas | Detalle |
|---|---|---|
| `talent_companies` | 2 | `AIQUAA` y **`CENTRO LOGISTICO DE TECNOLOGIA SA`** (= CLT, RUC `80059574-2`) |
| `talent_selection_processes` | 4 | 2 de CLT: *"Testers Juniors"* (DRAFT, creado 27-may-2026) y *"Bootcamp 2026 - Fase de Pruebas"* (ACTIVE, creado 04-jun-2026) |
| `talent_applications` | 0 | Ningún candidato aplicó nunca a estos procesos |
| `talent_process_assessments` | 0 | Nunca se asignó una evaluación en este sistema |

Es decir: **alguien de CLT (o del equipo, en su nombre) creó dos procesos de selección reales para CLT en mayo/junio, y esos procesos nunca recibieron ni un candidato** — porque el sistema que los sirve ya no está montado en el frontend. Hoy, si alguien de CLT busca esos procesos en `/empresa/procesos`, no los va a encontrar: están en la tabla equivocada. Además, `talent_companies.aiquaaEmpresaId` (el campo pensado para vincular ambos esquemas) está `NULL` en ambas filas — el link nunca se completó.

Esto también explica por qué en la tabla `empresas` (la que sí usa la app) CLT aparece registrada por separado, el 19 de junio, como una empresa nueva con **todos los campos de perfil vacíos** (ver Bloque 1) — probablemente porque el equipo de CLT (o quien probó por ellos) tuvo que volver a registrarse desde cero al no encontrar su empresa/procesos anteriores.

**Impacto:** Alto, específico al piloto 🚀. No es solo deuda técnica — es evidencia de que CLT ya intentó usar el módulo de Empresas dos veces, en dos sistemas distintos, y las dos veces se quedó en cero candidatos.

**Acción recomendada:** (1) Confirmar si `talent_selection_processes` de CLT contiene información que el equipo de CLT espera encontrar y, si es así, migrarla a `empresas`/`hiring_processes`; si no, comunicarlo y archivar/eliminar el esquema huérfano. (2) Auditar qué otro esquema o servicio externo (Railway, un backend NestJS descontinuado) todavía escribe en estas tablas, para evitar que seguir generando datos fantasma.

---

## 🏢 Bloque 1 — Perfil de empresa

### Estado real en base de datos
Las 3 empresas registradas en producción (`Aiquaa`, `AIQUAA`, `CLT`) tienen **el 100% de los campos de employer branding en `NULL`**: `logo_url`, `description`, `website_url`, `industry`, `team_size`, `work_mode`, `tech_stack`, `benefits`, `linkedin_url`, `qa_team_size`. `profile_views = 0` en las tres. Nótese además que hay **dos registros para AIQUAA misma** (`Aiquaa` y `AIQUAA`, creados con 51 minutos de diferencia el 6 de mayo) — sugiere que el flujo de creación de empresa no valida duplicados por nombre/RUC, o que un usuario reintentó tras un error percibido.

Esto no es un problema de código — el formulario existe y tiene validación (ver abajo) — es evidencia de que **ninguna empresa piloto completó su perfil todavía**, lo cual en sí es un hallazgo UX: la barra de completitud y los CTAs no están logrando que el recruiter termine el flujo.

### Delta vs. ciclo anterior (2026-06-27)
Resuelto ✅: nada de este bloque específico — los campos `work_mode`, `qa_team_size`, `tech_stack`, `benefits`, `linkedin_url` que el ciclo anterior pedía agregar **ya están en el schema y en el formulario** (`empresa/perfil/page.tsx:117-130`), pero como muestra la tabla de arriba, **cero empresas los completaron**, así que el problema pasó de "no existe el campo" a "existe pero nadie lo llena".

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Adopción real del perfil | 3/3 empresas en producción tienen 0 campos de branding completos (solo `razon_social` y `country` por defecto) | **A** 🚀 | Onboarding forzado: no dejar salir del primer login sin completar mínimo 3 campos, o email de Resend a las 48h si el perfil sigue vacío | Roto en la práctica (código completo, uso real = 0) |
| Empresas duplicadas | Dos filas para "Aiquaa"/"AIQUAA" sin validación de RUC/nombre único | **M** | Validar unicidad por RUC antes de insertar; si ya existe, ofrecer "solicitar acceso" en vez de crear otra | Incompleto |
| Completitud por defecto (`country='PY'`) | Sigue igual que el ciclo anterior — completitud falsa desde el registro | **M** | Ya reportado; sigue sin resolver | Incompleto (carry-over) |
| URL pública con UUID | Sigue sin slug memorable | **M** | Ya reportado; sigue sin resolver | Incompleto (carry-over) |
| Eliminar logo | Sigue sin acción "eliminar", solo "cambiar" | **B** | Ya reportado; sigue sin resolver | Incompleto (carry-over) |
| RUC hardcodeado a Paraguay | Validado en 2 lugares independientes (registro y edición de perfil) solo para `country==='PY'`; el selector soporta 11 países pero el resto no tiene validación de identificador fiscal | **B** | Unificar en una sola función de validación por país | Incompleto (carry-over, ahora confirmado duplicado en 2 archivos) |
| Contador en campo RUC | `razon_social`, `nombre_comercial`, `description`, `benefits` tienen contador `{n}/max`; `ruc` (maxLength 20) no | **B** | Agregar contador consistente | Parcial |

**Preguntas UX clave:**
- *¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?* No verificable con click-through, pero el dato de producción (0/3 perfiles completos) es una señal más fuerte que cualquier heurística: sea cual sea la razón, el flujo actual no logra que las empresas reales completen el perfil.
- *¿El perfil público de la empresa inspira confianza a un candidato QA?* No — con todos los campos en `NULL`, un candidato que visite `/empresas/[id]` de CLT hoy vería una página casi vacía.

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Delta vs. ciclo anterior
Resuelto ✅ desde el 27-jun: exportación CSV (`candidatos/page.tsx:725`), comparación side-by-side con checkboxes (líneas 693, 1055-1097), y **filtro por país** (líneas 429-465) — los tres estaban marcados 🚀 bloqueante para CLT en el ciclo anterior y ya están implementados.

Sigue abierto ⚠️: el desglose `section_scores` — confirmado de nuevo este ciclo, sigue forzado a `null` para resultados que vienen de `assessment_attempts` (`employer.ts:417`) mientras que sí se muestra para `exam_results` (`employer.ts:435`). Es una corrección parcial, no completa.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Exportar CSV, comparar candidatos, filtro país | Implementados | — (verificar en próximo ciclo con captura real) | Confirmar con recruiter real de CLT que cubre su caso de uso | Verificar |
| Desglose `section_scores` | Sigue oculto para una parte de los resultados | Recruiter no ve en qué área falló un candidato evaluado vía `assessment_attempts` (solo lo ve si vino de `exam_results`) | Poblar el breakdown también desde `assessment_attempts` en `employer.ts:417` | **A** (carry-over, no resuelto) |
| Filtros ISTQB sin descripción | Sin verificar cambios este ciclo | Valores técnicos (`ctfl`, `ctal_ta`) sin tooltip | Ya reportado; confirmar si sigue sin resolver | **A** (carry-over, no verificado) |
| Límite 500 resultados hardcoded | Sin cambios reportados | Riesgo de truncar resultados silenciosamente a medida que crece la base | Paginación real o aviso al llegar al límite | **M** (carry-over) |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Delta vs. ciclo anterior — el hallazgo más crítico del ciclo pasado quedó resuelto
El ciclo anterior marcó como **🚨 CRÍTICO** que `createInvitacionAction` no enviaba email y que `/invitaciones/[token]` no existía — es decir, el flujo B2B core (invitar candidato externo) estaba completamente roto. **Ambos están resueltos**: existe envío de email vía Resend en `empresa-invitaciones.ts` y la ruta pública `apps/frontend/src/app/invitaciones/[token]/page.tsx` (agregada 17-jul-2026).

### Pero hay una condición de falla silenciosa que el ciclo anterior no vio
El envío de email está condicionado a la variable de entorno `EMAIL_SENDING_ENABLED` (`empresa-invitaciones.ts:6, 46-49`). Si no está seteada, **el email simplemente no se envía y el único rastro queda en la columna `email_error` de la tabla** — no hay alerta visible para el recruiter ni para el equipo. Dado que `empresa_invitaciones` tiene **0 filas en producción hoy**, no se pudo confirmar con datos reales si el flag está activo en el ambiente de producción actual; es el primer punto a verificar del próximo ciclo, porque si está desactivado, el flujo "arreglado" en el código sigue roto en producción sin que nadie lo note.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Invitar candidato + email | **Resuelto en código** (antes CRÍTICO/roto) | Depende de `EMAIL_SENDING_ENABLED`; si está apagado en producción, falla silenciosa (0 invitaciones enviadas hasta hoy en la BD real, no se puede confirmar que el flujo funcionó de punta a punta) | Verificar la env var en Railway/producción; agregar alerta visible al recruiter si `email_error` no es null | **A** 🚀 |
| Candidato accede a invitación por token | **Resuelto** — ruta pública existe | — | Confirmar con una invitación real de prueba en el próximo ciclo | Verificar |
| Desglose de resultados (`section_scores`) | Parcial (ver Bloque 2) | Sigue sin mostrarse para `assessment_attempts` | Ya reportado | **A** (carry-over) |
| Pruebas propias de la empresa ("pruebas propias") | Código completo (`empresa-pruebas*.ts`, `empresa/pruebas/*`) pero **0 filas en `empresa_pruebas` en producción** | Ninguna empresa ha creado nunca una prueba propia — feature invisible o con fricción de descubrimiento | Revisar si el CTA para crear una prueba propia es visible desde el dashboard; considerar plantillas precargadas para bajar la fricción del primer uso | **M** 🚀 |
| Notificación a empresa cuando candidato completa evaluación | Sin cambios reportados desde el ciclo anterior (marcado roto) | La empresa no se entera automáticamente | Ya reportado; confirmar estado | **A** (carry-over, no verificado) |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Delta vs. ciclo anterior
Resuelto ✅: el funnel de invitaciones (enviadas → vistas → completadas) y el contador de `profile_views` — ambos marcados 🚀 crítico en el ciclo anterior — ya están en el dashboard (`empresa/page.tsx:114-172, 291-341`). Con los datos reales de hoy (`empresa_invitaciones` en 0 filas, `profile_views` en 0 en las 3 empresas), el widget existe pero **hoy mostraría todo en cero para cualquier empresa piloto** — no es un bug, es reflejo fiel de que el flujo de invitaciones recién se desbloqueó y todavía no se usó en producción.

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Funnel de invitaciones, profile views | Sí (resuelto este ciclo) | Sin datos reales todavía para demostrarlo a CLT — vale la pena generar una invitación de prueba real antes de la próxima demo | Ejecutar un flujo de invitación end-to-end con un candidato de prueba para poblar el dashboard antes de mostrarlo a CLT | Crítico 🚀 |
| Tasa de respuesta a invitaciones | Sin verificar cambios | Reportado como faltante el ciclo anterior | Confirmar si se agregó junto con el funnel | Alto (carry-over) |
| Comparación entre procesos, top skills del mes | Sin cambios reportados | Siguen sin existir | Ya reportado | Medio (carry-over) |

---

## ✅ Cierre & registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨🚀 Esquema huérfano `talent_*` con datos reales de CLT abandonados.** CLT tiene 2 procesos de selección reales creados en mayo/junio en un sistema (`talent_companies`/`talent_selection_processes`) que ya no está conectado al frontend actual. 0 candidatos aplicaron. CLT probablemente tuvo que volver a registrarse desde cero el 19 de junio. Tipo: **bug de arquitectura / gap de continuidad de datos**.
2. **⚠️🚀 Adopción real de perfil de empresa = 0%.** Las 3 empresas en producción, incluyendo CLT, tienen el perfil completamente vacío pese a que el formulario y todos los campos de employer branding ya existen en código. Tipo: **problema UX (onboarding no logra conversión)**.
3. **✅ Buenas noticias: el bloqueante crítico #1 del ciclo anterior (invitaciones sin email, sin ruta pública) está resuelto en código.** Pero con **0 invitaciones enviadas en producción**, no hay confirmación de que funcione de punta a punta con datos reales — y el flag `EMAIL_SENDING_ENABLED` es un punto de falla silenciosa no cubierto por este ciclo. Tipo: **verificación pendiente**.
4. **⚠️ `section_scores` sigue sin mostrarse para evaluaciones vía `assessment_attempts`.** Carry-over del ciclo anterior, confirmado que sigue sin resolverse. Tipo: **bug de implementación**.
5. **⚠️🚀 Feature "pruebas propias" con 0 uso real** pese a tener ~600+700 líneas de código dedicadas (`empresa-pruebas.ts`, `empresa-pruebas-candidato.ts`) — posible problema de descubribilidad, no de funcionalidad. Tipo: **gap UX / bajo discovery**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Esquema huérfano `talent_*` con procesos reales de CLT sin migrar | Bug de arquitectura | Sí 🚀 |
| 2 | 0% de perfiles de empresa completos en producción | Problema UX | Sí 🚀 |
| 3 | Invitaciones dependen de `EMAIL_SENDING_ENABLED` sin alerta visible si falla | Bug / gap de observabilidad | Sí 🚀 |
| 4 | `section_scores` no se muestra para `assessment_attempts` | Bug (carry-over) | Sí 🚀 |
| 5 | "Pruebas propias" sin ningún uso real | Gap UX (discovery) | Parcial 🚀 |
| 6 | Empresas duplicadas sin validación de RUC único | Bug menor | No |
| 7 | RUC hardcodeado a Paraguay en 2 archivos independientes | Deuda técnica / gap funcionalidad | Parcial (carry-over) |
| 8 | URL pública con UUID, sin slug | UX (carry-over) | Parcial |
| 9 | Eliminar logo no existe | UX menor (carry-over) | No |
| 10 | ADR-001 (NestJS) desactualizado, puede confundir a onboarding de nuevos devs | Deuda de documentación | No |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. Los 2 procesos de selección que CLT ya creó están "perdidos" en el esquema huérfano — antes de la próxima conversación con CLT, alguien del equipo debería confirmar si esperan encontrar esos procesos.
2. El perfil público de CLT está vacío hoy — si un candidato lo visita ahora mismo, no transmite nada.
3. El flujo de invitaciones recién arreglado no tiene ni una ejecución real registrada — antes de hacer una demo en vivo a CLT, conviene correrlo una vez de punta a punta con un candidato de prueba.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El funnel de invitaciones y el contador de profile views (pedidos el ciclo anterior) ya están construidos — falta solo generar datos reales para poder mostrarlos en un pitch.
- La exportación CSV y comparación de candidatos (pedidas para Banco Continental) están implementadas — validar con un usuario real de RRHH.
- El hallazgo del esquema huérfano, bien resuelto, es también una historia positiva: muestra que ya hay demanda piloto real (CLT creó 2 procesos por su cuenta) — el problema es de continuidad de producto, no de interés del cliente.

### Foco del próximo ciclo (1 hora)

**Prioridad: cerrar el ciclo de vida de datos del piloto CLT y confirmar los fixes del ciclo anterior con datos reales, no solo con lectura de código.**

1. Decidir el destino de los 2 `talent_selection_processes` de CLT (migrar a `empresas`/`hiring_processes` o comunicar y archivar) y verificar si algún servicio sigue escribiendo en el esquema `talent_*`.
2. Ejecutar una invitación real de punta a punta (crear invitación → confirmar email recibido → candidato completa por token → empresa ve funnel actualizado) para validar en producción, no solo en código, y confirmar el estado de `EMAIL_SENDING_ENABLED`.
3. Completar manualmente el perfil de CLT en `/empresa/perfil` como ejercicio de "dogfooding" para detectar fricción real en el formulario que el análisis de código no puede ver.

---

*Revisión generada automáticamente — 2026-08-16 · Rama: `claude/zen-noether-mxmzi4` · Ciclo 2 de mejora continua, sigue a [2026-06-27](./2026-06-27-modulo-empresas-ux-review.md)*
