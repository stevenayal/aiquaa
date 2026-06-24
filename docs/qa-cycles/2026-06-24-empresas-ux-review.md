# Ciclo de Mejora Continua — Módulo Empresas
**Fecha:** 2026-06-24  
**QA Lead:** Claude (automated review cycle)  
**Persona objetivo:** Recruiter / Responsable de RRHH  
**Clientes piloto de referencia:** CLT · Banco Continental SAECA (Paraguay)  
**Stack revisado:** Next.js 13+ App Router + Supabase + NestJS (Railway) + Resend  
**Método:** Revisión exhaustiva de código fuente (sin entorno de ejecución activo)

---

## 🏢 Bloque 1: Perfil de empresa

| Elemento del perfil | Problema UX | Impacto | Propuesta de mejora | Estado |
|---|---|---|---|---|
| **Completion score** | Incluye 7 campos pero excluye `ruc` y `nombre_comercial`. Empresa con RUC vacío puede llegar al 100%. | Alto | Agregar RUC al score; ponderar campos por relevancia (logo + descripción = mayor peso). | Incompleto |
| **Guardado de datos** | Un solo botón "Guardar cambios" para todos los campos. Sin warning de cambios no guardados al navegar. | Alto | Agregar `beforeunload` guard. Considerar auto-save por sección o debounce a 3s. | Incompleto |
| **Logo vs. otros campos** | El logo se guarda inmediatamente al subir (Supabase Storage + DB). Los demás campos requieren click en "Guardar". Comportamiento inconsistente. | Medio | Unificar: mostrar preview del logo nuevo, guardarlo junto al resto con el botón "Guardar cambios". O mostrar toast diferenciado que aclare que el logo ya fue guardado. | Incompleto |
| **Preview del perfil público** | El link "Ver perfil →" abre `/empresas/[id]` con el estado guardado en DB. Si hay cambios no guardados, el preview muestra datos viejos. | Medio | Deshabilitar el link "Ver perfil" cuando hay cambios pendientes, o mostrar advertencia. | Incompleto |
| **Campos ausentes — Stack tecnológico** | No existe campo para indicar tecnologías QA usadas (Selenium, Cypress, Jira, TestRail, etc.). Crítico para atraer talento técnico. | Alto 🚀 | Agregar campo multi-select "Stack de herramientas QA" con opciones predefinidas + campo libre. Mostrarlo en el perfil público. | Ausente |
| **Campos ausentes — Modalidad de trabajo** | No hay campo remoto/híbrido/presencial. Candidatos LATAM lo necesitan para filtrar. | Alto 🚀 | Radio/select: Presencial · Híbrido · Remoto · No especificado. Mostrar como badge en perfil público. | Ausente |
| **Campos ausentes — Ciudad** | Solo hay campo `country`. Banco Continental está en Asunción, no en "Paraguay" genérico. | Medio | Agregar campo `city` (texto libre o select condicional por país). | Ausente |
| **Campos ausentes — Beneficios y cultura** | No existe sección de beneficios (seguro, horario flexible, etc.) ni valores de empresa. | Medio | Agregar textarea "Cultura y beneficios" (máx. 600 chars) con tooltip de ejemplo. | Ausente |
| **Campos ausentes — LinkedIn / Redes** | No hay campo para LinkedIn de la empresa. Candidatos lo usan para validar identidad. | Bajo | Agregar campo `linkedin_url` con validación de formato. | Ausente |
| **Validación RUC** | Regex `/^\d{6,8}-\d$/` no cubre todos los formatos válidos de RUC paraguayo. Empresas más chicas pueden tener RUCs de 5 dígitos. | Bajo | Revisar spec de SET Paraguay y actualizar regex. Agregar link a validador oficial. | Incompleto |
| **Empty state (empresa recién registrada)** | El score muestra 0–14% inmediatamente con lista de campos faltantes. Correcto, pero el tono es neutro, no motivante. | Bajo | Agregar mensaje de bienvenida contextualizado antes del score: "Tu perfil está incompleto. Completarlo aumenta las chances de que candidatos QA apliquen." | Incompleto |
| **Vista pública** | El perfil público (`/empresas/[id]`) no muestra stack, modalidad, ni ciudad porque esos campos no existen. Inspira poca confianza a candidatos. | Alto 🚀 | Completar primero los campos faltantes; luego mostrarlos en la vista pública con iconos y badges. | Incompleto |

**Respuestas a preguntas UX clave:**
- *¿Un recruiter entiende en 30s cómo completar su perfil?* **Sí** — el score con links ancla es claro y funcional.
- *¿El perfil público inspira confianza a un candidato QA?* **No** — sin stack, modalidad ni ciudad, el perfil es genérico. Para un candidato de CLT o Banco Continental el diferenciador no está presente.

