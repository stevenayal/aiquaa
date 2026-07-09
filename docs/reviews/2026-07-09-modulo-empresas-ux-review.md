# Revisión UX — Módulo de Empresas
**Fecha:** 9 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, migraciones de Supabase). Se documentan solo hallazgos confirmados en el código — no supuestos. Este ciclo parte de la revisión anterior (`2026-06-27-modulo-empresas-ux-review.md`) y **verifica cada hallazgo previo contra el código actual** en vez de darlo por vigente.

> **Corrección de arquitectura:** CLAUDE.md describe un backend NestJS + Prisma. **No existe en este repo** — no hay `apps/backend` ni `schema.prisma`. El módulo Empresas corre 100% sobre Next.js Server Actions + Supabase (Postgres/RLS/RPCs). Los ADRs 001 y 005 describen un backend que nunca se construyó. Se deja constancia porque afecta cómo se interpreta cualquier hallazgo futuro sobre "el backend".

---

## 🎉 Progreso desde el ciclo anterior (12 días)

De los 5 hallazgos críticos del 27/06, **4 fueron resueltos o parcialmente resueltos** y uno reveló un bug más profundo al verificarlo:

| Hallazgo previo | Estado ahora |
|---|---|
| Invitaciones sin email | ✅ Implementado con Resend — pero ⚠️ ver hallazgo nuevo abajo (flag apagado por defecto) |
| Directorio público `/empresas` inexistente | ✅ Implementado, con chips de industria/país/modalidad |
| `section_scores` descartado | 🟡 Corregido en la vista que usan los recruiters (`candidatos/page.tsx`); sigue en `null` en el helper interno de stats (código muerto, no afecta UX) |
| Campos de perfil faltantes (stack, modalidad, beneficios, LinkedIn) | ✅ Todos implementados en `/empresa/perfil` |
| Métricas B2B faltantes (funnel, page views, tasa de respuesta) | ✅ Implementadas en el dashboard |

Además, apareció una **feature nueva y completa**, ausente en el ciclo anterior: **pruebas técnicas personalizadas por empresa** (`empresa_pruebas` — autoría de preguntas propias, invitación por link, rendición con temporizador, autocorrección y ranking). Los commits son de **hoy, 9 de julio**.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Sí, mejor que antes. La barra de completitud con anclas a campos faltantes sigue funcionando, y ahora el perfil incluye una sección completa de "Employer branding QA" (stack, modalidad, beneficios, LinkedIn) claramente separada de los datos básicos.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Mucho más que en el ciclo anterior — el perfil público ahora muestra stack tecnológico, modalidad de trabajo y beneficios, que es justo lo que un QA evalúa antes de postularse. Pendiente: la URL sigue siendo un UUID.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| CTA "Crear cuenta" en perfil público | 🚨 **Bug confirmado**: el link apunta a `href="/registro"` (`empresas/[id]/page.tsx:263`), pero la ruta real es `/register`. Un candidato que hace clic desde el perfil público de una empresa recibe un 404 | **A** | Cambiar `/registro` → `/register` en ambos archivos afectados | **Roto** |
| Campos de identidad profesional (stack, modalidad, beneficios, LinkedIn) | Resuelto — sección "Employer branding QA" completa con tags de stack, botones de modalidad, textarea de beneficios y LinkedIn | — | — | **Completo** |
| Directorio público `/empresas` | Resuelto — listado con logo, industria, país, modalidad | Falta: buscador o filtro interactivo en el directorio (los datos existen pero no hay `<input>` de búsqueda ni `<select>` de industria en la página) | Agregar barra de búsqueda + filtro por industria/país client-side | **Parcial** |
| URL pública del perfil | Sigue siendo UUID (`/empresas/{uuid}`), no memorable ni compartible en LinkedIn/CV | **M** | Generar slug desde `nombre_comercial` | Incompleto |
| Completitud por defecto | `country='PY'` sigue precargado en el form (`perfil/page.tsx:124,145`) generando falso avance en la barra de completitud | **M** | Calcular completitud solo si el usuario editó el campo explícitamente | Incompleto |
| Contador `profile_views` sin protección | El RPC `increment_empresa_profile_views` es invocado desde una página pública sin autenticación ni rate-limit — cualquiera puede inflar la métrica de una empresa (que se muestra en su propio dashboard) repitiendo la request | **M** | Deduplicar por IP+empresa+ventana horaria, o exigir sesión | Incompleto |
| Eliminar logo | Sigue sin existir botón "Eliminar logo", solo "Cambiar logo" | **B** | Agregar botón de eliminar con confirmación | Incompleto |
| Contador de caracteres | `razon_social`/`nombre_comercial` siguen sin contador visual (sí lo tienen `description` y `benefits`) | **B** | Agregar `{n}/120` como en descripción | Parcial |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Mejor que antes: los niveles ISTQB ahora se muestran con etiquetas completas ("Foundation Level (CTFL)") en vez de códigos crudos (`ctfl`). Sigue faltando una explicación de la jerarquía de certificaciones para alguien sin trasfondo QA.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Sí — resuelto. "Invitar" y "Guardar" (shortlist) están ahora inline en cada fila del directorio de talento, sin salir de la pantalla.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país | ✅ Implementado en `/empresa/buscar-candidatos` y en la tab "Talento QA" | — | — | Resuelto |
| Invitar candidato inline | ✅ Botón "Invitar" con modal directo en la fila del candidato, sin cambiar de módulo | — | — | Resuelto |
| Exportar CSV | ✅ Implementado en la tab "Evaluados" (`exportCSV()`), con BOM UTF-8 para Excel | — | — | Resuelto |
| Comparación side-by-side | ✅ Selección múltiple (hasta 4) con panel comparativo | — | — | Resuelto |
| Shortlist/favoritos | ✅ Tabla `empresa_favoritos`, tab dedicada "Shortlist" | — | — | Resuelto |
| RPC de sourcing recién reparado | La migración `20260702_220000_empresa_candidate_sourcing.sql` incluye un comentario propio indicando que la función **nunca se había aplicado a producción** y que `/empresa/buscar-candidatos` fallaba con "Could not find the function" | Verificar en el ambiente real (Railway/Vercel + Supabase prod) que esta migración esté aplicada — si no, todo el Bloque 2 está roto en producción aunque el código esté listo | **CRÍTICO — verificar antes del piloto** 🚀 | **A confirmar** |
| Límite 500 resultados (hardcoded) | Sigue presente en `candidatos/page.tsx:188` (`.limit(500)`) para el pool de talento de toda la plataforma | Truncamiento silencioso a medida que crece la base de candidatos | Paginar o alertar al alcanzar el límite | **M** |
| Filtros ISTQB sin explicación de jerarquía | Labels completos ahora, pero sin tooltip de qué es CTFL vs Advanced | Un recruiter no-QA sigue sin contexto de cuál nivel pedir | Agregar tooltip/link "¿Qué es ISTQB?" | **B** |
| Duplicación de lógica de filtros | La tab "Talento QA" en `/empresa/candidatos` y la página `/empresa/buscar-candidatos` implementan filtros muy similares por separado (país/ISTQB/búsqueda), compartiendo solo helpers de `candidateDirectory.ts` | Mantenimiento duplicado, riesgo de que diverjan en UX | Unificar en un solo componente de directorio de talento | **B** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

