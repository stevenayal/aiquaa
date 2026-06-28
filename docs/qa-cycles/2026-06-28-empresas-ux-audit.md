# Ciclo QA — Módulo Empresas
**Fecha:** 28 de junio de 2026  
**Reviewer:** QA Lead (ciclo automatizado con revisión de código fuente)  
**Persona objetivo:** Recruiter / Responsable RRHH  
**Rama auditada:** `claude/zen-noether-o3fain`  
**Stack revisado:** Next.js App Router + Supabase (sin backend NestJS en este módulo)

> **Metodología:** Auditoría basada en revisión exhaustiva de código fuente. Archivos revisados:
> `apps/frontend/src/app/empresa/perfil/page.tsx`, `/candidatos/page.tsx`, `/page.tsx` (dashboard),
> `/invitaciones/page.tsx`, `apps/frontend/src/app/empresas/[id]/page.tsx`,
> `apps/frontend/src/actions/empresa-invitaciones.ts`, `apps/frontend/src/actions/employer.ts`,
> `apps/frontend/src/actions/empresa-admin.ts`, y migraciones Supabase.

---

## 🏢 Bloque 1 — Perfil de empresa

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado |
|---|---|---|---|---|
| **Progress bar de completitud** | Funcional y útil; lista campos faltantes con links-ancla. Sin embargo no explica *por qué* completar el perfil beneficia a la empresa. | M | Agregar microcopy: "Un perfil completo recibe 3× más visitas de candidatos QA" | Completo |
| **Campo Razón social vs. Nombre comercial** | Sin tooltip explicativo. Recruiter de AR o BR no entiende la distinción PY; el campo RUC aparece para todos los países aunque solo aplica a PY (con regex `^\d{6,8}-\d$`). | M | Mostrar tooltip "¿Cuál es la diferencia?" + ocultar RUC si `country !== 'PY'` | Incompleto |
| **Descripción (800 chars)** | 800 chars es suficiente para texto corto, pero muy acotado para una empresa que quiere comunicar cultura, stack QA y beneficios. Placeholder genérico ("¿Qué hace tu empresa?"). | M | Aumentar a 1 500 chars. Estructurar con subsecciones opcionales: Cultura · Stack · Beneficios. | Incompleto |
| **Stack tecnológico** | **Campo ausente.** Un candidato QA de LATAM necesita saber si la empresa usa Selenium, Cypress, k6, Postman, Azure DevOps, etc. para evaluar fit. | **A** | Agregar campo multi-select "Stack QA" (Selenium, Playwright, Cypress, k6, Postman, Azure DevOps, Jira, otros) | **Ausente** |
| **Beneficios / cultura** | **Campo ausente.** Recruiter no puede comunicar diferenciadores (remoto/híbrido, banda salarial, beneficios). | A | Agregar checkboxes: Trabajo remoto · Híbrido · Presencial · Beneficios de salud · etc. + campo libre "Cultura" | **Ausente** |
| **LinkedIn / redes** | Solo hay campo `website_url`. No hay LinkedIn ni redes relevantes para recruiters QA. | B | Agregar campo `linkedin_url` con validación `linkedin.com/company/`. | **Ausente** |
| **Email de contacto público** | Candidato que visita el perfil público no puede contactar a la empresa directamente. Solo ve los procesos activos. | A | Agregar campo opcional `contact_email` que se muestra en perfil público como "Escribinos". | **Ausente** |
| **Previsualización en tiempo real** | "Ver perfil →" abre nueva pestaña. No hay live preview embebido. El recruiter no sabe cómo luce el perfil antes de guardar. | M | Panel split-screen o modal "Vista previa" que renderiza `/empresas/[id]` en iframe. | **Ausente** |
| **Empty state nuevo registro** | Una empresa recién registrada ve el formulario vacío sin orientación de qué completar primero ni cuál es el impacto. | M | Agregar banner "Paso 1 de 3: completá tu perfil" con secuencia guiada (perfil → proceso → candidatos). | **Ausente** |
| **Validación de imagen** | Solo valida 2 MB. No valida extensión con MIME type real (usa `file.name.split('.')`). WebP aceptado pero no siempre renderiza en clientes de email. | B | Validar MIME type real (`file.type`). Agregar preview del logo antes de subir. | Parcial |
| **Selector de industria** | Usa `<select>` mientras `team_size` usa botones pill — inconsistencia visual. | B | Unificar a botones pill con íconos de industria, o mantener select con íconos. | Incompleto |
| **Perfil público `/empresas/[id]`** | No hay botón de contacto. No muestra stack QA (campo aún no existe). Perfil sin descripción + sin logo es una tarjeta vacía con banner degradé genérico — poco profesional para CLT o Banco Continental. | **A** | Agregar "Contactar al equipo QA" si `contact_email` está presente. Mostrar placeholder "Perfil en construcción" si completitud < 50%. | Parcial |

