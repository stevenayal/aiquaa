# Revisión UX — Módulo de Empresas
**Fecha:** 6 de agosto de 2026
**Ciclo:** Mejora continua · 60 min (ciclo 2)
**Reviewer:** QA Lead (revisión automatizada de código + datos de producción)
**Persona objetivo:** Recruiter / Responsable de RRHH buscando candidatos QA en LATAM
**Clientes piloto:** CLT · Banco Continental SAECA (Paraguay)

> **Metodología:** lectura completa del código fuente (páginas Next.js, server actions, migraciones SQL) + verificación cruzada contra datos reales del proyecto Supabase de producción (`cbkctkpyxwbufvbwxogp`). Solo se documentan hallazgos confirmados en código o datos — no supuestos. Este es el **segundo ciclo registrado**; el primero fue `docs/reviews/2026-06-27-modulo-empresas-ux-review.md`.

---

## 📈 Progreso desde el ciclo anterior (27-jun-2026)

| Hallazgo del ciclo 1 | Estado hoy | Evidencia |
|---|---|---|
| 🚨 Invitaciones sin email / token sin ruta pública | ✅ **Resuelto** (sistema principal `empresa_invitaciones`) | `actions/empresa-invitaciones.ts:101-105` envía por Resend; rutas públicas `/invitacion/[token]` e `/invitaciones/[token]` existen |
| 🚨 Directorio público `/empresas` inexistente | ✅ **Resuelto** | `app/empresas/page.tsx` existe, ISR `revalidate=300` |
| ⚠️ Faltan campos de perfil (stack, modalidad, beneficios) | ✅ **Resuelto** | `tech_stack`, `benefits`, `qa_team_size`, `work_mode` capturados, persistidos y renderizados de punta a punta |
| Sin filtro de país en directorio de talento | ✅ **Resuelto** | Filtro país implementado en `buscar-candidatos/page.tsx` |
| Sin notificación a empresa al completar evaluación | ⚠️ **Resuelto solo en el sistema legacy** (`exam_results`) | Sigue roto en el sistema nuevo `empresa_pruebas` (ver Bloque 3) |
| Métricas B2B faltantes (funnel, page views) | ⚠️ **Parcial** | `profile_views` y funnel de invitaciones ya están en el dashboard; sigue faltando "top skills del mes" y vistas por proceso específico |
| `section_scores` descartado en UI | No re-verificado este ciclo (fuera de los 4 bloques revisados) | — |
| Sin exportación CSV | No re-verificado este ciclo | — |

**⚠️ Hallazgo nuevo y el más importante de este ciclo:** mientras se resolvían los bugs críticos del flujo original, se construyó un **segundo sistema paralelo de evaluaciones** (`empresa_pruebas` — builder de exámenes a medida, marcado "Beta" en el propio código) que **reintroduce exactamente los mismos gaps que ya se habían arreglado** en el sistema original: sin email de invitación, sin notificación de resultado a la empresa, sin revisión manual de puntaje. Las 5 tablas de este subsistema (`empresa_pruebas`, `empresa_preguntas`, `empresa_prueba_invitaciones`, `empresa_intentos`, y el `empresa_invitaciones` legacy) tienen **0 filas en producción** — nunca se usó de punta a punta.

---

## 🏢 Bloque 1 — Perfil de empresa

**¿Un recruiter que llega por primera vez entiende en menos de 30 segundos cómo completar su perfil?**
No de forma confiable. El banner de "completar perfil" solo se muestra si la empresa aún no creó ningún proceso; en cuanto crea el primero (la acción más obvia), el CTA desaparece para siempre y "Perfil de empresa" queda como una tarjeta más entre 7, sin indicador de % de completitud visible desde el dashboard.

