# Revisión UX — Módulo de Empresas (Ciclo 2)
**Fecha:** 5 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código + datos en vivo de Supabase)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)
**Ciclo anterior:** [2026-06-27-modulo-empresas-ux-review.md](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, migraciones SQL) **más** inspección directa de la base de datos Supabase de producción (proyecto `aiquaa`, `cbkctkpyxwbufvbwxogp`) vía MCP — se consultaron filas reales de `empresas`, `empresa_miembros`, `talent_companies`, `hiring_processes`, `profiles`, etc. No se hizo click-through manual en navegador porque no se dispone de credenciales de una cuenta de empresa piloto en este ciclo; todo lo reportado abajo está respaldado por código citado (archivo:línea) o por una consulta SQL real, no por suposición.

---

## 🆕 Progreso desde el ciclo anterior (2026-06-27)

Antes de los hallazgos nuevos, vale reconocer que 5 de los 5 bloqueantes críticos del ciclo pasado **ya fueron resueltos**:

| Hallazgo del ciclo anterior | Estado hoy |
|---|---|
| Invitaciones sin email / sin ruta pública | ✅ Resuelto — existe `/invitaciones/[token]` (RPC-backed, `get_invitacion_by_token`/`mark_invitacion_vista`) y `createInvitacionAction` envía email vía Resend. **Ver hallazgo nuevo #1 abajo: el envío depende de un flag sin documentar que probablemente está apagado.** |
| Directorio público `/empresas` inexistente | ✅ Resuelto — página con ISR, empty state, chips de industria/país/modalidad |
| Sin filtro de país en búsqueda de candidatos | ✅ Resuelto — filtro de país presente en ambas pantallas de búsqueda |
| Sin exportación CSV de resultados | ✅ Resuelto — botón CSV en tab "Evaluados" |
| Campos de employer branding faltantes (stack, modalidad, beneficios, LinkedIn) | ✅ Resuelto — todos agregados al formulario de perfil (`tech_stack`, `work_mode`, `benefits`, `linkedin_url`, `qa_team_size`) |
| `section_scores` descartado en la UI | ✅ Resuelto — se muestra desglose por sección en el tab "Evaluados" |
| Métricas B2B faltantes (funnel, page views) | ✅ Resuelto — dashboard tiene funnel de invitaciones y contador de visitas al perfil, ambos con datos reales |

