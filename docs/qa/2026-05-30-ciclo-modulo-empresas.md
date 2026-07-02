# Ciclo de mejora continua — Módulo Empresas (aiquaa.com)

**Fecha:** sábado, 30 de mayo de 2026 (documento redactado 2026-07-02 en ciclo de auditoría posterior)
**Reviewer:** QA Lead — visión estratégica del producto
**Persona objetivo:** Recruiter / responsable de RRHH en LATAM
**Clientes piloto objetivo:** CLT · Banco Continental SAECA (Paraguay)
**Metodología:** revisión de código fuente (`apps/frontend/src/app/empresa*`, `apps/frontend/src/actions/*`, `supabase/migrations/*.sql`), pruebas en navegador (Playwright headless) contra un `next dev` local, y **consultas SQL de solo lectura contra la base de producción real** (`cbkctkpyxwbufvbwxogp.supabase.co`) para verificar datos y esquema. Cuando algo no pudo probarse en vivo (ej. flujos que requieren credenciales reales de una empresa), se marca explícitamente como "revisión de código" en vez de "probado en vivo", según la regla del ciclo de no reportar supuestos.

---

## ⚠️ Corrección de arquitectura (hallazgo de apertura)

El prompt de este ciclo asume un backend NestJS + Prisma (`apps/backend`). **Ese backend no existe en el repo** — fue removido en el commit `a67bc38` ("chore: remove NestJS backend and dead code (migrated to Supabase)"). El stack real es:

- **Backend:** Supabase (Postgres + RLS + Auth + Storage + 1 Edge Function), definido como SQL en `supabase/migrations/*.sql`.
- **Frontend:** Next.js 13 (`apps/frontend`), habla directo con Supabase vía Server Actions (`apps/frontend/src/actions/*.ts`).

Todos los hallazgos de abajo están mapeados contra esta arquitectura real. Esto no cambia el objetivo del ciclo (UX del recruiter), pero sí cambia dónde están los riesgos: como no hay una capa de API intermedia, cualquier desalineación entre el código del frontend y el esquema real de la base de datos (migraciones no aplicadas, columnas faltantes) rompe la funcionalidad en producción sin pasar por ningún tipo de contrato/validación. Esto es exactamente lo que encontramos en el Bloque 2.

🐛 **Bug de infraestructura encontrado y corregido en este ciclo:** `apps/frontend/package.json` todavía declaraba `"@aiquaa/shared": "workspace:*"` como dependencia, un paquete borrado en el mismo commit de migración a Supabase. Esto rompe `pnpm install` en cualquier clon nuevo del repo (CI, onboarding de un dev nuevo, este mismo ciclo de QA). Se eliminó la línea huérfana para poder levantar el entorno y probar en vivo.

---

## 🏢 Bloque 1 — Perfil de empresa

**Lo que existe (verificado por código):** formulario completo en `/empresa/perfil` — logo (upload a Supabase Storage), razón social, nombre comercial, RUC (con validación de formato paraguayo `80012345-6`), descripción (contador de 800 caracteres), sitio web (validación de URL), industria, país, tamaño de equipo, modalidad de trabajo, tamaño de equipo QA, stack tecnológico (tags), beneficios, LinkedIn. Incluye un widget de **"% de perfil completo"** con enlaces directos a los campos faltantes, y un link de vista previa al perfil público. Los campos "stack tecnológico" y "cultura/beneficios" que el bloque pedía verificar como posible gap **ya están implementados** (`tech_stack`, `benefits`, `work_mode`, `linkedin_url`, `qa_team_size`).

**Dato real de producción (consulta SQL directa, no supuesto):**

| Métrica                                          | Valor real hoy |
| ------------------------------------------------ | -------------- |
| Empresas totales registradas                     | 3              |
| Con logo cargado                                 | 0              |
| Con descripción                                  | 0              |
| Con sitio web                                    | 0              |
| Con industria                                    | 0              |
| Vistas de perfil acumuladas (todas las empresas) | 0              |

Es decir: **el 100% de los perfiles de empresa creados hasta hoy están vacíos**, y ninguno ha recibido una sola visita pública. El directorio público (`/empresas`) probado en vivo muestra el empty state "Todavía no hay empresas publicadas" — en este caso confirmamos que es representativo del estado real (0 perfiles con datos suficientes para mostrarse con contenido), aunque el bug de manejo de errores de abajo significa que ese mismo mensaje también aparecería ante una falla técnica.

