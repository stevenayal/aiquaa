-- ============================================================
-- SEED: API Testing Challenge — Banca Digital
-- Schema: public.assessments + sections + questions
-- Scoring: 100 pts total | Pass threshold: 70 pts
-- ============================================================

-- ─── 1. ASSESSMENT ──────────────────────────────────────────

insert into public.assessments (
  id, slug, title, description, level, type,
  duration_minutes, total_score, is_active, metadata
) values (
  'a1b2c3d4-0001-4000-8000-000000000001',
  'api-banking',
  'API Testing Challenge — Banca Digital',
  'Evaluación práctica de API Testing sobre una API bancaria simulada con bugs intencionales. El candidato explora la API, diseña casos de prueba, detecta vulnerabilidades y redacta reportes formales de bugs.',
  'semi-senior',
  'api-testing',
  105,
  100,
  true,
  jsonb_build_object(
    'pass_threshold', 70,
    'base_url', '/api/challenge',
    'credentials', jsonb_build_object(
      'user_a', jsonb_build_object('email', 'user.a@aiquaa.test', 'password', 'Test1234!', 'account', 'acc_001', 'balance', 5000000),
      'user_b', jsonb_build_object('email', 'user.b@aiquaa.test', 'password', 'Test1234!', 'account', 'acc_002', 'balance', 2500000)
    ),
    'openapi_url', '/api/challenge/openapi.json',
    'total_bugs', 12,
    'tags', array['api', 'security', 'rest', 'banking', 'idor', 'validation']
  )
) on conflict (slug) do update set
  title       = excluded.title,
  description = excluded.description,
  metadata    = excluded.metadata,
  updated_at  = now();

-- ─── 2. SECTIONS ────────────────────────────────────────────
-- 5 secciones | distribución: 15 + 25 + 25 + 20 + 15 = 100 pts

insert into public.assessment_sections (
  id, assessment_id, slug, title, description, order_index, max_score, metadata
) values

-- Sección 1: Reconocimiento y Contratos (15 pts)
(
  'b1000001-0000-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  'recon',
  'Reconocimiento y Contratos de API',
  'Exploración inicial de la API, comprensión de la documentación OpenAPI e identificación de discrepancias entre el contrato y la implementación.',
  1, 15,
  jsonb_build_object('icon', '🔍', 'scoring_mode', 'heuristic')
),

-- Sección 2: Diseño de Casos de Prueba (25 pts)
(
  'b1000002-0000-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  'test-design',
  'Diseño de Casos de Prueba',
  'Creación de casos de prueba positivos, negativos, de borde, seguridad y contrato para los endpoints principales de la API.',
  2, 25,
  jsonb_build_object('icon', '🧪', 'scoring_mode', 'heuristic', 'min_cases', 5, 'required_types', array['positive','negative','boundary','security','contract'])
),

-- Sección 3: Detección de Bugs (25 pts)
(
  'b1000003-0000-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  'bug-detection',
  'Detección de Bugs',
  'Análisis de respuestas de la API para identificar comportamientos incorrectos, validaciones faltantes y discrepancias con la especificación.',
  3, 25,
  jsonb_build_object('icon', '🐛', 'scoring_mode', 'automatic', 'total_bugs', 12)
),

-- Sección 4: Reporte de Bugs (20 pts)
(
  'b1000004-0000-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  'bug-reporting',
  'Reporte Formal de Bugs',
  'Redacción de reportes de bugs con el estándar requerido: título, pasos de reproducción, resultado actual vs esperado, severidad, prioridad y evidencia.',
  4, 20,
  jsonb_build_object('icon', '📝', 'scoring_mode', 'heuristic', 'required_fields', array['title','steps_to_reproduce','actual_result','expected_result','severity','priority','evidence'])
),

-- Sección 5: Seguridad y Resumen (15 pts)
(
  'b1000005-0000-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  'security-summary',
  'Seguridad y Resumen Ejecutivo',
  'Identificación de vulnerabilidades de seguridad y síntesis ejecutiva de los hallazgos con impacto y recomendaciones.',
  5, 15,
  jsonb_build_object('icon', '🔒', 'scoring_mode', 'heuristic')
)

on conflict (assessment_id, slug) do update set
  title       = excluded.title,
  description = excluded.description,
  max_score   = excluded.max_score,
  metadata    = excluded.metadata;

-- ─── 3. QUESTIONS ───────────────────────────────────────────

