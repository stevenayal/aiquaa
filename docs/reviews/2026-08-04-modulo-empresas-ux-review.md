# Revisión UX — Módulo de Empresas
**Fecha:** 4 de agosto de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)
**Ciclo anterior:** [2026-06-27](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, migraciones de Supabase), con lectura línea a línea de cada archivo citado. **No se realizó testing en navegador contra la app desplegada** — esta sesión corrió de forma automatizada y sin acceso a un entorno con base de datos/credenciales cargadas, así que no pude ejecutar el flujo como lo haría un recruiter real haciendo clicks. Todo lo que sigue está confirmado en el código con cita `archivo:línea`; donde no pude verificar algo lo marco explícitamente como "no verificado este ciclo" en vez de asumir. Recomiendo que el próximo ciclo incluya una pasada en navegador contra staging para confirmar estos hallazgos en la UI real.
>
> **Limitación de esta sesión:** no tengo integración con Jira (`aiquaa.atlassian.net`) configurada — no pude crear los tickets directamente. Al final del documento dejo el contenido listo para copiar/pegar en Jira.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Sí, razonablemente. `apps/frontend/src/app/empresa/perfil/page.tsx` tiene un widget de completitud (L284-323) que calcula `completionScore()` sobre 8 campos y lista qué falta con links ancla directos al campo. Buen patrón.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Parcialmente. El formulario ya cubre stack tecnológico, modalidad de trabajo (remoto/híbrido/presencial) y beneficios — campos que el ciclo anterior (27/jun) marcó como faltantes y que **ya están implementados** (`perfil/page.tsx:576-722`). Lo que sigue faltando: founded year, fotos/galería, redes sociales más allá de LinkedIn, y rango salarial estructurado.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto (A/M/B) | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Flujo duplicado `employer/*` vs `empresa/*` | Existen dos pantallas paralelas e independientes para crear procesos de selección (`employer/nuevo/page.tsx` con `company_name` de texto libre vs `empresa/procesos/nuevo/page.tsx` ligado al perfil real). Un recruiter puede escribir un nombre de empresa distinto al de su perfil público, generando inconsistencia de marca. | **A** 🚀 | Deprecar `/employer/*` o redirigirlo a `/empresa/procesos/*`; eliminar el campo `company_name` de texto libre | Roto (duplicado activo) |
| Permisos de Storage en `empresa-logos` | La política RLS del bucket (`supabase/migrations/20260602_000000_empresa_profile_and_invitaciones.sql:93-112`) da INSERT/UPDATE/DELETE a **cualquier usuario autenticado**, no solo al dueño de la ruta/empresa. Cualquier usuario logueado (incluso un candidato) podría sobreescribir el logo de otra empresa. | **A** (seguridad, no solo UX) 🚀 | Restringir la policy al `empresa_id` del usuario (path-based check) | Roto — riesgo de seguridad |
| Validación de logo | Se valida tamaño (&lt;2MB, `perfil/page.tsx:161-164`) pero no el tipo real del archivo — el `accept="image/*"` del input es solo un hint de UI, no hay chequeo de MIME antes de subir | **M** | Validar magic bytes/MIME server-side antes de aceptar el upload | Parcial |
| RUC duplicado al registrarse | Hay constraint UNIQUE en DB (`empresas_ruc_unique`) pero el formulario de registro no pre-valida duplicados — el usuario recibe un error genérico de Supabase en vez de "Este RUC ya está registrado" | **M** | Pre-chequear RUC en el submit y mostrar mensaje claro | Incompleto |
| Directorio público `/empresas` | **Ya existe** (no estaba en el ciclo anterior) con `revalidate = 300` (5 min de ISR) | **B** | Considerar revalidación on-demand al guardar el perfil, para que el candidato vea el cambio sin esperar 5 min | Completo (con caveat de staleness) |
| Website/LinkedIn URL | Solo valida prefijo `http(s)://` por regex; no verifica que sea un dominio real ni que linkedin.com sea efectivamente LinkedIn | **B** | Validación de dominio más estricta para el campo LinkedIn | Parcial |
| Validación server-side | `updateEmpresaAction` (`empresa-admin.ts:296-330`) solo chequea rol de membresía, no repite ninguna de las validaciones de longitud/formato que sí corren en el cliente — se puede bypassear llamando la server action directamente | **B** | Espejar las validaciones client-side en el server action | Incompleto |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
No verificado a nivel de copy/tooltips en este ciclo (no leí el JSX de labels con ese detalle), pero el ciclo anterior señaló que valores como `ctal_ta`/`ctal_tm` no tienen explicación — no hay evidencia de que esto haya cambiado.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Sí, y **mejoró respecto al ciclo anterior**: el shortlist (`empresa_favoritos`) está completamente conectado a un flujo de invitación in-app vía Resend, con una decisión de diseño explícita de no exponer emails en la búsqueda ("arma tu shortlist sin exponer emails", `buscar-candidatos/page.tsx:307-308`).

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Ranking de resultados | La RPC `get_empresa_candidate_sourcing()` ordena por disponibilidad → mejor score → actividad reciente (`empresa_candidate_sourcing.sql:162-169`), replicado client-side en `candidateDirectory.ts:154-174` | Ninguno — esto es un criterio de relevancia razonable y ya implementado | Documentar el criterio de orden en la UI ("ordenado por disponibilidad y score") para que el recruiter confíe en el ranking | **B** (mejora, no bug) |
| Filtros disponibles en "Buscar candidatos" | Texto libre, nivel ISTQB, país, disponibilidad, skills multi-select (`candidateDirectory.ts:64-76`) | Faltan: años de experiencia, nivel de inglés, expectativa salarial, preferencia remoto/presencial, especialización (DB/API/Performance) pese a que esos `exam_types` existen en otro módulo | Agregar al menos experiencia y especialización como filtros | **A** |
| Filtros en tab "Talento QA" (`/empresa/candidatos`) | Solo texto libre, ISTQB, país — sin skills ni disponibilidad, a diferencia de `buscar-candidatos` | Dos pantallas de búsqueda de candidatos con distinto set de filtros — confuso para el recruiter, no sabe cuál usar | Unificar ambas pantallas o alinear el set de filtros | **A** 🚀 |
| Privacidad de contacto | La RPC nunca selecciona `email` para el pool de Talento; el test unitario lo confirma explícitamente (`candidateDirectory.test.ts:79`) | Ninguno en el pool de Talento — buen diseño. Pero el tab "Evaluados" del mismo `candidatos/page.tsx` sí muestra `participant_email` en tabla y CSV (`page.tsx:1385-1391`, `725-758`) | Aclarar en UI por qué un tab expone email y el otro no (son datasets distintos: postulantes directos vs. pool opt-in) — hoy puede parecer inconsistente | **M** |
| Shortlist / favoritos | Tabla real `empresa_favoritos`, tab dedicado en `/empresa/candidatos`, insert/delete desde ambas pantallas de búsqueda | Funcional, ninguna falla encontrada | — | Completo |
| Contactar candidato — pool Talento | Solo "Invitar" (modal → invitación in-app), sin `mailto:` — por diseño, ya que no se expone el email | Ninguno, es intencional | — | Completo |
| Envío de invitación (proceso de selección) | `sendInvitacionEmailIfEnabled` sí llama a Resend (`empresa-invitaciones.ts:42-119`) | **Está gateado por `EMAIL_SENDING_ENABLED`, que por defecto es falso.** Si esa env var no está seteada en producción, la invitación se crea en DB pero el email nunca sale — sin error visible para el recruiter | **Confirmar en Railway/Vercel que `EMAIL_SENDING_ENABLED=true` en producción** — si no lo está, este es el mismo bug crítico del ciclo anterior, solo que ahora "apagado" en vez de "no implementado" | **CRÍTICO** 🚀 |
| Comparación side-by-side | No encontrado en `buscar-candidatos` ni `candidatos` | El recruiter debe anotar manualmente para comparar | Selección múltiple + modal comparativo | **M** |
| Empty state sin resultados | Presente y explícito en ambas pantallas ("Sin candidatos para estos filtros", `buscar-candidatos/page.tsx:456-472`; equivalentes en `candidatos/page.tsx:813-822, 1283-1290`) | Ninguno | — | Completo |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
No del todo. Hay **dos sistemas de evaluación paralelos y no conectados**: (A) un armador de quizzes propio de la empresa (`empresa/pruebas/*`, con tipos de pregunta genéricos: opción múltiple, verdadero/falso, texto corto) y (B) un sistema de exámenes de plataforma con tipos con nombre (ISTQB, Git, Performance, API Testing, DB) atado a `hiring_processes`. Un recruiter que use (A) no tiene forma de enviar un ISTQB "de verdad" — solo puede armar su propio cuestionario ad-hoc.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Parcialmente. Hay ranking por score y detalle por pregunta al expandir un candidato (`resultados/page.tsx:105-320`), pero no hay comparación por área entre candidatos, y las respuestas de texto corto se autocalifican por matching de palabras clave con una advertencia explícita de "revisar manualmente" (`page.tsx:434-436`).

