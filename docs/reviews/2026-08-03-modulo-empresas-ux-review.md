# Revisión UX — Módulo de Empresas
**Fecha:** 3 de agosto de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, migraciones de Supabase), verificando además el estado real de los 10 hallazgos del ciclo anterior ([2026-06-27](./2026-06-27-modulo-empresas-ux-review.md)). Se documentan solo hallazgos confirmados leyendo el código — no supuestos. No se tuvo acceso a Jira en este ciclo (sin conector configurado en la sesión); el cierre incluye contenido listo para pegar en tickets en lugar de tickets creados.

---

## ✅ Seguimiento del ciclo anterior (2026-06-27)

De los 10 hallazgos del ciclo pasado, **7 están resueltos**, 1 parcialmente, 2 siguen abiertos:

| # | Hallazgo (ciclo anterior) | Estado ahora |
|---|---|---|
| 1 | Invitaciones sin email | ✅ **Resuelto** — `empresa-invitaciones.ts` envía email vía Resend (gated por `EMAIL_SENDING_ENABLED`) |
| 2 | Directorio `/empresas` inexistente | ✅ **Resuelto** — `/empresas/page.tsx` lista todas las empresas |
| 3 | `section_scores` descartado | 🟡 **Parcial** — corregido en tab Evaluados (`empresa/candidatos/page.tsx`), sigue `null` en `employer.ts:417` (afecta `/empresa/procesos`, `/empresa/eventos`, dashboard, `/employer/[code]`) |
| 4 | Campos de perfil faltantes | ✅ **Resuelto** — `work_mode`, `tech_stack`, `benefits`, `linkedin_url`, `qa_team_size`, `profile_views` agregados |
| 5 | Métricas B2B faltantes en dashboard | ✅ **Resuelto** — `FunnelWidget` con enviadas/vistas/completadas + tasa de respuesta |
| 6 | URL pública con UUID (no slug) | ❌ **Sigue abierto** — sin columna `slug` en `empresas` |
| 7 | Sin filtro de país | ✅ **Resuelto** — filtro país en `buscar-candidatos/page.tsx` |
| 8 | Sin exportación CSV | ✅ **Resuelto** — botón "Exportar CSV" en Evaluados |
| 9 | Sin comparación side-by-side | ❌ **Sigue abierto** — no existe multi-select ni vista comparativa |
| 10 | Sin notificación a empresa al completar evaluación | ✅ **Resuelto** — `empresa-result-notifications.ts` notifica por email a dueño/admins |

**Nuevo hallazgo colateral (no reportado antes):** el flujo de invitación por token quedó **duplicado**: `/invitacion/[token]` (singular) y `/invitaciones/[token]` (plural) coexisten. El email generado por `empresa-invitaciones.ts:73` enlaza siempre a la ruta plural — la ruta singular es código huérfano, desactualizado (le faltan tipos de examen agregados después, como `gherkin-fundamentals`) y debería eliminarse para evitar mantenimiento duplicado y confusión.

---

## 🏢 Bloque 1 — Perfil de empresa

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Eliminar logo | Sigue sin existir — solo "📷 Subir logo" / "🔄 Cambiar logo" | **B** | Agregar botón "Eliminar logo" con confirmación | Incompleto (repetido del ciclo anterior) |
| Etiqueta RUC por país | El label es literal `RUC` para cualquier país; solo se agrega un *hint* de formato PY, pero ni el label ni la validación (regex) se adaptan a otros países | **B** | Renombrar dinámicamente (RUC/NIT/CUIT/RFC) y validar según país seleccionado | Incompleto (repetido) |
| URL pública del perfil | Sigue siendo UUID (`/empresas/[uuid]`), sin columna `slug` en la tabla `empresas` | **A** | Agregar `slug` generado desde `nombre_comercial` con fallback a UUID | Incompleto (repetido, sin avance) |
| Directorio `/empresas` | Ahora existe y lista todas las empresas con badges de industria/país/modalidad | — | Agregar buscador y filtro por industria (aún ausente) | Completo con mejora pendiente |
| Campos de employer branding | `work_mode`, `tech_stack`, `benefits`, `linkedin_url` agregados y visibles en edición | — | — | **Completo** (resuelto desde el ciclo pasado) |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país | Implementado con dropdown y badges por candidato | — | — | Resuelto |
| Invitar candidato inline | Botón "Invitar" por fila abre modal con selector de proceso + mensaje, sin salir de la búsqueda | — | — | Resuelto 🚀 |
| Etiquetas ISTQB | `ctfl` → "Foundation Level (CTFL)", etc. — nombres expandidos, pero **sin tooltip explicativo** de qué implica cada nivel para una decisión de contratación | Un recruiter no-técnico ve un nombre más claro pero no entiende la diferencia práctica entre niveles | Agregar tooltip/popover: "CTFL: puede diseñar casos de prueba de forma independiente" vs. "CTAL-TM: gestiona equipos de testing" | **M** |
| Comparación side-by-side | Sigue sin existir ningún multi-select ni modal comparativo | Recruiter de Banco Continental evaluando 5+ candidatos para el mismo puesto debe tomar notas manualmente | Checkbox multi-select (máx. 3) + modal comparativo con score, país, ISTQB, skills | **M** |
| Exportar CSV | Implementado en tab Evaluados | — | — | Resuelto 🚀 |

