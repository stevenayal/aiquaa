# Ciclo QA — Módulo Empresas / aiquaa.com

**Fecha:** sábado, 30 de mayo de 2026
**Reviewer:** QA Lead (ciclo de mejora continua)
**Persona objetivo:** recruiter / responsable de RRHH (perfil no técnico)
**Clientes piloto de referencia:** CLT, Banco Continental SAECA (Paraguay)
**Duración:** 60 minutos
**Método:** revisión de código (Next.js Server Actions + Supabase/Postgres, no interacción en navegador con datos reales) — todo hallazgo está anclado a archivo/línea real, no a supuestos.

> ⚠️ **Nota de arquitectura (bloquea la lectura de `CLAUDE.md`):** el repo real ya no usa el backend NestJS + Prisma descrito en `CLAUDE.md` y en varios docs (`docs/ISTQB_EMAIL_REPORTS.md`, `docs/DEPLOY_BACKEND_RAILWAY.md`, `docs/adr/ADR-001-monolito-modular-nest.md`, etc.). `apps/backend` no existe en el working tree. La lógica de negocio vive en `apps/frontend/src/actions/*.ts` (Server Actions) contra Supabase directo, con SQL/RLS en `supabase/migrations/*.sql`. Cualquier auditoría futura debe partir de ahí, no de los docs de arquitectura.

---

## 🏢 Perfil de empresa

| Elemento del perfil | Problema UX | Impacto (A/M/B) | Propuesta de mejora | Estado actual |
|---|---|---|---|---|
| Logo — política RLS de Storage | Las policies `empresa_logos_member_upload/update/delete` (`supabase/migrations/20260602_000000_empresa_profile_and_invitaciones.sql` L93-112) solo exigen `auth.uid() IS NOT NULL`, sin validar pertenencia a la empresa dueña del path. **Cualquier usuario autenticado —incluido un candidato— puede subir, sobrescribir o borrar el logo de cualquier empresa**, incluida CLT o Banco Continental. | **A** | Restringir la policy comparando el prefijo del path con `auth_user_empresa_role((storage.foldername(name))[1]::uuid)`. | **Roto** |
| Score de completitud de perfil | `PROFILE_FIELDS`/`completionScore` (`empresa/perfil/page.tsx` L81-98) solo cuenta 8 campos básicos; los campos de "employer branding" (tech_stack, benefits, linkedin_url, qa_team_size) — los que más atraen talento QA — no suman al 100%. Una empresa puede llegar a "perfil completo" sin stack, beneficios ni LinkedIn. | A | Incluir tech_stack/benefits/linkedin_url/qa_team_size en el cálculo de completitud. | Incompleto |
| Registro de empresa — RUC obligatorio | El registro exige RUC con formato paraguayo fijo (`^\d{6,8}-\d$`, `validateRegisterForm.ts` L40-46) y no pregunta país, pese a que el perfil sí ofrece 11 países. Una empresa no paraguaya no puede registrarse. | M | Pedir país en el registro y validar RUC/tax-id condicionalmente. | Incompleto |
| Directorio público `/empresas` | La query (`empresas/page.tsx` L37-44) no filtra por completitud/estado; empresas recién registradas (solo razón social) aparecen de inmediato con ícono genérico y sin descripción. Ver "CLT" a medio llenar antes de que RR.HH. termine el perfil daña la percepción de seriedad. | M | Ocultar del directorio empresas con completitud &lt; umbral, o mostrar placeholder "Perfil en construcción". | Incompleto |
| Onboarding hacia el perfil | "Perfil de empresa" es el último de 7 links en el dashboard (`BASE_LINKS`, `empresa/page.tsx` L27-70), sin badge ni redirección forzada tras el registro. | M | Redirigir a `/empresa/perfil` en el primer login si completitud &lt; 50%. | Incompleto |
| Mensajes de error al guardar | `updateEmpresaAction` (`empresa-admin.ts` L323-329) propaga el mensaje crudo de Postgres (ej. `duplicate key value violates unique constraint "empresas_ruc_unique"`) directo al `alert()` en español. | M | Mapear errores conocidos a mensajes en español antes de mostrarlos. | Incompleto |
| Campo LinkedIn | A diferencia de `website_url` (validado con regex), `linkedin_url` no tiene validación de formato ni longitud máxima (`perfil/page.tsx` L724-735) — puede guardarse texto arbitrario y renderizarse como link roto en el perfil público. | M | Aplicar la misma validación de URL que a `website_url`. | Incompleto |
| Validación de logo subido | Solo se valida tamaño (&gt;2MB) client-side; no hay validación real de tipo MIME ni dimensiones, ni revisión server-side. | M | Validar magic bytes/dimensiones antes de subir; reforzar server-side. | Incompleto |
| RUC como señal de confianza | El RUC se valida al registrar/editar pero **nunca se muestra** en el perfil público (`empresas/[id]/page.tsx`) — se pierde una señal fuerte de legitimidad frente a fraudes de reclutamiento, algo valioso para un candidato QA evaluando si una oferta es real. | B | Mostrar "RUC verificado: 80012345-6" (parcial) como sello de confianza. | Incompleto |
| Descripción de empresa | Campo opcional sin placeholder alternativo; sin descripción, el perfil público queda con un hueco visual entre el hero y "Procesos activos". | B | Marcar como recomendado con ejemplo pre-cargado, o placeholder amigable. | Incompleto |
| Prueba social en el perfil público | No hay testimonios de empleados QA, fotos de equipo, ni badge de "empresa verificada" — el perfil se siente genérico frente a LinkedIn/Glassdoor para alguien evaluando si CLT o Banco Continental es un empleador serio. | M | Sección opcional de testimonios/fotos + verificación manual para clientes piloto. | Incompleto |
| Tech stack QA | Persistencia y renderizado end-to-end confirmados (edición → Supabase → perfil público funciona), pero sin límite de tags ni normalización de mayúsculas ("Selenium" vs "selenium" pueden coexistir). | B | Normalizar capitalización, límite ~15 tags. | Completo (detalle menor) |
| `qa_team_size` | Se guarda correctamente pero **nunca se muestra** en el perfil público, pese a ser información relevante para el candidato ("¿de qué tamaño es el equipo QA?"). | M | Mostrar "Equipo QA: 5–20 personas" en el perfil público. | Incompleto |

