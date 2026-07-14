-- Prueba técnica práctica de Playwright (lab `playwright-practico`):
-- amplía el CHECK de exam_results.exam_type con `playwright-practico`
-- (sin esto los inserts fallan en silencio).

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
        'infrastructure-fundamentals'::text,
        'api-developer-fundamentals'::text,
        'playwright-practico'::text
      ]
    )
  );