**¿El perfil público inspira confianza?** El diseño es profesional cuando el perfil está completo, pero como casi todos los campos son opcionales (solo `razon_social` es obligatorio), una empresa piloto recién registrada — probablemente el estado real de las 3 empresas hoy en producción — se ve con ícono genérico, sin descripción, stack ni beneficios.

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Onboarding / CTA a completar perfil | El banner solo aparece si `totalProcesses === 0`; desaparece apenas se crea el primer proceso | Alto | Mostrar el % de completitud de forma persistente en el dashboard, no condicionado a `totalProcesses` | Incompleto |
| Validación server-side de registro y edición | `updateEmpresaAction` (`actions/empresa-admin.ts:296-330`) acepta el payload sin revalidar formato/longitud; todo el control vive en el cliente | Medio | Duplicar validaciones críticas en el server action | Incompleto |
| Campo LinkedIn | Sin ninguna validación de formato (a diferencia de `website_url`, que sí valida `^https?://`) y se renderiza directo en un `<a href>` público | Medio | Aplicar el mismo regex que `website_url` antes de guardar | Roto (validación ausente) |
| Subida de logo — permisos de storage | Las policies del bucket `empresa-logos` solo exigen `auth.uid() IS NOT NULL`, sin restringir la ruta a la carpeta de la propia empresa a nivel de servidor | **Alto (seguridad)** | Restringir INSERT/UPDATE/DELETE con `(storage.foldername(name))[1] = auth_user_empresa_id()` | Roto (control de acceso insuficiente) |
| Directorio público `/empresas` | Sin `revalidatePath` al guardar cambios de perfil; el listado tiene ISR de 5 min, puede mostrar datos desactualizados | Bajo | Llamar `revalidatePath('/empresas')` en `updateEmpresaAction` | Incompleto |
| Perfil "vacío" real | Todo excepto razón social es opcional; el directorio público puede listar perfiles casi en blanco | Alto | Exigir/incentivar mínimo 3-4 campos antes de listar públicamente | Incompleto (sparse) |
| Ruta `/employer/nuevo` y `/employer/[code]` | Formulario duplicado y más simple que `/empresa/procesos/nuevo`, escribe sobre la misma tabla; **sin ningún link entrante** desde el resto del sitio | Medio | Eliminar la ruta huérfana o redirigir al flujo activo | Código huérfano |

---

## 🔍 Bloque 2 — Búsqueda y filtro de candidatos QA

**Hallazgo de datos crítico:** de **104 perfiles de candidatos, solo 1 activó `talent_visible_to_empresas`**. El pool de "Talento QA" que alimenta esta pantalla está, en la práctica, vacío. Además, la función RPC que sostiene esta pantalla (`get_empresa_candidate_sourcing`) estuvo rota en producción hasta una corrección reciente documentada en la propia migración SQL.

**¿Un recruiter sin contexto de QA entiende cada filtro?** Parcialmente — país, disponibilidad y skills son claros, pero el filtro de nivel ISTQB usa siglas de certificación (`CTFL`, `CTAL-TA`, `CTAL-TM`) sin tooltip ni glosario.

**¿El flujo para contactar/guardar un candidato es claro?** Sí, y está bien implementado técnicamente (invitar → email vía Resend; guardar → `empresa_favoritos`). El problema no es el botón, es que casi nunca hay a quién guardar.

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Pool de talento visible | Requiere opt-in explícito del candidato (`talent_visible_to_empresas`) | Solo 1 de 104 candidatos activó la visibilidad — la pantalla casi siempre está vacía | Opt-in por defecto para egresados certificados, o campaña de activación; mostrar contador en el perfil del candidato | **Alta** 🚀 |
| Filtros básicos (país, disponibilidad, skills, ISTQB) | Implementados y testeados (`candidateDirectory.ts`) | Faltan años de experiencia, nivel de inglés, modalidad, pretensión salarial — lo primero que pide un recruiter real | Agregar estos filtros | Media |
| Orden/ranking de resultados | Ordena por disponibilidad + mejor score de un único examen | No usa XP/badges de `ranking_achievements` (69 filas ya en prod) como señal de desempeño global | Incorporar como señal secundaria visible | Media |
| Terminología ISTQB | Siglas técnicas sin explicación (`CTFL`, `CTAL-TA`, `CTAL-TM`, `CTAL-TTA`) | Un HR de Banco Continental no sabe priorizar entre certificaciones | Tooltip de 1 línea por nivel | Media |
| Acción "Invitar" | `createInvitacionAction` → resuelve email server-side → `empresa_invitaciones` → Resend | Funciona correctamente de punta a punta | — (sin cambios) | Baja |
| Guardar/Shortlist (favoritos) | Escritura directa a `empresa_favoritos`, botón funcional | 0 filas en producción — no es bug de código, es consecuencia directa del pool vacío | Medir con analítica antes de invertir más en esta feature específica | Media |
| Tabla "Prospectos" | CRUD completo con carga de CV, pero vive aislada en `/empresa/prospectos` | No conectada a `/empresa/buscar-candidatos`; son dos flujos sin puente | Enlazar "agregar prospecto manual" desde la búsqueda | Baja |
| Inconsistencia de privacidad de email | Oculto en el pool opt-in (`talento`), pero visible en texto plano con `mailto:` en la pestaña "Evaluados" | Puede ser intencional (postulantes directos) pero no está explicado en la UI | Aclarar en la UI la diferencia entre ambos casos | Baja |