---

## 📋 Bloque 3 — Evaluaciones técnicas (catálogo + nuevo: pruebas propias)

### 3a. Flujo de invitación a exámenes del catálogo (ISTQB, Git, etc.)
Estado: **mayormente resuelto** desde el ciclo anterior — email + ruta pública + notificación a la empresa funcionan. Pendiente real: el desglose `section_scores` sigue en `null` fuera del tab Evaluados (`employer.ts:417`), por lo que el dashboard y `/empresa/procesos` no muestran por qué un candidato aprobó o reprobó.

### 3b. `empresa-pruebas` — constructor de pruebas propias (feature nueva, no revisada antes)

Esta es una funcionalidad nueva desde el último ciclo: permite a la empresa crear sus propias pruebas técnicas (multiple choice, verdadero/falso, texto corto) e invitar candidatos por link con token, independiente del catálogo de exámenes de la plataforma.

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Crear prueba (`/empresa/pruebas/nuevo`) | Parcial | Se puede publicar y generar invitaciones para una prueba con **0 preguntas** — no hay validación de mínimo de preguntas | Bloquear generación de invitación si `preguntas.length === 0` | **A** |
| Autoría de preguntas | Completo | Sin banco de preguntas reutilizable — cada prueba se escribe desde cero, sin duplicar de otra prueba existente | Agregar "duplicar pregunta(s) de otra prueba" | **M** |
| Calificación de `short_text` | Roto | La UI del editor advierte: *"Se califica por coincidencia de palabras clave — recomendado revisar manualmente en Resultados"*, pero **no existe ningún control en Resultados para revisar o ajustar el puntaje** — solo un badge informativo "automático — revisar" | Implementar edición manual del puntaje por respuesta en la vista de Resultados | **CRÍTICO** 🚀 |
| Enviar invitación | Roto (inconsistente con el resto de la plataforma) | A diferencia de `empresa-invitaciones.ts` (que sí envía email vía Resend), esta invitación es **solo link para copiar/pegar** — la empresa debe reenviarlo manualmente por su cuenta | Reusar el patrón de envío de email por Resend ya existente en `empresa-invitaciones.ts` | **A** 🚀 |
| Configurar `expires_at` / `max_attempts` | Incompleto | El backend soporta ambos parámetros y los **aplica correctamente**, pero el formulario de invitaciones nunca los expone — toda invitación queda con `max_attempts: 1` sin vencimiento | Exponer ambos campos en el formulario de invitación | **M** |
| Candidato accede por token | Completo, con roce | Sin login, con timer y auto-envío al agotar el tiempo — funciona bien. Pero **no persiste progreso**: si el candidato cierra o recarga la pestaña, pierde las respuestas y arranca un intento nuevo | Persistir respuestas en curso (localStorage o guardado incremental en `empresa_intentos`) | **M** |
| Candidato ve su resultado | Por diseño | El candidato no ve su score al finalizar — mensaje genérico "la empresa se pondrá en contacto" | Sin cambio necesario (consistente con el resto del producto) | — |
| Vista de resultados (empresa) | Bueno | Desglose por pregunta, tiempo, ranking — bien resuelto salvo por el punto de calificación manual arriba | — | — |
| Empty states (pruebas/invitaciones/intentos) | Bueno | Los 3 estados vacíos tienen texto claro y CTA visible | — | — |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Funnel de invitaciones (enviadas/vistas/completadas + tasa de respuesta) | **Sí** (nuevo) | Bien implementado, condicional a que existan invitaciones | Sin cambios necesarios | **Alto** — resuelto desde ciclo anterior 🚀 |
| Perfil visto por candidatos (`profile_views`) | **Sí** (nuevo) | Campo agregado al modelo de empresa | Confirmar que se muestre destacado en el dashboard, no solo en el perfil | Alto |
| Top skills QA evaluados este mes | **No** | Sigue sin existir — oportunidad de market intelligence para el pitch B2B | Widget "Skills más evaluados en AIQUAA este mes" usando datos ya agregados de `assessment_attempts` | Medio 🚀 |
| Comparación entre procesos | **No** | Sigue sin existir tabla resumen proceso-a-proceso | Agregar tabla de KPIs (pass rate, avg score) por proceso | Alto |
| Desglose de secciones en dashboard/procesos | **No** (parcial en otro módulo) | `section_scores` sigue `null` en `employer.ts`, por lo que no llega al dashboard ni a `/empresa/procesos` | Reutilizar el join ya implementado en `empresa/candidatos/page.tsx` dentro de `employer.ts` | **A** |