-- ╔══════════════════════════════════════════╗
-- ║  SECCIÓN 1 — Reconocimiento (15 pts)    ║
-- ╚══════════════════════════════════════════╝

insert into public.assessment_questions (
  id, section_id, question_type, prompt, description,
  options, correct_answer, expected_keywords, explanation,
  scoring_rules, rubric, points, order_index
) values

-- Q1.1 — doc_analysis: Discrepancia entre OpenAPI y respuesta real (8 pts)
(
  'c1010100-0000-4000-8000-000000000001',
  'b1000001-0000-4000-8000-000000000001',
  'doc_analysis',
  'El spec OpenAPI de la API dice que el campo de saldo disponible en GET /accounts se llama `availableBalance`. Ejecutá la llamada y comparala con el spec. ¿Qué encontrás?',
  'Usá las credenciales de Usuario A para hacer GET /api/challenge/accounts. Luego descargá el spec desde /api/challenge/openapi.json y comparalo con la respuesta.',
  '[]'::jsonb,
  null,
  '["availableBalance", "balance", "contrato", "mismatch", "discrepancia", "campo", "field", "spec", "openapi"]'::jsonb,
  'La API retorna el campo como `balance` pero el spec OpenAPI lo documenta como `availableBalance`. Esto es un bug de contrato: la implementación no cumple la especificación publicada. Impacto: clientes que implementen contra el spec van a fallar al parsear la respuesta.',
  jsonb_build_object(
    'keyword_match', jsonb_build_object('weight', 0.4, 'min_keywords', 2),
    'concept_present', jsonb_build_object(
      'contract_mismatch', jsonb_build_object('required', true, 'points', 4),
      'field_names_identified', jsonb_build_object('required', true, 'points', 2),
      'impact_mentioned', jsonb_build_object('required', false, 'points', 2)
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 7, 'description', 'Identifica ambos nombres de campo, nombra el tipo de bug (contrato/spec mismatch) y menciona el impacto en consumidores de la API'),
    'acceptable', jsonb_build_object('min_score', 5, 'description', 'Identifica la discrepancia entre spec y respuesta real, menciona los campos'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'No identifica la discrepancia o describe algo incorrecto')
  ),
  8, 1
),

-- Q1.2 — multiple_choice: ¿Cuántos endpoints expone la API? (3 pts)
(
  'c1010200-0000-4000-8000-000000000001',
  'b1000001-0000-4000-8000-000000000001',
  'multiple_choice',
  '¿Cuántos endpoints distintos expone la API de Banca Digital según el spec OpenAPI?',
  'Contá los paths en /api/challenge/openapi.json.',
  '[
    {"id": "a", "text": "5 endpoints"},
    {"id": "b", "text": "6 endpoints"},
    {"id": "c", "text": "7 endpoints"},
    {"id": "d", "text": "9 endpoints"}
  ]'::jsonb,
  '"c"'::jsonb,
  '[]'::jsonb,
  'La API expone 7 endpoints: POST /auth/login, GET /users/me, GET /accounts, GET /accounts/{id}, GET /accounts/{id}/movements, POST /transfers, GET /transfers/{id}.',
  jsonb_build_object('exact_match', true),
  '{}'::jsonb,
  3, 2
),

-- Q1.3 — short_text: Headers de autenticación (4 pts)
(
  'c1010300-0000-4000-8000-000000000001',
  'b1000001-0000-4000-8000-000000000001',
  'short_text',
  '¿Qué header de autenticación requieren los endpoints protegidos de la API? Indicá el nombre del header y el formato del valor esperado.',
  null,
  '[]'::jsonb,
  null,
  '["Authorization", "Bearer", "token", "JWT", "header"]'::jsonb,
  'Los endpoints protegidos requieren el header `Authorization: Bearer <token>`. El token se obtiene haciendo POST /auth/login con email y password.',
  jsonb_build_object(
    'keyword_match', jsonb_build_object('weight', 1.0, 'min_keywords', 2),
    'required_keywords', array['Authorization', 'Bearer']
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 4, 'description', 'Nombra el header Authorization, el esquema Bearer y menciona que el token viene del login'),
    'acceptable', jsonb_build_object('min_score', 2, 'description', 'Nombra Authorization y Bearer correctamente'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'Respuesta incorrecta o incompleta')
  ),
  4, 3
),