---

## 📋 Bloque 3 — Evaluaciones técnicas para candidatos

**Confirmado: existen dos sistemas de evaluación en paralelo**, sin conexión entre sí:
1. **Sistema legacy** (`empresa_invitaciones` + `hiring_processes` + exámenes fijos ISTQB/Git/etc.) — más maduro, con email de invitación y notificación de resultado funcionando.
2. **Sistema nuevo** (`empresa_pruebas` — builder de pruebas a medida por empresa, marcado "Beta") — permite crear preguntas propias, pero **no envía email de invitación, no notifica resultado, no tiene revisión manual de puntaje**, y 0 filas en producción en sus 5 tablas.

**¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?** No. En el sistema nuevo, categoría y nivel son texto libre sin taxonomía ni plantilla, y solo hay 3 tipos de pregunta genéricos (opción múltiple, V/F, texto corto) — nada que mida una habilidad práctica de QA real.

**¿El resultado da información suficiente para decidir una contratación?** Parcial. El ranking por score y desglose por pregunta existen, pero las respuestas de texto corto se autocalifican por coincidencia de palabras clave **sin ninguna pantalla de revisión manual**, a diferencia del sistema legacy que sí la tiene para su propio tipo de examen.

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Crear prueba a medida (título/categoría/nivel) | Incompleto | Texto libre sin taxonomía fija (ISTQB/práctica/caso de estudio) | Definir tipos de prueba fijos en vez de texto libre | Media |
| Generar invitación a prueba a medida | Incompleto | El formulario nunca setea `expires_at` ni `max_attempts`, aunque la acción los soporta — en la práctica los intentos nunca expiran | Exponer estos campos en el formulario | Alta |
| **Notificación al candidato (prueba a medida)** | **Roto** | La acción solo inserta en la tabla; no llama a Resend en ningún punto. Único mecanismo: botón "copiar link" manual | Reusar el mismo envío por Resend que ya existe en el sistema legacy | **Alta** 🚀 |
| Candidato rinde la prueba / timeout | Completo | Countdown en cliente + validación de expiración en servidor con margen de 2 min | — (funciona bien) | — |
| Autocalificación de texto libre | Incompleto | Califica por coincidencia de keywords; la UI la marca "automático — revisar" pero no existe pantalla de revisión manual equivalente a la del sistema legacy | Construir vista de ajuste de puntaje para este flujo | Alta |
| **Notificación a la empresa (prueba a medida)** | **Inexistente** | El envío del intento actualiza la tabla pero no dispara ningún email/alerta al reclutador; el sistema de notificación existente (`empresa-result-notifications.ts`) solo está conectado al flujo legacy, no a este | Conectar la notificación existente a este flujo | **Alta** 🚀 |
| Rutas de invitación candidato-facing | Duplicado/confuso | `/invitacion/[token]` e `/invitaciones/[token]` son dos páginas casi idénticas para el mismo propósito (una consulta directa, otra vía RPC); ninguna corresponde a `/prueba/[token]` del sistema nuevo | Eliminar la ruta legacy no usada y documentar cuál es la activa | Media |
| Ver resultados / comparar candidatos | Completo (sistema nuevo) | Vista de ranking por % con desglose por pregunta funciona bien; sin filtro por competencia | Agregar comparación por skill si se agregan categorías de pregunta | Baja |
| **Adopción en producción** | **Confirmado sin uso real** | 0 filas en las 5 tablas del sistema de pruebas a medida — consistente con que el flujo requiere copiar/pegar el link a mano, sin email | Decidir si se consolida en un solo sistema antes de seguir invirtiendo en el builder nuevo | **Alta** 🚀 |

