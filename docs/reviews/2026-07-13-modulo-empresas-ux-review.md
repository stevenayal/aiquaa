# Revisión UX — Módulo de Empresas
**Fecha:** 13 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** Revisión estática del código fuente actual (Next.js Server Actions + Supabase Postgres — no hay backend NestJS ni Prisma separados en este repo). Se contrasta contra la revisión previa de [2026-06-27](./2026-06-27-modulo-empresas-ux-review.md) para medir avance real. Solo se documentan hallazgos confirmados en el código.

---

## 🎉 Resumen de avance desde el 27 de junio

De los 10 hallazgos clasificados en el ciclo anterior, **8 están resueltos en código**:

| # | Hallazgo (27-jun) | Estado hoy |
|---|---|---|
| 1 | Invitaciones sin email / token sin ruta | ✅ Resuelto — `empresa-invitaciones.ts` envía email vía Resend, ruta `/invitaciones/[token]` existe |
| 2 | Directorio `/empresas` inexistente | ✅ Resuelto — `apps/frontend/src/app/empresas/page.tsx` |
| 3 | `section_scores` descartado en UI | ✅ Resuelto para `assessment_attempts` (breakdown por sección) — ⚠️ sigue dependiendo del tipo de examen para `exam_results` legacy |
| 4 | Campos perfil faltantes (stack, modalidad, beneficios) | ✅ Resuelto — `tech_stack`, `work_mode`, `benefits`, `linkedin_url`, `qa_team_size` |
| 5 | Métricas B2B faltantes (funnel, views, tasa respuesta) | ✅ Resuelto — `FunnelWidget` + `profile_views` en dashboard |
| 6 | URL pública con UUID (no slug) | ❌ Sigue abierto |
| 7 | Sin filtro de país en directorio de talento | ✅ Resuelto — filtro país en `buscar-candidatos` y `candidatos` |
| 8 | Sin exportación CSV de resultados | ✅ Resuelto — solo en tab "Evaluados" |
| 9 | Sin comparación side-by-side de candidatos | ✅ Resuelto — máx. 4, solo en `/empresa/candidatos` |
| 10 | Sin notificación a empresa al completar evaluación | ✅ Resuelto — `notifyEmpresaExamCompleted()` |

Esto es una ejecución sólida del foco propuesto el ciclo anterior. El foco de hoy pasa a hallazgos de segunda capa: gaps operativos no documentados, features nuevas ("pruebas propias") que repiten problemas ya resueltos en el otro sistema, y pulido de UX pendiente de baja prioridad.

---

## 🏢 Bloque 1 — Perfil de empresa

### Preguntas UX clave

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
Sí, mejor que en junio — la barra de completitud con anchors y los campos de employer branding ahora cubren lo esencial. El problema de `country='PY'` por defecto sigue sin corregirse.

**¿El perfil público de la empresa inspira confianza a un candidato QA?**
Considerablemente más que antes: ahora se ve stack tecnológico, modalidad, beneficios y LinkedIn. Sigue faltando pulido menor (slug de URL, eliminar logo, RUC localizado).

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| URL pública del perfil | Sigue siendo `/empresas/{uuid}`, no memorable ni compartible en LinkedIn/pitch | **A** | Generar slug desde `nombre_comercial` con fallback a UUID | Incompleto (sin cambios desde jun) |
| Completitud por defecto | `country` sigue precargado a `'PY'` en el estado local del componente → completitud no-cero sin acción del usuario | **M** | Inicializar el campo vacío hasta que el usuario lo confirme explícitamente | Incompleto (sin cambios desde jun) |
| Eliminar logo | Solo existe "Cambiar logo"/"Subir logo" — no hay botón de eliminar | **B** | Agregar acción "Eliminar logo" con confirmación | Incompleto (sin cambios desde jun) |
| RUC para otros países | La etiqueta del campo sigue diciendo "RUC" fijo aunque `country` soporte 11 países LATAM; solo el placeholder cambia para PY | **B** | Renombrar dinámicamente el label (RUC/NIT/CUIT/RFC) según país seleccionado | Incompleto |
| Contador de caracteres | `razon_social` (120) y `nombre_comercial` (80) siguen sin contador visual (sí lo tienen `description` y `benefits`) | **B** | Agregar contador `{n}/max}` consistente en todos los campos con límite | Incompleto |
| Preview inline del perfil público | Sigue solo el link externo "Ver perfil →", sin panel/modal de previsualización | **B** | Agregar preview colapsable sin salir de `/empresa/perfil` | Incompleto |
| Registro inicial (`RegisterForm`) | Alta de empresa solo pide `companyName` y `ruc`; industria/país/tamaño se completan después en otro flujo | **M** | Evaluar si conviene precargar 1-2 campos clave en el registro para subir completitud real desde el día 1 | Sin cambios — comportamiento por diseño, a validar con producto |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Preguntas UX clave