🚨 **Hallazgo crítico — cliente piloto CLT ya registrado pero con cuenta inutilizable** 🚀
La empresa `CLT` **ya existe en producción** (creada 2026-06-19, contacto real `talentohumano@clt.com.py` registrado desde 2026-05-21). Su perfil está 100% vacío (sin RUC, sin logo, sin descripción, sin sitio web, sin industria, sin equipo) y **tiene 0 miembros activos** (`empresa_miembros`). Verificamos a nivel de políticas RLS que las funciones `auth_user_empresa_role()` / `my_empresa_role()` — que gobiernan quién puede **editar** el perfil de una empresa — exigen una fila activa en `empresa_miembros`, que CLT no tiene. Conclusión verificada: el contacto de CLT puede probablemente **ver** su perfil (hay una policy de lectura basada en `profiles.empresa_id`), pero **no puede guardar ningún cambio** — el formulario de `/empresa/perfil` fallaría silenciosamente o con error de permisos al intentar guardar. Este es exactamente el cliente piloto nombrado en este ciclo, y su cuenta lleva 6 semanas registrada sin poder avanzar.

🐛 **Bug de manejo de errores (código, confirmado por lectura de `apps/frontend/src/app/empresas/page.tsx:37-42`):** la consulta a Supabase del directorio público descarta el `error` de la respuesta (`const { data: empresas } = await supabase.from('empresas').select(...)`) y por defecto usa `[]`. Cualquier falla — RLS mal configurada, timeout, caída de Supabase — se ve **idéntica** al estado "no hay empresas publicadas". Un recruiter (o el propio equipo de AIQUAA) no tiene forma de distinguir "no hay datos" de "algo está roto".

| Elemento del perfil                               | Problema UX                                                                                                     | Impacto  | Propuesta de mejora                                                                                                                                                                       | Estado actual           |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Edición de perfil (owner/admin) para CLT          | Cuenta piloto sin membresía activa → no puede guardar cambios                                                   | **A** 🚀 | Backfill manual de `empresa_miembros` (role=owner, status=active) para el `user_id` de `talentohumano@clt.com.py`; auditar si hay más cuentas empresa pre-multiusuario en el mismo estado | Roto                    |
| Directorio público `/empresas`                    | Error de query indistinguible de "0 empresas"                                                                   | M        | Loggear/manejar el `error` de Supabase y mostrar un estado de fallo distinto al empty state                                                                                               | Roto (silencioso)       |
| Empty state de perfil nuevo                       | No se probó en vivo (requiere login real); por código, existe widget de "% completo" con CTAs — patrón correcto | B        | —                                                                                                                                                                                         | Completo (según código) |
| Validaciones de campos (RUC, URL, largo de texto) | Presentes en el formulario según código                                                                         | B        | Confirmar en un próximo ciclo con sesión autenticada real                                                                                                                                 | Completo (según código) |
| Confianza del perfil público para un candidato QA | 0 de 3 empresas tiene logo o descripción — el directorio no transmite ninguna confianza hoy                     | **A** 🚀 | Onboarding activo: contactar a las 3 empresas registradas (especialmente CLT) para completar perfil antes de invertir en más adquisición                                                  | Incompleto              |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

**Lo que existe (verificado por código):** `/empresa/candidatos` con 3 tabs — "Evaluados" (candidatos que rindieron una evaluación ligada a procesos de la empresa), "Talento QA" (directorio opt-in filtrable por nivel ISTQB y país), "Shortlist" (favoritos). Comparación rápida de hasta 4 candidatos. Guardar/quitar de shortlist escribe en `empresa_favoritos`.

🚨 **Hallazgo crítico — el tab "Talento QA" está roto en producción ahora mismo** 🚀
Verificado directamente contra el esquema real (`information_schema.columns`): la tabla `profiles` en producción **no tiene** las columnas `talent_visible_to_empresas`, `istqb_level`, `open_to_work` ni `github_profile`. La migración que las agrega (`supabase/migrations/20260625_020000_candidate_talent_directory.sql`) existe en el repo pero **nunca fue aplicada a producción** (no aparece en el historial de migraciones de Supabase, y las columnas simplemente no existen). El código del tab "Talento QA" en `/empresa/candidatos/page.tsx` consulta exactamente esas columnas — cualquier recruiter que abra ese tab hoy dispara un error de Postgres ("column does not exist"). Este es el gap de funcionalidad más severo del módulo: no es una feature incompleta, es una feature que **rompe la página** al usarse.

