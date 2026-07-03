-- 20260703_030000_empresa_read_process_candidate_profiles.sql added a
-- profiles SELECT policy that queries hiring_processes directly. Because
-- hiring_processes is itself RLS-protected, any query that embeds/joins
-- profiles with hiring_processes (e.g. loading the "Procesos" list) makes
-- Postgres evaluate the profiles policy, which re-queries hiring_processes,
-- which re-triggers its own policy evaluation in the same plan — Postgres
-- detects this as "infinite recursion detected in policy for relation
-- hiring_processes".
--
-- Fix: move the hiring_processes/assessment_attempts/exam_results lookups
-- into a SECURITY DEFINER helper (same pattern as is_active_empresa_member /
-- current_user_is_empresa), which runs with the function owner's privileges
-- and bypasses RLS on the tables it queries, breaking the cycle.

DROP POLICY IF EXISTS "profiles_select_empresa_process_candidates" ON public.profiles;

CREATE OR REPLACE FUNCTION public.profile_visible_via_empresa_process(p_profile_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.assessment_attempts aa
    JOIN public.hiring_processes hp
      ON hp.code = aa.metadata->>'processCode'
    WHERE aa.user_id = p_profile_id
      AND (
        hp.created_by = auth.uid()
        OR (
          hp.empresa_id IS NOT NULL
          AND public.is_active_empresa_member(hp.empresa_id)
        )
      )
  )
  OR EXISTS (
    SELECT 1
    FROM public.exam_results er
    JOIN public.hiring_processes hp
      ON hp.code = er.process_code
    WHERE er.user_id = p_profile_id
      AND (
        hp.created_by = auth.uid()
        OR (
          hp.empresa_id IS NOT NULL
          AND public.is_active_empresa_member(hp.empresa_id)
        )
      )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.profile_visible_via_empresa_process(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.profile_visible_via_empresa_process(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.profile_visible_via_empresa_process(UUID) TO authenticated;

CREATE POLICY "profiles_select_empresa_process_candidates" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.profile_visible_via_empresa_process(id));
