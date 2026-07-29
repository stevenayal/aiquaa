# Revisión UX — Módulo de Empresas
**Fecha:** 29 de julio de 2026
**Ciclo:** Mejora continua · 60 min (ciclo #2, seguimiento de la revisión del 27 de junio de 2026)
**Reviewer:** QA Lead (revisión automatizada de código)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas App Router, migraciones SQL de Supabase). Se documentan solo hallazgos confirmados en el código — no supuestos. No se ejecutó el flujo en navegador en este ciclo (entorno headless sin credenciales de empresa/candidato sembradas); todo lo aquí reportado es trazable a archivo y línea.

> **Corrección de arquitectura respecto al ciclo anterior:** el módulo de Empresas **no** corre sobre NestJS + Prisma. El repo solo tiene `apps/frontend` (Next.js); la lógica vive en Server Actions (`apps/frontend/src/actions/empresa-*.ts`) que hablan directo con Supabase (Postgres + RLS + RPCs), sin capa de DTOs/servicios ni OpenAPI. Esto no cambia los hallazgos UX, pero sí cómo se debe leer "endpoint" o "modelo" en este documento: son acciones de servidor y tablas SQL, no controllers/entities.

---

## 🔄 Qué cambió desde el ciclo del 27/06

De los 5 hallazgos críticos del ciclo anterior, **4 están resueltos** y 1 sigue parcialmente abierto:

| # | Hallazgo (ciclo 27/06) | Estado ahora |
|---|---|---|
| 1 | Invitaciones sin email — token sin ruta pública | ✅ **Resuelto** — `/invitaciones/[token]` existe, el email se envía vía Resend en `empresa-invitaciones.ts`. Pero ver hallazgo nuevo **#1** abajo: la UI miente cuando el envío falla silenciosamente. |
| 2 | Directorio público `/empresas` inexistente | ✅ **Resuelto** — `apps/frontend/src/app/empresas/page.tsx` lista todas las empresas. |
| 3 | `section_scores` descartado en UI | ✅ **Resuelto** — el desglose por área ahora se muestra en `empresa/candidatos` (fila expandible). |
| 4 | Faltan stack tecnológico, modalidad, beneficios, LinkedIn en el perfil | ✅ **Resuelto** — los 4 campos existen en `empresa/perfil/page.tsx`. |
| 5 | Métricas B2B faltantes (funnel, page views, tasa de respuesta) | ✅ **Resuelto** — funnel de invitaciones y contador de visitas al perfil implementados en el dashboard. |
| 6 | URL pública con UUID, no slug | ⚠️ **Sigue abierto** — `/empresas/[id]` sigue siendo el UUID crudo. |
| 9 | Sin comparación side-by-side | ✅ **Resuelto** — comparación de hasta 4 candidatos en `empresa/candidatos`. |
| — | Exportar CSV | ✅ **Resuelto** — botón "📥 Exportar CSV" en tab Evaluados. |
| — | Filtro por país | ✅ **Resuelto** — presente en ambas páginas de búsqueda de candidatos. |