-- ╔══════════════════════════════════════════╗
-- ║  SECCIÓN 2 — Diseño de TCs (25 pts)     ║
-- ╚══════════════════════════════════════════╝

-- Q2.1 — test_case_matrix: Casos de prueba para POST /transfers (15 pts)
(
  'c2010100-0000-4000-8000-000000000001',
  'b1000002-0000-4000-8000-000000000001',
  'test_case_matrix',
  'Diseñá los casos de prueba para el endpoint POST /transfers. Debés cubrir al menos un caso de cada tipo: positivo, negativo, borde, seguridad y contrato.',
  'Para cada caso incluí: Título, Tipo (positive/negative/boundary/security/contract), Precondición, Pasos, Resultado esperado y Prioridad.',
  '[]'::jsonb,
  null,
  '["positivo", "negativo", "borde", "seguridad", "contrato", "monto", "saldo", "autorización", "transferencia"]'::jsonb,
  'Casos esperados mínimos: (1) Positivo: transferencia válida entre cuentas propias → 201. (2) Negativo: amount=0 → 400. (3) Negativo: amount=-100 → 400. (4) Borde: amount=saldo exacto → 201 (o revelar bug #5). (5) Seguridad: transferir desde cuenta de otro usuario → 403. (6) Contrato: verificar que la respuesta cumple el schema del spec.',
  jsonb_build_object(
    'scoring_dimensions', jsonb_build_object(
      'coverage_types', jsonb_build_object(
        'weight', 0.4,
        'points_per_type', 1,
        'types', array['positive','negative','boundary','security','contract']
      ),
      'minimum_cases', jsonb_build_object(
        'weight', 0.2,
        'threshold', 5,
        'full_points_at', 8
      ),
      'quality', jsonb_build_object(
        'weight', 0.4,
        'criteria', array['has_precondition','has_steps','has_expected_result','has_priority']
      )
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 13, 'description', '8+ casos cubriendo los 5 tipos, pasos claros, resultados esperados precisos, incluye casos que detectan bugs reales'),
    'acceptable', jsonb_build_object('min_score', 9, 'description', '5+ casos cubriendo al menos 4 tipos, estructura completa'),
    'basic', jsonb_build_object('min_score', 5, 'description', '3-4 casos, algunos tipos cubiertos, estructura parcial'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'Menos de 3 casos o cobertura muy limitada')
  ),
  15, 1
),

-- Q2.2 — multiple_choice: Tipos de prueba para autenticación JWT (5 pts)
(
  'c2020100-0000-4000-8000-000000000001',
  'b1000002-0000-4000-8000-000000000001',
  'multiple_choice',
  'Al probar el endpoint GET /users/me, ¿cuáles de los siguientes escenarios son casos de prueba válidos? (Seleccioná todos los que aplican)',
  'Podés seleccionar más de una opción.',
  '[
    {"id": "a", "text": "Request sin header Authorization"},
    {"id": "b", "text": "Token JWT con firma válida pero usuario inexistente"},
    {"id": "c", "text": "Token JWT expirado"},
    {"id": "d", "text": "Token con algoritmo HS256 correcto"},
    {"id": "e", "text": "Token malformado (no es un JWT válido)"},
    {"id": "f", "text": "Token de otra aplicación (mismo secret, distinto emisor)"}
  ]'::jsonb,
  '["a", "b", "c", "e"]'::jsonb,
  '[]'::jsonb,
  'Todos excepto D y F son casos de prueba negativos válidos: (A) sin token → 401. (B) token válido pero usuario no existe → 404. (C) token expirado → 401. (E) token malformado → 401. D describe el happy path pero no es un caso de prueba "distinto". F es técnicamente válido como prueba avanzada pero no es el enfoque básico.',
  jsonb_build_object(
    'partial_credit', true,
    'points_per_correct', 1,
    'penalty_per_incorrect', 0.5
  ),
  '{}'::jsonb,
  5, 2
),

