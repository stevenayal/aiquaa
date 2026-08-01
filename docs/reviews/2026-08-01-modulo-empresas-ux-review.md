# Revisión UX — Módulo de Empresas
**Fecha:** 1 de agosto de 2026
**Ciclo:** Mejora continua · 60 min (ciclo anterior: [2026-06-27](./2026-06-27-modulo-empresas-ux-review.md))
**Reviewer:** QA Lead (revisión automatizada de código + datos reales de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología y limitación honesta de este ciclo:** en este entorno no fue posible levantar la app localmente (sin daemon de Docker disponible para Postgres/Redis) ni navegar aiquaa.com en producción como usuaria autenticada (el fetch a `aiquaa.com/empresas` devolvió `403` por protección anti-bot de Vercel, y no hay credenciales de recruiter cargadas en esta sesión). Por lo tanto, **este ciclo NO incluyó clicks reales de un recruiter en el producto vivo** — sería reportar supuestos, lo cual la regla del ciclo prohíbe explícitamente.
>
> En su lugar, se verificó lo que sí se pudo probar de forma real:
> - **Lectura completa del código fuente** (Server Actions, páginas, RLS policies, migraciones SQL) de los 4 bloques.
> - **Consulta directa a la base de datos de producción** (Supabase, proyecto `aiquaa`, `cbkctkpyxwbufvbwxogp`) para contar filas reales en las tablas del módulo y confirmar qué se usa y qué no.
>
> Cada hallazgo abajo cita archivo:línea o tabla/conteo real. **Recomendación para el próximo ciclo:** provisionar una cuenta de empresa de prueba + acceso de navegador autenticado para poder correr el guion original de 60 min con clicks reales.

**Snapshot de uso real (producción, hoy):**

| Tabla | Filas | Lectura |
|---|---|---|
| `empresas` | 3 | Casi sin adopción real de perfiles |
| `empresa_favoritos` | 0 | Shortlist nunca usada |
| `empresa_pruebas` / `empresa_preguntas` / `empresa_prueba_invitaciones` / `empresa_intentos` | 0 / 0 / 0 / 0 | El generador de pruebas propias ("Beta") **nunca fue usado** en producción |
| `empresa_invitaciones` | 0 | El sistema de invitación a procesos tampoco tiene uso real todavía |
| `prospects` | 0 | — |
| `hiring_processes` | 22 | Hay actividad real de creación de procesos |
| `profiles` (candidatos) | 104 | Pool de candidatos existe |

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave
**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?** Sí, en gran parte — `empresa/perfil/page.tsx` calcula un score de completitud sobre 8 campos y muestra un checklist "Falta completar" con anchors directos a cada campo faltante (líneas 81-102, 305-322). Esto es una mejora real respecto al ciclo anterior.

**¿El perfil público de la empresa inspira confianza a un candidato QA?** Parcialmente. El formulario de edición ya cubre stack tecnológico, modalidad de trabajo, beneficios y LinkedIn (ver tabla) — el gap de campos del ciclo anterior está resuelto. El riesgo ahora es de adopción: con solo 3 empresas en producción, la mayoría de perfiles públicos estará casi vacío.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Registro inicial (`RegisterForm.tsx:23-30`) | Solo pide nombre de contacto, email, password, razón social y RUC — nada de país, industria ni logo | M | Es intencional (se completa después), pero el registro crea una empresa "vacía" que aparece así en el directorio hasta que alguien la completa | Completo (por diseño) |
| RUC obligatorio con formato paraguayo fijo (`validateRegisterForm.ts:40-45`, regex `/^\d{6,8}-\d$/`) | El país no se pregunta en el registro pero el RUC se valida siempre como PY | **A** para expansión LATAM | Preguntar país en el registro y adaptar el formato de identificación tributaria (RUC/NIT/CUIT/RFC) | Incompleto/roto para no-Paraguay |
| Campos de perfil (`empresa/perfil/page.tsx`) | Set completo: logo, razón social, nombre comercial, RUC, descripción (800 car., con contador), sitio web, industria, país, tamaño equipo, modalidad, tamaño equipo QA, stack tecnológico (tags), beneficios (500 car.), LinkedIn | — | Cubre lo pedido en el ciclo anterior | **Completo** (mejora vs. ciclo previo) |
| Validación de guardado (`actions/empresa-admin.ts:296-330`) | Validación solo client-side (regex JS + `maxLength` HTML); el server action escribe cualquier string sin revalidar longitud/formato de URL | M | Repetir la validación en el server action antes del `update` | Incompleto |
| Subida de logo (`perfil/page.tsx:161-164`, migración `20260602...sql:93-105`) | Tamaño/tipo de archivo solo se valida en el cliente; las policies de Storage solo chequean `auth.uid() IS NOT NULL`, sin límite de tamaño/MIME a nivel servidor | M | Agregar validación de tamaño/tipo en la policy o en un trigger | Incompleto |
| Persistencia en Supabase | El `update` está bien scopeado por `empresa_id` y rol, con manejo de errores y loading state visibles | — | — | **Completo** |
| Empty state de campos vacíos | Renderizado defensivo: secciones sin dato simplemente no se muestran (sin "lorem ipsum" ni UI rota) | B | — | Correcto, pero una empresa recién creada se ve casi vacía en el directorio (solo nombre + ícono 🏢) | Parcial (riesgo de confianza para piloto) |
| Directorio público `/empresas` | **Existe** (no como reportaba el ciclo anterior), con `revalidate=300` (caché de 5 min) | B | Reducir el caché o invalidar on-demand tras guardar perfil | Completo (resuelto desde el ciclo anterior) |
| Contador de vistas del perfil (`empresas/[id]/page.tsx:56`) | El RPC `increment_empresa_profile_views` se llama sin `.catch` — errores se descartan en silencio | B | Loguear el error para no perder métricas sin darse cuenta | Parcial |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave
**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?** No completamente — persiste el problema del ciclo anterior con los valores ISTQB sin explicación amigable.

**¿El flujo para contactar o guardar un candidato es claro y directo?** Es funcional pero **hay dos páginas distintas** (`/empresa/buscar-candidatos` y `/empresa/candidatos`) que hacen búsquedas parecidas con capacidades de filtro y política de privacidad **inconsistentes entre sí** — esto es nuevo y no estaba documentado en el ciclo anterior.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtros que no filtran nada (`empresa/candidatos/page.tsx:1149-1211` vs. 453-498) | Los selects "Proceso", "Examen" y "Aprobados/No aprobados" se muestran siempre, pero en las pestañas "Talento QA"/"Shortlist" no se aplican a los datos mostrados | El recruiter cambia un filtro, no pasa nada, sin feedback | Ocultar los filtros que no aplican a la pestaña activa, o cablearlos de verdad | **Alto** 🚀 |
| Exposición de email inconsistente | En "Evaluados" (`candidatos/page.tsx:1385-1389,954-961`) se muestra `participant_email` y un link `mailto:` directo; en "Talento QA"/`buscar-candidatos` el email nunca se expone (política "sin exponer emails") | Dos políticas de privacidad distintas para el mismo pool de candidatos en el mismo módulo | Unificar: usar siempre el flujo de invitación de la plataforma, no `mailto:` directo | **Alto** 🚀 (riesgo de privacidad + inconsistencia de producto) |
| Filtro por experiencia (años) | No existe en ningún lado — ni en `profiles` ni en la UI | Un recruiter no puede segmentar junior/senior | Agregar campo de años de experiencia al perfil de candidato y como filtro | **Alto** |
| Dos páginas con distinto set de filtros (`buscar-candidatos` tiene skills+disponibilidad; `candidatos` no) | Confuso: ¿cuál es "la" búsqueda de candidatos? | Un recruiter nuevo no sabe cuál usar | Unificar en una sola pantalla o diferenciar claramente el propósito de cada una (ej. "Descubrir talento" vs. "Mis evaluados") | **Alto** |
| Ranking por relevancia | Ordena por disponibilidad → mejor score → recencia; no usa XP/ranking/logros de la plataforma | Se pierde una señal de calidad que AIQUAA ya calcula en otro módulo | Incorporar XP/ranking como criterio de orden opcional | Medio |
| Shortlist / favoritos (`empresa_favoritos`) | Insert/delete/list implementados de punta a punta, pero el `empresa_id` del front viene de `profiles.empresa_id` mientras el RLS valida contra `empresa_miembros` — si divergen, el guardado falla en silencio con un error genérico | Un recruiter con multi-membresía puede no poder guardar candidatos sin entender por qué | Resolver `empresa_id` de una sola fuente de verdad (la membresía activa, no el perfil denormalizado) | Medio |
| Invitar candidato — reporta éxito aunque el email falle (`empresa-invitaciones.ts:46-49`, `buccar-candidatos/page.tsx:261-265`, `candidatos/page.tsx:774-777`) | El envío depende de la env var `EMAIL_SENDING_ENABLED` (no documentada en `.env.local.example`); si no está seteada, el registro se guarda con `email_sent:false` pero **la UI igual muestra "Invitación enviada"** porque solo chequea el campo `error`, nunca `email_sent` | El recruiter cree que contactó a un candidato y nunca se envió nada | Chequear `email_sent`/`email_error` en la respuesta y mostrar el estado real | **Crítico** 🚀 |
| Empty state sin resultados | Copys claros por pestaña ("Sin candidatos para estos filtros", "Tu shortlist está vacía…") | — | — | Bueno |
| Uso real (0 filas en `empresa_favoritos`) | La función de shortlist existe hace al menos un ciclo pero nadie la usó todavía en producción | Puede ser un problema de descubribilidad, no solo de funcionalidad | Agregar el shortlist como acción visible junto a cada resultado, no solo dentro de la ficha | Medio |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave
**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?** No — persiste el gap del ciclo anterior sobre falta de descripción de qué mide cada tipo de examen.

**¿El resultado le da información suficiente para tomar una decisión de contratación?** Depende de qué sistema de evaluación usa la empresa — y ahí está el hallazgo más importante de este ciclo: **hay dos sistemas de evaluación distintos, con nivel de completitud muy diferente.**

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Flujo de invitación a proceso general (`empresa_invitaciones`) | **Completo, con email real vía Resend** (`empresa-invitaciones.ts:101-105`) y ruta pública `/invitacion/[token]` e `/invitaciones/[token]` funcionando | Esto **resuelve el bloqueante crítico #1 del ciclo anterior** ("invitaciones sin email, token sin ruta") | Confirmar en próximo ciclo con un envío real de punta a punta (requiere credenciales) | Resuelto ✅ (a confirmar con test en vivo) |
| Rutas duplicadas `/invitacion/[token]` vs `/invitaciones/[token]` | Ambas existen (singular y plural) | Puede ser intencional (dos flujos distintos) o accidental — no se investigó a fondo el propósito de cada una | Confirmar si ambas rutas son necesarias o si una es remanente | Bajo |
| Constructor de "pruebas propias" de la empresa (`empresa/pruebas/*`, marcado "Beta") | Funcional de punta a punta en código: crear prueba → agregar preguntas (solo 3 tipos: opción múltiple, verdadero/falso, texto corto — **no hay modo ISTQB teórico/práctico/case study diferenciado** como pide el producto) → invitar → candidato responde → resultados con ranking y desglose por pregunta | El código funciona pero **0 empresas lo usaron en producción** (`empresa_pruebas`=0 filas) | Ver causa raíz abajo | Alto |
| Envío de invitación en el sistema de "pruebas propias" (`empresa-pruebas.ts`) | **No envía ningún email** — el link se copia al portapapeles para que el recruiter lo comparta manualmente fuera de la plataforma | A diferencia del sistema general de invitaciones (que sí manda email), este flujo depende 100% de que el recruiter reenvíe el link por su cuenta | Reusar el mismo mecanismo de Resend que ya funciona en `empresa-invitaciones.ts` | **Alto** 🚀 |
| Causa probable de adopción cero del sistema de "pruebas propias" | El acceso requiere una fila activa en `empresa_miembros`; si las cuentas piloto no tienen esa membresía provisionada, cada acción falla con "Sin membresía activa" sin ser obvio para el usuario; además el link de nav solo aparece si `user_metadata.audience === 'empresa'` | Una empresa piloto podría no estar viendo esta función en absoluto | Verificar el provisioning real de la cuenta piloto de CLT/Banco Continental antes del próximo ciclo | **Alto** |
| Vista de resultados (ambos sistemas) | Completa: score, %, ranking con medallas, desglose por pregunta, tiempo, flags de revisión manual | — | — | Bueno |
| Timeout de evaluación | Sí existe (duración por intento + 2 min de gracia con auto-envío) en el sistema de "pruebas propias" | — | — | Bueno |
| Descripción de qué evalúa cada tipo de examen al candidato/empresa | Sigue sin descripción human-readable de cada tipo (`istqb`, `git`, `performance`, etc.) | Un líder técnico no técnico en QA no entiende el contenido sin salir de la plataforma | Agregar tooltip/card descriptivo por tipo | Medio (persiste del ciclo anterior) |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Procesos activos / total / cerrados | Sí, con query real | — | — | Alto |
| Candidatos evaluados / tasa de aprobación / tiempo promedio | Sí, con query real | — | — | Alto |
| Prospectos pendientes, invitaciones activas + funnel, visitas al perfil | Sí, con query real (**el funnel de invitaciones del ciclo anterior ya se implementó** ✅) | Con `prospects`=0 y `empresa_invitaciones`=0 en producción, estos widgets nunca se van a renderizar para las empresas piloto actuales | Mostrar un estado "aún sin datos, así se va a ver cuando..." en vez de ocultar el widget completo | Alto |
| **Bug: el botón principal "Nuevo proceso" del dashboard no asocia el proceso a la empresa** (`empresa/procesos/nuevo/page.tsx:178-191` no setea `empresa_id`, mientras que `getEmpresaDashboardStatsAction` filtra estrictamente por `empresa_id`) | Parcial/roto | Cualquier proceso creado desde el botón principal del dashboard **no cuenta para ninguna métrica** del propio dashboard (aunque sí aparece en `/empresa/procesos` por otra vía) | Setear `empresa_id` en el insert, igual que ya hace el flujo legacy `/employer/nuevo` | **Crítico** 🚀 — el dashboard puede mostrar actividad cero mientras la empresa sí está creando procesos |
| Dos banners de bienvenida apilados para empresa nueva | Sí (empty state + welcome banner con copy casi idéntico) | Redundante, ocupa espacio antes de llegar a la grilla de navegación | Unificar en un solo bloque | Bajo |
| Acciones rápidas (nuevo proceso, buscar talento, candidatos evaluados, invitar, eventos, perfil) | Sí, todos los links funcionan | — | — | Bueno |
| Ruta duplicada `/employer/*` (dashboard completo alternativo, sin ningún link de navegación hacia ella) | Código muerto/huérfano confirmado — cero referencias en el resto del repo | Riesgo de mantenimiento: dos implementaciones de "crear proceso"/"ver candidatos" que pueden divergir; no es visible para el usuario pero sí es deuda técnica | Eliminar `/employer/*` o documentar por qué se mantiene | Medio (deuda técnica, no UX directo) |
| Top skills QA disponibles este mes | No | Oportunidad de market intelligence para CLT/Banco Continental, sigue sin existir | Widget "Skills más evaluados este mes" | Medio |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨 El botón principal del dashboard para crear un proceso no lo asocia a la empresa**, por lo que el dashboard puede mostrar "cero actividad" a una empresa que en realidad sí está usando la plataforma. `empresa/procesos/nuevo/page.tsx:178-191`. Tipo: **bug**.
2. **🚨 Las invitaciones a candidatos se marcan como "enviadas" en la UI aunque el email nunca haya salido** (dependen de una env var no documentada, y el frontend nunca chequea el resultado real del envío). Tipo: **bug**.
3. **🚨 El sistema de "pruebas propias" de la empresa (Beta) nunca envía email** — a diferencia del sistema general de invitaciones que sí lo hace — y tiene 0 filas de uso real en producción, probablemente por membresía de empresa no provisionada. Tipo: **gap de funcionalidad + posible bug de acceso**.
4. **⚠️ Inconsistencia de privacidad**: el email del candidato se expone con `mailto:` directo en una pantalla del módulo, pero está explícitamente oculto en otra pantalla del mismo módulo. Tipo: **bug de producto / riesgo de privacidad**.
5. **⚠️ Filtros que no filtran** en la pestaña "Talento QA"/"Shortlist" de `/empresa/candidatos` — el recruiter interactúa con controles que no hacen nada. Tipo: **bug UX**.

**Buenas noticias vs. el ciclo del 27/06:** los 3 bloqueantes más críticos de ese ciclo — directorio público inexistente, invitaciones sin email, campos de perfil faltantes — **están resueltos**. El funnel de invitaciones en el dashboard también se implementó. El equipo avanzó real y verificablemente entre ciclos.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | "Nuevo proceso" del dashboard no setea `empresa_id` → métricas en cero | Bug | Sí 🚀 |
| 2 | Invitaciones "enviadas" en UI aunque el email falle | Bug | Sí 🚀 |
| 3 | Sistema de pruebas propias (Beta) sin email | Gap funcionalidad | Sí 🚀 |
| 4 | Posible membresía no provisionada bloquea "pruebas propias" en silencio | Bug / gap de acceso | Sí (a confirmar) 🚀 |
| 5 | Exposición inconsistente de email de candidatos | Bug / privacidad | Sí 🚀 |
| 6 | Filtros que no filtran en pestañas de talento/shortlist | Bug UX | Parcial |
| 7 | RUC fijo a formato paraguayo sin preguntar país en registro | Gap funcionalidad | Sí para expansión fuera de PY 🚀 |
| 8 | Sin filtro de años de experiencia | Gap funcionalidad | Sí (CLT/Banco Continental lo necesitan) |
| 9 | Dos pantallas de búsqueda de candidatos con distinta capacidad | UX problem | Parcial |
| 10 | `/employer/*` código muerto duplicado | Deuda técnica | No (no visible al usuario) |

### Bloqueantes para cliente piloto (CLT / Banco Continental)

1. Un recruiter puede creer que invitó/contactó candidatos cuando en realidad ningún email salió (#2) — esto rompe la confianza en el producto en el primer uso real.
2. El dashboard, la primera pantalla que ve la empresa, puede mostrar actividad cero incluso creando procesos activamente (#1).
3. El generador de pruebas propias — la función más "premium" del módulo — no tiene tracción porque no notifica a nadie y posiblemente no está habilitado para las cuentas piloto (#3, #4).
4. La empresa no puede segmentar candidatos por experiencia, un filtro básico de cualquier ATS (#8).

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El funnel de invitaciones y las vistas de perfil **ya están implementados y con datos reales disponibles** — listos para un pitch de "así medimos tu ROI de reclutamiento".
- El sistema de evaluaciones propias (una vez resueltos los bugs de email/acceso) es un diferenciador fuerte: ninguna otra plataforma QA en español en LATAM ofrece pruebas custom + ranking + Resend integrado.
- La corrección de los 3 bloqueantes del ciclo anterior demuestra velocidad de ejecución real — argumento a favor frente a un inversor o cliente piloto escéptico.

### Foco del próximo ciclo (1 hora)

**Prioridad: cerrar la brecha de confianza "el recruiter cree que algo pasó y no pasó".**

1. Arreglar el insert de `empresa/procesos/nuevo` para que setee `empresa_id` (fix de una línea, alto impacto).
2. Hacer que la UI de invitaciones refleje el `email_sent` real (no solo la ausencia de `error`), y documentar/verificar `EMAIL_SENDING_ENABLED` en producción.
3. Conectar Resend al flujo de "pruebas propias" (`empresa-pruebas.ts`), reusando el mismo mecanismo que ya funciona en `empresa-invitaciones.ts`.
4. **Provisionar una cuenta de empresa de prueba con membresía activa y credenciales accesibles para el próximo ciclo**, para poder correr el guion original de 60 minutos con clicks reales en vez de solo revisión de código — esto es en sí mismo el gap más grande de este ciclo de QA.

---

*Revisión generada automáticamente — 2026-08-01 · Rama: `claude/zen-noether-gsdsg0`*
*Nota: no se crearon tickets en Jira (aiquaa.atlassian.net) — esta sesión no tiene esa integración conectada. Los 10 hallazgos de la tabla de clasificación están listos para copiarse como tickets.*
