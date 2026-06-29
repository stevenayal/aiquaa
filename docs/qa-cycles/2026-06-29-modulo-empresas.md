# Ciclo QA — Módulo Empresas
**Fecha:** 29 de junio de 2026  
**Reviewer:** QA Lead con visión estratégica del producto  
**Ciclo:** Mejora continua — 60 minutos  
**Persona objetivo:** Recruiter / Responsable RRHH (ej: CLT, Banco Continental SAECA)  
**Rama:** `claude/zen-noether-yxlr9z`

---

## 🏢 Bloque 1 — Perfil de empresa (13 min)

### Análisis de implementación

El flujo de creación/edición de perfil existe en `/empresa/perfil/page.tsx` y tiene los siguientes campos:
logo, razón social, nombre comercial, RUC (con validación de formato PY), descripción (800 chars con contador), sitio web (validación URL), industria (10 opciones), país (11 países LATAM), tamaño de equipo (5 rangos).

El perfil público (`/empresas/[id]`) renderiza hero card con banner degradado, logo, chips de datos, descripción, lista de procesos activos y CTA de registro.

La barra de completitud con porcentaje y anchor links a campos incompletos es una fortaleza notoria.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Campo "Stack tecnológico" | Ausente. Un QA candidate no puede saber si trabajan con Selenium, Postman, Jira, etc. | **Alto** | Agregar chips multi-select: Java, Python, Selenium, Cypress, Postman, Jira, etc. | Incompleto |
| Campo "Modalidad de trabajo" | Ausente. Banco Continental trabaja presencial en Asunción; CLT puede ser híbrido. Sin este campo el candidato no puede evaluar fit. | **Alto** | Select: Presencial / Remoto / Híbrido — con campo "ciudad" si es presencial | Incompleto |
| Campo "Beneficios / cultura" | Ausente. La descripción libre no tiene estructura. El recruiter no sabe qué poner ahí. | **Alto** 🚀 | Sección opcional con checkboxes: salario competitivo, OSH médico, trabajo remoto, formación continua, etc. Aumenta atractivo para candidatos. | Incompleto |
| Campo "LinkedIn de empresa" | Ausente. El perfil público no tiene vínculo social. Los candidatos QA LATAM usan LinkedIn para validar reputación antes de rendir. | **Alto** | Input URL de LinkedIn en la sección de datos básicos | Incompleto |
| Campo "Ciudad" | Solo hay país (no ciudad). Una empresa de Paraguay puede estar en Asunción, Ciudad del Este o Encarnación. Relevante para candidatos locales. | **Medio** | Campo texto opcional, contextualizado: "¿Dónde está la oficina principal?" | Incompleto |
| Vista previa en tiempo real | El editor y el perfil público son páginas separadas. El recruiter necesita ir a `/empresas/[id]` para ver el resultado. El botón "Ver perfil →" abre en `_blank`. | **Medio** | Agregar panel de preview inline o modal de previsualización antes de guardar | Parcial |
| Empty state del perfil público | Si empresa sin logo/descripción → el perfil muestra solo banner degradado + emoji 🏢 + chips vacíos. No transmite confianza a un candidato. | **Medio** | Mostrar placeholder visual de "Perfil en construcción" con indicación de completitud pública visible solo para el owner | Incompleto |
| Barra de completitud | Incluye `razon_social` como campo a completar, pero este viene del registro. Score inicial puede ser engañoso (arranca con 1/7 = 14%). | **Bajo** | Excluir `razon_social` de la barra de completitud si ya viene del registro; añadir los nuevos campos (stack, modalidad) para que el score refleje completitud real | Parcial |
| Validación RUC cross-country | Si el país es PY, el RUC se valida. Si el usuario cambia de PY a AR y ya tenía un RUC guardado, la validación no se vuelve a ejecutar al guardar. | **Bajo** | Revalidar RUC en `handleSave` según el país seleccionado al momento de guardar | Parcial |
| Perfil público — datos de contacto | Sin teléfono, sin email de contacto, sin LinkedIn. Un candidato no puede conectar con la empresa fuera de AIQUAA. | **Alto** 🚀 | Agregar campo "email de contacto para candidatos" opcional en el perfil y mostrarlo en la vista pública | Incompleto |
| Descripción sin formato | Solo texto plano (`whitespace-pre-line`). No hay headings, bullets, ni énfasis. Para una empresa como Banco Continental, el perfil parece amateurista. | **Medio** | Agregar un editor markdown básico (o al menos bullets y negritas) con una guía de estructura sugerida | Incompleto |

