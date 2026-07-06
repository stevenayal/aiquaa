# Revisión UX — Módulo de Empresas
**Fecha:** 6 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión de código + datos reales de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)
**Ciclo anterior:** [2026-06-27](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología:** `aiquaa.com` no es alcanzable desde este entorno (proxy de red bloquea `CONNECT` a `aiquaa.com:443` con 403 — política del sandbox, no un bug del producto). Como sustituto se hizo (1) revisión estática exhaustiva del código fuente — páginas, Server Actions, migraciones SQL — y (2) consultas **de solo lectura** contra la base de datos real de producción (Supabase, proyecto `aiquaa`) para verificar con datos reales qué tan completo/usado está cada flujo. Todo lo marcado como "confirmado" viene de código leído o de una query ejecutada; nada es un supuesto. No se creó ningún ticket en Jira porque este entorno no tiene integración con Jira habilitada — el backlog accionable queda documentado en las tablas de este informe, listo para copiar a Jira manualmente.

**Nota estructural:** el repo no tiene un backend NestJS/Prisma para este módulo (la ruta `apps/backend` no existe). El stack real es Next.js App Router + Server Actions (`apps/frontend/src/actions/*.ts`) contra Supabase Postgres directamente, con RLS como capa de autorización. El informe usa esa arquitectura como referencia.

---

## 🎉 Qué se corrigió desde el ciclo del 27/06

El ciclo anterior identificó 5 hallazgos críticos. Estado real, verificado en código y en producción:

| # | Hallazgo (27/06) | Estado hoy |
|---|---|---|
| 1 | Invitaciones sin email / token sin ruta | ✅ **Implementado**: `createInvitacionAction` ahora envía email vía Resend y existe `/invitaciones/[token]` (página pública funcional). ⚠️ Pero ver hallazgo nuevo #1 abajo — el envío está apagado por flag. |
| 2 | Directorio público `/empresas` inexistente | ✅ **Implementado**: `/empresas/page.tsx` lista empresas con logo/industria/país/modalidad. |
| 3 | `section_scores` descartado en UI | 🟡 **Parcialmente corregido** — arreglado en `/empresa/candidatos` (tab Evaluados), pero **no** en `/empresa/procesos/[id]` (ver hallazgo nuevo #2). |
| 4 | Campos de perfil faltantes (stack, modalidad, beneficios, LinkedIn) | ✅ **Implementado**: `tech_stack`, `benefits`, `linkedin_url`, `qa_team_size`, `work_mode` ahora existen en el schema y en el formulario de `/empresa/perfil`. |
| 5 | Métricas B2B faltantes (funnel, page views, tasa de respuesta) | ✅ **Implementado**: `profile_views` (RPC de incremento en `/empresas/[id]`) y el funnel enviadas→vistas→completadas ahora se calculan en `getEmpresaDashboardStatsAction` y se muestran en `/empresa` (dashboard). |

Excelente ritmo de ejecución — 4 de 5 críticos resueltos por completo, 1 parcialmente. El foco de este ciclo se corre hacia UX fino y, sobre todo, hacia un hallazgo de negocio que el review de código no podía ver: **el cliente piloto no está usando el producto.**

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Sí, la barra de completitud con anchors a campos faltantes sigue siendo un buen guía. Pero el problema de "completitud falsa" del ciclo anterior **persiste y se confirmó con datos reales**: las 3 empresas en producción (`Aiquaa`, `AIQUAA`, `CLT`) tienen `country='PY'` guardado en base de datos sin que nadie haya tocado el formulario — el campo se precarga en el registro. `country` sigue en `PROFILE_FIELDS`, así que la barra marca ~13% (1 de 8 campos) para una empresa que literalmente no hizo nada.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Antes no se podía evaluar esto sin datos reales. Ahora sí: **las 3 empresas reales en producción tienen el perfil público completamente vacío** — sin descripción, sin logo, sin industria, sin modalidad, sin sitio web. Incluye a **CLT**, el cliente piloto nombrado. Un candidato que visite `/empresas/[id]` de CLT hoy vería una tarjeta prácticamente en blanco. El formulario que soportaría un perfil convincente ya existe (fix del ciclo pasado) — el problema ahora es 100% de activación/adopción, no de producto.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| **Perfil real de CLT vacío** | Confirmado en BD: `industry`, `work_mode`, `description`, `logo_url`, `website_url` = NULL para las 3 empresas reales, incl. el piloto CLT | **A** 🚀 | Onboarding asistido: agendar 15 min con CLT/Banco Continental para completar el perfil juntos, o enviar un recordatorio automático a los 3 días de registro sin completar | Roto (dato real, no de producto) |
| Completitud por defecto | `country` sigue precargado como `'PY'` en el registro y cuenta en el score de completitud → ~13% sin acción del usuario | **M** | Excluir `country` del cálculo de completitud, o no persistirlo hasta el primer guardado explícito | Incompleto (persiste desde 27/06) |
| Contador de caracteres — Razón social / Nombre comercial | `razon_social` (max 120) y `nombre_comercial` (max 80) siguen sin contador visible `{n}/120`, a diferencia de `description` y `benefits` que sí lo tienen | **B** | Agregar el mismo patrón de contador que ya existe en `description`/`benefits` | Incompleto (persiste desde 27/06) |
| Eliminar logo | Sigue sin existir botón "Eliminar logo" — solo upload/reemplazo | **B** | Agregar botón de eliminar con confirmación | Incompleto (persiste desde 27/06) |
| RUC dinámico por país | El campo sigue etiquetado "RUC" siempre, con validación de formato PY hardcodeada, aunque el formulario ya soporta 11 países | **B** | Renombrar dinámicamente (RUC/NIT/CUIT/RFC) según `country` seleccionado | Incompleto (persiste desde 27/06) |
| Empresas de prueba duplicadas en el directorio público | `/empresas` lista "Aiquaa" y "AIQUAA" (2 registros, aparentan ser cuentas de prueba internas) junto a CLT | **M** 🚀 | Limpiar/ocultar cuentas de prueba del directorio público antes de mostrarlo a candidatos reales o a Banco Continental | Roto (dato real) |
| Campos de employer branding (stack, modalidad, beneficios, LinkedIn) | Ya implementados en formulario y schema | — | — | **Completo** ✅ (fix del ciclo anterior, confirmado en código) |
| Directorio público `/empresas` | Ya existe, pagina bien el empty state | — | — | **Completo** ✅ (fix del ciclo anterior) |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Los filtros de país y disponibilidad ahora están expuestos en `/empresa/buscar-candidatos` (fix confirmado en código, no estaba en el review pasado). Los niveles ISTQB siguen sin tooltips explicativos.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Mejoró: invitar candidato ahora es una acción inline (`createInvitacionToCandidateAction`) directamente desde la ficha, sin salir a otro módulo — esto resuelve el hallazgo "flujo fragmentado" del ciclo pasado.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país en Talento | ✅ Implementado (confirmado en código: `filterCountry`, dropdown de países) | — | — | Resuelto (era 🚀 crítico en 27/06) |
| Exportar CSV en tab Evaluados | ✅ Implementado (`exportCSV`, botón "📥 Exportar CSV") | — | — | Resuelto (era 🚀 crítico en 27/06) |
| Invitar candidato inline | ✅ Implementado desde la ficha en ambas vistas (Talento y Sourcing) | — | — | Resuelto (era 🚀 crítico en 27/06) |
| **Todos los candidatos reales son de Paraguay** | Dato real: 91/93 perfiles de candidatos tienen `country='PY'`, 2 tienen el string libre `'Paraguay'` (inconsistencia de datos, no un código ISO) | El filtro de país es funcionalmente decorativo hoy (100% PY) pero la inconsistencia de datos (`'PY'` vs `'Paraguay'`) hará que esos 2 candidatos no aparezcan si se filtra por "Paraguay" | Normalizar `country` a ISO-2 en los 2 registros legacy y agregar validación para que el campo libre no vuelva a ocurrir | **M** |
| Lógica de "favorito" duplicada | Confirmado en código: `toggleFavorite` está reimplementado casi idéntico en `buscar-candidatos/page.tsx` y `candidatos/page.tsx`, sin un service compartido | Riesgo de que un fix aplicado a una vista no se replique en la otra (ya pasó con `section_scores`, ver Bloque 3) | Extraer a una única función en `actions/` o `lib/` | **M** |
| Filtros ISTQB sin descripción | Sigue sin tooltips para `ctfl`/`ctal_ta`/etc. | Un recruiter no técnico no entiende los valores | Mostrar etiquetas completas con tooltip | **A** |
| Comparar candidatos side-by-side | ✅ Implementado ("quick comparison panel" hasta 4 candidatos, confirmado en código) | — | — | Resuelto (no estaba en 27/06) |
| **Uso real: 0 favoritos guardados** | `empresa_favoritos` tiene 0 filas en producción | El shortlist existe y funciona en código, pero ninguna empresa lo usó todavía | Agregar tooltip/onboarding la primera vez que un recruiter entra a Talento QA, explicando qué hace el ⭐ | **M** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
Mejoró: `/invitaciones/[token]` ahora muestra las etiquetas legibles de cada tipo de examen (`EXAM_LABELS`) en vez de strings crudos. `/empresa/procesos/nuevo` ofrece 10 tipos de examen bien definidos (ISTQB, Git teórico+práctico, Performance, API, Base de datos, Infraestructura, Bug Hunt).

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Depende de qué pantalla use el recruiter — y ahí está el hallazgo principal de este bloque.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Invitar candidato por email | 🟡 **Implementado pero probablemente inactivo** — `sendInvitacionEmailIfEnabled` sólo envía si `EMAIL_SENDING_ENABLED === 'true'`. La variable no aparece documentada en `.env.local.example` ni en ningún doc de deploy, y en producción hay **0 filas** en `empresa_invitaciones` (nadie probó el flujo real todavía), por lo que no se puede confirmar desde acá si está encendida en Vercel/Railway | Un recruiter que invite a un candidato hoy puede ver el botón "Invitar" funcionar (se crea el registro) sin que llegue ningún email, sin ningún error visible en la UI | **Confirmar con el equipo si `EMAIL_SENDING_ENABLED=true` está seteado en producción.** Si no lo está, el flujo de invitación está tan roto como en el ciclo anterior desde la perspectiva del candidato invitado | **CRÍTICO** 🚀 |
| Candidato accede a su invitación (`/invitaciones/[token]`) | ✅ Completo — página pública bien diseñada, valida UUID, marca `viewed_at`, muestra estado (pendiente/completada/rechazada) | — | — | Resuelto |
| **Desglose por sección (`section_scores`) — vista "Evaluados"** | ✅ Corregido en `/empresa/candidatos` (tab Evaluados construye `sectionScoresByAttempt` desde `assessment_scores`) | — | — | Resuelto (parcial, ver fila siguiente) |
| **Desglose por sección — vista de detalle de proceso** | 🔴 **Sigue roto** — `/empresa/procesos/[id]/page.tsx` (la pantalla principal para ver resultados de un proceso específico, enlazada desde `/empresa/procesos`) ni siquiera hace `select` de `section_scores` en su query a `exam_results`, y no lee `assessment_scores` para los intentos del motor nuevo. Confirmado en código, línea 412-424 de ese archivo | Un recruiter que entra al detalle de un proceso recién creado ve pass/fail y score total, pero no el desglose por área — la misma limitación que se reportó el 27/06, solo que ahora vive en una pantalla distinta | Replicar la lógica de `sectionScoresByAttempt` (ya escrita en `empresa/candidatos/page.tsx`) en `empresa/procesos/[id]/page.tsx` | **A** |
| Notificación a la empresa al completar evaluación | No confirmado en código (no se encontró trigger/webhook Supabase→Resend para este evento) | La empresa debe entrar manualmente a revisar si hay resultados nuevos | Agregar notificación por email cuando cambia `status` a `completada`/`graded` | **A** 🚀 |
| Datos reales de cobertura de `section_scores` | Query real: solo 49 de 311 `exam_results` con `process_code` tienen `section_scores` no nulo | La mayoría de los exámenes legacy tampoco tienen desglose — no es solo un problema de código, también de datos históricos | Aceptable para exámenes viejos; asegurar que todo examen nuevo (motor `assessments`) lo guarde siempre | **B** |
| Rutas legacy `/employer/*` | Confirmado: `/employer`, `/employer/nuevo`, `/employer/[code]` siguen vivas, funcionales, pero **no están en la navegación** (`Header.tsx`) ni en el flujo de login/registro — son un duplicado más simple y desactualizado de `/empresa/procesos*` | Un enlace viejo (bookmark, email antiguo, buscador) puede llevar a un recruiter a una versión inferior del producto sin que nadie lo note | Redirigir `/employer/*` a `/empresa/procesos*` o eliminarlas | **M** |
| Fecha límite / timeout de proceso | Sin cambios — `expires_at` existe pero sin alerta de "vence pronto" | — | Agregar badge en `/empresa/procesos` | **B** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Preguntas UX clave

Con el funnel y los page views ya implementados (fix del ciclo pasado), la pregunta relevante ahora no es "¿existe la métrica?" sino "¿hay datos reales para mostrarla?".

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Perfil visto por candidatos (`profile_views`) | ✅ Sí (implementado) | No verificable si el contador incrementa correctamente en producción sin generar tráfico real; el código lo hace vía RPC fire-and-forget en `/empresas/[id]` | Confirmar con logs de Vercel que el RPC de incremento no está fallando silenciosamente | Alto |
| Funnel invitación → vista → completada | ✅ Sí (implementado, `getEmpresaDashboardStatsAction`) | **Con datos reales: 0 invitaciones enviadas en producción → el widget nunca se renderiza** (`stats.invitacionesFunnel.total > 0` es la condición para mostrarlo). Ninguna empresa ha visto este widget todavía | Ninguna acción de código — es un problema de adopción, no de UX. Ver hallazgo de negocio en el cierre | Alto (potencial, no realizado) |
| Tasa de aprobación | Sí | Sin cambios desde 27/06 (sin tooltip de umbral ISTQB) | Agregar tooltip "umbral ISTQB CTFL = 65%" | Alto |
| **Uso real del dashboard** | — | De las 3 empresas reales, solo 1 (`AIQUAA`, cuenta interna) tiene siquiera 1 proceso creado. CLT y la segunda cuenta duplicada tienen 0 procesos, 0 invitaciones, 0 favoritos | El dashboard de CLT hoy muestra el empty-state de bienvenida, no las métricas — no hay forma de que la revisión UX de este bloque diga más sin que alguien use el producto | Priorizar una sesión de activación guiada con CLT antes de invertir más en pulir métricas que nadie ve todavía | **Crítico** 🚀 |
| Top skills QA disponibles este mes | No | Sin cambios desde 27/06 | Widget de market intelligence | Medio |
| Comparación entre procesos | No | Sin cambios desde 27/06 | Tabla resumen proceso-a-proceso | Alto |
| Empty state sin actividad | Sí | Bien diseñado, con 2 CTAs — **es literalmente lo único que CLT y la 2ª cuenta ven hoy** | — | Bueno |

---

## ✅ Cierre & registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 El cliente piloto no está usando el producto** — CLT tiene perfil vacío (0 de 8 campos), 0 procesos de contratación creados, 0 invitaciones enviadas. Todo el trabajo de producto del ciclo anterior (funnel, email, directorio) no tiene todavía ningún dato real que lo valide porque nadie lo activó. Tipo: **hallazgo de negocio/adopción**, no de código. Bloqueante real para demostrar valor a Banco Continental.
2. **🚨 El envío de email de invitación probablemente sigue apagado** — `EMAIL_SENDING_ENABLED` no está documentado ni confirmable desde este entorno, y no hay ninguna invitación real en producción para verificar empíricamente si llegó un correo. Si está apagado, el flujo de invitación (que el ciclo pasado marcó como el hallazgo #1) sigue roto en la práctica aunque el código ya lo soporte. Tipo: **bug potencial / config faltante**.
3. **⚠️ Desglose de secciones (`section_scores`) inconsistente entre pantallas** — se corrigió en `/empresa/candidatos` pero **no** en `/empresa/procesos/[id]`, que es la pantalla a la que llega un recruiter justo después de crear un proceso. Tipo: **bug de implementación** (fix parcial, no propagado).
4. **⚠️ Datos de prueba mezclados con datos reales en superficies públicas** — el directorio `/empresas` muestra 2 cuentas que parecen internas/de prueba ("Aiquaa"/"AIQUAA") junto al piloto real. Tipo: **bug de higiene de datos**, visible a candidatos externos.
5. **⚠️ Rutas legacy `/employer/*` húerfanas** — funcionales pero no enlazadas, duplican `/empresa/procesos*` con menos features. Tipo: **deuda técnica / gap UX** (riesgo de confusión, no de bloqueo inmediato).

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | CLT sin perfil ni actividad real | Adopción/negocio | Sí 🚀 |
| 2 | Email de invitación posiblemente apagado (`EMAIL_SENDING_ENABLED`) | Bug/config | Sí 🚀 |
| 3 | `section_scores` no propagado a `/empresa/procesos/[id]` | Bug | Sí |
| 4 | Cuentas de prueba visibles en `/empresas` público | Bug de datos | Sí 🚀 |
| 5 | Completitud de perfil infla con `country='PY'` por defecto | UX problem | Parcial |
| 6 | Sin contador de caracteres en razón social/nombre comercial | UX problem | No |
| 7 | Sin botón "eliminar logo" | UX problem | No |
| 8 | RUC no se adapta al país seleccionado | UX problem | Parcial |
| 9 | `toggleFavorite` duplicado entre 2 vistas | Deuda técnica | No |
| 10 | Inconsistencia `country` ('PY' vs 'Paraguay') en 2 perfiles de candidatos | Bug de datos | No |
| 11 | Rutas `/employer/*` legacy sin enlazar | Deuda técnica | No |
| 12 | Sin notificación a la empresa cuando el candidato completa | Gap funcionalidad | Sí 🚀 |

*(No se crearon tickets en Jira — este entorno no tiene la integración habilitada. La tabla de arriba está lista para copiar como backlog a `aiquaa.atlassian.net`, un ticket por fila, usando la columna "Hallazgo" como título y el detalle de la tabla del bloque correspondiente como descripción.)*

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. **CLT no ha completado su perfil ni creado un proceso** — antes de cualquier demo, alguien del equipo debería sentarse con ellos (o hacerlo por ellos) para dejar el perfil y un proceso de ejemplo funcionando.
2. **Confirmar si los emails de invitación realmente salen** — sin esto, no se puede prometer a Banco Continental que "invitar a un candidato externo" funciona de punta a punta.
3. Antes de mostrar `/empresas` a un cliente, limpiar las cuentas de prueba del directorio público.
4. El desglose por sección debería verse también en la pantalla de detalle de proceso, no solo en el listado general de candidatos.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El funnel de invitaciones y el contador de `profile_views` **ya están construidos** — solo falta que una empresa real los use para tener el primer caso de éxito con datos reales que mostrar en el pitch.
- La comparación side-by-side de candidatos y el filtro de país en Talento QA (ambos implementados este ciclo) son diferenciadores fuertes para el pitch LATAM.
- El sistema de 10 tipos de examen configurables por proceso (incluyendo Bug Hunt con revisión manual) es un punto de venta técnico sólido para RRHH técnicos.
- Punto de atención para el pitch: sin actividad real de CLT, todavía no hay una historia de "así es como una empresa paraguaya contrató con AIQUAA" para contar.

### Foco del próximo ciclo (1 hora)

**Prioridad: activación real del piloto, no más código nuevo**

1. Confirmar el estado de `EMAIL_SENDING_ENABLED` en producción y, si está apagado, encenderlo con un remitente/dominio verificado en Resend.
2. Sesión de 15-20 min con CLT para completar su perfil de empresa y crear un primer proceso de contratación real (o hacerlo el equipo en su nombre con su visto bueno).
3. Propagar el fix de `section_scores` a `/empresa/procesos/[id]` (reutilizar la lógica ya escrita en `empresa/candidatos/page.tsx`).
4. Limpiar/ocultar las cuentas de prueba ("Aiquaa"/"AIQUAA") del directorio público `/empresas` antes de la próxima demo.

Este ciclo, a diferencia del anterior, no necesita más features — necesita que las que ya se construyeron se usen con un cliente real al menos una vez.

---

*Revisión generada automáticamente — 2026-07-06 · Rama: `claude/zen-noether-lxiy79`*
