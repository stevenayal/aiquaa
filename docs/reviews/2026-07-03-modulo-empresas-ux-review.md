# Revisión UX — Módulo de Empresas (Ciclo 2)
**Fecha:** 3 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión de código + datos reales de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Este ciclo combina lectura del código fuente actual (Next.js Server Actions sobre Supabase — el backend NestJS/Prisma descrito en `CLAUDE.md` fue removido el 2026-06-24 y ya no existe en el repo), diff contra el ciclo anterior (`docs/reviews/2026-06-27-modulo-empresas-ux-review.md`) e historial de commits, y **consultas SQL de solo lectura contra la base de producción real** (proyecto Supabase `aiquaa`) para verificar estado de adopción y advisories de seguridad. No se navegó la UI en vivo (no hay navegador interactivo disponible en este entorno) — todo hallazgo está respaldado por código o datos reales, no supuestos.

---

## 🏢 Bloque 1 — Perfil de empresa

### Qué cambió desde el ciclo anterior
El directorio público `/empresas` (flagged como "roto/faltante" el 27/6) **ya existe** — implementado en `0491b6e` el mismo día. Los campos de employer branding (`work_mode`, `tech_stack[]`, `benefits`, `linkedin_url`, `qa_team_size`) también se agregaron.

### Preguntas UX clave
**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Sí — la barra de completitud con anchors a campos faltantes (`apps/frontend/src/app/empresa/perfil/page.tsx:81-102`) es clara. El problema de `country='PY'` por defecto (completitud falsa) sigue sin resolver.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
**No, verificado con datos reales de producción.** Consulté la tabla `empresas` en producción: hay **3 empresas registradas y ninguna tiene `description`, `logo_url`, `website_url` ni `tech_stack` cargados** (0/3 en los cuatro campos). El directorio público `/empresas` (`apps/frontend/src/app/empresas/page.tsx:37-42`) lista estas empresas sin ningún filtro de completitud — hoy mismo, cualquier candidato que visite `/empresas` ve tarjetas casi vacías (solo razón social, sin logo ni descripción).

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Directorio público con perfiles vacíos | Las 3 empresas reales en producción no tienen descripción/logo/web — el directorio las expone así igual | **A** 🚀 | No listar en `/empresas` (o mostrar con badge "perfil incompleto") empresas por debajo de un umbral de completitud | Roto en la práctica (dato real de prod) |
| Completitud por defecto (`country='PY'`) | Sigue precargado a nivel de columna DB (`ALTER TABLE ... DEFAULT 'PY'`), da ~14% de avance sin acción del usuario | **M** | Calcular completitud solo sobre campos editados explícitamente, o quitar el default de la columna | Incompleto (no resuelto desde ciclo 1) |
| URL pública del perfil | Sigue siendo un UUID (`/empresas/[id]`), no hay slug | **A** | Generar slug desde `nombre_comercial` con fallback a UUID | Incompleto (no resuelto desde ciclo 1) |
| Campos de employer branding | Stack tecnológico, modalidad, beneficios, LinkedIn, tamaño de equipo QA — **ya implementados** en el formulario y el perfil público | — | — | ✅ Completo (nuevo desde ciclo 1) |
| RUC para otros países | El campo sigue siempre etiquetado "RUC" independientemente del país seleccionado | **B** | Etiqueta dinámica según país (RUC/NIT/CUIT/RFC) | Incompleto |
| Contador de caracteres | `razon_social`/`nombre_comercial` sin contador visual (sí lo tiene `description`) | **B** | Agregar contador `{n}/120` consistente | Parcial |
| Eliminar logo | Solo existe "Cambiar logo", no "Quitar logo" | **B** | Botón de eliminar con confirmación | Incompleto |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Qué cambió desde el ciclo anterior
Los dos hallazgos de prioridad **A** más citados el 27/6 —falta de filtro por país y valores ISTQB sin traducir— **ya están resueltos**: `apps/frontend/src/app/empresa/buscar-candidatos/page.tsx` ahora tiene `ISTQB_LEVEL_LABELS` (ctfl → "Foundation Level (CTFL)", etc.) y un filtro de país (línea 384). El botón "Invitar" inline y la exportación CSV, también pedidos, están implementados.