### Respuestas a preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**  
SÍ, parcialmente. La barra de completitud con anchor links es muy efectiva. El formulario es limpio. Sin embargo, no hay un texto guía que explique *por qué* completar el perfil (ej: "Las empresas con perfil completo reciben 3x más candidatos opt-in"). La motivación está ausente.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**  
DEPENDE del estado de completitud. Un perfil completo con logo, descripción bien redactada y procesos activos transmite profesionalismo. Un perfil recién creado (sin logo, descripción vacía) transmite lo opuesto. Para CLT o Banco Continental como primer piloto, el estado del perfil al momento del pitch será crítico.

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA (13 min)

### Análisis de implementación

Existe en `/empresa/candidatos/page.tsx`. Sistema de 3 tabs:
- **Evaluados**: candidatos que rindieron exámenes en los procesos de la empresa. Filtros: texto, proceso, tipo de examen, aprobado/no aprobado. Sort: puntaje, fecha, nombre. Expandible con desglose por sección.
- **Talento QA**: directorio opt-in de candidatos con `talent_visible_to_empresas=true`. Filtros: texto, nivel ISTQB.
- **Shortlist**: candidatos guardados como favoritos.

Comparación rápida de hasta 4 candidatos (checkbox). Visualizaciones: top 10 candidatos, actividad por semana, distribución por hora.

### Tabla de hallazgos

| Filtro / función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país (Talento QA) | Ausente | Una empresa en Paraguay que quiere talento local no puede filtrar. El directorio muestra candidatos de toda LATAM mezclados. | Agregar filtro por país al tab "Talento QA" (usar `profiles.country`) | **Alta** 🚀 |
| Filtro por disponibilidad (openToWork) | Ausente (solo badge visual) | Si hay 200 candidatos en el directorio, el recruiter tiene que hojear para encontrar los que están "Disponibles". | Agregar toggle "Solo disponibles" en los tabs Talento y Shortlist | **Alta** |
| Vista "por candidato" en tab Evaluados | Un candidato que rindió 3 exámenes aparece 3 veces en la tabla | Confunde al recruiter que ve el mismo nombre repetido con distintos puntajes. No queda claro cuál es el "mejor resultado" a considerar. | Agregar toggle "Agrupar por candidato" que muestre 1 fila por persona con su mejor resultado y conteo de exámenes | **Alta** |
| Contacto por email | `mailto:` abre el cliente de email del sistema | En entornos corporativos (Banco Continental, CLT), el cliente de email puede estar bloqueado. No hay template de mensaje ni historial de contacto en AIQUAA. | Integrar un formulario de contacto interno que persista en la plataforma (o al menos un modal con template de mensaje copiable) | **Media** 🚀 |
| Filtro por número de exámenes aprobados | Ausente | El recruiter quiere encontrar candidatos con evidencia de múltiples skills (ISTQB + API + Git). | Agregar filtro "Mínimo X exámenes aprobados" en Talento QA y Evaluados | **Media** |
| Comparación lado a lado | Muestra nombre, mejor puntaje, examen, aprobados/total | No compara secciones específicas ni permite ver "candidato A fue mejor en Testing Fundamentos pero peor en SQL que candidato B" | Expandir el panel de comparación con desglose por sección y un indicador visual de fortalezas/debilidades | **Media** |
| Indicador de "talento disponible" | No existe | Cuando el recruiter abre el tab "Talento QA" y encuentra 3 candidatos, no sabe si la plataforma tiene 300 pero están ocultos o realmente hay 3. | Agregar texto: "X candidatos tienen su perfil visible para empresas. Más candidatos activarán su visibilidad a medida que completen evaluaciones." | **Media** |
| Paginación en tabla Evaluados | Sin paginación — carga hasta 500 resultados | Con empresas activas (CLT hace un proceso de 200 personas), la tabla puede volverse lenta y difícil de navegar. | Agregar paginación (25/50 por página) o scroll infinito con cursor | **Media** |
| Tab "Talento QA" — carga de datos | Query de hasta 500 `exam_results` sin cursor | Performance puede degradarse con muchos datos | Implementar cursor-based pagination en `buildTalentDirectory()` | **Baja** |
| Filtro de niveles ISTQB | Opciones: CTFL, Advanced TA/TM/TTA, Expert, En proceso | Un recruiter sin contexto QA no sabe qué significa "CTAL_TTA". | Agregar tooltip o descripción breve en cada opción de filtro ("Foundation Level (CTFL) — certificación básica internacional de testing") | **Baja** |