---

## ✅ Bloque 5 — Cierre del ciclo

### Top 5 hallazgos de este ciclo

1. **🚨 CRÍTICO — Pruebas propias (`empresa-pruebas`): calificación manual prometida pero inexistente.** La UI le dice al recruiter que revise manualmente las respuestas de texto libre, pero no hay ningún control para hacerlo — el puntaje automático (coincidencia de palabras clave) queda como definitivo sin poder corregirlo. Tipo: **bug de implementación** (funcionalidad incompleta con expectativa falsa en la UI).

2. **⚠️ Pruebas propias sin envío de email — inconsistente con el resto de la plataforma.** El flujo de invitación a exámenes del catálogo sí envía email vía Resend; el flujo de pruebas propias es copiar-y-pegar manual. Para un cliente piloto como Banco Continental, esto es un paso extra innecesario que además no queda registrado ni trackeado. Tipo: **gap de funcionalidad**.

3. **⚠️ `section_scores` sigue sin propagarse fuera del tab Evaluados.** El fix del ciclo anterior se aplicó parcialmente — el dashboard, `/empresa/procesos` y `/empresa/eventos` siguen mostrando solo aprobado/reprobado sin desglose por área. Tipo: **bug de implementación** (arreglo incompleto).

4. **⚠️ Ruta de invitación duplicada (`/invitacion` vs `/invitaciones`).** Deuda técnica que aumenta el riesgo de bugs futuros si alguien edita una ruta sin saber que existe una gemela desactualizada. Tipo: **bug / deuda técnica**.

5. **Gaps de UX menores sin resolver de ciclos anteriores:** URL con UUID (sin slug), sin comparación side-by-side de candidatos, sin tooltips explicativos en niveles ISTQB, sin botón de eliminar logo, RUC sin adaptar por país. Tipo: **mejora de diseño / gap de funcionalidad**, ninguno bloqueante para el piloto.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Calificación manual de `short_text` prometida pero no implementada | Bug / gap funcionalidad | Sí 🚀 |
| 2 | Pruebas propias sin envío de email (copy-link manual) | Gap funcionalidad | Sí 🚀 |
| 3 | `section_scores` no propagado fuera de Evaluados | Bug (fix incompleto) | Parcial |
| 4 | Ruta de invitación duplicada (`/invitacion` huérfana) | Deuda técnica | No |
| 5 | Sin validación de mínimo de preguntas en pruebas propias | Gap funcionalidad | No |
| 6 | Sin exposición UI de `expires_at`/`max_attempts` en pruebas propias | Gap funcionalidad | No |
| 7 | Sin resume de intento al recargar la página (pruebas propias) | UX problem | No |
| 8 | URL pública de empresa con UUID, no slug | UX problem | Parcial (repetido) |
| 9 | Sin comparación side-by-side de candidatos | Gap funcionalidad | No (repetido) |
| 10 | Sin tooltip explicativo en niveles ISTQB | UX problem | No (repetido) |
| 11 | Sin "Top skills evaluados este mes" en dashboard | Gap funcionalidad | No 🚀 (repetido) |
| 12 | Sin botón "Eliminar logo" / RUC no adapta por país | UX problem menor | No (repetido) |

### Bloqueantes reales para cliente piloto (CLT / Banco Continental)

