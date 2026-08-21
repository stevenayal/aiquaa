-- Habilita las 10 pruebas técnicas nuevas del bootcamp:
--   * 5 evaluaciones teóricas (una por clase), auto-corregidas.
--   * 5 pruebas de desarrollo con entrega por link de repositorio y
--     corrección manual del evaluador.
--
-- Incluye además dos correcciones de arrastre:
--   1. El nuevo tipo de pregunta `multiple_select` (las evaluaciones traen una
--      pregunta de varias respuestas cada una).
--   2. Los 5 assessments del PR #306 (api-dotnet, docker, kubernetes-helm,
--      observability, cicd) nunca se agregaron al CHECK de
--      exam_results.exam_type, así que sus inserts venían fallando en silencio
--      (actions/assessments.ts sólo loguea un warning). Se re-declara el CHECK
--      con el array completo.

-- 1. assessment_questions.question_type — agrega 'multiple_select'
ALTER TABLE public.assessment_questions
  DROP CONSTRAINT IF EXISTS assessment_questions_question_type_check;

ALTER TABLE public.assessment_questions
  ADD CONSTRAINT assessment_questions_question_type_check
  CHECK (
    question_type IN (
      'multiple_choice',
      'multiple_select',
      'true_false',
      'short_text',
      'doc_analysis',
      'test_case_matrix',
      'response_analysis',
      'bug_report'
    )
  );

-- 2. exam_results.exam_type — array completo (existentes + faltantes + nuevos)
ALTER TABLE public.exam_results
  DROP CONSTRAINT IF EXISTS exam_results_exam_type_check;

ALTER TABLE public.exam_results
  ADD CONSTRAINT exam_results_exam_type_check
  CHECK (
    exam_type = ANY (
      ARRAY[
        -- Labs y exámenes legacy
        'git'::text,
        'git-practico'::text,
        'istqb'::text,
        'performance'::text,
        'test-app'::text,
        'playwright-practico'::text,
        -- Assessments existentes
        'api-testing-fundamentals'::text,
        'api-banking'::text,
        'database-fundamentals'::text,
        'database-practice'::text,
        'infrastructure-fundamentals'::text,
        'api-developer-fundamentals'::text,
        'playwright-fundamentals'::text,
        'gherkin-fundamentals'::text,
        -- Assessments del PR #306 que faltaban en el CHECK
        'api-dotnet-fundamentals'::text,
        'docker-fundamentals'::text,
        'kubernetes-helm-fundamentals'::text,
        'observability-fundamentals'::text,
        'cicd-fundamentals'::text,
        -- Evaluaciones teóricas del bootcamp (una por clase)
        'clase3-data-persistencia'::text,
        'clase5-kubernetes'::text,
        'clase6-config-kubernetes'::text,
        'clase7-8-seq-logging'::text,
        'clase9-cicd-github-actions'::text,
        -- Pruebas de desarrollo (entrega por repositorio, corrección manual)
        'dev-persistencia'::text,
        'dev-kubernetes'::text,
        'dev-config-kubernetes'::text,
        'dev-seq-logging'::text,
        'dev-cicd-actions'::text
      ]
    )
  );