### Respuestas UX clave
- **¿Entiende en 30 segundos?** No. El formulario carga directamente sin guía. Solo el progress bar orienta, pero no hay onboarding secuencial. **Veredicto: FALLA.**
- **¿El perfil público inspira confianza?** Depende completamente del contenido cargado. Un perfil vacío (sin logo, sin descripción, sin stack) es contraproducente — peor que no existir. **Veredicto: FALLA para empresa recién registrada.**

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Tabla de hallazgos

| Filtro / función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| **Tab "Evaluados"** | Muestra resultados de exámenes de candidatos que usaron los códigos de proceso de esta empresa. Ordenable por puntaje, fecha, nombre. | Solo ve candidatos que YA rindieron con esta empresa. No sirve para descubrir talento proactivamente. | Documentar la distinción en el UI: "estos son candidatos que YA evaluaste; para buscar talento nuevo, usá el tab Talento QA." | **A** |
| **Tab "Talento QA"** | Muestra candidatos opt-in (`talent_visible_to_empresas=true`). Filtrable por ISTQB level y búsqueda texto. | Tabla vacía si nadie optó-in. Sin explicación de por qué está vacío ni cómo crece el pool. | Agregar CTA: "Invitá más candidatos a AIQUAA para ampliar el directorio" + contador "X candidatos en el directorio nacional". | **A** |
| **Filtro por país** | **Ausente.** No existe filtro de país. | Recruiter de CLT (PY) no puede filtrar solo candidatos paraguayos. Para Banco Continental es bloqueante si buscan presenciales. | Agregar filtro `country` en tab Talento QA (y en Evaluados si el perfil tiene `country`). | **A** 🚀 |
| **Filtro por disponibilidad** | El badge "Disponible" (open_to_work=true) existe en la tabla, pero no hay filtro. | Recruiter no puede buscar solo candidatos disponibles para trabajar. | Agregar checkbox "Solo disponibles" que filtra `open_to_work=true`. | **A** |
| **Filtro por nivel ISTQB** | Presente en tabs Talento y Shortlist. Ausente en tab Evaluados. | Inconsistente: en Evaluados no podés filtrar por nivel ISTQB (aunque el campo existe en profiles). | Agregar filtro ISTQB al tab Evaluados cuando el resultado tiene user_id (para lookup del perfil). | M |
| **Filtro por skill / examen** | Filtro `filterExam` existe y funciona. Opciones en español. | Etiquetas técnicas ("ISTQB CTFL", "Git Práctica", "API Testing Challenge") sin contexto. Un RRHH sin fondo QA no entiende la diferencia. | Agregar tooltip o descripción corta al pasar el mouse: "ISTQB CTFL: certificación internacional de base de testing de software". | M |
| **Contacto de candidato** | Botón "Contactar" abre `mailto:email`. Botón "Guardar" agrega a shortlist. | `mailto:` cambia de contexto a cliente de email externo, sin tracking. Empresa no puede saber si el candidato leyó el email. | Integrar flujo de invitación: "Contactar" → abre modal de invitación interna (ya existe en /invitaciones). | **A** |
| **Comparación de candidatos** | Checkbox en cada fila, panel flotante con hasta 4 candidatos comparables. Muestra nombre, mejor puntaje, examen, aprobados/total. | Panel de comparación no muestra desglose por área ni país ni disponibilidad. | Agregar en el panel de comparación: nivel ISTQB, país, disponibilidad, y desglose de secciones del mejor examen. | M |
| **Paginación** | Tab Evaluados: sin paginación (renderiza todos). Tab Talento: `.limit(500)`. | Con 200+ candidatos la tabla se vuelve lenta; `.limit(500)` silencioso puede truncar resultados sin avisar. | Agregar paginación (o virtualización) en Evaluados. En Talento, mostrar aviso "Mostrando primeros 500 resultados". | M |
| **Shortlist / Favoritos** | Funcional: agregar/quitar con toggle, notas no editables desde UI. | No hay campo de notas editable desde la lista. Recruiter no puede anotar "muy bueno para el puesto Senior" sin salir de la tabla. | Agregar inline note editable al hacer hover en el botón "Guardado" → pequeño textarea para notas. | B |
| **Ranking de usuarios** | El puntaje de ranking general de la plataforma NO se incorpora a los resultados de búsqueda en el tab Talento. | El recruiter ve "mejor resultado de examen" pero no el ranking relativo del candidato en la plataforma. | Agregar columna "Ranking plataforma" en tab Talento si existe ese dato (requiere query adicional). | B |