**Hallazgo crítico nuevo verificado con datos reales:** la función RPC que alimenta esta búsqueda, `get_empresa_candidate_sourcing()`, **nunca se aplicó a producción hasta ayer** (2026-07-02, commit `0d8fe9d fix(rls): repair empresa_candidate_sourcing migration and apply to prod`). El propio comentario de la migración dice textualmente que la función faltaba en `supabase_migrations.schema_migrations` y que `/empresa/buscar-candidatos` fallaba con "Could not find the function public.get_empresa_candidate_sourcing". Es decir: **la búsqueda de candidatos estuvo rota en producción hasta hace 24 horas.**

### Preguntas UX clave
**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Ahora sí — los labels ISTQB y el filtro de país usan texto legible (aunque el país se muestra como código ISO crudo: "PY" en vez de "🇵🇾 Paraguay", inconsistente con `/empresas/page.tsx` que sí usa `COUNTRY_LABELS` con banderas).

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Sí, el botón "Invitar" está inline en la ficha (`Send` icon) y el shortlist (favoritos) es funcional.

**Verificado con datos de producción:** `profiles.talent_visible_to_empresas = true` → **0 candidatos** hoy. El pool de "Talento" opt-in está **vacío en producción**. El empty state que vería CLT/Banco Continental hoy es literalmente "Sin talento visible todavía" (`candidatos/page.tsx:1245`), sin ningún CTA para paliarlo (ni "invitar candidatos por email" ni "compartir link para que activen visibilidad").

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Pool de talento vacío en prod | 0 candidatos con `talent_visible_to_empresas=true` hoy | El feature está construido pero no tiene inventario real — cualquier demo a un cliente piloto mostrará una tabla vacía | Campaña de activación a la base de usuarios QA para opt-in ("hacéte visible a empresas"), o degradar el empty state con un CTA claro | **A** 🚀 |
| RPC `get_empresa_candidate_sourcing` faltó en prod hasta ayer | Recién reparado (`0d8fe9d`, 2026-07-02) | Riesgo de regresión: no hay test de contrato que verifique que la migración esté aplicada en el ambiente real | Agregar chequeo post-deploy que llame la RPC y falle el pipeline si no existe | **A** |
| Filtro de país sin bandera/label completo | Muestra código ISO crudo (`PY`) en vez de "🇵🇾 Paraguay" | Inconsistente con el directorio público que sí usa `COUNTRY_LABELS` | Reusar el mismo mapa de labels en ambos componentes | **B** |
| Comparación side-by-side de candidatos | No existe | Recruiter debe tomar notas manualmente | Checkbox multi-select + modal comparativo (máx. 3) | **M** |
| Desglose `section_scores` inconsistente entre vistas | Ver Bloque 3 — corregido en la tabla principal de "Candidatos evaluados" pero no en `/empresa/procesos/[id]` ni en la ruta legada `/employer/[code]` | Un recruiter que entra por "ver detalle del proceso" ve menos información que uno que entra por la lista general | Unificar las tres queries duplicadas de resultados en una sola función compartida | **A** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Qué cambió desde el ciclo anterior
Los dos hallazgos marcados **CRÍTICO** el 27/6 se resolvieron esta semana:
- **Envío de email** (`createInvitacionAction`) ahora sí llama a Resend (`empresa-invitaciones.ts`).
- **Ruta pública por token** (`/invitaciones/[token]/page.tsx`) ya existe y está bien resuelta: muestra branding de la empresa, tipo de examen con label legible, mensaje personalizado, y CTA de "Crear cuenta / Iniciar sesión".

**Hallazgo nuevo, no reportado antes:** el envío de email está detrás de un feature flag, `EMAIL_SENDING_ENABLED=== 'true'` (`empresa-invitaciones.ts:6`), que **no está documentado en ningún `env.example`**. En una instalación nueva (o si el equipo de deploy no lo agregó manualmente en Railway/Vercel), la funcionalidad "crea la invitación pero nunca envía el correo" — sin ningún error visible para la empresa, que asumirá que el candidato fue notificado. Confirmé con datos reales: `empresa_invitaciones` tiene **0 filas en producción** (nadie usó el flujo todavía), así que este riesgo no se manifestó aún, pero bloquearía silenciosamente la primera prueba real con un cliente piloto si la variable no está seteada en el entorno productivo.