**¿Un recruiter sin contexto de QA puede entender qué significa cada filtro?**
Mejoró: el filtro ISTQB ahora muestra etiquetas legibles ("Foundation Level (CTFL)") en vez de los enums crudos. Sigue sin haber un tooltip que explique qué certifica cada nivel.

**¿El flujo para contactar o guardar un candidato es claro y directo?**
Sí, resuelto: el botón "Invitar" ahora está inline en la fila del candidato en ambos directorios (`buscar-candidatos` y `candidatos`), sin salir del flujo.

### Tabla de hallazgos

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Límite 500 resultados (hardcoded) | `candidatos/page.tsx:188` sigue con `.limit(500)` en la query de `exam_results`, sin paginación ni aviso | Con la plataforma creciendo, resultados pueden truncarse silenciosamente sin que el recruiter lo sepa | Implementar paginación real o mostrar aviso "mostrando los primeros 500 de N" | **A** |
| Notas de favoritos (`favorite_notes`) | El campo existe en `empresa_favoritos.notes`, se lee y se guarda en el estado (`favoriteNotes`), pero no se renderiza ni es editable en ningún lugar de la UI | Dato "fantasma": ocupa espacio en el modelo y en el estado del cliente sin dar valor al recruiter | Exponer un textarea de notas en la ficha del candidato favorito (shortlist), o remover el campo si no se va a usar | **M** |
| Comparación de candidatos | Limitado a 4 candidatos y solo disponible en `/empresa/candidatos`, no en `/empresa/buscar-candidatos` | Un recruiter que arma su shortlist directamente en "Talento QA" debe cambiar de pantalla para comparar | Extender el mismo componente de comparación a `buscar-candidatos` | **B** |
| Exportar CSV | Solo disponible en tab "Evaluados"; no en "Talento" ni "Favoritos" | Banco Continental / CLT necesitan exportar también su shortlist de talento pasivo, no solo evaluados | Extender el botón "Exportar CSV" a las otras dos tabs | **M** |
| Tooltips ISTQB | Etiquetas ahora son legibles, pero no hay tooltip/ícono de ayuda que explique qué certifica cada nivel | Un recruiter no-QA (típico en RRHH) no sabe si `CTAL-TM` es más senior que `CTFL` | Agregar ícono de info con descripción de 1 línea por nivel | **B** |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

### Preguntas UX clave

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?**
Sí, para el sistema de procesos de contratación (11 tipos con descripción de tema/formato/auto-corrección en el picker). Para "pruebas propias" (constructor nuevo), el contenido depende 100% de lo que la empresa escriba — no aplica el mismo estándar.

**¿El resultado le da información suficiente para tomar una decisión de contratación?**
Considerablemente mejor: ahora hay desglose por sección para `assessment_attempts` y, en "pruebas propias", ranking con medallas y tiempo por candidato. Sigue habiendo un caso legacy (`exam_results` sin `section_scores`/`learning_objectives`) donde no hay desglose.

