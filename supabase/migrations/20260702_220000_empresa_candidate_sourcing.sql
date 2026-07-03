-- ============================================================
-- EMP-001: B2B candidate sourcing without exposing candidate email
-- ============================================================
-- NOTE: this migration was never actually applied to prod (missing from
-- supabase_migrations.schema_migrations), which is why /empresa/buscar-candidatos
-- failed with "Could not find the function public.get_empresa_candidate_sourcing".
-- The original version also referenced profiles.full_name and profiles.country,
-- neither of which exists in this schema (country is added below; full_name
-- was dropped from the name fallback). Fixed in place since it had never run.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_availability') THEN
    CREATE TYPE candidate_availability AS ENUM ('activo', 'pasivo', 'no_disponible');
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS disponibilidad candidate_availability NOT NULL DEFAULT 'no_disponible',
  ADD COLUMN IF NOT EXISTS qa_skills TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'PY';

UPDATE public.profiles
SET disponibilidad = CASE
  WHEN open_to_work IS TRUE THEN 'activo'::candidate_availability
  WHEN talent_visible_to_empresas IS TRUE THEN 'pasivo'::candidate_availability
  ELSE 'no_disponible'::candidate_availability
END
WHERE disponibilidad = 'no_disponible'::candidate_availability
  AND (open_to_work IS TRUE OR talent_visible_to_empresas IS TRUE);

CREATE INDEX IF NOT EXISTS profiles_candidate_sourcing_idx
  ON public.profiles (audience, talent_visible_to_empresas, disponibilidad, istqb_level, country);

CREATE INDEX IF NOT EXISTS profiles_qa_skills_gin_idx
  ON public.profiles USING gin (qa_skills);

ALTER TABLE public.empresa_invitaciones
  ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS empresa_invitaciones_candidate_idx
  ON public.empresa_invitaciones (empresa_id, candidate_id)
  WHERE candidate_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_empresa_candidate_sourcing()
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  role TEXT,
  country TEXT,
  istqb_level TEXT,
  github_profile TEXT,
  qa_skills TEXT[],
  disponibilidad candidate_availability,
  best_score NUMERIC,
  best_exam_type TEXT,
  passed_assessments BIGINT,
  total_assessments BIGINT,
  last_activity_at TIMESTAMPTZ,
  favorite_id UUID,
  favorite_created_at TIMESTAMPTZ,
  favorite_notes TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  WITH caller AS (
    SELECT p.empresa_id
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.empresa_id IS NOT NULL
      AND public.is_active_empresa_member(p.empresa_id)
    LIMIT 1
  ),
  visible_profiles AS (
    SELECT
      p.id,
      COALESCE(NULLIF(TRIM(p.display_name), ''), 'Candidato QA') AS name,
      p.role,
      p.country,
      p.istqb_level,
      p.github_profile,
      COALESCE(p.qa_skills, '{}'::TEXT[]) AS qa_skills,
      p.disponibilidad
    FROM public.profiles p
    WHERE EXISTS (SELECT 1 FROM caller)
      AND p.audience = 'candidato'
      AND p.talent_visible_to_empresas IS TRUE
  ),
  legacy_results AS (
    SELECT
      er.user_id,
      er.exam_type,
      er.percentage::NUMERIC AS percentage,
      er.passed,
      er.created_at
    FROM public.exam_results er
    WHERE er.user_id IS NOT NULL
      AND er.percentage <= 100
  ),
  assessment_results AS (
    SELECT
      aa.user_id,
      a.slug AS exam_type,
      aa.percentage::NUMERIC AS percentage,
      aa.passed,
      COALESCE(aa.submitted_at, aa.created_at) AS created_at
    FROM public.assessment_attempts aa
    JOIN public.assessments a ON a.id = aa.assessment_id
    WHERE aa.user_id IS NOT NULL
      AND aa.status = 'graded'
      AND aa.percentage <= 100
  ),
  combined_results AS (
    SELECT * FROM legacy_results
    UNION ALL
    SELECT * FROM assessment_results
  ),
  ranked_results AS (
    SELECT
      cr.*,
      ROW_NUMBER() OVER (
        PARTITION BY cr.user_id
        ORDER BY cr.percentage DESC, cr.created_at DESC
      ) AS rn
    FROM combined_results cr
  ),
  result_summary AS (
    SELECT
      cr.user_id,
      COUNT(*) AS total_assessments,
      COUNT(*) FILTER (WHERE cr.passed) AS passed_assessments,
      MAX(cr.created_at) AS last_activity_at
    FROM combined_results cr
    GROUP BY cr.user_id
  )
  SELECT
    vp.id AS user_id,
    vp.name,
    vp.role,
    vp.country,
    vp.istqb_level,
    vp.github_profile,
    vp.qa_skills,
    vp.disponibilidad,
    COALESCE(rr.percentage, 0) AS best_score,
    COALESCE(rr.exam_type, 'sin_evaluacion') AS best_exam_type,
    COALESCE(rs.passed_assessments, 0) AS passed_assessments,
    COALESCE(rs.total_assessments, 0) AS total_assessments,
    COALESCE(rs.last_activity_at, now()) AS last_activity_at,
    ef.id AS favorite_id,
    ef.created_at AS favorite_created_at,
    ef.notes AS favorite_notes
  FROM visible_profiles vp
  LEFT JOIN ranked_results rr ON rr.user_id = vp.id AND rr.rn = 1
  LEFT JOIN result_summary rs ON rs.user_id = vp.id
  LEFT JOIN caller c ON true
  LEFT JOIN public.empresa_favoritos ef
    ON ef.candidate_id = vp.id
   AND ef.empresa_id = c.empresa_id
  ORDER BY
    CASE vp.disponibilidad
      WHEN 'activo' THEN 0
      WHEN 'pasivo' THEN 1
      ELSE 2
    END,
    COALESCE(rr.percentage, 0) DESC,
    COALESCE(rs.last_activity_at, now()) DESC;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_empresa_candidate_sourcing() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_empresa_candidate_sourcing() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_empresa_candidate_sourcing() TO authenticated;