---

## 🔍 Bloque 2: Búsqueda y filtro de candidatos QA

| Filtro / función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| **Búsqueda de pool de candidatos** | No existe. Solo se ve a candidatos que ya rindieron en los procesos propios. | **GAP CRÍTICO**: No hay discovery. El recruiter no puede buscar perfiles QA disponibles en la plataforma. | Crear página `/empresa/buscar-candidatos` con búsqueda en pool de usuarios con `audience='candidato'` (respetando privacidad: solo mostrar display_name, skills, puntajes públicos, disponibilidad). | Crítica 🚀 |
| **Shortlist / Favoritos** | Tabla `empresa_favoritos` existe en DB pero **no hay UI**. | El recruiter no puede guardar candidatos para revisión posterior. | Implementar UI de favoritos: botón ⭐ en tabla de candidatos, página `/empresa/favoritos` con lista guardada + notas. | Alta |
| **Link a perfil del candidato** | No existe. Desde `/empresa/candidatos` no se puede navegar al perfil público del candidato. | El recruiter ve un nombre/email pero no puede ver el perfil completo del candidato. | Agregar link al perfil de usuario desde la tabla de resultados (columna nombre → `/perfil/[id]`). Requiere que el candidato haya dado consentimiento. | Alta |
| **Acción desde tabla de resultados** | Sin acciones. Se puede ver el score pero no "invitar", "guardar" ni "contactar" al candidato desde ahí. | Flujo cortado: el recruiter ve un buen candidato y no tiene acción directa. | Agregar acciones inline: ⭐ Guardar en favoritos · 📧 Invitar a proceso · Ver perfil. | Alta |
| **Filtro por proceso** | Dropdown funcional, pero los procesos se listan como `{position_name} ({code})`. Códigos son crípticos (ej: `qa-analyst-XK2M`). | Dificulta identificar el proceso correcto con muchos procesos. | Cambiar a mostrar solo `position_name` + fecha de creación. Ocultar código en el dropdown. | Baja |
| **Filtro por nivel ISTQB** | No existe. No se puede filtrar por "candidatos que aprobaron ISTQB CTFL". | El ISTQB es el diferenciador principal de AIQUAA. Debe ser el primer filtro. | Agregar filtro "Solo aprobados ISTQB CTFL" como checkbox prominente. | Media 🚀 |
| **Filtro por experiencia / skills** | No existe. | Recruiter no puede filtrar por nivel de experiencia. | Requiere primero que los candidatos completen perfil con skills/experiencia. Luego agregar filtros. | Media |
| **Filtro por disponibilidad** | No existe. | Recruiter no sabe si el candidato está activo o pasivo. | Agregar campo `disponibilidad` al perfil del candidato, filtrable. | Media |
| **Empty state de candidatos** | Muestra 👥 + texto + link a procesos. Claro y funcional. | Ninguno crítico. | OK. | OK |
| **Paginación** | No existe. Tabla muestra todos los resultados. | Con volumen alto (>100 resultados) la página se vuelve lenta y difícil de usar. | Agregar paginación de 25 resultados por página o virtualización. | Media |
| **`assessment_attempts` no incluidos** | La página `/empresa/candidatos` solo consulta `exam_results`, ignorando `assessment_attempts` (base de datos fundamentos y práctica SQL). | Resultados de exámenes database-fundamentals y database-practice no aparecen para la empresa. | Agregar join/union con `assessment_attempts` igual que hace `getEventStatsAction`. | Alta (Bug) |
| **Privacidad — emails visibles** | El email del candidato es visible en la tabla sin aviso. | Posible friction legal/RGPD para empresas más formales. | Agregar aviso "Esta información es visible solo para tu empresa y protegida por nuestros ToS". | Baja |

**Respuestas a preguntas UX clave:**
- *¿Un recruiter sin contexto QA entiende cada filtro?* **Parcialmente** — los filtros actuales son comprensibles, pero hay demasiados pocos. Faltan los filtros más importantes (ISTQB, disponibilidad).
- *¿El flujo para contactar o guardar un candidato es claro?* **No** — no existe. Es el gap más crítico del módulo.

---