### Respuestas UX clave
- **¿Recruiter sin contexto QA entiende los filtros?** Parcialmente. El filtro ISTQB tiene opciones en español ("Foundation Level") pero sin descripción de qué significa. "API Testing Challenge" y "Git Práctica" no son autoexplicativos. **Veredicto: FALLA PARCIAL.**
- **¿El flujo de contactar/guardar es claro?** Guardar: sí. Contactar: no — abre email externo, pierde el tracking. **Veredicto: FALLA en contacto.**

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| **1. Empresa crea proceso de selección** | ✅ Completo | El proceso genera un `code` que el candidato usa para rendir. Flujo claro. | Sin acción urgente. | — |
| **2. Empresa elige tipo de evaluación** | ✅ Parcial | La empresa selecciona `exam_types[]` al crear el proceso (ISTQB, Git, Performance, API, DB). Pero NO puede crear evaluaciones propias ni ver descripción de cada tipo antes de seleccionar. | Agregar descripción inline al seleccionar exam type: "ISTQB CTFL: 40 preguntas, 60 min, basado en el silabus 4.0". | M |
| **3. Empresa invita candidato vía email** | ❌ **ROTO — BLOQUEANTE** | `EMAIL_SENDING_ENABLED = false` hardcodeado en `empresa-invitaciones.ts`. La invitación se guarda en DB pero **el candidato NUNCA recibe el email**. El recruiter ve el registro como "Pendiente" y no entiende por qué nadie responde. | **Conectar Resend (issue #197/#204)**. Hasta tanto, agregar banner rojo en /invitaciones: "⚠️ El envío de emails está desactivado — los candidatos no recibirán notificación automática." | **CRÍTICO** 🚀 |
| **4. Candidato recibe y acepta invitación** | ❌ Roto | Dependiente del paso 3. El token existe, `/invitacion/[token]` existe, pero sin email el candidato nunca llega. | Habilitar Resend. Como workaround temporal: agregar botón "Copiar link de invitación" en la fila de cada invitación para que el recruiter lo comparta manualmente. | **CRÍTICO** |
| **5. Candidato rinde la evaluación con código** | ✅ Completo | El candidato puede usar el código de proceso sin invitación directa. Flujo alternativo funcional. | Sin acción urgente. | — |
| **6. Empresa ve resultados** | ✅ Completo | Tab "Evaluados" muestra score, tiempo, desglose por sección. Funcional. | Sin acción urgente. | — |
| **7. Empresa compara candidatos entre sí** | ✅ Parcial | Comparación de hasta 4 candidatos simultáneamente. Panel simple muestra nombre + puntaje + aprobados/total. | Agregar desglose por área en el panel de comparación. | M |
| **8. Fecha límite para completar evaluación** | ✅ Parcial | Campo `expires_at` existe en `hiring_processes` pero NO en el form de invitación. La empresa NO puede fijar una fecha límite al invitar un candidato específico. | Agregar campo "Fecha límite" en el modal de invitación; guardar en `empresa_invitaciones`. | M |
| **9. Recordatorio automático** | ❌ Ausente | No existe funcionalidad de reenvío ni reminder para candidatos que no completaron. | Agregar botón "Reenviar invitación" en fila de status=pendiente/vista. Requiere que email esté habilitado. | A |
| **10. Resultado interpretable para RRHH** | ✅ Parcial | El score % y pass/fail es claro. El desglose por área (secciones) es útil. Pero no hay descripción de qué área evalúa cada sección (ej: "Fundamentos del testing", "Técnicas de diseño de pruebas"). | Agregar tooltip o descripción corta de cada sección al expandir el desglose. | B |

### Respuestas UX clave
- **¿Un líder técnico entiende qué evalúa cada prueba?** Parcialmente — el nombre "ISTQB CTFL" es reconocible, pero "API Testing Challenge" y "database-practice" son opacos. Sin descripción de contenido. **Veredicto: FALLA PARCIAL.**
- **¿El resultado da info suficiente para contratar?** Para un técnico QA: sí. Para un RRHH sin contexto: no — el % no dice "aprobado por el estándar ISTQB" o "nivel junior/senior". **Veredicto: FALLA para RRHH.**

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Tabla de hallazgos

| Métrica / widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| **Procesos activos** | ✅ Sí | Card clara, clickeable a /procesos. | Sin acción. | Alto |
| **Candidatos evaluados** | ✅ Sí | Card clara, clickeable a /candidatos. | Sin acción. | Alto |
| **Tasa de aprobación global** | ✅ Sí | Muestra `passRate`% pero no indica umbral (¿aprobado = >60%?). | Agregar tooltip: "Porcentaje de candidatos que aprobaron al menos un examen". | Alto |
| **Tiempo promedio de examen** | ✅ Sí | Label "Tiempo promedio" es ambiguo. ¿Promedio de qué examen? ¿De todos? | Cambiar label a "Tiempo promedio por examen (min)". | Medio |
| **Total / cerrados procesos** | ✅ Sí | Dos cards similares (Total + Cerrados) ocupan espacio; información redundante con "Activos". | Consolidar en una card: "Procesos: X activos / Y cerrados". Libera espacio para métricas más útiles. | Bajo |
| **Prospectos pendientes** | ✅ Sí | Badge numérico + link a /prospectos. Útil. | Sin acción urgente. | Alto |
| **Invitaciones activas** | ✅ Sí | Muestra count de invitaciones en estado pendiente/vista. **Pero emails no se envían** — la métrica es engañosa: muestra "3 activas" pero ninguna fue notificada. | Agregar asterisco o tooltip: "⚠️ Los emails de invitación están desactivados". | **CRÍTICO** 🚀 |
| **Funnel de invitación** (enviadas→vistas→completadas) | ❌ No | Solo existe en /invitaciones, no en el dashboard principal. | Agregar mini-funnel card: "Enviadas: 5 · Vistas: 3 · Completadas: 1 (20%)". | Alto 🚀 |
| **Candidatos que vieron el perfil** | ❌ No | No existe ningún tracking de visitas al perfil público `/empresas/[id]`. | Implementar counter de page views en Supabase (table `empresa_profile_views`). Mostrar "X candidatos vieron tu perfil este mes". | Alto 🚀 |
| **Tasa de respuesta a invitaciones** | ❌ No (solo en /invitaciones) | Presente en /invitaciones como stat local; ausente en dashboard. | Elevar la métrica "Tasa de respuesta" (completadas/enviadas %) al dashboard. | Alto |
| **Tiempo promedio de completado de evaluación** | ❌ No dashboard | Calculable desde `assessment_attempts` (started_at/submitted_at). No en dashboard. | Agregar card "Tiempo promedio de evaluación: Xm" con benchmark "promedio AIQUAA: Ym". | Medio |
| **Top skills QA disponibles este mes** | ❌ No | No existe en ningún lado. Requeriría query sobre el directorio de talento opt-in. | Agregar widget: "Top skills disponibles en AIQUAA este mes: ISTQB CTFL (N), Git (M), API Testing (K)". | Medio 🚀 |
| **Comparativa mes anterior** | ❌ No | Los charts de 6 meses son útiles pero no hay delta vs. mes anterior. | Agregar badge "+X%" o "−Y%" en las cards de candidatos y procesos. | Bajo |
| **Gráfico: Procesos creados (6 meses)** | ✅ Sí | Funcional. Solo aparece cuando hay actividad (`totalProcesses > 0`). | Sin acción urgente. | Medio |
| **Gráfico: Candidatos evaluados (6 meses)** | ✅ Sí | Funcional. Misma condición de aparición. | Sin acción urgente. | Medio |
| **Empty state CTA** | ✅ Sí | Cuando `totalProcesses === 0` muestra: "¡Empezá a reclutar!" con CTAs "Crear primer proceso" y "Completar perfil". | Añadir tercer CTA: "Explorar candidatos disponibles" → /empresa/candidatos (tab Talento). | Medio |
| **Jerarquía visual** | ✅ Parcial | 8 cards del mismo tamaño y peso visual. Sin agrupación por categoría (Alertas · Actividad · Métricas). El primer golpe de vista no distingue qué requiere acción vs. qué es informativo. | Agrupar: row 1 "Alertas" (prospectos pendientes, invitaciones), row 2 "Actividad" (procesos, candidatos, tasa), row 3 "Histórico" (charts). | M |
| **Acciones rápidas** | ✅ Sí | Quick links grid debajo de los stats. Funcional. | Mover "Nuevo proceso" como botón primario en el header del dashboard, no solo como link card. | B |

---

## ✅ Bloque 5 — Cierre & registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 Emails de invitación completamente desactivados** — `EMAIL_SENDING_ENABLED = false` en producción. El recruiter crea una invitación, ve el estado "Pendiente" en el dashboard, pero el candidato nunca recibe nada. **El flujo core de contacto está roto.** Toda métrica de "Invitaciones activas" en el dashboard es engañosa.

2. **🚨 Módulo de perfil carece de campos QA-críticos** — No hay stack tecnológico, ni cultura, ni beneficios. El perfil público de CLT o Banco Continental en AIQUAA es literalmente un logo + texto libre. Un candidato senior que evalúa empresas no puede comparar ofertas.

3. **⚠️ Cero filtro por país en el directorio de talento** — Para una empresa paraguaya que busca talento presencial o híbrido, no poder filtrar por país es un bloqueante funcional. El tab Talento QA mezcla candidatos de toda LATAM sin discriminación geográfica.

4. **⚠️ Sin tracking de visitas al perfil público** — No hay forma de saber si los candidatos visitan el perfil de la empresa. El dashboard muestra métricas de actividad interna pero cero datos del funnel de atracción de candidatos.

5. **⚠️ El flujo de contratación de principio a fin es opaco para RRHH sin contexto QA** — Los nombres de exámenes ("database-practice", "api-banking"), las métricas (ISTQB CTFL) y los porcentajes no tienen contexto suficiente para que un RRHH de Banco Continental tome decisiones de contratación sin un QA Lead que interprete.

---

### Clasificación de hallazgos

| Hallazgo | Tipo | Prioridad |
|---|---|---|
| Emails de invitación desactivados | **Bug / Gap de funcionalidad** | **CRÍTICA** 🚀 |
| Campo stack tecnológico ausente | **Gap de funcionalidad** | Alta 🚀 |
| Filtro por país ausente en Talento | **Gap de funcionalidad** | Alta 🚀 |
| Sin tracking de visitas al perfil público | **Gap de funcionalidad** | Alta 🚀 |
| Perfil público sin campo de contacto | **Gap de funcionalidad** | Alta |
| Metadatos de exámenes sin descripción para RRHH | **Problema UX** | Alta |
| Invitaciones sin botón "Copiar link" como workaround | **Problema UX** | Alta |
| Sin paginación en tabla de evaluados | **Problema UX** | Media |
| Campos beneficios/cultura ausentes | **Gap de funcionalidad** | Media 🚀 |
| Funnel de invitación ausente en dashboard | **Problema UX** | Media 🚀 |
| Dashboard sin agrupación visual por categoría | **Problema UX** | Media |
| Comparación de candidatos sin desglose por sección | **Mejora de diseño** | Media |
| Previsualización en tiempo real del perfil | **Mejora de diseño** | Baja |
| Inconsistencia select vs. pill buttons en formulario | **Problema UX** | Baja |

---

### Tickets propuestos

#### TICKET-001 · CRÍTICO 🚀
**Título:** `[EMPRESA] Habilitar envío de emails de invitación (Resend) — EMAIL_SENDING_ENABLED`  
**Descripción:** `EMAIL_SENDING_ENABLED = false` en `apps/frontend/src/actions/empresa-invitaciones.ts:9`. Los candidatos invitados no reciben ningún email. La tabla `empresa_invitaciones` se popula correctamente pero el paso de notificación es un no-op. Impacta directamente la capacidad de reclutamiento de clientes piloto (CLT, Banco Continental).  
**Pasos para reproducir:** 1) Login como empresa. 2) /empresa/invitaciones → "Invitar candidato". 3) Completar email válido y enviar. 4) Verificar inbox del candidato: no recibe nada.  
**Impacto:** Bloqueante para uso real. Todo el funnel de invitación es no funcional.  
**Workaround temporal:** Agregar botón "Copiar link de invitación" en la tabla de invitaciones para que el recruiter comparta el token manualmente.

