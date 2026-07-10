-- Fix reported bugs/security without changing ranking/top SQL.
-- This migration intentionally does not alter get_leaderboard, get_xp_ranking,
-- ranking_candidatos, ordering, scoring, or leaderboard filters.

-- Private bucket for test-app evidence. The app uploads authenticated users'
-- screenshots here and stores only object references in exam_results.metadata.
INSERT INTO storage.buckets (id, name, public)
VALUES ('test-app-evidence', 'test-app-evidence', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "test_app_evidence_upload_own" ON storage.objects;
CREATE POLICY "test_app_evidence_upload_own"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'test-app-evidence'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "test_app_evidence_update_own" ON storage.objects;
CREATE POLICY "test_app_evidence_update_own"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'test-app-evidence'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'test-app-evidence'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "test_app_evidence_read_own" ON storage.objects;
CREATE POLICY "test_app_evidence_read_own"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'test-app-evidence'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Backfill only historical infrastructure-fundamentals attempts that failed to
-- sync before the CHECK constraint was fixed. Do not call gamification/XP.
INSERT INTO public.exam_results (
  user_id,
  exam_type,
  exam_mode,
  score,
  total_questions,
  max_possible_score,
  correct_answers,
  incorrect_answers,
  passing_score,
  passed,
  percentage,
  time_spent,
  section_scores,
  metadata,
  created_at
)
SELECT
  aa.user_id,
  'infrastructure-fundamentals',
  'exam',
  COALESCE(aa.total_score, 0),
  COALESCE(answer_counts.total_answers, 0),
  aa.max_score,
  COALESCE(answer_counts.correct_answers, 0),
  GREATEST(0, COALESCE(answer_counts.total_answers, 0) - COALESCE(answer_counts.correct_answers, 0)),
  COALESCE((a.metadata->>'passingScore')::integer, 70),
  COALESCE(aa.passed, false),
  COALESCE(aa.percentage, 0),
  GREATEST(60, COALESCE(EXTRACT(EPOCH FROM (COALESCE(aa.submitted_at, aa.updated_at) - aa.started_at))::integer, 60)),
  COALESCE(section_scores.rows, '[]'::jsonb),
  jsonb_build_object(
    'assessment_attempt_id', aa.id,
    'backfilled', true,
    'backfilled_at', now(),
    'source', '20260710_000000_fix_reported_bugs_security_guardrails'
  ),
  COALESCE(aa.submitted_at, aa.updated_at, aa.created_at)
FROM public.assessment_attempts aa
JOIN public.assessments a ON a.id = aa.assessment_id
LEFT JOIN LATERAL (
  SELECT
    COUNT(*)::integer AS total_answers,
    COUNT(*) FILTER (WHERE ans.is_correct IS TRUE)::integer AS correct_answers
  FROM public.assessment_answers ans
  WHERE ans.attempt_id = aa.id
) answer_counts ON true
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
    jsonb_build_object(
      'section', s.title,
      'correct', sc.score,
      'total', sc.max_score,
      'percentage', ROUND((sc.score::numeric / GREATEST(1, sc.max_score)) * 100)
    )
    ORDER BY s.order_index
  ) AS rows
  FROM public.assessment_scores sc
  JOIN public.assessment_sections s ON s.id = sc.section_id
  WHERE sc.attempt_id = aa.id
) section_scores ON true
WHERE a.slug = 'infrastructure-fundamentals'
  AND aa.status = 'graded'
  AND NOT EXISTS (
    SELECT 1
    FROM public.exam_results er
    WHERE er.exam_type = 'infrastructure-fundamentals'
      AND er.metadata->>'assessment_attempt_id' = aa.id::text
  );

-- RLS initplan cleanup for known hot policies. Equivalent behavior, but
-- auth.uid() is evaluated once. Ranking RPCs/views are not modified.
DO $$
BEGIN
  IF to_regclass('public.user_xp') IS NOT NULL THEN
    DROP POLICY IF EXISTS "user_xp_select_own" ON public.user_xp;
    CREATE POLICY "user_xp_select_own" ON public.user_xp
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.profiles') IS NOT NULL THEN
    DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
    CREATE POLICY "profiles_select_own" ON public.profiles
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = id);
  END IF;

  IF to_regclass('public.empresa_invitaciones') IS NOT NULL THEN
    DROP POLICY IF EXISTS "empresa_invitaciones_member_read" ON public.empresa_invitaciones;
    CREATE POLICY "empresa_invitaciones_member_read"
      ON public.empresa_invitaciones FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresa_miembros em
          WHERE em.empresa_id = empresa_invitaciones.empresa_id
            AND em.user_id = (SELECT auth.uid())
            AND em.status = 'active'
        )
      );
  END IF;
END $$;