### Tabla de hallazgos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Feature flag `EMAIL_SENDING_ENABLED` | Roto operativamente | Todo el envío de emails (invitaciones + notificación a empresa) está gateado por `EMAIL_SENDING_ENABLED === 'true'`, pero esta variable **no aparece en `.env.local.example`** ni en ninguna documentación del repo | Documentar la variable en `.env.local.example` y en el README de setup; sin esto, cualquiera que levante el entorno cree que el envío de emails "no funciona" | **CRÍTICO** 🚀 |
| Invitación por token → proceso | Parcial | `/invitaciones/[token]` existe y muestra la invitación, pero no auto-vincula el código de proceso a la cuenta del candidato — debe copiarlo manualmente | Auto-asociar el `process_code` a la cuenta del candidato al aceptar la invitación (o pre-rellenar el campo) | **A** |
| "Pruebas propias" — invitación a candidato | Incompleto | El constructor de pruebas propias (feature nueva, marcada "Beta") **no envía email en absoluto** — solo genera un link para copiar/compartir manualmente | Igualar al sistema de procesos: enviar email vía Resend con el link de la prueba | **A** 🚀 |
| Desglose de resultados — `exam_results` legacy | Parcial | El desglose por sección solo se muestra si `section_scores` o `learning_objectives` están poblados en el registro legacy; si no, se ve "Sin desglose disponible para este tipo de examen" | Migrar/backfill los `exam_results` antiguos o al menos aclarar en la UI que es una limitación de datos históricos, no un bug | **M** |
| Vencimiento de proceso (`expires_at`) | Parcial | Solo hay badge binario Vencido/Vigente; no hay aviso de "vence en N días" | Agregar badge "Vence pronto" cuando falten ≤7 días | **M** |
| Política de reintentos | Incompleto | No existe `max_attempts` configurable por proceso; el intento se muestra como "N/M" pero M no es un límite real | Agregar campo `max_attempts` en `hiring_processes` y bloquear nuevos intentos al alcanzarlo | **B** |
| Auto-corrección de respuestas cortas ("pruebas propias") | Completo, con matiz | El auto-scoring por keyword-matching marca visualmente "revisar" en respuestas cortas — buena práctica de UX | Sin acción — validar tasa de falsos positivos/negativos con uso real antes del piloto | Informativo |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Tabla de hallazgos

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Visitas al perfil (`profile_views`) | Sí | Bien implementado (RPC fire-and-forget) — ya no es un gap | — | Alto (ya entregado) |
| Funnel invitaciones (enviadas→vistas→completadas) | Sí | Bien implementado, se oculta si no hay datos (correcto) | — | Alto (ya entregado) |
| Tasa de aprobación | Sí | Sigue sin tooltip de referencia (ej. "el umbral ISTQB CTFL es 65%") | Agregar tooltip con benchmark | Alto |
| Candidatos evaluados | Sí | Sigue como número único, sin split aprobados/reprobados | Dividir en dos cifras con color semáforo | Alto |
| Comparación entre procesos (pass rate, avg score por proceso) | No | Un recruiter con 3-4 procesos activos no tiene una tabla-resumen comparativa en el dashboard | Agregar tabla compacta "Procesos" con pass rate y score promedio | Alto |
| Top skills QA evaluados este mes | No | Oportunidad de market intelligence para el pitch a CLT/Banco Continental | Widget "Skills más evaluados en AIQUAA este mes" | Medio |
| Gráficos 6 meses | Sí | Bien implementados (Recharts), se ocultan sin datos | — | Bueno |
| Empty state sin actividad | Sí | Sigue bien diseñado (2 CTAs claros) | — | Bueno |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de hoy

1. **🚨 `EMAIL_SENDING_ENABLED` no documentado** — Toda la mensajería saliente (invitaciones a candidatos, notificación a la empresa cuando un candidato termina una evaluación) depende de esta variable de entorno, que no existe en `.env.local.example` ni en ningún doc de setup. Cualquier ambiente nuevo (staging, demo para CLT) puede parecer tener "invitaciones rotas" cuando en realidad falta un flag. Tipo: **gap operativo / bug de configuración**. 🚀

2. **⚠️ "Pruebas propias" repite el gap ya resuelto en el otro sistema** — El nuevo constructor de pruebas propias (marcado Beta) no envía email al candidato, solo genera un link para copiar — el mismo problema que el flujo de invitaciones a procesos tenía en junio y que ya se corrigió ahí. Tipo: **gap de funcionalidad, feature nueva regresando un problema ya resuelto**. 🚀

3. **⚠️ URL pública sigue siendo UUID** — Persiste desde junio sin cambios; sigue siendo poco compartible para un pitch o publicación en LinkedIn. Tipo: **problema UX**.

4. **⚠️ Límite hardcoded de 500 resultados sin aviso** — Riesgo de que, a medida que la plataforma escale, un recruiter vea resultados incompletos sin saberlo. Tipo: **bug latente / gap de escalabilidad**.

5. **📎 Campo `favorite_notes` fantasma** — Dato modelado y transportado en el estado de la app pero invisible/no editable en la UI; indica una feature a medio terminar. Tipo: **gap de funcionalidad (feature incompleta)**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | `EMAIL_SENDING_ENABLED` sin documentar | Bug de configuración | Sí 🚀 |
| 2 | "Pruebas propias" sin envío de email | Gap funcionalidad | Parcial (feature es Beta, no core aún) 🚀 |
| 3 | URL pública con UUID | Problema UX | Parcial |
| 4 | Límite 500 resultados sin paginación/aviso | Gap de escalabilidad | No (aún no llegan a ese volumen) |
| 5 | `favorite_notes` no expuesto en UI | Gap funcionalidad | No |
| 6 | Invitación por token no auto-vincula proceso | Problema UX | Sí (fricción en onboarding de candidato invitado) 🚀 |
| 7 | Sin CSV en tabs Talento/Favoritos | Gap funcionalidad | Sí (Banco Continental reporta a RRHH) 🚀 |
| 8 | Sin comparación entre procesos en dashboard | Gap funcionalidad | No |
| 9 | Sin badge "vence pronto" en procesos | Problema UX | No |
| 10 | Sin `max_attempts` configurable | Gap funcionalidad | No |
| 11 | RUC no localizado por país | Problema UX | No |
| 12 | `country='PY'` infla completitud por defecto | Bug UX | No |

### Tickets propuestos (listos para crear en aiquaa.atlassian.net)