---

## 📊 Bloque 4 — Dashboard de empresa con métricas

**Hallazgo estructural:** el dashboard lee exclusivamente del esquema "clásico" (`empresas`, `hiring_processes`, `empresa_invitaciones`, `exam_results`). Existe además un esquema `talent_*` (con `talent_selection_processes`: 4 filas, `talent_process_stages`: 7 filas) que **ningún archivo del frontend referencia** — son datos huérfanos que no aparecerían en ningún lugar del panel si algo escribiera ahí. Riesgo real de inconsistencia si ambos esquemas siguen evolucionando por separado.

**¿El primer vistazo dice a la empresa qué está pasando con su proceso de selección?** Razonablemente sí para el caso "tengo actividad" — 8 stat cards + badges de urgencia cubren procesos, candidatos evaluados y tasa de aprobación. Se pierde en el caso más común para un cliente piloto nuevo: **creó un proceso, compartió el código, y nadie rindió todavía** — el dashboard no distingue "nadie lo vio" de "lo vieron y abandonaron".

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Procesos activos/cerrados, candidatos evaluados, tasa de aprobación | Sí | Ninguno relevante | — | Visión rápida del pipeline |
| Tiempo promedio de completado | Sí | Es un promedio global de todos los procesos, no por proceso individual | Desglosar por proceso | Detecta exámenes mal calibrados |
| Visitas al perfil (`profile_views`) | Parcial | Mide tráfico a la página pública de la empresa completa, no aperturas de un proceso/vacante específico | Trackear vistas por proceso | Distingue problema de visibilidad vs. conversión |
| Funnel de invitaciones enviadas → vistas → completadas | Parcial | Solo cubre el flujo de invitaciones directas (secundario); el flujo principal de "compartir código de proceso" no tiene funnel | Extender el funnel al flujo principal | Mide efectividad real de la convocatoria |
| Candidatos que vieron un proceso específico | **No** | Ausente | Agregar vista de aperturas por proceso | Diferencia "nadie lo vio" de "lo vieron y no rindieron" |
| Top skills QA del mes | **No** | Ausente por completo a nivel dashboard | Agregar agregación mensual de skills evaluados | Orienta a RRHH sobre gaps de talento del mercado |
| Empty state (0 procesos) | Sí, pero limitado | Solo se dispara con 0 procesos; una empresa con procesos pero 0 candidatos no recibe ningún nudge | CTA condicional cuando hay proceso activo pero 0 rendiciones | Evita que la empresa quede "colgada" sin feedback |
| Acceso rápido a revisiones manuales pendientes | No | Existe la pantalla de revisión manual pero sin contador/shortcut en el dashboard | Agregar StatCard "Revisiones pendientes" | Evita que respuestas autocalificadas queden sin auditar |
| Frescura de datos | Sí | Sin directivas de cache — todo se consulta en vivo en cada carga | — | Los números reflejan el estado actual sin retraso |

---

## ✅ Bloque 5 — Cierre y registro del ciclo

### Top 5 hallazgos críticos