### Tabla de hallazgos

| Paso del flujo | Estado (completo/incompleto/roto) | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Elegir tipo de evaluación | Incompleto | Solo 3 tipos de pregunta genéricos (opción múltiple/V-F/texto corto), sin plantillas ISTQB/práctica/case-study pese a que ese catálogo existe en el otro sistema (`invitacion/[token]/page.tsx:6-29`) | Unificar los dos sistemas de evaluación o permitir elegir un `exam_type` con plantilla al crear una "prueba" | **A** 🚀 |
| Notificación al candidato — pruebas propias de la empresa | Roto | `createPruebaInvitacionAction` (`empresa-pruebas.ts:480-516`) solo inserta el registro; nunca llama a `sendEmail`. La UI de invitaciones de "pruebas" solo ofrece "📋 Copiar" el link (`invitaciones/page.tsx:96-100`), no enviarlo | Conectar este flujo al mismo `sendEmail` de Resend que ya usa el módulo de invitaciones de procesos | **CRÍTICO** 🚀 |
| Notificación al candidato — invitación a proceso | Completo, pero condicionado | Ver hallazgo de Bloque 2 sobre `EMAIL_SENDING_ENABLED` | Confirmar flag activo en producción | **CRÍTICO** 🚀 |
| Comparar candidatos entre sí | Incompleto | Existe tab "Ranking" ordenado por score con barra de tiempo, pero sin desglose por área entre candidatos — solo al expandir uno a la vez | Agregar columnas de desglose por categoría en la tabla de ranking | **M** |
| Fecha límite / máximo de intentos | Incompleto | Las columnas `expires_at` y `max_attempts` existen en DB y se validan server-side, pero el formulario "Nueva invitación" no las expone — toda invitación queda con `max_attempts=1`, `expires_at=null` por defecto | Exponer ambos campos en el formulario de invitación | **M** |
| Candidato toma la evaluación | Completo | Timer funcional con gracia de 2 min, validado cliente y servidor (`prueba/[token]/page.tsx:62-79`) | — | Completo |
| Instrucciones al candidato | Parcial | Pantalla de bienvenida muestra título, descripción opcional, cantidad de preguntas y duración — no hay rúbrica ni criterio de evaluación explícito | Agregar sección "qué evaluamos" reutilizable | **B** |
| Autocalificación de texto libre | Parcial, con advertencia propia del código | Matching por palabras clave, marcado explícitamente como "revisar manualmente" en el propio código (`resultados/page.tsx:253-256`) | Agregar cola de revisión manual visible en el dashboard de resultados | **M** |
| Etiqueta "Beta" en todo el módulo de pruebas | — | El feature completo está marcado "Beta" en la UI (`empresa/pruebas/page.tsx:74-76`) | Confirmar con producto si esto se comunica a los clientes piloto o si debería salir de Beta antes de CLT/Banco Continental | **A** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Preguntas UX clave