### Respuestas a preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**  
NO completamente. Los labels de examen (`istqb`, `git-practico`, `api-banking`) son comprensibles, pero los niveles ISTQB no tienen descripción. El tab "Talento QA" requiere saber qué es `talent_visible_to_empresas`. Un onboarding o tooltip contextual es necesario.

**¿El flujo para contactar o guardar un candidato es claro y directo?**  
Guardar en favoritos es excelente (un click, respuesta inmediata). Contactar via `mailto:` es funcional pero frágil. No hay flujo para "recordar que contacté a este candidato" o "marcar como contactado".

---

## 📋 Bloque 3 — Evaluaciones técnicas (12 min)

### Análisis de implementación

El flujo real es:
1. Empresa crea proceso de selección → genera código único (ej: `CLT-2026-X7F`)
2. Empresa comparte el código con candidatos (por email, WhatsApp, etc. — fuera de la plataforma)
3. Candidato ingresa el código al iniciar un examen en AIQUAA
4. Empresa ve resultados en `/empresa/candidatos/` (tab Evaluados)

Adicionalmente, existe el módulo de Invitaciones (`/empresa/invitaciones/`) para envío directo por email, pero está **bloqueado** (ver hallazgo crítico).

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Candidato recibe invitación por email | **ROTO** | `EMAIL_SENDING_ENABLED=false` en `/actions/empresa-invitaciones.ts` (línea 9). La invitación se persiste en DB con `email_sent=false` pero el candidato NUNCA recibe el email. | Configurar la variable de entorno y conectar Resend. El stub ya existe en `sendInvitacionEmail()`. | **Crítica** 🚀 |
| Empresa elige qué examen asignar al candidato | Incompleto | La empresa crea el proceso con `exam_types[]`, pero el candidato puede rendir CUALQUIER examen del proceso, o ninguno. No hay asignación forzada "rendí específicamente ESTE examen". | Agregar campo de examen requerido en el proceso. Si se especifica, el candidato al ingresar el código solo puede acceder a ese examen. | **Alta** 🚀 |
| Empresa recibe notificación cuando candidato completa | Incompleto | No hay mecanismo de alerta (email, push, badge en dashboard) cuando un candidato rinde. El recruiter tiene que revisar manualmente. | Implementar webhook/trigger en Supabase que actualice un contador + envíe email via Resend al owner/admin del proceso | **Alta** |
| Empresa configura umbral de aprobación | No existe | El umbral de "aprobado" está hardcodeado en la plataforma. CLT puede querer 80% para puestos senior, 65% para juniors. | Agregar campo `pass_threshold` en `hiring_processes`. Si está vacío, usar el default de la plataforma. | **Media** |
| Empresa ve comparación detallada de candidatos | Parcial | La tabla de candidatos muestra puntaje global. El desglose por sección es expandible por candidato, pero NO lado a lado. | Ver propuesta en Bloque 2: panel de comparación multi-candidato con desglose de secciones | **Media** |
| Expiración de evaluación (timeout para candidato) | No existe | No hay límite de tiempo para completar una evaluación una vez que el proceso tiene un código activo y no vencido. | Agregar campo `evaluation_window_hours` en el proceso (ej: "el candidato tiene 24h desde que acepta la invitación para rendir") | **Media** |
| Documentación de qué evalúa cada examen | No existe | Un recruiter sin background QA no sabe qué diferencia ISTQB Foundation de "API Testing Fundamentals". El botón de selección de examen en el proceso no tiene descripción. | Agregar tooltip/panel en la selección de `exam_types` con descripción del examen (nivel, áreas, duración estimada, qué mide) | **Alta** |
| Vista de resultados para comparar candidatos entre sí | Parcial | La tabla de Evaluados ordena bien por puntaje. Pero sin comparación by-section side-by-side, un líder técnico no puede tomar la decisión óptima. | Implementar "modo comparación": seleccionar 2-4 candidatos y ver tabla comparativa con una fila por sección | **Media** |
| Fecha límite de invitación | Incompleto | Las invitaciones en `/empresa/invitaciones/` existen hasta que se cancelan manualmente. No hay vencimiento automático. | Agregar `expires_at` en `empresa_invitaciones` (default: 7 días). Cron job que marque como "rechazada" al vencer. | **Baja** |

