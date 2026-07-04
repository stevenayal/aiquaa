# Revisión UX — Módulo de Empresas
**Fecha:** 4 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión de código + verificación de producción en Vercel)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)
**Ciclo anterior:** [`docs/reviews/2026-06-27-modulo-empresas-ux-review.md`](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología:** Revisión estática de código (Server Actions, páginas, migraciones SQL de Supabase) + verificación de errores de runtime en producción (Vercel, últimos 7 días) para las rutas `/empresa/*`, `/empresas/*`, `/invitaciones/*`. **No se pudo navegar la app en vivo como usuario en este ciclo**: `aiquaa.com` devolvió 403 (WAF/bot-protection) desde este entorno, y no hay credenciales de Supabase disponibles para levantar un entorno local con datos reales. Todo hallazgo está anclado a archivo:línea o a datos de producción verificados vía Vercel MCP — no se reportan supuestos. Los puntos que requieren navegación real quedan marcados como "a verificar" en el próximo ciclo.

## ⚠️ Nota de arquitectura (fuera de alcance del módulo, pero relevante)
El backend NestJS + Prisma descrito en `CLAUDE.md` **ya no existe**: fue eliminado en el commit `a67bc38` ("chore: remove NestJS backend and dead code, migrated to Supabase", 24 de junio de 2026). Todo el módulo de Empresas corre hoy como **Next.js Server Actions hablando directo con Supabase** (autorización via RLS + `is_active_empresa_member()`). `CLAUDE.md` sigue documentando `apps/backend/src/auth/`, `pnpm prisma:migrate`, etc. — está desactualizado. Recomendación: actualizarlo en un ciclo aparte para no confundir a quien lo use como referencia.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave
**¿Un recruiter entiende en <30s cómo completar su perfil?** Sí, mejor que en el ciclo anterior: la barra de completitud con anchors a campos faltantes sigue ahí y ahora hay una sección completa de "Employer branding QA" (stack, modalidad, beneficios, LinkedIn) que antes no existía.

**¿El perfil inspira confianza a un candidato QA?** Bastante más que antes — los campos que un QA evalúa antes de postularse (stack, modalidad de trabajo, beneficios) ya están en el formulario.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Stack tecnológico, modalidad, beneficios, LinkedIn | ✅ **Resuelto desde el ciclo anterior** — sección "Employer branding QA" (`empresa/perfil/page.tsx:568-736`) | — | — | Completo |
| Validaciones de URL y RUC | ✅ **Nuevo** — valida `website_url` (regex http/https) y RUC formato PY `80012345-6` antes de guardar (líneas 199-220) | — | — | Completo |
| Cálculo de completitud (`completionScore`) | `PROFILE_FIELDS` (líneas 81-90) solo cuenta 8 campos originales — **no incluye** stack, beneficios, LinkedIn ni tamaño de equipo QA pese a que ya son parte del form | **M** | Agregar los campos nuevos a `PROFILE_FIELDS` para que el % refleje el perfil real | Desactualizado/engañoso |
| País por defecto `'PY'` | Sigue precargado (línea 124/145), sigue sumando al score sin acción del usuario | **M** | Iniciar vacío y forzar selección explícita | Sin resolver (repetido) |
| URL pública del perfil | Sigue siendo el UUID (`/empresas/[id]`), sin slug memorable | **A** | Generar slug desde `nombre_comercial` | Sin resolver (repetido) |
| Botón "Eliminar logo" | Solo existe "Cambiar logo" (líneas 384-389) | **B** | Agregar opción de eliminar con confirmación | Sin resolver (repetido) |
| Contador de caracteres | `description` (800) y `benefits` (500) sí tienen contador visual; `razon_social` (120) y `nombre_comercial` (80) no | **B** | Agregar contador también a esos 2 campos | Parcial |
| Label "RUC" fijo | El hint de formato PY se muestra aunque el país no sea Paraguay | **B** | Renombrar dinámicamente (RUC/NIT/CUIT/RFC) según país | Sin resolver (repetido) |
| Preview del perfil público | Solo link "Ver perfil →" en pestaña nueva, sin preview inline | **B** | Agregar preview embebido | Sin resolver (repetido) |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave
**¿Un recruiter sin contexto QA entiende los filtros?** Mejor de lo reportado el ciclo anterior: el filtro ISTQB **sí** muestra etiquetas legibles ("Foundation Level (CTFL)", "Advanced Level — Test Manager"), no códigos crudos — esto corrige una lectura errónea del ciclo pasado.

**¿El flujo de contactar/guardar candidatos es claro?** Existe shortlist (`empresa_favoritos`) y ahora también comparación rápida entre candidatos — no verificado en este ciclo si el botón de invitar está disponible inline desde la ficha del directorio (requiere navegación real).

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país | ✅ **Resuelto** — `filterCountry` + `COUNTRY_LABELS` en `candidatos`/`buscar-candidatos` | — | — | Resuelto 🚀 |
| Filtro ISTQB | ✅ Ya usa etiquetas legibles (`ISTQB_LEVEL_LABELS`, líneas 81-85) | Falta tooltip explicando qué certifica cada nivel para un recruiter no-QA | Agregar tooltip descriptivo | **B** |
| Exportar CSV | ✅ **Resuelto** — `exportCSV()`, botón "📥 Exportar CSV" (línea 1215) | — | — | Resuelto 🚀 |
| Comparación de candidatos | ✅ **Resuelto** — sección "Comparación rápida" con botones "Comparar" (líneas 868, 1058, 1460) | No se verificó el límite de candidatos ni el detalle mostrado (sin navegación real este ciclo) | Confirmar en el próximo ciclo con navegación | A verificar |
| Desglose `section_scores` | Se muestra en la vista principal de "Evaluados" (líneas 230, 313, 586-587) | **Persiste sin resolver**: sigue en `null` para exámenes vía `assessment_attempts` (`database-fundamentals`, `database-practice`, `infrastructure-fundamentals`) al normalizarse en `actions/employer.ts:418-419` — afecta specialmente al dashboard y a `/empresa/eventos` | Quitar el hardcode `section_scores: null` y traer el desglose real desde `assessment_attempts.metadata` | **A** (parcialmente resuelto, no cerrado) |
| Invitar candidato desde la ficha | No verificado en este ciclo | — | Verificar navegando el flujo real en el próximo ciclo | A verificar |
| Empty state sin resultados | Confirmado en código: "Sin resultados todavía" / "Sin resultados para los filtros aplicados" (líneas 1269, 1285) | Sin CTA visible hacia invitación o ajuste de filtros en el texto revisado | Agregar CTA "Invitar candidato externo" | **B** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave
**¿Un líder técnico entiende qué evalúa cada prueba?** Sin cambios respecto al ciclo anterior — los `exam_types` siguen siendo strings sin descripción de duración/nivel.

**¿El resultado alcanza para decidir una contratación?** Mejoró: ahora sí llega el email de invitación y hay una ruta pública para aceptarla — el flujo end-to-end ya no está roto. El desglose por sección sigue incompleto para ciertos tipos de examen.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Envío de email de invitación (Resend) | ✅ **Resuelto en código** — `createInvitacionAction` llama `sendInvitacionEmailIfEnabled` (`empresa-invitaciones.ts`) | Gateado por `EMAIL_SENDING_ENABLED === 'true'`, que **no está definido en ningún `.env.example` versionado**; no se pudo confirmar su valor real en Vercel producción con las herramientas disponibles en este ciclo | **Confirmar manualmente en el dashboard de Vercel** que `EMAIL_SENDING_ENABLED=true` en el entorno de producción — si está en `false` o ausente, el flujo vuelve a estar roto en silencio pese a que el código ya está listo | **CRÍTICO — verificar** 🚀 |
| Candidato accede a su invitación (ruta por token) | ✅ **Resuelto** — `/invitaciones/[token]/page.tsx` existe, usa `get_invitacion_by_token` + `mark_invitacion_vista` | Existe una **segunda ruta paralela** `/invitacion/[token]` (singular) que parece legado | Reconciliar: eliminar la duplicada o redirigir una a la otra | **A** (nuevo hallazgo) |
| Empresa ve resultados con desglose por sección | Parcial | Igual que Bloque 2: `section_scores` sigue nulo para exámenes vía `assessment_attempts` en el path usado por dashboard/eventos | Igual que Bloque 2 | **A** |
| Notificación a la empresa al completar evaluación | Sin resolver | No se encontró código de notificación (email/push) a la empresa al completarse un intento — búsqueda dirigida en `actions/*.ts` sin resultados | Agregar trigger Supabase → Resend al completarse `assessment_attempts`/`exam_results` | **A** 🚀 (repetido, sin cambios) |
| Fecha límite / expiración de proceso | Sin resolver | `expires_at` existe pero no se confirmó badge de "vence pronto" | Igual que ciclo anterior | **M** (repetido) |
| Límite de intentos configurable | Sin resolver | No se encontró `max_attempts` en `hiring_processes` | Igual que ciclo anterior | **B** (repetido) |
| Comparar candidatos entre sí | ✅ **Resuelto** (ver Bloque 2) | — | — | Resuelto 🚀 |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Perfil visto por candidatos (`profile_views`) | ✅ **Sí (nuevo)** | Incrementado vía RPC en cada vista de `/empresas/[id]`, mostrado en el dashboard (`empresa/page.tsx:336-338`) | — | **Crítico — resuelto** 🚀 |
| Funnel invitación → vista → completada | ✅ **Sí (nuevo)** | Se renderiza solo si `invitacionesFunnel.total > 0` (línea 444) — buen empty-state condicional | Confirmar visualmente con datos reales en el próximo ciclo (sin navegación esta vez) | **Crítico — resuelto** 🚀 |
| Tasa de respuesta a invitaciones | ✅ **Sí (nuevo)** | `tasaRespuesta` calculado y mostrado (línea 166) | — | **Alto — resuelto** 🚀 |
| Comparación entre procesos | ✅ Sí, pero en `/empresa/eventos/[id]`, no en el dashboard principal | No hay acceso directo desde el dashboard | Agregar acceso rápido "Ver comparación" desde el dashboard | Alto |
| Top skills QA disponibles en la plataforma | ❌ No | Sigue sin existir — oportunidad de market intelligence | Widget "Skills más evaluados este mes" | Medio (repetido) |
| Errores de runtime en producción (Vercel, últimos 7 días) | ✅ Verificado: **ninguno de los 7 grupos de errores** de la última semana corresponde a `/empresa/*`, `/empresas/*` o `/invitaciones/*` (los errores existentes son de `assessments`, auth PKCE, refresh-token, y `/labs/test-app/report`) | — | — | Señal positiva: el módulo está estable en producción esta semana |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚀 Progreso mayor desde el ciclo anterior**: de los 5 hallazgos críticos del 27/06 (email de invitación, ruta pública por token, profile views, funnel de invitaciones, tasa de respuesta) — **los 5 están resueltos en código**, además de CSV, filtro por país, campos de perfil (stack/modalidad/beneficios) y comparación de candidatos. Es el resultado más importante de este ciclo.
2. **🚨 A verificar manualmente**: el envío de email de invitación depende de `EMAIL_SENDING_ENABLED`, que no está en ningún archivo de entorno versionado — no se pudo confirmar su valor en producción desde este ciclo (sin acceso a variables de entorno de Vercel). Si está en `false`, el flujo crítico de invitación vuelve a estar roto en silencio. Tipo: **riesgo operativo/config**.
3. **⚠️ Persistente**: `section_scores` sigue descartándose (`null`) para exámenes vía `assessment_attempts` al normalizarse para dashboard/eventos (`actions/employer.ts:418-419`) — el recruiter no ve el desglose por área en esas vistas específicas. Tipo: **bug de implementación** (parcial, no bloqueante — sí se ve en la vista principal de Evaluados).
4. **⚠️ Nuevo**: coexisten dos rutas para aceptar invitaciones por token (`/invitacion/[token]` y `/invitaciones/[token]`) — riesgo de confusión y mantenimiento duplicado. Tipo: **deuda técnica**.
5. **⚠️ Nuevo**: la barra de completitud del perfil (`completionScore`) no se actualizó para contar los campos agregados este ciclo (stack, beneficios, LinkedIn, tamaño de equipo QA) — el % que ve el recruiter ya no refleja fielmente cuánto le falta completar. Tipo: **bug de UX (métrica desactualizada)**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | `EMAIL_SENDING_ENABLED` sin confirmar en producción | Riesgo operativo/config | Sí, **si** está en `false` 🚀 |
| 2 | `section_scores` nulo en `assessment_attempts` (dashboard/eventos) | Bug | Parcial |
| 3 | Rutas de invitación duplicadas (`/invitacion` vs `/invitaciones`) | Deuda técnica | No |
| 4 | Completitud de perfil no cuenta campos nuevos | Bug de UX (métrica engañosa) | No |
| 5 | País por defecto `'PY'` sigue sumando al score | UX problem | No (repetido) |
| 6 | URL pública con UUID, no slug | UX problem | Parcial (repetido) |
| 7 | Sin botón "Eliminar logo" | UX problem menor | No |
| 8 | Sin notificación a empresa al completar evaluación | Gap de funcionalidad | Sí 🚀 (repetido, sin cambios) |
| 9 | Sin widget "top skills" | Gap de funcionalidad | No (repetido) |
| 10 | Tooltip ISTQB para recruiters no-QA | UX problem menor | No |

### Bloqueantes reales para cliente piloto (CLT / Banco Continental) hoy

Con los arreglos de este ciclo, **el único bloqueante potencial remanente del flujo core es el ítem #1** (confirmar `EMAIL_SENDING_ENABLED=true` en producción). Si esa variable está bien configurada, el módulo ya no tiene bloqueantes duros conocidos para un piloto — solo gaps de pulido (branding del perfil, desglose de secciones en ciertos exámenes, notificación de finalización).

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- **Profile views + funnel de invitaciones + tasa de respuesta** ya están construidos y listos para demo — el mayor avance de este ciclo para el pitch B2B ("X candidatos vieron tu empresa", "Y% de tasa de respuesta a tus invitaciones").
- **Employer branding completo** (stack, modalidad, beneficios) permite a CLT/Banco Continental mostrar una propuesta de valor real a candidatos QA.
- **CSV export + comparación de candidatos** ya cubren las necesidades operativas de RRHH formal.

### Foco del próximo ciclo (1 hora)

**Prioridad:** Cerrar la brecha entre "resuelto en código" y "confirmado funcionando en producción"

1. Confirmar en el dashboard de Vercel que `EMAIL_SENDING_ENABLED=true` en producción (fuera de código, 5 min).
2. Navegar en vivo el flujo de invitación end-to-end (crear proceso → invitar → recibir email → completar por token) una vez se resuelva el acceso a `aiquaa.com` desde este entorno o con credenciales de prueba.
3. Cerrar el hardcode `section_scores: null` en `actions/employer.ts` para los tipos de examen vía `assessment_attempts`.
4. Reconciliar `/invitacion/[token]` vs `/invitaciones/[token]`.
5. Actualizar `PROFILE_FIELDS` en `empresa/perfil/page.tsx` para incluir los campos de employer branding en el cálculo de completitud.

---

### 🎫 Tickets (no se pudieron crear en Jira — ver nota)

> Este ciclo no tuvo un conector MCP de Jira disponible en la sesión, por lo que **no se crearon los tickets en `aiquaa.atlassian.net`**. Se dejan listos para pegar manualmente:

**[BUG-CRÍTICO] Confirmar EMAIL_SENDING_ENABLED en producción**
- Descripción: El envío de email de invitación (Resend) está gateado por la env var `EMAIL_SENDING_ENABLED`, ausente de todos los `.env.example` versionados. No se pudo verificar su valor en Vercel producción desde este ciclo.
- Pasos: Revisar Vercel → Project `aiquaa` → Settings → Environment Variables → Production.
- Impacto: Si está en `false`/ausente, el flujo de invitación a candidatos externos está roto en silencio.
- Prioridad: Crítica.

**[BUG] `section_scores` nulo para exámenes vía `assessment_attempts`**
- Descripción: `fetchAssessmentAttemptsForProcessCodes` en `apps/frontend/src/actions/employer.ts:418-419` fuerza `section_scores: null` y `learning_objectives: null`, mientras que la consulta equivalente sobre `exam_results` sí trae los valores reales.
- Pasos para reproducir: Ver dashboard/evento de un proceso con exámenes tipo `database-fundamentals`, `database-practice` o `infrastructure-fundamentals` — el desglose por sección no aparece ahí (sí aparece en `/empresa/candidatos`).
- Impacto: El recruiter no puede ver en qué área falló/aprobó el candidato desde el dashboard o eventos para esos tipos de examen.
- Prioridad: Alta.

**[DEUDA TÉCNICA] Rutas de invitación duplicadas**
- Descripción: Coexisten `/invitacion/[token]/page.tsx` y `/invitaciones/[token]/page.tsx`.
- Impacto: Riesgo de mantenimiento doble y confusión sobre cuál es la ruta "oficial" enviada por email.
- Prioridad: Media.

**[MEJORA] Completitud de perfil no cuenta campos nuevos**
- Descripción: `PROFILE_FIELDS` en `apps/frontend/src/app/empresa/perfil/page.tsx:81-90` no incluye `tech_stack`, `benefits`, `linkedin_url` ni `qa_team_size`.
- Impacto: El % de completitud subestima el esfuerzo real del recruiter y no refleja el perfil real.
- Prioridad: Media.

---

*Revisión generada automáticamente — 2026-07-04 · Rama: `claude/zen-noether-g2i8ki` · Ciclo previo: 2026-06-27*
