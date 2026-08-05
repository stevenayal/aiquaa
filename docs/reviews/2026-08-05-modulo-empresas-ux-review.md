# Revisión UX — Módulo de Empresas
**Fecha:** 5 de agosto de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código, ciclo programado)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente. Nota arquitectónica importante: desde el último ciclo (27/06), `apps/backend` (NestJS + Prisma) fue **eliminado del repositorio** (commit `a67bc38`, "migrated to Supabase"). Toda la lógica de este módulo vive ahora en **Next.js Server Actions** (`apps/frontend/src/actions/*.ts`) sobre **Supabase** (SQL migrations + RLS). Este ciclo es un **seguimiento** del ciclo del 27/06/2026 (`docs/reviews/2026-06-27-modulo-empresas-ux-review.md`): se verifica qué se corrigió, qué sigue pendiente y se documentan hallazgos nuevos. No se reportan supuestos — solo lo confirmado en código.

---

## 🟢 Seguimiento del ciclo anterior (27/06/2026)

De los 10 hallazgos clasificados el ciclo pasado, esto es lo que cambió:

| # | Hallazgo (27/06) | Estado ahora |
|---|---|---|
| 1 | Invitaciones sin email / token sin ruta | ✅ **Corregido** — `createInvitacionAction` envía email vía Resend; existe reenvío (`resendInvitacionEmailAction`) y cancelación; rutas públicas por token existen |
| 2 | Directorio `/empresas` inexistente | ✅ **Corregido** — `apps/frontend/src/app/empresas/page.tsx` lista todas las empresas con industria, país y modalidad |
| 3 | `section_scores` descartado en UI | ✅ **Corregido** — ahora se arma desde `assessment_scores` agrupado por `attempt_id` (comentario en código referencia ticket `#205`) |
| 4 | Campos perfil faltantes (stack, modalidad, beneficios, LinkedIn) | ✅ **Corregido** — sección "Employer branding QA" en `/empresa/perfil` con los 4 campos |
| 5 | Métricas B2B faltantes (funnel, views, tasa respuesta) | ✅ **Corregido** — `FunnelWidget` con tasa de respuesta + card "Visitas al perfil" en el dashboard |
| 6 | URL pública con UUID (no slug) | ❌ **Persiste** — `/empresas/${empresa.id}` sigue siendo UUID |
| 7 | Sin filtro de país en directorio de talento | ✅ **Corregido** — filtro país en `buscar-candidatos` y en tab "Talento" de `/empresa/candidatos` |
| 8 | Sin exportación CSV de resultados | ✅ **Corregido** — botón "Exportar CSV" en tab Evaluados |
| 9 | Sin comparación side-by-side de candidatos | ✅ **Corregido** — checkbox multi-select (máx. 4) + panel de comparación rápida en `/empresa/candidatos` |
| 10 | Sin notificación a empresa al completar evaluación | ✅ **Corregido** — `notifyEmpresaExamCompleted` en `actions/empresa-result-notifications.ts` |
| Extra | Filtros ISTQB con valores técnicos sin traducir | ✅ **Corregido** — labels legibles ("Foundation Level (CTFL)", etc.) en ambos directorios |
| Extra | Tipos de examen sin descripción al crear proceso | ✅ **Corregido** — cada `exam_type` en `/empresa/procesos/nuevo` ahora tiene descripción de contenido, duración y modo de corrección |

