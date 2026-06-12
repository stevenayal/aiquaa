-- Habilita los exámenes de API en el ecosistema de resultados/ranking/empresa:
-- 1. Amplía el CHECK de exam_results.exam_type (hoy solo permite git/istqb/performance,
--    por lo que los inserts de api-testing-fundamentals fallaban en silencio).
-- 2. Agrega process_code a qac_attempts para rendir API Banking con código de empresa.
-- 3. Reglas XP para API Banking Challenge (espejo de api-testing-fundamentals).

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
        'api-banking'::text
      ]
    )
  );

-- 2. qac_attempts.process_code
ALTER TABLE public.qac_attempts
  ADD COLUMN IF NOT EXISTS process_code TEXT
    REFERENCES public.hiring_processes(code) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_qac_attempts_process_code
  ON public.qac_attempts (process_code)
  WHERE process_code IS NOT NULL;

-- 3. Reglas XP para API Banking
INSERT INTO public.xp_rules (event_type, xp_amount, description, daily_limit, is_active)
VALUES
  ('API_BANKING_COMPLETED', 70, 'Completar el API Banking Challenge', 3, true),
  ('API_BANKING_PASSED', 120, 'Aprobar el API Banking Challenge (score >= 60)', 3, true),
  ('API_BANKING_HIGH_SCORE', 160, 'Score sobresaliente en API Banking Challenge (>= 90)', 3, true)
ON CONFLICT (event_type) DO UPDATE SET
  xp_amount = EXCLUDED.xp_amount,
  description = EXCLUDED.description,
  daily_limit = EXCLUDED.daily_limit,
  is_active = EXCLUDED.is_active,
  updated_at = now();
