# Revisión UX — Módulo de Empresas (Ciclo 2)
**Fecha:** 26 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código + verificación en vivo contra Supabase/Vercel de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)
**Ciclo anterior:** [`2026-06-27-modulo-empresas-ux-review.md`](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, RLS de Supabase) + queries en vivo contra la base de producción (`cbkctkpyxwbufvbwxogp`) para verificar datos reales, políticas RLS efectivas y configuración de Vercel. El intento de navegar `aiquaa.com` en vivo devolvió `403` (protección anti-bot del proxy de salida); no se reporta nada del front-end en vivo que no esté respaldado por código o datos reales de producción. Solo se documentan hallazgos confirmados — no supuestos.

---

## 🚨 Hallazgo transversal — antes de los 5 bloques

Durante la verificación de datos en producción apareció un **hallazgo de seguridad crítico que no estaba en el alcance original** pero que bloquea directamente al cliente piloto bancario. Se reporta primero porque cualquier otro hallazgo UX es secundario frente a esto:

**RLS pública sin restricción real en `empresas` y `empresa_invitaciones`.** Verificado con `pg_policies` contra el proyecto de producción:
- `empresas_public_select`: `roles={anon,authenticated}`, `qual: true` → cualquier cliente anónimo puede leer **todas las columnas** de `empresas` vía API REST directa (`/rest/v1/empresas?select=*`), incluyendo `ruc` (dato fiscal) — no solo lo que la UI decide mostrar.
- `empresa_invitaciones_public_token_read`: `qual: (token IS NOT NULL) AND (status IN ('pendiente','vista'))` — **no compara el token de la fila contra ningún valor recibido**. Cualquier request anónimo a `/rest/v1/empresa_invitaciones?select=*` devuelve **todas** las invitaciones pendientes/vistas de **todas las empresas**: email y nombre del candidato, mensaje, y el `token` secreto de cada invitación (que además permite tomar el flujo de esa invitación sin haberla recibido).

Esto es una fuga de PII de candidatos + RUC de empresas + tokens de invitación, explotable sin autenticación. Para un piloto con **Banco Continental SAECA** (regulado, maneja datos sensibles) esto es un bloqueante de seguridad, no solo de UX. Prioridad: **CRÍTICO 🚀🔒** — requiere una vista pública con columnas explícitas (o políticas `qual` correctas comparando el token recibido) antes de cualquier demo o piloto real.

---

## 🏢 Bloque 1 — Perfil de empresa

