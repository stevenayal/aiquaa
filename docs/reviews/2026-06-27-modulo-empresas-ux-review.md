# Revisión UX — Módulo de Empresas
**Fecha:** 27 de junio de 2026  
**Ciclo:** Mejora continua · 60 min  
**Reviewer:** QA Lead (revisión automatizada de código)  
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM  
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, modelos de Supabase). Se documentan solo hallazgos confirmados en el código — no supuestos.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**  
Parcialmente. La barra de completitud con enlaces anchor a campos faltantes es un buen guía rápida. Sin embargo, el campo `country` tiene el valor por defecto `'PY'`, lo que genera un 14% de completitud sin que el usuario haya hecho nada — puede dar sensación de avance falso.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**  
No completamente. Falta stack tecnológico, modalidad de trabajo y beneficios — la información que un QA evalúa antes de postularse. La URL pública es un UUID no memorable.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado |
|---|---|---|---|---|
| Campos de identidad profesional | Faltan: stack tecnológico, modalidad (remoto/híbrido/presencial), beneficios QA, LinkedIn | **A** | Agregar sección "¿Qué ofrecemos?" con estos campos | Incompleto |
| URL pública del perfil | UUID en la URL (`/empresas/uuid`), no memorable ni compartible | **A** | Generar slug automático desde `nombre_comercial` | Incompleto |
| Directorio público `/empresas` | No existe página de listing de empresas | **A** | Crear directorio paginado con search y filtro por industria | Roto/faltante |
| Preview inline | Solo link externo "Ver perfil →", no hay previsualización sin salir de la pantalla | **M** | Agregar modal o panel colapsable de preview | Incompleto |
| Completitud por defecto | `country='PY'` precargado = 14% completitud sin acción del usuario (engañoso) | **M** | Calcular completitud solo si el usuario editó el campo explícitamente | Incompleto |
| Redes sociales | Sin campo LinkedIn Company, Instagram, Twitter/X | **M** | Agregar al menos LinkedIn como campo opcional | Incompleto |
| Eliminar logo | No hay opción "Eliminar logo" — solo "Cambiar logo" | **B** | Agregar botón de eliminar con confirmación | Incompleto |
| Contador de caracteres | `razon_social` (max 120) y `nombre_comercial` (max 80) no tienen contador visual | **B** | Agregar contadores tipo `{n}/120` como en `description` | Parcial |
| RUC para otros países | Campo RUC siempre visible pero solo útil para PY; para otros países debería adaptarse | **B** | Renombrar dinámicamente según país (RUC/NIT/CUIT/RFC) | Incompleto |
| Empty state recién registrado | La barra de completitud muestra 14% por el `country` precargado; puede confundir | **B** | Mostrar 0% hasta el primer guardado explícito | Parcial |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**  
No. El filtro `istqb_level` usa valores como `ctfl`, `ctal_ta`, `ctal_tm` que requieren conocimiento del esquema ISTQB. No hay tooltips ni explicaciones.