#### TICKET-002 · ALTA 🚀
**Título:** `[EMPRESA PERFIL] Agregar campos Stack QA, Cultura y Beneficios al perfil de empresa`  
**Descripción:** El perfil actual (`apps/frontend/src/app/empresa/perfil/page.tsx`) no tiene campos para stack tecnológico QA, modalidad de trabajo ni beneficios. Son datos críticos para que un candidato QA evalúe si aplica. Requiere columnas en `empresas` en Supabase y actualizar el formulario y el perfil público `/empresas/[id]`.  
**Impacto:** Un candidato senior no puede comparar empresas en AIQUAA. Reduce el valor de la plataforma como marketplace de talento QA.  
**Campos sugeridos:** `qa_stack text[]`, `work_modality text` (remoto/híbrido/presencial), `benefits text[]`, `contact_email text`.

#### TICKET-003 · ALTA 🚀  
**Título:** `[CANDIDATOS] Agregar filtro por país en tab Talento QA`  
**Descripción:** El tab "Talento QA" en `/empresa/candidatos` no tiene filtro por `country`. Para empresas paraguayas que buscan talento local (CLT, Banco Continental), esto es un bloqueante funcional. El campo `country` ya existe en `profiles`.  
**Pasos:** 1) /empresa/candidatos → tab Talento QA. 2) No hay forma de filtrar por PY/AR/etc.  
**Solución:** Agregar `<select>` con países del enum de `profiles.country`. Aplicar `.eq('country', filterCountry)` en la query de Supabase.