### Delta vs. ciclo anterior (2026-06-27)
Se implementaron con éxito los campos que el ciclo anterior marcó como el hallazgo crítico #4: **stack tecnológico, modalidad de trabajo, beneficios QA y LinkedIn**, tanto en el formulario de edición (`empresa/perfil/page.tsx`) como en la vista pública (`empresas/[id]/page.tsx`). También se agregó `qa_team_size`, contadores de caracteres en descripción/beneficios, y tracking de `profile_views`. El directorio público `/empresas` (hallazgo crítico #2 del ciclo anterior) ya existe.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado |
|---|---|---|---|---|
| Stack / modalidad / beneficios / LinkedIn | Faltaban en ciclo anterior | A | — | **✅ FIXED** |
| Directorio público `/empresas` | Sin buscador ni paginación (confirmado por grep: 0 inputs de búsqueda, sin `range()`) | A | Agregar input de búsqueda + filtro industria/país + paginación | Incompleto |
| URL pública del perfil | Sigue usando UUID crudo (`/empresas/uuid`), no slug | M | Slug generado de `nombre_comercial` | Incompleto |
| `country` con default `'PY'` | Barra de completitud arranca en ~25% (antes 14%, ahora con más campos) sin acción real del usuario | M | Quitar default en DB; exigir selección explícita | Incompleto (mismo bug, cifra distinta) |
| Preview de perfil público desde edición | Solo link externo, sin vista embebida | B | Modal/panel de preview inline | Incompleto |
| Redes sociales | Solo LinkedIn; falta Instagram/Twitter | B | Agregar campos opcionales | Parcial |
| Eliminar logo | Solo "Cambiar logo", no "Eliminar" | B | Botón de eliminar con confirmación | Incompleto |
| Contador de caracteres | `description`/`benefits` sí; `razon_social`/`nombre_comercial` no | B | Agregar `{n}/120` y `{n}/80` | Parcial |
| Etiqueta "RUC" fija | No se adapta a CUIT/RFC/NIT para otros países | M | Etiqueta dinámica por `country` | Incompleto |
| **RLS pública sin enmascarar** | `SELECT *` abierto a `anon` expone RUC de cualquier empresa vía API directa | **A** 🚀 | Vista pública con columnas explícitas en vez de `select('*')` | **Roto (seguridad)** — ver hallazgo transversal |
| Validación server-side de campos nuevos | `updateEmpresaAction` no valida formato de `linkedin_url` ni longitud de `tech_stack` — solo valida en cliente | M | Validar también server-side | Incompleto |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Delta vs. ciclo anterior
Fuerte avance: **filtro de país, etiquetas ISTQB legibles, botón "Invitar" inline, comparación side-by-side (hasta 4), exportación CSV y desglose de `section_scores`** — los 6 hallazgos de prioridad A/🚀 del ciclo anterior en este bloque están resueltos en la pantalla principal. Se sumó además un módulo nuevo, `/empresa/buscar-candidatos` ("Sourcing B2B"), vía RPC dedicada sin el límite de 500 filas.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país | ✅ FIXED en ambas pantallas | En `buscar-candidatos` el `<select>` muestra el código crudo sin bandera, inconsistente con `candidatos/page.tsx` | Reusar `COUNTRY_LABELS` en ambas | B |
| Etiquetas ISTQB | ✅ FIXED (nombres completos) | Sigue sin tooltip explicando qué mide cada nivel | Agregar popover descriptivo | B |
| Invitar inline | ✅ FIXED en Talento y Sourcing | Falta el mismo botón en tab **Evaluados** | Agregar "Invitar" también ahí | M 🚀 |
| Comparación side-by-side | ✅ FIXED (hasta 4 candidatos) | Panel comparativo no incluye skills/país/desglose por sección | Enriquecer el panel | B |
| Exportar CSV | ✅ FIXED en tab Evaluados | Ausente en Talento y Favoritos/Shortlist | Agregar botón CSV en esas vistas | M 🚀 |
| Toggle "disponible" | Implementado solo en `buscar-candidatos` | Ausente en tab Talento de `/empresa/candidatos` | Agregar el mismo toggle ahí | M |
| `section_scores` | ✅ FIXED en la UI principal (join con `assessment_scores`) | Sigue forzado a `null` en `actions/employer.ts` (`fetchAssessmentAttemptsForProcessCodes`), usado por la vista de detalle de proceso | Reusar el mismo join en ese helper | M 🚀 |
| **Dos directorios de talento paralelos** | `/empresa/candidatos` (legacy, `.limit(500)`, sin toggle disponible) vs. `/empresa/buscar-candidatos` (RPC nueva, sin límite, con toggle) | Comportamiento y resultados divergentes para el mismo caso de uso — confunde al recruiter y duplica mantenimiento | Unificar en una sola implementación (la RPC nueva) | **A** 🚀 |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Delta vs. ciclo anterior
El hallazgo **CRÍTICO** del ciclo anterior ("invitaciones sin email, token sin ruta pública") está **resuelto en código**: `empresa-invitaciones.ts` envía email vía Resend con el link `/invitaciones/[token]`, y esa ruta pública existe y funciona (valida token, marca "vista"). El código de proceso ahora se vincula automáticamente al completar la invitación. También se agregó notificación a la empresa cuando un candidato completa una evaluación.