**¿El flujo para contactar o guardar un candidato es claro y directo?**  
El flujo de favoritos (shortlist) es funcional pero no está integrado con el flujo de invitación. Para contactar, el recruiter debe ir a otro módulo (`/empresa/invitaciones`).

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país | Ausente en la UI (el campo existe en `profiles`) | Los recruiters de CLT necesitan filtrar candidatos de Paraguay | Agregar filtro "País" (al menos en tab Talento) | **A** 🚀 |
| Filtros ISTQB sin descripción | Valores técnicos (`ctfl`, `ctal_ta`) sin tooltips | Un recruiter no-técnico no sabe qué significan | Mostrar etiquetas completas con tooltip de descripción | **A** |
| Buscar en tab Talento | El `search` filtra por nombre/email solo en `evaluados`; no está claro si aplica a Talento | Inconsistencia entre tabs | Unificar búsqueda o aclarar scope de cada filtro | **M** |
| Límite 500 resultados (hardcoded) | `exam_results` limitado a 500 filas | Plataforma creciendo puede silenciosamente truncar resultados | Implementar paginación real o alertar cuando se alcanza el límite | **M** |
| Contactar candidato | No hay botón "Invitar" dentro de la ficha del candidato en el directorio de Talento | Flujo fragmentado: ver candidato en tab → ir a otro módulo a invitar | Agregar "Invitar a proceso" inline en la ficha del candidato | **A** 🚀 |
| Comparar candidatos | No existe vista de comparación side-by-side | Recruiter debe tomar notas manualmente para comparar | Agregar checkbox multi-select + modal de comparación (max 3) | **M** |
| Exportar resultados CSV | Ausente | Banco Continental necesitará reportar a RRHH con datos | Agregar botón "Exportar CSV" en tab Evaluados | **A** 🚀 |
| Open-to-work como filtro dedicado | No hay filtro de checkbox "Solo disponibles" en Talento | La propiedad existe pero no está expuesta en UI | Agregar toggle "Solo candidatos disponibles" | **M** |
| Empty state sin candidatos | No verificado en código; presumiblemente muestra mensaje genérico | Oportunidad para CTA "Invitar candidato" | Agregar CTA directo al módulo de invitaciones | **B** |
| Desglose `section_scores` | Existe en DB para `exam_results` pero se fuerza a `null` al normalizar `assessment_attempts` | Recruiter no puede ver en qué área falló/aprobó el candidato | Mostrar breakdown de secciones en el detalle expandible | **A** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**  
No. Los `exam_types` son strings (`istqb`, `git`, `performance`, `api-banking`) sin descripción de duración, nivel esperado, ni qué se evalúa exactamente.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**  
Parcialmente. El score y si aprobó/reprobó están disponibles. El desglose por sección (que sería lo más valioso) no se muestra.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Crear proceso con tipo de evaluación | Completo | Los `exam_types` son strings hardcoded sin descripción de qué evalúan, duración ni nivel | Agregar tooltips/cards descriptivos al seleccionar cada tipo | **A** |
| Invitar candidato a evaluación | Parcial | `createInvitacionAction` NO envía email al candidato — solo crea registro en DB con `token` | **Implementar envío de email vía Resend** con link usando el `token` único | **CRÍTICO** 🚀 |
| Candidato accede a su invitación | Roto | El `token` de la invitación no tiene ruta pública (`/invitaciones/[token]` no existe) | Crear página pública para aceptar invitaciones por token | **CRÍTICO** |
| Candidato completa evaluación | Completo (via código de proceso) | El flujo de código funciona, pero no está vinculado al flujo de invitación | Vincular el código de proceso al email de invitación | **A** |
| Empresa ve resultados por candidato | Parcial | `section_scores` existe en DB pero se descarta al normalizar `assessment_attempts` | Mostrar desglose por área (Foundation, Técnica, Proceso, etc.) | **A** |
| Notificación empresa — evaluación completada | Roto | No hay notificación a la empresa cuando un candidato termina una evaluación | Agregar webhook/trigger de Supabase → Resend al completarse un intento | **A** 🚀 |
| Comparar candidatos entre sí | Incompleto | No existe vista comparativa | Tabla de comparación con score, secciones, tiempo empleado | **M** |
| Fecha límite / timeout de proceso | Parcial | `expires_at` existe pero no hay alerta cuando queda < 7 días | Agregar badge de "vence pronto" en el listado de procesos | **M** |
| Política de reintentos | Incompleto | El contador de intentos existe (attempt #N/M) pero no hay límite configurable por proceso | Agregar campo `max_attempts` en `hiring_processes` | **B** |
| Descripción de evaluaciones al candidato | Incompleto | En el perfil público `/empresas/[id]` se muestran los tipos pero sin descripción | Agregar descripción human-readable de cada tipo de evaluación | **M** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Procesos activos | Sí | Clickeable pero sin breakdown por estado de candidatos | Agregar mini-sparkline de actividad reciente | Alto |
| Candidatos evaluados | Sí | No distingue aprobados vs reprobados en el número principal | Dividir en "X aprobados / Y reprobados" o agregar color semáforo | Alto |
| Tasa de aprobación | Sí | Muestra "—" cuando no hay candidatos; sin umbral de referencia (ISTQB = 65%) | Agregar tooltip "El umbral ISTQB CTFL es 65%" | Alto |
| Tiempo promedio | Sí | Presente pero sin contexto de benchmark de la plataforma | Agregar "p75 de la plataforma: X min" como referencia | Medio |
| Perfil visto por candidatos | **No** | Métrica de awareness B2B inexistente; no hay tracking en `/empresas/[id]` | Implementar page-view counter (incrementar en Supabase en cada GET) | **Crítico** 🚀 |
| Funnel invitación → vista → completada | **No** | Las columnas `viewed_at` y `completed_at` existen en `empresa_invitaciones` pero no se visualizan | Agregar widget de funnel con 3 pasos usando datos ya disponibles | **Crítico** 🚀 |
| Tasa de respuesta a invitaciones | **No** | Sin esta métrica el recruiter no sabe si su outreach funciona | Calcular: `completadas / enviadas * 100` — datos ya existen en DB | **Alto** 🚀 |
| Comparación entre procesos | **No** | No hay tabla de KPIs proceso-a-proceso (pass rate, avg score) | Agregar tabla resumen en dashboard o en `/empresa/procesos` | Alto |
| Top skills QA disponibles este mes | **No** | Oportunidad de market intelligence para CLT/Banco Continental | Widget "Skills más evaluados en AIQUAA este mes" | Medio |
| Gráficos 6 meses (procesos y candidatos) | Sí | Bien implementados con Recharts y responsive | Agregar línea de tendencia | Bueno |
| Badge en items pendientes | Sí | Bien implementado con números en rojo | — | Bueno |
| Empty state sin actividad | Sí | Bien diseñado con 2 CTAs claros | — | Bueno |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 Invitaciones sin email** — `createInvitacionAction` crea el registro pero **no envía ningún email** al candidato. El `token` de la invitación no tiene ruta pública. El flujo está completamente roto para el caso de uso B2B core: "invitar candidato externo a evaluar". Tipo: **bug / gap de funcionalidad**.

2. **🚨 Directorio público `/empresas` inexistente** — El perfil de empresa (`/empresas/[id]`) existe y está bien implementado, pero no hay página de listado `/empresas`. Un candidato no puede descubrir empresas activas. La URL pública usa UUID, no un slug memorable. Tipo: **gap de funcionalidad**.

3. **🚨 Desglose de evaluación no mostrado** — `section_scores` existe en la BD para exámenes ISTQB pero se descarta (`null`) al normalizar resultados de `assessment_attempts`. El recruiter solo ve si aprobó/reprobó, sin saber qué áreas dominó. Tipo: **bug de implementación / gap UX**.

4. **⚠️ Faltan campos clave en perfil de empresa** — No hay stack tecnológico, modalidad de trabajo (remoto/híbrido), beneficios ni LinkedIn. Para CLT o Banco Continental, estos campos son parte del employer branding indispensable para atraer QA senior. Tipo: **gap de funcionalidad**.

5. **⚠️ Métricas B2B faltantes en dashboard** — No hay tracking de visitas al perfil público, ni funnel de invitaciones (enviadas → vistas → completadas), ni tasa de respuesta. Sin estas métricas, una empresa no puede evaluar el ROI de la plataforma. Tipo: **gap de funcionalidad**.

---

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Invitaciones sin email / token sin ruta | Bug | Sí 🚀 |
| 2 | Directorio `/empresas` inexistente | Gap funcionalidad | Sí 🚀 |
| 3 | `section_scores` descartado en UI | Bug | Sí 🚀 |
| 4 | Campos perfil faltantes (stack, modalidad, beneficios) | Gap funcionalidad | Sí 🚀 |
| 5 | Métricas B2B faltantes (funnel, views, tasa respuesta) | Gap funcionalidad | Sí 🚀 |
| 6 | URL pública con UUID (no slug) | UX problem | Parcial |
| 7 | Sin filtro de país en directorio de talento | UX problem | Sí (CLT quiere PY) 🚀 |
| 8 | Sin exportación CSV de resultados | Gap funcionalidad | Sí 🚀 |
| 9 | Sin comparación side-by-side de candidatos | Gap funcionalidad | No |
| 10 | Sin notificación a empresa al completar evaluación | Gap funcionalidad | Sí 🚀 |

---

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. El flujo de invitación externo está roto (sin email, sin ruta por token) — **no pueden invitar a candidatos que no están en la plataforma**
2. No pueden filtrar candidatos por Paraguay en el directorio de talento
3. No pueden exportar resultados para presentar a RRHH
4. El perfil de empresa no transmite suficiente employer branding para atraer QA

---

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- **Funnel de invitaciones** (`viewed_at` / `completed_at` en DB) — datos ya disponibles, solo falta la visualización. Con esto AIQUAA puede demostrar a una empresa cuántos candidatos respondieron su outreach.
- **Page views del perfil de empresa** — métrica clave para pitch: "X candidatos vieron tu empresa este mes".
- **Exportación CSV** — indispensable para empresas con procesos de RRHH formales (Banco Continental).
- **Filtro por país** — diferenciador LATAM: poder buscar QAs en PY/AR/CO específicamente.
- **Tasa de respuesta a invitaciones** — KPI que justifica la suscripción B2B.

---

### Foco del próximo ciclo (1 hora)

**Prioridad:** Flujo de invitaciones end-to-end

1. Implementar envío de email vía Resend en `createInvitacionAction` (con el `token` como link)
2. Crear ruta pública `/invitaciones/[token]` que muestre la invitación y lleve al candidato al proceso
3. Agregar widget de funnel (enviadas → vistas → completadas) en el dashboard usando datos ya en DB

Este ciclo desbloquea el caso de uso B2B core y habilita la demostración a CLT.

---

*Revisión generada automáticamente — 2026-06-27 · Rama: `claude/zen-noether-3olbit`*