**¿El primer golpe de vista le dice a la empresa qué está pasando con su proceso de selección?**
Sí, en general — todas las métricas leen datos reales de Supabase (`getEmpresaDashboardStatsAction`, `apps/frontend/src/actions/employer.ts:492-708`), no hay valores hardcodeados. Esto confirma y refuerza el hallazgo del ciclo anterior de que el dashboard está bien cableado a datos reales.

### Tabla de hallazgos

| Métrica/widget | Existe (sí/no/parcial) | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Procesos activos / total / cerrados | Sí | Datos en vivo, clickeables a `/empresa/procesos` | — | Alto |
| Candidatos evaluados | Sí | Datos en vivo | — | Alto |
| Tasa de aprobación | Sí | Datos en vivo | — | Alto |
| Tiempo promedio | Sí | Datos en vivo | — | Medio |
| Prospectos pendientes / Invitaciones activas | Sí | Badge rojo cuando &gt;0 — buena jerarquía visual de urgencia | — | Alto |
| Visitas al perfil (`profile_views`) | Sí | Ya implementado (era un gap "crítico 🚀" en el ciclo anterior — **resuelto**) | — | Alto — pitch de Moonshot |
| Funnel de invitaciones (enviadas/vistas/completadas + tasa de respuesta) | Sí | Ya implementado (`page.tsx:114-172, 444-451`) — **resuelto** desde el ciclo anterior | — | Crítico — pitch de Moonshot |
| Manejo de errores de carga | No | El `.then(({ data }) => ...)` del efecto nunca lee `error` (`page.tsx:214-217`); si la query falla, el dashboard muestra ceros sin avisar que algo falló | Mostrar un estado de error explícito si `getEmpresaDashboardStatsAction` devuelve error | **A** |
| Empty state "sin actividad" | Parcial | Solo se activa si `totalProcesses === 0` (`page.tsx:347`) — una empresa con procesos pero cero candidatos evaluados no ve el empty state, solo ceros sin contexto; además los gráficos no se renderizan en absoluto si `totalProcesses === 0 && totalCandidates === 0` (`page.tsx:454`) | Ampliar la condición del empty state a "sin candidatos" también, no solo "sin procesos" | **M** |
| Comparación entre procesos | No | Sin tabla de KPIs proceso-a-proceso (pass rate, score promedio) | Agregar tabla resumen | Alto |
| Top skills QA disponibles este mes | No | Oportunidad de market intelligence para el pitch B2B | Widget "Skills más evaluados en AIQUAA este mes" | Medio — 🚀 Moonshot |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 Invitaciones del armador de pruebas propio (`empresa/pruebas`) no envían email — solo copiar link manualmente.** A diferencia del flujo de invitación a procesos (que sí llama a Resend), este flujo nunca invoca `sendEmail`. Tipo: **bug / gap de funcionalidad**.
2. **🚨 `EMAIL_SENDING_ENABLED` gatea todo el envío de emails de invitación y por defecto es `false`.** Si no está seteada en producción, el flujo "core" de invitar candidatos externos sigue roto en la práctica, aunque el código ya exista. **Esto hay que confirmarlo en el entorno de producción — no pude verificarlo desde este ciclo.** Tipo: **riesgo de configuración**.
3. **🚨 Permisos de Storage del bucket `empresa-logos` no están aislados por empresa** — cualquier usuario autenticado puede escribir/borrar el logo de otra empresa. Tipo: **bug de seguridad**, prioritario para un piloto bancario (Banco Continental).
4. **⚠️ Dos flujos duplicados y desincronizados** (`/employer/*` legacy vs `/empresa/procesos/*` actual) permiten que el nombre de empresa mostrado en un proceso no coincida con el perfil público. Tipo: **gap de arquitectura / UX**.
5. **⚠️ Dos sistemas de evaluación no integrados** — el armador de pruebas propio no puede usar los tipos de examen con nombre (ISTQB, etc.) del otro sistema, y viceversa. Un cliente que pide "mandale un ISTQB a este candidato" desde `empresa/pruebas` no puede hacerlo. Tipo: **gap de funcionalidad**.