**9 de 10 hallazgos críticos del ciclo pasado están resueltos.** Es una ejecución sólida — el foco definido el 27/06 ("flujo de invitaciones end-to-end") se cumplió y se sumaron mejoras no pedidas (descripciones de examen, labels ISTQB). Esto habilita razonablemente una demo a CLT / Banco Continental en el flujo core de invitación → evaluación → resultado.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Sí, mejor que antes. La barra de completitud con enlaces ancla sigue siendo clara, y ahora hay 4 secciones bien separadas (Logo, Datos, Contexto laboral, Employer branding QA) con labels de sección explícitas.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Mucho más que en el ciclo anterior — el perfil público ahora puede mostrar stack tecnológico, modalidad, beneficios y LinkedIn. Pero el cálculo de completitud **no incluye estos 4 campos nuevos**, así que una empresa puede tener 100% de "completitud" mostrando un perfil sin stack, sin beneficios y sin LinkedIn — el indicador miente por omisión.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Barra de completitud desactualizada | `PROFILE_FIELDS` (perfil/page.tsx:81-90) solo cuenta 8 campos; no incluye `tech_stack`, `benefits`, `linkedin_url`, `qa_team_size` — los 4 campos agregados este ciclo pasado | **A** | Agregar los 4 campos nuevos a `PROFILE_FIELDS` para que la barra refleje el perfil real | Bug de implementación (regresión silenciosa) |
| URL pública con UUID | `/empresas/${empresa.id}` sigue sin slug memorable — persiste desde el ciclo anterior | **A** | Generar slug desde `nombre_comercial` (ej. `/empresas/banco-continental`) con fallback a UUID | Incompleto (no resuelto) |
| `country='PY'` precargado | El formulario inicializa `country: 'PY'` incluso antes del primer guardado — sigue generando completitud "gratis" | **M** | Usar `''` como default y forzar selección explícita | Incompleto (no resuelto) |
| RUC sin adaptar por país | La validación regex de RUC (`/^\d{6,8}-\d$/`) solo aplica si `country === 'PY'`; para otros países el campo queda sin validar ni renombrar (RUC/NIT/CUIT/RFC) | **B** | Renombrar dinámicamente el label y validar según país seleccionado | Parcial |
| Sin opción "Eliminar logo" | Solo existe "Cambiar logo" (línea 384-389); no hay forma de quitarlo sin subir uno nuevo | **B** | Agregar botón "Eliminar" con confirmación junto al logo | Incompleto |
| Contador de caracteres inconsistente | `description` (800) y `benefits` (500) tienen contador `{n}/max`; `razon_social` (120) y `nombre_comercial` (80) no | **B** | Agregar contador a los 2 campos restantes para consistencia visual | Parcial |
| Preview inline ausente | Sigue existiendo solo el link externo "Ver perfil →"; no hay vista previa sin salir de la pantalla de edición | **B** | Modal o panel colapsable de preview (ya sugerido en ciclo anterior) | Incompleto (no resuelto) |
| Redes sociales limitadas | Solo LinkedIn; sin Instagram/X — de menor prioridad para el caso B2B core | **B** | Bajo valor por ahora, no priorizar este ciclo | Sin cambios |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Sí, ahora sí. Los niveles ISTQB se muestran con labels completos ("Advanced Level - Test Analyst") en vez de códigos crudos, tanto en `/empresa/buscar-candidatos` como en la pestaña "Talento" de `/empresa/candidatos`.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Sí, resuelto. `buscar-candidatos` tiene botones "Guardar" (shortlist) e "Invitar" inline por fila, con modal de invitación que permite elegir proceso y mensaje personalizado — ya no hay que saltar a otro módulo.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Límite 500 resultados hardcoded | `exam_results` en `/empresa/candidatos` sigue con `.limit(500)` sin paginación ni aviso | Persiste desde el ciclo anterior; a medida que la plataforma crece, resultados se truncan silenciosamente sin que el recruiter lo sepa | Implementar paginación real o mostrar aviso "mostrando los 500 más recientes" | **M** |
| CSV solo en pestaña "Evaluados" | El botón "Exportar CSV" no existe en pestañas "Talento" ni "Shortlist" | Un recruiter que arma su shortlist en `buscar-candidatos` no puede exportarla para RRHH | Extender exportCSV a las 3 pestañas | **M** 🚀 |
| Comparación no disponible en `buscar-candidatos` | El checkbox de comparación (máx. 4) solo existe en `/empresa/candidatos`; en `buscar-candidatos` no hay forma de comparar candidatos del pool de talento antes de invitar | Recruiter debe ir a otra página para comparar | Agregar mismo patrón de selección/comparación a `buscar-candidatos` | **B** |
| Búsqueda por skill funciona pero es "AND" implícito | Selección múltiple de chips de skills (`toggleSkill`) — no queda claro en la UI si el filtro es AND u OR entre skills seleccionados | Ambigüedad: un recruiter que selecciona "Cypress" + "SQL" no sabe si busca candidatos con ambas o cualquiera | Agregar texto explicativo breve ("candidatos con todas estas skills") | **B** |
| Contador de resultados presente | "`{filteredCandidates.length}` de `{candidates.length}` perfiles" | Bien implementado — buena práctica de transparencia | — | Bueno |
| Empty state sin candidatos | Mensaje "Sin candidatos para estos filtros" con sugerencia de ajustar filtros | Bien resuelto — cumple lo pedido en el ciclo anterior | — | Bueno |
| Mensaje de privacidad del pool | "Explora perfiles opt-in... sin exponer emails" — se comunica bien la protección de privacidad | Buena práctica de confianza para el candidato | — | Bueno |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
Sí, ahora sí — cada tipo de examen en `/empresa/procesos/nuevo` incluye descripción de contenido, formato de corrección (auto-corregido / manual) y a veces duración. Mejora clara respecto al ciclo anterior.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Sí, en el flujo de procesos con código — el desglose por sección ahora se muestra. Sigue habiendo un flujo paralelo (`empresa_pruebas`, tests propios de la empresa) que no fue revisado con el mismo nivel de detalle este ciclo.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Invitación directa a candidato (email) | Completo | Funciona end-to-end con Resend, reenvío y cancelación | — | Bueno |
| Invitación a tests propios de empresa (`empresa_pruebas`) | Incompleto | Según mapeo de código, este flujo paralelo de tests personalizados no dispara email al candidato — el link debe compartirse manualmente | Aplicar el mismo patrón de envío por Resend que ya existe para `empresa_invitaciones` | **A** 🚀 |
| Dos rutas de invitación por token (`/invitacion/[token]` y `/invitaciones/[token]`) | Ambas existen en el repo | Riesgo de confusión: si un candidato recibe un link a la ruta no mantenida, puede ver una versión desactualizada del flujo | Confirmar cuál es la ruta activa/mantenida y eliminar o redirigir la otra | **M** |
| Desglose por sección (`section_scores`) | Completo | Ya no se descarta — se arma desde `assessment_scores` agrupado por intento | — | Bueno |
| Comparar candidatos entre sí | Completo | Panel de comparación rápida con score y aprobados/total | Podría agregar desglose por sección en la comparación, no solo el score total | **B** |
| Fecha límite / timeout de proceso | No verificado este ciclo | `expires_at` existía en el ciclo anterior sin alerta de vencimiento; no se confirmó si se agregó un aviso | Verificar en el próximo ciclo si hay badge de "vence pronto" | **B** (pendiente de verificar) |
| Selección de tipo de evaluación al crear proceso | Completo | Descripciones claras de contenido y modo de corrección por tipo de examen | — | Bueno |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Visitas al perfil | Sí | Implementado como card fija (antes era gap crítico) | — | Alto |
| Funnel de invitaciones (enviadas → vistas → completadas) | Sí | Solo se muestra si `funnel.total > 0` — para una empresa nueva sin invitaciones enviadas, no hay indicio de que la funcionalidad existe | Mostrar el widget en estado vacío con un CTA "Enviá tu primera invitación" | Medio |
| Tasa de respuesta a invitaciones | Sí | Se calcula y muestra dentro del `FunnelWidget` | — | Alto |
| Candidatos evaluados (aprobados vs reprobados) | Parcial | El stat card principal sigue mostrando el total sin desglose de aprobados/reprobados en la misma tarjeta (el desglose sí existe en `/empresa/candidatos`) | Agregar color semáforo o desglose "X aprobados / Y reprobados" directo en el dashboard | Medio |
| Comparación entre procesos | No | Sigue sin existir tabla resumen proceso-a-proceso (pass rate, score promedio) en el dashboard ni en `/empresa/procesos` (no verificado este ciclo si se agregó ahí) | Agregar tabla comparativa de KPIs por proceso | Alto |
| Top skills QA disponibles este mes | No | Sigue sin esta métrica de market intelligence | Widget "Skills más evaluados en AIQUAA este mes" — diferenciador para el pitch de Moonshot | Medio 🚀 |
| Gráficos 6 meses | Sí | Bien implementados con Recharts, responsive | — | Bueno |
| Empty state sin actividad | Sí | CTA doble ("Crear primer proceso" / "Completar perfil") bien resuelto | — | Bueno |
| Banner de bienvenida descartable | Sí | Persistencia en localStorage, buena práctica de no repetir el mensaje | — | Bueno |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨 Regresión en la barra de completitud del perfil** — Los 4 campos de employer branding agregados el ciclo pasado (stack, modalidad, beneficios, LinkedIn) no están incluidos en `PROFILE_FIELDS`, por lo que una empresa puede llegar a "100% completo" sin haberlos llenado. El indicador de progreso miente. Tipo: **bug de implementación** (regresión).