**¿Entiende un recruiter primerizo el flujo en &lt;30s?** Sí — el formulario está bien seccionado con placeholders orientadores y el único campo obligatorio real es "Razón social". El riesgo no es la comprensión, sino que el indicador de completitud permite un perfil "100%" sin employer branding real.

**¿El perfil público inspira confianza?** Parcialmente. Cuando está completo, el diseño es limpio. Pero el gap en el score de completitud, la falta de filtro de calidad en el directorio, la ausencia de un sello de verificación y —sobre todo— la vulnerabilidad de RLS en el logo son problemas que un cliente piloto como Banco Continental notaría de inmediato.

---

## 🔍 Búsqueda y filtro de candidatos QA

| Filtro/función | UX actual | Problema | Propuesta | Prioridad |
|---|---|---|---|---|
| Filtros inconsistentes entre dos pantallas | `/empresa/buscar-candidatos` tiene disponibilidad + ISTQB + país + skills; la pestaña "Talento QA" en `/empresa/candidatos` solo tiene ISTQB + país + texto libre, sin disponibilidad ni skills. | Dos herramientas para el mismo pool opt-in, con capacidades distintas — el recruiter que aprende una no puede replicar el filtro en la otra. | Unificar en una sola pantalla de sourcing, o reusar `filterTalentCandidates`/`QA_SKILL_OPTIONS` en ambas. | **Alta** |
| Filtros "muertos" en pestaña Talento QA | `filterExam`/`filterPassed` quedan visibles y operables en las pestañas Talento QA y Shortlist (`candidatos/page.tsx` L1161-1211), pero `filteredTalentCandidates` nunca los aplica (L453-474). | El recruiter cambia el filtro, no ve efecto, y puede concluir erróneamente "no hay candidatos aprobados" cuando el filtro simplemente no está conectado. | Ocultar esos filtros cuando `viewMode !== 'evaluados'`. | **Alta** |
| Promesa "sin exponer emails" no reforzada en RLS | La UI dice "arma tu shortlist sin exponer emails", pero la policy `profiles_select_empresa_talent` es a nivel de fila, no de columna — cualquier cuenta `empresa` puede pedir `select('email')` directo sobre un candidato opt-in y obtenerlo. | Protección solo de UI/producto, no de base de datos — riesgo real de compliance para un cliente bancario como Banco Continental. | Restringir columnas expuestas vía vista/RPC dedicada, como ya se hizo para el ranking XP. | **Alta** |
| Orden de resultados por "mejor score" sin normalizar | La RPC de sourcing ordena por `best_score` sin distinguir tipo de examen — un 95% en un examen fácil supera a un 80% en ISTQB. | El "score" no es comparable entre candidatos que rindieron pruebas distintas. | Mostrar el tipo de examen junto al score en el orden, o ponderar por dificultad. | Alta |
| Ranking/XP desconectado de la búsqueda | Ni la RPC de sourcing ni el perfil público de talento referencian el sistema de XP/ranking (usado solo en `/ranking`). | La gamificación no funciona como señal de calidad al buscar candidatos, pese a que el pitch de producto podría sugerir lo contrario. | Si se quiere vender "ranking como señal", conectar XP/insignias como criterio de orden opcional. | Media |
| País mostrado como código crudo en una pantalla | `buscar-candidatos/page.tsx` renderiza el código ISO crudo ("PY", "AR") en el filtro; `candidatos/page.tsx` sí usa labels con bandera y nombre completo. | Inconsistente — un recruiter sin contexto QA ve códigos sin traducir en una de las dos pantallas. | Reusar `COUNTRY_LABELS` en ambas pantallas. | Media |
| Nivel ISTQB sin explicación | "Foundation Level (CTFL)" aparece en selects y badges sin tooltip en ninguna de las tres pantallas revisadas. | Jerga QA no explicada a un recruiter sin trasfondo técnico. | Tooltip corto: "Certificación internacional en testing de software". | Media |
| Skills como chips planos sin categorías | `QA_SKILL_OPTIONS` lista Selenium, Cypress, k6, JMeter, SQL, etc. sin agrupar por necesidad de negocio. | Un recruiter de RRHH no sabe qué chips corresponden a "necesito alguien que pruebe nuestra API bancaria". | Agrupar por categoría (Automatización web, API/Performance, Bases de datos, Proceso). | Media |
| Único canal de contacto es la invitación formal a evaluación | Para candidatos "Talento QA" (opt-in, no aplicantes), la única acción es "Invitar" (crea proceso de evaluación formal); no hay mensajería ligera. | Fricción alta para un primer acercamiento informal. | Ofrecer una opción "solo mensaje/interés" sin evaluación obligatoria. | Media |
| Distinción "Evaluados" vs "Talento QA" no explicada en UI | Algunos candidatos muestran email + "Contactar" (ya aplicaron a un proceso propio), otros solo "Invitar" (leads del directorio) — sin ningún texto que aclare la diferencia. | El recruiter no entiende por qué el trato es distinto entre candidatos. | Badge "Aplicó a tu proceso" vs "Disponible vía invitación". | Media |
| Empty state de "Talento QA" sin CTA | Mensaje pasivo ("aparecerán cuando activen visibilidad") sin acción sugerida, a diferencia del empty state de "Evaluados" que sí linkea a procesos. | Recruiter sin pool disponible se queda sin siguiente paso claro. | Agregar CTA a "Evaluados" o a compartir código de proceso. | Baja |
| Empty state con filtros aplicados en `buscar-candidatos` | Funciona bien: mensaje + botón "Limpiar" visible. | Ninguno — solo mejorable indicando qué filtro es el más restrictivo. | Resaltar el filtro con 0 resultados. | Baja |