**Dato real de producción:** `empresa_favoritos` (shortlist) tiene **0 filas** — nunca se usó, consistente con que el directorio de talento (la fuente principal para poblar un shortlist) está inaccesible.

| Filtro/función                     | UX actual (código)                                                                                 | Problema                                                                                                                                                    | Propuesta                                                                                                                       | Prioridad      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Tab "Talento QA"                   | Filtra por nivel ISTQB + país + texto libre                                                        | **Rompe la página — columnas de `profiles` no existen en prod**                                                                                             | Aplicar la migración `20260625_020000_candidate_talent_directory.sql` a producción antes de cualquier otra tarea de este módulo | **Crítica** 🚀 |
| Filtro de "experiencia" / "skills" | No existe como campo estructurado (solo ISTQB, país, texto libre)                                  | Un recruiter de RRHH sin contexto QA no puede filtrar por años de experiencia ni por skill específico (ej. "Selenium", "API testing")                       | Agregar campos estructurados de experiencia y tags de skills al perfil de candidato                                             | Alta           |
| Shortlist / favoritos              | Botón "Guardar/Quitar" en la tabla, tab dedicado                                                   | Funciona por código pero nunca fue usado en producción (0 filas) — probable síntoma de que nadie llegó a usar el directorio de talento por el bug de arriba | Resolver el bug de "Talento QA" primero; luego medir adopción                                                                   | Alta           |
| Comparación de candidatos          | Selección de hasta 4, panel comparativo                                                            | No probado en vivo (requiere sesión autenticada)                                                                                                            | Validar en próximo ciclo con credenciales reales                                                                                | Media          |
| Empty states                       | Copys específicos ya escritos en código ("Sin talento visible todavía", "Tu shortlist está vacía") | No se pudieron verificar en vivo                                                                                                                            | Validar visualmente                                                                                                             | Baja           |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

**Lo que existe (verificado por código + esquema real):** las tablas `assessments`, `assessment_attempts`, `assessment_scores`, etc. **sí existen y están aplicadas** en producción (confirmado por `information_schema.tables`), junto con las políticas RLS que permiten a miembros de empresa leer intentos/puntajes de sus procesos. Tipos de evaluación ofrecidos al crear un proceso: ISTQB CTFL, Git, Git práctico, Performance, API Testing (fundamentos y challenge), Database (fundamentos y práctica).

**Envío de email por Resend — confirmado como incompleto, no supuesto:** `apps/frontend/src/actions/empresa-invitaciones.ts` arma el email de invitación pero lo envía solo si `process.env.EMAIL_SENDING_ENABLED === 'true'`. El propio comentario de la migración `20260627_020000_empresa_invitaciones_email_tracking.sql` lo admite explícitamente: agrega columnas de tracking de entrega **"WITHOUT yet wiring Resend or sending any real email"**. No pudimos confirmar el valor de esa env var en Vercel producción en este ciclo (fuera de alcance de las herramientas disponibles), pero el dato de uso real la hace irrelevante hoy:

🚨 **Dato real de producción:** `empresa_invitaciones` tiene **0 filas** — ninguna empresa ha usado nunca el flujo formal de "invitar candidato a evaluación". En cambio, hay 13 `hiring_processes` (12 activos) y 73 `assessment_attempts` reales — es decir, el uso real pasa por el flujo legado de compartir un **código de proceso** directamente con el candidato (fuera de la plataforma, probablemente por WhatsApp/email manual), no por el sistema de invitaciones construido para este caso de uso. Esto sugiere que el flujo de invitación formal no fue descubierto, no es claro, o no aporta valor sobre simplemente copiar el código — vale la pena investigar con las empresas reales por qué no lo usan antes de invertir más en pulirlo.

