# Revisión UX — Módulo de Empresas
**Fecha:** 22 de julio de 2026
**Ciclo:** Mejora continua · ciclo de seguimiento (encadenado a `docs/reviews/2026-06-27-modulo-empresas-ux-review.md` y a la revisión no mergeada del 21-jul-2026, rama `claude/zen-noether-vmow0v`)
**Reviewer:** QA Lead (revisión automatizada de código + base de datos en producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT (Centro Logístico de Tecnología SA) · Banco Continental SAECA (Paraguay)

> **Metodología y una corrección importante de contexto:** este ciclo tuvo acceso directo al proyecto de Supabase de producción (`cbkctkpyxwbufvbwxogp`) vía MCP, además del código fuente. Todo lo marcado como "confirmado" fue verificado con una consulta SQL real contra producción o una lectura de archivo con línea citada — no son supuestos. También se detectó que **el brief recurrente de este ciclo describe un stack que no es el real** (dice "NestJS + Prisma"; el módulo de empresas corre 100% sobre Next.js Server Actions + Supabase/Postgres con RLS, sin backend NestJS ni Prisma en absoluto — confirmado por ausencia total de `apps/backend`, `*.controller.ts` y `schema.prisma` en el repo). Los ADRs 001/004/005 documentan una decisión de arquitectura que nunca se implementó así. Esto no es un hallazgo de UX pero condiciona cómo se debe leer el resto del reporte: el módulo está **mucho más completo** de lo que el brief genérico ("módulo incompleto") asume — casi todos los bloques tienen CRUD, RLS multi-tenant, emails transaccionales y dashboards con datos reales. Los gaps reales son puntuales, no estructurales.

---

## 🚨 Hallazgos críticos (fuera de los 5 bloques, prioridad máxima — algo roto siempre es prioridad máxima)

### 1. La fuga de PII de `empresa_invitaciones` reportada el 21-jul sigue explotable hoy, con causa raíz identificada

El ciclo del 21-jul (no mergeado, rama `claude/zen-noether-vmow0v`) reportó que la policy `USING (true)` sobre `empresa_invitaciones` permitía leer toda la tabla sin autenticación. Se volvió a verificar contra producción **hoy** con una query directa a `pg_policies`:

```sql
select policyname, roles, cmd, qual from pg_policies where tablename = 'empresa_invitaciones';
```

Resultado: la policy `empresa_invitaciones_public_token_select` (`USING (true)`, creada en `supabase/migrations/20260627_000000_empresas_branding_views.sql:41-45`) **ya no está activa en producción** — alguien la removió fuera de banda (no hay ninguna migración nueva en `supabase/migrations/` que la elimine; el archivo de migración sigue en el repo tal cual, con su guard `IF NOT EXISTS`, lo que significa que **el estado de prod ya divergió de lo que las migraciones versionadas describen** — un futuro `supabase db push`/replay de migraciones la volvería a crear silenciosamente).

Sin embargo, queda activa la policy original y más angosta `empresa_invitaciones_public_token_read` (`supabase/migrations/20260602_000000_empresa_profile_and_invitaciones.sql:63-65`):

```sql
USING (token IS NOT NULL AND status IN ('pendiente', 'vista'))
```

`token` es `NOT NULL` con default `gen_random_uuid()` (confirmado en `information_schema.columns`) — es decir, **siempre** es no-nulo. Esta policy en la práctica equivale a `USING (status IN ('pendiente', 'vista'))`: cualquiera con la anon key pública puede hacer `GET {SUPABASE_URL}/rest/v1/empresa_invitaciones?select=*` y obtener **todas las invitaciones activas de todas las empresas** — `candidate_email`, `candidate_name`, `message`, `empresa_id` y el propio `token` (que permite ver/completar la evaluación en nombre del candidato) — sin conocer ningún token de antemano. Es el mismo tipo de vulnerabilidad reportada ayer, con superficie algo menor (excluye invitaciones ya completadas/rechazadas) pero sigue siendo un data leak de PII explotable sin autenticación.

**Causa raíz encontrada (nueva en este ciclo):** hay dos rutas para `/invitaciones/[token]`:
- `apps/frontend/src/app/invitaciones/[token]/page.tsx:32` — la ruta correcta (plural), usa la RPC segura `supabase.rpc('get_invitacion_by_token', ...)`, que es `SECURITY DEFINER` y no depende de ninguna policy de SELECT directo sobre la tabla.
- `apps/frontend/src/app/invitacion/[token]/page.tsx:44,75` — ruta duplicada y muerta (singular, ya señalada el 21-jul), que consulta `.from('empresa_invitaciones').select(...)` **directamente contra la tabla**.

Se confirmó además (grep exhaustivo de `from('empresa_invitaciones')` en todo `apps/frontend/src`) que **ningún otro código de cliente público** depende del SELECT directo — todos los demás usos (`empresa-invitaciones.ts`, `employer.ts`, `exams.ts`) son server actions que corren en contexto autenticado de empresa (cubiertos por `empresa_invitaciones_member_read`). Es decir: **la única razón por la que esta policy pública sigue existiendo es la ruta muerta `/invitacion/[token]` (singular)**. Borrarla es un cambio de una sola carpeta, sin impacto funcional (no tiene enlaces entrantes desde ningún otro archivo verificado), y una vez borrada, la policy `empresa_invitaciones_public_token_read` puede eliminarse sin romper nada, dejando el acceso por token exclusivamente a través de la RPC segura.

**Acción recomendada (sin cambios respecto al 21-jul, pero ahora con el paso exacto):**
1. Eliminar `apps/frontend/src/app/invitacion/[token]/` (carpeta completa, ruta singular muerta).
2. `DROP POLICY "empresa_invitaciones_public_token_read" ON public.empresa_invitaciones;` vía una migración nueva versionada (no otro cambio manual fuera de banda).
3. Actualizar/eliminar la migración `20260627_000000_empresas_branding_views.sql` (o agregar una migración posterior que documente el DROP) para que el estado de prod y el de las migraciones versionadas dejen de estar desincronizados.
4. Ejecutar `supabase get_advisors` (seguridad) sobre el proyecto para auditar si hay otras policies `USING (true)` para `anon` que deban revisarse con el mismo criterio.

### 2. La empresa piloto CLT no tiene ningún usuario con acceso — bloqueo total, confirmado hoy contra producción

```sql
select em.* from empresa_miembros em where em.empresa_id = '765269d3-b928-4059-a27b-fcdbb61b24b9'; -- CLT
```

Devuelve **0 filas**. La tabla `empresas` tiene el registro de CLT (creado 2026-06-19, `razon_social = 'CLT'`), pero nadie tiene una fila en `empresa_miembros` vinculada a ese `empresa_id`. Como todo el acceso al panel `/empresa/*` (perfil, dashboard, búsqueda de candidatos, invitaciones) está gateado por membresía activa en `empresa_miembros`, **hoy no existe ningún usuario que pueda iniciar sesión como CLT y usar el módulo**. Esto ya se había reportado en el ciclo del 18/19-jul y **sigue exactamente igual hoy** — no hubo remediación.

Además, el perfil de CLT en `empresas` está 100% vacío: sin logo, descripción, sitio web, industria, tamaño de equipo, modalidad de trabajo, tech stack ni beneficios (verificado con `SELECT * FROM empresas WHERE razon_social = 'CLT'` — todos esos campos son `NULL`, `profile_views = 0`).

Aparte, existe un registro de CLT en la tabla `talent_companies` (`name = 'CENTRO LOGISTICO DE TECNOLOGIA SA'`, con 2 `talent_selection_processes` asociados) — pero esas tablas (`talent_*`) pertenecían al backend NestJS que fue eliminado (confirmado: no existe `apps/backend` en el repo actual). **Son datos huérfanos sin ningún código de aplicación que los lea o escriba hoy** — ni el frontend actual las consulta. `talent_companies.aiquaaEmpresaId` (la columna pensada para vincular ambos esquemas) está en `NULL` para las 2 filas, confirmando que el vínculo nunca se completó antes de que el sistema `talent_*` quedara abandonado.

**Impacto:** este es el hallazgo más bloqueante de todo el ciclo para el caso de uso real. No importa cuántas features de búsqueda/evaluación/dashboard estén implementadas — **el cliente piloto nombrado no puede entrar a usarlas hoy.**

**Acción recomendada:**
1. Crear una fila en `empresa_miembros` para al menos un usuario real de CLT con `role = 'owner'`, `status = 'active'`, y confirmar que ese usuario existe en `auth.users`/`profiles`.
2. Decidir el destino de las tablas `talent_*` (11 tablas, 0-2 filas cada una, sin código que las use): o se migran sus datos al esquema `empresas`/`hiring_processes` vigente, o se documentan como deprecadas y se remueven en una migración de limpieza. Hoy son puro ruido de esquema que confunde cualquier auditoría (como pasó en ciclos anteriores).

---

## 🏢 Bloque 1 — Perfil de empresa (re-verificación puntual)

No se rehizo la auditoría completa del bloque (ya cubierta exhaustivamente el 21-jul); se re-verificaron puntualmente 2 hallazgos contra el código actual:

| Hallazgo (ciclo 21-jul) | Estado hoy | Evidencia |
|---|---|---|
| Completitud de perfil infla el avance con valores por defecto (`country`, `razon_social`) | **Sigue sin corregirse**, confirmado con datos reales de CLT | `apps/frontend/src/app/empresa/perfil/page.tsx:83-98` — `PROFILE_FIELDS` tiene 7 campos incluyendo `razon_social` y `country`; para CLT (`razon_social` cargado, `country='PY'` default, el resto `NULL`) el cálculo da **2/7 = 29%** de completitud mostrada sin que nadie haya tocado el perfil — ni siquiera hay nadie que pueda tocarlo (ver hallazgo crítico #2) |
| `section_scores` forzado a `null` en la vista por proceso (`employer.ts:417`) | **Sigue sin corregirse** | `apps/frontend/src/actions/employer.ts:417` — `section_scores: null,` idéntico a lo reportado ayer, en `fetchAssessmentAttemptsForProcessCodes` |

Los demás hallazgos del bloque 1 (slug de URL pública, preview inline, eliminar logo, contador de caracteres, label RUC dinámico, validación de `linkedin_url`, límites de bucket server-side) **no se re-testearon este ciclo** — no hay evidencia nueva ni para confirmar que se corrigieron ni para reafirmar que siguen rotos; se listan en la tabla de clasificación de abajo con su estado del ciclo anterior sin cambios.

Nota positiva confirmada por revisión de código (agente de exploración): el modelo de datos de `empresas` sí cubre stack tecnológico, modalidad de trabajo, beneficios, LinkedIn y tamaño de equipo QA específico — el gap real no es de campos faltantes sino de la fricción operativa de bloque crítico #2 (nadie puede completarlo para el piloto).

---

## 🔍 Bloque 2 y 📋 Bloque 3 — no re-testeados en profundidad este ciclo

Dado el tiempo del ciclo y que el foco de mayor impacto era verificar si el hallazgo de seguridad crítico seguía vigente (sí) y el estado real del piloto CLT (bloqueado), no se re-verificó punto por punto cada fila de las tablas de búsqueda de candidatos y evaluaciones técnicas del ciclo del 21-jul. Por la regla de "no reportar supuestos", **no se listan como corregidos ni como rotos** — quedan tal como figuran en `claude/zen-noether-vmow0v` (rama no mergeada) hasta el próximo ciclo que los re-teste explícitamente.

Una corrección de alcance sí verificada por el agente de exploración de este ciclo: el sistema de evaluaciones para empresas es en realidad **dos sistemas paralelos completos** — `hiring_processes` (procesos con exámenes predefinidos, código de acceso) y `empresa_pruebas`/`empresa_preguntas`/`empresa_prueba_invitaciones`/`empresa_intentos` (constructor de pruebas propias con preguntas custom, invitación por token, `max_attempts` y `expires_at`). Ambos tienen CRUD completo y notificación por email vía Resend. Esto es más avanzado de lo que el brief genérico asume, pero la coexistencia de dos sistemas paralelos (además de los `talent_*` huérfanos del punto anterior) es en sí misma una señal de fragmentación de producto que vale la pena resolver antes de sumar un tercer piloto.

---

## 📊 Bloque 4 — Dashboard de empresa (no re-testeado en profundidad)

Confirmado indirectamente: el dashboard de CLT no puede evaluarse en la práctica hoy porque no hay ningún usuario que pueda iniciar sesión como CLT (hallazgo crítico #2). Cualquier verificación de "qué ve la empresa piloto en su dashboard" es hoy imposible de probar end-to-end tal como está la cuenta.

---

## ✅ Cierre y registro del ciclo

### Top hallazgos críticos de este ciclo

1. **🚨 Bloqueo total de acceso para CLT (cliente piloto nombrado).** Cero filas en `empresa_miembros` para su `empresa_id` — nadie puede iniciar sesión como CLT hoy. Confirmado con SQL directo contra producción. Tipo: **bug/gap operativo**. Bloqueante absoluto para el piloto, sin cambios desde el 18/19-jul.
2. **🚨 La fuga de PII de `empresa_invitaciones` reportada ayer sigue explotable**, aunque alguien redujo su alcance fuera de banda (sin dejar rastro en las migraciones versionadas, lo cual es en sí un problema de proceso). Causa raíz identificada con precisión: la ruta muerta `/invitacion/[token]` (singular) es la única consumidora del SELECT directo sobre la tabla — borrarla habilita cerrar la policy sin romper nada. Tipo: **bug de seguridad**.
3. **⚠️ Esquema `talent_*` completamente huérfano** (11 tablas, backend NestJS que las servía ya no existe en el repo) con datos de CLT sin vincular (`aiquaaEmpresaId = null`) — ruido de auditoría y riesgo de confusión para cualquier desarrollador nuevo. Tipo: **deuda técnica**.
4. **⚠️ `section_scores` sigue forzado a `null`** en `employer.ts:417`, confirmado sin cambios desde ayer. Tipo: **bug de implementación**.
5. **⚠️ Completitud de perfil sigue inflando el avance con campos por defecto** — confirmado con el dato real de CLT (29% sin que nadie haya podido tocar el perfil). Tipo: **bug de UX no resuelto**.

### Clasificación

| # | Hallazgo | Tipo | Bloqueante para piloto | Estado |
|---|---|---|---|---|
| 1 | CLT sin ningún miembro en `empresa_miembros` | Bug operativo | **Sí — crítico** 🚀 | Confirmado hoy, sin cambios desde 18-jul |
| 2 | RLS de `empresa_invitaciones` sigue permitiendo lectura pública de invitaciones activas | Bug de seguridad | **Sí — crítico** 🚀 | Confirmado hoy, alcance reducido pero no cerrado |
| 3 | Ruta muerta `/invitacion/[token]` es la causa raíz de #2 | Deuda técnica | Sí (ligado a #2) | Confirmado hoy |
| 4 | Estado de prod desincronizado de las migraciones versionadas (policy dropeada fuera de banda) | Riesgo de proceso | No directamente, pero genera regresiones futuras | Confirmado hoy |
| 5 | Esquema `talent_*` huérfano sin código que lo use | Deuda técnica | No, pero confunde auditorías | Confirmado hoy |
| 6 | `section_scores` null en vista por proceso (`employer.ts:417`) | Bug | Sí 🚀 | Confirmado hoy, sin cambios desde 21-jul |
| 7 | Completitud de perfil con falso avance | UX | No, pero engañoso para el piloto | Confirmado hoy con dato real de CLT |
| 8-15 | Resto de hallazgos del ciclo 21-jul (slug, preview, CSV export, fragmentación de búsqueda, alertas de vencimiento, etc.) | Variado | Variado | **No re-testeados este ciclo** — ver `claude/zen-noether-vmow0v` |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. **CLT no puede usar la plataforma hoy en absoluto** — no tiene ningún usuario con acceso. Esto es más urgente que cualquier mejora de UX: sin esto, ningún otro hallazgo importa para el piloto.
2. La vulnerabilidad de RLS debe cerrarse antes de cualquier demo con Banco Continental — un banco no puede tolerar que los datos de candidatos invitados sean públicamente legibles, aunque hoy el alcance ya es menor que ayer.
3. Banco Continental SAECA **no tiene ninguna cuenta creada en la plataforma** (no aparece en `empresas`, `empresa_miembros` ni `talent_companies`) — el piloto con este cliente todavía no arrancó operativamente.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El sistema de pruebas propias (`empresa_pruebas`) con preguntas custom, invitación por token y scoring automático es una feature diferencial real y ya funciona end-to-end en código — vale la pena mostrarlo en el pitch una vez resuelto el acceso de CLT.
- El flujo de invitación con funnel (enviada → vista → completada) y notificación a la empresa por email ya está implementado, según confirmó el ciclo anterior — es el argumento de ROI más fuerte, condicionado a cerrar la vulnerabilidad de RLS antes de mostrarlo.

### Foco del próximo ciclo (1 hora)

**Prioridad 1 (innegociable): destrabar el acceso de CLT**
1. Crear la fila de `empresa_miembros` para un usuario real de CLT (`role='owner'`, `status='active'`).
2. Verificar con ese usuario, en vivo, que puede entrar a `/empresa`, ver su dashboard y su perfil.

**Prioridad 2 (innegociable): cerrar la vulnerabilidad de RLS con el camino ya identificado**
3. Borrar `apps/frontend/src/app/invitacion/[token]/` (ruta muerta).
4. Migración versionada que dropee `empresa_invitaciones_public_token_read` y documente que `empresa_invitaciones_public_token_select` no debe recrearse.
5. Correr `supabase get_advisors` de seguridad sobre el proyecto completo para descartar otras policies `USING (true)` no auditadas.

**Prioridad 3 (si el tiempo lo permite):**
6. Decidir el destino de las tablas `talent_*` huérfanas (migrar o deprecar formalmente).
7. Aplicar el mismo join de `assessment_scores` en `employer.ts:417` que ya se usa en el directorio principal de candidatos.

---

## Nota sobre creación de tickets en Jira

Este ciclo tampoco tuvo acceso a la instancia de Jira (`aiquaa.atlassian.net`) desde el entorno de ejecución automatizado — no hay un conector de Jira disponible en las herramientas de esta sesión. Contenido listo para pegar manualmente:

**[BLOQUEANTE-PILOTO] CLT no tiene ningún usuario con acceso a la plataforma**
- *Descripción:* La tabla `empresa_miembros` no tiene ninguna fila para el `empresa_id` de CLT (`765269d3-b928-4059-a27b-fcdbb61b24b9`). Todo el acceso a `/empresa/*` requiere membresía activa.
- *Pasos para reproducir:* `SELECT * FROM empresa_miembros WHERE empresa_id = '765269d3-b928-4059-a27b-fcdbb61b24b9';` → 0 filas.
- *Impacto:* Bloqueo total de uso real para el cliente piloto nombrado.
- *Prioridad:* Crítica / bloqueante de piloto.

**[SEGURIDAD-CRÍTICO] RLS de empresa_invitaciones sigue exponiendo invitaciones activas sin autenticación**
- *Descripción:* La policy `empresa_invitaciones_public_token_read` (`USING (token IS NOT NULL AND status IN ('pendiente','vista'))`) es, en la práctica, `USING (status IN ('pendiente','vista'))` porque `token` nunca es null. Permite `GET /rest/v1/empresa_invitaciones?select=*` sin autenticación.
- *Causa raíz:* La única consumidora de esta policy es la ruta muerta `/invitacion/[token]` (singular); la ruta correcta usa la RPC segura `get_invitacion_by_token`.
- *Pasos para reproducir:* Con la anon key pública, `GET {SUPABASE_URL}/rest/v1/empresa_invitaciones?select=*` → devuelve todas las invitaciones pendientes/vistas de todas las empresas.
- *Impacto:* Data leak de PII de candidatos (nombre, email, token) explotable sin credenciales.
- *Prioridad:* Crítica / bloqueante de seguridad.

**[DEUDA-TÉCNICA] Esquema talent_* huérfano sin código que lo use**
- *Descripción:* 11 tablas (`talent_companies`, `talent_selection_processes`, etc.) pertenecían a un backend NestJS que ya no existe en el repo. Datos de CLT sin vincular (`aiquaaEmpresaId = null`).
- *Impacto:* Ruido de esquema, riesgo de confusión en auditorías futuras.
- *Prioridad:* Media.

**[BUG] section_scores nulo en vista de candidatos por proceso**
- *Descripción:* `apps/frontend/src/actions/employer.ts:417` fuerza `section_scores: null` en `fetchAssessmentAttemptsForProcessCodes`.
- *Impacto:* Recruiter no ve desglose por área al revisar candidatos de un proceso específico.
- *Prioridad:* Alta.

---

*Revisión generada automáticamente — 2026-07-22 · Rama: `claude/zen-noether-nceb3e` · Ciclo de seguimiento de la revisión no mergeada del 21-jul-2026 (`claude/zen-noether-vmow0v`) y de `docs/reviews/2026-06-27-modulo-empresas-ux-review.md`*