### Buenas noticias vs. el ciclo del 27/jun (progreso real)

Varios de los hallazgos críticos del ciclo anterior **ya están resueltos**:
- Directorio público `/empresas` — implementado.
- Filtro por país en búsqueda de candidatos — implementado.
- Campos de perfil (stack, modalidad, beneficios, LinkedIn) — implementados.
- Exportación CSV de resultados — implementada.
- Funnel de invitaciones y visitas al perfil en el dashboard — implementados.
- Envío de email para invitaciones a procesos vía Resend — implementado (condicionado al flag, ver hallazgo #2).

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Pruebas propias sin envío de email | Bug / gap funcionalidad | Sí 🚀 |
| 2 | `EMAIL_SENDING_ENABLED` posiblemente apagado en prod | Riesgo de config | Sí (a confirmar) 🚀 |
| 3 | Storage `empresa-logos` sin aislamiento por empresa | Bug de seguridad | Sí 🚀 |
| 4 | Flujos duplicados `employer/*` vs `empresa/*` | Gap de arquitectura | Sí 🚀 |
| 5 | Dos sistemas de evaluación no integrados | Gap de funcionalidad | Sí (para Banco Continental) 🚀 |
| 6 | Filtros inconsistentes entre `buscar-candidatos` y tab Talento | UX problem | Parcial |
| 7 | Sin fecha límite/máx. intentos configurable en UI | Gap de funcionalidad | No |
| 8 | Dashboard no distingue error de "cero actividad" | UX problem | No |
| 9 | Empty state del dashboard incompleto (solo mira procesos) | UX problem | No |
| 10 | RUC duplicado sin mensaje claro al registrarse | UX problem | Parcial |

### Bloqueantes reales para CLT / Banco Continental

1. **Confirmar si el envío de emails de invitación está activo en producción** — si no lo está, el caso de uso core "invitar candidato externo" sigue roto pese a que el código exista.
2. El armador de pruebas propio no puede enviar invitaciones por email en ningún escenario — solo copiar link a mano.
3. El aislamiento de Storage entre empresas es un riesgo de seguridad real frente a un cliente bancario — vale una revisión de seguridad dedicada antes de onboarding.
4. Los dos flujos duplicados (`employer/*` / `empresa/*`) generan una experiencia inconsistente que no transmite profesionalismo a un piloto corporativo.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- Funnel de invitaciones y visitas al perfil ya implementados — **listos para pitch** ("X candidatos vieron tu empresa este mes").
- El ranking de búsqueda por relevancia (disponibilidad + score + actividad) ya es un diferenciador legítimo frente a un buscador plano.
- El diseño de privacidad (no exponer emails en el pool de Talento hasta invitar) es un punto de venta de confianza para candidatos, y un argumento defendible ante compliance de un banco.
- Widget de "Top skills QA del mes" sigue siendo una oportunidad de market intelligence no explotada.

### Foco del próximo ciclo (1 hora)

**Prioridad:** Cerrar el circuito de notificaciones y unificar los dos flujos duplicados

1. Confirmar en Railway/Vercel el estado real de `EMAIL_SENDING_ENABLED` en producción; si está apagado, activarlo y hacer un envío de prueba end-to-end.
2. Conectar `createPruebaInvitacionAction` al mismo servicio de Resend que ya usa `empresa-invitaciones.ts`.
3. Decidir y ejecutar la deprecación de `/employer/*` en favor de `/empresa/procesos/*`, o documentar por qué deben coexistir.
4. Revisión de seguridad de las policies de Storage (`empresa-logos`) — aislar por `empresa_id`.

---

## 📎 Tickets listos para Jira (`aiquaa.atlassian.net`)

No tengo integración con Jira configurada en esta sesión automatizada, así que no pude crear los tickets directamente. Contenido listo para copiar/pegar:

---

**Título:** [BUG] Invitaciones de "Pruebas" (empresa/pruebas) no envían email al candidato
**Descripción:** El flujo de creación de invitaciones dentro del armador de pruebas propio de la empresa (`empresa/pruebas/[pruebaId]/invitaciones`) solo permite copiar el link manualmente. A diferencia del flujo de invitación a procesos de selección, nunca invoca el servicio de email (Resend).
**Pasos para reproducir:** Ir a `/empresa/pruebas/[id]/invitaciones` → crear invitación → observar que la única acción disponible es "📋 Copiar", no hay envío de email.
**Impacto:** El recruiter debe copiar y pegar el link manualmente por otro canal — flujo core roto para invitar candidatos externos vía este módulo.
**Prioridad:** Crítica 🚀

---

**Título:** [CONFIG] Confirmar `EMAIL_SENDING_ENABLED` en producción
**Descripción:** El envío de emails de invitación a procesos de selección vía Resend está condicionado a la env var `EMAIL_SENDING_ENABLED === 'true'`, que por defecto es falsa. Confirmar si está activa en el entorno de producción (Railway/Vercel); si no lo está, el flujo core de invitación queda silenciosamente roto sin ningún error visible para el recruiter.
**Pasos para reproducir:** Revisar variables de entorno de producción; si falta, crear una invitación de prueba y confirmar si el email llega.
**Impacto:** Puede estar bloqueando el caso de uso B2B principal sin que nadie lo note, ya que el registro en DB se crea igual.
**Prioridad:** Crítica 🚀

---

**Título:** [SECURITY] Policies de Storage `empresa-logos` no aisladas por empresa
**Descripción:** La policy RLS del bucket `empresa-logos` (migración `20260602_000000_empresa_profile_and_invitaciones.sql`, líneas 93-112) otorga INSERT/UPDATE/DELETE a cualquier usuario autenticado, sin restringir por `empresa_id` del path. Cualquier usuario logueado podría sobrescribir o borrar el logo de otra empresa si conoce/adivina la ruta del objeto.
**Impacto:** Riesgo de seguridad cross-tenant, especialmente sensible para un cliente bancario piloto (Banco Continental).
**Prioridad:** Alta 🚀

---

**Título:** [UX/ARCH] Flujos duplicados `employer/*` vs `empresa/procesos/*`
**Descripción:** Existen dos pantallas independientes para crear/gestionar procesos de selección: la legacy `/employer/*` (con campo de texto libre `company_name`, no ligado al perfil real) y la actual `/empresa/procesos/*` (ligada al `empresa_id` del usuario autenticado). Ambas persisten contra la misma tabla mediante `createHiringProcessAction`, pero el nombre mostrado puede no coincidir con el perfil público de la empresa.
**Impacto:** Inconsistencia de marca y confusión sobre cuál pantalla usar; mala primera impresión para un piloto corporativo.
**Prioridad:** Alta 🚀

---

**Título:** [FEATURE GAP] Unificar sistema de "pruebas" propio con catálogo de exámenes con nombre (ISTQB, etc.)
**Descripción:** El armador de pruebas de la empresa (`empresa/pruebas`) solo soporta 3 tipos de pregunta genéricos (opción múltiple, verdadero/falso, texto corto) y no puede asignar los tipos de examen con nombre (ISTQB, Git, Performance, API, DB) que sí existen en el sistema de `hiring_processes`/`exam_types`.
**Impacto:** Un recruiter no puede enviar un examen ISTQB "oficial" desde el armador de pruebas — debe usar el otro sistema, sin que la UI indique por qué existen dos caminos distintos.
**Prioridad:** Alta

---

*Revisión generada automáticamente — 2026-08-04 · Rama: `claude/zen-noether-6qwyp3`*
