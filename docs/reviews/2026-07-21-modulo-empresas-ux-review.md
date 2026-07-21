# Revisión UX — Módulo de Empresas
**Fecha:** 21 de julio de 2026
**Ciclo:** Mejora continua · 60 min (ciclo de seguimiento del 27 de junio de 2026)
**Reviewer:** QA Lead (revisión automatizada de código)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, migraciones de Supabase), verificada file:line contra el estado real del repositorio en la rama de trabajo. Se documentan solo hallazgos confirmados en el código — no supuestos. Este ciclo es de **seguimiento**: se re-testeó cada hallazgo del ciclo anterior (2026-06-27) para confirmar si fue corregido, sigue roto, o quedó parcial, y se buscaron regresiones/hallazgos nuevos.

---

## 🚨 Hallazgo crítico de seguridad (fuera de los 5 bloques, prioridad máxima)

**RLS de `empresa_invitaciones` expone toda la tabla vía API pública de Supabase.**

Dos policies de `SELECT` conviven sobre `public.empresa_invitaciones` (Postgres combina policies permisivas con OR):

- `supabase/migrations/20260602_000000_empresa_profile_and_invitaciones.sql:63-65` → `USING (token IS NOT NULL AND status IN ('pendiente','vista'))`
- `supabase/migrations/20260627_000000_empresas_branding_views.sql:41-44` → `TO anon, authenticated` con `USING (true)` — comentario: *"el chequeo de token pasa en la RPC"*

El comentario asume que la única vía de acceso es la RPC `get_invitacion_by_token`, pero RLS se aplica a **cualquier** acceso a la tabla, incluyendo `GET /rest/v1/empresa_invitaciones?select=*` directo con la anon key pública (embebida en el frontend). Con la segunda policy, **cualquier persona sin autenticación puede leer todas las invitaciones de todas las empresas**: `token`, `candidate_email`, `candidate_name`, `mensaje`, `empresa_id`, `status`. No es necesario conocer un token — se puede listar todos.

Esto es un data leak de PII de candidatos (nombre + email) a nivel de toda la plataforma, explotable sin credenciales. Bloqueante de seguridad, no de UX. Además existe una ruta duplicada `/invitacion/[token]` (singular) junto a la correcta `/invitaciones/[token]` (plural) — código muerto que amplía innecesariamente la superficie.

**Acción inmediata recomendada:** reemplazar `USING (true)` por una policy que solo permita lectura vía la RPC `SECURITY DEFINER` (revocar `SELECT` directo de `anon`/`authenticated` sobre la tabla y exponer los datos únicamente a través de `get_invitacion_by_token(token)` con `SECURITY DEFINER`), y eliminar la ruta duplicada `/invitacion/[token]`.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Parcialmente, sin cambios respecto al ciclo anterior. La barra de completitud sigue contando campos que vienen precargados por el sistema (`country='PY'` por defecto, `razon_social` prellenado en el registro), por lo que una empresa nueva ve ~25% de avance sin haber tocado nada — empeoró respecto al 14% original porque ahora hay más campos en el denominador.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Mejoró notablemente: ahora existen `tech_stack`, `work_mode`, `benefits` y `linkedin_url`, visibles en `/empresas/[id]`. Sigue faltando URL memorable (slug) y preview inline.

### Tabla de hallazgos

