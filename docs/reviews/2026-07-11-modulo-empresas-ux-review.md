# Revisión UX — Módulo de Empresas (ciclo 2)
**Fecha:** 11 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código + verificación directa en Supabase de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)
**Ciclo anterior:** [`2026-06-27-modulo-empresas-ux-review.md`](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, migraciones SQL de Supabase). A diferencia del ciclo anterior, los hallazgos críticos de este ciclo fueron además **verificados con consultas de solo-lectura contra el proyecto Supabase de producción** (`aiquaa` / `cbkctkpyxwbufvbwxogp`) para confirmar que no son hipotéticos. Se documentan solo hallazgos confirmados en el código o en producción — no supuestos. No se creó ningún ticket en Jira (`aiquaa.atlassian.net`): esta sesión no tiene acceso a esa herramienta. Los hallazgos están redactados en formato listo para pegar como ticket.

---

## 🚨 Hallazgo crítico del ciclo — perfil de empresa roto en producción, ahora mismo

**`getMyEmpresaAction` (`apps/frontend/src/actions/empresa-admin.ts:54`)** hace:

```ts
const { data, error } = await supabase.from('empresas').select('*').single();
```

Sin ningún `.eq('id', ...)`. Depende 100% de que RLS devuelva exactamente 1 fila. Pero la migración `20260627_000000_empresas_branding_views.sql` agregó la policy `empresas_public_select` (`USING (true)`, roles `anon, authenticated`) para habilitar el directorio público `/empresas`. En Postgres, las policies permisivas del mismo comando (`SELECT`) se combinan con **OR**, así que el filtro efectivo para cualquier usuario autenticado quedó en `true` — la query ya no filtra por empresa propia.

**Verificado en producción (proyecto `aiquaa`, solo lectura):**
- `SELECT count(*) FROM empresas` → **3 filas**.
- Policies activas en `empresas` confirman la combinación: `empresas_public_select` (`SELECT`, `anon,authenticated`, `qual = true`) coexiste con `empresas_members_read`/`"Members can read own empresa"`.

Con 3 empresas en la tabla, `.single()` de PostgREST **falla siempre** (error `PGRST116`, "multiple rows returned") para **cualquier** usuario que entre a `/empresa/perfil` — es decir, hoy mismo ninguna de las 3 empresas reales de producción puede ver ni editar su perfil desde esa pantalla. Esto incluye a cualquier piloto que se registre ahora.

- **Tipo:** Bug (regresión introducida por la migración de branding del ciclo anterior).
- **Impacto:** Crítico — bloquea el flujo #1 del módulo completo, en producción, hoy.
- **Pasos para reproducir:** Loguearse como cualquier usuario con membresía en una empresa → ir a `/empresa/perfil` → la carga falla (o queda en loading infinito según el manejo de error del componente).
- **Fix sugerido:** en `getMyEmpresaAction`, resolver `empresa_id` vía `getMyMembershipAction`/`empresa_miembros` y filtrar `.eq('id', empresaId)` en vez de confiar en RLS + `.single()` sin filtro.
- 🚀 Bloqueante absoluto para CLT y Banco Continental como pilotos — ni siquiera pueden completar el onboarding de su propio perfil.

## 🔐 Hallazgo de seguridad — cualquier usuario autenticado puede sobrescribir el logo de otra empresa

Policies de `storage.objects` para el bucket `empresa-logos` (verificadas en producción):
- `empresa_logos_authenticated_upload/update/delete`: `bucket_id = 'empresa-logos' AND auth.uid() IS NOT NULL` — **sin ninguna restricción de path/propietario**.

El path de subida (`${empresaId}/logo.ext`) se arma en el cliente (`apps/frontend/src/app/empresa/perfil/page.tsx:170-174`). Cualquier usuario autenticado (incluido un candidato) puede subir/sobrescribir/borrar el logo de **cualquier** empresa manipulando el `empresaId` en la request, sin pertenecer a ella.