-- Q2.3 — short_text: Estrategia de partición de equivalencia para amount (5 pts)
(
  'c2030100-0000-4000-8000-000000000001',
  'b1000002-0000-4000-8000-000000000001',
  'short_text',
  'Usando la técnica de Partición de Equivalencia y Análisis de Valores Límite, identificá las clases de equivalencia para el campo `amount` en POST /transfers.',
  'El spec dice que amount debe ser un número positivo. La cuenta del usuario A tiene un saldo de 5,000,000 PYG.',
  '[]'::jsonb,
  null,
  '["clase", "equivalencia", "límite", "negativo", "cero", "positivo", "mayor", "saldo", "borde", "partición"]'::jsonb,
  'Clases: (1) Inválida: amount < 0 (negativo). (2) Inválida: amount = 0 (cero). (3) Válida: 1 <= amount < saldo. (4) Límite válido: amount = saldo (edge). (5) Inválida: amount > saldo. Valores límite clave: -1, 0, 1, saldo-1, saldo, saldo+1.',
  jsonb_build_object(
    'keyword_match', jsonb_build_object('weight', 0.5, 'min_keywords', 3),
    'concept_present', jsonb_build_object(
      'invalid_negative', jsonb_build_object('points', 1),
      'invalid_zero', jsonb_build_object('points', 1),
      'boundary_at_balance', jsonb_build_object('points', 2),
      'valid_range', jsonb_build_object('points', 1)
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 4, 'description', 'Identifica al menos 4 clases, incluye valores límite específicos (0, -1, saldo, saldo+1)'),
    'acceptable', jsonb_build_object('min_score', 3, 'description', 'Identifica negativo, cero, válido y saldo exacto'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'Menos de 2 clases o respuesta incorrecta')
  ),
  5, 3
),

-- ╔══════════════════════════════════════════╗
-- ║  SECCIÓN 3 — Detección de Bugs (25 pts) ║
-- ╚══════════════════════════════════════════╝

-- Q3.1 — response_analysis: IDOR en GET /accounts/{id} (7 pts)
(
  'c3010100-0000-4000-8000-000000000001',
  'b1000003-0000-4000-8000-000000000001',
  'response_analysis',
  'Autenticado como Usuario A (user.a@aiquaa.test), ejecutás: GET /api/challenge/accounts/acc_002. Observás la siguiente respuesta. ¿Qué bug se manifiesta?',
  'Respuesta recibida con HTTP 200 OK:
```json
{
  "id": "acc_002",
  "alias": "Ahorro mensual",
  "type": "savings",
  "currency": "PYG",
  "balance": 2500000,
  "ownerId": "usr_002"
}
```
La cuenta acc_002 pertenece a Usuario B.',
  '[]'::jsonb,
  null,
  '["IDOR", "autorización", "ownership", "propiedad", "403", "cuenta ajena", "broken", "access control", "otro usuario", "usr_002"]'::jsonb,
  'Bug #1: IDOR (Insecure Direct Object Reference) / Broken Object Level Authorization. El endpoint GET /accounts/{id} no verifica que la cuenta pertenezca al usuario autenticado. Usuario A puede leer datos de la cuenta de Usuario B usando su ID directo. Debería retornar HTTP 403 Forbidden.',
  jsonb_build_object(
    'keyword_match', jsonb_build_object('weight', 0.4, 'min_keywords', 2),
    'concept_present', jsonb_build_object(
      'bug_type_idor', jsonb_build_object('points', 3, 'keywords', array['idor','autorización','ownership','access control']),
      'expected_status_403', jsonb_build_object('points', 2, 'keywords', array['403','forbidden']),
      'impact_described', jsonb_build_object('points', 2, 'keywords', array['otro usuario','cuenta ajena','usr_002'])
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 6, 'description', 'Nombra IDOR o BOLA, dice que se espera 403, describe el impacto de acceder a datos de otro usuario'),
    'acceptable', jsonb_build_object('min_score', 4, 'description', 'Identifica que se puede acceder a cuenta ajena y que es un error de autorización'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'No identifica el problema de autorización')
  ),
  7, 1
),