| Elemento del perfil | Estado (ciclo anterior → actual) | Problema UX | Impacto | Propuesta de mejora |
|---|---|---|---|---|
| Stack tecnológico, modalidad, beneficios, LinkedIn | Incompleto → **Corregido** ✅ | — | — | Ninguna, verificar que se muestren también en el directorio `/empresas` (listing), no solo en el detalle |
| URL pública con UUID | Incompleto → **Sigue roto** | `/empresas/[id]` sigue usando el UUID crudo; no existe columna `slug` en ninguna migración | **A** | Generar slug único desde `nombre_comercial` con fallback numérico |
| Directorio público `/empresas` | Roto/faltante → **Corregido** ✅ (con matiz) | Existe y lista logo/industria/país/modalidad, pero sin buscador ni filtro por industria; además usa `revalidate = 300`, por lo que un cambio de perfil puede tardar hasta 5 min en verse en el listado (el detalle `/empresas/[id]` sí es inmediato) | **M** | Agregar búsqueda/filtro al listado; reducir o eliminar el `revalidate` en escritura, o invalidar on-demand tras guardar el perfil |
| Preview inline al editar | Incompleto → **Sigue roto** | Solo link externo "Ver perfil →"; no hay modal/panel de previsualización | **M** | Agregar modal o panel colapsable de preview |
| Completitud por defecto (`country='PY'` + `razon_social` prellenado) | Parcial → **Sigue roto, empeoró** | Empresa nueva arranca en ~25% de completitud sin acción propia | **M** | Calcular completitud solo sobre campos editados explícitamente por el usuario, no sobre valores por defecto del sistema |
| Redes sociales (LinkedIn/Instagram/Twitter) | Incompleto → **Parcial** | LinkedIn agregado; Instagram/Twitter siguen ausentes | **B** | Evaluar si vale la pena agregar más redes o dejarlo así (LinkedIn es la más relevante para B2B) |
| Eliminar logo | Incompleto → **Sigue roto** | Solo "🔄 Cambiar logo", no hay opción de eliminar | **B** | Agregar botón "Eliminar logo" con confirmación |
| Contador de caracteres en `razon_social`/`nombre_comercial` | Parcial → **Sigue roto** | `description` y `benefits` sí tienen contador `{n}/max`; estos dos campos no | **B** | Agregar contadores consistentes en todos los campos con `maxLength` |
| Label "RUC" fijo para todos los países | Incompleto → **Sigue roto** | Solo el texto de ayuda cambia según país; el label del campo sigue diciendo "RUC" siempre | **B** | Renombrar dinámicamente (RUC/NIT/CUIT/RFC) según `country` |
| Validación de `linkedin_url` | — (nuevo) | Acepta cualquier URL válida, no exige dominio linkedin.com, a diferencia de `website_url` que sí valida formato `http(s)://` | **B** | Validar que contenga `linkedin.com` |
| Validación de RUC para países no-PY | — (nuevo) | El regex de formato de documento solo corre si `country === 'PY'`; otros países no tienen ninguna validación de formato | **B** | Agregar reglas básicas por país o al menos un mínimo de longitud |
| Límite de tamaño/tipo de logo solo client-side | — (nuevo) | El límite de 2MB y el chequeo de mime type están solo en el navegador; el bucket `empresa-logos` en Supabase Storage no define `file_size_limit` ni `allowed_mime_types` | **M** | Configurar límites a nivel de bucket en Supabase Storage, no solo en el cliente |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Sí, ahora. `ISTQB_LEVEL_LABELS` traduce los códigos técnicos (`ctfl`, `ctal_ta`, etc.) a etiquetas legibles ("Foundation Level (CTFL)", "Advanced Level — Test Analyst") en ambas páginas de búsqueda.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Mejoró: ahora hay botón "Invitar" inline en la ficha del candidato en el directorio de Talento, sin salir a otro módulo. Pero la funcionalidad quedó repartida de forma inconsistente entre dos páginas de búsqueda que deberían comportarse igual.

### Tabla de hallazgos