Este bloque tiene **dos sistemas paralelos** que conviene distinguir con claridad para no mezclar hallazgos:
- **3a. Invitaciones a procesos de selección** (`empresa_invitaciones` + `hiring_processes`) — el flujo maduro, ya auditado en el ciclo anterior.
- **3b. Pruebas técnicas propias de la empresa** (`empresa_pruebas`) — feature nueva de hoy, evaluada por primera vez.

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
Sí, resuelto para 3a: `/empresa/procesos/nuevo` ahora muestra descripción, duración y tipo de corrección de cada examen disponible.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Sí, mejor que antes: el desglose por sección (`section_scores`) ahora se muestra en la vista de candidatos que usan los recruiters.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Descripciones de tipos de examen (3a) | ✅ Completo | `EXAM_OPTIONS` en `procesos/nuevo/page.tsx` ahora incluye descripción, duración y método de corrección por cada tipo | — | Resuelto |
| Envío de email al invitar (3a) | 🟡 Implementado pero **apagado por defecto y sin documentar** | El envío depende de `EMAIL_SENDING_ENABLED === 'true'`, una variable que **no aparece en `env.local.example` ni en `env.production`**. En cualquier ambiente configurado siguiendo esos ejemplos, el email nunca sale — y `createInvitacionAction` devuelve éxito igual, sin avisar al recruiter que el candidato no fue notificado | **Documentar la variable y activarla en producción; o alertar en la UI cuando `email_sent=false`** | **CRÍTICO** 🚀 |
| Ruta pública del token de invitación (3a) | 🟡 Rota en el enlace real | El email enviado apunta a `/invitaciones/{token}` (plural), cuyo botón "Crear cuenta" linkea a `/registro` — ruta inexistente (ver Bloque 1). Además existe `/invitacion/{token}` (singular) con el link correcto a `/register`, pero **no lo referencia nada del código** — parece código huérfano de una versión anterior | Eliminar la ruta singular huérfana o consolidar en una sola; arreglar el link roto en la ruta plural (la que realmente se usa) | **CRÍTICO** 🚀 |
| Desglose por sección — vista recruiter (3a) | ✅ Completo | `candidatos/page.tsx` ahora joinea `assessment_scores`/`assessment_sections` y muestra el detalle por área | — | Resuelto |
| Desglose por sección — helper interno (3a) | Código muerto | `employer.ts:423` sigue forzando `section_scores: null` en `fetchAssessmentAttemptsForProcessCodes`, pero esa función no alimenta ninguna vista con desglose visible — inconsistencia de código, no de UX | Limpiar o unificar con la lógica ya correcta de `candidatos/page.tsx` | **B** |
| Repositorio GitHub obligatorio (3a) | Fricción nueva | `/empresa/procesos/nuevo` exige una URL de repo de GitHub válida **incluso si el proceso no incluye ningún examen de Git** (p. ej. un proceso solo con ISTQB) | Hacer el campo condicional a que se seleccione un examen tipo Git | **M** |
| Autoría de pruebas propias (3b) | ✅ Completo y funcional | Flujo completo: crear prueba → agregar preguntas → generar link de invitación → candidato rinde con temporizador → autocorrección → ranking con medallas top 3. No es un stub | — | Nuevo — Resuelto |
| Notificación al candidato (3b) | **Roto — gap de funcionalidad** | A diferencia de 3a, este flujo **no tiene ninguna integración de email**. El recruiter debe copiar el link manualmente y pegarlo en su propio canal (WhatsApp/email/Slack) | Reusar `sendEmail`/Resend del flujo 3a para notificar automáticamente | **A** 🚀 |
| Fecha límite / timeout | Parcial | `expires_at` existe en procesos (3a) pero sin alerta de "vence pronto"; en pruebas propias (3b) el temporizador de rendición sí funciona (auto-submit) | Agregar badge de vencimiento próximo en `/empresa/procesos` | **M** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

