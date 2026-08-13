# Revisión UX — Módulo de Empresas
**Fecha:** 13 de agosto de 2026
**Ciclo:** Mejora continua · 60 min (ciclo de seguimiento del [27 de junio de 2026](./2026-06-27-modulo-empresas-ux-review.md))
**Reviewer:** QA Lead (revisión automatizada — sesión programada)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología de este ciclo:** el entorno de ejecución de esta sesión no tiene salida de red hacia `aiquaa.com` (bloqueado por el proxy de egress), por lo que **no fue posible navegar el sitio en vivo con un browser real** como pide el prompt del ciclo. En su lugar, la revisión combina dos fuentes verificables:
> 1. **Lectura completa del código fuente** (Next.js Server Actions, páginas, migraciones SQL) — cuatro auditorías paralelas, una por bloque, cada hallazgo citado con `archivo:línea`.
> 2. **Consulta directa a la base de datos de producción** (Supabase, proyecto `aiquaa` / `cbkctkpyxwbufvbwxogp`) para contrastar lo que el código *permite* con lo que las empresas reales *están haciendo hoy*.
>
> No se reportan supuestos: todo lo que sigue está respaldado por código citado o por una consulta SQL ejecutada en este ciclo.

---

## 📊 Dato de contexto que marca todo el ciclo

Antes de entrar bloque por bloque, esto es lo que hay **hoy en producción**:

| Métrica (producción, consultado hoy) | Valor |
|---|---|
| Empresas registradas (`empresas`) | **3** |
| Empresas con `description` completa | **0** |
| Empresas con logo | **0** |
| Empresas con sitio web | **0** |
| Empresas con stack tecnológico | **0** |
| Empresas con beneficios | **0** |
| Empresas con LinkedIn | **0** |
| Visitas acumuladas a perfiles públicos (`profile_views`) | **0** |
| Pruebas propias creadas (`empresa_pruebas`) | **0** |
| Invitaciones a pruebas propias enviadas | **0** |
| Intentos de candidatos (`empresa_intentos`) | **0** |
| Prospectos cargados (`prospects`) | **0** |
| Candidatos guardados en favoritos (`empresa_favoritos`) | **0** |
| Procesos de contratación (`hiring_processes`) | 22 (solo 2 de las 3 empresas tienen alguno) |
| Evaluaciones de proceso completadas (`talent_process_assessments`) | **0** |