| Filtro/función | Estado (anterior → actual) | Problema | Prioridad |
|---|---|---|---|
| Filtro por país | Ausente → **Corregido** ✅ | Implementado en ambas páginas (`buscar-candidatos` y `candidatos`), con etiquetas legibles vía `COUNTRY_LABELS` | — |
| Filtros ISTQB sin descripción | Sin tooltips → **Corregido** ✅ | Etiquetas completas en ambas páginas | — |
| Búsqueda consistente Talento vs Evaluados | Inconsistencia → **Parcial** | El buscador ahora aplica en ambos tabs, pero cada uno matchea campos distintos (Evaluados solo nombre/email; Talento también rol/país/nivel ISTQB; `buscar-candidatos` agrega además skills) | **M** — unificar el alcance del buscador entre las 3 vistas |
| Límite 500 resultados hardcoded | Sin cambios → **Sigue roto** | `candidatos/page.tsx:189` sigue con `.limit(500)` en la consulta que alimenta el directorio de Talento | **M** |
| Invitar inline desde ficha de candidato | Ausente → **Corregido** ✅ | Botón "Invitar" en ambas páginas de búsqueda | — |
| Comparar candidatos | Ausente → **Parcial** | Implementado solo en `candidatos/page.tsx` (comparación de hasta 4, checkbox); **ausente** en `buscar-candidatos/page.tsx` | **M** — extender a la otra página o unificar en una sola vista |
| Exportar CSV | Ausente → **Parcial** | Implementado solo para el tab "Evaluados" en `candidatos/page.tsx`; no existe para "Talento"/"Favoritos" ni en `buscar-candidatos/page.tsx` | **A** 🚀 — Banco Continental necesita exportar para RRHH, y hoy solo puede desde un tab |
| Filtro "disponible/open to work" | Ausente → **Parcial** | Existe como filtro completo en `buscar-candidatos`, pero en `candidatos` (Talento) solo se muestra como badge, sin dropdown para filtrar | **M** |
| Empty state sin candidatos | No verificado → **Corregido** ✅ | Mensajes específicos por tab confirmados en ambas páginas | — |
| Desglose `section_scores` | Descartado en DB → **Parcial** | Corregido en el directorio principal (`candidatos/page.tsx`, join a `assessment_scores`); **sigue forzado a `null`** en `employer.ts:417` (`fetchAssessmentAttemptsForProcessCodes`), que alimenta las vistas por proceso (`/empresa/procesos/[id]`, `/employer/[code]`) | **A** — mismo bug persiste en un segundo code path |

**Hallazgo nuevo:** existen dos páginas de búsqueda de candidatos (`buscar-candidatos` y `candidatos`) con capacidades distintas y parcialmente solapadas (comparación solo en una, exportación solo en otra, filtro de disponibilidad solo en una). Esto es confuso tanto para el usuario como para el mantenimiento — vale la pena decidir si deben fusionarse o diferenciarse claramente en propósito.

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
Sí, ahora, para el flujo de "procesos" (`empresa/procesos/nuevo`): cada tipo de examen muestra duración/nivel/qué evalúa. Sigue faltando en el perfil público `/empresas/[id]`, donde solo 3 tipos legacy tienen traducción y el resto muestra el slug crudo.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Mejoró sustancialmente: hay comparación de candidatos, notificación a la empresa al completarse una evaluación, y desglose por sección en el directorio principal. El path de "ver candidatos por proceso" sigue sin desglose.

Este bloque era el foco explícito del ciclo anterior (email de invitación + ruta pública + funnel). **Las tres piezas fueron implementadas.** Sin embargo, la implementación de la ruta pública introdujo el hallazgo crítico de seguridad reportado arriba.

### Tabla de hallazgos

| Paso del flujo | Estado (anterior → actual) | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Envío de email al invitar candidato | Roto (sin email) → **Corregido** ✅ | Depende de la env var `EMAIL_SENDING_ENABLED === 'true'`, no documentada en `.env.local.example` — si no está seteada en prod, las invitaciones se marcan `email_sent: false` silenciosamente | Documentar la env var y agregar alerta visible en el dashboard si el envío de emails está deshabilitado | **A** |
| Ruta pública `/invitaciones/[token]` | Roto (no existía) → **Corregido, pero con vulnerabilidad de RLS** | Ver hallazgo crítico de seguridad arriba; además queda una ruta duplicada y muerta `/invitacion/[token]` (singular) | Corregir RLS + eliminar ruta duplicada | **CRÍTICO** 🚀 |
| Descripción de tipos de examen al crear proceso | Sin descripción → **Corregido** ✅ | `EXAM_OPTIONS` ahora incluye duración/nivel/qué evalúa | — | — |
| Vínculo código de proceso ↔ invitación | Flujos separados → **Corregido** ✅ | Completar examen con código de proceso ahora actualiza el status de la invitación asociada | — | — |
| Desglose `section_scores` | Descartado → **Parcial** | Corregido en directorio principal; sigue `null` en `employer.ts:417`, afectando la vista por proceso individual (`/empresa/procesos/[id]`) | Aplicar el mismo join de `assessment_scores` en `fetchAssessmentAttemptsForProcessCodes` | **A** |
| Notificación a empresa al completar evaluación | Roto → **Corregido** ✅ | Email vía Resend a owner/admin de la empresa | — | — |
| Comparar candidatos entre sí | Incompleto → **Corregido** ✅ | Panel de comparación rápida (score, tipo de examen, aprobados) para 2+ candidatos seleccionados | — | — |
| Alerta de vencimiento próximo (`expires_at`) | Parcial → **Sigue roto** | Solo hay badge para procesos ya vencidos; no hay aviso proactivo de "vence en <7 días" | Agregar badge de advertencia con umbral configurable | **M** |
| `max_attempts` configurable | Incompleto → **Parcial** | Existe en el módulo nuevo y paralelo "empresa_pruebas", pero no en el módulo de "procesos" que es el revisado/usado en este flujo | Decidir si "empresa_pruebas" reemplaza a "procesos" o si hay que portar el campo | **B** |
| Descripción de tipos de examen en perfil público | Incompleto → **Sigue roto** | `/empresas/[id]` solo traduce 3 tipos legacy (istqb, git, performance); tipos nuevos (database, infra, api, etc.) muestran el slug crudo | Extender el diccionario de traducción a todos los `exam_types` vigentes | **M** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

