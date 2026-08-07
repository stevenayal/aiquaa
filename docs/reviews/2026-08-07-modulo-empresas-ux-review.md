# Revisión UX — Módulo de Empresas
**Fecha:** 7 de agosto de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código fuente + datos en vivo de Supabase)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)
**Revisión previa:** [2026-06-27](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, migraciones SQL) **+ inspección de datos en vivo** vía Supabase MCP contra el proyecto de producción `cbkctkpyxwbufvbwxogp`. Cada hallazgo cita archivo:línea o resultado de query. No se reportan supuestos — solo lo verificado en este ciclo. Cuatro sub-revisiones paralelas (una por bloque) alimentaron esta síntesis.
>
> **Corrección de contexto:** `CLAUDE.md` y los ADR-001/ADR-005 describen un backend NestJS + Prisma que **no existe en el repositorio**. La arquitectura real es Next.js App Router hablando directo con Supabase vía Server Actions (`apps/frontend/src/actions/*.ts`), con autorización resuelta por RLS y funciones `SECURITY DEFINER`. No es un hallazgo de UX de este módulo, pero es un riesgo de onboarding para cualquier humano o agente que use `CLAUDE.md` como fuente de verdad — se recomienda actualizarlo en un ciclo aparte.

---

## 🧭 Hallazgo transversal del ciclo

La mayoría de los bugs "críticos" del 27 de junio están **arreglados en el código**. El problema de este ciclo no es funcionalidad faltante — es que **el sistema entero está a cero actividad real**:

| Tabla | Filas en producción | Lo que implica |
|---|---|---|
| `empresa_invitaciones` | **0** | El flujo de invitación por email/token nunca se ejecutó una sola vez en producción, pese a estar codificado |
| `empresa_pruebas` / `empresa_preguntas` / `empresa_prueba_invitaciones` / `empresa_intentos` | **0 cada una** | El constructor de pruebas propias (shippeado hace ~1 mes) no tiene ni un solo uso real |
| `profiles` con `talent_visible_to_empresas=true` | **1 de 104** | El buscador de candidatos QA está funcionalmente vacío |
| `empresa_favoritos` | **0** | Consecuencia directa de lo anterior, no un bug |
| Perfil de **CLT** (cliente piloto) | `industry, logo_url, website_url, description, work_mode, tech_stack, benefits, linkedin_url` = **todos null**; **0 hiring_processes** | El cliente piloto que se usa como vara de medida no ha completado su propio perfil ni corrido un proceso |

Esto cambia la conclusión del ciclo: **no es un problema de construir más features — es un problema de activación**. Antes de la próxima demo a CLT/Banco Continental hay que forzar/asistir la carga de datos reales (perfil, invitaciones, opt-in de candidatos), o el pitch se hará sobre pantallas vacías.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter entiende en menos de 30 segundos cómo completar su perfil?**
Mecánicamente sí — la barra de completitud con anchors a campos faltantes sigue funcionando. Pero el problema de "avance falso" de junio **persiste**: `country` tiene `DEFAULT 'PY'` a nivel de base de datos, confirmado en las 3 empresas reales (`Aiquaa`, `AIQUAA`, `CLT` → las 3 con `country='PY'` sin que nadie lo haya tocado), dando 25% de completitud sin acción real. Además, hallazgo **nuevo**: la sección "Employer branding QA" (`tech_stack`, `benefits`, `linkedin_url`, `qa_team_size`) no está incluida en el cálculo de completitud — un perfil puede marcar 100% sin tener ninguno de estos campos.