- **Tipo:** Bug de seguridad (RLS de storage insuficiente).
- **Impacto:** Alto — vandalismo/suplantación de marca de un cliente piloto es trivial de ejecutar.
- **Fix sugerido:** policy con `(storage.foldername(name))[1] = (SELECT empresa_id::text FROM empresa_miembros WHERE user_id = auth.uid() AND status='active')`.
- 🚀 Riesgo reputacional directo para el pitch a Banco Continental/CLT si se descubre en un piloto.

---

## 🏢 Bloque 1 — Perfil de empresa

**¿Un recruiter que llega por primera vez entiende en &lt;30s cómo completar su perfil?**
El formulario en sí es claro (barra de completitud + anchors a campos faltantes), pero si es la 2ª o 3ª empresa registrada — que es el estado real de producción hoy — nunca llega a verlo: la carga falla por el bug crítico de arriba.

**¿El perfil público inspira confianza a un candidato QA?**
Cuando está completo (logo, industria, stack, beneficios, LinkedIn) sí — mejoró notablemente desde el ciclo anterior. Para una empresa nueva sin procesos activos todavía se ve austero.

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado |
|---|---|---|---|---|
| Carga del perfil propio 🚀 | `getMyEmpresaAction` sin filtro por empresa, roto por policy OR (ver hallazgo crítico arriba) | **A** | Filtrar explícitamente por `empresa_id` del caller | **Roto (verificado en prod)** |
| Subida de logo (storage) 🚀 | Policy de storage sin restricción de propietario (ver hallazgo de seguridad arriba) | **A** | Restringir path al `empresa_id` propio | **Roto (seguridad)** |
| Persona de contacto | No existe campo de nombre/email/cargo de contacto en `Empresa` ni en el form | **M** | Agregar `contact_name`/`contact_email` opcional | Incompleto |
| Redes sociales | Solo LinkedIn; sin Instagram/X/sitio de empleos | **B** | Baja prioridad para el piloto | Incompleto |
| Validación de URL inconsistente | `website_url` valida formato `https?://` en cliente; `linkedin_url` no tiene la misma validación pese a ser `type="url"` | **B** | Igualar validación en ambos campos | Incompleto |
| Validación solo client-side | `updateEmpresaAction` no valida longitud/formato server-side — confía en `maxLength` del HTML | **M** | Validar con Zod en el server action | Incompleto |
| Logo — tipo/dimensión | Solo valida tamaño ≤2MB; el `accept` del picker es solo sugerencia, sin verificar `file.type` real | **B** | Verificar MIME antes de subir | Incompleto |
| Directorio público `/empresas` | Existe y funciona (con `revalidate=300`, hasta 5 min de delay tras editar perfil) | — | Documentar el delay al equipo | **Resuelto desde ciclo anterior** ✅ |
| Barra de completitud + anchors | Buen patrón de onboarding progresivo | — | Ninguna | Completo ✅ |
| Empty state dashboard / perfil sin procesos | CTA clara "Completar perfil" / "Crear primer proceso" | — | Ninguna | Completo ✅ |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

**¿Un recruiter sin contexto QA entiende los filtros?**
Sigue sin resolverse desde el ciclo anterior: "Disponibilidad" y "País" (este último ya agregado ✅) son claros, pero "CTFL", "CTAL-TA/TM/TTA" y nombres de examen técnicos no tienen tooltip ni explicación en español llano en ningún lado del código.

