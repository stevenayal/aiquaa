# Revisión UX — Módulo de Empresas (ciclo 3)
**Fecha:** 18 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada — sesión programada)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT (Centro Logístico de Tecnología) · Banco Continental SAECA (Paraguay)
**Ciclo anterior:** [`2026-06-27-modulo-empresas-ux-review.md`](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología de este ciclo:** revisión estática del código fuente (Next.js Server Actions, páginas, migraciones SQL) **+ inspección directa de la base de datos Supabase de producción** (proyecto `aiquaa`, `cbkctkpyxwbufvbwxogp`) vía MCP — conteos de filas reales, contenido real del perfil piloto de CLT, advisories de seguridad. No hubo recorrido manual en navegador (no hay stack local ni datos semilla para levantar el módulo — ver Corrección de arquitectura). Todo hallazgo está respaldado por código o por una consulta SQL ejecutada, no por suposición.

---

## ⚠️ Corrección de arquitectura (importante para próximos ciclos)

El prompt de este ciclo describe el stack como *"Next.js + NestJS + Railway + Supabase + Resend"*. Eso ya no es así: el backend NestJS/Railway/Prisma fue **eliminado el 24 de junio de 2026** (commit `a67bc38`, *"remove NestJS backend and dead code (migrated to Supabase)"*). Hoy el stack real es **Next.js (Server Actions) → Supabase directo** (Postgres + Auth + Storage + Edge Functions), sin capa NestJS intermedia.

`README.md` y `docs/adr/ADR-001-monolito-modular-nest.md` siguen describiendo el backend NestJS como si existiera — quedaron desactualizados por la migración y deberían corregirse o marcarse como *Superseded* para no confundir a alguien que se orienta con esos documentos (como pasó con el prompt de este ciclo).

---

## 🏢 Bloque 1 — Perfil de empresa

### Evidencia real: el perfil piloto de CLT está vacío y sin dueño

Consulté directamente la tabla `empresas` en producción. Hay 3 filas: `Aiquaa`, `AIQUAA` (ambas cuentas internas de prueba) y **`CLT`**, creada el 19 de junio de 2026.

| Campo | Valor real en producción (fila CLT) |
|---|---|
| `razon_social` / `nombre_comercial` | CLT |
| `logo_url` | **null** |
| `description` | **null** |
| `website_url` | **null** |
| `industry` | **null** |
| `team_size` / `qa_team_size` / `work_mode` | **null** |
| `tech_stack` | **null** |
| `benefits` | **null** |
| `linkedin_url` | **null** |
| `country` | `PY` (único campo con valor, precargado por default) |
| `profile_views` | 0 |
| `empresa_miembros` asociados | **0 filas** |

El último punto es el más grave: la tabla `empresa_miembros` (que determina quién puede iniciar sesión y administrar `/empresa/perfil`) **no tiene ningún registro para CLT**. Solo las dos empresas internas de prueba (`Aiquaa`, `AIQUAA`) tienen un `owner` activo. Esto significa que, tal como está la base hoy, **ningún usuario real de CLT puede entrar a gestionar su propio perfil** — la fila existe (probablemente creada manualmente por un admin) pero está huérfana de dueño.

De 97 perfiles de usuario totales, solo 3 tienen `audience = 'empresa'` (y solo 1 tiene el `role = 'employer'` legado, que ya no es el campo que gatea el acceso — inconsistencia menor entre `role` y `audience` que vale la pena unificar).

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Cuenta piloto CLT sin owner | Fila `empresas` de CLT existe pero **0 filas en `empresa_miembros`** — nadie puede loguearse a administrarla | **CRÍTICO** 🚀 | Asignar manualmente un `owner` (invitar al contacto real de CLT) antes de cualquier demo | **Roto** (bloqueante para piloto) |
| Perfil de CLT 100% vacío | Todos los campos de branding (logo, descripción, industria, stack, beneficios, LinkedIn) están en `null` | **A** 🚀 | Completar el perfil junto con CLT como parte del onboarding piloto | Incompleto |
| Campos de identidad profesional (stack, modalidad, beneficios, LinkedIn) | Ya existen en el schema y en `/empresa/perfil` (agregados desde el ciclo anterior) | — | Falta que alguna empresa real los complete — confirmar que el formulario los persiste correctamente con datos reales | **Mejorado desde ciclo anterior** (antes no existían los campos) |
| `country='PY'` precargado | Sigue generando falsa sensación de avance en la barra de completitud | **M** (heredado, no re-verificado en UI este ciclo) | Calcular completitud solo tras guardado explícito del usuario | Incompleto |
| `role` vs `audience` inconsistentes | Solo 1 perfil tiene `role='employer'` de 3 con `audience='empresa'` | **B** | Unificar en un solo campo o documentar cuál es la fuente de verdad | Gap de datos |
| URL pública con UUID | `/empresas/[id]` sigue usando UUID, no slug (hallazgo del ciclo anterior) | **M** (heredado, no re-verificado en código este ciclo) | Generar slug desde `nombre_comercial` | Incompleto |

### Preguntas UX clave

- **¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?** No pudo evaluarse este ciclo por interacción real de UI, pero el dato de producción es contundente: **la única empresa piloto real (CLT) tiene el perfil completamente vacío seis semanas después de crearse**, lo que sugiere que, exista o no una buena guía visual, nadie de CLT ha llegado a usarla — muy probablemente porque no tiene cuenta para entrar.
- **¿El perfil público de la empresa inspira confianza a un candidato QA?** No: el perfil público de CLT (`/empresas/[id]`) hoy mostraría una empresa sin logo, sin descripción y sin ningún dato — el peor caso posible para un pitch a un candidato o a Banco Continental.

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

No se re-ejecutó código de este bloque este ciclo (foco puesto en verificar datos reales de Bloque 1 y 3). Se hereda el estado del ciclo anterior sin cambios detectados en el diff de código desde el 27/06:

| Filtro/función | UX actual | Problema | Prioridad |
|---|---|---|---|
| Filtro por país | Ausente en la UI | CLT necesita filtrar candidatos de Paraguay | **A** 🚀 (heredado, sin cambios) |
| Filtros ISTQB sin tooltip | Valores técnicos (`ctfl`, `ctal_ta`) sin explicación | Recruiter no-técnico no entiende | **A** (heredado) |
| Invitar desde ficha de candidato | No existe botón inline | Flujo fragmentado entre módulos | **A** 🚀 (heredado) |
| Exportar CSV | Ausente | Banco Continental necesita reportar a RRHH | **A** 🚀 (heredado) |
| `empresa_favoritos` (shortlist) | Funcional en código | **0 filas en producción** — nunca se usó | **Nuevo dato:** feature construida, cero adopción real |

**Novedad de este ciclo:** confirmé por SQL que `empresa_favoritos` tiene **0 registros** en producción — el shortlist nunca fue usado por ninguna empresa real, ni siquiera las de prueba.

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Evidencia real: el flujo de evaluaciones nunca se completó de punta a punta

| Tabla | Filas en producción | Lectura |
|---|---|---|
| `empresa_invitaciones` | **0** | Nunca se envió una invitación de evaluación a un candidato, pese a que el envío de email vía Resend se implementó el 27/06 |
| `empresa_pruebas` (pruebas propias) | **0** | El constructor de pruebas propias (shipeado 09/07) nunca fue usado para crear una prueba real |
| `empresa_preguntas` | **0** | — |
| `empresa_prueba_invitaciones` | **0** | — |
| `empresa_intentos` | **0** | Ningún candidato completó una prueba de empresa |

### Tabla de hallazgos

| Paso del flujo | Estado (código) | Estado (uso real) | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Invitar candidato por email | **Arreglado desde el ciclo anterior** (`empresa-invitaciones.ts` ahora envía vía Resend, existe `/invitaciones/[token]`) | **Nunca ejecutado en producción** (0 filas) | Validar el flujo end-to-end con un envío real a un email de prueba antes de asumirlo funcional | **A** — validar, no solo confiar en el código |
| `section_scores` en resultados de empresa | Sigue forzado a `null` en `apps/frontend/src/actions/employer.ts:417` (`fetchAssessmentAttemptsForProcessCodes`) | El recruiter no puede ver desglose por área | Mostrar `section_scores` reales en vez de `null` hardcodeado | **A** (sin cambios desde 27/06) |
| Constructor de pruebas propias de empresa | Código completo (`empresa/pruebas/*`, shipeado 09/07) | **Cero uso real** — 0 pruebas creadas | Confirmar con CLT/prueba piloto interna que el flujo funciona de punta a punta; nadie lo ha probado con datos reales | **A** |
| Notificación a la empresa al completar evaluación | No implementada (heredado) | — | Agregar trigger Supabase → Resend al completar `empresa_intentos`/invitación | **A** 🚀 (heredado) |

### Pregunta UX clave

**¿El resultado le da información suficiente para tomar una decisión de contratación?** Sigue sin poder confirmarse con datos reales — no hay un solo intento completado (`empresa_intentos` = 0) que permita observar la vista de resultados con datos reales, más allá de que el código exista.

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

| Métrica/widget | Existe en código | Dato real en producción | Valor para la empresa |
|---|---|---|---|
| Perfil visto por candidatos (`profile_views`) | Sí (agregado 27/06, RPC `increment_empresa_profile_views`) | **0 para las 3 empresas**, incluida CLT | No se puede confirmar que el contador incremente correctamente sin tráfico real — falta validación end-to-end |
| Funnel invitación → vista → completada | Sí (widget agregado 27/06) | Sin datos que mostrar (`empresa_invitaciones` = 0) | El widget está construido pero nunca se ha visto con datos reales |
| `section_scores` en dashboard | No (ver Bloque 3) | — | — |
| Comparación entre procesos | No (heredado) | — | — |

**Lectura general del bloque:** las mejoras del ciclo anterior (page views, funnel) están **codificadas pero no verificadas con actividad real** — el dashboard de CLT hoy se vería completamente vacío, lo cual es coherente con que su cuenta no tiene owner (Bloque 1) y por lo tanto nadie de CLT lo ha visto nunca.

---

## 🔴 Hallazgo nuevo y crítico: datos huérfanos del sistema legado (`talent_*`)

Al inspeccionar el esquema completo de la base de datos encontré un segundo grupo de tablas — `talent_companies`, `talent_selection_processes`, `talent_process_stages`, `talent_applications`, etc. — con columnas estilo Prisma (`createdAt`, `id` tipo `text` con formato `cuid`). Estas son **remanentes del backend NestJS/Prisma eliminado el 24/06**.

Contienen datos reales y recientes de **CLT** (`talent_companies.name = 'CENTRO LOGISTICO DE TECNOLOGIA SA'`):
- Un proceso de selección **`ACTIVE`**: *"Bootcamp 2026 - Fase de Pruebas"* (creado 04/06/2026)
- Un proceso `DRAFT`: *"Testers Juniors"* (creado 27/05/2026)

El código del frontend actual (`apps/frontend/src/app`) **no contiene ninguna referencia a `talent_companies` ni a las tablas `talent_*`** (confirmado por búsqueda en el código) — no hay ninguna página ni server action que las lea o escriba. El campo `talent_companies.aiquaaEmpresaId`, que debería vincular esta fila con la fila `CLT` en `empresas`, está en **`null`**.

**Conclusión:** hay un proceso de selección activo de CLT, con 6+ semanas de antigüedad, que quedó completamente huérfano y sin ninguna interfaz para accederlo desde que se apagó el backend NestJS. Ni el equipo de CLT ni AIQUAA pueden ver ni gestionar ese proceso hoy — es data real y reciente del cliente piloto, atrapada en una tabla muerta.

| Elemento | Problema | Impacto | Propuesta | Estado |
|---|---|---|---|---|
| Proceso `talent_selection_processes` de CLT (`ACTIVE`) | Sin interfaz de acceso desde la migración a Supabase-only | **CRÍTICO** 🚀 | Decidir: (a) migrar esos datos al esquema `empresas`/`hiring_processes` vigente, o (b) confirmar con CLT que ese proceso ya no aplica y archivarlo explícitamente | **Roto** — dato huérfano |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨🚀 CLT no tiene cuenta de acceso.** La fila de `empresas` para CLT existe pero tiene **cero miembros** en `empresa_miembros` — nadie de CLT puede loguearse a `/empresa` para ver o completar su perfil. Esto bloquea el piloto en su totalidad, antes de cualquier otra mejora. *Tipo: bug/gap de funcionalidad crítico.*
2. **🚨🚀 Proceso de selección activo de CLT quedó huérfano.** La migración del backend NestJS a Supabase (24/06) dejó un proceso `ACTIVE` real de CLT en tablas `talent_*` sin ninguna interfaz de acceso. *Tipo: bug de migración / pérdida de continuidad de datos.*
3. **🚨 `section_scores` sigue descartado** (`employer.ts:417`, sin cambios desde el 27/06) — el recruiter no puede ver desglose de resultados por área. *Tipo: bug de implementación.*
4. **⚠️ Funcionalidad construida sin adopción verificada.** Invitaciones por email, pruebas propias de empresa, favoritos y el funnel del dashboard están codificados (algunos desde hace semanas) pero **0 en uso real** — nadie ha completado el flujo de punta a punta con datos reales. *Tipo: gap de validación, no de código.*
5. **⚠️ Documentación de arquitectura desactualizada.** `README.md` y `ADR-001` describen un backend NestJS que fue eliminado; puede inducir a error a cualquiera (incluido este mismo ciclo de revisión) que se oriente por esos documentos. *Tipo: deuda técnica / documentación.*

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | CLT sin miembro/owner en `empresa_miembros` | Bug (config/datos) | **Sí — bloqueante total** 🚀 |
| 2 | Proceso `talent_*` de CLT huérfano post-migración | Bug de migración | **Sí** 🚀 |
| 3 | `section_scores` forzado a `null` | Bug de implementación | Sí 🚀 |
| 4 | Perfil de CLT 100% vacío (branding) | Gap de funcionalidad/contenido | Sí 🚀 |
| 5 | Flujo de invitación por email nunca validado con envío real | Gap de validación | Sí (antes de confiar en la demo) |
| 6 | Constructor de pruebas propias nunca usado con datos reales | Gap de validación | Sí |
| 7 | Sin filtro de país en búsqueda de candidatos | UX problem (heredado) | Sí 🚀 |
| 8 | Sin exportación CSV de resultados | Gap de funcionalidad (heredado) | Sí 🚀 |
| 9 | `README.md` / `ADR-001` desactualizados | Documentación | No, pero genera confusión en ciclos futuros |
| 10 | Inconsistencia `role` vs `audience` en `profiles` | Gap de datos / diseño | No |

### Tickets listos para crear en Jira

> ⚠️ No tengo un conector de Jira disponible en esta sesión (`aiquaa.atlassian.net` no está conectado), así que no pude crear los tickets directamente. Quedan listos abajo para copiar/pegar.

**[CRÍTICO] CLT no puede acceder a su cuenta de empresa**
- *Descripción:* La empresa piloto CLT existe en `empresas` (id `765269d3-b928-4059-a27b-fcdbb61b24b9`) pero no tiene ningún registro en `empresa_miembros`. Ningún usuario puede autenticarse como esa empresa.
- *Pasos para reproducir:* `SELECT * FROM empresa_miembros WHERE empresa_id = '765269d3-b928-4059-a27b-fcdbb61b24b9'` → 0 filas.
- *Impacto:* Bloquea el piloto completo; CLT no puede usar ninguna función de `/empresa/*`.
- *Prioridad:* Crítica.

**[CRÍTICO] Proceso de selección activo de CLT huérfano tras migración a Supabase**
- *Descripción:* `talent_selection_processes` tiene un proceso `ACTIVE` de CLT ("Bootcamp 2026 - Fase de Pruebas") sin ninguna interfaz que lo exponga desde que se eliminó el backend NestJS (commit `a67bc38`, 24/06).
- *Pasos para reproducir:* Buscar `talent_*` en `apps/frontend/src` → sin resultados; consultar `talent_selection_processes` en Supabase → datos presentes.
- *Impacto:* Pérdida de continuidad de un proceso de reclutamiento real del cliente piloto.
- *Prioridad:* Crítica.

**[ALTA] `section_scores` se descarta al mostrar resultados a la empresa**
- *Descripción:* `fetchAssessmentAttemptsForProcessCodes` en `apps/frontend/src/actions/employer.ts:417` fuerza `section_scores: null` en vez de propagar el desglose real.
- *Impacto:* El recruiter no puede evaluar fortalezas/debilidades por área del candidato.
- *Prioridad:* Alta (abierto desde el ciclo del 27/06, sin resolver).

**[ALTA] Validar flujo de invitación por email con un envío real**
- *Descripción:* El código de envío de invitaciones (Resend) se implementó el 27/06, pero `empresa_invitaciones` tiene 0 filas en producción — nunca se ejecutó con datos reales.
- *Impacto:* Riesgo de que el flujo falle en la primera demo real a CLT/Banco Continental si algo no funciona (ej. plantilla de email, dominio verificado en Resend).
- *Prioridad:* Alta — validar antes de la próxima demo.

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. CLT no tiene ninguna cuenta con acceso a `/empresa` — **bloqueante absoluto, antes que cualquier otro punto**.
2. El proceso de selección activo real de CLT está atrapado en tablas huérfanas sin interfaz.
3. El perfil público de CLT está vacío — no transmite ningún employer branding.
4. Ningún flujo de invitación/evaluación de empresa se ha probado de punta a punta con datos reales.
5. Sin filtro de país ni exportación CSV en búsqueda de candidatos (heredado).

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El funnel de invitaciones y el contador de `profile_views` ya están construidos — solo falta tráfico real para poder mostrarlos en un pitch.
- Resolver el punto #1 (acceso de CLT) es la palanca de mayor apalancamiento del backlog: desbloquea *todos* los demás bloques de un solo movimiento.
- El hallazgo del proceso huérfano de CLT es evidencia concreta de que el piloto ya generó actividad real (no es solo un mockup) — vale la pena rescatar esos datos para la narrativa de tracción con inversores.

### Foco del próximo ciclo (1 hora)

**Prioridad:** Desbloquear el acceso real de CLT y validar el flujo de invitaciones con datos reales.

1. Crear/asignar un `owner` real en `empresa_miembros` para la fila CLT y confirmar login.
2. Decidir el destino del proceso huérfano en `talent_selection_processes` (migrar o archivar con aviso a CLT).
3. Enviar una invitación real de prueba de punta a punta (crear invitación → recibir email → completar vía `/invitaciones/[token]`) y documentar cualquier fallo encontrado.
4. Corregir `section_scores: null` en `employer.ts:417`.

Este ciclo prioriza *que el piloto pueda literalmente entrar a la plataforma* por sobre features nuevas — es el gap más barato de cerrar y el que más desbloquea.

---

*Revisión generada automáticamente — 2026-07-18 · Rama: `claude/zen-noether-vhcf96` · Sesión programada (scheduled task)*
