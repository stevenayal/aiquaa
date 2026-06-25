-- Prueba técnica práctica de GitHub (lab `git-practico`):
-- 1. Agrega `repository_url` a hiring_processes — la empresa define el repo destino
--    al crear el proceso (default a nivel app: bootcamp_ctl_2026).
-- 2. Amplía el CHECK de exam_results.exam_type con `git-practico` (sin esto los
--    inserts del resultado fallan en silencio).

-- 1. hiring_processes.repository_url
ALTER TABLE public.hiring_processes
  ADD COLUMN IF NOT EXISTS repository_url TEXT;

-- 2. exam_results.exam_type
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
        'database-practice'::text
      ]
    )
  );