**Hallazgo de código duplicado:** existe una ruta legada `/employer/[code]/page.tsx` que reimplementa lo mismo que `/empresa/procesos/[id]/page.tsx` con una UI más simple y usando la función `getProcessCandidatesAction` cuyo desglose de secciones sigue en `null` (ver Bloque 2). Es candidato a eliminar o redirigir.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Envío de email al invitar candidato | Completo en código, **riesgo en producción** | Depende de `EMAIL_SENDING_ENABLED`, variable no documentada en `env.example`; falla en silencio (sin error visible) | Documentar la variable, o eliminar el flag y activar Resend por defecto una vez probado | **CRÍTICO** 🚀 |
| Candidato accede a invitación por token | Completo | Buena UX (branding, examen legible, estados vista/completada/rechazada) | — | ✅ Completo (nuevo desde ciclo 1) |
| Notificación a la empresa cuando el candidato completa | Roto (sigue igual que ciclo 1) | No hay trigger/webhook que avise a la empresa | Supabase trigger → Resend al completar `assessment_attempts` | **A** 🚀 |
| Ruta legada `/employer/[code]` | Código muerto/duplicado | Usa una versión desactualizada del desglose de resultados (sin `section_scores`) | Eliminar o redirigir a `/empresa/procesos/[id]` | **M** |
| Desglose por sección (`section_scores`) | **Parcial — regresión de consistencia, no de funcionalidad** | Se corrigió en `candidatos/page.tsx` (join real a `assessment_scores`) el 27/6, pero `/empresa/procesos/[id]` nunca lo tuvo (query propia sin ese join) y la ruta legada tampoco | Unificar la lógica de fetch/normalización en un solo lugar | **A** |
| Descripciones de tipos de examen | Parcial | `EXAM_LABELS` da nombres legibles (ISTQB CTFL, Git, etc.) pero sin duración/nivel esperado | Agregar metadata (duración, nivel) junto al label | **M** |
| Timeout/vencimiento de proceso | Sin cambios desde ciclo 1 | `expires_at` existe, sin alerta visual de "vence pronto" | Badge en listado de procesos | **M** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Qué cambió desde el ciclo anterior
Los dos gaps marcados **Crítico** el 27/6 — page views del perfil y funnel de invitaciones — **ya están implementados** (`getEmpresaDashboardStatsAction` en `employer.ts`, widget `FunnelWidget` en `empresa/page.tsx:114-150`). Están bien construidos: 3 pasos (enviadas/vistas/completadas) con conteos reales.

**Verificado con datos reales:** hoy esos widgets mostrarían **0 en todo** para las 3 empresas reales de producción (`empresa_invitaciones`: 0 filas, `profile_views`: no confirmado pero `empresas` sin tráfico público significativo dado que el directorio recién existe). El dashboard está listo técnicamente, pero no hay actividad real todavía para validar que las cifras se calculen bien bajo carga — solo se probó la lógica con datos vacíos.

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Perfil visto por candidatos | **Sí** (nuevo desde ciclo 1) | Implementado vía RPC `increment_empresa_profile_views`; sin embargo esa RPC es `SECURITY DEFINER` ejecutable por `anon` — cualquiera puede inflar el contador sin autenticarse (ver nota de seguridad abajo) | Rate-limitear o mover a `SECURITY INVOKER` con política adecuada | Alto |
| Funnel invitación → vista → completada | **Sí** (nuevo desde ciclo 1) | Bien implementado, pero sin datos reales aún para validar en producción | Monitorear cuando el primer piloto empiece a invitar candidatos | Crítico 🚀 |
| Candidatos evaluados (aprobados vs reprobados) | Parcial | El número principal no distingue aprobados/reprobados | Split visual o semáforo de color | Alto |
| Comparación entre procesos | No | Sin tabla proceso-a-proceso | Agregar tabla resumen en `/empresa/procesos` | Alto |
| Top skills QA del mes | No | Oportunidad de market intelligence para Moonshot | Widget "Skills más evaluados este mes" | Medio |
| Gráficos 6 meses (Recharts) | Sí | Bien implementados, responsive | — | Bueno |
| Empty state sin actividad | Sí | Bien diseñado, 2 CTAs claros | — | Bueno |