### Respuestas a preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**  
NO. Los nombres como `istqb`, `database-practice`, `api-banking` son crípticos para RRHH. Un líder técnico QA los entiende, pero el responsable de RRHH de CLT que gestiona el proceso no.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**  
PARCIALMENTE. El puntaje global + desglose por sección + tiempo empleado es buena data. Falta la comparación estructurada multi-candidato y un contexto de "qué significa este puntaje" (ej: "80% ISTQB = apto para posición QA Junior según estándares de la industria").

---

## 📊 Bloque 4 — Dashboard de empresa (12 min)

### Análisis de implementación

Dashboard en `/empresa/page.tsx`. Métricas actuales: 8 stat cards (procesos activos, candidatos evaluados, tasa aprobación, tiempo promedio, total procesos, procesos cerrados, prospectos pendientes, invitaciones activas). 2 bar charts (procesos creados 6 meses, candidatos evaluados 6 meses). Empty state CTA cuando `totalProcesses=0`. Welcome banner colapsable. Quick links a todas las secciones.

### Tabla de métricas

| Métrica / widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Procesos activos | Sí | Funciona bien, tiene link a `/empresa/procesos` | — | Orientación operacional |
| Candidatos evaluados | Sí | Muestra total global, no por proceso activo | Agregar tooltip/breakown por proceso activo | Orientación operacional |
| Tasa de aprobación global | Sí | Muestra `—` cuando `totalCandidates=0` aunque haya procesos activos. Confunde. | Mostrar "Sin evaluaciones aún" en lugar de `—` cuando hay procesos activos sin candidatos | Orientación de calidad |
| Tiempo promedio de evaluación | Sí | Un único número global. No indica por tipo de examen. | Desglose por tipo de examen (ej: ISTQB tarda 40m promedio, API Testing 25m) | Orientación operacional |
| Candidatos que vieron el perfil público | **No** | No hay page view tracking en `/empresas/[id]`. La empresa no sabe si su perfil está siendo visitado. | Implementar contador de visitas con Supabase (o Vercel Analytics) para el perfil público | Alto valor B2B 🚀 |
| Tasa de respuesta a invitaciones | Parcial (solo en `/invitaciones`) | No está en el dashboard principal. Con email roto, la métrica siempre es 0%. | Agregar stat card "Tasa de respuesta invitaciones" en el dashboard una vez que el email funcione | Alto valor B2B 🚀 |
| Tasa de conversión: invitado → evaluado | **No** | La empresa no sabe cuántos candidatos invitados terminaron rindiendo vs. los que ignoraron. | Calcular: `completadas / total_invitaciones * 100` y mostrarlo como KPI | Alto valor B2B 🚀 |
| Procesos próximos a vencer | **No** | Si un proceso tiene `expires_at` en 3 días, el recruiter no recibe alerta. | Agregar widget "⚠️ 2 procesos vencen esta semana" con link a `/empresa/procesos` | Crítico para CLT con deadlines de contratación |
| Top skills QA disponibles en la plataforma este mes | **No** | No existe. Valor para mostrar qué talento está disponible este mes en AIQUAA. | Widget informativo (no personalizado): "Skills más evaluados en AIQUAA este mes" — dato agregado, no sensible | Valor de producto 🚀 |
| Candidatos por proceso (breakdown) | **No** (solo total global) | Empresa con 3 procesos activos no puede saber en el dashboard cuál tiene más candidatos sin ir a `/candidatos`. | Reemplazar o complementar el chart de "Candidatos evaluados" con un gráfico apilado por proceso | Orientación operacional |
| Jerarquía de "próxima acción" | **No** | Un recruiter nuevo que llega al dashboard no sabe si su prioridad es completar el perfil, crear un proceso, o invitar candidatos. El empty state dice "Crear primer proceso" pero si ya hay procesos y 0 candidatos, no hay guía clara. | Agregar un "Next action" card que detecte el estado actual y recomiende: ej. si hay procesos activos pero 0 candidatos → "Compartí tu código con candidatos o invitá directamente" | Alto valor UX |
| Charts: condición de visibilidad | Ocultos cuando no hay datos (correcto) | Cuando aparecen, los 2 charts son idénticos en formato pero complementarios. El orden (procesos primero, candidatos después) es correcto. | — | Bien implementado |