## 📋 Bloque 3: Evaluaciones técnicas para candidatos

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| **Empresa crea proceso** | Completo | Flujo de creación claro (7 opciones de examen con descripción). Success screen con código copiable. | Agregar campo "senority esperado" (Jr/Ssr/Sr) como metadata del proceso. | Baja |
| **Empresa elige tipo de evaluación** | Completo | Las 7 opciones tienen descripción breve. Pero un líder técnico no-QA puede no entender diferencia entre "ISTQB CTFL" y "API Banking Challenge". | Agregar tooltip extendido o link "¿Qué evalúa este examen?" por cada opción. | Media 🚀 |
| **Empresa asigna evaluación a candidato** | Parcial | La "asignación" es por invitación (email) o compartiendo el código. No hay asignación directa empresa→candidato desde los resultados. | Agregar acción "Invitar a este proceso" desde la tabla de candidatos para candidatos que ya están en la plataforma. | Alta |
| **Candidato recibe notificación por email (Resend)** | Parcial 🐛 | `sendInvitacionEmail` usa `try/catch` silencioso. Si Resend falla, la empresa **no se entera** que el email no fue entregado. El estado de invitación queda en "pendiente" aunque el email nunca llegó. | Almacenar resultado del envío (`email_sent: boolean`, `email_error: string`). Mostrar badge "⚠️ Email no entregado" en la tabla de invitaciones. | Alta (Bug) |
| **Candidato necesita cuenta para rendir** | Incompleto | La landing page `/invitacion/[token]` requiere cuenta AIQUAA. Candidatos externos sin cuenta tienen friction alta. Link de registro va a `/register` (ruta verificada en código). | Confirmar que `/register` acepta el token para pre-llenar datos. Agregar flujo "crear cuenta exprés" desde la landing de invitación. | Media |
| **Candidato ve plazo para completar** | Incompleto | El proceso tiene `expires_at` pero no hay deadline por invitación individual. El candidato no ve cuántos días tiene. | Agregar `expires_at` por invitación en el modal de creación. Mostrar "Vence en X días" en la landing del candidato. | Media |
| **Status "completada" de invitación** | Roto 🐛 | No se encontró lógica que actualice `status = 'completada'` cuando el candidato termina el examen. La invitación queda "vista" para siempre. | Agregar hook en el flujo de guardado de resultados que, si `process_code` matchea con una invitación activa del candidato, la marque como "completada". | Alta (Bug) |
| **Empresa ve resultado del candidato** | Completo | Los resultados se ven en `/empresa/candidatos` con desglose por sección. Funcional. | OK para MVP. | OK |
| **Empresa compara candidatos entre sí** | Incompleto | No existe vista de comparación side-by-side. Solo se puede ver un candidato expandido a la vez. | Agregar checkbox en tabla + botón "Comparar seleccionados (máx. 3)". Modal con radar chart por sección. | Media 🚀 |
| **Empresa ve resumen del proceso** | Incompleto | `/empresa/procesos/[id]` existe pero no fue revisado en detalle. Desde `/empresa/candidatos` el link de proceso funciona. | Verificar que muestra candidatos + stats por proceso individual. | Media |
| **Notificación al candidato cuando proceso se cierra** | Ausente | Si la empresa cierra un proceso, los candidatos invitados no se enteran. | Enviar email de notificación cuando `status` cambia a `closed` para invitaciones en estado `pendiente` o `vista`. | Baja |
| **Reenvío de invitación** | Ausente | No existe botón "Reenviar". Si el email se perdió, la empresa debe cancelar y crear una nueva invitación, perdiendo el historial. | Agregar botón "Reenviar email" para invitaciones en estado `pendiente` o `vista`. | Media |
| **Invitación sin proceso asignado** | Incompleto | Se puede crear una invitación sin proceso. La landing muestra la empresa pero sin exámenes concretos. El candidato no sabe qué rendir. | En el modal de invitación, mostrar warning: "Sin proceso asignado, el candidato no tendrá exámenes específicos". O requerir proceso siempre. | Media |

**Respuestas a preguntas UX clave:**
- *¿Un líder técnico entiende qué evalúa cada prueba sin documentación externa?* **Parcialmente** — las descripciones en el form de creación son buenas, pero no están disponibles al ver resultados.
- *¿El resultado da información suficiente para decisión de contratación?* **Sí para assessment técnico**, pero falta comparación entre candidatos y contexto de benchmark (ej: promedio de la plataforma).

---

## 📊 Bloque 4: Dashboard de empresa con métricas