#### TICKET-004 · ALTA 🚀
**Título:** `[DASHBOARD] Implementar tracking de visitas al perfil público de empresa`  
**Descripción:** No hay métricas de cuántos candidatos visitan `/empresas/[id]`. El dashboard no puede mostrar atracción de talento. Afecta directamente el caso B2B: sin datos de "tu perfil fue visto por X candidatos", la propuesta de valor no es demostrable.  
**Solución:** Crear tabla `empresa_profile_views (id, empresa_id, viewer_user_id nullable, viewed_at)`. Insertar row server-side en `apps/frontend/src/app/empresas/[id]/page.tsx`. Mostrar count en dashboard y en perfil privado.

#### TICKET-005 · ALTA
**Título:** `[INVITACIONES] Agregar botón "Copiar link" como workaround mientras email está desactivado`  
**Descripción:** Mientras TICKET-001 no esté resuelto, el recruiter no puede notificar al candidato. Agregar un botón "📋 Copiar link" en cada fila de la tabla de invitaciones que copie `${baseUrl}/invitacion/${inv.token}` al clipboard. Requiere que el campo `token` sea retornado por `getEmpresaInvitacionesAction`.  
**Impacto:** Workaround inmediato para desbloquear el uso real sin depender de Resend.

#### TICKET-006 · MEDIA
**Título:** `[DASHBOARD] Agregar mini-funnel de invitaciones y tasa de respuesta`  
**Descripción:** La métrica "Invitaciones activas" en el dashboard solo muestra el count total pendiente. Falta el funnel completo (enviadas → vistas → completadas) y la tasa de respuesta (%). Estos datos ya existen en `empresa_invitaciones.status`.  
**Solución:** Agregar a `getEmpresaDashboardStatsAction()` los campos `invitacionesEnviadas`, `invitacionesVistas`, `invitacionesCompletadas`, `tasaRespuesta`. Mostrar como mini-funnel horizontal en el dashboard.

