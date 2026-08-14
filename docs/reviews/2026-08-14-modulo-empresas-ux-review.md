# Revisión UX — Módulo de Empresas
**Fecha:** 14 de agosto de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología y una aclaración importante:** este ciclo se ejecutó como sesión automatizada sin operador humano en vivo y sin un entorno con base de datos/auth levantado para clickear la app como un recruiter real. Por eso, y para cumplir la regla de "no reportar supuestos", esta revisión es **estática sobre el código fuente actual** (Server Actions, páginas Next.js, migraciones SQL de Supabase), no una sesión de uso interactivo. Todo hallazgo cita archivo/línea. Las preguntas que solo pueden responderse mirando la UI renderizada (ej. "¿inspira confianza en 30 segundos?") se marcan explícitamente como **no verificables sin prueba interactiva** en vez de inventarse una respuesta.
>
> **Corrección de contexto de la consigna:** el prompt de este ciclo asume un stack NestJS + Prisma. El repo real es un **monolito Next.js (App Router) sobre Supabase/PostgreSQL directo**: no existe `apps/backend/` ni `schema.prisma`. El equivalente real de "schema" son las migraciones SQL en `supabase/migrations/*.sql`, y el de "controllers/services" son las Server Actions en `apps/frontend/src/actions/*.ts`. Esta revisión usa esos equivalentes.
>
> **Hallazgo de proceso, léase antes que el resto:** ya existe una revisión previa de este mismo módulo, `docs/reviews/2026-06-27-modulo-empresas-ux-review.md`. Se verificó cada uno de sus 10 hallazgos contra el código actual: **7 de 10 ya están resueltos** (incluido el bloqueante crítico #1, invitaciones sin email — aunque con una salvedad importante, ver Bloque 3). El módulo de Empresas dejó de ser "incompleto" en el sentido en que lo describe la consigna de este ciclo; es una feature madura con commits activos hasta el 2026-08-11. El foco de valor de este ciclo pasa a ser: qué falta *ahora*, no repetir lo ya arreglado.

---

## 🏢 Bloque 1 — Perfil de empresa

**Recorrido del flujo:** `apps/frontend/src/app/empresa/perfil/page.tsx` (789 líneas) implementa el formulario completo: logo (Supabase Storage, límite 2MB), razón social, nombre comercial, RUC (validado con regex para Paraguay `\d{6,8}-\d`), descripción (contador 800 car.), sitio web (validado formato URL), industria, país, tamaño de equipo, modalidad de trabajo, tamaño de equipo QA, stack tecnológico (tags con sugerencias), beneficios (contador 500 car.), LinkedIn, barra de completitud con anclas a campos faltantes, link a preview público.

Comparado con la revisión de junio: los campos que entonces faltaban (**stack tecnológico, modalidad de trabajo, beneficios, LinkedIn**) ya están implementados. Persisten dos gaps reales.

| Elemento del perfil | Problema UX | Impacto (A/M/B) | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| URL pública del perfil | Sigue siendo `/empresas/[uuid]`, sin slug (`empresas` no tiene columna `slug` en ninguna migración) | **A** — un UUID en la URL que CLT o Banco Continental compartirían en LinkedIn/firma de mail no transmite profesionalismo | Generar slug desde `nombre_comercial` con fallback a uuid si hay colisión | Incompleto |
| Campos de employer branding (stack, modalidad, beneficios, LinkedIn) | — | — | — | **Completo** (resuelto desde junio) |
| Contador de caracteres en `razon_social`/`nombre_comercial` | No confirmado en este ciclo si se agregó (no releído campo a campo, foco estuvo en gaps estructurales) | B | Verificar en próximo ciclo con lectura directa del form | No verificado este ciclo |
| Eliminar logo | No confirmado si sigue faltando (solo se validó existencia del upload) | B | Verificar en próximo ciclo | No verificado este ciclo |
| RUC para otros países | El campo sigue siendo específico de Paraguay (regex fija) — si un piloto no-paraguayo se suma, el label "RUC" no aplica | M | Renombrar dinámicamente según `country` (RUC/NIT/CUIT/RFC) | Incompleto |
| Vista pública incrementa `profile_views` | — | — | — | **Completo** (RPC `increment_empresa_profile_views`, resuelto desde junio) |
| "¿Un recruiter entiende en <30s cómo completar su perfil?" | Requiere prueba interactiva con usuario real o grabación de sesión | — | Programar test de usabilidad con 1 recruiter piloto | **No verificable sin prueba interactiva** |
| "¿El perfil público inspira confianza?" | Depende de contenido real cargado por la empresa piloto, no solo del código | — | Cargar el perfil real de CLT/Banco Continental y revisar visualmente | **No verificable sin prueba interactiva** |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

**Recorrido del flujo:** dos superficies paralelas — `/empresa/buscar-candidatos` (700 líneas, backed by RPC `get_empresa_candidate_sourcing`) y la pestaña "Talento QA" dentro de `/empresa/candidatos` (que arma el directorio en cliente vía `candidateDirectory.ts`). Ambas requieren opt-in del candidato (`profiles.talent_visible_to_empresas`).

Comparado con junio: el filtro de país (bloqueante marcado 🚀 para CLT) y la exportación CSV (bloqueante 🚀 para Banco Continental) **ya están implementados**.

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país | Presente en `/empresa/buscar-candidatos` (`filterCountry`, línea 97+) | — | — | **Resuelto** (era 🚀 en junio) |
| Exportación CSV de evaluados | Presente (`exportCSV`, `empresa/candidatos/page.tsx:725-758`) | — | — | **Resuelto** (era 🚀 en junio) |
| Comparación side-by-side | Presente: multi-select hasta 4 candidatos + panel comparativo en `/empresa/candidatos` | — | — | **Resuelto** (era gap en junio) |
| Dos implementaciones de directorio paralelas | RPC server-side (`buscar-candidatos`) vs. join client-side (`candidateDirectory.ts:94-175`) reconstruyen lógica similar de forma independiente | Riesgo de que ambas listas muestren resultados distintos para el mismo criterio, y de que un fix de scope/privacidad se aplique a una y no a la otra | Unificar en una sola fuente (RPC) consumida por ambas pantallas | **M** |
| Filtros ISTQB sin descripción | No releído en este ciclo si se agregaron tooltips | Un recruiter sin contexto QA puede no entender `ctfl`/`ctal_ta` | Verificar en próximo ciclo | No verificado este ciclo |
| Ranking/XP no integrado en búsqueda | Existe un sistema de ranking/XP/logros a nivel plataforma (`/ranking`, `getLeaderboardAction`) pero no aparece como columna/filtro en `buscar-candidatos` ni en la pestaña Talento | Un recruiter no ve si un candidato es top-ranked de la comunidad, señal de calidad adicional al score de examen | Agregar columna "Nivel/XP" al directorio de talento | **M** 🚀 (diferenciador de producto) |
| "¿El flujo de contacto es claro y directo?" | Requiere clickear el flujo real de invitar/guardar desde la ficha | — | — | **No verificable sin prueba interactiva** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

**Recorrido del flujo:** dos sistemas paralelos de asignación de evaluación — (1) el built-in vía `hiring_processes.exam_types` (ISTQB, Git, Performance, API Banking, etc.), y (2) un sistema de pruebas propias marcado **"Beta"** en la UI (`empresa/pruebas/page.tsx:75`) donde la empresa arma su propio banco de preguntas.

Comparado con junio: el desglose por sección (`section_scores`, bloqueante 🚀) y la ruta pública de invitación por token (bloqueante crítico) **están resueltos**. El envío de email de invitación, sin embargo, tiene una salvedad crítica que no estaba en el radar de junio.

| Paso del flujo | Estado (completo/incompleto/roto) | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Ruta pública `/invitaciones/[token]` | **Completo** | — | — | Resuelto (era crítico en junio) |
| Desglose `section_scores` en resultado | **Completo** — corregido bajo issue #205 (comentario en `empresa/candidatos/page.tsx:272`) | — | — | Resuelto (era 🚀 en junio) |
| Notificación a la empresa al completar evaluación | **Completo** — `notifyEmpresaExamCompleted` en `actions/empresa-result-notifications.ts`, envía por Resend a todos los owners/admins activos | Este envío **no** está detrás de ningún flag — corre siempre (envuelto en try/catch que traga errores) | Agregar logging/alerta si `sendEmail` falla silenciosamente (hoy solo se loguea y se sigue) | **M** |
| Email de invitación a candidato (`createInvitacionAction`) | **Roto en la práctica / código completo pero inerte por config** | La función solo envía email si `process.env.EMAIL_SENDING_ENABLED === 'true'` (`actions/empresa-invitaciones.ts:6,46-49`). Esta variable **no está documentada en ningún `.env.example`, README o `railway.toml`** — se verificó con grep y no hay una sola referencia fuera del código que la lee. Un deploy nuevo (o el actual, si nadie la seteó a mano en Railway/Vercel) crea la invitación en la base pero **nunca notifica al candidato**, y el error queda solo en `empresa_invitaciones.email_error`, invisible para el recruiter en la UI | **Verificar ahora mismo si `EMAIL_SENDING_ENABLED=true` está seteado en producción (Railway/Vercel).** Si no lo está, este es el mismo bloqueante crítico de junio, solo que la causa cambió de "no hay código" a "el código existe pero está apagado y nadie lo sabe". Documentar la var en `.env.local.example` y agregar guardas/alertas en la UI si `email_error` no es null | **CRÍTICO** 🚀 |
| Selección de tipo de evaluación al crear proceso | Completo funcionalmente | `exam_types` siguen siendo strings sin descripción de duración/nivel en el formulario (no releído si se agregó desde junio) | Verificar en próximo ciclo | No verificado este ciclo |
| Revisión manual de examen práctico ("Bug Hunt") | **Completo** — `/empresa/evaluar/[resultId]` con severidad, score 1-5, notas, workflow de estado | — | — | Nuevo hallazgo positivo, no estaba en junio |
| Comparar candidatos entre sí | **Completo** (ver Bloque 2) | — | — | Resuelto |
| Timeout/fecha límite de evaluación | `expires_at` existe en `hiring_processes`; no se releyó si hay alerta visual de "vence pronto" | — | Verificar en próximo ciclo | No verificado este ciclo |
| "¿El resultado da información suficiente para decidir contratación?" | Con section_scores ya visible, probablemente sí, pero requiere ver un resultado real renderizado | — | — | **No verificable sin prueba interactiva** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

**Recorrido del flujo:** `/empresa` (527 líneas) + `getEmpresaDashboardStatsAction` (`actions/employer.ts:492+`).

Comparado con junio: los 3 gaps marcados "Crítico 🚀" (profile views, funnel de invitaciones, tasa de respuesta) **están resueltos**.

| Métrica/widget | Existe (sí/no/parcial) | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Perfil visto por candidatos (`profile_views`) | **Sí** | — | — | Resuelto (era crítico 🚀 en junio) |
| Funnel invitación → vista → completada | **Sí** (`FunnelWidget`, `empresa/page.tsx:114-172`) | — | — | Resuelto (era crítico 🚀 en junio) |
| Tasa de respuesta a invitaciones | **Sí** — parte del mismo funnel | — | — | Resuelto (era 🚀 en junio) |
| Exportación CSV | **Sí** (ver Bloque 2) | — | — | Resuelto |
| Procesos activos/totales/cerrados | Sí | No releído si distingue estados con color | Verificar en próximo ciclo | Alto |
| Candidatos evaluados + tasa de aprobación | Sí | No releído si separa aprobados/reprobados en el número principal | Verificar en próximo ciclo | Alto |
| Prospectos y invitaciones pendientes (badges) | Sí | — | — | Bueno |
| Gráficos 6 meses (Recharts) | Sí | — | — | Bueno |
| Comparación entre procesos (tabla proceso a proceso) | No confirmado — no se encontró explícitamente en el código leído | Sin esta vista, comparar 2+ procesos requiere entrar a cada uno | Agregar tabla resumen en `/empresa/procesos` | Medio |
| Top skills QA de la plataforma este mes | **No existe** — no se encontró ninguna query/widget de este tipo | Oportunidad de market intelligence para el pitch a CLT/Banco Continental | Widget "Skills más evaluados en AIQUAA este mes" (agregación simple sobre `exam_results`/`assessment_attempts`) | Medio — 🚀 (diferenciador para pitch B2B) |
| "¿El dashboard comunica de un vistazo el estado del proceso de selección?" | Requiere ver el dashboard renderizado con datos reales | — | — | **No verificable sin prueba interactiva** |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Resumen ejecutivo (máx. 5 bullets)

1. **El módulo de Empresas ya no es "incompleto" como asume la consigna** — 7 de los 10 hallazgos de la revisión del 2026-06-27 (incluidos los 5 bloqueantes 🚀 para el piloto) están resueltos en el código actual: directorio público, URL/perfil público, desglose de resultados por sección, filtro por país, CSV, funnel de invitaciones y profile views.
2. **🚨 Hallazgo crítico nuevo: el email de invitación a candidatos puede estar apagado en producción sin que nadie lo sepa.** El código de envío existe y es correcto, pero está condicionado a `process.env.EMAIL_SENDING_ENABLED === 'true'`, una variable no documentada en ningún `.env.example` ni en `railway.toml`. Si no está seteada explícitamente en el deploy, el flujo B2B core (invitar candidato externo) vuelve a estar tan roto como en junio, solo que de forma silenciosa — el registro se crea, nadie recibe el mail, y solo se ve en un campo `email_error` que la UI no expone al recruiter.
3. **Funcionalidad duplicada / posible deuda técnica**: `/employer/*` y `/empresa/procesos/*` son dos flujos completos y en producción que hacen básicamente lo mismo sobre la misma tabla `hiring_processes`; y `/invitacion/[token]` (singular) parece código muerto — ningún link en la app apunta a esa ruta, todos usan `/invitaciones/[token]` (plural).
4. **URL pública de empresa sigue siendo un UUID**, sin slug — pendiente desde junio, impacto en profesionalismo/employer branding para CLT y Banco Continental.
5. **Nueva oportunidad de valor no capturada**: el sistema de ranking/XP de la plataforma no está integrado en la búsqueda de candidatos que ve un recruiter, y no existe un widget de "skills QA más evaluados este mes" — ambos son diferenciadores fáciles de justificar para el pitch de Moonshot con datos que ya existen en la base.

### Clasificación de hallazgos de este ciclo

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | `EMAIL_SENDING_ENABLED` sin documentar, invitaciones potencialmente inertes en prod | Bug de configuración | **Sí, si no está seteado en prod — verificar ya** 🚀 |
| 2 | URL pública de empresa usa UUID, no slug | Gap UX / funcionalidad | Parcial |
| 3 | Rutas duplicadas `/employer/*` vs `/empresa/procesos/*` | Deuda técnica | No (pero riesgo de inconsistencia futura) |
| 4 | Ruta muerta `/invitacion/[token]` (singular) | Deuda técnica / limpieza | No |
| 5 | Dos implementaciones paralelas de directorio de candidatos (RPC vs. client-join) | Deuda técnica / riesgo de inconsistencia | No |
| 6 | Ranking/XP no integrado en búsqueda de candidatos | Gap de funcionalidad / oportunidad | No — 🚀 (valor de producto) |
| 7 | Sin widget "top skills QA del mes" | Gap de funcionalidad / oportunidad | No — 🚀 (valor de pitch) |
| 8 | Notificación a empresa (`notifyEmpresaExamCompleted`) sin manejo visible de fallos | Gap UX menor | No |
| 9 | Campo RUC no adaptable a otros países | Gap UX menor | No (solo si el piloto se expande fuera de PY) |

### Tickets listos para Jira (aiquaa.atlassian.net)

> No se creó el ticket vía API — este entorno de ejecución no tiene acceso configurado a Jira. Los siguientes bloques están listos para copiar/pegar tal cual en "Crear issue".

**[BUG-CRÍTICO] Verificar si EMAIL_SENDING_ENABLED está activo en producción — invitaciones a candidatos pueden no estar enviándose**
- Descripción: `createInvitacionAction` (apps/frontend/src/actions/empresa-invitaciones.ts:46-49) solo llama a Resend si `process.env.EMAIL_SENDING_ENABLED === 'true'`. La variable no aparece en `.env.local.example`, `railway.toml` ni documentación. Si no está seteada en el deploy activo, toda invitación a un candidato externo se crea en `empresa_invitaciones` pero nunca se notifica por email.
- Pasos para reproducir: crear una invitación desde `/empresa/invitaciones` en el ambiente de producción y confirmar si el candidato recibe el email; si no, revisar `empresa_invitaciones.email_error` en la tabla.
- Impacto: Alto — bloquea el caso de uso B2B core (invitar candidato externo) para CLT/Banco Continental.
- Prioridad: Crítica 🚀

**[GAP UX] URL pública de empresa usa UUID en vez de slug legible**
- Descripción: `/empresas/[id]` usa el UUID de `empresas.id`; no existe columna `slug`.
- Impacto: Medio — afecta profesionalismo al compartir el link (LinkedIn, firma de email, pitch a Moonshot).
- Prioridad: Media 🚀

**[DEUDA TÉCNICA] Flujos duplicados de procesos de contratación (`/employer/*` vs `/empresa/procesos/*`)**
- Descripción: ambas rutas leen/escriben `hiring_processes` de forma independiente y están en producción simultáneamente.
- Impacto: Riesgo de inconsistencia de datos/UX y mantenimiento doble a futuro.
- Prioridad: Media

**[LIMPIEZA] Ruta muerta `/invitacion/[token]` (singular)**
- Descripción: no se encontró ninguna referencia interna a esta ruta; el flujo real usa `/invitaciones/[token]` (plural).
- Impacto: Bajo — confusión de mantenimiento, superficie de ataque innecesaria.
- Prioridad: Baja

**[OPORTUNIDAD] Integrar ranking/XP de la plataforma en la búsqueda de candidatos**
- Descripción: existe un sistema de ranking/XP/logros (`/ranking`) no reflejado en `/empresa/buscar-candidatos` ni en la pestaña Talento.
- Impacto: Diferenciador de producto para el pitch B2B.
- Prioridad: Media 🚀

**[OPORTUNIDAD] Widget "Top skills QA evaluados este mes" en el dashboard de empresa**
- Descripción: agregación simple sobre `exam_results`/`assessment_attempts`, dato de market intelligence sugerido en la consigna del ciclo.
- Impacto: Fortalece pitch a CLT/Banco Continental/Moonshot.
- Prioridad: Media 🚀

### Bloqueantes para uso real por el cliente piloto (CLT / Banco Continental)

1. **Confirmar si el email de invitación está realmente activo en producción** — si `EMAIL_SENDING_ENABLED` no está seteado, el piloto no puede invitar candidatos externos, el mismo bloqueante de junio con causa distinta.
2. El resto de los bloqueantes documentados en junio (directorio público, filtro país, CSV, section scores, funnel) están resueltos y no vuelven a bloquear el piloto.

### Foco del próximo ciclo (1 hora)

**Prioridad 1:** Confirmar en el ambiente real (Railway/Vercel) si `EMAIL_SENDING_ENABLED=true` está seteado; si no lo está, activarlo y hacer una prueba end-to-end real de invitación (crear invitación → confirmar recepción de email → aceptar por token) — esta vez con navegador real, no solo lectura de código.

**Prioridad 2:** Decidir y ejecutar la consolidación de `/employer/*` vs `/empresa/procesos/*` (deprecar uno) antes de que la deuda crezca más.

**Prioridad 3:** Implementar slug para URLs públicas de empresa y el widget de "top skills del mes" — ambos son mejoras baratas con alto valor de pitch para Moonshot.

---

*Revisión generada automáticamente — 2026-08-14 · Rama: `claude/zen-noether-5f9zte` · Ciclo automatizado sin operador en vivo.*