**¿El perfil público inspira confianza a un candidato QA?**
No, en la práctica. El código ya soporta stack, modalidad, beneficios y LinkedIn, pero **ninguna de las 3 empresas reales completó ninguno de estos campos**. El perfil de CLT específicamente (el cliente piloto) se vería, hoy, como: ícono genérico, solo el nombre, sin descripción, sin stack, sin beneficios, y "Procesos activos" en estado vacío.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Stack, modalidad, beneficios, LinkedIn | Campos existen en schema y UI, pero 0/3 empresas reales los completó | A | Onboarding forzado o recordatorio para completar branding tras el alta | Completo (funcionalidad) / Incompleto (adopción) |
| URL pública del perfil | Sigue siendo UUID crudo (`/empresas/[id]`), sin columna `slug` | A | Generar slug desde `nombre_comercial` | Incompleto — sin cambios desde junio |
| Directorio público `/empresas` | Existe y renderiza, pero **no está enlazado en ningún lugar** — `Header.tsx` y `Footer.tsx` no lo mencionan | A | Enlazar desde Header/Footer/home para candidatos | Huérfano — funciona pero es indescubrible |
| Completitud por defecto | `country='PY'` cuenta como campo completo sin acción del usuario | M | Excluir `country` del cálculo hasta guardado explícito | Incompleto — sin cambios |
| Branding fuera del cálculo de completitud | `tech_stack`/`benefits`/`linkedin_url`/`qa_team_size` no suman al score de completitud | M | Incluir estos campos o mostrar un segundo indicador "branding" | Nuevo hallazgo |
| Preview inline | Solo link externo "Ver perfil →", sin modal | M | Modal de preview embebido | Incompleto — sin cambios |
| Validación `linkedin_url` | Sin regex de formato ni `maxLength` (a diferencia de `website_url` y `ruc`, que sí validan) | M | Validar dominio linkedin.com | Parcial — campo nuevo sin validar |
| Eliminar logo | Solo "Cambiar logo", no hay "Eliminar" | B | Botón con confirmación | Incompleto — sin cambios |
| Contador de caracteres | `razon_social`/`nombre_comercial` sin contador; `description`/`benefits` (nuevo) sí lo tienen | B | Agregar a los 2 campos originales | Parcial |
| RUC dinámico por país | Label siempre "RUC"; no valida NIT/CUIT/RFC para otros países | B | Renombrar dinámicamente por país | Incompleto — sin cambios |
| Revalidación del directorio | `export const revalidate = 300` declarado pero la página usa `cookies()`, que fuerza render dinámico — posible código muerto; ninguna acción de guardado llama `revalidatePath` | B | Verificar comportamiento real en runtime desplegado | No verificable estáticamente |

### Veredicto de los 10 hallazgos de junio

| # | Hallazgo (27-jun) | Estado |
|---|---|---|
| 1 | Invitaciones sin email / token sin ruta | **Parcial** — código de envío existe, gateado por `EMAIL_SENDING_ENABLED` no documentado; 0 filas reales para verificar |
| 2 | Directorio `/empresas` inexistente | **Parcial** — existe pero huérfano (sin enlace de navegación) |
| 3 | `section_scores` descartado | **Fijo** |
| 4 | Campos de perfil faltantes | **Fijo (código) / No adoptado (datos reales)** |
| 5 | Métricas B2B faltantes | **Fijo** |
| 6 | URL pública con UUID | **Sin cambios — sigue abierto** |
| 7 | Sin filtro de país en Talento | **Fijo** |
| 8 | Sin exportación CSV | **Fijo** |
| 9 | Sin comparación side-by-side | **Sigue abierto** |
| 10 | Sin notificación a empresa al completar | **Fijo** (para el flujo estándar; ver Bloque 3 para la regresión en pruebas propias) |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto QA entiende los filtros?**
Mejoró sustancialmente: los niveles ISTQB ya no muestran códigos crudos (`ctfl` → "Foundation Level (CTFL)"). Falta aún tooltip explicando qué implica cada nivel, y hay un problema de datos sucios: 97 perfiles con `country='PY'` y 7 con el string literal `'Paraguay'` — el filtro los trata como países distintos.