Este bloque era el segundo foco del ciclo anterior (funnel de invitaciones). **Se implementó.**

### Tabla de hallazgos

| Métrica/widget | Estado (anterior → actual) | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Perfil visto por candidatos | Faltante → **Corregido** ✅ | RPC `increment_empresa_profile_views` + stat card "Visitas al perfil" | Agregar ventana temporal (hoy es contador acumulado de por vida, inconsistente con los gráficos de 6 meses del resto del dashboard) | **A** 🚀 |
| Funnel invitación → vista → completada | Faltante → **Corregido** ✅ | `FunnelWidget` implementado con datos reales de `empresa_invitaciones` | — | **A** 🚀 |
| Tasa de respuesta a invitaciones | Faltante → **Corregido** ✅ | Calculada dentro del mismo `FunnelWidget` | — | **A** 🚀 |
| Candidatos evaluados: aprobados vs reprobados | Sin split → **Parcial** | `passedCandidates` ya se calcula en `employer.ts` pero **no se renderiza** en `page.tsx` — el dato existe, falta un campo en la UI | Mostrar "X aprobados / Y reprobados" usando el dato ya calculado | **A** — esfuerzo mínimo, dato ya disponible |
| Procesos activos con breakdown por estado | Sin cambios → **Sigue roto** | Solo un número total, sin desglose por estado de candidatos | Agregar mini-desglose o sparkline | **M** |
| Tasa de aprobación con umbral ISTQB (65%) | Sin cambios → **Sigue roto** | Se muestra el % crudo o "—", sin referencia de contexto | Agregar tooltip con el umbral ISTQB CTFL (65%) | **M** |
| Tiempo promedio con benchmark de plataforma | Sin cambios → **Sigue roto** | Sin comparación con el promedio de la plataforma | Agregar "p75 de la plataforma: X min" | **B** |
| Comparación entre procesos (pass rate, score promedio) | Faltante → **Parcial** | Existe pero solo en la vista de detalle de un evento (`/empresa/eventos/[id]`), no en el dashboard principal ni como vista consolidada de todos los procesos | Llevar la tabla comparativa al dashboard principal o a `/empresa/procesos` | **M** |
| Top skills QA disponibles este mes | Faltante → **Sigue roto** | No implementado | Widget "Skills más evaluados en AIQUAA este mes" | **B** |
| Actualización de datos del dashboard | — (nuevo) | Los stats se cargan una sola vez al montar la página, sin polling ni suscripción realtime de Supabase ni botón de refresh manual — puede quedar desactualizado durante toda la sesión | Agregar botón "Actualizar" o suscripción realtime a cambios en `empresa_invitaciones`/`exam_results` | **B** |
| Jerarquía visual de tarjetas clickeables vs. estáticas | — (nuevo) | Las 8 tarjetas del dashboard lucen uniformes, pero solo algunas son clickeables (`href`); no hay indicio visual de cuáles llevan a otra pantalla | Agregar affordance visual (cursor, ícono de flecha) a las tarjetas clickeables | **B** |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 CRÍTICO DE SEGURIDAD — RLS de `empresa_invitaciones` expone toda la tabla.** La policy `USING (true)` agregada para soportar la ruta pública por token en realidad permite leer **todas** las invitaciones de **todas** las empresas (candidato, email, token) sin autenticación, vía la API REST pública de Supabase. Esto es un data leak de PII explotable con la anon key pública, no un problema de UX. Tipo: **bug de seguridad**. Bloqueante absoluto — se recomienda remediar antes de cualquier otra prioridad de este ciclo.

