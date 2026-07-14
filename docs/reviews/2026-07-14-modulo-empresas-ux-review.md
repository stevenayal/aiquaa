# Revisión UX — Módulo de Empresas
**Fecha:** 14 de julio de 2026
**Ciclo:** Mejora continua · 60 min (revisión delta sobre el ciclo del 27 de junio de 2026)
**Reviewer:** QA Lead (revisión de código + datos reales de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** No se contó con credenciales de recruiter para clic-a-clic en `aiquaa.com`, así que esta revisión combina (1) lectura completa del código fuente (Next.js Server Actions, páginas, RLS), (2) consultas SQL de solo lectura contra la base de producción (`aiquaa`, proyecto Supabase `cbkctkpyxwbufvbwxogp`) para verificar datos reales — no simulados —, y (3) `get_advisors` de Supabase para hallazgos de seguridad. Todo hallazgo está anclado a código o datos verificados; no hay supuestos. Esta es una revisión **delta**: se re-verifican los 10 hallazgos del ciclo anterior (`docs/reviews/2026-06-27-modulo-empresas-ux-review.md`) y se audita `empresa_pruebas` (constructor de pruebas propias), que no existía en ese ciclo.

---

## ⚠️ Hallazgo transversal (antes de los bloques): el módulo está construido pero no se usa

Consulta directa a producción (2026-07-14):

| Métrica | Valor real |
|---|---|
| Total de empresas registradas | **3** |
| Empresas con logo / descripción / stack / modalidad / beneficios / LinkedIn | **0 de 3** en cada campo |
| Empresas con `profile_views > 0` | **0** |
| Invitaciones (`empresa_invitaciones`) creadas alguna vez | **0** |
| Favoritos/shortlist guardados | **0** |
| Candidatos QA con `talent_visible_to_empresas = true` (opt-in) | **1** en toda la plataforma |
| Pruebas propias (`empresa_pruebas`, feature nueva) creadas | **0** |
| Procesos de contratación (`hiring_processes`, flujo legacy por código) | 20 |

El único flujo con tracción real es el legacy "proceso por código" (20 registros). Todo lo demás —perfil enriquecido, invitaciones, favoritos, pruebas propias, sourcing de talento— está construido en código pero **nunca fue usado por una empresa real**. Esto cambia el diagnóstico del ciclo: ya no es solo "falta funcionalidad", es "la funcionalidad existe pero es indescubrible o no genera confianza suficiente para que una empresa la use". Con solo 1 candidato opt-in, el directorio de Talento (Bloque 2) le mostraría a CLT o Banco Continental **como máximo 1 resultado** hoy — un bloqueante de producto, no de UX.

---

## 🏢 Bloque 1 — Perfil de empresa

### Delta vs. ciclo anterior
✅ Corregido: directorio público `/empresas` ya existe. ✅ Corregido: campos de employer branding (`tech_stack`, `work_mode`, `benefits`, `linkedin_url`, `qa_team_size`) agregados a `empresas` y visibles en `/empresas/[id]`. ❌ Sin corregir: URL pública sigue siendo UUID. ❌ Sin corregir: `country` sigue precargado en `'PY'` en el formulario de perfil (`apps/frontend/src/app/empresa/perfil/page.tsx:124,145`), generando completitud falsa. 🆕 Nuevo hallazgo: con 0 de 3 empresas habiendo completado *ningún* campo de branding, el problema ya no es "faltan campos" sino "nadie completa los campos que existen".

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Adopción real de campos de branding | 0/3 empresas en producción completaron logo, descripción, stack, modalidad, beneficios o LinkedIn — pese a que el código ya los soporta | **A** 🚀 | Forzar estos campos (o un subconjunto) en el onboarding de `empresa/registro`, no dejarlos opcionales en un formulario que nadie visita después | Incompleto (adopción, no código) |
| Directorio público `/empresas` | Existe y funciona, pero sin buscador ni filtro por industria/país (`apps/frontend/src/app/empresas/page.tsx`) — solo lista completa | **M** | Agregar input de búsqueda + filtro por industria/país, ya viable con 3+ empresas | Parcial |
| URL pública del perfil | Sigue siendo UUID (`/empresas/{uuid}`), no memorable | **M** | Generar slug desde `nombre_comercial` | Incompleto (repetido) |
| Completitud por defecto | `country: 'PY'` sigue precargado en el estado inicial del formulario (líneas 124 y 145) | **M** | Calcular completitud solo tras guardado explícito del usuario | Incompleto (repetido) |
| Perfil recién registrado | Sin evidencia de que el registro (`empresa/registro`) impulse a completar el perfil inmediatamente — de las 3 empresas reales, ninguna avanzó | **A** | Agregar paso obligatorio o fuertemente sugerido de branding en el flujo de registro mismo | Roto en la práctica |
| Redes sociales / LinkedIn | Campo existe en schema y UI de `/empresas/[id]`, pero 0/3 empresas lo cargaron | **B** | Igual que arriba — es un problema de discoverability del formulario, no del campo | Incompleto (adopción) |

### Preguntas UX clave
**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?** No verificable en vivo, pero el dato de producción (0/3 empresas completaron un solo campo de branding) sugiere que no, o que no hay incentivo/momento en el flujo que lo empuje a hacerlo.
**¿El perfil público de la empresa inspira confianza a un candidato QA?** Con los campos vacíos en el 100% de los casos reales, hoy no — el directorio público mostraría 3 tarjetas con solo nombre y sin ningún dato adicional.

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Delta vs. ciclo anterior
✅ Corregido: filtro por país agregado en `buscar-candidatos/page.tsx`. ✅ Corregido: labels ISTQB ahora son texto completo (`ISTQB_LEVEL_LABELS`), no códigos crípticos. ✅ Corregido: botón "Invitar" ahora está inline en la fila del candidato, ya no hay que salir a otro módulo. ✅ Corregido: `section_scores` ya no se descarta — se mapea correctamente para `assessment_attempts` vía `sectionScoresByAttempt` con fallback a `learning_objectives` (`empresa/candidatos/page.tsx:588-605`). ✅ Corregido: comparación side-by-side (`toggleCompare`, widget "Comparación rápida") y exportación CSV (`exportCSV`) ya existen — pero **solo en la pestaña "Evaluados" (`/empresa/candidatos`), no en "Talento" (`/empresa/buscar-candidatos`)**, una inconsistencia nueva.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Pool real de candidatos opt-in | Solo **1 candidato** en toda la plataforma tiene `talent_visible_to_empresas = true` | El directorio de Talento es, en la práctica, casi vacío para cualquier recruiter que lo pruebe hoy | Campaña de opt-in a candidatos existentes + hacerlo prominente en el perfil del candidato (no solo un toggle escondido) | **CRÍTICO** 🚀 |
| Comparación y CSV solo en "Evaluados" | `toggleCompare`/`exportCSV` implementados en `candidatos/page.tsx` pero ausentes en `buscar-candidatos/page.tsx` (Talento) | Un recruiter que arma su shortlist en Talento no puede comparar ni exportar sin cambiar de pestaña y perder el filtro aplicado | Reutilizar los mismos componentes de comparación/export en la pestaña Talento | **A** |
| Filtro país | Ahora presente (`filterCountry`, opciones dinámicas desde `availableCountries`) | Ninguno — funciona | — | Resuelto |
| Labels ISTQB | Texto completo, sin jerga de código | Sigue sin tooltip explicando qué certifica cada nivel (ej. qué significa "Advanced Level - Test Manager" para un recruiter no técnico) | Agregar ícono de info con descripción de una línea por nivel | **B** |
| Toggle "solo disponibles" | El filtro de disponibilidad (`activo/pasivo/no_disponible`) cubre el caso, aunque como dropdown en vez de un toggle rápido | Un clic extra vs. lo ideal | Agregar chip rápido "Solo disponibles" además del dropdown | **B** |
| Favoritos (shortlist) | Funciona (`empresa_favoritos`, insert/delete inline) | 0 registros en producción — nunca usado | Igual que el pool opt-in: sin candidatos visibles, no hay nada que guardar | Bloqueado por el hallazgo de arriba |
| Empty state sin candidatos | Implementado ("Sin candidatos para estos filtros" con CTA de limpiar filtros) | Bien resuelto, pero no distingue "no hay candidatos que matcheen tus filtros" de "casi no hay candidatos en la plataforma" (el caso real hoy) | Mensaje distinto cuando el pool total es muy chico (< 5) explicando que la base de candidatos QA está creciendo | **M** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Delta vs. ciclo anterior
✅ Corregido (en código): `createInvitacionAction` ahora sí compone y envía email vía Resend, con link a `/invitaciones/{token}` — ruta pública ya existe y renderiza la invitación. ✅ Corregido: notificación a la empresa al completar evaluación (`empresa-result-notifications.ts` + migración de webhook). ⚠️ Envío de email condicionado a `EMAIL_SENDING_ENABLED === 'true'` (`empresa-invitaciones.ts:6`) — **no se encontró esta variable configurada en ningún `.env.example`, `railway.toml` ni config del repo**; no se pudo confirmar su valor en Vercel producción desde esta sesión. Dato duro: **0 invitaciones existen en la base de producción**, consistente con que el flujo nunca fue probado por una empresa real, ya sea por falta de descubrimiento o por el flag apagado. ❌ Sin corregir: sigue existiendo `/invitacion/[token]` (singular) como ruta huérfana junto a `/invitaciones/[token]` (plural, la que realmente usa el email) — confusión de rutas duplicadas del ciclo anterior, no limpiada. 🆕 Nuevo: `empresa_pruebas` (constructor de pruebas propias, con preguntas, invitaciones por token vía `/prueba/[token]`) está completamente implementado pero **sin ningún envío de email** — el recruiter debe copiar y compartir el link a mano, un regresión de UX respecto al flujo de invitaciones que sí tiene email.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Envío de email al invitar candidato | Completo en código | Depende de `EMAIL_SENDING_ENABLED`, variable no encontrada en configs del repo; 0 invitaciones reales existen para confirmar que funciona end-to-end en prod | Verificar el flag en Vercel; hacer una prueba real de invitación y confirmar que el email llega | **CRÍTICO** 🚀 |
| Ruta pública por token | Completo (`/invitaciones/[token]`) | Ruta duplicada `/invitacion/[token]` (singular) sigue en el código, sin uso — riesgo de confusión para quien mantenga el código o de un usuario que llegue por URL vieja | Eliminar la ruta singular huérfana | **M** |
| Desglose por sección (`section_scores`) | Completo | Ya se muestra correctamente para ambos sistemas de examen | — | Resuelto |
| Notificación a empresa al completar evaluación | Completo | — | — | Resuelto |
| Constructor de pruebas propias (`empresa_pruebas`) — invitación al candidato | Incompleto | Sin integración de email; el recruiter comparte el link del token manualmente, inconsistente con el flujo de invitaciones que sí envía email | Reusar `sendEmail`/Resend en `empresa-pruebas-candidato.ts` | **A** 🚀 |
| Constructor de pruebas propias — adopción | Construido, 0 uso en producción | Feature marcada "Beta" en la UI (`pruebas/page.tsx:75`) sin pruebas creadas por ninguna empresa real | Validar con un piloto guiado antes de invertir más en esta superficie | **M** |
| Política de reintentos / `max_attempts` | Parcial | Existe como columna en `empresa_prueba_invitaciones` pero no en `hiring_processes` (el flujo legacy, que es el único con uso real) | Agregar `max_attempts` a `hiring_processes` primero, ya que es el flujo realmente usado | **B** |
| Fecha límite / timeout | Parcial | `expires_at` existe pero sin alerta visual de "vence pronto" | Badge en listados | **B** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Delta vs. ciclo anterior
✅ Corregido: widget de funnel de invitaciones (`FunnelWidget`, enviadas → vistas → completadas, con tasa de respuesta) está implementado en `apps/frontend/src/app/empresa/page.tsx:114-166`. ⚠️ Pero se renderiza solo `if (stats.invitacionesFunnel.total > 0)` (línea 444) — con 0 invitaciones reales en producción, **ninguna empresa ha visto nunca este widget**, aunque el código esté listo. Page views (`profile_views`) están en el schema pero no se confirmó un widget dedicado mostrándolos en el dashboard (se ven en el perfil público, no en el dashboard).

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Funnel de invitaciones | Sí (código) | Nunca visible en producción porque nunca hubo una invitación enviada — el widget está condicionado a `total > 0` | Mantener la condición, pero priorizar que el flujo de invitaciones se use (Bloque 3, hallazgo CRÍTICO) para que este widget cumpla su propósito | Crítico, pero hoy invisible |
| Vistas de perfil (`profile_views`) | Columna existe, se incrementa vía RPC `increment_empresa_profile_views` en `/empresas/[id]` | No se confirmó widget en el dashboard (`empresa/page.tsx`) que muestre este número — solo se acumula en la tabla `empresas` | Agregar tarjeta "Tu perfil fue visto X veces este mes" en el dashboard | Alto 🚀 |
| Top skills QA de la plataforma | No existe | Sigue sin implementarse | Widget de market intelligence usando `qa_skills` agregados de `profiles` | Medio |
| Gráficos 6 meses (Recharts) | Sí | Bien implementado | — | Bueno |
| Empty state sin actividad | Sí, con 2 CTAs | Dado que 2 de 3 empresas reales no tienen ni miembros activos ni actividad, este empty state es lo que la mayoría de usuarios reales ve hoy — es la primera impresión real del producto | Asegurar que sus CTAs lleven directo a completar perfil e invitar candidatos (los dos huecos de adopción de este ciclo) | Alto |
| Comparación entre procesos (pass rate, avg score) | No existe | Sigue sin tabla comparativa proceso-a-proceso | Agregar en `/empresa/procesos` dado que es el único flujo con uso real (20 procesos) | Alto |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 El módulo está construido pero prácticamente sin uso real** — 3 empresas, 0 perfiles completos, 0 invitaciones enviadas jamás, 1 solo candidato opt-in en toda la plataforma. El riesgo ya no es "falta código", es que ninguna empresa piloto podría usar el módulo hoy sin encontrarse un directorio de talento casi vacío. Tipo: **gap de producto / adopción**. 🚀

2. **🚨 Flujo de invitación con email depende de una env var no verificable (`EMAIL_SENDING_ENABLED`)** — el código está completo (compone HTML, usa Resend, ruta pública `/invitaciones/[token]` funciona), pero no hay rastro de la variable en `.env.example`, `railway.toml` ni configs del repo, y 0 invitaciones existen en producción para confirmarlo end-to-end. Tipo: **bug potencial / gap de configuración**. 🚀

3. **⚠️ Pool de candidatos opt-in casi inexistente (1 de N)** — el directorio de Talento, con todos sus filtros bien construidos, es hoy funcionalmente inútil para un recruiter porque casi nadie optó a ser visible. Tipo: **gap de producto**, bloqueante directo para demostrar valor a CLT/Banco Continental. 🚀

4. **⚠️ Inconsistencia entre pestañas "Evaluados" y "Talento"** — comparación side-by-side y exportación CSV, ambas ya resueltas del ciclo anterior, solo viven en la pestaña de candidatos evaluados, no en la de sourcing de talento. Tipo: **bug de implementación / gap UX**.

5. **⚠️ El constructor de pruebas propias (`empresa_pruebas`) repite el error ya corregido en el flujo de invitaciones** — no envía email al candidato, obligando a compartir el link a mano. Es una feature nueva, marcada "Beta", con 0 uso real. Tipo: **gap de funcionalidad**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Adopción real ≈ 0 (perfiles, invitaciones, opt-in) | Gap de producto | Sí 🚀 |
| 2 | `EMAIL_SENDING_ENABLED` no confirmable, 0 invitaciones reales | Bug potencial / config | Sí 🚀 |
| 3 | Solo 1 candidato opt-in a búsqueda de talento | Gap de producto | Sí 🚀 |
| 4 | Comparación/CSV ausentes en pestaña Talento | Bug de implementación | Parcial |
| 5 | `empresa_pruebas` sin email de invitación | Gap de funcionalidad | No (feature Beta, sin uso) |
| 6 | Ruta duplicada `/invitacion` vs `/invitaciones` | Deuda técnica | No |
| 7 | URL pública de empresa con UUID, no slug | UX problem | Parcial |
| 8 | `country='PY'` precargado, completitud engañosa | UX problem | No |
| 9 | Sin buscador/filtro en directorio público `/empresas` | Gap de funcionalidad | No (solo 3 empresas hoy) |
| 10 | Sin widget de "Top skills QA" ni comparación entre procesos | Gap de funcionalidad | No |

### Bloqueantes reales para cliente piloto (CLT / Banco Continental)

A diferencia del ciclo anterior —donde los bloqueantes eran de código—, hoy el código de los flujos core ya existe. Los bloqueantes reales para un piloto son de **puesta en marcha**:
1. Confirmar y activar el envío de email de invitaciones en producción (verificar `EMAIL_SENDING_ENABLED` en Vercel) y probarlo end-to-end con un caso real.
2. Conseguir una masa crítica de candidatos opt-in antes de ofrecer el buscador de Talento como diferenciador — hoy mostraría 1 resultado.
3. Acompañar a la empresa piloto a completar su perfil en el registro mismo, no dejarlo como paso opcional post-registro que, según los datos, nadie completa espontáneamente.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El **funnel de invitaciones** y el **conteo de vistas de perfil** ya están construidos en base de datos y en gran parte en UI — solo falta que haya actividad real para demostrarlos. Es una historia de "ya está, hay que encenderlo", no de "hay que construirlo".
- El **desglose por sección de examen** (`section_scores`) y la **comparación side-by-side de candidatos evaluados** ya funcionan — son diferenciadores fuertes para el pitch de decisión de contratación basada en datos.
- La **exportación CSV** para reportar a RRHH ya existe (aunque incompleta entre pestañas) — clave para Banco Continental.
- El hallazgo de adopción ≈ 0 es en sí mismo un argumento para Moonshot: **el producto tiene la funcionalidad B2B lista antes que la demanda** — la oportunidad es de go-to-market/onboarding guiado con el primer piloto, no de ingeniería adicional mayor.

### Tickets listos para crear en Jira (aiquaa.atlassian.net)

> No se contó con acceso al conector de Jira en esta sesión automatizada, por lo que no se crearon los tickets directamente. Se listan abajo, listos para copiar y pegar.

**[EMPRESA-1] Confirmar y activar envío de email de invitaciones en producción**
- Descripción: `createInvitacionAction` en `apps/frontend/src/actions/empresa-invitaciones.ts` solo envía email si `process.env.EMAIL_SENDING_ENABLED === 'true'`. No se encontró esta variable en `.env.example` ni en configs del repo, y hay 0 filas en `empresa_invitaciones` en producción — el flujo nunca se probó de punta a punta.
- Pasos para reproducir: Revisar variables de entorno del proyecto Vercel de `apps/frontend`; si falta o está en `false`, ninguna invitación real enviará email pese a que el resto del flujo (ruta pública `/invitaciones/[token]`, plantilla HTML, Resend) está listo.
- Impacto: Alto — bloquea el caso de uso B2B core (invitar candidato externo).
- Prioridad: Crítica 🚀

**[EMPRESA-2] Impulsar adopción real: 0 perfiles de empresa completos, 1 solo candidato opt-in**
- Descripción: De 3 empresas en producción, ninguna completó logo/descripción/stack/modalidad/beneficios/LinkedIn, y solo 1 candidato en toda la plataforma tiene `talent_visible_to_empresas = true`. El directorio de Talento y el directorio público `/empresas` no pueden demostrar valor con estos números.
- Pasos para reproducir: `select count(*) from empresas where description is not null` → 0; `select count(*) from profiles where talent_visible_to_empresas = true` → 1.
- Impacto: Crítico para cualquier demo o piloto con CLT/Banco Continental.
- Prioridad: Crítica 🚀

**[EMPRESA-3] Unificar comparación y exportación CSV entre pestañas Evaluados y Talento**
- Descripción: `toggleCompare` y `exportCSV` existen en `apps/frontend/src/app/empresa/candidatos/page.tsx` pero no en `apps/frontend/src/app/empresa/buscar-candidatos/page.tsx`.
- Impacto: Medio — inconsistencia de UX entre dos vistas del mismo objetivo (evaluar candidatos).
- Prioridad: Alta

**[EMPRESA-4] Agregar envío de email a invitaciones de pruebas propias (`empresa_pruebas`)**
- Descripción: A diferencia de `empresa-invitaciones.ts`, las acciones en `empresa-pruebas-candidato.ts` no integran Resend/`sendEmail`; el recruiter debe compartir el link del token manualmente.
- Impacto: Medio — feature en Beta, sin uso real aún, pero repite un error ya corregido en el flujo hermano.
- Prioridad: Media

**[EMPRESA-5] Limpiar ruta huérfana `/invitacion/[token]` (singular)**
- Descripción: Coexiste con `/invitaciones/[token]` (plural), que es la única enlazada desde el email real. La ruta singular es código muerto o una fuente de confusión.
- Impacto: Bajo — deuda técnica.
- Prioridad: Baja

**[EMPRESA-6] Corregir completitud de perfil falseada por `country='PY'` precargado**
- Descripción: `apps/frontend/src/app/empresa/perfil/page.tsx` inicializa `country: 'PY'` en el estado del formulario, generando un % de completitud sin acción del usuario. Hallazgo repetido del ciclo del 27/06, no corregido.
- Impacto: Bajo-medio — UX engañosa.
- Prioridad: Media

### Foco del próximo ciclo (1 hora)

**Prioridad:** Activación, no construcción.

1. Verificar en Vercel si `EMAIL_SENDING_ENABLED` está seteado en producción; si no, activarlo y enviar una invitación de prueba real de punta a punta.
2. Diseñar un mini-flujo de opt-in para candidatos existentes (banner en su dashboard) — sin esto, el buscador de Talento no tiene nada que mostrar a un piloto.
3. Unificar comparación/CSV entre las pestañas Evaluados y Talento (EMPRESA-3), ya que es la corrección más barata con mayor impacto de consistencia.

Este ciclo pasa el testigo de "¿está construido?" (sí, en su mayoría) a "¿alguien lo está usando?" (no todavía) — el próximo ciclo debería medirse en adopción real, no en código nuevo.

---

*Revisión generada automáticamente — 2026-07-14 · Rama: `claude/zen-noether-86rri0` · Datos verificados contra producción (Supabase `cbkctkpyxwbufvbwxogp`)*