**¿El flujo para contactar/guardar un candidato es claro?**
Sí — este es el mayor avance del ciclo. Ambas pantallas de búsqueda tienen "Guardar" e "Invitar" inline en la misma fila, sin salir de la página. Resuelve directamente el hallazgo A🚀 de junio. Lo que no se pudo confirmar es si el email realmente llega, porque `empresa_invitaciones` está vacía en producción.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| **Pool de candidatos visibles** | Solo 1 de 104 perfiles tiene `talent_visible_to_empresas=true` | El buscador funciona pero está funcionalmente vacío — invalida cualquier demo | Incentivar/onboarding de opt-in para candidatos con evaluaciones completas | **CRÍTICO** 🚀 |
| Filtro por país | Presente en ambas UIs (`buscar-candidatos`, `candidatos`) | Datos sucios: `'PY'` vs `'Paraguay'` fragmentan el filtro | Normalizar `profiles.country` a ISO-2 con backfill | **A** |
| Dos UIs de búsqueda paralelas | `empresa/candidatos` (tabs) y `empresa/buscar-candidatos` (tabla única) con filtros distintos sobre el mismo pool | Confunde cuál es "la" pantalla de sourcing; código duplicado (labels repetidos en 4 archivos) | Consolidar en una pantalla o clarificar propósito en el copy | **A** |
| Filtro de disponibilidad | Completo en `buscar-candidatos`; **ausente** en tab "Talento QA" de `candidatos` | Inconsistencia entre pantallas para la misma tarea | Unificar filtros entre ambas pantallas | **M** |
| Invitar candidato (inline) | Modal funcional en ambas UIs, resuelve email server-side sin exponerlo | Entrega de email no verificable — 0 filas reales en `empresa_invitaciones` | Verificar `EMAIL_SENDING_ENABLED` en prod y hacer un envío de prueba | **A** |
| Límite 500 resultados hardcoded | Sin cambios desde junio (`candidatos/page.tsx:189`) | Trunca silenciosamente sin aviso | Paginación real o warning visible | **M** |
| Exportar CSV | Solo en tab "Evaluados" | Talento/Favoritos/`buscar-candidatos` sin exportación — justo lo que Banco Continental querría | Extender a los otros tabs | **M** |
| Comparar candidatos | Implementado solo en `candidatos/page.tsx` (multi-select hasta 4) | Ausente en `buscar-candidatos` | Portar el mismo patrón | **B** |
| `section_scores` por sección | **Arreglado** — join real a `assessment_scores`/`assessment_sections`, render con barras | Ninguno detectado en código; no verificado visualmente con datos reales | Confirmar con un intento real que tenga secciones | Resuelto — verificar con datos |
| Ranking/XP en orden de resultados | No implementado — el RPC de sourcing ordena solo por disponibilidad/score/actividad | XP y logros del candidato no influyen el ranking B2B | Decisión de producto: ¿debería influir? | **B** |
| Empty state | Solo el tab Evaluados tiene CTA accionable | Talento/Favoritos/`buscar-candidatos` no ofrecen próximo paso | Agregar CTA (p. ej. a prospectos) | **B** |

### Veredicto de los hallazgos de junio (bloque 2)

Filtro país (**fijo**), ISTQB legible (**parcial** — sin tooltips), búsqueda inconsistente entre tabs (**parcial**, ahora por diseño), límite 500 (**sigue abierto**), invitar inline (**fijo**), comparar candidatos (**fijo, parcial** — solo en una pantalla), CSV (**parcial** — solo un tab), toggle disponibilidad (**parcial**), empty state con CTA (**parcial**), `section_scores` (**fijo**).

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

Desde junio se sumó un **segundo sistema completo** en paralelo al original: **(A)** `hiring_processes` + `empresa_invitaciones` (assessments estándar de la plataforma) y **(B)** `empresa_pruebas` (constructor de pruebas propias de cada empresa, nuevo desde julio).