#### TICKET-007 · MEDIA
**Título:** `[CANDIDATOS] Agregar filtro "Solo disponibles" (open_to_work) en tab Talento QA`  
**Descripción:** El badge "Disponible" existe en la tabla pero no hay filtro dedicado. Un recruiter con urgencia de cobertura necesita ver solo candidatos disponibles.  
**Solución:** Agregar checkbox/toggle "Solo disponibles" que aplique `.eq('open_to_work', true)` a la query de perfiles.

---

### Bloqueantes para uso real (CLT / Banco Continental)

| # | Bloqueo | Descripción |
|---|---|---|
| 1 | **Emails no enviados** 🚀 | CLT invita candidatos pero ninguno recibe nada. El proceso de selección no puede comenzar. |
| 2 | **Sin filtro de país** 🚀 | Banco Continental busca QA presencial en Asunción. El directorio no lo permite filtrar. |
| 3 | **Perfil sin stack QA** 🚀 | CLT no puede comunicar que usa Playwright + Azure DevOps. Candidatos senior no postularán sin saber el stack. |
| 4 | **Sin tracking de atracción** 🚀 | Para el pitch de Moonshot, no se puede demostrar ROI: "tu empresa fue vista por 47 candidatos QA este mes". |

---

### Casos que fortalecen el B2B / Moonshot 🚀