Buen progreso de ejecución. El foco de este ciclo pasa entonces de "¿existe la funcionalidad?" a "¿la funcionalidad que ya existe engaña o confunde al recruiter?" — y ahí aparecen los hallazgos nuevos más importantes del ciclo.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Sí, en gran parte — la barra de completitud con lista de campos faltantes y enlaces ancla (`#pais`, etc.) guía bien. Pero el defecto `country = 'PY'` sigue precargado, así que la barra arranca en 13% antes de que el usuario toque nada (el mismo problema del ciclo pasado, sin resolver).

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Mejoró sustancialmente: ahora hay stack tecnológico, modalidad, beneficios y LinkedIn. Pero como todos esos bloques son 100% condicionales (`if (empresa.field)`), una empresa que completó solo lo obligatorio muestra una página casi vacía sin ningún texto de "aún no completado" — se ve más a un perfil abandonado que a uno nuevo. Y no hay ninguna señal de confianza objetiva (candidatos evaluados, antigüedad en la plataforma, verificación) más allá de lo que la propia empresa escribe sobre sí misma.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Completitud por defecto (`country='PY'`) | Sigue sin resolverse desde el ciclo anterior: 13% de avance falso antes de cualquier acción del usuario | **M** | Calcular completitud solo sobre campos editados explícitamente, no sobre defaults | Incompleto |
| Perfil público con campos vacíos | Bloques enteros (tech stack, beneficios, modalidad, LinkedIn) desaparecen sin dejar rastro si están vacíos — no hay placeholder "Aún no completado" | **A** 🚀 | Mostrar placeholder discreto en vez de omitir la sección, para que no parezca perfil abandonado | Incompleto |
| Señales de confianza objetivas | No hay "X candidatos evaluados", "Empresa en AIQUAA desde...", badge de verificación | **A** 🚀 | Agregar 1-2 métricas objetivas al perfil público (ya existen en `empresa_invitaciones`/`hiring_processes`) | Falta |
| Validación de `linkedin_url` | `website_url` valida formato `http(s)://`, pero `linkedin_url` es un `type="url"` sin regex — acepta cualquier URL, no solo linkedin.com | **B** | Validar dominio `linkedin.com` o al menos formato URL estricto | Parcial |
| `razon_social` / `nombre_comercial` sin contador visible | Tienen `maxLength` pero no muestran `{n}/120` como sí hace `description` | **B** | Agregar contador visual consistente con el resto del formulario | Parcial (repetido del ciclo anterior) |
| Eliminar logo | Solo existe "🔄 Cambiar logo", no hay acción de eliminar | **B** | Agregar botón "Eliminar logo" con confirmación | Incompleto (repetido) |
| RUC solo se valida para Paraguay | Para otros países, RUC acepta cualquier string hasta 20 caracteres — sin formato definido | **B** | Renombrar dinámicamente (RUC/NIT/CUIT/RFC) según país, con validación cuando aplique | Parcial |
| Preview del perfil público | Solo link externo "Ver perfil →" en nueva pestaña, sin preview inline | **B** | Modal o panel colapsable de preview sin salir del formulario | Incompleto (repetido) |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Mejor que antes (las etiquetas ISTQB ahora se expanden a texto legible, ej. "Advanced Level — Test Analyst" en vez de `ctal_ta`), pero sigue sin haber ningún tooltip o glosario que explique qué es ISTQB o por qué importa el nivel. Un recruiter de RRHH sin trasfondo QA no tiene forma de aprender esto dentro de la plataforma.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Sí, funcionalmente — "Invitar" está inline en la tabla, y favoritos/shortlist funcionan. El problema nuevo es de **consistencia y privacidad** entre las dos pantallas de búsqueda (ver hallazgo #2 abajo).

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| **Exposición de email de candidatos inconsistente entre pantallas** | `empresa/candidatos` (tabs Evaluados/Talento) muestra el email del candidato directo en la tabla y en un link `mailto:`; `empresa/buscar-candidatos` explícitamente **oculta** el email ("...arma tu shortlist sin exponer emails") y solo permite contacto vía invitación server-side | Dos pantallas que cubren el mismo caso de uso (buscar/contactar candidatos) tienen políticas de privacidad de datos opuestas — para un cliente bancario (Banco Continental) esto es una inconsistencia de manejo de PII que un audit de seguridad de RRHH detectaría | Unificar la política: decidir si el email se expone o no, y aplicarlo igual en ambas pantallas | **A** 🚀 |
| Dos pantallas de búsqueda de candidatos (`candidatos` tab "Talento" vs `buscar-candidatos`) | Filtros distintos y no unificados: skills (Selenium/Cypress/etc.) solo existen en `buscar-candidatos`; país se muestra como "🇵🇾 Paraguay" en una pantalla y como código crudo "PY" en la otra | Un recruiter puede no saber cuál pantalla usar, ni por qué los resultados/filtros difieren | Consolidar en una sola pantalla de búsqueda de talento, o diferenciar claramente su propósito en la navegación (ej. "Talento evaluado" vs "Sourcing de contactos opt-in") | **A** |
| Glosario ISTQB | Etiquetas expandidas (`'Foundation Level (CTFL)'`) pero sin tooltip explicando qué es ni por qué importa para QA | Recruiter no-técnico filtra "a ciegas" | Agregar ícono de ayuda (?) con 1-2 líneas explicando cada nivel | **M** |
| Filtro de skills QA | Existe solo en `buscar-candidatos` (Selenium, Cypress, Playwright, Postman, k6, JMeter, SQL, API Testing, Exploratory Testing, Git, CI/CD) | No está disponible en el tab "Talento" de `candidatos`, duplicando esfuerzo de mantenimiento y confundiendo cuál pantalla tiene qué filtro | Mover a un módulo de filtros compartido entre ambas pantallas | **M** |
| Límite 500 resultados (hardcoded) | `exam_results` limitado a `.limit(500)` en `candidatos/page.tsx` | Sigue sin resolverse desde el ciclo anterior; a medida que la plataforma crece, trunca resultados silenciosamente | Paginación real o alerta "mostrando los primeros 500 de N" | **M** (repetido) |
| Comparación de candidatos | ✅ Implementado (hasta 4, side-by-side) — pero **solo existe en `candidatos`**, no en `buscar-candidatos` | Otra asimetría entre las dos pantallas | Portar la función de comparación a `buscar-candidatos` o consolidar pantallas | **B** |
| Empty state sin resultados (`buscar-candidatos`) | `"Sin candidatos para estos filtros"` sin CTA | Oportunidad perdida de sugerir "invitar por email directo" o "ampliar filtros" | Agregar CTA | **B** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin necesitar documentación externa?**
Depende de qué sistema use. El flujo legacy (`empresa/procesos`) tiene 12 tipos de examen predefinidos con nombre y descripción corta (ej. "ISTQB CTFL — Fundamentos de QA") — razonablemente claro. El constructor de pruebas nuevo (`empresa/pruebas`, marcado "Beta") es 100% preguntas de autoría propia de la empresa (opción múltiple / V-F / respuesta corta) — no hay ningún tipo "ISTQB teórico" ni "case study" preconfigurado ahí, contrario a lo que pide el brief de este ciclo. Además, las preguntas de respuesta corta se corrigen por coincidencia de palabras clave y la propia UI advierte que hay que revisar manualmente — es decir, el sistema mismo reconoce que su scoring automático no es confiable del todo.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Sí, ahora bastante más que en el ciclo anterior: hay desglose por sección, ranking con medallas, tiempo empleado, y una vista de comparación. La brecha que queda es la ausencia de aviso de vencimiento próximo (ver abajo) y la falta de límite de reintentos configurable en el flujo legacy.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| **Envío de email de invitación falla en silencio** | Roto (regresión de confianza, no de funcionalidad) | Cuando `EMAIL_SENDING_ENABLED` no es exactamente `'true'`, no se envía ningún email, pero la UI de `candidatos`/`buscar-candidatos` solo revisa el error top-level de la Server Action (que es `null`) y muestra igual el toast de éxito "Invitación enviada a {email}". El recruiter cree que el candidato fue notificado cuando no ocurrió nada. Esto es peor que no tener la feature: genera falsa confianza operativa | Propagar `data.email_sent`/`data.email_error` a la UI y mostrar advertencia explícita ("Invitación creada pero el email no pudo enviarse") | **CRÍTICO** 🚀 |
| Elegir tipo de evaluación (constructor `empresa/pruebas`) | Incompleto respecto al brief | No hay selección de tipo (ISTQB teórico / práctico / case study) — solo preguntas de opción múltiple, V/F o texto corto de autoría de la empresa. El sistema legacy (`empresa/procesos`) sí tiene 12 tipos predefinidos con mezcla teórico/práctico, pero es un sistema distinto y no vinculado al constructor nuevo | Documentar claramente cuál sistema usar según el caso, o fusionar ambos en un único flujo de configuración de evaluación | **A** |
| Dos rutas de invitación con nombres casi idénticos | Confuso | `/invitaciones/[token]` (plural, sistema legacy `empresa_invitaciones`) vs `/invitacion/[token]` (singular, sistema nuevo `empresa_pruebas`) — mismo propósito conceptual, dos URLs distintas por una letra | Unificar nomenclatura o consolidar en una sola ruta que redirija según el token | **M** |
| Fecha límite / timeout de proceso (`empresa/procesos`) | Parcial — repetido del ciclo anterior | Badge binario "Vence: fecha" (gris) → "Venció: fecha" (ámbar); no existe estado intermedio de "vence pronto" (&lt;7 días) pese a que el hallazgo ya se marcó el ciclo pasado | Agregar umbral visual de advertencia antes del vencimiento | **M** (repetido, sin resolver) |
| Invitaciones del constructor nuevo (`empresa/pruebas`) sin expiración | Incompleto | El modelo de invitación de `empresa_pruebas` solo tiene estado Activa/Revocada, sin `expires_at` — a diferencia de `empresa_invitaciones` que sí trackea vencimiento | Agregar campo de expiración también a este modelo, por consistencia | **B** |
| Notificación a la empresa al completar evaluación | ✅ Resuelto | `notifyEmpresaExamCompleted` envía email a los admins/owners de la empresa | — | — |
| Comparación de candidatos por evaluación | ✅ Resuelto | Ranking con medallas 🥇🥈🥉 y desglose por pregunta | — | — |
| Política de reintentos configurable | Incompleto | Existe `max_attempts` en el sistema nuevo (`empresa_pruebas`) pero no en el legacy (`hiring_processes`), que es el que usan los 12 tipos de examen predefinidos | Agregar `max_attempts` a `hiring_processes` para paridad | **B** (repetido) |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Procesos activos / Candidatos evaluados / Total procesos / Cerrados | Sí | Buena cobertura básica, cada card enlaza a su sección | — | Alto |
| Tasa de aprobación | Sí | Muestra "—" sin candidatos; sin umbral de referencia visible (ej. ISTQB CTFL = 65%) | Tooltip con el umbral relevante | Alto |
| Tiempo promedio | Sí | Sin benchmark de plataforma para contextualizar si es rápido o lento | Agregar percentil de referencia | Medio |
| **Visitas al perfil (page views)** | ✅ Resuelto desde el ciclo anterior | Card sin link (única card sin acción asociada) | Enlazar a `/empresas/{id}` o a un detalle de "quién vio tu perfil" (si se puede sin violar privacidad del candidato) | Alto 🚀 |
| **Funnel invitación → vista → completada** | ✅ Resuelto | Solo se renderiza si `total > 0` — una empresa nueva no ve el widget ni sabe que existe hasta que envía su primera invitación | Mostrar el widget vacío con placeholder explicando qué mide, en vez de ocultarlo | Alto 🚀 |
| **Invitaciones activas (badge)** | Sí, pero métrica engañosa | Cuenta invitaciones `pendiente`/`vista` sin distinguir si el email realmente se envió (ver hallazgo crítico del Bloque 3) | Excluir o marcar aparte las invitaciones con `email_error` | Alto |
| Prospectos pendientes | Sí | Bien implementado con badge numérico | — | Medio |
| Comparación entre procesos (tabla de KPIs proceso-a-proceso) | No | Sigue sin existir — sin esta vista, una empresa con varios procesos activos no puede comparar su rendimiento entre ellos | Agregar tabla resumen (pass rate, avg score, tiempo) por proceso | Alto (repetido) |
| Top skills QA disponibles este mes | No | Oportunidad de market intelligence sigue sin explotarse | Widget "Skills más evaluados en AIQUAA este mes" | Medio (repetido) |
| Empty state sin actividad | Sí | Bien diseñado, 2 CTAs claros ("Crear primer proceso" / "Completar perfil") | — | Bueno |
| Banner de bienvenida dismissible | Sí | Buena UX, no vuelve a aparecer tras cerrarlo | — | Bueno |
| Gráficos 6 meses (procesos y candidatos) | Sí | Bien implementados, solo se ocultan si no hay datos | Agregar línea de tendencia | Bueno |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨 La invitación por email falla en silencio y la UI reporta éxito igual** — Con `EMAIL_SENDING_ENABLED` desactivado o mal configurado, `createInvitacionAction`/`resendInvitacionEmailAction` no envían nada, pero como la UI solo mira el error top-level de la Server Action, el recruiter ve "Invitación enviada a {email}" de todos modos. Esto es más grave que el bug del ciclo anterior ("no envía email") porque ahora **miente activamente** sobre el resultado. Tipo: **bug de implementación**. Bloqueante para piloto: **Sí** 🚀.

2. **⚠️ Inconsistencia de privacidad de datos entre las dos pantallas de búsqueda de candidatos** — `empresa/candidatos` expone el email del candidato directamente en la tabla; `empresa/buscar-candidatos` lo oculta explícitamente por diseño. Para un cliente bancario (Banco Continental) con requisitos de manejo de PII, tener dos flujos con políticas opuestas dentro del mismo módulo es un hallazgo que un área de compliance detectaría rápido. Tipo: **bug de diseño / inconsistencia de producto**. Bloqueante para piloto: **Sí** 🚀.

3. **⚠️ El constructor de pruebas nuevo (`empresa/pruebas`) no ofrece tipos de evaluación preconfigurados** — Solo permite preguntas de autoría propia (opción múltiple/V-F/texto corto, con scoring por palabras clave que la propia UI marca como poco confiable). El flujo que sí tiene evaluaciones ISTQB/prácticas predefinidas (`empresa/procesos`) es un sistema paralelo y no vinculado. Un líder técnico que empiece por el constructor nuevo no tiene acceso a evaluaciones ISTQB estándar. Tipo: **gap de funcionalidad / fragmentación de producto**.

4. **⚠️ Perfil público vacío no distingue "recién creado" de "abandonado"** — Todas las secciones de employer branding (stack, beneficios, modalidad, LinkedIn) desaparecen sin dejar rastro si están vacías. Para CLT o Banco Continental evaluando cómo se ve su propia marca empleadora, un perfil mínimo se ve descuidado en vez de "en construcción". Tipo: **problema UX**.

5. **⚠️ Persisten 4 hallazgos menores del ciclo anterior sin resolver**: completitud falsa por `country='PY'` default, sin contador de caracteres en `razon_social`/`nombre_comercial`, sin opción de eliminar logo, sin aviso de "vence pronto" en procesos. Ninguno es bloqueante individualmente, pero acumulados sugieren que el pulido de detalle no se está priorizando entre ciclos. Tipo: **deuda UX acumulada**.

---

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Invitación falla en silencio, UI reporta éxito falso | Bug | Sí 🚀 |
| 2 | Emails de candidato expuestos en una pantalla, ocultos en la otra | Bug de diseño / inconsistencia | Sí 🚀 |
| 3 | Constructor de pruebas nuevo sin tipos de evaluación preconfigurados | Gap de funcionalidad | Parcial (el legacy sí los tiene) |
| 4 | Perfil público vacío sin distinguir estado "en construcción" | Problema UX | Sí (employer branding) 🚀 |
| 5 | Dos pantallas de búsqueda de candidatos con filtros no unificados | Problema UX | Parcial |
| 6 | `country='PY'` genera completitud de perfil falsa | Problema UX (repetido) | No |
| 7 | URL pública con UUID, no slug | Problema UX (repetido) | Parcial |
| 8 | Sin tabla comparativa de KPIs entre procesos | Gap de funcionalidad (repetido) | No |
| 9 | Sin aviso de "vence pronto" en procesos (&lt;7 días) | Problema UX (repetido) | No |
| 10 | Badge "Invitaciones activas" cuenta invitaciones cuyo email nunca se envió | Bug | Parcial |
| 11 | Dos rutas de invitación por token con nombres casi idénticos (`/invitaciones/` vs `/invitacion/`) | Problema UX | No |
| 12 | Sin eliminar logo / sin contador de caracteres en 2 campos | Problema UX menor (repetido) | No |

---

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. El flujo de invitación reporta éxito aunque el email nunca se envíe — una empresa piloto operando con esto durante semanas puede creer que hizo outreach a decenas de candidatos que jamás fueron notificados.
2. La exposición inconsistente de emails de candidatos entre pantallas es un riesgo de compliance para un cliente bancario.
3. El employer branding se ve incompleto/abandonado en perfiles con solo los campos obligatorios completados — mal primer impacto para atraer QA senior.
4. Sin tipos de evaluación preconfigurados en el constructor nuevo, un cliente que empiece ahí no tiene acceso directo a exámenes ISTQB estándar sin descubrir el sistema legacy paralelo.

---

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El funnel de invitaciones y el contador de visitas al perfil, prometidos en el ciclo anterior como diferenciador de pitch, **ya están implementados** — listos para demostrar "X candidatos vieron tu empresa, Y% respondió tu invitación".
- Corregir el hallazgo crítico #1 (email silencioso) convierte una feature ya construida en una que realmente se puede demostrar en vivo frente a CLT sin quedar expuestos.
- Resolver la inconsistencia de privacidad (#2) es un argumento de venta en sí mismo para Banco Continental ("manejo de PII auditable y consistente").
- El desglose por sección y la comparación de candidatos (ambos ya implementados) son diferenciadores fuertes frente a un ATS genérico — vale la pena destacarlos explícitamente en el pitch.

---

### Tickets sugeridos para Jira (aiquaa.atlassian.net)

> **Nota operativa:** esta sesión no tiene un conector de Atlassian/Jira disponible, por lo que **no se pudieron crear los tickets directamente**. Se dejan redactados abajo, listos para copiar/pegar en `aiquaa.atlassian.net`.

**[BUG-CRÍTICO] Invitación a candidato reporta éxito aunque el email no se envíe**
- *Descripción:* `sendInvitacionEmailIfEnabled` (`apps/frontend/src/actions/empresa-invitaciones.ts:42-119`) no envía email cuando `EMAIL_SENDING_ENABLED !== 'true'`, pero las UI de `empresa/candidatos` y `empresa/buscar-candidatos` solo verifican el error top-level de la Server Action y muestran un toast de éxito de todas formas.
- *Pasos para reproducir:* Con `EMAIL_SENDING_ENABLED` desactivado (o no seteado), invitar a un candidato desde cualquiera de las dos pantallas de búsqueda → observar el toast "Invitación enviada" → verificar en la tabla `empresa_invitaciones` que `email_sent=false` y `email_error='EMAIL_SENDING_ENABLED is not true'`.
- *Impacto:* Alto — falsa confianza operativa en el flujo B2B core.
- *Prioridad:* Crítica 🚀

**[BUG] Exposición inconsistente de email de candidatos entre `empresa/candidatos` y `empresa/buscar-candidatos`**
- *Descripción:* una pantalla muestra el email directo en tabla y `mailto:`, la otra lo oculta explícitamente por diseño ("...arma tu shortlist sin exponer emails").
- *Pasos para reproducir:* comparar la tabla "Talento" en `/empresa/candidatos` vs. `/empresa/buscar-candidatos` para el mismo candidato.
- *Impacto:* Alto, riesgo de compliance con cliente bancario.
- *Prioridad:* Alta 🚀

**[UX] Perfil público de empresa sin placeholder para secciones vacías**
- *Descripción:* bloques de employer branding (stack, beneficios, modalidad, LinkedIn) en `/empresas/[id]` desaparecen sin dejar rastro si el campo está vacío.
- *Impacto:* Medio-alto, primera impresión de marca empleadora.
- *Prioridad:* Alta 🚀

**[GAP] Constructor de pruebas nuevo sin tipos de evaluación preconfigurados**
- *Descripción:* `empresa/pruebas` solo permite preguntas de autoría propia; no ofrece plantillas ISTQB/práctica/case-study como sí hace el sistema legacy `empresa/procesos`.
- *Impacto:* Medio, fragmentación de producto.
- *Prioridad:* Media

**[UX] Sin aviso de vencimiento próximo en procesos** *(repetido del ciclo anterior, sin resolver)*
- *Descripción:* el badge de vencimiento en `empresa/procesos` es binario (vigente/vencido), sin estado intermedio "vence en &lt;7 días".
- *Prioridad:* Media

---

### Foco del próximo ciclo (1 hora)

**Prioridad:** Cerrar la brecha de confianza en el flujo de invitaciones + consistencia de privacidad

1. Propagar `email_sent`/`email_error` desde las Server Actions hasta la UI, con aviso explícito cuando el email no se pudo enviar.
2. Unificar la política de exposición de email de candidatos entre `empresa/candidatos` y `empresa/buscar-candidatos` (recomendado: ocultar siempre, usar solo invitación server-side).
3. Agregar placeholders de "sección aún no completada" en el perfil público en vez de omitir bloques vacíos.
4. Evaluar si consolidar `empresa/pruebas` y `empresa/procesos` en un único flujo de configuración de evaluaciones, o al menos documentar/enlazar cuándo usar cada uno.

Este ciclo pasa el foco de "construir lo que falta" a "que lo construido no engañe al recruiter ni exponga datos de forma inconsistente" — clave para sostener la confianza de CLT y Banco Continental como clientes piloto.

---

*Revisión generada automáticamente — 2026-07-29 · Rama: `claude/zen-noether-g1t08r`*
