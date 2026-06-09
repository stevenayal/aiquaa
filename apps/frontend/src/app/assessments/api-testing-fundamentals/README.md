# API Testing Fundamentals Challenge

## Propósito

Assessment técnico original de AIQUAA para medir fundamentos de API Testing desde un nivel Junior hasta Semi Senior inicial, combinando conocimiento conceptual, interpretación de documentación, diseño de casos, análisis de respuestas y bug reporting.

## Arquitectura

- Rutas App Router:
  - `/assessments`
  - `/assessments/api-testing-fundamentals`
  - `/assessments/api-testing-fundamentals/start`
  - `/assessments/api-testing-fundamentals/section/[sectionId]`
  - `/assessments/api-testing-fundamentals/result`
- Persistencia:
  - Catálogo detallado en `assessment_*`
  - Resumen compatible con el ecosistema actual en `exam_results`
- Seguridad:
  - acceso solo para usuarios autenticados
  - RLS por usuario para intentos, respuestas, scores y feedback
- Seed:
  - catálogo versionado en [assessment-definition.ts](/Z:/Proyectos/aiquaa/apps/frontend/src/app/assessments/api-testing-fundamentals/data/assessment-definition.ts)
  - aplicación automática del seed desde [seed.ts](/Z:/Proyectos/aiquaa/apps/frontend/src/app/assessments/api-testing-fundamentals/lib/seed.ts)

## Modelo de datos

- `assessments`: definición general del challenge
- `assessment_sections`: niveles/secciones
- `assessment_questions`: preguntas con metadata, scoring rules y rubric
- `assessment_attempts`: estado del intento y resumen final
- `assessment_answers`: respuesta por pregunta
- `assessment_scores`: score agregado por nivel
- `assessment_feedback`: feedback final por nivel

La migración está en [20260608_000000_create_assessments.sql](/Z:/Proyectos/aiquaa/supabase/migrations/20260608_000000_create_assessments.sql).

## Lógica de scoring

- Nivel 1: corrección exacta o por keywords en respuestas cortas.
- Nivel 2: corrección exacta o por inclusión de campos/tipos esperados.
- Nivel 3: heurística por cobertura de tipos de caso, completitud del template y presencia de reglas de negocio.
- Nivel 4: clasificación `correct`/`bug` más justificación mínima.
- Nivel 5: heurística de bug report por completitud, método/endpoint, actual vs expected, severidad y prioridad.

Implementación principal en [scoring.ts](/Z:/Proyectos/aiquaa/apps/frontend/src/app/assessments/api-testing-fundamentals/lib/scoring.ts).

## Estructura de contenido

- Nivel 1: 14 preguntas sobre API, HTTP, request/response, headers, body, JSON y status codes.
- Nivel 2: 8 preguntas sobre documentación ficticia `GET /api/products/{id}`.
- Nivel 3: 4 consignas para `GET`, `POST`, `PUT`, `DELETE /api/products`.
- Nivel 4: 8 escenarios simulados request/response.
- Nivel 5: 3 reportes de bug guiados.

## Ejemplos de preguntas y respuestas esperadas

- Nivel 1:
  - Pregunta: `¿Qué describe mejor a una API?`
  - Esperado: interfaz que permite intercambiar información entre sistemas mediante reglas definidas.
- Nivel 2:
  - Pregunta: `¿Qué status code debería devolver si no enviás token?`
  - Esperado: `401`.
- Nivel 3:
  - Pregunta: diseño de casos para `POST /api/products`.
  - Esperado: casos que cubran `name` obligatorio, `price > 0`, `stock >= 0`, `active boolean`, duplicados, auth y contrato.
- Nivel 4:
  - Caso: `GET /api/products/prod_999` responde `200` con `Product not found`.
  - Esperado: marcar `bug` y explicar que debería responder `404`.
- Nivel 5:
  - Bug report esperado:
    - título claro
    - endpoint y método correctos
    - pasos reproducibles
    - actual `200`
    - expected `404`
    - severidad/prioridad razonables

## Flujo de usuario

1. Usuario autenticado accede al overview.
2. Inicia o reanuda intento desde `/start`.
3. Completa cada nivel con autosave.
4. Envía cada sección y recibe scoring persistido.
5. Finaliza el assessment.
6. El sistema consolida score total, candidate level, fortalezas, debilidades y recomendaciones.
7. Se inserta un resumen en `exam_results` para historial y procesos.

## Integraciones existentes

- `saveExamResultAction` soporta `exam_type = api-testing-fundamentals`.
- `dashboard`, `perfil`, `employer`, `empresa/candidatos`, `empresa/procesos/[id]` e invitaciones reconocen el nuevo tipo.
- `employer/nuevo` ya permite incluir este challenge dentro de un proceso.

## Mejoras futuras

- Reviewer UI para scoring manual o ajuste humano de niveles 3 y 5.
- Banco multi-assessment con más challenges reutilizando el mismo esquema.
- Analytics por pregunta y drop-off por sección.
- Export de resultados y feedback en PDF.
- Gamificacion integrada con Supabase: XP por completar, aprobar y lograr high score en el challenge.