### Tabla de flujo

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| A1. Crear proceso con tipo de evaluación | Completo | — | — | — |
| A2. Invitar candidato por email | Parcial | Envío real vía Resend existe, pero gateado por `EMAIL_SENDING_ENABLED`, ausente de `.env.local.example` y `check-env.js`; 0 filas reales para confirmar entrega | Documentar la variable, setearla en prod, agregar warning a `check-env.js` | **A** |
| A3. Candidato accede por token | Fijo (antes roto) | Token y código de proceso siguen desacoplados — el candidato debe tipear el código manualmente | Auto-precargar el código desde el link de invitación | **M** |
| A4-A5. Completa examen + notificación a empresa | Fijo | — | — | — |
| A6. Desglose por sección | Fijo | — | — | — |
| A7. Comparar candidatos | Incompleto | Solo tabla ordenable, sin vista side-by-side | Agregar selección múltiple | **M** |
| A8. Timeout/reintentos de proceso | Parcial | Sin alerta "vence pronto"; no existe `max_attempts` en `hiring_processes` | Agregar badge y campo configurable | **M/B** |
| B1-B2. Crear prueba propia + preguntas | Completo | — | — | — |
| **B3. Invitar candidato a prueba propia** | **Roto** | `createPruebaInvitacionAction` **no envía ningún email** — único mecanismo es "Copiar link" manual. Reintroduce el bug crítico #1 de junio, en la feature nueva | Conectar `sendEmail`/Resend igual que en A2 | **CRÍTICO** 🚀 |
| B3b. Configurar expiración/intentos por invitación | Incompleto | Backend los soporta pero el formulario de UI no los expone — queda fijo en `max_attempts=1`, `expires_at=null` | Exponer los campos en el formulario | **M** |
| B4-B5. Candidato rinde y enforcement | Completo | Mejor UX que el flujo A (token auto-arranca, sin código manual) | — | — |
| B6. Resultados con ranking y desglose | Completo | — | — | — |
| **B7. Notificación a empresa al completar** | **Roto** | No existe ninguna notificación de finalización para pruebas propias | Reusar `notifyEmpresaExamCompleted` | **A** |
| B8. Adopción real | — | Las 4 tablas de este sistema tienen 0 filas — shippeado hace ~1 mes sin uso real, pese a tener link de navegación | Investigar descubribilidad o validar demanda | **B** (seguimiento) |

### Hallazgo transversal del bloque

`empresa_invitaciones` también está en 0 filas pese a que `hiring_processes` tiene 22 procesos y **437 intentos de candidatos** (325 en `exam_results` + 112 en `assessment_attempts`) vinculados por código de proceso. **Toda la actividad B2B real hoy ocurre compartiendo el código de proceso por fuera de la plataforma** (LinkedIn, email manual) — el sistema de invitación con token/funnel nunca se usó una sola vez en producción.

### Veredicto de los hallazgos de junio (bloque 3)

| # | Hallazgo previo | Veredicto |
|---|---|---|
| 1 | Invitaciones sin email — CRÍTICO | **Parcial** en flujo A, **regresó como bug nuevo** en flujo B |
| 2 | Ruta pública por token faltante — CRÍTICO | **Fijo** para ambos flujos |
| 3 | `section_scores` descartado | **Fijo** |
| 4 | `exam_types` sin descripción | **Parcial** — fijo en formulario de creación interno, sigue abierto en perfil público (solo 3/12 tipos traducidos) |
| 5 | Sin notificación a empresa al completar | **Parcial** — fijo en flujo A, **roto en flujo B (nuevo)** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