| Métrica / widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| **Procesos activos** | Sí | OK. Clickeable → lleva a procesos. | Agregar conteo de candidatos en proceso activo. | Alto |
| **Candidatos evaluados** | Sí (parcial) | **BUG**: Solo cuenta `exam_results`. Resultados de `assessment_attempts` (database-fundamentals, database-practice) no se cuentan. | Unificar fuente de datos igual que `getEventStatsAction`. | Alto (Bug) |
| **Tasa de aprobación** | Sí | Muestra `—` cuando no hay candidatos. OK. Pero sin benchmark: ¿es bueno 40%? | Agregar tooltip: "Promedio de la plataforma: X%". | Alto 🚀 |
| **Tiempo promedio** | Sí | `5m` sin unidad de contexto. ¿De qué examen? ¿Es normal? | Agregar "(promedio todos los exámenes)" como subtexto. | Medio |
| **Prospectos pendientes** | Sí | Viene de tabla `prospects` que **no tiene UI** en el módulo empresa. El badge rojo aparece pero el link va a `/empresa/procesos`, no a una lista de prospectos. | Crear `/empresa/prospectos` o explicar qué son en tooltip. O eliminar si no está implementado. | Alto (Bug UX) |
| **Invitaciones activas** | Sí | OK. Link a `/empresa/invitaciones`. Badge rojo cuando > 0. | OK. | Medio |
| **Candidiatos que vieron el perfil** | No | No existe tracking de profile views. Métrica clave para B2B. | Agregar tabla `empresa_profile_views` con conteo. Mostrar en dashboard. | Alto 🚀 |
| **Tasa de respuesta a invitaciones** | Parcial | Está en `/empresa/invitaciones` pero no en el dashboard. | Agregar stat card en dashboard: "X% invitaciones completadas". | Alto 🚀 |
| **Top skills disponibles este mes** | No | No existe. Sería útil para orientar a la empresa sobre el pool disponible. | Agregar widget "Skills más frecuentes en la plataforma este mes" (global). | Medio 🚀 |
| **Tiempo promedio de completado por examen** | No | Existe un promedio global pero no por tipo de examen. | Tabla/cards con tiempo promedio desglosado por examen. | Bajo |
| **Gráfico procesos (6 meses)** | Sí | OK. BarChart funcional. | OK. | Medio |
| **Gráfico candidatos (6 meses)** | Sí (parcial) | Mismo bug: solo cuenta `exam_results`. | Fix del bug de fuente de datos. | Alto |
| **Empty state CTA** | Sí | Coexiste con el welcome banner. Dos "primeras llamadas a acción" compiten cuando no hay actividad. | Mostrar welcome banner OR empty state CTA (no ambos). Mostrar solo empty state. | Bajo |
| **Alerta de perfil incompleto** | No | No hay aviso cuando el perfil está incompleto (< 80%). Un Banco Continental con 0% de perfil completo ve el mismo dashboard que una empresa con 100%. | Agregar banner de alerta si `completionScore < 80`: "Tu perfil está incompleto. Los candidatos ven poca información de tu empresa." Con link a `/empresa/perfil`. | Alto |
| **Quick link "Explorar candidatos"** | No | No existe porque la funcionalidad de búsqueda en el pool no existe. | Ver Bloque 2 — crear funcionalidad y agregar el link. | Crítico 🚀 |
| **Acciones rápidas contextuales** | Parcial | Los 6 quick links son estáticos. No cambian según el estado (no hay "tienes evaluaciones pendientes de revisar"). | Agregar sección "Pendiente de acción" que muestra invitaciones vistas sin completar, procesos venciendo, etc. | Alto |

---

## ✅ Bloque 5: Cierre & Registro del Ciclo

### Top 5 hallazgos críticos

1. **🚀 GAP CRÍTICO — No existe búsqueda en el pool de candidatos**  
   Tipo: Gap de funcionalidad  
   El módulo solo muestra candidatos que YA rindieron en los procesos propios. No hay forma de buscar perfiles QA en la plataforma. Para CLT o Banco Continental que buscan talento QA, esto hace que el módulo empresa sea útil solo DESPUÉS de que los candidatos ya llegaron. No hay atracción/discovery.

2. **🐛 BUG — Invitaciones nunca se marcan como "completadas"**  
   Tipo: Bug  
   No existe lógica que actualice `status = 'completada'` en `empresa_invitaciones` cuando el candidato termina el examen. Las métricas de "tasa de completado" de invitaciones son incorrectas. Afecta dashboard, tabla de invitaciones y reportes.

3. **🐛 BUG — Dashboard no cuenta `assessment_attempts`**  
   Tipo: Bug  
   Las métricas de candidatos y el gráfico de 6 meses solo cuentan `exam_results`. Los resultados de `database-fundamentals` y `database-practice` son invisibles en el dashboard principal y en `/empresa/candidatos`. Dato incompleto para el recruiter.