**¿El flujo para contactar/guardar un candidato es claro?**
Mecánicamente sí — guardar (★) y "Invitar" funcionan y persisten bien, y el email del candidato nunca se expone al cliente (correcto para compliance). Pero la shortlist guardada solo es visible en `/empresa/candidatos`, no en la pantalla de búsqueda donde se originó — el recruiter "guarda a ciegas".

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtro por país | **Ahora existe** en `buscar-candidatos/page.tsx` | — | — | **Resuelto desde ciclo anterior** ✅ |
| Filtros disponibles | Texto libre, disponibilidad, nivel ISTQB, país, chips de skills | Sin filtro por score mínimo, tipo de examen aprobado, ni paginación | Agregar filtro de score mínimo + paginación antes de escalar el pool | Media |
| Jerga ISTQB sin tooltip | `ISTQB_LEVEL_LABELS`/`EXAM_LABELS` en texto plano, sin `title` ni ícono de ayuda | Recruiter no-QA no distingue "Foundation" de "Advanced" ni qué significan las siglas | Tooltip con explicación en español llano por nivel | **Alta** 🚀 |
| Orden de resultados | RPC ordena por disponibilidad → score → última actividad; criterio no está explicado en la UI | Recruiter puede pensar que el orden es aleatorio | Etiquetar el criterio ("Ordenado por disponibilidad y score") | Baja |
| Shortlist / favoritos | Persiste correctamente en `empresa_favoritos`, pero solo se ve en `/empresa/candidatos`, no en la pantalla de búsqueda | Recruiter guarda sin poder confirmar/comparar ahí mismo | Mostrar contador/enlace a la shortlist en la propia búsqueda | Media |
| Acción de contacto | Único botón "Invitar", ligado a `empresa_invitaciones`, con proceso opcional | Copy ambiguo: no queda claro que también sirve como contacto libre sin evaluación | Aclarar copy "Invitar / Contactar" | Baja |
| Estado vacío | Mensaje claro + CTA para limpiar filtros | Ninguno, bien resuelto | — | Baja |
| Info visible vs. protegida | Email del candidato nunca llega al cliente; solo se toca server-side al crear la invitación | Ninguno — diseño correcto | Mantener | — ✅ |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

**Hallazgo clave del ciclo:** desde la última revisión el equipo construyó un **segundo sistema paralelo** de evaluaciones (`empresa_pruebas`, constructor de cuestionarios propios) que convive con el sistema original (`empresa_invitaciones` + `hiring_processes`, exámenes precargados ISTQB/Git/API/DB). Los dos no se comunican entre sí, y el gap más crítico del ciclo pasado — **invitaciones sin email al candidato** — reapareció en el sistema nuevo aunque parece haberse mitigado parcialmente en el viejo (`notifyEmpresaExamCompleted` ahora existe y se llama desde `exams.ts` y una API route).

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
Parcialmente. En `empresa_pruebas`, "categoría"/"nivel" son texto libre sin catálogo y las preguntas no tienen tag de competencia — sin trazabilidad a qué habilidad QA se midió.

**¿El resultado da información suficiente para decidir contratación?**
Da score y ranking comparativo, útil. Pero las respuestas de texto libre se autocalifican por palabras clave y el propio código las marca "revisar" sin ofrecer una pantalla de revisión manual.

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Crear prueba / agregar preguntas (`empresa_pruebas`) | Completo | Sin tipo de examen validado (solo `multiple_choice/true_false/short_text`); sin tag de competencia por pregunta | Selector de tipo + tag de competencia | Media 🚀 |
| Generar invitación de prueba propia | **Incompleto** | `createPruebaInvitacionAction` no envía email — recruiter debe copiar y pegar el link manualmente | Integrar `sendEmail` (ya existe en `@/lib/resend`, usado en el otro sistema) | **Alta** 🚀 |
| Configurar expiración/intentos | **Incompleto** | Backend soporta `expires_at`/`max_attempts`, pero el formulario de creación no los expone → nunca vencen | Exponer los campos en el formulario | Alta 🚀 |
| Envío/calificación automática (`short_text`) | Parcial | Autocalificado por palabras clave, marcado "revisar" en el propio código, sin pantalla de revisión manual | Construir revisión manual para `empresa_intentos` | Alta 🚀 |
| Notificación a la empresa al completar (`empresa_pruebas`) | **Roto/ausente** | `notifyEmpresaExamCompleted` existe pero nunca se invoca desde `submitIntentoAction` — el recruiter no se entera hasta entrar manualmente | Llamar la notificación tras `submitIntentoAction` | Alta 🚀 |
| Ver resultados / ranking | Completo | Ranking con medallas y % funciona; sin desglose por competencia (depende de agregar tags) | Agregar agregación por competencia | Media |
| `/invitacion/[token]` vs `/invitaciones/[token]` | Incompleto | Rutas duplicadas con drift: la singular no linkea el examen (dead-end para el candidato) | Unificar en una sola implementación | Alta 🚀 |
| Estado `'rechazada'` de invitación | Incompleto | Referenciado en la UI pero ningún código lo asigna — rama muerta, las invitaciones nunca vencen | Implementar expiración real o quitar la rama | Media |
| `section_scores` en resultados | No re-verificado este ciclo (hallazgo del ciclo anterior) | — | Re-auditar en próximo ciclo | Pendiente |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