Este bloque está sustancialmente más completo que en el ciclo anterior: **las dos métricas marcadas "Crítico 🚀" (visitas al perfil y funnel de invitaciones) ya están implementadas**, con datos reales de Supabase, no mock.

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Visitas al perfil público | **Sí** (nuevo) | Ver Bloque 1 — sin protección anti-abuso, el número puede estar inflado | Deduplicar antes de confiar en el número para el pitch de Moonshot | **Crítico** 🚀 |
| Funnel invitaciones → vistas → completadas | **Sí** (nuevo) | Bien implementado con `tasaRespuesta` calculada | — | **Crítico** 🚀 (ya resuelto) |
| Invitaciones activas / prospectos pendientes | Sí | Badges numéricos claros, clickeables | — | Alto |
| Métricas por evento/proceso (aprobación, mejor score) | **Sí** (`getEventStatsAction`, no visto en el ciclo anterior) | Va más allá de lo pedido: incluye "aprobación macro" (≥60% de exámenes requeridos) | — | Alto |
| Comparación entre procesos sueltos (sin evento) | Parcial | Existe para procesos agrupados en un evento, no para procesos individuales | Extender la tabla comparativa a todos los procesos | Medio |
| Top skills QA disponibles este mes | **No** | Sigue sin existir — oportunidad de market intelligence | Widget "Skills más evaluados en AIQUAA este mes" | Medio |
| Divergencia dashboard vs. RLS | N/A (hallazgo técnico) | El código comenta explícitamente que el dashboard filtra por `empresa_id` para evitar fuga cross-tenant, pero eso puede hacer que un proceso legado con `empresa_id` nulo aparezca en `/empresa/procesos` (vía RLS) y no en las stats del dashboard | Revisar consistencia de conteos en un chequeo de regresión dedicado | **M** |
| Gráficos 6 meses | Sí | Bien implementados, responsive | — | Bueno |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨 Link "Crear cuenta" roto en dos pantallas clave** (`/empresas/[id]` y `/invitaciones/[token]`) — apunta a `/registro`, ruta inexistente; la ruta real es `/register`. Cualquier candidato externo que intente registrarse desde el perfil público de una empresa o desde el email de invitación cae en un 404. Tipo: **bug**. Es el hallazgo de mayor impacto directo del ciclo porque rompe la entrada al funnel B2B justo donde más tráfico externo llega.

2. **🚨 Envío de email de invitación apagado por defecto y no documentado** — `EMAIL_SENDING_ENABLED` no figura en ningún `.env.example`; si el ambiente se configuró siguiendo la documentación del repo, las invitaciones nunca llegan por email y el sistema no avisa. Efectivamente el mismo problema crítico del ciclo anterior, un nivel más profundo. Tipo: **bug / gap de configuración**.