De los hallazgos de este ciclo, **ninguno es tan bloqueante como los del ciclo anterior** (que ya se resolvieron). El único con impacto directo en la credibilidad del producto frente a un piloto formal es:
- La calificación manual prometida pero ausente en pruebas propias (#1) — si Banco Continental usa preguntas de texto libre, el score que ve puede ser incorrecto sin forma de corregirlo antes de decidir sobre un candidato.
- La falta de email en pruebas propias (#2) — obliga a un paso manual fuera de la plataforma, rompiendo el value proposition de "todo en un solo lugar".

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El funnel de invitaciones, notificaciones por email y CSV del ciclo anterior ya están en producción — vale la pena incluirlos como logros del pitch.
- **Top skills evaluados este mes** sigue siendo la pieza de market-intelligence más fácil de construir con datos ya existentes (`assessment_attempts`) y de mayor impacto narrativo para LATAM.
- El constructor de pruebas propias (`empresa-pruebas`) es en sí mismo un diferenciador fuerte para el pitch — pero solo si se resuelve la calificación manual y el envío de email, o el discurso de "plataforma completa de reclutamiento QA" pierde fuerza frente a un cliente que lo pruebe a fondo.

### Foco del próximo ciclo (1 hora)

**Prioridad:** Cerrar los huecos del constructor de pruebas propias (`empresa-pruebas`) antes de ofrecerlo a un piloto.

1. Implementar edición manual de puntaje por respuesta de `short_text` en `/empresa/pruebas/[pruebaId]/resultados`.
2. Reusar `sendEmail`/Resend de `empresa-invitaciones.ts` en `createPruebaInvitacionAction` para notificar al candidato automáticamente.
3. Propagar `section_scores` real en `employer.ts` (reusar el join ya existente en `empresa/candidatos/page.tsx`) para que el desglose llegue también al dashboard y a `/empresa/procesos`.
4. Eliminar la ruta huérfana `/invitacion/[token]` (singular) para evitar deuda técnica.

---

## 🎫 Contenido listo para tickets (sin acceso a Jira en este ciclo)

*Nota: esta sesión no tiene conector de Jira configurado (aiquaa.atlassian.net), por lo que no se crearon tickets directamente. El siguiente contenido está listo para pegar en Jira o Notion.*

**[CRÍTICO] Implementar revisión manual de puntaje en pruebas propias (short_text)**
- Descripción: El editor de preguntas de `/empresa/pruebas/[pruebaId]` advierte que las respuestas de texto libre deben revisarse manualmente, pero la vista de Resultados (`/empresa/pruebas/[pruebaId]/resultados`) solo muestra un badge "automático — revisar" sin ningún control para ajustar el puntaje.
- Pasos para reproducir: Crear una prueba con una pregunta `short_text` → invitar candidato → responder con texto parcialmente correcto → revisar resultados → confirmar que no hay forma de editar el puntaje asignado.
- Impacto: Alto — puede llevar a decisiones de contratación basadas en un score incorrecto.
- Prioridad: Crítica. 🚀 (fortalece caso B2B una vez resuelto)

**[ALTO] Enviar email automático en invitaciones de pruebas propias**
- Descripción: `createPruebaInvitacionAction` no envía email al candidato; el recruiter debe copiar el link manualmente. Contrasta con `empresa-invitaciones.ts`, que sí envía email vía Resend.
- Pasos para reproducir: Crear invitación en `/empresa/pruebas/[pruebaId]/invitaciones` → confirmar que solo aparece un botón "Copiar" sin envío de email.
- Impacto: Alto — rompe la consistencia de la plataforma y agrega fricción manual.
- Prioridad: Alta. 🚀

**[MEDIO] Propagar `section_scores` fuera del tab Evaluados**
- Descripción: `employer.ts:417` sigue devolviendo `section_scores: null`, afectando el dashboard, `/empresa/procesos` y `/empresa/eventos`.
- Impacto: Medio — el desglose por área ya funciona en un solo lugar (Evaluados); falta extenderlo.
- Prioridad: Media.

**[BAJO] Eliminar ruta huérfana `/invitacion/[token]`**
- Descripción: Ruta singular duplicada y desactualizada respecto a `/invitaciones/[token]` (plural), que es la única enlazada desde el email de invitación.
- Impacto: Bajo (deuda técnica, riesgo de bugs futuros).
- Prioridad: Baja.

---

*Revisión generada automáticamente — 2026-08-03 · Rama: `claude/zen-noether-6n8ufo`*