**Conclusión:** un recruiter sin trasfondo QA puede entender disponibilidad y país (cuando están traducidos), pero "ISTQB CTFL" y los chips de skills carecen de cualquier explicación. El flujo de shortlist/favoritos funciona de punta a punta, pero el contacto directo solo existe para quienes ya aplicaron a un proceso propio — el resto exige lanzar una evaluación formal. La promesa de privacidad de email no está reforzada a nivel de base de datos.

---

## 📋 Evaluaciones técnicas para candidatos

> El módulo tiene **tres sistemas de evaluación superpuestos**: (A) exámenes legacy vía `exam_results`/`hiring_processes`, (B) "assessments" estructurados (secciones/preguntas/scoring) que en realidad escriben sobre la misma tabla `exam_results` de A, y (C) "Pruebas" propias de cada empresa (Beta), aisladas del resto. Esto triplica la superficie de mantenimiento y genera inconsistencias de UX entre sistemas.

| Paso del flujo | Estado | Problema UX | Acción recomendada | Prioridad |
|---|---|---|---|---|
| Selección de exámenes al crear un proceso (A) | Incompleto | Ni `saveExamResultAction` ni `assignProcessCodeToExamAction` validan el `exam_type` recibido contra `hiring_processes.exam_types` — un candidato puede rendir cualquier examen del catálogo y asociarlo al código, ignorando la configuración de la empresa. | Validar `exam_type` contra `process.exam_types` antes de aceptar el resultado. | **Alta** |
| Botón "Invitar" desde Candidatos → Evaluados | **Roto** | `sendInvite()` llama a `createInvitacionAction` sin `process_id`; la página de invitación le pide al candidato "ingresá el código del proceso", instrucción imposible de cumplir porque no hay proceso asociado. | Forzar selección de proceso/examen en el modal antes de enviar. | **Alta** |
| Confirmación de "invitación enviada" | Incompleto | El mensaje de éxito solo chequea ausencia de error, ignorando `email_sent`/`email_error` — si el email falla o `EMAIL_SENDING_ENABLED` está apagado, la empresa recibe una confirmación falsa positiva. | Leer `email_sent`/`email_error` del resultado y avisar si no se entregó. | **Alta** |
| Flag `EMAIL_SENDING_ENABLED` mal configurado | Riesgo silencioso | Si el env var falta o está mal seteado en producción, ninguna invitación se envía, pero el flujo continúa "exitosamente" sin alerta a nivel de infraestructura. | Loggear/alertar cuando el flag esté apagado en producción; documentar en el runbook de deploy. | **Alta** |
| Notificación a la empresa al completar examen | Completo | `notifyEmpresaExamCompleted()` funciona end-to-end si el flag de email está activo. | — (mismo riesgo del flag de arriba) | Baja |
| Revisión manual "Test App — Bug Hunt" | Completo | Flujo maduro: aprobación por bug, calidad ponderada, ajuste manual, evidencia con imágenes. Bien diseñado. | — | Baja |
| Sistema C — invitación a "Pruebas" propias | Incompleto | Nunca envía email; la única vía es "Copiar link" manual — inconsistente con A/B que sí automatizan el email. | Reusar el flujo de email de invitaciones para `empresa_prueba_invitaciones`. | Media |
| Sistema C — expiración de invitación | Incompleto | El campo `expires_at` existe en el schema y la función lo acepta, pero el formulario no tiene input para setearlo — queda `null` siempre. | Agregar input de fecha de expiración al formulario. | Media |
| Sistema B — límite de tiempo del assessment | Incompleto | El cronómetro solo cuenta hacia arriba ("sugerido ~N min"), sin corte automático ni validación server-side de deadline; un intento puede quedar "in_progress" indefinidamente. Contrasta con el Sistema C, que sí tiene countdown + gracia server-side. | Agregar deadline real con corte server-side, o documentar que es solo referencial. | Media |
| Resultados — comparación de candidatos (A/B) | Completo | Filtros, comparación lado a lado de hasta 4 candidatos, desglose por sección, export CSV, gráficos. Cubre bien la necesidad de decisión de contratación. | — | Baja |
| Resultados — Sistema C aislado | Incompleto | Cada "prueba" propia tiene su propia página de resultados, sin CSV, sin shortlist, sin comparación cruzada con exámenes A/B del mismo candidato. | Unificar resultados de las 3 fuentes en el dashboard central de candidatos. | Media |
| Relación A/B no documentada | Aclaración | El Sistema B no es independiente: escribe su resultado final en la misma tabla `exam_results` de A. No está documentado en ningún lado del código. | Documentar la relación para evitar tratarlos como sistemas separados en el roadmap. | Media |