-- 3. Reglas XP de las 5 evaluaciones teóricas.
-- Las pruebas de desarrollo no otorgan XP: su puntaje lo carga una persona.
INSERT INTO public.xp_rules (event_type, xp_amount, description, daily_limit, is_active)
VALUES
  ('CLASE3_DATA_PERSISTENCIA_COMPLETED',  70,  'Completar la evaluación Clase 3 Data Persistencia', 3, true),
  ('CLASE3_DATA_PERSISTENCIA_PASSED',     120, 'Aprobar la evaluación Clase 3 Data Persistencia (score >= 70)', 3, true),
  ('CLASE3_DATA_PERSISTENCIA_HIGH_SCORE', 160, 'Score sobresaliente en Clase 3 Data Persistencia (>= 90)', 3, true),

  ('CLASE5_KUBERNETES_COMPLETED',  70,  'Completar la evaluación Clase 5 Kubernetes', 3, true),
  ('CLASE5_KUBERNETES_PASSED',     120, 'Aprobar la evaluación Clase 5 Kubernetes (score >= 70)', 3, true),
  ('CLASE5_KUBERNETES_HIGH_SCORE', 160, 'Score sobresaliente en Clase 5 Kubernetes (>= 90)', 3, true),

  ('CLASE6_CONFIG_KUBERNETES_COMPLETED',  70,  'Completar la evaluación Clase 6 Configuración en Kubernetes', 3, true),
  ('CLASE6_CONFIG_KUBERNETES_PASSED',     120, 'Aprobar la evaluación Clase 6 Configuración en Kubernetes (score >= 70)', 3, true),
  ('CLASE6_CONFIG_KUBERNETES_HIGH_SCORE', 160, 'Score sobresaliente en Clase 6 Configuración en Kubernetes (>= 90)', 3, true),

  ('CLASE7_8_SEQ_LOGGING_COMPLETED',  70,  'Completar la evaluación Clases 7 y 8 SEQ Structured Logging', 3, true),
  ('CLASE7_8_SEQ_LOGGING_PASSED',     120, 'Aprobar la evaluación Clases 7 y 8 SEQ Structured Logging (score >= 70)', 3, true),
  ('CLASE7_8_SEQ_LOGGING_HIGH_SCORE', 160, 'Score sobresaliente en Clases 7 y 8 SEQ Structured Logging (>= 90)', 3, true),

  ('CLASE9_CICD_GITHUB_ACTIONS_COMPLETED',  70,  'Completar la evaluación Clase 9 CI/CD con GitHub Actions', 3, true),
  ('CLASE9_CICD_GITHUB_ACTIONS_PASSED',     120, 'Aprobar la evaluación Clase 9 CI/CD con GitHub Actions (score >= 70)', 3, true),
  ('CLASE9_CICD_GITHUB_ACTIONS_HIGH_SCORE', 160, 'Score sobresaliente en Clase 9 CI/CD con GitHub Actions (>= 90)', 3, true),

  -- Assessments del PR #306, que tampoco tuvieron migración de xp_rules
  ('API_DOTNET_FUNDAMENTALS_COMPLETED',  70,  'Completar el assessment API .NET Fundamentals', 3, true),
  ('API_DOTNET_FUNDAMENTALS_PASSED',     120, 'Aprobar el assessment API .NET Fundamentals (score >= 70)', 3, true),
  ('API_DOTNET_FUNDAMENTALS_HIGH_SCORE', 160, 'Score sobresaliente en API .NET Fundamentals (>= 90)', 3, true),

  ('DOCKER_FUNDAMENTALS_COMPLETED',  70,  'Completar el assessment Docker Fundamentals', 3, true),
  ('DOCKER_FUNDAMENTALS_PASSED',     120, 'Aprobar el assessment Docker Fundamentals (score >= 70)', 3, true),
  ('DOCKER_FUNDAMENTALS_HIGH_SCORE', 160, 'Score sobresaliente en Docker Fundamentals (>= 90)', 3, true),

  ('KUBERNETES_HELM_FUNDAMENTALS_COMPLETED',  70,  'Completar el assessment Kubernetes + Helm Fundamentals', 3, true),
  ('KUBERNETES_HELM_FUNDAMENTALS_PASSED',     120, 'Aprobar el assessment Kubernetes + Helm Fundamentals (score >= 70)', 3, true),
  ('KUBERNETES_HELM_FUNDAMENTALS_HIGH_SCORE', 160, 'Score sobresaliente en Kubernetes + Helm Fundamentals (>= 90)', 3, true),

  ('OBSERVABILITY_FUNDAMENTALS_COMPLETED',  70,  'Completar el assessment Observability Fundamentals', 3, true),
  ('OBSERVABILITY_FUNDAMENTALS_PASSED',     120, 'Aprobar el assessment Observability Fundamentals (score >= 70)', 3, true),
  ('OBSERVABILITY_FUNDAMENTALS_HIGH_SCORE', 160, 'Score sobresaliente en Observability Fundamentals (>= 90)', 3, true),

  ('CICD_FUNDAMENTALS_COMPLETED',  70,  'Completar el assessment CI/CD Fundamentals', 3, true),
  ('CICD_FUNDAMENTALS_PASSED',     120, 'Aprobar el assessment CI/CD Fundamentals (score >= 70)', 3, true),
  ('CICD_FUNDAMENTALS_HIGH_SCORE', 160, 'Score sobresaliente en CI/CD Fundamentals (>= 90)', 3, true)
ON CONFLICT (event_type) DO UPDATE SET
  xp_amount   = EXCLUDED.xp_amount,
  description = EXCLUDED.description,
  daily_limit = EXCLUDED.daily_limit,
  is_active   = EXCLUDED.is_active,
  updated_at  = now();