Este es un progreso real y rápido (7 días hábiles). El foco de este ciclo pasa entonces de "¿existe la funcionalidad?" a "¿funciona de punta a punta con datos reales, y está realmente usable por CLT hoy?" — y ahí aparecieron hallazgos más graves que los del ciclo anterior.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
El widget de completitud (con enlaces a los campos faltantes) sigue siendo una buena guía. Pero esto es teórico: en la práctica, **ninguna de las 3 empresas reales en producción completó su perfil** (ver hallazgo #2).

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
El diseño de `/empresas/[id]` es sólido y se degrada bien campo por campo — pero hoy, para las 3 empresas reales, el perfil público literalmente no muestra nada más que el nombre y el ícono placeholder, porque no hay ni un solo campo opcional cargado.

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| **Perfil de CLT en producción** | Verificado en Supabase: la fila `empresas` de CLT (`765269d3…`, creada 19/jun) tiene **todos** los campos opcionales en `NULL` — sin logo, descripción, industria, sitio web, tamaño de equipo, modalidad, stack, beneficios, LinkedIn. `profile_views = 0`. | **A 🚀** | Contactar a CLT directamente para completar el perfil antes de cualquier demo; considerar un "concierge onboarding" para pilotos en vez de depender del self-service | Roto (vacío en prod) |
| **CLT no tiene ningún miembro/owner vinculado** | Verificado en Supabase: `empresa_miembros` no tiene **ninguna** fila para el `empresa_id` de CLT — solo existen 2 filas, ambas para cuentas internas "Aiquaa"/"AIQUAA". Es decir, **no hay ningún usuario que pueda hoy iniciar sesión y gestionar el perfil de CLT** vía `/empresa/*`. | **A 🚀** | Investigar cómo se creó esta fila de `empresas` sin trigger de owner; crear manualmente la membresía o volver a invitar al contacto real de CLT | Roto |
| **Registro duplicado de CLT en tabla paralela** | Existe una segunda fila para CLT ("CENTRO LOGISTICO DE TECNOLOGIA SA") en `talent_companies`, con su propio owner activo (`talent_company_users`, rol OWNER) y su propio proceso de selección ("Bootcamp 2026 - Fase de Pruebas", creado 04/jun). Esta tabla no está referenciada en ningún lugar del código de `apps/frontend` (confirmado por grep) — es un sistema huérfano de una iteración anterior (probablemente ligado a la ruta muerta `/employer/nuevo`). | **A 🚀** | El uso real de CLT ocurrió en el sistema viejo/huérfano, no en el que hoy es "el" módulo de empresas. Reconciliar o migrar manualmente los datos de CLT antes de asumir que el piloto está usando el flujo actual | Roto / arquitectura fragmentada |
| Campos de identidad profesional (stack, modalidad, beneficios, LinkedIn) | Ya existen en el formulario (a diferencia del ciclo anterior) | — | — | ✅ Completo (código) |
| RUC obligatorio y con formato paraguayo en el registro, para las 11 opciones de país del perfil | Una empresa de Argentina/Brasil/Chile/etc. no puede registrarse: `validateRegisterForm.ts` exige `/^\d{6,8}-\d$/` sin importar el país (no hay selector de país en el registro) | **A** | Volver el RUC opcional en países que no sean PY, o adaptar el formato/etiqueta (RUC/NIT/CUIT/RFC) según país seleccionado | Roto (bloqueante para expansión regional) |
| Valor por defecto de país ('PY') se graba silenciosamente | `form.country` inicia en `'PY'` en el estado local aunque la BD tenga `NULL`; el primer "Guardar cambios" de cualquier empresa no-paraguaya escribe `country: 'PY'` sin que el usuario lo haya elegido | **A** | No incluir `country` en el payload si el usuario no lo tocó explícitamente; o quitar el default y forzar selección | Incompleto / bug de datos |
| Validación de campos solo en cliente | `updateEmpresaAction` no revalida nada server-side (tamaño de logo, formato de URL, largo de texto) — bypasseable con una llamada directa a la API | **M** | Repetir las validaciones críticas en el server action | Incompleto (riesgo de seguridad menor) |
| Tipo de archivo del logo no se valida | Solo se chequea tamaño (2MB); el `accept` del input es solo un hint del navegador, el código nunca revisa `file.type` | **B** | Validar MIME type real antes de subir | Incompleto |
| Bucket de storage `empresa-logos` sin aislar por empresa | La policy RLS solo exige `auth.uid() IS NOT NULL` — cualquier usuario autenticado (incluido un candidato) podría subir/sobrescribir el logo de otra empresa | **A** | Restringir la policy a que el path incluya el `empresa_id` del caller | Roto (seguridad) |
| `/empresa/perfil` sin guard de "no pertenece a ninguna empresa" | A diferencia de `/empresa/admin/usuarios` (que sí bloquea), esta página renderiza el formulario completo aunque el usuario no tenga `empresa_id`, y solo falla al guardar con un alert genérico | **M** | Igualar el guard de `admin/usuarios` en `perfil` | Incompleto |
| Falta de verificación de RUC / badge de confianza | El perfil público no distingue entre una empresa con RUC verificado y una sin verificar | **M** | Agregar un badge "Empresa verificada" cuando el RUC pasa validación | Incompleto |
| Directorio `/empresas` puede quedar desactualizado hasta 5 min | `revalidate = 300` sin `revalidatePath` al guardar — el detalle `/empresas/[id]` sí se actualiza al instante | **B** | Invalidar `/empresas` en `updateEmpresaAction` | Parcial |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Los niveles ISTQB (`ctfl`, `ctal_ta`, etc.) siguen sin tooltips explicativos — persiste del ciclo anterior.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
El shortlist (favoritos) está correctamente implementado en ambas pantallas — pero probablemente nadie lo ha usado nunca, por la razón que se explica abajo.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| **Pool de candidatos "buscables" está casi vacío** | Verificado en Supabase: de **96 perfiles de candidatos, solo 1 tiene `talent_visible_to_empresas = true`**. | Aunque toda la búsqueda/filtrado funcione perfecto, un recruiter que la use hoy vería ~1 resultado en el peor de los casos. Esto explica también por qué `empresa_favoritos` tiene 0 filas — no hay a quién guardar. | Agregar un flujo de opt-in visible y con incentivo claro para candidatos ("hacé visible tu perfil a empresas"), medir cuántos perfiles califican (ISTQB aprobado, disponible) y campañarles directamente | **CRÍTICO 🚀** |
| **`/empresa/buscar-candidatos` estuvo roto en producción hasta hace 2 días** | Migración `20260702_220000` trae un comentario propio admitiendo que la función RPC `get_empresa_candidate_sourcing` nunca se aplicó en prod y la página fallaba con error. Se corrigió con la migración `20260703_022316 (empresa_candidate_sourcing_fixed)`. | Verificado que la función existe hoy en prod y las columnas que usa (`disponibilidad`, `qa_skills`, `country` en `profiles`) también existen — el arreglo parece estar aplicado. Pero como el bug persistió ~1 día en producción, cualquier recruiter que haya probado la búsqueda en ese lapso vio un error duro. | Agregar un test de smoke/CI que llame la RPC contra un ambiente de staging antes de cada deploy | **A** (riesgo ya mitigado, pero exposición reciente) |
| Dos pantallas de búsqueda con filtros distintos | `/empresa/buscar-candidatos` tiene filtro de skills y disponibilidad; `/empresa/candidatos` (tab "Talento QA") no tiene ninguno de los dos | Confuso tener dos "buscadores de candidatos" con capacidades distintas para el mismo pool de datos | Unificar en una sola pantalla, o al menos igualar el set de filtros | **A** |
| Filtros ISTQB sin descripción | Valores técnicos (`ctfl`, `ctal_ta`) sin tooltip | Un recruiter no-técnico no entiende qué significan | Mostrar etiquetas completas + tooltip explicativo | **A** |
| Ranking de resultados no usa el sistema de gamificación | El "mejor score" ordena por el % más alto **entre todos los tipos de examen combinados** (ISTQB, Git, Performance, API, DB, Infra) — comparar un 99% en Git contra un 85% en ISTQB no es comparable, y `ranking_achievements`/`user_xp` (52 y 35 filas respectivamente) no influyen en nada de la búsqueda | Ranking puede sentirse arbitrario para el recruiter | Ponderar por tipo de examen relevante al puesto, o mostrar el desglose en vez de un único "mejor score" | **M** |
| Mensaje de "invitación enviada" no refleja si el email realmente salió | El toast de éxito aparece igual si `EMAIL_SENDING_ENABLED` está apagado (no se envía nada) | El recruiter cree que invitó a alguien y no pasó nada | Mostrar el estado real (enviado / pendiente de config) | **A 🚀** |
| Shortlist / favoritos | Funcional y bien implementado en ambas pantallas (insert/delete real, tab dedicado, constraint único) | Sin uso en producción — 0 filas, coherente con el pool casi vacío de candidatos visibles | Una vez resuelto el opt-in de candidatos, validar con datos reales | **B** (no es un bug, solo falta demanda) |
| Botón "Contactar"/"Invitar" no aparece para candidatos del pool de Talento | El campo `contactEmail` nunca se completa para candidatos del directorio de talento (por diseño de privacidad), pero el botón está condicionado a ese campo — el único camino de contacto real es el flujo de invitación | Confuso que el botón simplemente no aparezca sin explicación | Mostrar siempre el botón "Invitar a proceso" (que sí funciona sin exponer el email) | **M** |
| Empty state sin candidatos que matcheen filtros | Mensaje claro en `/empresa/buscar-candidatos` ("Sin candidatos para estos filtros"); en `/empresa/candidatos` el mismo mensaje aparece tanto si no hay candidatos opt-in como si los filtros son muy restrictivos — no distingue el motivo | Puede confundir al recruiter sobre si el problema es su filtro o la falta de datos | Diferenciar "no hay talento visible aún" de "sin resultados para estos filtros" | **B** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
Los 10 tipos de examen se seleccionan por checkbox sin descripción de duración/nivel/qué mide — persiste del ciclo anterior.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Sí para exámenes estructurados (ISTQB, API, DB — desglose por sección visible); no para "test-app" (bug hunt), donde el único puntaje "Auto" está explícitamente marcado en el propio producto como no confiable.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Crear proceso y elegir tipo(s) de evaluación | Completo | Selección a nivel de *proceso completo* (bundle de 10 tipos posibles), no hay asignación de un tipo específico por candidato individual; los `exam_types` son strings sin descripción de duración/nivel | Agregar tooltips/cards descriptivos por tipo de examen | **A** |
| Invitar candidato por email | Completo en código, **posiblemente apagado en producción** | El envío real depende de `EMAIL_SENDING_ENABLED === 'true'` (sin documentar en ningún `.env.example`) y de que `RESEND_API_KEY` esté configurado — si cualquiera falta, la invitación se marca como "enviada" en la BD sin que salga ningún correo, y la UI no lo distingue | Documentar y verificar ambas variables en cada ambiente desplegado; mostrar en la UI si el email realmente se envió | **CRÍTICO 🚀** |
| Candidato accede por link de invitación | Completo | Existe `/invitaciones/[token]` (RPC-backed) — funcional. Existe también `/invitacion/[token]` (singular) que es código muerto e inalcanzable, y cuyo propio "marcar como vista" está roto por RLS | Eliminar la ruta singular para evitar que alguien la reactive por error | **M** |
| **Exposición de PII vía policy RLS abierta** | Roto (seguridad) | La policy `empresa_invitaciones_public_token_select` usa `USING (true)` para `anon` — cualquiera con la anon key pública (que viaja en el bundle del frontend) puede leer **todas** las filas de `empresa_invitaciones` de **todas** las empresas (email, nombre, mensaje, estado) sin necesitar el token | Restringir el `SELECT` de la tabla y depender exclusivamente de las funciones `SECURITY DEFINER` con el token como parámetro | **CRÍTICO 🚀** |
| Candidato completa evaluación vía código de proceso | Completo | Funciona bien; sin límite de tiempo (`duration_minutes` existe en el schema pero nunca se aplica — un candidato puede dejar un intento abierto indefinidamente) | Implementar timeout server-side comparando `started_at + duration_minutes` | **A** |
| Empresa revisa resultado — exámenes estructurados (ISTQB, API, DB, Infra) | Completo | Desglose por sección visible en el tab "Evaluados"; sin vista de revisión manual/auditoría (el score es 100% automático e inmutable desde la empresa) | Aceptable para exámenes de opción múltiple; documentar que no es editable | **B** |
| Empresa revisa resultado — "Test App" (bug hunt) | Parcial | Única página de revisión manual (aprobar/rechazar bugs, override de score) — el propio producto advierte en el banner que el score "Auto" no valida bugs reales ni duplicados | Mantener el flujo de revisión manual como obligatorio antes de decisión de contratación (ya existe, solo falta comunicarlo como paso requerido) | **M** |
| Notificación a la empresa cuando un candidato completa una evaluación | **No verificado / probablemente ausente** | No se encontró código de notificación (email/push) hacia la empresa al completarse un intento — la empresa debe entrar manualmente a revisar | Agregar notificación por Resend cuando se completa un intento de un proceso activo | **A 🚀** |
| Comparar candidatos entre sí | Incompleto | Existe vista de "ranking" (ordenado por score) pero no una comparación lado-a-lado seleccionable | Checkbox multi-select + modal comparativo | **M** |
| Fecha límite del proceso (`expires_at`) | Parcial | Existe y se aplica correctamente (bloquea envíos tras vencer), pero sin aviso anticipado ("vence en 3 días") | Agregar badge de alerta cuando falten &lt;7 días | **M** |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Procesos activos | Sí (dato real) | Sin desglose por estado de candidatos dentro del proceso | Mini-sparkline de actividad reciente | Alto |
| Candidatos evaluados | Sí (dato real, merge de `exam_results` + `assessment_attempts`) | No distingue aprobados/reprobados en el número principal | Dividir "X aprobados / Y reprobados" | Alto |
| Tasa de aprobación | Sí (dato real) | Muestra "—" sin candidatos, sin referencia de umbral (ISTQB CTFL = 65%) | Tooltip con el umbral de referencia | Alto |
| Tiempo promedio | Sí (dato real) | Sin benchmark de la plataforma | Agregar percentil de referencia | Medio |
| Perfil visto por candidatos | Sí (dato real, `profile_views`) | Sin protección anti-spam — refrescar la propia página infla la métrica | Deduplicar vistas por sesión/IP en la función de incremento | Alto |
| Funnel invitación → vista → completada | Sí (dato real) | Solo se muestra si `total &gt; 0` — para CLT/Banco Continental hoy estaría vacío | Mostrar el widget igual con estado "aún sin invitaciones" en vez de ocultarlo | Alto |
| Invitaciones activas / prospectos pendientes | Sí (dato real) | Bien implementado | — | Bueno |
| Gráficos de 6 meses (procesos y candidatos) | Sí | Bien implementados, solo se renderizan con al menos 1 dato | — | Bueno |
| Empty state sin actividad | Sí | CTA doble ("Crear primer proceso" / "Completar perfil") — bien diseñado | Sumar un tercer CTA "Invitar a tu primer candidato" | Bueno |
| **Confiabilidad de los números para CLT hoy** | — | Dado que CLT no tiene perfil completo ni miembro vinculado en `empresas`, y su actividad real vive en la tabla huérfana `talent_companies`, **el dashboard de `/empresa` mostraría todo en cero para CLT** aunque el cliente sí generó actividad real (en el sistema viejo) | Reconciliar los datos históricos de CLT hacia el sistema actual antes de mostrarles el dashboard | **Crítico para el piloto 🚀** |
| Top skills QA disponibles este mes | No | Oportunidad de market intelligence | Widget "Skills más evaluados este mes" | Medio |
| Tasa de respuesta a invitaciones | Parcial (dato disponible dentro del funnel, no aislado como KPI propio) | — | Extraer como número destacado | Alto |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🚨 CLT (cliente piloto nombrado) tiene un perfil de empresa completamente vacío y sin ningún usuario vinculado como owner/miembro en el sistema actual (`empresas`/`empresa_miembros`).** Verificado con una consulta directa a Supabase de producción, no es una suposición. Tipo: **bug de datos / gap operativo**. 🚀

2. **🚨 Fragmentación arquitectónica confirmada con evidencia real: existe un segundo registro de CLT ("CENTRO LOGISTICO DE TECNOLOGIA SA") en una tabla huérfana (`talent_companies`), con su propio owner activo y su propio proceso de selección real ("Bootcamp 2026 - Fase de Pruebas", 4 de junio) — el mismo proceso aparece *también* en `hiring_processes` pero sin vínculo (`empresa_id = NULL`, solo texto libre "CENTRO LOGISTICO DE TECNOLOGIA SA").** Esto indica que el uso real de CLT ocurrió en un flujo (`/employer/nuevo`) que hoy es código muerto sin enlaces de navegación, y nunca se reconcilió con el módulo `/empresa/*` actual. Tipo: **bug arquitectónico**. 🚀

3. **🚨 El pool de candidatos buscables está prácticamente vacío: solo 1 de 96 perfiles tiene `talent_visible_to_empresas = true`.** Toda la inversión en filtros, ranking, shortlist y CSV export (bloques 1 y 2) es invisible para un recruiter real hoy porque no hay suficiente inventario de candidatos opt-in. Tipo: **gap de funcionalidad / producto**. 🚀

4. **🚨 Policy RLS de `empresa_invitaciones` expone PII de todas las empresas (`USING (true)` para `anon`)** — cualquiera con la clave pública del proyecto puede leer emails/nombres/mensajes de invitaciones de cualquier empresa sin token. Tipo: **bug de seguridad**. 🚀

5. **⚠️ El envío real de emails de invitación depende de una variable de entorno sin documentar (`EMAIL_SENDING_ENABLED`) que probablemente está apagada** — la invitación se guarda como "enviada" aunque no salga ningún correo, y la empresa no tiene forma de saberlo. Tipo: **bug silencioso**. 🚀

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Perfil de CLT vacío, sin owner vinculado | Bug de datos | Sí 🚀 |
| 2 | Fragmentación `empresas` vs `talent_companies` (CLT dividido en dos sistemas) | Bug arquitectónico | Sí 🚀 |
| 3 | Pool de candidatos opt-in casi vacío (1/96) | Gap de producto | Sí 🚀 |
| 4 | RLS abierta en `empresa_invitaciones` (`USING (true)` para anon) | Bug de seguridad | Sí 🚀 |
| 5 | Envío de email de invitación gateado por flag sin documentar/probablemente apagado | Bug silencioso | Sí 🚀 |
| 6 | RUC obligatorio con formato PY para todos los países en registro | Bug/gap funcionalidad | Sí (bloquea expansión regional) |
| 7 | `country` se sobreescribe a `'PY'` por defecto al primer guardado | Bug de datos | Parcial |
| 8 | Bucket `empresa-logos` sin aislar por empresa (cross-tenant upload) | Bug de seguridad | Parcial |
| 9 | Sin notificación a la empresa cuando el candidato completa una evaluación | Gap de funcionalidad | Sí 🚀 |
| 10 | Ruta muerta `/invitacion/[token]` (singular) con lógica rota por RLS | Deuda técnica | No |
| 11 | Rutas `/employer/*` huérfanas, sin protección de middleware | Deuda técnica / riesgo de seguridad menor | No |
| 12 | Tablas `talent_assessment_*` (7 tablas, 0 filas, sin código que las use) | Deuda técnica | No |
| 13 | Dos pantallas de búsqueda de candidatos con filtros distintos | UX inconsistente | Parcial |
| 14 | Flujo de "aceptar invitación de equipo" nunca conectado a la UI | Gap de funcionalidad | No |
| 15 | Sin validación server-side de campos del perfil | Gap de seguridad menor | No |

### Bloqueantes reales para el cliente piloto (CLT / Banco Continental)

1. **CLT no puede hoy gestionar su perfil ni ver su propio dashboard real** en el sistema actual — su cuenta y su actividad histórica están fragmentadas en un sistema huérfano. Esto debe resolverse manualmente antes de cualquier demo o reunión con CLT.
2. Aunque se arregle el perfil de CLT, **casi no hay candidatos para mostrarles** en una búsqueda real (1 de 96 opt-in).
3. Si CLT invita candidatos hoy, **es probable que no reciban ningún email** por el flag `EMAIL_SENDING_ENABLED` sin confirmar en el ambiente de producción.
4. Un tercero podría leer los datos de contacto de los candidatos invitados por **cualquier** empresa (incluida CLT) por la policy RLS abierta — riesgo reputacional/legal si se descubre antes de resolverlo.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El progreso real en 7 días desde el ciclo anterior (directorio público, filtros de país, CSV, funnel, employer branding) demuestra velocidad de ejecución — vale destacarlo en el pitch.
- Una vez resuelto el opt-in de candidatos, el pool de talento (96 perfiles, ISTQB + 9 tipos de examen más) es un diferencial real frente a un ATS genérico.
- El dashboard con funnel de invitaciones y page views ya es un argumento de ROI concreto para RRHH — falta solo que tenga datos que mostrar.

### Tickets listos para crear en Jira (aiquaa.atlassian.net)

> Nota: esta sesión no tiene acceso configurado al conector de Jira, por lo que los tickets no se crearon automáticamente. Se dejan redactados abajo, listos para copiar/pegar.

**[CRÍTICO] CLT no tiene ningún usuario vinculado como owner en `empresa_miembros`**
- *Descripción:* La fila de `empresas` para CLT (id `765269d3-b928-4059-a27b-fcdbb61b24b9`) no tiene ninguna fila correspondiente en `empresa_miembros`. Ningún usuario puede hoy iniciar sesión y administrar el perfil/dashboard de CLT vía `/empresa/*`.
- *Pasos para reproducir:* `SELECT * FROM empresa_miembros WHERE empresa_id = '765269d3-b928-4059-a27b-fcdbb61b24b9'` → 0 filas.
- *Impacto:* Bloquea completamente el uso del piloto CLT en el sistema actual.
- *Prioridad:* Crítica.

**[CRÍTICO] Reconciliar los dos registros de CLT (`empresas` vs `talent_companies`)**
- *Descripción:* CLT existe duplicado: una fila vacía y sin owner en `empresas`, y una fila activa con owner y un proceso de selección real en la tabla huérfana `talent_companies` (sin código que la use en `apps/frontend`). El mismo proceso de selección aparece también, desconectado, en `hiring_processes` (`empresa_id = NULL`).
- *Impacto:* Los datos reales de uso de CLT no son visibles en el módulo actual; cualquier demo mostraría el dashboard de CLT vacío.
- *Prioridad:* Crítica.

**[CRÍTICO] Policy RLS de `empresa_invitaciones` expone PII sin token**
- *Descripción:* La policy `empresa_invitaciones_public_token_select` (migración `20260627_000000_empresas_branding_views.sql`) usa `USING (true)` para el rol `anon`, permitiendo leer todas las filas de la tabla vía REST directo con la clave anónima, sin necesitar el token.
- *Impacto:* Exposición de email/nombre/mensaje de invitación de candidatos de cualquier empresa.
- *Prioridad:* Crítica — remediar antes de cualquier auditoría de seguridad externa.

**[ALTO] Confirmar `EMAIL_SENDING_ENABLED` y `RESEND_API_KEY` en producción; exponer el estado real en la UI**
- *Descripción:* Si cualquiera de las dos variables falta o está mal configurada, las invitaciones a candidatos se guardan como "enviadas" sin que salga ningún email, sin error visible para el recruiter.
- *Prioridad:* Alta.

**[ALTO] Estrategia de opt-in para que candidatos activen `talent_visible_to_empresas`**
- *Descripción:* Solo 1 de 96 perfiles de candidatos tiene visibilidad activada para empresas, dejando la búsqueda de candidatos prácticamente vacía en producción.
- *Prioridad:* Alta — de producto, no solo de UX.

**[MEDIO] RUC obligatorio con formato paraguayo bloquea el registro de empresas de otros países**
- *Descripción:* `validateRegisterForm.ts` exige RUC con formato `\d{6,8}-\d` sin selector de país en el registro, aunque el perfil soporta 11 países LATAM.
- *Prioridad:* Media (bloqueante solo para expansión fuera de Paraguay).

### Foco del próximo ciclo (1 hora)

**Prioridad:** Reconciliación de datos del piloto CLT + seguridad de invitaciones

1. Investigar y resolver por qué CLT no tiene `empresa_miembros` — dar de alta manualmente al contacto real o reparar el trigger de registro.
2. Migrar/reconciliar la actividad histórica de CLT desde `talent_companies`/`hiring_processes` (sin `empresa_id`) hacia el modelo actual, para que su dashboard refleje su uso real.
3. Corregir la policy RLS de `empresa_invitaciones` (eliminar `USING (true)` para `anon`, depender solo de las funciones `SECURITY DEFINER`).
4. Verificar en el ambiente de producción real si `EMAIL_SENDING_ENABLED`/`RESEND_API_KEY` están configurados; si no, activarlos y probar una invitación de punta a punta.

Este ciclo es el que realmente decide si se puede sentar a CLT frente a la plataforma sin sorpresas.

---

*Revisión generada automáticamente — 2026-07-05 · Rama: `claude/zen-noether-v0gaii`*