**¿Un líder técnico entiende qué mide cada examen sin documentación externa?** Parcialmente — las descripciones por tipo de examen son claras, pero la falta de enforcement entre "exámenes configurados" y "exámenes rendidos", sumada a la existencia de tres sistemas con nombres similares, obliga a leer código para saber qué resultado corresponde a qué configuración.

**¿El resultado alcanza para decidir una contratación?** Sí para A/B (desglose, comparación, CSV, revisión manual ponderada). No para C: los resultados quedan aislados sin cruce con el resto del historial del candidato.

---

## 📊 Dashboard de empresa con métricas

| Métrica/widget | Existe | Problema UX | Propuesta | Valor para la empresa |
|---|---|---|---|---|
| Procesos activos/totales/cerrados | Sí | Tres cards separadas del mismo peso visual que el resto, sin jerarquía. | Colapsar en una card con desglose secundario. | Visión rápida del volumen de reclutamiento |
| Candidatos evaluados | Sí (live query) | — | — | Tamaño real del pipeline evaluado |
| Tasa de aprobación | Sí (calculada real) | Sin codificación de color por umbral — siempre el mismo color, no distingue si el número es bueno o malo. | Colorear condicionalmente según rango. | Detectar procesos mal calibrados |
| Tiempo promedio de examen | Sí (real) | Ambigua: no aclara si es "por examen" o "por candidato completo", sin benchmark de referencia. | Sub-etiqueta clara + benchmark esperado. | Detectar exámenes mal calibrados en duración |
| Prospectos pendientes | Sí (real) | Badge numérico sin indicar antigüedad — un lead de hace 3 meses se ve igual que uno de ayer. | Indicador de días desde creación o SLA vencido. | Evitar que leads se enfríen sin seguimiento |
| Funnel de invitaciones (enviadas/vistas/completadas/tasa respuesta) | Sí (real, no hardcodeado) | Solo aparece si hay datos, y queda ubicado **después** de la grilla de accesos rápidos — la señal más accionable del dashboard está enterrada. | Mover el funnel arriba, junto al hero de stats; CTA "reenviar recordatorio". | Identificar fuga de candidatos entre invitación y examen |
| Visitas al perfil de empresa | Sí (real, vía RPC) | Número acumulado sin serie temporal ni comparación mes a mes. | Mini sparkline de tendencia mensual. | Medir atractivo de marca empleadora |
| Top skills QA disponibles este mes | **No** | No existe ningún query agregado sobre skills de candidatos en todo el repo. | Agregar consulta agregada agrupando por skill/tipo de examen con conteo mensual. | Orienta en qué perfil de skill enfocar la búsqueda |
| Desglose por tipo de examen (mejor/peor score) | Sí, pero solo dentro de cada evento individual (`/empresa/eventos/[id]`) | No se resume en el dashboard principal; hay que entrar evento por evento. | Resumen "por examen" en el dashboard principal cuando hay datos suficientes. | Detectar qué competencia técnica es más débil en el pool |
| Gráficos de 6 meses (procesos/candidatos) | Sí (real) | Para una empresa nueva con 0 candidatos evaluados, el gráfico se muestra vacío/plano sin explicación. | Reemplazar con mensaje "aún sin candidatos" en cuentas nuevas. | Evitar confusión visual |
| Empty state de cero actividad | Sí, pero solo si `totalProcesses === 0` | Si ya hay un proceso creado pero sin candidatos, el estado intermedio muestra 8 cards en cero sin CTA. | Extender el empty-state a "proceso creado, sin actividad" con CTA a invitar/compartir código. | Reduce abandono cuando el primer proceso no atrae candidatos |
| Quick actions / accesos directos | Sí, 7-8 links reales y funcionales | Todos con el mismo peso visual — ninguno resalta la acción más urgente. | Cross-linkear badges de pendientes en la card de acceso rápido correspondiente. | Guía al recruiter hacia la acción más urgente |
| Jerarquía visual general | Parcial | Orden actual mezcla stat cards planas, banner descartable y el funnel accionable sin priorización clara. | Reordenar: alertas/pendientes primero, luego pass rate y funnel, accesos rápidos, gráficos históricos al final. | Entender el estado del pipeline en 3 segundos |