4. **🐛 BUG UX — Métrica "Prospectos pendientes" sin UI de soporte**  
   Tipo: Bug UX  
   El dashboard muestra badge rojo de "Prospectos pendientes" que viene de una tabla `prospects` sin UI en el módulo empresa. El link va a `/empresa/procesos`. El recruiter ve un número de alerta pero no puede actuar sobre él.

5. **🚀 GAP — Perfil público sin stack, modalidad ni ciudad**  
   Tipo: Gap de funcionalidad + UX  
   El perfil público (`/empresas/[id]`) no transmite lo suficiente para atraer talento QA de LATAM. Un candidato que ve el perfil de Banco Continental solo ve: nombre, industria, país, tamaño y descripción. Sin stack de herramientas, modalidad de trabajo ni ciudad, el perfil no diferencia ni convence.

---

### Clasificación por tipo

| # | Hallazgo | Tipo |
|---|---|---|
| 1 | No existe búsqueda en pool de candidatos | Gap de funcionalidad |
| 2 | Invitaciones nunca se marcan como "completadas" | Bug |
| 3 | Dashboard no cuenta assessment_attempts | Bug |
| 4 | "Prospectos pendientes" sin UI de soporte | Bug UX |
| 5 | Perfil público sin stack/modalidad/ciudad | Gap de funcionalidad + UX |
| 6 | Shortlist/favoritos: tabla existe pero sin UI | Gap de funcionalidad |
| 7 | Email de invitación: fallo silencioso en Resend | Bug |
| 8 | Sin auto-save / warning de cambios no guardados | Problema UX |
| 9 | Sin comparación side-by-side de candidatos | Gap de funcionalidad |
| 10 | Sin alerta de perfil incompleto en dashboard | Problema UX |

---

### Bloqueos para uso real (cliente piloto CLT / Banco Continental)

| Bloqueo | Impacto en cliente piloto |
|---|---|
| Sin búsqueda en pool de candidatos | La empresa no puede encontrar QAs disponibles. El módulo es pasivo, no activo. |
| Dashboard con datos incompletos (bug assessment_attempts) | Métricas incorrectas desde el primer proceso. Erosiona confianza en la plataforma. |
| Invitaciones que nunca se completan (bug status) | El recruiter no sabe si el candidato terminó. Proceso de selección bloqueado. |
| Sin stack/modalidad en perfil público | Los candidatos QA más calificados no aplican a empresas con perfiles pobres. |
| Shortlist sin UI | El recruiter no puede organizar a los candidatos preseleccionados. |

---

### Foco del próximo ciclo (1 hora)

**Prioridad:** Resolver los 3 bugs críticos antes de cualquier feature nuevo.

1. **Fix bug `assessment_attempts`** — actualizar `getEmpresaDashboardStatsAction` y la query de `/empresa/candidatos` para incluir ambas fuentes (30 min)
2. **Fix bug invitaciones status "completada"** — agregar hook en guardado de resultados de examen (20 min)
3. **Fix UX bug "Prospectos"** — ocultar/aclarar el widget o crear UI de prospectos (10 min)

El ciclo siguiente debería abordar:
- UI de shortlist/favoritos (tabla ya existe en DB)
- Campos faltantes en perfil (stack, modalidad, ciudad)

---

### Items marcados 🚀 (relevantes para pitch Moonshot / propuesta B2B)

| # | Item | Por qué importa para Moonshot |
|---|---|---|
| 🚀 | Búsqueda en pool de candidatos | Es el **core value** B2B: "encontrá QAs calificados en LATAM". Sin esto, no hay propuesta de valor diferenciada. |
| 🚀 | Stack tecnológico en perfil | Las empresas que contratan QA buscan match de herramientas. Es el filtro que convierte exploradores en applicants. |
| 🚀 | Modalidad de trabajo en perfil | Post-pandemia, el 70%+ de QAs en LATAM filtra por remoto. Sin este campo, se pierde ese segmento. |
| 🚀 | Tasa de respuesta a invitaciones en dashboard | Métrica de engagement que Moonshot puede usar como indicador de activación B2B ("X% de candidatos invitados completaron en 48h"). |
| 🚀 | Candidatos que vieron el perfil | Proof of value para la empresa: "tu perfil fue visto por X QAs este mes". |
| 🚀 | Comparación side-by-side de candidatos | Feature premium diferenciador frente a LinkedIn/GetOnBoard para evaluación técnica. |
| 🚀 | Tipo de examen con descripción contextual | En el pitch: "podés enviar evaluaciones técnicas reales de ISTQB, API Testing y SQL con un click". |

---

*Próximo ciclo sugerido: Fix bugs críticos (assessment_attempts + invitaciones status) + UI de shortlist*  
*Generado: 2026-06-24 | Rama: claude/zen-noether-6tak6v*