**Deuda técnica encontrada:** dos páginas de invitación candidato-facing casi idénticas y ambas activas — `/invitacion/[token]` (consulta la tabla directo) y `/invitaciones/[token]` (usa RPCs más seguras). Candidato para consolidar. También: la Edge Function `nueva-empresa-alert` llama a la API de **SendGrid**, no Resend, pero loggea sus errores como `"Error Resend"` — inconsistencia de nombres que puede confundir debugging futuro.

| Paso del flujo                                    | Estado                                            | Problema UX                                                                                          | Acción recomendada                                                                                                        | Prioridad   |
| ------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Creación de proceso + selección de tipo de examen | Completo                                          | —                                                                                                    | —                                                                                                                         | —           |
| Envío de invitación formal a candidato            | Incompleto                                        | Email real gateado por flag `EMAIL_SENDING_ENABLED`; 0 uso real en producción                        | Verificar estado del flag en Vercel; validar con una empresa real por qué prefieren compartir el código en vez de invitar | **Alta** 🚀 |
| Notificación al candidato (Resend)                | Incompleto (según comentario de migración)        | Candidato invitado formalmente podría nunca recibir el email                                         | Confirmar flag en producción y probar envío real end-to-end                                                               | Alta        |
| Vista de resultados/comparación para la empresa   | Completo (tablas y RLS aplicadas)                 | No probado en vivo                                                                                   | Validar con sesión real en próximo ciclo                                                                                  | Media       |
| Timeout/fecha límite de evaluación                | `hiring_processes.expires_at` existe en el modelo | No se validó el comportamiento UI al vencer                                                          | Probar en próximo ciclo                                                                                                   | Media       |
| Cobertura de pruebas automatizadas                | —                                                 | **0 de 13 specs de Playwright** mencionan empresa/company/employer/recruiter — módulo entero sin e2e | Agregar al menos un e2e del flujo crear proceso → invitar → completar → ver resultado                                     | **Alta** 🚀 |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

**Lo que existe (verificado por código):** `/empresa` dashboard real, sin datos mockeados — procesos activos/cerrados/totales, candidatos evaluados + tasa de aprobación, tiempo promedio, invitaciones pendientes, embudo de invitación (enviadas → vistas → completadas), vistas de perfil, gráficos de 6 meses (Recharts). Empty state real cuando `totalProcesses === 0`: _"🚀 ¡Empezá a reclutar talento QA!"_ con CTAs a crear proceso o completar perfil. Banner de bienvenida descartable (persistido en `localStorage`).

Dado que **ninguna empresa ha creado nunca una invitación** (0 filas en `empresa_invitaciones`), el widget de "embudo de invitación" mostraría 0/0/0 para las 3 empresas reales que existen hoy — no pudimos confirmar en vivo si el cálculo de "tasa de respuesta" maneja división por cero de forma segura (podría mostrar `NaN%`); queda como pendiente de verificación con sesión real.

| Métrica/widget                                  | Existe                                                                           | Problema UX                                                                                                                                  | Propuesta                                                                          | Valor para la empresa               |
| ----------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| Procesos activos/cerrados                       | Sí                                                                               | —                                                                                                                                            | —                                                                                  | Alto                                |
| Candidatos evaluados + tasa aprobación          | Sí                                                                               | —                                                                                                                                            | —                                                                                  | Alto                                |
| Embudo de invitación (enviada→vista→completada) | Sí (parcial)                                                                     | Con 0 invitaciones reales en toda la plataforma, este widget nunca ha mostrado datos útiles a nadie; posible división por cero no verificada | Confirmar manejo de 0/0; considerar ocultar el widget hasta que haya ≥1 invitación | Medio (hoy: nulo, por falta de uso) |
| Vistas de perfil de empresa                     | Sí                                                                               | 0 vistas acumuladas en toda la plataforma — la métrica existe pero no tiene tráfico que medir                                                | —                                                                                  | Bajo (hoy)                          |
| Candidatos guardados (shortlist)                | Parcial — solo como contador de tab en `/empresa/candidatos`, no en el dashboard | Un recruiter no ve de un vistazo cuántos candidatos tiene guardados sin entrar a otra página                                                 | Sumar como tile en el dashboard                                                    | Medio 🚀                            |
| Tasa de respuesta a evaluaciones enviadas       | Propuesta del bloque, ya cubierta por el embudo                                  | —                                                                                                                                            | —                                                                                  | Alto (cuando haya datos)            |
| Top skills QA disponibles este mes              | Propuesta del bloque, **no existe**                                              | Sin este campo estructurado (ver Bloque 2), imposible de calcular                                                                            | Depende de resolver el gap de skills estructurados primero                         | Alto 🚀                             |