**Lectura clave:** el equipo construyó una cantidad considerable de funcionalidad desde el ciclo del 27/06 (directorio público, filtro de país, campos de employer branding, funnel de invitaciones, email vía Resend) — pero **ninguna empresa real la está usando de punta a punta todavía**. El problema de este ciclo ya no es solo "falta construir X", es también "lo construido no se está adoptando". Esto se retoma en el Cierre.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Existe una barra de "Completitud del perfil" con enlaces ancla a los campos faltantes (`apps/frontend/src/app/empresa/perfil/page.tsx:92-102,284-323`) — es una guía razonable, pero es pasiva (el usuario tiene que notarla), no un wizard activo. Dato duro: las 3 empresas reales en producción tienen 0 campos opcionales completos, es decir, en la práctica esta guía no está logrando que nadie termine el perfil.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
El perfil público (`/empresas/[id]`) sí soporta stack tecnológico, modalidad, beneficios y LinkedIn — los campos que el ciclo anterior pedía como faltantes ya están en el esquema y en el formulario. Pero como ninguna empresa los completó, un candidato que hoy visite cualquiera de los 3 perfiles reales vería una tarjeta casi vacía con el banner degradado genérico.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Validación de datos | `updateEmpresaAction` (`actions/empresa-admin.ts:296-330`) no valida nada server-side — confía en lo que envía el cliente. Un cliente que se salte el JS del form puede guardar URLs mal formadas, RUC inválido o textos sin límite | **A** | Validar con Zod en la server action, no solo en el cliente | Incompleto / riesgo |
| RUC por país | El regex de RUC (`perfil/page.tsx:210-220`) solo corre si `country === 'PY'`; para los otros 10 países del selector, el campo se guarda sin ninguna validación | **B** | Adaptar label/validación dinámica (RUC/NIT/CUIT/RFC) según país | Incompleto (arrastrado del ciclo anterior) |
| Validación de logo | Solo se valida tamaño (`file.size > 2MB`, `perfil/page.tsx:161`); el `accept="image/*"` del input es solo una sugerencia del navegador, no hay chequeo server-side de tipo/dimensión pese a que la UI recomienda "400×400px" | **B** | Validar MIME type y dimensiones en el server action de subida | Incompleto |
| Guardado sin re-fetch | Tras guardar, el estado local se actualiza de forma optimista sin volver a leer de Supabase (`perfil/page.tsx:226-228`) | **B** | Revalidar desde el servidor tras guardar | Incompleto |
| Cache del directorio público | `/empresas` tiene `revalidate = 300` (`empresas/page.tsx:32`) — un perfil recién editado puede tardar hasta 5 min en verse actualizado en el listado | **M** | Invalidar cache on-demand al guardar el perfil | Incompleto |
| Perfil público con secciones vacías | Cada sección se renderiza condicionalmente; un perfil sin datos (el caso real hoy de las 3 empresas) muestra solo nombre + banner genérico, sin ningún indicio de "empresa nueva, perfil en construcción" | **A** | Placeholder explícito cuando el perfil está < 50% completo, en vez de secciones que simplemente desaparecen | Incompleto |
| Campos de employer branding (stack, modalidad, beneficios, LinkedIn) | Ya existen en el schema (`empresas.tech_stack`, `benefits`, `work_mode`, `linkedin_url`) y en el formulario | — | — | **Resuelto desde el ciclo anterior** (funcionalidad presente; adopción real = 0/3) |
| Adopción real del perfil | 0 de 3 empresas registradas completó descripción, logo, sitio o cualquier campo opcional | **A** | Onboarding activo (ver Cierre) en vez de solo barra de completitud pasiva | Roto en la práctica |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
No completamente. Los niveles ISTQB se listan como opciones sin tooltip ni descripción (`buscar-candidatos/page.tsx:372`) — un recruiter de RRHH sin trasfondo QA no sabe qué diferencia hay entre niveles.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Parcialmente, y con un problema de confianza: la copy del buscador promete "arma tu shortlist sin exponer emails" (`buscar-candidatos/page.tsx:307-309`), pero la pestaña "Evaluados"/"Talento" de `/empresa/candidatos` sí muestra el email y un link `mailto:` directo (`candidatos/page.tsx:902-971,1385-1391`). La promesa de privacidad no se cumple de forma consistente en toda la plataforma.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país | Presente en ambas pantallas de búsqueda | — | — | **Resuelto** desde el ciclo anterior (antes marcado 🚀 bloqueante) |
| Fuga de email inconsistente | El copy dice "sin exponer emails" pero las pestañas Talento/Evaluados de `/empresa/candidatos` muestran `mailto:` directo | Contradice la promesa de privacidad al candidato — riesgo de confianza y de mensaje comercial | Unificar: exponer email solo cuando el candidato aceptó explícitamente una invitación, nunca en el directorio de descubrimiento | **A** 🚀 |
| Niveles ISTQB sin explicación | Valores técnicos sin tooltip | Recruiter no-QA no entiende el filtro | Agregar tooltip/descripción corta por nivel | **A** (arrastrado del ciclo anterior) |
| Filtro de experiencia/seniority | No existe en ningún lado del código (confirmado, no solo ausente en UI) | Es uno de los criterios más pedidos por un recruiter real | Agregar campo de años de experiencia al perfil de candidato + filtro | **A** |
| Favoritos vs. Prospectos desconectados | `empresa_favoritos` (shortlist de búsqueda) y `prospects` (`/empresa/prospectos`) son sistemas totalmente separados sin cruce de datos ni navegación entre ellos | Un candidato guardado como favorito en la búsqueda nunca aparece en Prospectos, y viceversa — el recruiter pierde contexto | Unificar en un solo pipeline de candidatos con estado | **A** |
| Etiquetas de país inconsistentes | `/empresa/candidatos` muestra banderas y nombre completo; `/empresa/buscar-candidatos` muestra el código crudo | Se ve como dos productos distintos | Unificar componente de label de país | **B** |
| Skills fijos (hardcoded) | Lista cerrada de 11 skills (`candidateDirectory.ts:64-76`); las skills libres que el candidato cargó fuera de esa lista no son filtrables | Un recruiter no puede buscar por una skill que no está en la lista curada | Generar la lista de opciones desde los valores reales en `profiles`, no un hardcode fijo | **M** |
| RPC de sourcing (`get_empresa_candidate_sourcing`) | Existía un comentario histórico de migración indicando que la función había fallado en aplicarse a producción | Verificado hoy vía SQL: **la función existe y está activa en producción** | — | Resuelto (ya no es riesgo) |
| Estados vacíos | Los tres directorios (búsqueda, candidatos, prospectos) tienen mensajes explícitos de "sin resultados", diferenciando "sin datos" de "sin coincidencias para el filtro" | — | — | Bien implementado |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
No del todo — no hay forma de elegir un "tipo" de evaluación reconocible (ISTQB teórico / práctico / case study); el constructor propio solo ofrece 3 mecánicas de pregunta genéricas (opción múltiple, verdadero/falso, texto corto).

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Parcialmente: hay score, ranking entre candidatos y desglose por pregunta — mejor que en el ciclo anterior — pero las respuestas de texto libre solo se autocalifican por coincidencia de palabras clave, marcadas "a revisar".