Commit `0491b6e` sí agregó las métricas marcadas como faltantes en junio — vistas de perfil, funnel de invitaciones, tasa de respuesta — todas wireadas a queries en vivo, no mockeadas. Pero el widget de funnel **solo se renderiza si `funnel.total > 0`**, y `empresa_invitaciones` tiene 0 filas: la métrica más nueva y valiosa del dashboard es invisible hoy en producción.

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Procesos activos / Candidatos evaluados / Tasa aprobación / Tiempo promedio | Sí (sin cambios de fondo desde junio) | Tasa de aprobación sigue sin umbral de referencia (ISTQB CTFL = 65%) | Tooltip con el umbral | Alto |
| **Visitas al perfil (`profile_views`)** | Sí (nuevo) | Card de baja jerarquía visual (posición 9/9, gris cuando es 0); valor real = 0 en las 3 empresas | Destacarla como métrica de employer branding B2B | Crítico → medible, sin datos aún |
| **Funnel invitación→vista→completada** | Sí (nuevo) | Solo se muestra si `funnel.total>0` — invisible hoy porque `empresa_invitaciones` tiene 0 filas | Mostrar también en estado 0 con CTA "aún sin invitaciones enviadas" | Crítico → resuelto en código, no observable |
| **Tasa de respuesta a invitaciones** | Sí (nuevo) | Mismo problema de visibilidad condicional que el funnel | Igual que arriba | Alto → resuelto en código, sin datos reales |
| Comparación entre procesos | No | Sigue sin existir tabla proceso-a-proceso | Agregar tabla resumen (pass rate, avg score) | Alto |
| Top skills QA del mes | No | Sigue sin existir | Widget dedicado | Medio |
| Empty state sin actividad | Sí | Bien diseñado, 2 CTAs claros | — | Bueno |
| **Descubribilidad de "pruebas propias"** | — | El dashboard principal **no tiene ningún enlace** a `/empresa/pruebas` (solo existe en el nav superior) | Agregar acceso rápido en el dashboard | Podría explicar la adopción cero (Bloque 3, B8) |

### Veredicto de los hallazgos de junio (bloque 4)

Page views (**fijo, sin datos reales**), funnel (**fijo en código, invisible por falta de datos**), tasa de respuesta (**fijo en código, invisible por falta de datos**), comparación entre procesos (**sigue abierto**), top skills (**sigue abierto**).

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 CRÍTICO — Regresión: invitaciones a "pruebas propias" sin email.** `createPruebaInvitacionAction` no envía ningún correo; el único mecanismo es copiar un link manualmente. Es el mismo bug que se arregló en junio para el flujo estándar, reintroducido en la feature nueva. Tipo: **bug**.

2. **🚨 CRÍTICO — Todo el ciclo B2B está en cero actividad real.** `empresa_invitaciones` (0 filas), las 4 tablas de "pruebas propias" (0 filas cada una), pool de talento visible (1/104 candidatos), y el perfil del propio cliente piloto CLT vacío sin procesos. El código funciona; no hay nada que mostrar en una demo hoy. Tipo: **gap de activación/adopción**, no de funcionalidad.

3. **⚠️ Directorio público `/empresas` huérfano.** La página existe y funciona, pero no está enlazada desde ningún nav — un candidato no puede llegar a ella. Tipo: **bug de navegación**.

4. **⚠️ `EMAIL_SENDING_ENABLED` es un kill-switch silencioso.** No está documentado en `.env.local.example` ni `check-env.js`; si falta, las invitaciones "se crean" sin que el recruiter vea ningún error. Tipo: **gap de funcionalidad / observabilidad**.