- **Stack QA en perfil**: posiciona a AIQUAA como el único lugar en LATAM donde las empresas pueden publicar su stack y encontrar QA con ese skill específico.
- **Funnel de invitaciones con tasa de respuesta**: métrica de negocio directamente vendible a equipos de RRHH ("su invitación tuvo 68% de tasa de completado vs. 34% de promedio de la industria").
- **Tracking de visitas al perfil**: genera engagement de empresa con la plataforma. "Tu empresa fue descubierta por 120 candidatos QA este mes en AIQUAA."
- **Filtro por país + disponibilidad**: permite segmentación geográfica que ATS genéricos (Greenhouse, Lever) no tienen para el mercado LATAM QA.

---

### Foco del próximo ciclo de 1 hora

**Tema:** Flujo de creación de proceso de selección + experiencia del candidato al recibir y rendir una evaluación.  
**Por qué:** Los bloqueantes de este ciclo (email + perfil) están en el lado empresa. El próximo ciclo debe validar que el lado candidato del funnel (recibir invitación → rendir → ver su propio resultado) sea igualmente funcional, ya que el flujo completo está sin prueba de extremo a extremo.  
**Bloques sugeridos:** Registro candidato (5m) · Recibir/usar código de proceso (10m) · Rendir un examen ISTQB (15m) · Ver resultado propio (10m) · Flujo invitación token (10m) · Cierre (10m).
