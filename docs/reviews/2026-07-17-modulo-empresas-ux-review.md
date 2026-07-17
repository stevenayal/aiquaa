# Revisión UX — Módulo de Empresas (Ciclo #2)

**Fecha:** 17 de julio de 2026
**Ciclo:** Mejora continua · 60 min
**Reviewer:** QA Lead (revisión automatizada de código, re-verificación de ciclo anterior)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)
**Ciclo anterior:** [`docs/reviews/2026-06-27-modulo-empresas-ux-review.md`](./2026-06-27-modulo-empresas-ux-review.md)

> **Metodología:** Revisión estática del código fuente (Next.js Server Actions, páginas, migraciones de Supabase) más lectura de `git log` para confirmar qué cambió desde el ciclo #1. Se documentan solo hallazgos confirmados en el código — no supuestos. No se ejecutó la app en navegador en este ciclo (sin acceso a un entorno corriendo con datos de prueba); todo lo reportado abajo es código leído directamente, con archivo y línea citados por los agentes de investigación.

---

## 🎯 Resumen: qué pasó desde el ciclo #1

El foco del ciclo anterior fue **"flujo de invitaciones end-to-end"**. La respuesta fue rápida: el mismo día del ciclo #1 (27 de junio) se mergeó el commit `0491b6e` ("employer branding, invitation email, public company directory, analytics"), que atacó 4 de los 5 hallazgos críticos de una sola vez. Los días siguientes sumaron `ead7858` (búsqueda B2B) y `b1630d9` (endurecimiento de notificaciones). Es una respuesta sólida — pero la re-verificación encontró que **una pieza clave del fix de invitaciones depende de una variable de entorno no documentada**, y aparecieron dos hallazgos nuevos que no existían en el ciclo #1 (uno de seguridad).

---

## 🏢 Bloque 1 — Perfil de empresa

### Tabla de hallazgos