### Respuesta a preguntas UX clave

**¿El primer golpe de vista le dice a la empresa qué está pasando con su proceso de selección?**  
PARCIALMENTE. Las 8 stat cards dan una vista rápida. Pero el diseño de grilla 2×4 le da igual peso a "Procesos activos" y "Prospectos pendientes", cuando lo primero debería ser más prominente. Las métricas más importantes no están jerarquizadas visualmente.

**¿Hay acciones rápidas desde el dashboard?**  
SÍ, a través de los quick links de la parte inferior. Pero están separados de las métricas, creando dos "zonas" de información sin conexión. Un stat card con link (`href`) como "Candidatos evaluados → /empresa/candidatos" existe y está bien. Faltaría que las métricas de 0 también tengan CTA incorporado.

---

## ✅ Bloque 5 — Cierre & registro del ciclo

### Resumen ejecutivo de hallazgos críticos

1. **[BUG — Crítico] Invitaciones por email no se envían** — `EMAIL_SENDING_ENABLED=false` en `empresa-invitaciones.ts`. Los candidatos invitados nunca reciben el email. El flujo de invitación está completamente roto para el caso de uso real. Bloquea el uso de CLT o Banco Continental como piloto.

2. **[GAP Funcional — Alto] Campos clave del perfil ausentes** — Stack tecnológico, modalidad de trabajo, LinkedIn, ciudad y beneficios son ausencias que impiden que el perfil transmita confianza a un candidato QA de LATAM. Sin estos campos, el perfil público parece incompleto vs. una oferta en LinkedIn.

3. **[GAP Funcional — Alto] No hay notificación al recruiter cuando un candidato evalúa** — La empresa no recibe aviso cuando alguien rinde. Requiere polling manual de `/empresa/candidatos/`. En un proceso de 50 candidatos, esto es inmanejable.

4. **[GAP UX — Alto] Directorio de talento sin filtros prácticos** — Sin filtro por país, sin filtro por disponibilidad (`openToWork`). Para una empresa en Paraguay, el directorio es de baja utilidad si no puede segmentar por candidatos locales disponibles.

5. **[GAP Funcional — Medio] No hay asignación forzada de examen** — La empresa no puede decir "para este proceso, el candidato DEBE rendir ISTQB". El candidato puede rendir cualquier examen incluido en el proceso. Para un proceso formal de CLT, esto es un gap de control.

### Clasificación de hallazgos

| # | Hallazgo | Tipo | Prioridad |
|---|---|---|---|
| 1 | Email de invitaciones no se envía | Bug | Crítica |
| 2 | Sin campos stack/modalidad/beneficios en perfil | Gap funcional | Alta |
| 3 | Sin notificación al recruiter tras evaluación | Gap funcional | Alta |
| 4 | Directorio de talento sin filtro por país/disponibilidad | Problema UX | Alta |
| 5 | Sin asignación forzada de examen por proceso | Gap funcional | Media-Alta |
| 6 | Perfil público sin email/LinkedIn de contacto | Gap funcional | Alta |
| 7 | Sin documentación de qué evalúa cada examen | Problema UX | Alta |
| 8 | Sin jerarquía de "próxima acción" en el dashboard | Mejora de diseño | Media |
| 9 | Sin alerta de procesos próximos a vencer | Gap funcional | Media |
| 10 | Sin comparación multi-candidato side-by-side con secciones | Gap funcional | Media |
| 11 | Sin tasa de conversión invitado→evaluado en dashboard | Gap funcional | Media |
| 12 | Vista por candidato (agrupación) en tab Evaluados | Problema UX | Media |
| 13 | Sin umbral de aprobación configurable por proceso | Gap funcional | Media |
| 14 | Contador de visitas al perfil público | Gap funcional | Media |