2. **⚠️ Flujo de tests propios de empresa (`empresa_pruebas`) sin email** — A diferencia del flujo de invitación estándar (que sí envía email vía Resend), el flujo de tests personalizados que la empresa arma por su cuenta no notifica al candidato — el link debe compartirse manualmente. Inconsistente con el resto del producto. Tipo: **gap de funcionalidad**.

3. **⚠️ URL pública de empresa sigue sin slug** — Persiste desde el ciclo anterior. Para employer branding, un link como `aiquaa.com/empresas/banco-continental` es mucho más presentable en un job posting o LinkedIn que un UUID. Tipo: **gap de funcionalidad** (deuda de ciclos anteriores).

4. **⚠️ Sin comparación entre procesos en el dashboard** — Persiste desde el ciclo anterior. Para Banco Continental (múltiples procesos simultáneos), no hay forma de ver de un vistazo qué proceso tiene mejor tasa de aprobación o score promedio. Tipo: **gap de funcionalidad**.

5. **Dos rutas de invitación por token coexistiendo** (`/invitacion/[token]` vs `/invitaciones/[token]`) — riesgo de deuda técnica silenciosa: si una quedó desactualizada, un candidato podría llegar a un flujo roto sin que nadie lo note hasta que falle en producción. Tipo: **bug potencial / deuda técnica**.

