-- Habilita el assessment de infraestructura (Docker + Kubernetes) en el
-- ecosistema de resultados/ranking:
-- 1. Amplía el CHECK de exam_results.exam_type con infrastructure-fundamentals
--    (sin esto los inserts fallan en silencio).
-- 2. Reglas XP para el assessment (espejo de database-fundamentals).

-- 1. exam_results.exam_type
ALTER TABLE public.exam_results
  DROP CONSTRAINT IF EXISTS exam_results_exam_type_check;

ALTER TABLE public.exam_results
  ADD CONSTRAINT exam_results_exam_type_check
  CHECK (
    exam_type = ANY (
      ARRAY[
        'git'::text,
        'git-practico'::text,
        'istqb'::text,
        'performance'::text,
        'test-app'::text,
        'api-testing-fundamentals'::text,
        'api-banking'::text,
        'database-fundamentals'::text,
        'database-practice'::text,
        'infrastructure-fundamentals'::text
      ]
    )
  );

-- 2. Reglas XP para el assessment de infraestructura
INSERT INTO public.xp_rules (event_type, xp_amount, description, daily_limit, is_active)
VALUES
  ('INFRASTRUCTURE_FUNDAMENTALS_COMPLETED', 70, 'Completar el assessment Infrastructure Fundamentals', 3, true),
  ('INFRASTRUCTURE_FUNDAMENTALS_PASSED', 120, 'Aprobar el assessment Infrastructure Fundamentals (score >= 70)', 3, true),
  ('INFRASTRUCTURE_FUNDAMENTALS_HIGH_SCORE', 160, 'Score sobresaliente en Infrastructure Fundamentals (>= 90)', 3, true)
ON CONFLICT (event_type) DO UPDATE SET
  xp_amount = EXCLUDED.xp_amount,
  description = EXCLUDED.description,
  daily_limit = EXCLUDED.daily_limit,
  is_active = EXCLUDED.is_active,
  updated_at = now();