### Hallazgo estructural del ciclo (nuevo)

El código revela que **existen tres subsistemas de evaluación paralelos y con comportamiento distinto**, construidos en momentos distintos:
1. **`empresa_pruebas`** — constructor propio de pruebas de la empresa (`/empresa/pruebas/*`). Es el que una empresa usaría hoy para crear su propia evaluación.
2. **`empresa_invitaciones`** — catálogo fijo de exámenes de la plataforma (ISTQB, Git, Performance, etc.), invitado por email.
3. **`exam_results` / bug-hunt** — evaluado manualmente vía `/empresa/evaluar/[resultId]`.

Cada uno tiene su propia lógica de notificación por email, su propia página de resultados y, en el caso de las invitaciones por token, **dos páginas de landing distintas y con lógica distinta** (`/invitacion/[token]` consulta la tabla directo; `/invitaciones/[token]` usa un RPC) para conceptos que deberían ser el mismo flujo.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Fragmentación en 3 subsistemas | — | Comportamiento de email, notificación y resultados difiere según qué "tipo" de evaluación se usó, sin que la UI lo explique | Unificar en un solo modelo de "evaluación" con tipo configurable, o al menos documentar/alinear el comportamiento entre los 3 | **CRÍTICO** 🚀 |
| Email al invitar (constructor propio `empresa_pruebas`) | Roto | `createPruebaInvitacionAction` nunca llama a Resend — solo genera un link para copiar/pegar manualmente | Conectar el envío de email vía Resend, igual que ya existe en el flujo de catálogo fijo | **A** 🚀 |
| Email al invitar (catálogo fijo `empresa_invitaciones`) | Resuelto desde el ciclo anterior, con matiz | Sí envía vía Resend, pero gateado por `EMAIL_SENDING_ENABLED`; si está apagado, el recruiter ve "invitación creada" sin saber que el email no salió hasta que revisa el estado "No entregado" después | Mostrar en el momento de creación si el envío de email está activo en el entorno | **A** |
| Notificación a la empresa al completar | Parcial | Solo está conectada al flujo de catálogo fijo (`exams.ts`); el flujo de constructor propio (el más usado) no notifica nada — la empresa debe entrar manualmente a revisar resultados | Conectar `empresa-result-notifications.ts` también a `submitIntentoAction` | **A** 🚀 |
| Configurar tipo de evaluación | Incompleto | No hay selector de ISTQB teórico / práctico / case study; solo 3 mecánicas de pregunta genéricas | Agregar tipos de evaluación con metadata (duración esperada, qué mide) | **A** (arrastrado del ciclo anterior) |
| Resultados y comparación | Mejorado | Ranking entre candidatos y desglose por pregunta ya existen (`resultados/page.tsx:77-79,142-219,287-319`) | Agrupar por categoría/sección, no solo por pregunta individual | **M** |
| Calificación de texto libre | Parcial | Solo heurística por palabras clave, marcada "a revisar" en la UI | Aceptable como MVP, pero debería ser explícito para el recruiter que ese score no es definitivo | **M** |
| Vencimiento configurable | Backend listo, UI no | `expires_at` y `max_attempts` existen y se validan en el servidor, pero el formulario de invitación no expone esos campos | Exponer los campos ya soportados en el backend | **M** (quick win) |
| Landing de invitación duplicada | Bug | Dos rutas (`/invitacion/[token]` y `/invitaciones/[token]`) con lógica y `EXAM_LABELS` distintos para el mismo concepto | Consolidar en una sola ruta | **A** |
| Adopción real | — | 0 pruebas creadas, 0 invitaciones, 0 intentos en producción — este flujo nunca se completó de punta a punta con una empresa real | Ver recomendación de piloto guiado en el Cierre | **CRÍTICO** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Hallazgos generales