Los datos del dashboard son reales (agregación en `employer.ts` sobre Supabase, no mockeados) y las quick actions ya están bien resueltas (7-8 links directos + stat cards clicables) — buena mejora desde el ciclo anterior en cuanto a funnel de invitaciones y visitas al perfil, que **ahora sí existen**.

| Métrica/widget | Existe | Problema UX | Propuesta | Valor |
|---|---|---|---|---|
| Funnel de invitaciones (enviadas→vistas→completadas) | **Sí** (`employer.ts:629-647`) | Solo se muestra si `total > 0`; en empresas nuevas queda oculto en vez de mostrarse vacío con CTA | Mostrar funnel vacío con CTA "invitar candidatos" | Alto — resuelto parcialmente vs. ciclo anterior ✅🚀 |
| Visitas al perfil de empresa | **Sí**, vía RPC real (`increment_empresa_profile_views`) | Sin desglose de fuente (¿candidato QA o tráfico general?) | Desglosar por fuente si es posible | Medio — resuelto desde ciclo anterior ✅ |
| Empty state empresa nueva | Parcial | Los 8 stat cards se renderizan en cero/guion **antes** de llegar al bloque de CTA — sensación de plataforma vacía | Ocultar/colapsar el grid de stats cuando `totalProcesses===0` | **Alto** 🚀 |
| Jerarquía visual | Parcial | 8 cards de igual peso visual sin distinguir un KPI "hero" (ej. invitaciones esperando respuesta) | Definir 1-2 KPIs hero arriba, resto secundario | Alto 🚀 |
| Revalidación / tiempo real | **No** | Solo fetch al montar, sin polling ni refetch on-focus — datos obsoletos si el recruiter deja la pestaña abierta esperando una prueba | Refetch en `visibilitychange` o botón "Actualizar" | Medio 🚀 |
| Tasa de respuesta a evaluaciones | Parcial | Cubre solo invitaciones directas, no las de proceso/código compartido | Ampliar el funnel a todos los canales | Alto 🚀 |
| Top skills QA disponibles este mes | **No** | Cero agregación de skills en todo `actions/` — confirmado por búsqueda exhaustiva | Widget con top 5 skills del pool | Alto 🚀 — diferenciador competitivo |
| Tiempo promedio de completado | **Sí** | Card muestra "—" sin explicar por qué cuando no hay candidatos aún | Tooltip explicativo | Medio |
| Candidatos que vieron el perfil (segmentado a QA) | Parcial | Existe conteo genérico, no distingue candidato QA autenticado de tráfico anónimo | Trackear evento con `user_id` cuando esté logueado | — |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨🚀 `/empresa/perfil` roto en producción ahora mismo** — `getMyEmpresaAction` usa `.single()` sin filtrar por empresa; la policy `empresas_public_select` (agregada para habilitar el directorio público) rompe esa suposición vía OR de RLS. Verificado: 3 empresas reales en producción → la query falla siempre. **Tipo: bug/regresión.** Bloqueante absoluto para CLT/Banco Continental.
2. **🚨🚀 Falla de seguridad en logos de empresa** — cualquier usuario autenticado puede sobrescribir/borrar el logo de cualquier otra empresa; las policies de `storage.objects` no verifican propiedad. **Tipo: bug de seguridad.**
3. **⚠️🚀 El gap de "invitación sin email" del ciclo anterior reapareció en un sistema nuevo** — el equipo construyó `empresa_pruebas` como sistema paralelo, y repitió el mismo error de no enviar email ni notificar a la empresa al completarse. **Tipo: bug / gap de funcionalidad recurrente.**
4. **⚠️🚀 Jerga ISTQB sin explicar** — sigue sin resolverse desde el ciclo anterior; un recruiter no-QA no entiende los filtros de nivel/examen. **Tipo: problema UX.**
5. **⚠️🚀 Dashboard: empty state muestra 8 métricas en cero antes del CTA** — primera impresión pobre para una empresa piloto recién registrada. **Tipo: problema UX.**

