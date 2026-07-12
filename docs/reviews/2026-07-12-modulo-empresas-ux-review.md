# Revisión UX — Módulo de Empresas
**Fecha:** 12 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión de código + datos reales de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión de código fuente (Next.js Server Actions, páginas, migraciones SQL) **+ inspección directa de la base de datos de producción** (proyecto Supabase `aiquaa`) vía MCP. Se documentan solo hallazgos confirmados en código y/o datos reales — no supuestos. Se compara contra el ciclo anterior (`2026-06-27-modulo-empresas-ux-review.md`) para verificar progreso.

---

## 🚨 Hallazgo que domina este ciclo

Antes de entrar a los bloques: la inspección de datos reales encontró que **la cuenta de CLT — el cliente piloto nombrado — está en producción, registrada, pero sin ningún usuario vinculado** (`empresa_miembros` tiene 0 filas para el `empresa_id` de CLT). El código resuelve la empresa activa de un usuario exclusivamente vía `empresa_miembros.status = 'active'` (`apps/frontend/src/actions/employer.ts:190-195, 510-517`). Esto significa que, tal como está hoy, **nadie puede iniciar sesión y administrar el perfil de CLT** — ni completar el perfil, ni ver el dashboard, ni crear procesos. Este hallazgo es prioridad máxima independientemente de los bloques de abajo (ver Bloque 5).

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
El formulario en sí está completo — expone los 13 campos de la tabla `empresas` (incluyendo `tech_stack`, `work_mode`, `benefits`, `qa_team_size`, `linkedin_url`, que en ciclos anteriores se sospechaba faltantes). El checklist de completitud (`completionScore`, `perfil/page.tsx:81-98`) sigue sin cubrir todos los campos editables (omite `nombre_comercial`, `ruc`, `benefits`, `tech_stack`, `qa_team_size`, `linkedin_url` del cálculo), y `country` sigue precargándose como `'PY'` en el estado local aunque la BD tenga `null`, generando el mismo falso avance de completitud señalado el 27/06 (`perfil/page.tsx:145`) — **no se corrigió en este ciclo**.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Mejoró: `/empresas/[id]` ahora renderiza stack tecnológico, modalidad de trabajo, beneficios y LinkedIn (gap crítico del 27/06, resuelto). Pero en la práctica, para el cliente piloto CLT el perfil público está 100% vacío (sin logo, descripción, industria, sitio, stack) — confirmado directo en la tabla `empresas` de producción.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Cuenta CLT sin miembros | `empresa_miembros` = 0 filas para CLT; nadie puede administrar el perfil | **A** 🚀 | Investigar el flujo de alta de CLT y crear/reparar la membresía `owner` faltante | **Roto** |
| Validación server-side | `updateEmpresaAction` (`empresa-admin.ts:296-330`) no valida nada — inserta el payload crudo en `.update()` | **A** | Agregar schema zod server-side para todos los campos de `empresas` | Roto |
| Formulario sin `<form>` | No hay elemento `<form>`; la validación HTML5 (`type="url"`, `required`) nunca se dispara | **M** | Envolver los campos en un `<form>` real con `onSubmit` | Incompleto |
| Validación de `linkedin_url` | Sin ninguna validación de formato | **M** | Agregar regex de validación igual que `website_url` | Incompleto |
| Validación de `ruc` fuera de Paraguay | Solo se valida el formato si `country === 'PY'`; para otros países no hay chequeo | **B** | Adaptar regex por país o marcar como opcional/libre | Incompleto |
| Completitud engañosa por `country='PY'` | Persiste desde el 27/06 sin corregir — el checklist compara contra el valor crudo de BD mientras el select ya muestra "Paraguay" | **M** | Calcular completitud solo tras guardado explícito del usuario | Sin resolver (regresión de prioridad) |
| Subida de logo | Límite de 2MB solo client-side; sin validación de tamaño/mime en el bucket de Supabase Storage | **M** | Agregar política de storage server-side | Incompleto |
| `qa_team_size` | Se consulta en el perfil público pero nunca se renderiza | **B** | Mostrarlo junto a `team_size` en `/empresas/[id]` | Parcial |
| Stack, modalidad, beneficios, LinkedIn en vista pública | ✅ Ya se muestran (gap crítico del 27/06 resuelto) | — | — | **Completo** |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Parcialmente — persiste sin confirmación de mejora sobre los niveles ISTQB (`ctfl`, `ctal_ta`, etc.) mostrados sin tooltip explicativo, señalado ya el 27/06.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
El shortlist (favoritos) está completamente funcional (antes se reportaba como "parcial"): alta/baja optimista, tab dedicado. Pero "contactar" desde el pool de Talento QA sigue siendo, en la práctica, "invitar a rendir una evaluación" (asunto del email hardcodeado), no un mensaje libre — coherente con lo ya señalado, sin cambios.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país | **Presente** (`buscar-candidatos/page.tsx:155-163,378-389`) | ✅ Resuelto — el 27/06 se reportaba ausente | — | Resuelto |
| Filtro de experiencia (años) | Ausente — no existe en ningún modelo de candidato | Un recruiter de banco no puede filtrar por seniority | Agregar campo `years_experience` a `profiles`/sourcing y exponerlo como filtro | **A** |
| Filtro de skills | Multiselect fijo de 11 skills hardcoded, sin búsqueda libre de herramientas | No cubre herramientas específicas (ej. Playwright, k6, Postman si no están en la lista) | Permitir tags libres además de la lista fija | **M** |
| Shortlist/favoritos | Totalmente funcional, con tab dedicado | Sin cambios | — | Resuelto |
| Invitar candidato desde búsqueda | Envía email de invitación a evaluación (si `EMAIL_SENDING_ENABLED=true`); si el flag está apagado, se crea el registro pero **no se envía nada y el toast igual dice éxito** | Falla silenciosa: la empresa cree que invitó y el candidato nunca se entera | Mostrar advertencia visible cuando el envío de email está deshabilitado | **A** 🚀 |
| Ranking de resultados | Orden fijo (disponibilidad → mejor score → última actividad vía RPC SQL), no configurable por el usuario | El recruiter no puede reordenar por "más reciente" o "mejor score" a su gusto | Agregar selector de orden en la UI | **B** |
| Paginación | Ausente; `exam_results` limitado a 500 filas hardcoded (carry-over del 27/06) | Riesgo de truncar resultados silenciosamente a medida que crece la plataforma | Implementar paginación real | **M** |
| Contacto directo (mailto) | Solo disponible en tab "Evaluados" (datos de examen), no en el pool de Talento (protegido por privacidad) | Inconsistente entre tabs — puede confundir a un recruiter que no entiende por qué en un tab hay botón de contacto y en otro no | Aclarar visualmente la razón (tooltip: "email protegido, invitá al candidato para contactarlo") | **B** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