---

## ✅ Cierre & registro del ciclo

### Hallazgos UX más críticos (máx. 5)

1. **CLT, el cliente piloto nombrado en este ciclo, ya está registrado en producción desde hace 6 semanas pero su cuenta no puede editar su propio perfil** — falta la fila de membresía activa que las políticas de permisos exigen. _(Bug — bloquea uso real, 🚀)_
2. **El tab "Talento QA" del buscador de candidatos rompe la página en producción** — consulta columnas de `profiles` que nunca se crearon porque la migración correspondiente no se aplicó. _(Bug — bloquea uso real, 🚀)_
3. **El flujo formal de "invitar candidato a evaluación" nunca fue usado por ninguna empresa real (0 de 0)** — las empresas reales usan un atajo legado (compartir código de proceso) en su lugar; el envío de email por Resend además está apagado por flag. _(Gap de funcionalidad + posible problema de UX de descubribilidad, 🚀)_
4. **El 100% de los perfiles de empresa en producción están vacíos y con 0 vistas** — el directorio público, tal como está hoy, no transmite ninguna confianza a un candidato QA. _(Gap de funcionalidad / adopción, 🚀)_
5. **El módulo de Empresas no tiene ninguna cobertura de pruebas e2e** (0 de 13 specs de Playwright) y el proyecto raíz tenía una dependencia rota que impedía `pnpm install` en un clon limpio. _(Bug + deuda de calidad, corregido parcialmente en este ciclo)_

### Clasificación

| #   | Hallazgo                                                                | Tipo                           |
| --- | ----------------------------------------------------------------------- | ------------------------------ |
| 1   | CLT sin membresía activa                                                | Bug (dato de producción)       |
| 2   | Tab "Talento QA" roto (migración no aplicada)                           | Bug (dato de producción)       |
| 3   | Invitaciones nunca usadas / email apagado por flag                      | Gap de funcionalidad           |
| 4   | Perfiles de empresa vacíos, 0 vistas                                    | Gap de adopción / UX           |
| 5   | Sin e2e del módulo + dependencia rota en `pnpm install`                 | Bug de calidad/infraestructura |
| —   | Directorio público esconde errores de Supabase como "0 empresas"        | Bug (código)                   |
| —   | Duplicación `/invitacion` vs `/invitaciones`, `/employer` vs `/empresa` | Deuda técnica                  |
| —   | Sin filtros estructurados de experiencia/skills                         | Gap de funcionalidad           |

### Tickets propuestos (formato listo para Jira — no se crearon en Jira, sin acceso a `aiquaa.atlassian.net` en esta sesión)