-- Q3.2 — response_analysis: Monto cero y negativo (5 pts)
(
  'c3020100-0000-4000-8000-000000000001',
  'b1000003-0000-4000-8000-000000000001',
  'response_analysis',
  'Ejecutás dos llamadas a POST /transfers. En ambos casos la API responde HTTP 201. ¿Qué bugs hay en estos comportamientos?',
  'Llamada A:
```json
POST /api/challenge/transfers
{ "fromAccountId": "acc_001", "toAccountId": "acc_002", "amount": 0 }
→ HTTP 201 Created
```

Llamada B:
```json
POST /api/challenge/transfers
{ "fromAccountId": "acc_001", "toAccountId": "acc_002", "amount": -5000 }
→ HTTP 201 Created
```',
  '[]'::jsonb,
  null,
  '["monto", "amount", "cero", "negativo", "validación", "400", "422", "business rule", "regla de negocio", "zero", "negative"]'::jsonb,
  'Bug #2: amount=0 es aceptado sin error (debería ser HTTP 400). Bug #3: amount negativo es aceptado (debería ser HTTP 400 o 422). Ambos representan falta de validación de reglas de negocio básicas: una transferencia bancaria debe ser por un monto positivo mayor a cero.',
  jsonb_build_object(
    'concept_present', jsonb_build_object(
      'zero_amount_bug', jsonb_build_object('points', 2, 'keywords', array['cero','zero','0']),
      'negative_amount_bug', jsonb_build_object('points', 2, 'keywords', array['negativo','negative','-']),
      'expected_error_code', jsonb_build_object('points', 1, 'keywords', array['400','422','validación'])
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 5, 'description', 'Identifica ambos bugs, menciona los códigos de error esperados (400/422) y las reglas de negocio violadas'),
    'acceptable', jsonb_build_object('min_score', 3, 'description', 'Identifica ambos bugs como errores de validación'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'Identifica menos de un bug')
  ),
  5, 2
),

-- Q3.3 — response_analysis: Bug de status code incorrecto (5 pts)
(
  'c3030100-0000-4000-8000-000000000001',
  'b1000003-0000-4000-8000-000000000001',
  'response_analysis',
  'Ejecutás un POST /transfers con una cuenta de origen inexistente y la API responde lo siguiente. ¿Cuál es el problema?',
  'Request:
```json
POST /api/challenge/transfers
{ "fromAccountId": "acc_INVALIDO", "toAccountId": "acc_002", "amount": 1000 }
```

Response:
```json
HTTP 200 OK
{
  "success": false,
  "message": "Cuenta de origen no encontrada"
}
```',
  '[]'::jsonb,
  null,
  '["200", "status", "código", "error", "404", "400", "HTTP semantics", "REST", "incorrecto", "wrong status"]'::jsonb,
  'Bug #4: El endpoint retorna HTTP 200 OK para un escenario de error. En REST, un error de "recurso no encontrado" debe retornar 404 Not Found. Retornar 200 con un payload de error en el body rompe las convenciones HTTP y complica el manejo de errores en clientes (que deben leer el body en vez de chequear el status code).',
  jsonb_build_object(
    'concept_present', jsonb_build_object(
      'wrong_status_identified', jsonb_build_object('points', 2, 'keywords', array['200','status code','código']),
      'correct_status_mentioned', jsonb_build_object('points', 2, 'keywords', array['404','400']),
      'rest_convention', jsonb_build_object('points', 1, 'keywords', array['REST','HTTP','convención','semántica'])
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 4, 'description', 'Identifica HTTP 200 incorrecto, dice el código esperado (404) y menciona las convenciones REST'),
    'acceptable', jsonb_build_object('min_score', 3, 'description', 'Identifica que 200 es incorrecto para un error y menciona el código correcto'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'No identifica el problema con el status code')
  ),
  5, 3
),

-- Q3.4 — response_analysis: Dato sensible expuesto (5 pts)
(
  'c3040100-0000-4000-8000-000000000001',
  'b1000003-0000-4000-8000-000000000001',
  'response_analysis',
  'Ejecutás GET /api/challenge/users/me y obtenés la siguiente respuesta. ¿Identificás algún problema de seguridad?',
  'Response:
```json
HTTP 200 OK
{
  "id": "usr_001",
  "email": "user.a@aiquaa.test",
  "name": "Usuario A",
  "internalRiskScore": 42
}
```',
  '[]'::jsonb,
  null,
  '["internalRiskScore", "sensible", "sensitive", "internal", "expuesto", "OWASP", "data exposure", "riesgo", "score", "privado"]'::jsonb,
  'Bug #6: El campo `internalRiskScore` es un dato interno de la plataforma que no debe exponerse al usuario final en la API pública. Esto viola el principio de mínima exposición de datos (OWASP API Security Top 10 - API3: Excessive Data Exposure). Un score de riesgo interno puede ser usado para fingerprinting o inferir información sensible del negocio.',
  jsonb_build_object(
    'concept_present', jsonb_build_object(
      'field_identified', jsonb_build_object('points', 2, 'keywords', array['internalRiskScore','score','campo']),
      'sensitive_data_concept', jsonb_build_object('points', 2, 'keywords', array['sensible','sensitive','interno','internal','expuesto','privado']),
      'security_impact', jsonb_build_object('points', 1, 'keywords', array['OWASP','exposición','data','riesgo'])
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 4, 'description', 'Identifica el campo específico, lo clasifica como dato sensible/interno y describe el impacto de seguridad'),
    'acceptable', jsonb_build_object('min_score', 3, 'description', 'Identifica internalRiskScore como campo que no debería estar expuesto'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'No identifica el problema')
  ),
  5, 4
),