### Tickets para crear en Jira (aiquaa.atlassian.net)

---

**Ticket 1 — BUG CRÍTICO**

**Título:** `[BUG] Invitaciones a candidatos no se envían por email (EMAIL_SENDING_ENABLED=false)`  
**Descripción:** El archivo `apps/frontend/src/actions/empresa-invitaciones.ts` tiene `EMAIL_SENDING_ENABLED` hardcodeado en `false` (línea 9). La función `sendInvitacionEmail()` es un stub que retorna `{ sent: false }` sin ninguna lógica de envío. Las invitaciones se persisten en `empresa_invitaciones` con `email_sent=false`, pero el candidato nunca recibe notificación.  
**Pasos para reproducir:**
1. Loguearse como empresa
2. Ir a `/empresa/invitaciones`
3. Crear una invitación con un email válido
4. Verificar la bandeja del candidato → no llega ningún email
5. Verificar en Supabase: `empresa_invitaciones` → `email_sent=false`, `email_error=null`

**Impacto:** Bloquea completamente el flujo de invitaciones. Las empresas piloto (CLT, Banco Continental) no pueden usar esta funcionalidad.  
**Prioridad:** Crítica  
**Acción:** Configurar `EMAIL_SENDING_ENABLED=true` en Railway + conectar Resend en `sendInvitacionEmail()`. El template de email debe incluir token de acceso y link a la plataforma.

---

**Ticket 2 — GAP FUNCIONAL**

**Título:** `[FEAT] Agregar campos Stack Tecnológico, Modalidad y LinkedIn al perfil de empresa`  
**Descripción:** El perfil de empresa carece de tres campos críticos para atraer talento QA en LATAM: (1) Stack tecnológico de la empresa — herramientas que usa el equipo QA, (2) Modalidad de trabajo — presencial/remoto/híbrido + ciudad, (3) LinkedIn de empresa — para que candidatos validen la empresa.  
**Impacto:** Sin estos campos, el perfil público no transmite suficiente confianza ni información relevante a un candidato QA evaluando si postular.  
**Prioridad:** Alta  
**Acción:** Agregar columnas en tabla `empresas`: `tech_stack TEXT[]`, `work_mode TEXT`, `office_city TEXT`, `linkedin_url TEXT`. Actualizar form en `/empresa/perfil/page.tsx` y vista pública en `/empresas/[id]/page.tsx`.

---

**Ticket 3 — GAP FUNCIONAL**

**Título:** `[FEAT] Notificación al recruiter cuando candidato completa una evaluación`  
**Descripción:** Actualmente, cuando un candidato rinde un examen con el código de un proceso, la empresa no recibe ningún aviso. Debe revisar manualmente `/empresa/candidatos/`. En procesos de alto volumen (CLT con 50+ candidatos), esto es inmanejable.  
**Impacto:** Empresa pierde oportunidad de actuar rápido sobre candidatos destacados.  
**Prioridad:** Alta  
**Acción:** Implementar Supabase Database Webhook en `exam_results` INSERT / `assessment_attempts` UPDATE `status='graded'` → trigger función Edge que envíe email via Resend al owner/admin del proceso.

---

**Ticket 4 — PROBLEMA UX**

**Título:** `[UX] Agregar filtros por país y disponibilidad en directorio de Talento QA`  
**Descripción:** El tab "Talento QA" en `/empresa/candidatos/` solo tiene filtro por nivel ISTQB y búsqueda texto. Faltan filtros críticos: (1) País — para empresas paraguayas que buscan talento local, (2) Disponibilidad (`openToWork=true`) — para priorizar candidatos buscando trabajo activamente.  
**Impacto:** El directorio de talento es de baja utilidad para empresas en Paraguay sin filtro geográfico.  
**Prioridad:** Alta  
**Acción:** Agregar `SELECT` de país y toggle "Solo disponibles" en el panel de filtros del tab Talento. Los datos ya existen en `profiles.country` y `profiles.open_to_work`.

---

**Ticket 5 — GAP FUNCIONAL**

