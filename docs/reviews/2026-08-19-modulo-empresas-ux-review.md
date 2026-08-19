# Revisión UX — Módulo de Empresas (Ciclo 2)
**Fecha:** 19 de agosto de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión de código + datos de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, RLS de Supabase) **más consulta directa a la base de datos de producción** (proyecto Supabase `aiquaa`, `cbkctkpyxwbufvbwxogp`) para verificar uso real, no solo existencia de código. No se realizó walkthrough interactivo en navegador (sin credenciales de una cuenta empresa real disponibles en este ciclo). Este ciclo parte de la revisión previa del [27 de junio de 2026](./2026-06-27-modulo-empresas-ux-review.md) y verifica qué de lo reportado ahí sigue vigente.

**Hallazgo transversal del ciclo:** la mayoría de los bugs/gaps críticos reportados en junio **ya están resueltos a nivel de código**. Pero los datos reales de producción muestran que el módulo, aun funcionando, **no está siendo usado por los clientes piloto**: CLT no tiene ningún usuario que pueda administrar su cuenta, Banco Continental no existe como empresa registrada, y el pool de candidatos visibles a empresas es de 1 sobre 146 perfiles. El riesgo ya no es "¿funciona el código?" sino "¿alguien lo está usando de verdad?".

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
No se pudo verificar interactivamente en este ciclo. Los campos de employer branding pendientes en junio (`tech_stack`, `work_mode`, `benefits`, `linkedin_url`) ya existen en el esquema y se renderizan en la vista pública — el formulario de edición existe, pero no se confirmó su usabilidad en vivo.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
No, para los dos clientes piloto reales: el registro de **CLT en la tabla `empresas` está 100% vacío** (sin logo, descripción, sitio web, industria, tamaño de equipo, modalidad, stack, beneficios) y **Banco Continental SAECA ni siquiera está dado de alta**.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Cuenta de CLT sin usuario | La empresa "CLT" (`empresas.id=765269d3…`) tiene **0 filas en `empresa_miembros`** — nadie puede iniciar sesión para administrar ni completar su perfil | **A** 🚀 | Verificar/reenviar invitación de owner a un contacto real de CLT antes de cualquier demo | **Roto** (bloqueante de piloto) |
| Perfil de CLT vacío | 0% de campos opcionales completos: sin logo, descripción, industria, `team_size`, `work_mode`, `tech_stack`, `benefits`; `profile_views = 0` | **A** 🚀 | Onboarding asistido: sesión de 15 min con CLT para completar el perfil | Incompleto (dato real) |
| Banco Continental SAECA no existe | El segundo cliente piloto mencionado en el pitch **no tiene registro en `empresas`** | **A** 🚀 | Crear y completar el perfil antes de cualquier conversación comercial | Roto/faltante |
| Campos de employer branding (stack, modalidad, beneficios, LinkedIn) | Ya implementados en el modelo de datos y en la vista pública `/empresas/[id]` (confirmado en código: `tech_stack`, `work_mode`, `benefits`, `linkedin_url` se renderizan) | — | Sin acción de código; falta solo adopción real | **Completo** (código) / sin uso (dato) |
| RUC expuesto públicamente | La política RLS `empresas_public_select` (`qual: true`) expone **todas** las columnas de `empresas`, incluido el `ruc`, a cualquier visitante no autenticado | **M** | Evaluar si el RUC debe ser público; si no, mover a una vista/columna restringida | Riesgo de privacidad no reportado antes |
| URL pública con UUID | Sigue siendo `/empresas/<uuid>`, no un slug memorable — sin cambios desde junio | **M** | Generar slug desde `nombre_comercial` | Incompleto (sin cambios) |
| Directorio público de empresas | `/empresas` ya existe (fix de junio confirmado) pero **sin buscador ni filtros** — solo listado plano | **M** | Agregar input de búsqueda + filtro por industria/país | Parcial |
| Validaciones de input (longitud, formato URL/imagen) | No verificado en este ciclo (requiere walkthrough interactivo) | — | Pendiente para próximo ciclo con credenciales de prueba | No verificado |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Mejoró: el filtro ISTQB ahora usa etiquetas completas (`ISTQB_LEVEL_LABELS`) en vez de códigos crudos como `ctal_ta`. No es un tooltip, es texto inline — suficiente pero mejorable.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Sí a nivel de UI: ahora hay un botón "Invitar" inline en la ficha del candidato que abre un modal (`createInvitacionToCandidateAction`) — el gap de junio ("hay que ir a otro módulo") está resuelto. **Pero el problema real es otro: casi no hay candidatos que mostrar.**

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Pool de candidatos visible a empresas | Solo **1 de 146 perfiles** tiene `talent_visible_to_empresas = true` en producción | Sin importar cuán buenos sean los filtros, una empresa que busque hoy ve ~1 resultado real | Revisar el opt-in de candidatos: ¿el default debería ser visible, o falta comunicar el beneficio de activarlo? | **A** 🚀 |
| Filtro por país | Implementado (`filterCountry`) | Pendiente en junio, ahora resuelto | — | Completo |
| Botón "Invitar" inline | Implementado, abre modal de invitación | Pendiente en junio, ahora resuelto | — | Completo |
| Etiquetas ISTQB | Texto completo en vez de código crudo | Falta explicar qué certifica cada nivel para un RRHH sin contexto técnico | Agregar tooltip/descripción breve por nivel | **B** |
| Exportar CSV de resultados | **No implementado** | Banco Continental necesita reportar a RRHH con datos exportables — sigue bloqueante | Agregar botón "Exportar CSV" en tabs Evaluados/Talento | **A** 🚀 |
| Toggle "solo disponibles" | No existe como control dedicado; hay un dropdown general `disponibilidad` (Activo/Pasivo/No disponible) que cumple una función similar | Menor prioridad que se pensaba en junio, dado que ya hay un filtro equivalente | Evaluar si vale la pena un toggle adicional de un clic | **B** |
| Comparación side-by-side de candidatos | No implementada | Sin cambios desde junio | Checkbox multi-select + modal comparativo (máx. 3) | **M** |
| Solo 3 de 146 perfiles con `open_to_work=true` | Además del filtro de visibilidad, muy pocos candidatos se marcan como disponibles | Refuerza el problema de pool: incluso ignorando visibilidad a empresas, la oferta activa es mínima | Campaña a la comunidad para incentivar marcar disponibilidad/visibilidad | **A** 🚀 |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
No verificado a fondo en este ciclo (requiere UI interactiva); el problema reportado en junio (tipos de examen sin descripción) no se reverificó.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Parcialmente — mejoró para una fuente de datos pero no para la otra (ver hallazgo #4 abajo).

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Invitar candidato (con email real) | **Completo** (código) | `createInvitacionAction` ahora envía email vía Resend con link `/invitaciones/[token]`; el gap crítico de junio está resuelto | Confirmar que `EMAIL_SENDING_ENABLED` esté activo en el entorno de producción | **A** (verificación) |
| Uso real del flujo de invitación | **Sin uso** | `empresa_invitaciones` tiene **0 filas en toda la base de producción** — el flujo arreglado nunca fue probado extremo a extremo con un candidato real | Ejecutar un smoke test manual end-to-end (empresa invita → candidato recibe email → completa) antes de cualquier demo | **CRÍTICO** 🚀 |
| Pruebas propias de la empresa (`empresa_pruebas`) | **Completo** (código) | Pipeline completo: crear prueba → preguntas → invitación → candidato → resultados, sin pasos rotos identificados en el código | Mismo riesgo que arriba: `empresa_pruebas`, `empresa_preguntas`, `empresa_prueba_invitaciones`, `empresa_intentos` tienen **0 filas** — nunca se usó en producción | **A** 🚀 |
| Desglose por sección (`section_scores`) | **Parcialmente roto** | Se muestra correctamente para resultados basados en `exam_results` (92 de 495 registros tienen el dato), pero en `apps/frontend/src/actions/employer.ts:417` sigue hardcodeado `section_scores: null` para resultados basados en `assessment_attempts` | Completar el mapeo también para `assessment_attempts` | **A** |
| Notificación a la empresa cuando el candidato completa | No reverificado | Reportado como roto en junio; no se pudo confirmar el código específico en este ciclo | Confirmar en el próximo ciclo si existe el trigger Supabase→Resend | **M** |
| Timeout / fecha límite de prueba propia | Existe en esquema (`expires_at`, `max_attempts` en `empresa_prueba_invitaciones`) | Sin datos reales (0 filas) para confirmar el comportamiento en producción | Validar con un test manual una vez haya uso real | **B** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Visitas al perfil (`profileViews`) | **Sí** (fix confirmado, `StatCard`) | Implementado correctamente, pero CLT muestra 0 porque nadie visitó su perfil vacío | Sin acción de código | Alto (una vez haya datos) |
| Funnel de invitaciones (enviadas→vistas→completadas) | **Sí** (fix confirmado, `FunnelWidget` + tasa de respuesta) | Bien implementado, pero no hay datos reales que mostrar (0 invitaciones en producción) | Sin acción de código | **Crítico para el pitch** — pero vacío hoy |
| `company_name` inconsistente en `hiring_processes` | Parcial | Procesos creados para CLT (ej. "Analista Mid CLT") muestran `company_name = "AIQUAA"` en vez de "CLT" | Revisar por qué `company_name` no se deriva de `empresas.razon_social` vía `empresa_id`; puede confundir reportes multi-tenant | Alto (integridad de datos) |
| Top skills QA disponibles este mes | **No** | Sin cambios desde junio | Widget de market intelligence usando `qa_skills` de `profiles` | Medio |
| Comparación entre procesos (tabla KPI) | **No** | Sin cambios desde junio | Tabla resumen proceso-a-proceso | Alto |
| Gráficos de tendencia (6 meses) | Sí (según revisión de junio) | No reverificado en este ciclo | — | Bueno |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 El cliente piloto CLT no puede usar su propia cuenta** — el registro de CLT en `empresas` tiene **cero usuarios** (`empresa_miembros`) y un perfil **100% vacío**. Nadie puede completar el perfil ni operar la cuenta hoy, aunque el formulario funcione. Tipo: **gap operativo/onboarding**, no de código.
2. **🚨 Banco Continental SAECA no existe en la plataforma** — el segundo cliente piloto del pitch no tiene ningún registro en `empresas`. Tipo: **gap operativo**.
3. **🚨 El pool de candidatos visibles a empresas es de 1 sobre 146 perfiles** — toda la inversión en filtros de búsqueda (país, ISTQB, invitar inline) es irrelevante si no hay candidatos que mostrar. Tipo: **gap de producto/adopción**.
4. **⚠️ El flujo de invitaciones y las pruebas propias de empresa están arreglados en código pero tienen cero uso real** — `empresa_invitaciones` y `empresa_pruebas` en 0 filas cada una. El riesgo es desplegar a un cliente piloto una función nunca ejercitada de punta a punta. Tipo: **riesgo de calidad no probado**.
5. **⚠️ `section_scores` sigue descartado para una de las dos fuentes de datos** (`employer.ts:417`, `assessment_attempts`) y `company_name` en `hiring_processes` no refleja la empresa real. Tipo: **bug puntual**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | CLT sin usuario administrador (`empresa_miembros` vacío) | Gap operativo | Sí 🚀 |
| 2 | Banco Continental no registrado | Gap operativo | Sí 🚀 |
| 3 | Pool de candidatos visible ≈ 0 (1/146) | Gap de producto | Sí 🚀 |
| 4 | Invitaciones/pruebas propias sin uso real (riesgo no probado) | Riesgo de calidad | Sí 🚀 |
| 5 | `section_scores` null en `assessment_attempts` | Bug | Parcial |
| 6 | `company_name` inconsistente en `hiring_processes` | Bug de datos | Parcial |
| 7 | Sin exportación CSV | Gap de funcionalidad | Sí 🚀 |
| 8 | Directorio `/empresas` sin buscador/filtro | UX problem | No |
| 9 | RUC expuesto públicamente vía RLS | Riesgo de privacidad | No |
| 10 | URL pública con UUID (no slug) | UX problem | Parcial |

### Tickets propuestos (listos para crear en Jira)

> No se tuvo acceso a la integración de Jira (`aiquaa.atlassian.net`) en este ciclo automatizado. Se dejan los tickets redactados abajo para que se creen manualmente; título y descripción siguen el formato estándar del equipo.

**[BLOQUEANTE] Onboarding real del piloto CLT**
*Descripción:* CLT existe como empresa (`empresas.id=765269d3-b928-4059-a27b-fcdbb61b24b9`) pero no tiene ningún usuario en `empresa_miembros` y su perfil está vacío. Nadie puede operar la cuenta.
*Pasos para reproducir:* Consultar `select * from empresa_miembros where empresa_id='765269d3-b928-4059-a27b-fcdbb61b24b9'` → 0 filas.
*Impacto:* Alto — bloquea la demo/uso real con el primer cliente piloto.
*Prioridad:* Crítica 🚀

**[BLOQUEANTE] Dar de alta a Banco Continental SAECA**
*Descripción:* El segundo cliente piloto mencionado en el pitch de Moonshot no tiene registro en `empresas`.
*Impacto:* Alto — imposible demostrar el producto a este cliente hoy.
*Prioridad:* Crítica 🚀

**[BUG] `assessment_attempts` descarta `section_scores`**
*Descripción:* `apps/frontend/src/actions/employer.ts` línea ~417 hardcodea `section_scores: null, learning_objectives: null` al normalizar resultados provenientes de `assessment_attempts`, mientras que sí se propaga correctamente para `exam_results`.
*Pasos para reproducir:* Revisar un resultado de proceso cuyo origen sea `assessment_attempts` en `/empresa/candidatos` → sin desglose por sección.
*Impacto:* Medio-alto — el recruiter pierde información clave para decidir.
*Prioridad:* Alta

**[BUG] `company_name` en `hiring_processes` no refleja la empresa real**
*Descripción:* Procesos vinculados a `empresa_id` de CLT (ej. "Analista Mid CLT") muestran `company_name = "AIQUAA"`.
*Impacto:* Medio — puede confundir reportes/dashboards cuando haya más de una empresa activa.
*Prioridad:* Media

**[GAP] Exportación CSV de resultados**
*Descripción:* No existe botón de exportación en `/empresa/candidatos` ni en el directorio de talento.
*Impacto:* Alto para Banco Continental (proceso formal de RRHH requiere reportes exportables).
*Prioridad:* Alta 🚀

**[GAP] Sin candidatos visibles para búsqueda de empresas**
*Descripción:* Solo 1 de 146 perfiles tiene `talent_visible_to_empresas=true`. Evaluar si el default debería cambiar o si falta comunicar el beneficio de activarlo a la comunidad.
*Impacto:* Crítico — sin este dato, ninguna mejora de búsqueda importa.
*Prioridad:* Crítica 🚀

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. CLT no tiene ningún usuario que pueda administrar su cuenta ni completar su perfil.
2. Banco Continental SAECA no está dado de alta en la plataforma.
3. El pool de candidatos visible a empresas es prácticamente nulo (1/146).
4. Los flujos de invitación y pruebas propias, aunque arreglados en código, nunca fueron ejercitados con datos reales — riesgo de que fallen en la primera demo real.
5. No hay exportación CSV, requisito operativo para Banco Continental.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- **Funnel de invitaciones y visitas al perfil ya están implementados** en el dashboard (`FunnelWidget`, `profileViews`) — listos para mostrarse en cuanto haya datos reales que cargar.
- **Filtro por país e invitación inline ya resueltos** — el pitch de "búsqueda de talento QA en LATAM" ahora tiene mejor soporte de producto que en junio.
- **Pipeline completo de pruebas propias de empresa** (crear → invitar → candidato → resultados) — diferenciador fuerte si se activa con un piloto real.
- **Riesgo a comunicar internamente:** ninguno de estos diferenciadores tiene evidencia de uso real todavía (0 invitaciones, 0 pruebas propias creadas) — el pitch necesita datos de un piloto activo, no solo código funcionando.

### Nota arquitectónica (fuera del alcance original, pero relevante)

Se detectó un **segundo modelo de datos paralelo** (`talent_*`, respaldado por un proyecto Vercel separado `aiquaa-talent`) que también representa empresas, procesos de selección y evaluaciones — con su propia versión de "CLT" (`talent_companies`, razón social "CENTRO LOGISTICO DE TECNOLOGIA SA", con 1 usuario y 2 procesos de selección, uno activo: "Bootcamp 2026 - Fase de Pruebas"). Este sistema **no está conectado** al módulo `empresas` auditado aquí (`talent_companies.aiquaaEmpresaId` existe en el esquema pero está `null` en ambas filas). Vale la pena que el equipo confirme cuál de los dos sistemas es el que se va a llevar a producción con CLT, para no duplicar esfuerzo ni confundir al cliente piloto con dos flujos distintos.

### Foco del próximo ciclo (1 hora)

**Prioridad:** Activar el piloto real, no seguir puliendo código que nadie ejercitó todavía.

1. Resolver el acceso de CLT (invitar/confirmar un owner real) y completar su perfil junto con ellos.
2. Dar de alta a Banco Continental SAECA con un perfil mínimo completo.
3. Ejecutar un smoke test manual end-to-end del flujo de invitación (empresa → email → candidato completa) con datos reales, y documentar cualquier fricción encontrada.
4. Decidir y comunicar cuál de los dos sistemas (`empresas` vs `talent_*`) es el oficial para el piloto de CLT, para evitar trabajo duplicado.

---

*Revisión generada automáticamente — 2026-08-19 · Rama: `claude/zen-noether-g6j836`*