### Progreso confirmado desde el ciclo del 27/06 ✅
- Directorio público `/empresas` — **implementado**.
- Filtro de país en búsqueda de candidatos — **implementado**.
- Funnel de invitaciones y visitas al perfil en el dashboard — **implementados**.
- Shortlist/favoritos de candidatos — **implementado**.
- Campos de employer branding (stack, modalidad, beneficios, LinkedIn) en el perfil — **implementados**.

*(No re-verificado este ciclo: `section_scores` descartado en resultados, exportación CSV — quedan pendientes de re-auditar en el próximo ciclo.)*

### Bloqueantes para cliente piloto (CLT / Banco Continental)
1. Ninguna empresa puede ver/editar su propio perfil en este momento (`getMyEmpresaAction` roto) — bloquea el onboarding completo.
2. Riesgo de que un usuario cualquiera sobrescriba el logo/marca de la empresa piloto.
3. El nuevo constructor de pruebas propias (`empresa_pruebas`) no notifica a candidato ni a empresa — inutilizable para un flujo real de reclutamiento hasta integrarlo con Resend.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | `getMyEmpresaAction` roto por policy OR (verificado en prod) | Bug/regresión | Sí 🚀 |
| 2 | Storage de logos sin verificación de propietario | Bug de seguridad | Sí 🚀 |
| 3 | `empresa_pruebas`: invitación sin email | Bug/gap funcionalidad | Sí 🚀 |
| 4 | `empresa_pruebas`: empresa no notificada al completarse | Bug/gap funcionalidad | Sí 🚀 |
| 5 | Rutas duplicadas `/invitacion` vs `/invitaciones` con drift | Bug | Parcial |
| 6 | Jerga ISTQB sin tooltip | Problema UX | Sí 🚀 |
| 7 | Shortlist no visible desde pantalla de búsqueda | Problema UX | No |
| 8 | Dashboard: 8 stat cards en cero antes del empty-state CTA | Problema UX | Sí 🚀 |
| 9 | Dashboard sin revalidación / tiempo real | Problema UX | Medio 🚀 |
| 10 | Top skills QA del mes ausente en dashboard | Gap funcionalidad | Sí 🚀 |
| 11 | Validación server-side ausente en perfil de empresa | Bug potencial | Medio |

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀
- El **funnel de invitaciones y las visitas al perfil ya están implementados** — se puede demostrar hoy "X candidatos vieron tu empresa este mes" una vez arreglado el bug de perfil.
- **Filtro por país y shortlist** — diferenciador LATAM ya construido, solo falta pulir visibilidad.
- Arreglar el bug crítico #1 es, a la vez, el desbloqueo más barato y más urgente: una sola línea de código habilita el onboarding de cualquier empresa piloto nueva.

### Foco del próximo ciclo (1 hora)
**Prioridad:** Estabilizar el onboarding de empresa + cerrar el gap de notificaciones en `empresa_pruebas`
1. Fix de `getMyEmpresaAction` (filtrar por `empresa_id` propio) + fix de policy de storage de logos — ambos son cambios acotados y desbloquean el piloto de inmediato.
2. Integrar `sendEmail`/`notifyEmpresaExamCompleted` en el flujo de `empresa_pruebas` (mismo patrón que ya existe en el sistema viejo).
3. Unificar `/invitacion/[token]` y `/invitaciones/[token]` en una sola implementación.
4. Re-auditar `section_scores` y exportación CSV, pendientes desde el ciclo anterior.

---

*Revisión generada automáticamente — 2026-07-11 · Rama: `claude/zen-noether-gu0hnj` · Hallazgo crítico #1 y #2 verificados con lectura directa contra Supabase de producción (proyecto `cbkctkpyxwbufvbwxogp`).*