2. **✅ El foco del ciclo anterior se completó** — email de invitación (Resend), ruta pública por token, y funnel de invitaciones (enviada→vista→completada) en el dashboard están implementados y funcionando. Este es el hallazgo positivo más importante del ciclo: el flujo B2B core de invitar candidatos externos ya no está roto end-to-end (aparte del hallazgo #1).

3. **⚠️ `section_scores` sigue descartado en un segundo code path.** El bug de desglose por sección se corrigió en el directorio principal de candidatos pero persiste idéntico en `employer.ts:417`, que alimenta la vista de candidatos por proceso individual. Es la misma corrección, aplicada a la mitad de los lugares donde se necesita. Tipo: **bug de implementación** (fix parcial/duplicado).

4. **⚠️ Funcionalidad fragmentada entre dos páginas de búsqueda de candidatos.** `buscar-candidatos` y `candidatos` (tab Talento) deberían ofrecer la misma capacidad pero cada una tiene features que la otra no: comparación solo en una, exportación CSV solo en la otra, filtro de disponibilidad solo en una. Un recruiter que usa la página "equivocada" pierde funcionalidad sin saberlo. Tipo: **problema UX / deuda de producto**.

5. **⚠️ Completitud de perfil sigue infundiendo falsa confianza.** Una empresa nueva arranca en ~25% de completitud (antes 14%) sin haber editado nada, por campos precargados por el sistema (`country`, `razon_social`). Empeoró respecto al ciclo anterior porque se agregaron más campos al cálculo sin resolver la causa raíz. Tipo: **bug de UX no resuelto**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | RLS de invitaciones expone PII de todas las empresas | Bug de seguridad | **Sí — crítico** 🚀 |
| 2 | Ruta duplicada `/invitacion/[token]` (código muerto) | Deuda técnica | No, pero amplía superficie del #1 |
| 3 | `section_scores` null en vista por proceso (`employer.ts:417`) | Bug | Sí 🚀 |
| 4 | Funcionalidad fragmentada entre `buscar-candidatos` y `candidatos` | Gap de producto | Parcial |
| 5 | CSV export ausente en Talento/Favoritos y en `buscar-candidatos` | Gap de funcionalidad | Sí 🚀 |
| 6 | Completitud de perfil con falso avance (country/razon_social prellenados) | UX | No |
| 7 | URL pública de empresa con UUID (sin slug) | UX | Parcial |
| 8 | Directorio `/empresas` sin buscador/filtro y con cache de 5 min | UX | No |
| 9 | Dashboard: aprobados/reprobados no mostrados pese a estar calculados | UX (esfuerzo mínimo) | No |
| 10 | Sin alerta proactiva de vencimiento de proceso (<7 días) | Gap de funcionalidad | No |
| 11 | Bucket de logos sin límites server-side (tamaño/mime type) | Bug de seguridad (menor) | No, pero recomendable corregir junto al #1 |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. **La vulnerabilidad de RLS debe corregirse antes de cualquier demo o piloto real** — un banco no puede tolerar que los datos de candidatos que invitó sean públicamente legibles.
2. El desglose de resultados por sección sigue sin verse en la vista por proceso, que es probablemente la vista que un recruiter usa día a día para un proceso de selección activo.
3. La exportación CSV, clave para reportar a RRHH, solo funciona desde un tab de una de las dos páginas de búsqueda — no es confiable como feature "siempre disponible".

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- **El flujo de invitación end-to-end ya funciona** (email + ruta pública + tracking) — esto es exactamente lo que se necesitaba para demostrar el caso de uso core a CLT. Vale la pena mencionarlo como avance de producto, condicionado a resolver el hallazgo de seguridad primero.
- **Funnel de invitaciones y tasa de respuesta ya visibles en el dashboard** — métrica de ROI lista para el pitch.
- **Visitas al perfil público** — dato ya disponible para mostrar "X candidatos vieron tu empresa este mes", aunque conviene agregarle ventana temporal antes de usarlo en el pitch.
- **Comparación de candidatos y notificación de finalización de examen** — ambas mejoran directamente la experiencia de decisión de contratación, un argumento fuerte para RRHH.

### Foco del próximo ciclo (1 hora)

**Prioridad 1 (innegociable): corregir la vulnerabilidad de RLS en `empresa_invitaciones`**
1. Revocar `SELECT` directo de `anon`/`authenticated` sobre la tabla; exponer datos de invitación únicamente vía una función `SECURITY DEFINER` que reciba el token como parámetro.
2. Eliminar la ruta duplicada `/invitacion/[token]`.
3. Auditar si existen otras tablas con políticas `USING (true)` para `anon`/`authenticated` que deban revisarse con el mismo criterio (recomendado ejecutar `supabase get_advisors` de seguridad sobre el proyecto).

**Prioridad 2 (si el tiempo lo permite):**
4. Aplicar el join de `assessment_scores` en `employer.ts:417` para que la vista por proceso también muestre desglose por sección.
5. Mostrar `passedCandidates` (aprobados/reprobados) en el dashboard — el dato ya está calculado, solo falta renderizarlo.

Este ciclo prioriza cerrar la brecha de seguridad recién descubierta por sobre nuevas features de UX — es la que más impacto negativo tendría si se expone a un cliente piloto real.

---

## Nota sobre creación de tickets en Jira

Este ciclo no tuvo acceso a la instancia de Jira (`aiquaa.atlassian.net`) desde el entorno de ejecución automatizado, por lo que los tickets no pudieron crearse directamente. A continuación el contenido listo para pegar manualmente:

**[SEGURIDAD-CRÍTICO] RLS de empresa_invitaciones expone PII de candidatos sin autenticación**
- *Descripción:* La policy `empresa_invitaciones_public_token_select` (`USING (true)`, para `anon, authenticated`) permite leer la tabla completa vía `GET /rest/v1/empresa_invitaciones` con la anon key pública, sin conocer ningún token.
- *Pasos para reproducir:* Con la anon key pública del proyecto, hacer `GET {SUPABASE_URL}/rest/v1/empresa_invitaciones?select=*` — devuelve todas las filas de todas las empresas.
- *Impacto:* Data leak de PII (nombre/email de candidatos) a nivel de plataforma completa. Explotable sin autenticación.
- *Prioridad:* Crítica / bloqueante de seguridad.

**[BUG] section_scores nulo en vista de candidatos por proceso**
- *Descripción:* `fetchAssessmentAttemptsForProcessCodes` en `apps/frontend/src/actions/employer.ts:417` fuerza `section_scores: null`, a diferencia del directorio principal de candidatos que ya hace el join correcto.
- *Impacto:* Recruiter no ve desglose por área al revisar candidatos de un proceso específico.
- *Prioridad:* Alta.

**[GAP] Exportación CSV incompleta**
- *Descripción:* CSV export solo existe en el tab "Evaluados" de `/empresa/candidatos`; falta en "Talento"/"Favoritos" y en `/empresa/buscar-candidatos`.
- *Impacto:* Empresas no pueden exportar de forma consistente para reportar a RRHH.
- *Prioridad:* Alta (🚀 caso B2B).

**[UX] Completitud de perfil de empresa infla el avance con valores por defecto**
- *Descripción:* `country='PY'` y `razon_social` prellenados en el registro se cuentan como "completos" en la barra de progreso.
- *Impacto:* Genera falsa sensación de avance a empresas recién registradas.
- *Prioridad:* Media.

---

*Revisión generada automáticamente — 2026-07-21 · Rama: `claude/zen-noether-vmow0v` · Ciclo de seguimiento de `docs/reviews/2026-06-27-modulo-empresas-ux-review.md`*