-- Q3.5 — multiple_choice: Cuántos bugs en el endpoint de transferencias (3 pts)
(
  'c3050100-0000-4000-8000-000000000001',
  'b1000003-0000-4000-8000-000000000001',
  'multiple_choice',
  '¿Cuántos bugs distintos tiene el endpoint POST /transfers en esta API?',
  'Explorá el endpoint con casos positivos y negativos para determinar la cantidad.',
  '[
    {"id": "a", "text": "2 bugs"},
    {"id": "b", "text": "4 bugs"},
    {"id": "c", "text": "6 bugs"},
    {"id": "d", "text": "8 bugs"}
  ]'::jsonb,
  '"c"'::jsonb,
  '[]'::jsonb,
  'POST /transfers tiene exactamente 6 bugs: (1) acepta amount=0, (2) acepta amount negativo, (3) retorna HTTP 200 en vez de 404 para cuenta inexistente, (4) bug de borde en balance check (<  en vez de <=), (5) acepta description > 120 chars sin error, (6) no implementa idempotencia (mismas peticiones crean duplicados).',
  jsonb_build_object('exact_match', true),
  '{}'::jsonb,
  3, 5
),

-- ╔══════════════════════════════════════════╗
-- ║  SECCIÓN 4 — Reporte de Bugs (20 pts)   ║
-- ╚══════════════════════════════════════════╝

-- Q4.1 — bug_report: Reporte formal del IDOR (12 pts)
(
  'c4010100-0000-4000-8000-000000000001',
  'b1000004-0000-4000-8000-000000000001',
  'bug_report',
  'Redactá un reporte formal del bug de autorización que encontraste en GET /accounts/{accountId}.',
  'El reporte debe incluir todos los campos requeridos: título descriptivo, entorno, precondiciones, pasos detallados para reproducir, resultado actual (con evidencia), resultado esperado, severidad, prioridad y sugerencia de fix.',
  '[]'::jsonb,
  null,
  '["IDOR", "autorización", "acc_002", "usr_001", "403", "ownership", "Bearer", "pasos", "reproducir", "severidad", "crítico", "evidencia"]'::jsonb,
  'Reporte esperado: Título: "IDOR en GET /accounts/{id} — acceso no autorizado a cuentas de otros usuarios". Steps: 1) Login como user.a → token. 2) GET /accounts/acc_002 con token de user.a. Actual: 200 con datos de acc_002. Expected: 403 Forbidden. Severity: Critical. Priority: Critical. Fix: Agregar verificación `account.ownerId === req.user.id` antes de retornar.',
  jsonb_build_object(
    'field_completeness', jsonb_build_object(
      'weight', 0.4,
      'fields', jsonb_build_object(
        'title', jsonb_build_object('points', 1, 'required', true),
        'steps_to_reproduce', jsonb_build_object('points', 2, 'required', true),
        'actual_result', jsonb_build_object('points', 1, 'required', true),
        'expected_result', jsonb_build_object('points', 1, 'required', true),
        'severity', jsonb_build_object('points', 1, 'required', true),
        'priority', jsonb_build_object('points', 1, 'required', true),
        'evidence', jsonb_build_object('points', 2, 'required', false)
      )
    ),
    'quality', jsonb_build_object(
      'weight', 0.6,
      'criteria', jsonb_build_object(
        'reproducible_steps', jsonb_build_object('points', 3, 'description', 'Los pasos permiten reproducir el bug sin ambigüedad'),
        'correct_severity', jsonb_build_object('points', 2, 'description', 'Severity Critical o High es correcto para IDOR en datos financieros'),
        'fix_suggested', jsonb_build_object('points', 2, 'description', 'Sugiere una solución técnica concreta'),
        'uses_real_ids', jsonb_build_object('points', 1, 'description', 'Usa acc_002 y credenciales reales en los pasos')
      )
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 10, 'description', 'Todos los campos completos, pasos reproducibles con IDs reales, severidad Critical, evidencia incluida (request/response), sugiere fix'),
    'acceptable', jsonb_build_object('min_score', 7, 'description', 'Campos principales completos, pasos claros, severidad correcta'),
    'basic', jsonb_build_object('min_score', 4, 'description', 'Al menos título, pasos y resultado actual/esperado presentes'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'Faltan campos críticos o los pasos no son reproducibles')
  ),
  12, 1
),