> No tengo acceso configurado al proyecto Jira desde este entorno — se documentan aquí en formato listo para copiar/pegar.

**[EMPRESAS-XX] Documentar `EMAIL_SENDING_ENABLED` y `RESEND_API_KEY` en `.env.local.example`**
- Descripción: El envío de invitaciones y notificaciones por email depende de `EMAIL_SENDING_ENABLED=true` y de `RESEND_API_KEY`, ninguna documentada en `apps/frontend/.env.local.example`.
- Pasos para reproducir: Levantar un ambiente nuevo desde `.env.local.example`, crear una invitación → no se envía email, sin ningún error visible para el desarrollador.
- Impacto: Alto — bloquea demo/piloto si el flag no se setea en el ambiente de CLT/Banco Continental.
- Prioridad: Crítica 🚀

**[EMPRESAS-XX] Agregar envío de email a invitaciones de "pruebas propias"**
- Descripción: `empresa-pruebas.ts` no llama a `sendEmail`/Resend; las invitaciones son solo link para copiar.
- Impacto: Medio-alto — inconsistente con el flujo de procesos de contratación, que sí notifica por email.
- Prioridad: Alta 🚀

**[EMPRESAS-XX] Generar slug para URL pública de empresa**
- Descripción: `/empresas/[id]` usa UUID crudo; falta slug legible desde `nombre_comercial`.
- Impacto: Medio — afecta compartibilidad en pitch/LinkedIn.
- Prioridad: Alta

**[EMPRESAS-XX] Paginar o advertir sobre el límite de 500 resultados en `candidatos/page.tsx`**
- Descripción: Línea 188, `.limit(500)` hardcoded sin fallback de paginación ni mensaje.
- Impacto: Medio (a futuro, escalabilidad).
- Prioridad: Media

**[EMPRESAS-XX] Auto-vincular código de proceso al aceptar invitación por token**
- Descripción: `/invitaciones/[token]` no asocia automáticamente el `process_code` a la cuenta del candidato.
- Impacto: Alto — fricción de onboarding para candidatos invitados externamente.
- Prioridad: Alta 🚀

**[EMPRESAS-XX] Extender exportación CSV a tabs "Talento" y "Favoritos"**
- Descripción: Solo existe en tab "Evaluados" (`exportCSV`, `candidatos/page.tsx`).
- Impacto: Alto para reporting de RRHH (Banco Continental).
- Prioridad: Alta 🚀

**[EMPRESAS-XX] Exponer o remover el campo `favorite_notes` en la UI de shortlist**
- Descripción: Campo modelado en `empresa_favoritos.notes`, presente en el estado del cliente, sin UI de lectura/edición.
- Impacto: Bajo-medio — feature fantasma, confunde en auditoría de código.
- Prioridad: Media

### Bloqueantes reales para cliente piloto (CLT / Banco Continental)

De los bloqueantes de junio, **solo queda uno parcialmente abierto**: la exportación CSV limitada a "Evaluados" (Banco Continental necesitará exportar también su shortlist de Talento). El resto de los bloqueantes de junio están resueltos. El nuevo bloqueante de esta ronda es el flag `EMAIL_SENDING_ENABLED` no documentado — no es un bug de producto sino de day-1 setup, pero **tiene el mismo efecto que un flujo roto** si nadie lo configura antes de la demo.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El funnel de invitaciones y las visitas al perfil, propuestos el ciclo pasado, **ya están en producción** — se puede mostrar a CLT una demo real de "X candidatos vieron tu empresa, Y respondieron tu invitación".
- El ranking con tiempo por candidato en "pruebas propias" es un diferenciador nuevo no contemplado en junio — vale la pena destacarlo en el pitch como capacidad de "crear tu propio assessment técnico".
- Persistente: exportación CSV, filtro por país, comparación de candidatos — ya entregados, mencionar en el pitch como cerrados.

### Foco del próximo ciclo (1 hora)

**Prioridad:** Cerrar la brecha operativa de email y llevar "pruebas propias" al mismo nivel que el flujo de procesos.

1. Documentar y validar `EMAIL_SENDING_ENABLED`/`RESEND_API_KEY` en `.env.local.example` + confirmar que está seteado en el ambiente de demo/piloto.
2. Agregar envío de email vía Resend a las invitaciones de "pruebas propias" (paridad con procesos de contratación).
3. Auto-vincular el código de proceso al aceptar una invitación por token, eliminando el paso manual de copiar/pegar.
4. Extender exportación CSV a los tabs "Talento" y "Favoritos".

Este ciclo cierra la última brecha operativa crítica y nivela la feature nueva ("pruebas propias") con el estándar ya alcanzado en el resto del módulo.

---

*Revisión generada automáticamente — 2026-07-13 · Rama: `claude/zen-noether-drmcir`*