El dashboard (`apps/frontend/src/app/empresa/page.tsx`) ya incorpora lo que el ciclo anterior pedía como crítico: contador real de `profile_views`, funnel de invitaciones (enviadas → vistas → completadas) y gráficos de tendencia a 6 meses, todo alimentado en vivo desde Supabase vía `getEmpresaDashboardStatsAction` (`actions/employer.ts:492-708`, `Promise.all` sobre 4 tablas). El problema de este ciclo ya no es "falta construir el dashboard", es que **hoy no tiene datos que mostrar** (ver tabla de contexto) y que su jerarquía visual no está pensada para una empresa que arranca en cero.

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Grilla de 9 tarjetas de métricas | Sí | Se renderiza completa (llena de ceros/"—") *antes* del CTA de estado vacío, en vez de mostrarse después de la orientación | Cuando `totalProcesses === 0`, priorizar el CTA de bienvenida por encima de la grilla de métricas | Alto |
| CTA de estado vacío ("Empezá a reclutar talento QA") | Sí | Buen diseño (2 botones claros), pero compite en la misma pantalla con 9 tarjetas en cero y un banner de bienvenida descartable para siempre vía `localStorage` | Reordenar: bienvenida → CTA → métricas (cuando aplique) | Alto |
| Funnel de invitaciones (enviadas→vistas→completadas) | Sí | Implementado según lo pedido en el ciclo anterior — hoy vacío por falta de uso real | — | **Crítico para el pitch** cuando haya datos 🚀 |
| Visitas al perfil (`profile_views`) | Sí | Contador real, verificado incrementando en `/empresas/[id]:56` — hoy en 0 porque nadie visita perfiles vacíos | — | **Crítico para el pitch** 🚀 |
| Bug de layout shift | — | El *skeleton* de carga renderiza 8 tarjetas (`Array.from({length:8})`, `page.tsx:256`) pero el estado cargado renderiza 9 — salto visible de layout al terminar de cargar | Igualar el conteo del skeleton al de las tarjetas reales | Bug menor |
| Comparación entre procesos (KPI proceso a proceso) | No | Sigue sin existir | Tabla resumen de pass rate / score promedio por proceso | Alto (arrastrado del ciclo anterior) |
| Top skills QA del mes (market intelligence) | No | Sigue sin existir | Widget de skills más evaluadas en la plataforma | Medio 🚀 (diferenciador de venta) |
| Acciones rápidas | Sí | 7-8 enlaces bien cubiertos (`BASE_LINKS`, `page.tsx:27-70`) más gestión de usuarios para admin/owner | — | Bueno |