| Título                                                                         | Descripción                                                                                                                                                            | Pasos para reproducir                                                                                                                               | Impacto                                                        | Prioridad         |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------- |
| Restaurar acceso de edición de CLT a su perfil de empresa                      | El contacto `talentohumano@clt.com.py` no tiene fila activa en `empresa_miembros`; no puede guardar cambios en `/empresa/perfil`                                       | Insertar fila en `empresa_miembros` (empresa_id=CLT, role=owner, status=active) para ese `user_id`; confirmar guardado exitoso en `/empresa/perfil` | Bloquea al cliente piloto nombrado en el pitch de Moonshot     | **Bloqueante** 🚀 |
| Aplicar migración `candidate_talent_directory` a producción                    | Tab "Talento QA" de `/empresa/candidatos` consulta columnas inexistentes en `profiles` (`talent_visible_to_empresas`, `istqb_level`, `open_to_work`, `github_profile`) | Iniciar sesión como empresa → `/empresa/candidatos` → tab "Talento QA" → error de Postgres                                                          | Feature completa inutilizable                                  | **Bloqueante** 🚀 |
| Manejar errores de Supabase en `/empresas` (directorio público)                | El `error` de la query se descarta; cualquier falla se ve igual que "0 empresas"                                                                                       | Leer `apps/frontend/src/app/empresas/page.tsx` líneas 37-42                                                                                         | Imposibilita diagnosticar caídas reales vs. falta de datos     | Alta              |
| Investigar por qué las empresas no usan el flujo de invitación formal          | 0 de 0 invitaciones creadas en producción pese a 13 procesos y 73 intentos reales vía código compartido                                                                | Entrevistar a las 3 empresas registradas; revisar si el flag `EMAIL_SENDING_ENABLED` está activo en Vercel prod                                     | El flujo diseñado para este ciclo no se usa en la práctica     | Alta 🚀           |
| Confirmar estado del flag `EMAIL_SENDING_ENABLED` en Vercel producción         | Sin esto, ningún candidato invitado recibe email real pese a que la UI lo sugiere                                                                                      | Revisar env vars del proyecto en Vercel                                                                                                             | Candidatos invitados podrían nunca enterarse                   | Alta              |
| Agregar cobertura e2e mínima al módulo Empresas                                | 0 de 13 specs de Playwright cubren registro/perfil/búsqueda/invitación/dashboard de empresa                                                                            | `ls apps/frontend/e2e/`                                                                                                                             | Regresiones invisibles hasta que un usuario real las reporta   | Media             |
| Consolidar rutas duplicadas de invitación e hiring flow                        | `/invitacion` vs `/invitaciones`, `/employer` vs `/empresa`                                                                                                            | Comparar ambos pares de rutas                                                                                                                       | Confusión de mantenimiento, riesgo de bug divergente           | Media             |
| Agregar filtros estructurados de experiencia y skills al directorio de talento | Solo existen ISTQB/país/texto libre; un recruiter no puede buscar por skill concreto                                                                                   | Revisar columnas de `profiles` usadas en `/empresa/candidatos`                                                                                      | Búsqueda insuficiente para el caso de uso principal del bloque | Media 🚀          |

### Qué bloquea el uso real hoy por CLT / Banco Continental

- CLT específicamente **ya no puede avanzar** sin una intervención manual en la base de datos (backfill de `empresa_miembros`).
- Cualquier empresa nueva (incluido un eventual Banco Continental) que intente usar el buscador de talento QA se encontrará con una página rota en el primer clic al tab "Talento QA".
- El perfil público de empresa, tal como está poblado hoy, no serviría como vitrina de confianza para ninguna de las dos porque el patrón observado (3 de 3 empresas con perfil vacío) sugiere que el formulario, aunque completo, no se está completando en la práctica — vale la pena un follow-up humano, no solo de producto.

### Foco del próximo ciclo (1 hora)

1. Resolver los dos bugs bloqueantes (membresía de CLT, migración de talento QA) — deberían ser lo primero, fuera incluso del formato de bloques de 60 minutos si es necesario antes.
2. Sesión de prueba en vivo con credenciales reales de empresa (crear una cuenta de prueba dedicada) para validar los flujos de edición de perfil, invitación y dashboard que en este ciclo solo se pudieron revisar por código.
3. Entrevista corta con el contacto de CLT para entender si llegaron a intentar usar la plataforma y en qué paso se frenaron — esto es más valioso que seguir puliendo UX sin ese dato.

### Referencia a tickets de un ciclo anterior (2026-06-27)

Ya existía un ciclo previo de este mismo módulo (`docs/qa`, commit `e62cce2`) que abrió 3 issues en GitHub. Estado verificado en este ciclo:

- **#206** ("agregar campos de employer branding — stack, modalidad, beneficios, LinkedIn") — **sigue abierto en GitHub, pero ya está implementado en código** (migración `20260627_000000_empresas_branding_views.sql` + formulario de `/empresa/perfil`). Falta solo cerrarlo.
- **#205** ("section_scores descartado en la UI") — cerrado como completado; no encontramos evidencia en contra en este ciclo.
- **#204** ("invitaciones no envían email al candidato") — cerrado como _not_planned/duplicate_ el 2026-06-27, presumiblemente porque se agregó la ruta `/invitaciones/[token]` y el flag `EMAIL_SENDING_ENABLED`. Sin embargo, el dato real de producción de este ciclo (**0 invitaciones creadas, jamás**) muestra que el problema de fondo — un candidato invitado no se entera — sigue sin poder observarse en la práctica porque nadie ha llegado a usar el flujo. Vale la pena reabrirlo o crear uno nuevo enfocado en adopción/descubribilidad en vez de solo el envío técnico del email.