**Conclusión:** los datos son reales y en vivo (consulta directa a Supabase, sin cache ni valores hardcodeados), lo cual es una fortaleza real. El problema es puramente de priorización visual: la señal más accionable (funnel de invitaciones, prospectos envejecidos) queda enterrada debajo de contenido decorativo, y falta la métrica agregada de "skills disponibles en la plataforma" que ayudaría a decidir sobre qué perfil buscar.

---

## ✅ Cierre & registro del ciclo

### Hallazgos más críticos (top 5)

1. **🔴 Bug de seguridad — RLS de logo de empresa** (Perfil): cualquier usuario autenticado puede sobrescribir o borrar el logo de cualquier otra empresa. *Bug de seguridad.* 🚀
2. **🔴 PII de candidatos accesible por fila, no por columna** (Búsqueda): la promesa de "no exponemos emails" no está reforzada a nivel de RLS — riesgo de compliance real para un cliente bancario. *Bug de seguridad / gap de funcionalidad.* 🚀
3. **🔴 Flujo de invitación directa roto** (Evaluaciones): "Invitar" desde Candidatos → Evaluados no asocia `process_id`, dejando al candidato con instrucciones imposibles de seguir. *Bug.*
4. **🟠 Falsos positivos de "invitación enviada"** cuando el email falla o `EMAIL_SENDING_ENABLED` está mal configurado, sin alertas de infraestructura. *Bug / gap de funcionalidad.*
5. **🟠 Score de completitud de perfil no exige employer branding real** (tech stack, beneficios, LinkedIn, tamaño de equipo QA) — una empresa piloto puede llegar a "100%" con un perfil que no atrae candidatos. *Gap de funcionalidad / mejora de diseño.*