### Nota de seguridad (hallazgo colateral, no es el foco del ciclo pero es relevante para el piloto B2B)
Ejecuté `get_advisors` (security) contra el proyecto de producción: **10 funciones `SECURITY DEFINER` del módulo de empresas son ejecutables por `anon` o `authenticated` sin revisión** (`get_empresa_candidate_sourcing`, `get_invitacion_by_token`, `increment_empresa_profile_views`, `mark_invitacion_vista`, `current_user_is_empresa`, `auth_user_empresa_role`, `find_user_for_invite`, `is_active_empresa_member`, `my_empresa_role`, `profile_visible_via_empresa_process`). La mayoría son intencionales (RPCs públicas de token/contador), pero vale una auditoría explícita antes de exponer el módulo a un cliente piloto que maneja datos de RRHH — especialmente `get_empresa_candidate_sourcing`, que devuelve datos de candidatos y depende 100% de lógica interna de filtrado en vez de RLS para restringir el acceso a la empresa correcta.

---

## ✅ Bloque 5 — Cierre & registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨 El pool de "Talento" está vacío en producción (0 candidatos opt-in)** — el feature está construido y probado en código, pero no tiene inventario real. Una demo en vivo a CLT o Banco Continental mostraría una tabla vacía. Tipo: **gap de adopción / producto**, no de código. 🚀
2. **🚨 Envío de email de invitación depende de una env var no documentada (`EMAIL_SENDING_ENABLED`)** — si no está seteada en el entorno de producción, el flujo de invitación falla en silencio (crea el registro, no manda el correo, sin error visible para la empresa). Tipo: **bug / gap de configuración**. 🚀
3. **⚠️ Desglose de resultados por sección inconsistente entre 3 vistas distintas** — se arregló en la lista principal de candidatos pero no en el detalle de proceso ni en la ruta legada, por tres implementaciones de fetch duplicadas y no compartidas. Tipo: **bug de consistencia / deuda técnica**.
4. **⚠️ El directorio público expone perfiles de empresa vacíos** — verificado con datos reales: 3/3 empresas en producción sin descripción, logo ni sitio web, listadas igual en `/empresas`. Tipo: **gap de funcionalidad + problema UX**.
5. **⚠️ La búsqueda de candidatos B2B estuvo rota en producción hasta ayer** (migración de RPC nunca aplicada) — ya resuelto, pero sin ningún chequeo automatizado que hubiera detectado el desfase antes. Tipo: **bug ya corregido, gap de proceso (falta smoke test post-deploy)**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Pool de talento vacío en prod | Gap de adopción | Sí 🚀 |
| 2 | Email de invitación depende de env var no documentada | Bug / config | Sí 🚀 |
| 3 | `section_scores` inconsistente entre 3 vistas | Bug / deuda técnica | Parcial |
| 4 | Directorio público con perfiles vacíos | Gap funcionalidad + UX | Sí 🚀 |
| 5 | RPC de búsqueda rota en prod hasta ayer (ya resuelto) | Bug (resuelto) / gap de proceso | No (ya resuelto) |
| 6 | Notificación a empresa al completar evaluación | Gap funcionalidad | Sí 🚀 |
| 7 | Ruta legada `/employer/[code]` duplicada | Deuda técnica | No |
| 8 | `country='PY'` por defecto infla completitud | Problema UX | Parcial |
| 9 | URL pública de empresa con UUID, no slug | Problema UX | Parcial |
| 10 | RPCs `SECURITY DEFINER` sin revisión explícita | Seguridad (colateral) | Sí (antes de manejar datos reales de RRHH) 🚀 |

### Tickets listos para Jira (no se pudieron crear directamente — no hay integración de Jira conectada a esta sesión; copiar/pegar en `aiquaa.atlassian.net`)