### Clasificación completa (hallazgos nuevos de este ciclo)

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Completitud de perfil no cuenta employer branding | Bug (regresión) | Sí — perfil puede verse "completo" y no atraer QA 🚀 |
| 2 | Tests propios de empresa sin email al candidato | Gap funcionalidad | Parcial — solo afecta a empresas que usan `empresa_pruebas` en vez del flujo estándar |
| 3 | URL pública sin slug | Gap funcionalidad | No bloqueante, pero relevante para el pitch 🚀 |
| 4 | Sin comparación entre procesos en dashboard | Gap funcionalidad | Sí para Banco Continental (multi-proceso) 🚀 |
| 5 | Rutas de invitación por token duplicadas | Deuda técnica | Riesgo latente, no confirmado como roto |
| 6 | Límite 500 resultados sin aviso | Gap funcionalidad | No aún (bajo volumen actual), pero silencioso |
| 7 | CSV export limitado a pestaña Evaluados | Gap funcionalidad | No |
| 8 | Sin "Top skills del mes" en dashboard | Gap funcionalidad | No, pero fortalece pitch Moonshot 🚀 |

### Partes del módulo que ya NO bloquean el uso real (resuelto desde el 27/06)

- Invitar candidatos externos (con email) ✅
- Descubrir empresas activas desde `/empresas` ✅
- Ver desglose de evaluación por sección ✅
- Employer branding en el perfil (aunque con bug de completitud, ver #1) ✅
- Exportar resultados a CSV para RRHH ✅
- Filtrar candidatos por país (clave para CLT) ✅

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El ciclo de invitaciones (funnel + tasa de respuesta + reenvío) ya es demostrable end-to-end a un cliente piloto.
- El directorio público `/empresas` y los perfiles con employer branding son un activo de marketing B2B reutilizable en el pitch.
- Un widget de "Top skills evaluados este mes" (aún no implementado) sería un diferenciador de market intelligence único en LATAM — vale la pena priorizarlo pronto.
- Corregir la barra de completitud (#1) antes de cualquier demo a CLT/Banco Continental — mostrar un perfil "100% completo" sin stack tecnológico ni beneficios sería contraproducente en vivo.

### Foco del próximo ciclo (1 hora)

**Prioridad:** Cerrar la brecha de confianza en el perfil de empresa + destrabar el flujo de tests propios

1. Corregir `PROFILE_FIELDS` para incluir `tech_stack`, `benefits`, `linkedin_url`, `qa_team_size` en el cálculo de completitud.
2. Agregar envío de email vía Resend a las invitaciones de `empresa_pruebas` (tests propios), replicando el patrón ya probado en `empresa-invitaciones.ts`.
3. Confirmar cuál de las dos rutas de token (`/invitacion/[token]` vs `/invitaciones/[token]`) es la vigente y eliminar/redirigir la otra.
4. Si alcanza el tiempo: agregar slug a la URL pública de empresa.

Este ciclo cierra la deuda de confianza más visible (el perfil "miente" sobre su completitud) antes de cualquier demo en vivo a un cliente piloto.

---

### Nota sobre creación de tickets en Jira

Este ciclo se ejecutó de forma automática (rutina programada, sin sesión interactiva) y **no tiene acceso configurado a la API de Jira** (`aiquaa.atlassian.net`). Los 8 hallazgos de la tabla de clasificación están redactados en formato listo para copiar como tickets (título = hallazgo, descripción = columna "Hallazgo" + contexto de este documento, impacto = columna "Bloqueante para piloto", prioridad según el ciclo). Se recomienda cargarlos manualmente o conectar la integración de Jira para que el próximo ciclo pueda crearlos directamente.

---

*Revisión generada automáticamente — 2026-08-05 · Rama: `claude/zen-noether-it9hm5` · Ciclo de seguimiento de `docs/reviews/2026-06-27-modulo-empresas-ux-review.md`*