-- Q4.2 — bug_report: Reporte del dato sensible (8 pts)
(
  'c4020100-0000-4000-8000-000000000001',
  'b1000004-0000-4000-8000-000000000001',
  'bug_report',
  'Redactá un reporte formal del bug de exposición de datos sensibles que encontraste en GET /users/me.',
  'Incluí el campo específico expuesto, el impacto de seguridad y la recomendación de fix.',
  '[]'::jsonb,
  null,
  '["internalRiskScore", "sensible", "exposed", "OWASP", "API3", "remover", "filtrar", "response", "campo", "severidad"]'::jsonb,
  'Reporte esperado: Título: "GET /users/me expone campo interno internalRiskScore". Actual: response incluye internalRiskScore: 42. Expected: campo no debe aparecer en respuestas públicas. Severity: High. Fix: Remover internalRiskScore del DTO/serializer de respuesta.',
  jsonb_build_object(
    'field_completeness', jsonb_build_object(
      'weight', 0.3,
      'fields', jsonb_build_object(
        'title', jsonb_build_object('points', 1),
        'actual_result', jsonb_build_object('points', 1),
        'expected_result', jsonb_build_object('points', 1),
        'severity', jsonb_build_object('points', 1)
      )
    ),
    'quality', jsonb_build_object(
      'weight', 0.7,
      'criteria', jsonb_build_object(
        'field_named', jsonb_build_object('points', 2, 'description', 'Nombra explícitamente internalRiskScore'),
        'security_classification', jsonb_build_object('points', 2, 'description', 'Clasifica como dato sensible/interno'),
        'fix_recommended', jsonb_build_object('points', 2, 'description', 'Recomienda remover/filtrar el campo')
      )
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 7, 'description', 'Nombre el campo exacto, clasifica el bug de seguridad correctamente, propone fix específico, severidad High o Critical'),
    'acceptable', jsonb_build_object('min_score', 5, 'description', 'Campo identificado, severidad correcta, fix mencionado'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'Campo no identificado o reporte muy vago')
  ),
  8, 2
),

-- ╔═══════════════════════════════════════════════╗
-- ║  SECCIÓN 5 — Seguridad y Resumen (15 pts)    ║
-- ╚═══════════════════════════════════════════════╝

-- Q5.1 — multiple_choice: Clasificación OWASP del IDOR (4 pts)
(
  'c5010100-0000-4000-8000-000000000001',
  'b1000005-0000-4000-8000-000000000001',
  'multiple_choice',
  '¿Bajo qué categoría del OWASP API Security Top 10 2023 clasifica el bug de acceso no autorizado a GET /accounts/{id}?',
  null,
  '[
    {"id": "a", "text": "API1: Broken Object Level Authorization (BOLA)"},
    {"id": "b", "text": "API2: Broken Authentication"},
    {"id": "c", "text": "API3: Broken Object Property Level Authorization"},
    {"id": "d", "text": "API5: Broken Function Level Authorization"}
  ]'::jsonb,
  '"a"'::jsonb,
  '[]'::jsonb,
  'API1: BOLA (anteriormente IDOR) ocurre cuando una API permite acceder a objetos usando IDs directamente sin verificar que el usuario tiene autorización sobre ese objeto específico. Es el bug más común en APIs REST.',
  jsonb_build_object('exact_match', true),
  '{}'::jsonb,
  4, 1
),