---

## ✅ Cierre & registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 Fragmentación en tres subsistemas de evaluación paralelos** (`empresa_pruebas`, `empresa_invitaciones`, `exam_results`), cada uno con reglas de email/notificación distintas y hasta rutas de landing duplicadas. Tipo: **bug arquitectónico**.
2. **🚨 Adopción real = 0.** Ninguna de las 3 empresas registradas en producción completó su perfil, creó una prueba propia, envió una invitación o guardó un candidato favorito, pese a que la funcionalidad ya existe. Tipo: **gap de producto / go-to-market**, no de UX pura.
3. **🚨 Fuga de email inconsistente** en `/empresa/candidatos` contradice la promesa explícita de privacidad del buscador ("sin exponer emails"). Tipo: **bug + riesgo de confianza**.
4. **⚠️ Validación de perfil solo en el cliente** — `updateEmpresaAction` no valida nada server-side. Tipo: **bug de seguridad/calidad de datos**.
5. **⚠️ El flujo de evaluación que una empresa usaría hoy (constructor propio) no envía email ni notifica resultados** — solo el flujo de catálogo fijo, menos relevante, lo tiene resuelto. Tipo: **gap de funcionalidad**, arrastrado y agravado desde el ciclo anterior.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | 3 subsistemas de evaluación con comportamiento inconsistente | Bug arquitectónico | Sí 🚀 |
| 2 | Adopción real de 0/3 empresas en todos los flujos | Gap producto/GTM | Sí 🚀 |
| 3 | Fuga de email en directorio de candidatos | Bug + confianza | Sí 🚀 |
| 4 | Sin validación server-side en perfil | Bug | Parcial |
| 5 | Constructor propio de pruebas sin email ni notificación | Gap funcionalidad | Sí 🚀 |
| 6 | Landing de invitación duplicada (2 rutas distintas) | Bug | Parcial |
| 7 | Sin filtro de experiencia/seniority | Gap funcionalidad | Sí |
| 8 | RUC solo validado para Paraguay | Bug menor | No |
| 9 | Layout shift en dashboard (8 vs 9 tarjetas) | Bug menor | No |
| 10 | Sin comparación entre procesos ni "top skills del mes" | Gap funcionalidad | No |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. Si CLT o Banco Continental se registraran hoy, el flujo de evaluación que naturalmente usarían (constructor propio) **no les avisa a ellos ni al candidato por email** — todo dependería de compartir links a mano.
2. Su perfil público arrancaría vacío y sin guía activa que los empuje a completarlo — el patrón real observado en las 3 empresas existentes.
3. El directorio de candidatos filtra la promesa de privacidad de forma inconsistente, lo cual es un riesgo si se usa como argumento de venta ("protegemos el email del candidato").
4. La fragmentación entre los 3 subsistemas de evaluación generaría confusión y soporte manual durante un piloto guiado.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El dashboard con funnel de invitaciones y visitas al perfil **ya está construido** — era justamente el foco pedido en el ciclo anterior. Solo falta que una empresa piloto genere actividad real para poder mostrarlo en una demo con datos reales.
- El filtro de país y los campos de employer branding (stack, modalidad, beneficios) ya están resueltos — reduce fricción para el pitch LATAM.
- El backend ya soporta vencimiento configurable de evaluaciones (`expires_at`, `max_attempts`) — falta solo exponerlo en el formulario, es un quick win de alto impacto de venta.
- Conectar email + notificación al flujo de constructor propio desbloquearía, de una sola vez, el caso de uso B2B core con el mínimo esfuerzo (la infraestructura de Resend ya existe y funciona en el otro flujo).

### Foco del próximo ciclo (1 hora)

**Prioridad: cerrar la brecha del constructor propio de pruebas + activar la primera empresa piloto real**