5. **⚠️ Sin notificación a la empresa al completar una "prueba propia".** A diferencia del flujo estándar (que sí notifica), este flujo nuevo deja a la empresa sin aviso cuando un candidato termina. Tipo: **gap de funcionalidad**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Invitaciones a pruebas propias sin email | Bug (regresión) | Sí 🚀 |
| 2 | Cero actividad real en todo el ciclo B2B | Gap de activación | Sí 🚀 |
| 3 | `/empresas` sin enlace de navegación | Bug de navegación | Sí 🚀 |
| 4 | `EMAIL_SENDING_ENABLED` no documentado, falla silenciosa | Gap de funcionalidad | Sí 🚀 |
| 5 | Sin notificación de finalización en pruebas propias | Gap de funcionalidad | Sí 🚀 |
| 6 | Pool de candidatos visibles: 1/104 | Gap de adopción | Sí 🚀 |
| 7 | Perfil de CLT (piloto) vacío, sin procesos | Gap de adopción | Sí 🚀 |
| 8 | URL pública con UUID, no slug | UX problem | Parcial |
| 9 | Sin comparación side-by-side de candidatos | Gap de funcionalidad | No |
| 10 | Sin tabla comparativa entre procesos / top skills en dashboard | Gap de funcionalidad | No |
| 11 | Datos sucios de país (`PY` vs `Paraguay`) | Bug de datos | Parcial |
| 12 | Dos UIs paralelas de búsqueda de candidatos | UX problem | No |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. **CLT no tiene perfil completo ni procesos activos** — antes de cualquier demo, alguien del equipo debe cargar el perfil real de CLT y correr al menos un proceso de punta a punta.
2. **El flujo de invitación por email nunca se ha probado en producción** (ni el estándar ni el nuevo de pruebas propias) — hay riesgo real de que falle en vivo frente al cliente.
3. **El directorio público de empresas es indescubrible** — sin enlace de navegación, ningún candidato lo encuentra orgánicamente.
4. **El pool de candidatos buscables está casi vacío** (1 de 104) — el pitch de "buscá candidatos QA calificados en LATAM" no tiene con qué respaldarse hoy.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El **funnel de invitaciones y la tasa de respuesta** ya están completamente implementados y solo necesitan datos reales para ser una demo poderosa de ROI.
- El **desglose por sección de resultados** (`section_scores`) ya no se descarta — ahora es un diferencial real frente a competidores que solo dan pass/fail.
- El **constructor de pruebas propias** es una feature B2B sofisticada (ranking, tiempo por candidato, scoring server-side) que todavía nadie ha usado — con el fix de email y un poco de onboarding podría ser un argumento de venta fuerte.
- **CSV export, filtro por país y ranking de candidatos** ya resuelven pedidos directos de Banco Continental del ciclo anterior.

### Foco del próximo ciclo (1 hora)

**Prioridad: activación de datos reales, no más código.**

1. Arreglar la regresión de email en `createPruebaInvitacionAction` (mismo patrón que `empresa-invitaciones.ts`) — CRÍTICO.
2. Enlazar `/empresas` desde el Header/Footer/home.
3. Documentar `EMAIL_SENDING_ENABLED`/`RESEND_API_KEY` en `.env.local.example` y `check-env.js`, y confirmar que estén activos en producción con un envío de prueba real.
4. Sesión de activación manual: completar el perfil de CLT, correr un proceso de punta a punta con invitaciones reales, y conseguir que un puñado de candidatos reales activen `talent_visible_to_empresas`.

Este ciclo no desbloquea funcionalidad nueva — desbloquea la **primera demo creíble** frente a CLT o Banco Continental con datos reales en pantalla.

---

### Nota sobre tickets en Jira

Esta sesión no tiene acceso configurado a `aiquaa.atlassian.net` (sin conector de Jira disponible), por lo que los tickets no pudieron crearse directamente. La tabla de "Clasificación completa" arriba está redactada en formato listo para copiar a Jira (título = hallazgo, prioridad ya asignada, tipo ya clasificado); cada fila del detalle por bloque incluye pasos/evidencia (archivo:línea) suficientes para pasos de reproducción. Recomendado: conectar un conector de Jira a esta sesión o pegar esta tabla manualmente.

---

*Revisión generada automáticamente — 2026-08-07 · Rama: `claude/zen-noether-d4m3rt` · 4 sub-revisiones paralelas (una por bloque) + 1 exploración inicial de arquitectura, todas basadas en código fuente real y datos en vivo de Supabase (`cbkctkpyxwbufvbwxogp`).*