**Pero con una salvedad importante:** el envío de email está gateado por `EMAIL_SENDING_ENABLED === 'true'`, y esa variable **no aparece en `.env.local.example`, `vercel.json` ni en ninguna guía de despliegue del repo**. No se pudo confirmar su valor real en Vercel (el MCP de Vercel no expone variables de entorno), pero la ausencia de documentación es en sí misma una señal de riesgo: es fácil que el flag quede apagado sin que nadie lo note. Consistente con esto, la tabla `empresa_invitaciones` en producción tiene **0 filas** — el flujo de invitación no se ha usado ni una sola vez en producción todavía, así que tampoco hay evidencia operativa de que envíe emails hoy.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Envío de email de invitación | **Código: FIXED / Activación: NO VERIFICADA** | `EMAIL_SENDING_ENABLED` no documentado en ningún `.env.example` ni config de deploy; 0 invitaciones registradas en producción para validar extremo a extremo | Confirmar y documentar el flag en Vercel; enviar una invitación de prueba real y verificar que llegue | **CRÍTICO 🚀** |
| Ruta pública `/invitaciones/[token]` | ✅ FIXED | Exige registro manual + ingresar el código del proceso; no hay auto-redirect post-registro | Redirigir automáticamente al proceso tras registrarse | M |
| Código de proceso ↔ invitación | ✅ FIXED | — | — | — |
| Notificación a empresa al completar | ✅ FIXED | No respeta `EMAIL_SENDING_ENABLED` (solo depende de `RESEND_API_KEY`) — gating inconsistente con el flujo de invitación | Unificar el gate de ambos flujos de email | M |
| `section_scores` en detalle de proceso | Parcial | Sigue `null` en `employer.ts` aunque ya se arregló en la vista de candidatos | Mismo fix, un solo lugar | M 🚀 |
| Tipos de examen sin descripción en perfil público | Roto | Perfil público solo traduce 3/12 tipos de examen; sin duración/nivel | Reusar las descripciones ya existentes en el form de creación de proceso | A 🚀 |
| Badge "vence pronto" | Roto | `expires_at` existe, sin alerta a 7 días | Agregar badge ámbar | M |
| `max_attempts` configurable | Parcial | Existe solo en el sistema paralelo de "pruebas propias", no en `hiring_processes` | Portar el campo | B |
| Comparación de candidatos en evaluaciones | Roto | Solo texto sugiriendo comparar "manualmente" | Implementar selección + modal comparativo | M |
| **Dos sistemas de invitación paralelos** | Nuevo hallazgo | "Mis procesos" exige registro+código; "Mis pruebas" (pruebas propias) no requiere cuenta y va directo al examen — sin explicación de cuándo usar cada uno | Unificar mensajería o fusionar ambos flujos | A 🚀 |
| "Pruebas propias" sin email ni notificación | Nuevo hallazgo | El recruiter debe copiar/pegar el link a mano; resultados en una vista separada de "Evaluados"; un candidato de prueba propia nunca aparece en el directorio principal de talento | Integrar al mismo pipeline de notificaciones y al directorio de talento | M |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Delta vs. ciclo anterior
Los tres hallazgos "críticos" del ciclo anterior en este bloque están **resueltos**: **visitas al perfil** (`profile_views` + RPC, mostrado como stat card), **funnel de invitaciones** (enviada → vista → completada, widget dedicado) y **tasa de respuesta** (dentro del mismo widget). Sin cambios en: procesos activos (sin sparkline), candidatos evaluados (sin split aprobado/reprobado), tasa de aprobación (sin tooltip ISTQB), tiempo promedio (sin benchmark), comparación entre procesos (existe solo dentro de "eventos" agrupados, no en el dashboard general ni en procesos sueltos), y "top skills" (sigue sin existir).

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor |
|---|---|---|---|---|
| Visitas al perfil (`profile_views`) | ✅ FIXED | Contador fire-and-forget sin `await`, sin dedupe por IP/sesión ni desglose temporal — un bot o refresh infla el número | Deduplicar por sesión/IP + mostrar tendencia mensual | Alto (pero número no confiable hoy) |
| Funnel de invitaciones | ✅ FIXED | Se oculta por completo si `total===0` — con 0 invitaciones en producción hoy, ningún cliente piloto lo verá aún | Mostrar estado vacío explicativo en vez de ocultar el widget | Alto |
| Tasa de respuesta a invitaciones | ✅ FIXED (dentro del funnel) | — | — | Alto |
| Candidatos evaluados | Sin cambios | Headline sigue sin split aprobado/reprobado | Dividir el número o usar semáforo | Alto |
| Tasa de aprobación | Sin cambios | Sin tooltip de referencia ISTQB (65%) | Agregar tooltip | Alto |
| Comparación entre procesos | Parcial | Existe solo dentro de "eventos" agrupados (`/empresa/eventos/[id]`), no para procesos individuales en el dashboard | Exponer también a nivel de proceso suelto | Alto |
| Top skills QA del mes | No existe | Sin rastro en código | Widget de market intelligence | Medio |
| Gráficos 6 meses / badges / empty state | Sin cambios, funcionan bien | — | — | Bueno |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🔒🚀 CRÍTICO — RLS pública sin restricción real** expone RUC de empresas (`empresas_public_select`, `qual: true` para `anon`) y **PII completa de candidatos + tokens de invitación** (`empresa_invitaciones_public_token_read` no compara el token recibido, solo exige que no sea nulo). Confirmado en vivo contra `pg_policies` de producción. Tipo: **bug de seguridad**. Bloquea el piloto con Banco Continental de forma directa.
2. **🚀 Activación del envío de emails de invitación sin verificar** — el código está correcto (Resend + ruta pública `/invitaciones/[token]`), pero `EMAIL_SENDING_ENABLED` no está documentado en ningún archivo de configuración del repo, y hay 0 invitaciones registradas en producción para confirmar que funciona extremo a extremo. Tipo: **gap operativo / riesgo de configuración**.
3. **🚀 Directorio de talento duplicado** (`/empresa/candidatos` legacy vs. `/empresa/buscar-candidatos` nuevo) con comportamiento divergente (límite de 500 filas en uno, no en el otro; toggle de disponibilidad en uno, no en el otro). Confunde al recruiter y duplica mantenimiento. Tipo: **deuda técnica / gap UX**.
4. **`section_scores` sigue descartado en un segundo lugar** (`actions/employer.ts`) aunque ya se corrigió en la pantalla principal de candidatos — el mismo bug crítico del ciclo anterior sigue vivo en una fuente de verdad paralela. Tipo: **bug de implementación**.
5. **Directorio público `/empresas` sin buscador ni paginación**, y URL de perfil con UUID en vez de slug — sigue sin resolver desde el ciclo anterior. Tipo: **gap de funcionalidad / UX**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | RLS pública expone PII de candidatos + RUC | Bug de seguridad | **Sí, crítico** 🚀🔒 |
| 2 | Activación de email de invitación no verificada en prod | Gap operativo | Sí 🚀 |
| 3 | Dos directorios de talento paralelos y divergentes | Deuda técnica | Sí 🚀 |
| 4 | `section_scores` null en `employer.ts` (2do lugar) | Bug | Parcial |
| 5 | Directorio `/empresas` sin búsqueda/paginación | Gap funcionalidad | Parcial |
| 6 | URL pública con UUID (no slug) | UX problem | No |
| 7 | Dos sistemas de invitación paralelos (procesos vs. pruebas propias) | Gap UX | Sí 🚀 |
| 8 | Funnel de invitaciones se oculta en 0 (sin invitaciones aún) | UX problem | No |
| 9 | `country` default 'PY' sigue inflando completitud | UX problem | No |
| 10 | Validación server-side de campos nuevos del perfil | Gap seguridad/integridad | Parcial |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. **La fuga de RLS debe cerrarse antes de cualquier demo o acceso real de un banco** — es el bloqueante más severo detectado en este ciclo, por encima de cualquier hallazgo UX.
2. No hay confirmación de que el flujo de invitación externo envíe emails en producción hoy (0 invitaciones registradas).
3. Dos directorios de búsqueda de talento con resultados distintos generan desconfianza en un recruiter evaluando la herramienta por primera vez.
4. El directorio público de empresas sigue sin ser presentable para un caso de uso real (sin buscador, URL no memorable).

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El **funnel de invitaciones y las visitas al perfil ya están implementados** — con datos reales (aunque hoy en cero) se puede demostrar el pitch "cuántos candidatos vieron tu empresa y respondieron" apenas haya actividad piloto.
- El **nuevo módulo de sourcing** (`/empresa/buscar-candidatos`) con RPC dedicada es una base sólida para escalar sin el límite de 500 filas — conviene consolidar todo en esta implementación.
- Resolver la fuga de RLS es, paradójicamente, también una oportunidad de pitch: "seguridad de datos de candidatos" es un argumento de venta fuerte para un banco una vez corregido.

