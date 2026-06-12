-- Habilita los assessments de base de datos en el ecosistema de resultados/ranking:
-- 1. Amplía el CHECK de exam_results.exam_type con database-fundamentals y
--    database-practice (sin esto los inserts fallan en silencio).
-- 2. Reglas XP para ambos assessments (espejo de api-testing-fundamentals).

-- 1. exam_results.exam_type
ALTER TABLE public.exam_results
  DROP CONSTRAINT IF EXISTS exam_results_exam_type_check;

ALTER TABLE public.exam_results
  ADD CONSTRAINT exam_results_exam_type_check
  CHECK (
    exam_type = ANY (
      ARRAY[
        'git'::text,
        'istqb'::text,
        'performance'::text,
        'test-app'::text,
        'api-testing-fundamentals'::text,
        'api-banking'::text,
        'database-fundamentals'::text,
        'database-practice'::text
      ]
    )
  );

-- 2. Reglas XP para los assessments de base de datos
INSERT INTO public.xp_rules (event_type, xp_amount, description, daily_limit, is_active)
VALUES
  ('DATABASE_FUNDAMENTALS_COMPLETED', 70, 'Completar el assessment Database Fundamentals', 3, true),
  ('DATABASE_FUNDAMENTALS_PASSED', 120, 'Aprobar el assessment Database Fundamentals (score >= 60)', 3, true),
  ('DATABASE_FUNDAMENTALS_HIGH_SCORE', 160, 'Score sobresaliente en Database Fundamentals (>= 90)', 3, true),
  ('DATABASE_PRACTICE_COMPLETED', 70, 'Completar el assessment Database Practice', 3, true),
  ('DATABASE_PRACTICE_PASSED', 120, 'Aprobar el assessment Database Practice (score >= 60)', 3, true),
  ('DATABASE_PRACTICE_HIGH_SCORE', 160, 'Score sobresaliente en Database Practice (>= 90)', 3, true)
ON CONFLICT (event_type) DO UPDATE SET
  xp_amount = EXCLUDED.xp_amount,
  description = EXCLUDED.description,
  daily_limit = EXCLUDED.daily_limit,
  is_active = EXCLUDED.is_active,
  updated_at = now();