> **Nota importante:** existe un sistema de evaluaciones **completamente separado y más nuevo** (`empresa_pruebas` / `empresa_preguntas` / `empresa_prueba_invitaciones` / `empresa_intentos`) además del sistema legado revisado el 27/06 (`hiring_processes` + `empresa_invitaciones`, que ya envía email vía Resend). Este bloque audita el sistema **nuevo**, que en producción tiene **0 filas en las 4 tablas — nunca se usó de punta a punta**.

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
No — la creación de pruebas no ofrece plantillas (ISTQB teórico / práctico / case study); solo permite armar preguntas de opción múltiple, verdadero/falso o texto corto desde cero, sin categorización por área.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Parcialmente — hay vista de ranking entre candidatos y desglose por pregunta, pero sin agrupación por tema/área (mismo problema estructural que `section_scores` en el sistema legado).

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Crear prueba y agregar preguntas | Completo pero rígido | Sin plantillas (ISTQB/práctico/case study); solo 3 tipos de pregunta | Agregar banco de preguntas ISTQB precargado como plantilla inicial | **M** |
| Generar link de invitación | Completo | — | — | Completo |
| Candidato notificado por email | **Roto** | `createPruebaInvitacionAction` (`empresa-pruebas.ts:480-516`) solo inserta el registro — no hay ninguna llamada a Resend. La empresa debe copiar el link y enviarlo manualmente | Implementar envío de email vía Resend, igual que ya existe para el flujo legado | **CRÍTICO** 🚀 |
| Empresa notificada al completar | **Roto** | `notifyEmpresaExamCompleted` (sistema legado) nunca se invoca desde `empresa-pruebas-candidato.ts` — la empresa no se entera cuando un candidato termina una prueba nueva | Conectar el submit de `empresa_intentos` a una notificación por email/dashboard | **CRÍTICO** 🚀 |
| Candidato completa la prueba | Completo | Token, expiración, timer con auto-envío funcionan correctamente | — | Completo |
| Configurar expiración / intentos máximos | Incompleto | `expires_at` y `max_attempts` existen en la BD y se validan server-side, pero la UI de invitación nunca los expone — quedan siempre en "nunca expira" / "1 intento" | Exponer estos dos campos en el formulario de invitación | **M** |
| Comparar candidatos / ver resultados | Parcial | Hay vista de ranking y desglose por pregunta, pero sin agrupación por área/tema (preguntas no tienen tag de categoría) | Agregar campo de categoría a `empresa_preguntas` y agrupar el desglose | **M** |
| Página `/empresa/evaluar/[resultId]` | **Confuso** | No pertenece a este flujo — apunta a un sistema legado distinto ("Test App — Bug Hunt"). No existe una página de detalle dedicada para revisar un intento de `empresa_pruebas` (solo la fila expandible en `resultados/page.tsx`) | Renombrar o crear una ruta de detalle propia para evitar la colisión de nombres | **B** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Progreso desde el ciclo anterior