### Foco del próximo ciclo (1 hora)

**Prioridad 1 (innegociable, seguridad):** Corregir las políticas RLS de `empresas` y `empresa_invitaciones` — crear una vista pública con columnas explícitas (excluir `ruc`) y una policy de `empresa_invitaciones` que compare el token recibido contra el de la fila (vía RPC `SECURITY DEFINER`, no `SELECT` directo).

**Prioridad 2:** Confirmar y documentar `EMAIL_SENDING_ENABLED` en producción; enviar una invitación real de prueba y verificar recepción del email.

**Prioridad 3:** Decidir y ejecutar la consolidación de los dos directorios de talento (`/empresa/candidatos` vs. `/empresa/buscar-candidatos`) en una sola implementación.

---

### Tickets pendientes de crear en Jira (aiquaa.atlassian.net)

Esta sesión no tiene acceso configurado a Jira, por lo que los tickets no pudieron crearse automáticamente. Se dejan listos para carga manual, en orden de prioridad:

1. **[CRÍTICO/SEGURIDAD]** RLS pública de `empresas` y `empresa_invitaciones` expone PII de candidatos, RUC y tokens de invitación sin autenticación — ver "Hallazgo transversal" arriba para pasos de reproducción (query a `pg_policies` + lectura directa vía REST con la anon key).
2. **[ALTO]** Verificar y documentar `EMAIL_SENDING_ENABLED` en Vercel; validar envío real de invitación end-to-end.
3. **[ALTO]** Consolidar `/empresa/candidatos` (Talento) y `/empresa/buscar-candidatos` en una sola implementación basada en la RPC de sourcing.
4. **[MEDIO]** Corregir `section_scores` forzado a `null` en `actions/employer.ts::fetchAssessmentAttemptsForProcessCodes`.
5. **[MEDIO]** Agregar buscador y paginación al directorio público `/empresas`; migrar URL de perfil a slug.
6. **[BAJO/MEDIO]** Resto de hallazgos de las tablas de cada bloque (ver arriba).

---

*Revisión generada automáticamente — 2026-07-26 · Rama: `claude/zen-noether-4rl5g4` · Ciclo 2 del módulo de Empresas.*