**Título:** `[FEAT] Documentación inline de evaluaciones en creación de proceso`  
**Descripción:** Al crear un proceso de selección y seleccionar `exam_types`, el recruiter ve solo los nombres de los exámenes (`istqb`, `api-banking`, `database-practice`). No hay descripción de qué evalúa cada uno, duración estimada, o a qué nivel de QA aplica.  
**Impacto:** Un responsable de RRHH sin background técnico no puede elegir los exámenes adecuados para el puesto.  
**Prioridad:** Alta  
**Acción:** Agregar panel de descripción expandible o tooltip en el selector de `exam_types` en `/empresa/procesos/nuevo/`. Incluir: descripción, duración estimada, áreas evaluadas, nivel de dificultad.

---

**Ticket 6 — GAP FUNCIONAL**

**Título:** `[FEAT] Alerta en dashboard de procesos próximos a vencer`  
**Descripción:** Los procesos con `expires_at` no generan ningún aviso al recruiter cuando se acercan a su fecha de vencimiento. Si CLT tiene un proceso que vence en 3 días y hay candidatos sin evaluar, puede perder la oportunidad.  
**Impacto:** Riesgo operacional para empresas con deadlines de contratación.  
**Prioridad:** Media  
**Acción:** Agregar widget en el dashboard: "⚠️ X procesos vencen en los próximos 7 días". Calcular en `getEmpresaDashboardStatsAction()` y renderizar en `/empresa/page.tsx`.

---

### Partes del módulo que bloquean el uso real (cliente piloto: CLT / Banco Continental)

1. **Invitaciones sin email** — El flujo principal de outreach a candidatos está roto. Sin esto, la empresa solo puede compartir un código y esperar. Para una empresa formal, esto no es suficiente.
2. **Perfil público insuficiente** — Sin stack tecnológico, modalidad, y LinkedIn, el perfil no pasa el filtro de confianza de un candidato QA que evalúa múltiples empresas.
3. **Sin notificación de evaluación completada** — Para procesos formales, la empresa necesita ser alertada. La revisión manual no escala.
4. **Sin asignación forzada de examen** — Para un proceso estructurado de selección, la empresa debe poder definir exactamente qué evaluación rendir.

### Hallazgos que fortalecen el caso B2B para Moonshot

- 🚀 **Comparación multi-candidato con desglose por área** — Feature diferencial que ninguna herramienta de reclutamiento en LATAM ofrece. Permite al líder técnico justificar la decisión de contratación con datos objetivos.
- 🚀 **Tasa de conversión invitado→evaluado** — KPI único de AIQUAA que no existe en LinkedIn o Bumeran. Evidencia de engagement de candidatos con la marca empleadora.
- 🚀 **Candidatos que vieron el perfil público** — Analytics de marca empleadora (employer branding) basados en evaluaciones técnicas. Diferencial claro en el pitch.
- 🚀 **Stack tecnológico en perfil** — Para empresas como Banco Continental que usan tecnologías específicas, este match estructural puede usarse para recomendar candidatos automáticamente ("X candidatos tienen experiencia en Java + Selenium, coincide con tu stack").
- 🚀 **Email de contacto en perfil público** — Habilita que candidatos contacten empresas desde AIQUAA, creando un loop de retención de ambos lados de la plataforma.

---

### Foco del próximo ciclo (1 hora)

**Objetivo:** Corregir el bug crítico del email + implementar notificación de evaluación completada

1. **[30 min] Fix bug email invitaciones** — Conectar Resend en `sendInvitacionEmail()`, activar `EMAIL_SENDING_ENABLED`, diseñar template de email con token y CTA.
2. **[20 min] Notificación al recruiter** — Diseñar el trigger de Supabase o webhook para `exam_results` INSERT con el proceso_code de la empresa.
3. **[10 min] Smoke test end-to-end** — Verificar el flujo completo: empresa crea proceso → invita candidato → candidato recibe email → rinde → empresa recibe aviso.

**Rama sugerida:** `feat/empresa-email-notifications`

---

*Informe generado por ciclo de mejora continua — AIQUAA QA Lead Review*  
*Stack analizado: Next.js 13+ App Router + Supabase + Railway + Resend*  
*Archivos clave revisados: 15 páginas/componentes, 4 archivos de actions, schema DB completo*