Menciones adicionales relevantes: tres sistemas de evaluación superpuestos y desincronizados (A/B/C) que triplican la superficie de mantenimiento 🚀; filtros "muertos" en la pestaña Talento QA que pueden hacer creer al recruiter que no hay candidatos aprobados; dashboard con datos reales pero sin priorización visual de lo accionable; documentación de arquitectura (`CLAUDE.md` y varios `docs/*.md`) completamente desactualizada respecto al código real (describe un backend NestJS/Prisma que ya no existe).

### Clasificación de hallazgos

| # | Hallazgo | Tipo |
|---|---|---|
| 1 | RLS de logo de empresa | Bug de seguridad |
| 2 | PII de candidatos por fila, no columna | Bug de seguridad |
| 3 | Invitación directa sin process_id | Bug |
| 4 | Falso positivo de "invitación enviada" | Bug |
| 5 | Score de completitud incompleto | Gap de funcionalidad |
| 6 | Filtros muertos en Talento QA | Bug |
| 7 | Tres sistemas de evaluación superpuestos (A/B/C) | Gap de funcionalidad / deuda de arquitectura |
| 8 | Sin métrica "top skills del mes" | Gap de funcionalidad |
| 9 | Funnel de invitaciones enterrado en el layout | Problema UX |
| 10 | Documentación de arquitectura desactualizada | Deuda de documentación |

### Tickets propuestos (formato listo para Jira — `aiquaa.atlassian.net`)

> No se cuenta con acceso a Jira en este ciclo; los tickets se dejan redactados para carga manual o vía integración futura.

**AIQUAA-EMP-1 · [Seguridad][Alta] RLS de Storage permite sobrescribir el logo de cualquier empresa**
- *Descripción:* Las policies `empresa_logos_member_upload/update/delete` en `supabase/migrations/20260602_000000_empresa_profile_and_invitaciones.sql` (L93-112) solo validan `auth.uid() IS NOT NULL`, sin comprobar pertenencia a la empresa dueña del path del logo.
- *Pasos para reproducir:* 1) Loguearse como cualquier usuario (incluso candidato). 2) Ejecutar un `upload`/`update`/`remove` sobre `storage.objects` en el bucket `empresa-logos` con el path `{empresa_id_ajena}/logo.*`. 3) Confirmar que la operación es aceptada por RLS.
- *Impacto:* Alto — afecta directamente la confianza del cliente piloto (CLT/Banco Continental) si su logo puede ser alterado por terceros.
- *Prioridad:* Alta / bloqueante para piloto.