-- Q5.2 — short_text: Bug de token expirado (5 pts)
(
  'c5020100-0000-4000-8000-000000000001',
  'b1000005-0000-4000-8000-000000000001',
  'short_text',
  'Al probar GET /users/me con un token JWT expirado, la API responde HTTP 200 OK con el perfil del usuario. Describí el bug, su impacto y la corrección recomendada.',
  'Podés generar un token expirado manipulando los timestamps o esperar a que el token emitido expire.',
  '[]'::jsonb,
  null,
  '["expirado", "expired", "exp", "claim", "validación", "sesión", "revocación", "401", "impacto", "corrección", "verificar"]'::jsonb,
  'Bug #10: El endpoint GET /users/me no valida la expiración del token (claim `exp`). Esto significa que tokens robados o viejos siguen siendo válidos indefinidamente. Impacto: si un token es comprometido, el atacante mantiene acceso permanente. Corrección: verificar el claim `exp` en el middleware de autenticación y retornar 401 si expiró.',
  jsonb_build_object(
    'concept_present', jsonb_build_object(
      'expiry_not_checked', jsonb_build_object('points', 2, 'keywords', array['expirado','expired','exp','vencido']),
      'impact_security', jsonb_build_object('points', 1, 'keywords', array['robado','comprometido','indefinido','permanente']),
      'correct_fix', jsonb_build_object('points', 2, 'keywords', array['verificar','validar','401','exp claim','middleware'])
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 4, 'description', 'Identifica que exp no se verifica, explica el impacto de seguridad y propone validación en middleware con 401'),
    'acceptable', jsonb_build_object('min_score', 3, 'description', 'Identifica el bug y menciona que el token debería ser rechazado'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'No identifica el problema de validación de expiración')
  ),
  5, 2
),

-- Q5.3 — short_text: Resumen ejecutivo (6 pts)
(
  'c5030100-0000-4000-8000-000000000001',
  'b1000005-0000-4000-8000-000000000001',
  'short_text',
  'Redactá un resumen ejecutivo de tu evaluación de la API de Banca Digital. Dirigido a un CTO que no tiene contexto técnico profundo pero necesita entender los riesgos antes del lanzamiento.',
  'Incluí: cantidad de bugs encontrados, categorías de riesgo, el hallazgo más crítico y tu recomendación sobre si la API está lista para producción.',
  '[]'::jsonb,
  null,
  '["crítico", "seguridad", "IDOR", "validación", "riesgo", "producción", "lanzamiento", "recomendación", "datos", "financiero", "usuario"]'::jsonb,
  'Resumen esperado: Mención de bugs de seguridad críticos (IDOR, datos sensibles, token expirado), bugs de validación (monto cero/negativo, status codes incorrectos), discrepancia de contrato OpenAPI. Recomendación clara: no está lista para producción. Al menos 3 bugs críticos/high deben corregirse antes del lanzamiento.',
  jsonb_build_object(
    'quality_heuristic', jsonb_build_object(
      'min_length', 150,
      'max_length', 1000
    ),
    'concept_present', jsonb_build_object(
      'critical_bugs_mentioned', jsonb_build_object('points', 2, 'keywords', array['crítico','crítica','IDOR','seguridad','autorización']),
      'recommendation_given', jsonb_build_object('points', 2, 'keywords', array['producción','lanzamiento','recomiendo','no está lista','corregir']),
      'non_technical_language', jsonb_build_object('points', 1, 'description', 'Lenguaje accesible para ejecutivos'),
      'risk_quantified', jsonb_build_object('points', 1, 'keywords', array['crítico','alto','riesgo','bugs','vulnerabilidades'])
    )
  ),
  jsonb_build_object(
    'excellent', jsonb_build_object('min_score', 5, 'description', 'Lenguaje ejecutivo, menciona hallazgos críticos por impacto de negocio, da recomendación clara (no producción), cuantifica riesgos'),
    'acceptable', jsonb_build_object('min_score', 3, 'description', 'Menciona los bugs principales y da una recomendación sobre el lanzamiento'),
    'insufficient', jsonb_build_object('min_score', 0, 'description', 'Muy técnico sin síntesis, o no da recomendación')
  ),
  6, 3
)

on conflict (section_id, order_index) do update set
  prompt            = excluded.prompt,
  description       = excluded.description,
  options           = excluded.options,
  correct_answer    = excluded.correct_answer,
  expected_keywords = excluded.expected_keywords,
  explanation       = excluded.explanation,
  scoring_rules     = excluded.scoring_rules,
  rubric            = excluded.rubric,
  points            = excluded.points;

-- ─── VERIFICACIÓN ───────────────────────────────────────────
-- Correr esto para confirmar que el seed quedó correcto:
-- select a.slug, count(distinct s.id) as sections, count(q.id) as questions, sum(q.points) as total_pts
-- from public.assessments a
-- join public.assessment_sections s on s.assessment_id = a.id
-- join public.assessment_questions q on q.section_id = s.id
-- where a.slug = 'api-banking'
-- group by a.slug;
-- Resultado esperado: sections=5, questions=14, total_pts=100