3. **🚨 RPC de sourcing de candidatos con historial de no estar aplicado en producción** — la propia migración de `get_empresa_candidate_sourcing` documenta que la función faltaba en prod y rompía `/empresa/buscar-candidatos`. No se pudo verificar el estado del ambiente real desde este ciclo (solo código). Tipo: **riesgo de despliegue — requiere verificación manual antes de la demo a CLT/Banco Continental**.

4. **⚠️ Pruebas técnicas propias (`empresa_pruebas`) sin notificación por email** — feature nueva y completa, pero el candidato solo se entera de la evaluación si el recruiter le pasa el link manualmente. Tipo: **gap de funcionalidad** en una feature recién lanzada.

5. **✅ Progreso notable:** 4 de los 5 hallazgos críticos del ciclo anterior (perfil incompleto, directorio inexistente, métricas B2B faltantes, flujo de invitación fragmentado) están resueltos o casi resueltos. El módulo avanzó significativamente en 12 días.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Link roto `/registro` → `/register` | Bug | Sí 🚀 |
| 2 | Email de invitación apagado por flag no documentado | Bug / config | Sí 🚀 |
| 3 | RPC de sourcing con historial de no aplicarse en prod | Riesgo de despliegue | Sí — verificar 🚀 |
| 4 | Ruta huérfana `/invitacion/[token]` (singular) duplicando `/invitaciones/[token]` | Tech debt / bug potencial | Parcial |
| 5 | Pruebas propias sin email al candidato | Gap de funcionalidad | Sí 🚀 |
| 6 | Profile views sin protección anti-abuso | Gap de seguridad/UX | No (pero afecta credibilidad de la métrica en el pitch) 🚀 |
| 7 | Sin buscador/filtro interactivo en el directorio público `/empresas` | Problema UX | No |
| 8 | Repo GitHub obligatorio incluso sin examen de Git | Problema UX | Parcial |
| 9 | Límite hardcoded de 500 en talento QA | Gap de funcionalidad | No (aún) |
| 10 | Sin widget "Top skills del mes" | Gap de funcionalidad | No |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. Un candidato externo no puede registrarse desde el perfil público de la empresa ni desde el email de invitación (link roto) — rompe la adquisición de candidatos justo en el punto de entrada.
2. Las invitaciones por email pueden no estar saliendo en absoluto si el ambiente de producción no seteó manualmente `EMAIL_SENDING_ENABLED=true` (variable no documentada).
3. Debe verificarse manualmente que la función de sourcing de candidatos esté aplicada en el Supabase de producción antes de cualquier demo — hay antecedente documentado de que no lo estaba.
4. Las pruebas técnicas propias (feature de hoy) no notifican al candidato — utilizable solo si el recruiter maneja el envío del link por su cuenta.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- **Funnel de invitaciones y visitas al perfil** ya están en el dashboard con datos reales — se puede mostrar a CLT "X candidatos vieron tu empresa, Y respondieron tu invitación" en la demo, siempre que se corrija la falta de protección anti-abuso antes de citar el número.
- **Pruebas técnicas propias de la empresa** (lanzadas hoy) son un diferenciador fuerte: permite a Banco Continental crear sus propias evaluaciones sin depender del catálogo ISTQB/Git de AIQUAA — vale la pena destacarlo como feature nueva en el próximo pitch, una vez resuelto el gap de email.
- **Exportación CSV y comparación de candidatos** ya resueltas — cubren la necesidad de reportar a RRHH formal que Banco Continental necesitaría.
- **Filtro por país + shortlist + invitación inline** — flujo de sourcing ahora fluido de punta a punta, siempre que se confirme que el RPC subyacente está desplegado en prod.

### Foco del próximo ciclo (1 hora)

**Prioridad: Cerrar los puntos de fuga del funnel de adquisición de candidatos, no seguir agregando features nuevas.**

1. Arreglar el link `/registro` → `/register` en `empresas/[id]/page.tsx` y `invitaciones/[token]/page.tsx` (cambio de una línea, alto impacto).
2. Documentar `EMAIL_SENDING_ENABLED` en `env.local.example`/`env.production` y confirmar que está `true` en el ambiente de producción real; agregar aviso en la UI cuando `email_sent=false` tras crear una invitación.
3. Verificar en el Supabase de producción que `get_empresa_candidate_sourcing()` existe y responde — si no, aplicar la migración pendiente antes de cualquier demo a CLT/Banco Continental.
4. Decidir si se elimina la ruta huérfana `/invitacion/[token]` o se consolida con `/invitaciones/[token]`.
5. Si queda tiempo: conectar el envío de email (reusando `lib/resend.ts`) al flujo de pruebas propias (`empresa_pruebas`).

Este ciclo prioriza que lo que ya está construido funcione de punta a punta en producción, antes de sumar superficie nueva.

---

*Revisión generada automáticamente — 2026-07-09 · Rama: `claude/zen-noether-ppld8t`*