1. **🚨 Duplicación de sistemas de evaluación** — se construyó un segundo sistema de pruebas a medida (`empresa_pruebas`) que reintroduce los mismos bugs críticos (sin email, sin notificación) que ya se habían resuelto en el sistema original, y nunca se usó en producción (0 filas en 5 tablas). Tipo: **bug de arquitectura / gap de funcionalidad**.
2. **🚨 Pool de búsqueda de candidatos prácticamente vacío** — solo 1 de 104 candidatos activó la visibilidad para empresas; toda la pantalla de "Talento QA" opera sobre un dato inexistente en la práctica. Tipo: **gap de producto/adopción**, no bug de código.
3. **⚠️ Control de acceso insuficiente en storage de logos** — las policies del bucket `empresa-logos` no restringen la escritura a la carpeta de la propia empresa a nivel de servidor. Tipo: **bug de seguridad**.
4. **⚠️ Esquema `talent_*` huérfano** — 11 filas de datos en tablas que ningún código de frontend lee; riesgo de inconsistencia si se sigue escribiendo ahí sin conectar al dashboard. Tipo: **gap de arquitectura**.
5. **⚠️ Onboarding de perfil se pierde tras el primer proceso creado** — el CTA de completar perfil desaparece apenas la empresa crea su primer proceso, dejando perfiles "vacíos" listados públicamente. Tipo: **problema UX**.

### Clasificación completa

| # | Hallazgo | Tipo | Bloqueante para piloto |
|---|---|---|---|
| 1 | Sistema de pruebas a medida sin email/notificación, duplicado del legacy | Bug / gap funcionalidad | Sí 🚀 |
| 2 | Pool de talento visible (1/104 candidatos) | Gap de adopción | Sí 🚀 |
| 3 | RLS insuficiente en `empresa-logos` | Bug de seguridad | Sí |
| 4 | Esquema `talent_*` huérfano/no conectado | Gap de arquitectura | No (riesgo futuro) |
| 5 | Onboarding de perfil se pierde tras primer proceso | Problema UX | Sí 🚀 |
| 6 | Validaciones solo client-side (registro, edición, LinkedIn) | Bug | Parcial |
| 7 | Ruta `/employer/*` huérfana y duplicada | Deuda técnica | No |
| 8 | Terminología ISTQB sin glosario en filtros | Problema UX | Sí (CLT/Banco Continental) 🚀 |
| 9 | Sin métrica "top skills del mes" ni vistas por proceso | Gap de funcionalidad | Sí 🚀 |
| 10 | Falta revisión manual de puntaje en pruebas a medida | Gap de funcionalidad | Sí 🚀 |

### Bloqueantes reales para cliente piloto (CLT / Banco Continental)

1. Si el pitch usa el builder de pruebas a medida (`empresa_pruebas`), el flujo está roto de punta a punta — no notifica a nadie. **Usar el sistema legacy de invitaciones, que sí funciona, hasta que se corrija.**
2. El directorio de "Talento QA" no tiene candidatos reales visibles — para una demo con cliente piloto, esto se ve vacío salvo que se incentive el opt-in de candidatos antes.
3. Un perfil de empresa a medio completar (el estado más probable de una empresa piloto nueva) se ve pobre en el directorio público — impacta el employer branding que se quiere vender.

### Hallazgos que fortalecen el caso B2B para Moonshot 🚀

- El sistema legacy de invitaciones (email + funnel + notificación) **ya funciona de punta a punta** — es el flujo a mostrar en cualquier demo, no el builder nuevo.
- Filtro por país y campos de employer branding (stack, beneficios, modalidad) ya están resueltos desde el ciclo anterior — diferenciador LATAM listo para pitch.
- El gap de "pool de talento vacío" es resoluble sin desarrollo: es un problema de incentivar el opt-in de candidatos, no de código roto — bajo costo, alto impacto para una demo.

### Foco del próximo ciclo (1 hora)

**Prioridad: consolidar los dos sistemas de evaluación en uno solo.**
1. Decidir si el builder de pruebas a medida (`empresa_pruebas`) se completa (conectar email + notificación + revisión manual, reusando el código ya probado del sistema legacy) o se retira hasta tener recursos para terminarlo — no debe quedar expuesto en producción a medio construir.
2. Corregir las policies de storage de `empresa-logos` para restringir escritura por empresa.
3. Diseñar un incentivo simple (ej. banner o gamificación) para que más candidatos activen `talent_visible_to_empresas` antes de la próxima demo a un cliente piloto.

---

*Revisión generada automáticamente — 2026-08-06 · Rama: `claude/zen-noether-l65kno`*