Los **dos gaps críticos marcados 🚀 el 27/06 ya están resueltos y con datos reales, no mockeados**:
- **Visitas al perfil** (`profile_views`) — ahora visible como stat card "Visitas al perfil" (`empresa/page.tsx:334-341`), alimentado por `employer.ts:596-602`.
- **Funnel de invitaciones** (enviadas → vistas → completadas, con tasa de respuesta) — implementado como widget colapsable (`empresa/page.tsx:114-172,444-451`), usando `viewed_at`/`completed_at` de `empresa_invitaciones`.

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Visitas al perfil | **Sí** (nuevo) | Ninguno — dato real | — | Alto |
| Funnel de invitaciones | **Sí** (nuevo) | Se oculta por completo si no hay invitaciones enviadas (caso de la mayoría de empresas hoy) | Mostrar el widget en estado vacío con CTA "Enviá tu primera invitación" en vez de ocultarlo | Alto |
| Procesos activos / evaluados / tasa de aprobación / tiempo promedio | Sí | Sin cambios respecto al ciclo anterior | — | Alto |
| Top skills QA disponibles este mes | **No** | Oportunidad de market intelligence para CLT/Banco Continental sigue sin explotarse | Widget "Skills más evaluados en AIQUAA este mes" usando datos de `exam_results`/`empresa_intentos` | Medio |
| Tasa de respuesta como métrica siempre visible | Parcial | Solo dentro del funnel colapsable, que se oculta en cuenta nueva | Promoverla a stat card independiente | Medio |
| Prospectos | Sí, real (`getEmpresaProspectsAction`), con buen empty state y CTA a "Ver mis procesos" | La tabla tiene 0 filas en producción — la mayoría de empresas ve solo el empty state, no las métricas | — | Medio |
| Cohesión procesos / eventos / prospectos | Parcial | Son 3 páginas separadas, cada una con su propio fetch/empty state, unidas solo por links cruzados — no hay una vista unificada de "estado del proceso de selección" | Considerar una vista resumen que combine las tres | Medio |
| "Ver evaluaciones pendientes" como acción rápida | **No** | No existe como acción explícita en el dashboard (sí existe "Invitar candidatos" y links a procesos) | Agregar acceso directo a invitaciones/pruebas pendientes de respuesta | Bajo |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 Cuenta piloto CLT sin acceso** — `empresa_miembros` tiene 0 filas para el `empresa_id` de CLT en producción; nadie puede iniciar sesión y administrar su cuenta. Bloqueante absoluto e inmediato para el piloto, independiente de cualquier otro hallazgo. Tipo: **bug crítico de onboarding**.
2. **🚨 Evaluaciones nuevas (`empresa_pruebas`) sin ninguna notificación por email** — ni al candidato cuando se le invita, ni a la empresa cuando el candidato termina. El flujo técnico funciona pero requiere copiar/pegar el link a mano; 0 usos reales en producción lo confirman. Tipo: **gap de funcionalidad crítico**.
3. **✅ Progreso confirmado** — los 2 gaps críticos 🚀 del ciclo del 27/06 (visitas al perfil, funnel de invitaciones) están implementados y funcionando con datos reales, igual que el filtro por país en búsqueda y el directorio público `/empresas`.
4. **⚠️ Cero validación server-side en el perfil de empresa** — `updateEmpresaAction` inserta el payload crudo sin schema; solo hay validación parcial e inconsistente en el cliente (no cubre LinkedIn, RUC fuera de PY). Tipo: **bug de datos/seguridad**.
5. **⚠️ Falla silenciosa al invitar candidatos** — si `EMAIL_SENDING_ENABLED` está apagado, la empresa recibe un toast de éxito aunque no se envió ningún email. Tipo: **bug UX**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Cuenta CLT sin miembros vinculados | Bug crítico | Sí 🚀 |
| 2 | `empresa_pruebas` sin email a candidato ni a empresa | Gap funcionalidad crítico | Sí 🚀 |
| 3 | `updateEmpresaAction` sin validación server-side | Bug / riesgo de datos | Sí |
| 4 | Toast de éxito falso cuando el email no se envía | Bug UX | Sí 🚀 |
| 5 | Completitud de perfil engañosa por `country='PY'` (no corregido desde 27/06) | UX problem | Parcial |
| 6 | Falta filtro de años de experiencia | Gap funcionalidad | Sí (Banco Continental filtra por seniority) 🚀 |
| 7 | Sin plantillas ISTQB/práctico en creación de pruebas | Gap funcionalidad | Parcial |
| 8 | `/empresa/evaluar/[resultId]` apunta a sistema equivocado | UX problem | No |
| 9 | Sin widget "top skills del mes" | Gap funcionalidad | No |
| 10 | Funnel de invitaciones oculto en cuenta nueva | UX problem | Parcial |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. **Inmediato, fuera de ciclo:** la cuenta de CLT no tiene ningún usuario con acceso — hay que reparar esto antes de cualquier demo, no puede esperar al próximo ciclo de 1 hora.
2. El nuevo sistema de evaluaciones (`empresa_pruebas`) no puede usarse en un piloto real sin notificación por email — obliga a coordinación manual fuera de la plataforma.
3. Sin validación server-side, cualquier error del cliente (o llamada directa a la acción) puede corromper el perfil público que verá un candidato — riesgo reputacional para el employer branding de CLT/Banco Continental.
4. Falta filtro por años de experiencia — relevante para Banco Continental, que probablemente busca perfiles senior.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- **Funnel de invitaciones y visitas al perfil ya en producción** — AIQUAA puede demostrar hoy mismo a un cliente piloto cuántos candidatos vieron su empresa y respondieron su outreach (esto era un gap crítico hace dos semanas; ya está resuelto).
- **Filtro por país ya funcional** — diferenciador LATAM confirmado en código.
- Reparar la cuenta de CLT y activar notificaciones de `empresa_pruebas` son los dos únicos bloqueantes que separan a AIQUAA de poder correr una demo end-to-end con un cliente piloto real.

### Foco del próximo ciclo (1 hora)

**Prioridad 0 (antes del próximo ciclo, no dentro de él):** reparar el acceso a la cuenta de CLT.

**Prioridad 1 del próximo ciclo:** paridad de notificaciones por email entre el sistema legado (`empresa_invitaciones`, ya con Resend) y el nuevo (`empresa_pruebas`, sin Resend) — implementar el envío al candidato y la notificación a la empresa al completar.

**Prioridad 2:** agregar validación server-side (zod) a `updateEmpresaAction` y corregir la falla silenciosa del toast cuando `EMAIL_SENDING_ENABLED` está apagado.

---

*Revisión generada automáticamente — 2026-07-12 · Rama: `claude/zen-noether-3urncu` · Grounded en datos reales del proyecto Supabase `aiquaa` (cbkctkpyxwbufvbwxogp).*