1. Conectar Resend a `createPruebaInvitacionAction` y a `submitIntentoAction`, reusando la infraestructura de `lib/resend.ts` que ya funciona en el otro flujo.
2. Agregar validación server-side (Zod) a `updateEmpresaAction`.
3. Corregir la fuga de email en `/empresa/candidatos` (pestañas Talento/Evaluados) para que coincida con la promesa de privacidad del buscador.
4. Diseñar un onboarding activo de 3 pasos para el primer login de una empresa (no solo la barra de completitud pasiva) — dado que hoy 0/3 empresas reales completaron su perfil por su cuenta.

Este ciclo desbloquea el caso de uso B2B core end-to-end y prepara el terreno para activar a CLT o Banco Continental como primer piloto con datos reales.

---

## 🎫 Tickets listos para Jira

> **Nota de acceso:** esta sesión no tiene una integración de Jira configurada (no hay herramienta MCP de Jira disponible en este entorno), por lo que **no fue posible crear los tickets directamente en `aiquaa.atlassian.net`**. Quedan redactados abajo, listos para copiar y pegar.

**[BUG-CRÍTICO] El constructor propio de pruebas no envía email al invitar candidatos**
- *Descripción:* `createPruebaInvitacionAction` (`apps/frontend/src/actions/empresa-pruebas.ts:480-516`) crea la invitación en `empresa_prueba_invitaciones` pero nunca llama a Resend; el recruiter solo obtiene un link para copiar/pegar manualmente.
- *Pasos para reproducir:* Ir a `/empresa/pruebas/nuevo`, crear una prueba, generar una invitación para un candidato. Confirmar en el código que no hay ningún email saliente para este flujo.
- *Impacto:* Alto — es el flujo que una empresa piloto usaría en la práctica.
- *Prioridad:* Crítica.

**[BUG] Fuga de email inconsistente contradice la promesa de privacidad del buscador**
- *Descripción:* El copy de `/empresa/buscar-candidatos` promete "arma tu shortlist sin exponer emails" (`buscar-candidatos/page.tsx:307-309`), pero `/empresa/candidatos` muestra `mailto:` directo en las pestañas Talento/Evaluados (`candidatos/page.tsx:902-971,1385-1391`).
- *Impacto:* Medio-alto — riesgo de confianza y de contradicción con mensaje comercial.
- *Prioridad:* Alta.

**[BUG] Landing de invitación por token duplicada en dos rutas distintas**
- *Descripción:* `/invitacion/[token]` y `/invitaciones/[token]` implementan el mismo concepto con lógica de datos y `EXAM_LABELS` distintos.
- *Impacto:* Medio — riesgo de inconsistencia y mantenimiento duplicado.
- *Prioridad:* Alta.

**[GAP] Sin validación server-side en la actualización de perfil de empresa**
- *Descripción:* `updateEmpresaAction` (`apps/frontend/src/actions/empresa-admin.ts:296-330`) confía en la validación del cliente; un request directo puede saltarse límites de longitud y formato de URL/RUC.
- *Impacto:* Medio — calidad de datos y seguridad.
- *Prioridad:* Alta.

**[GAP] Sin notificación a la empresa cuando un candidato completa una prueba propia**
- *Descripción:* `empresa-result-notifications.ts` solo está conectado al flujo de catálogo fijo (`actions/exams.ts:166`), no a `submitIntentoAction` del constructor propio.
- *Impacto:* Alto — la empresa debe recordar entrar manualmente a revisar resultados.
- *Prioridad:* Alta.

**[GAP] Sin onboarding activo para completar el perfil de empresa**
- *Descripción:* Datos de producción muestran 0 de 3 empresas con perfil completo pese a que la barra de completitud existe. La guía actual es pasiva.
- *Impacto:* Alto — afecta directamente la primera impresión ante un candidato piloto.
- *Prioridad:* Media-alta.

---

*Revisión generada automáticamente — 2026-08-13 · Rama: `claude/zen-noether-7n5jtq` · Ciclo de seguimiento de [2026-06-27](./2026-06-27-modulo-empresas-ux-review.md)*