**[EMPRESAS-101] Documentar y validar `EMAIL_SENDING_ENABLED` en todos los entornos**
- Descripción: El envío de email de invitación (`empresa-invitaciones.ts:6`) depende de una env var ausente en `env.example`/`env.local.example`. Sin ella, el flujo falla en silencio.
- Pasos para reproducir: Clonar el repo, seguir `env.example`, invitar un candidato desde `/empresa/invitaciones` → el registro se crea pero no llega ningún email, sin error en la UI.
- Impacto: Alto — bloquea la demo B2B core con clientes piloto.
- Prioridad: Crítica.

**[EMPRESAS-102] Activar/incentivar el pool de talento opt-in**
- Descripción: 0 perfiles con `talent_visible_to_empresas=true` en producción. La función de búsqueda de talento no tiene inventario real para demostrar.
- Impacto: Alto — sin datos, la feature no se puede demostrar a CLT/Banco Continental.
- Prioridad: Alta.

**[EMPRESAS-103] Unificar el fetch de resultados de examen (3 implementaciones duplicadas)**
- Descripción: `candidatos/page.tsx`, `employer.ts::getProcessCandidatesAction` y `procesos/[id]/page.tsx` cada uno reimplementa su propia query de `exam_results`/`assessment_attempts`, con distinto nivel de detalle (`section_scores` solo en una).
- Impacto: Medio-alto — inconsistencia visible para el recruiter según por dónde navegue.
- Prioridad: Alta.

**[EMPRESAS-104] No exponer perfiles de empresa incompletos en el directorio público**
- Descripción: `/empresas` lista todas las filas de `empresas` sin filtrar por completitud. Verificado: 3/3 empresas reales sin descripción/logo/web.
- Impacto: Alto — daña la primera impresión ante candidatos QA.
- Prioridad: Alta.

**[EMPRESAS-105] Eliminar o redirigir la ruta legada `/employer/[code]`**
- Descripción: Duplica `/empresa/procesos/[id]` con una versión desactualizada (sin desglose de secciones).
- Impacto: Bajo — deuda técnica, riesgo de confusión de mantenimiento.
- Prioridad: Media.

**[EMPRESAS-106] Auditar RPCs `SECURITY DEFINER` del módulo de empresas expuestas a `anon`/`authenticated`**
- Descripción: 10 funciones detectadas por el advisor de seguridad de Supabase, incluyendo `get_empresa_candidate_sourcing` (devuelve datos de candidatos).
- Impacto: Alto — riesgo de exposición de datos antes de onboardear un cliente piloto real.
- Prioridad: Alta.

### Bloqueantes reales para cliente piloto (CLT / Banco Continental)
1. El pool de talento está vacío — no hay nada que buscar hoy.
2. El envío de invitaciones por email puede estar silenciosamente desactivado en producción si nadie seteó `EMAIL_SENDING_ENABLED`.
3. El directorio público de empresas, con perfiles vacíos, no genera la primera impresión que un pitch B2B necesita.
4. No hay auditoría de seguridad explícita sobre los RPCs que exponen datos de candidatos a nivel de empresa.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀
- El **funnel de invitaciones** y el **contador de vistas de perfil** ya están implementados y listos para generar el pitch "X candidatos vieron tu empresa, Y respondieron tu invitación" — solo falta que haya actividad real para poblarlos.
- El **directorio público de empresas** es un canal de discovery orgánico nuevo (no existía en el ciclo 1).
- Los **labels ISTQB y de país legibles** bajan la barrera de entrada para un recruiter no técnico — directamente aplicable al pitch de "cualquier RRHH puede usar esto sin saber de QA".

### Foco del próximo ciclo (1 hora)
**Prioridad:** Cerrar la brecha entre "el código funciona" y "hay algo real que mostrarle a un cliente piloto":
1. Confirmar/activar `EMAIL_SENDING_ENABLED` en el entorno de producción real (Railway/Vercel) y probar un envío end-to-end.
2. Diseñar un incentivo o flujo de onboarding que empuje a los usuarios QA existentes a activar `talent_visible_to_empresas`.
3. Unificar las tres implementaciones de fetch de resultados de examen en una sola función compartida (cierra EMPRESAS-103 y evita que el próximo fix se pierda otra vez en una sola vista).

---

*Revisión generada — 2026-07-03 · Rama: `claude/zen-noether-bj7rhq` · Ciclo 2, sobre `docs/reviews/2026-06-27-modulo-empresas-ux-review.md`*