**AIQUAA-EMP-2 · [Seguridad][Alta] Email de candidatos accesible por fila para cualquier cuenta empresa**
- *Descripción:* La policy `profiles_select_empresa_talent` protege filas pero no columnas; una cuenta `empresa` puede pedir `select('email')` directo sobre cualquier candidato opt-in, contradiciendo el mensaje de UI "sin exponer emails".
- *Pasos para reproducir:* Desde una sesión `empresa`, hacer un `select` a `profiles` filtrando por un candidato con `talent_visible_to_empresas=true`, incluyendo la columna `email`.
- *Impacto:* Alto — riesgo de compliance de datos, especialmente sensible para un cliente bancario.
- *Prioridad:* Alta / bloqueante para piloto con Banco Continental.

**AIQUAA-EMP-3 · [Bug][Alta] Invitación directa desde "Candidatos → Evaluados" no asocia proceso**
- *Descripción:* `sendInvite()` en `empresa/candidatos/page.tsx` llama a `createInvitacionAction` sin `process_id`; el candidato recibe instrucciones de "ingresar el código del proceso" sin que exista ninguno asociado.
- *Pasos para reproducir:* Ir a Candidatos → Evaluados → botón "Invitar" sobre un candidato del directorio de talento → abrir el link recibido.
- *Impacto:* Alto — invitaciones directas no funcionan, bloqueando un flujo central de reclutamiento.
- *Prioridad:* Alta.

**AIQUAA-EMP-4 · [Bug][Media] Confirmación de "invitación enviada" no refleja fallos reales de email**
- *Descripción:* La UI de invitación ignora `email_sent`/`email_error` del resultado de la acción, mostrando éxito aunque el email no se haya entregado (por fallo de Resend o `EMAIL_SENDING_ENABLED=false`).
- *Impacto:* Medio-alto — la empresa cree haber invitado a un candidato que nunca fue notificado.
- *Prioridad:* Alta.

**AIQUAA-EMP-5 · [Gap de funcionalidad][Media] Score de completitud de perfil no exige employer branding**
- *Descripción:* `PROFILE_FIELDS` no incluye tech_stack, benefits, linkedin_url ni qa_team_size en el cálculo de completitud, permitiendo perfiles "100%" sin la información que realmente atrae talento QA.
- *Impacto:* Medio — reduce la calidad de los perfiles públicos, afectando la propuesta de valor para candidatos.
- *Prioridad:* Media-alta.

### ¿Qué bloquea el uso real por parte de un cliente piloto (CLT / Banco Continental)?

- El bug de RLS del logo (#1) y el gap de PII (#2) son **bloqueantes de confianza/compliance** — no deberían llegar a un piloto bancario sin resolverse.
- El flujo roto de invitación directa (#3) bloquea el caso de uso más natural de sourcing activo ("vi un candidato, lo invito").
- Los falsos positivos de email (#4) generan falsa sensación de progreso en el pipeline de reclutamiento.
- El resto de los hallazgos (dashboard, evaluaciones aisladas del sistema C, filtros muertos) son fricción real pero no bloqueante — degradan la experiencia sin impedir el uso.

### Foco del próximo ciclo (1 hora)

Cerrar los tres bloqueantes de piloto: **RLS de logo (#1)**, **RLS/exposición de PII de candidatos (#2)** y **flujo de invitación directa roto (#3)**, más una pasada rápida sobre los filtros muertos de la pestaña Talento QA (#6), ya que es el bug más fácil de arreglar con mayor impacto en la confianza del recruiter durante una demo piloto.

---

*Reporte generado en ciclo de revisión de código (sin interacción de navegador con datos productivos). Todos los hallazgos están anclados a archivo/línea real del repositorio en la fecha del ciclo.*