| Elemento del perfil | Problema UX | Impacto | Estado (ciclo #1 → #2) |
|---|---|---|---|
| Stack tecnológico, modalidad, beneficios, LinkedIn | Resuelto: nueva sección "Employer branding QA" con `work_mode`, `qa_team_size`, `tech_stack`, `benefits`, `linkedin_url` | — | **Incompleto → Completo** ✅ |
| Directorio público `/empresas` | Resuelto: página de listado con industria/país/modalidad y empty state | — | **Roto/faltante → Completo** ✅ |
| URL pública con UUID | Sigue usando `id` crudo en la URL, sin slug | **A** | **Sin cambios** ❌ |
| Preview inline del perfil público | Sigue siendo solo un link "Ver perfil →" que abre pestaña nueva | **M** | **Sin cambios** ❌ |
| Completitud por defecto engañosa | El bug persiste pero cambió de forma: fórmula pasó de 7 a 8 campos, `country='PY'` + `razon_social` de registro dan **25%** (antes 14%) sin acción real del usuario | **M** | **Cambió, sigue engañoso** ⚠️ |
| Redes sociales | LinkedIn agregado; Instagram/Twitter siguen ausentes | **B** | **Parcial** ⚠️ |
| Eliminar logo | Sigue sin opción, solo "Cambiar logo" | **B** | **Sin cambios** ❌ |
| Contador de caracteres | `razon_social`/`nombre_comercial` siguen sin contador (sí lo tienen `description` y `benefits`) | **B** | **Sin cambios** ❌ |
| RUC para otros países | Campo sigue fijo como "RUC" sin adaptarse a NIT/CUIT/RFC; sin validación de formato fuera de PY | **B** | **Sin cambios** ❌ |
| Validación server-side | `updateEmpresaAction` no valida longitud, formato de URL/RUC ni whitelist de enums — la validación vive solo en el cliente y es evitable llamando el Server Action directamente | **A** (nuevo) | **Hallazgo nuevo** 🆕 |
| 🔒 RLS del bucket `empresa-logos` | Las policies de storage solo chequean `auth.uid() IS NOT NULL`, sin verificar que el path pertenezca a la empresa del usuario — **cualquier usuario autenticado (incluso cuenta candidato) podría sobrescribir el logo de otra empresa** | **A — seguridad** (nuevo) | **Hallazgo nuevo** 🆕🔒 |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

### Cambio estructural importante

Desde el ciclo #1 se agregó una **segunda página de búsqueda** (`/empresa/buscar-candidatos`, RPC `get_empresa_candidate_sourcing`), que convive con la original (`/empresa/candidatos`, tab "Talento"). Ambas cubren el mismo caso de uso con capacidades distintas — ver hallazgo nuevo abajo.

### Tabla de hallazgos

| Filtro/función | Estado (ciclo #1 → #2) | Detalle |
|---|---|---|
| Filtro por país | **Sin filtro → Fijo, con calidad dispareja** ⚠️ | Implementado en ambas páginas; `/empresa/candidatos` muestra bandera+nombre, `/empresa/buscar-candidatos` muestra el código ISO crudo (`PY`, `AR`) sin traducir |
| Tooltips ISTQB | **Sin explicación → Parcial** ⚠️ | Los códigos ahora se traducen a etiquetas legibles ("Foundation Level (CTFL)") en ambas páginas, pero sigue sin tooltip que explique qué implica cada nivel para la decisión de contratación |
| Búsqueda inconsistente entre tabs | **Inconsistente → Mayormente resuelto** ✅ | Un solo campo de búsqueda ahora filtra Evaluados y Talento/Shortlist; queda un detalle menor (placeholder estático no refleja el scope ampliado) |
| Límite 500 filas hardcoded | **Presente → Acotado, sigue presente** ⚠️ | Solo afecta el tab Talento de `/empresa/candidatos`; el tab Evaluados y la página nueva `/empresa/buscar-candidatos` no tienen el límite. Sigue sin aviso al usuario |
| Botón "Invitar" inline | **Ausente → Fijo** ✅ | Presente en ambas páginas con modal de invitación |
| Comparación side-by-side | **Ausente → Fijo solo en una página** ⚠️ | Implementado en `/empresa/candidatos` (hasta 4 candidatos); ausente en `/empresa/buscar-candidatos` |
| Exportar CSV | **Ausente → Fijo, con alcance limitado** ⚠️ | Solo en `/empresa/candidatos`, tab Evaluados; ausente en Talento/Shortlist y en `/empresa/buscar-candidatos` |
| Filtro "solo disponibles" | **Ausente → Fijo solo en una página** ⚠️ | Presente en `/empresa/buscar-candidatos` (select de disponibilidad); ausente en `/empresa/candidatos` (solo badge visual, no filtrable) |
| Empty state | **No verificado → Bueno en una, mejorable en otra** | `/empresa/candidatos` distingue "sin datos" vs. "sin resultados por filtro" con copy específico; `/empresa/buscar-candidatos` tiene mensaje genérico sin CTA |
| Desglose `section_scores` | **Descartado → Fijo** ✅ | Ahora se obtiene de `assessment_scores` y se muestra expandible por sección; no disponible en la página nueva (solo agregados `best_score`) |
| 🆕 Fragmentación de funcionalidad | — | Las dos páginas de búsqueda de candidatos ahora divergen en capacidades (CSV, comparación, filtro de disponibilidad, calidad de etiquetas de país) para lo que un recruiter percibe como la misma tarea. Un recruiter que entra por una u otra ve una herramienta distinta | **Hallazgo nuevo — M/A** 🆕 |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

Este bloque tenía los hallazgos más críticos del ciclo #1 (el foco explícito del ciclo). Resultado de la re-verificación:

### Tabla de hallazgos

| Paso del flujo | Estado (ciclo #1 → #2) | Detalle |
|---|---|---|
| Envío de email de invitación | **Roto → Arreglado en código, con riesgo de producción** ⚠️🚀 | `createInvitacionAction` ahora arma el email y llama a Resend de verdad. **Pero** está detrás de `EMAIL_SENDING_ENABLED === 'true'`, una env var que **no existe en `.env.local.example` ni en la documentación de despliegue** (Railway/Vercel). Si no está seteada explícitamente en producción, el envío se degrada en silencio a "no enviado" (queda registrado `email_error` en DB, y la UI de `/empresa/invitaciones` sí muestra un badge "No entregado" + botón "Reenviar" — buena mitigación, pero no reemplaza confirmar la config real) |
| Ruta pública por token | **Roto → Arreglado** ✅ | `/invitaciones/[token]` existe, valida, marca "vista", muestra info de la empresa y CTA de registro/login |
| Descripción de tipos de examen al crear proceso | **Ausente → Arreglado** ✅ | `EXAM_OPTIONS` ahora incluye descripción legible por tipo en la creación de proceso |
| Completado vinculado a invitación | **Desvinculado → Mayormente arreglado** ⚠️ | La mayoría de tipos de examen actualizan `empresa_invitaciones.status` al completarse. **Excepción: la ruta de submit de `api-banking`** nunca toca `empresa_invitaciones` — un candidato que llega por invitación y rinde ese examen específico deja su invitación colgada en "pendiente/vista" para siempre, lo que subestima el funnel de respuesta en el dashboard |
| Desglose `section_scores` | **Descartado → Arreglado** ✅ | Igual que en Bloque 2 |
| Notificación a empresa al completar evaluación | **Roto → Arreglado** ✅🚀 | `notifyEmpresaExamCompleted` envía email real vía Resend a los miembros owner/admin; no depende del flag `EMAIL_SENDING_ENABLED` (solo de `RESEND_API_KEY`, que sí está documentado) — más confiable que el flujo de invitación |
| Comparación de candidatos | **Ausente → Arreglado** ✅ | Ver Bloque 2 |
| Badge de "vence pronto" (<7 días) | **Ausente → Sigue ausente** ❌ | Sin cambios |
| `max_attempts` configurable | **Ausente → Sigue ausente en el flujo original** ⚠️ | Existe en un sistema paralelo nuevo ("pruebas propias" de empresa), pero no en `hiring_processes`/flujo de invitación por token, que es el que se revisó |
| Descripciones de examen en perfil público | **Ausente → Sigue ausente** ❌ | Peor aún: hay 3 mapeos distintos de tipo de examen → etiqueta en 3 archivos distintos, sin fuente única — riesgo de que un tipo de examen nuevo se vea con su slug crudo en una pantalla y bien descrito en otra |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

### Tabla de hallazgos

| Métrica/widget | Estado (ciclo #1 → #2) | Detalle |
|---|---|---|
| Visitas al perfil (page views) | **No existe → Implementado** ✅🚀 | Columna `profile_views`, incrementada vía RPC en cada carga del perfil público, mostrada en dashboard |
| Funnel invitación → vista → completada | **No existe → Implementado** ✅🚀 | Widget dedicado usando `viewed_at`/`completed_at` ya existentes en DB |
| Tasa de respuesta a invitaciones | **No existe → Implementado** ✅🚀 | Calculada dentro del widget de funnel |
| Aprobados vs. reprobados en headline | **No existe → Sigue sin mostrarse** ❌ | El dato (`passedCandidates`) ya se calcula en el server action pero no se renderiza en la página |
| Umbral de referencia ISTQB (65%) | **Ausente → Sigue ausente** ❌ | Sin tooltip ni texto de referencia |
| Benchmark de tiempo promedio | **Ausente → Sigue ausente** ❌ | Sin cambios |
| Comparación proceso a proceso | **Ausente → Sigue ausente** ❌ | Sin cambios |
| Top skills evaluados del mes | **Ausente → Sigue ausente** ❌ | Sin cambios |
| Gráficos 6 meses / badges / empty state | **Bueno → Sigue bueno** ✅ | Sin regresiones |
| 🆕 Widget de funnel sin CTA cuando no hay invitaciones | — | Si `invitacionesFunnel.total === 0` el widget entero se oculta, sin nudge hacia `/empresa/invitaciones` (contraste con el buen empty-state de "sin procesos") | 🆕 |
| 🆕 Card "Visitas al perfil" sin link | — | Es la única StatCard del grid sin `href` — no lleva a ningún lado al hacer click | 🆕 |
| 🆕 RLS pública de `empresas` sin restricción de columnas | — | La policy `empresas_public_select` usa `USING (true)` sobre toda la tabla; cualquier columna interna que se agregue en el futuro quedará expuesta a `anon` por defecto salvo exclusión explícita | 🆕⚠️ |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos de este ciclo

1. **🔒 Seguridad — RLS del bucket `empresa-logos` no valida propiedad del path.** Cualquier usuario autenticado (incluida una cuenta de candidato) podría subir/sobrescribir el logo de **otra** empresa llamando el endpoint de storage directamente, sin pasar por la UI. Tipo: **bug de seguridad**. Prioridad: **crítica**, independiente del bloque en que aparece.

2. **⚠️ El flujo de invitaciones (el foco explícito del ciclo pasado) está arreglado en código pero depende de una env var no documentada (`EMAIL_SENDING_ENABLED`).** Si esa variable no está en `true` en el entorno de producción de Vercel/Railway, el "fix crítico" del ciclo #1 sigue sin enviar un solo email real, en silencio. Tipo: **gap de configuración / riesgo operativo**. **Acción inmediata recomendada: confirmar en el dashboard de Vercel que `EMAIL_SENDING_ENABLED=true` y `RESEND_API_KEY` están seteados para producción.**

3. **⚠️ El examen `api-banking` no actualiza el estado de la invitación al completarse**, generando un funnel de respuesta subestimado específicamente para ese tipo de examen — justo el que un banco piloto (Banco Continental) más probablemente usaría. Tipo: **bug**.

4. **⚠️ Fragmentación entre dos páginas de búsqueda de candidatos** (`/empresa/candidatos` y `/empresa/buscar-candidatos`) que cubren el mismo caso de uso con features distintas (CSV, comparación, filtro de disponibilidad, calidad de etiquetas). Un recruiter obtiene una experiencia distinta según por dónde entra. Tipo: **gap de diseño / deuda de producto**.

5. **📈 Progreso real:** de los 10 hallazgos "bloqueantes para piloto" listados al cierre del ciclo #1, **7 están resueltos en código** (invitación por token, directorio público, campos de employer branding, section scores, notificación a empresa, filtro de país, exportación CSV, comparación de candidatos). Persisten sin resolver: URL con UUID, umbral ISTQB, y comparación proceso-a-proceso.

### Clasificación completa (hallazgos de este ciclo)

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | RLS de `empresa-logos` permite sobrescritura cross-tenant | Bug de seguridad | Sí 🔒 |
| 2 | `EMAIL_SENDING_ENABLED` no documentado / posible no-op en prod | Gap de configuración | Sí 🚀 |
| 3 | `api-banking` no vincula invitación a completado | Bug | Sí 🚀 (Banco Continental) |
| 4 | Fragmentación entre `/empresa/candidatos` y `/empresa/buscar-candidatos` | Gap de diseño | Parcial |
| 5 | `updateEmpresaAction` sin validación server-side | Bug (hardening) | No urgente |
| 6 | URL pública con UUID, no slug | UX problem | Parcial |
| 7 | Sin umbral de referencia ISTQB (65%) en tasa de aprobación | UX problem | No |
| 8 | Sin comparación proceso a proceso | Gap de funcionalidad | No |
| 9 | Sin badge de "vence pronto" en procesos | UX problem | No |
| 10 | 3 mapeos distintos de tipo de examen → etiqueta, sin fuente única | Deuda técnica | No |

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El **funnel de invitaciones + tasa de respuesta + visitas al perfil** ya están implementados y visibles en el dashboard — esto es demostrable a CLT y Banco Continental **hoy**, condicionado a resolver el punto 2 (env var de email).
- La exportación CSV y el filtro de país ya funcionan — ambos eran diferenciadores clave para el pitch LATAM.
- **Riesgo para el pitch:** si se demuestra el flujo de invitaciones a un cliente piloto sin haber confirmado `EMAIL_SENDING_ENABLED=true` en producción, el candidato invitado nunca recibirá el email — sería un fallo en vivo delante del cliente.

### Foco del próximo ciclo (1 hora)

**Prioridad 1 (bloqueante, 15 min):** Confirmar y documentar `EMAIL_SENDING_ENABLED` y `RESEND_API_KEY` en el entorno de producción; agregarlas a `.env.local.example`/guía de despliegue para que no se repita este gap en futuros entornos.

**Prioridad 2 (seguridad, 15 min):** Corregir la policy de storage de `empresa-logos` para que el `WITH CHECK`/`USING` valide que el path del objeto corresponde a una empresa del usuario autenticado (vía `empresa_miembros`).

**Prioridad 3 (30 min):** Decidir consolidación de `/empresa/candidatos` (Talento) vs. `/empresa/buscar-candidatos` — o unificar en una sola página, o documentar explícitamente para qué sirve cada una y llevar ambas al mismo nivel de features (CSV, comparación, filtro de disponibilidad, etiquetas de país).

---

### Nota sobre tickets en Jira

Este ciclo se ejecutó sin acceso a un conector de Jira (`aiquaa.atlassian.net`), por lo que los tickets no pudieron crearse directamente. La tabla de "Clasificación completa" arriba está lista para copiar/pegar como base de tickets (título = columna Hallazgo, tipo = columna Tipo, prioridad = columna Bloqueante).

---

*Revisión generada automáticamente — 2026-07-17 · Rama: `claude/zen-noether-gdtyyr` · Ciclo #2*
