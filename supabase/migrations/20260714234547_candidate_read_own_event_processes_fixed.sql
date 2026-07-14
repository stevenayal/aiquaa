-- Fixes the infinite-recursion bug introduced by
-- 20260714233905_candidate_read_own_event_processes.sql: RLS policies on
-- hiring_processes must not do their exam_results / assessment_attempts
-- checks directly in a USING clause, because those tables have their own
-- policies that reference hiring_processes back (e.g. empresa read-access
-- policies) — that creates "infinite recursion detected in policy for
-- relation exam_results/hiring_processes" the moment the policy runs,
-- which broke every query against hiring_processes (including the ones
-- behind /perfil's "Mi progreso en eventos" and /empresa/eventos/[id]).
--
-- Routing the check through a SECURITY DEFINER function (owned by a role
-- with BYPASSRLS, so its internal queries skip RLS entirely) breaks the
-- cycle — same pattern already used by is_active_empresa_member().

DROP POLICY IF EXISTS "candidates_select_own_event_processes" ON public.hiring_processes;
DROP FUNCTION IF EXISTS public.candidate_has_result_for_process(text);

CREATE OR REPLACE FUNCTION public.candidate_touched_event_group(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hiring_processes hp
    WHERE hp.group_id = p_group_id
      AND (
        EXISTS (
          SELECT 1 FROM public.exam_results er
          WHERE er.process_code = hp.code AND er.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.assessment_attempts aa
          WHERE aa.metadata->>'processCode' = hp.code AND aa.user_id = auth.uid()
        )
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.candidate_touched_event_group(uuid) TO authenticated;

CREATE POLICY "candidates_select_own_event_processes" ON public.hiring_processes
  FOR SELECT
  TO authenticated
  USING (
    group_id IS NOT NULL
    AND public.candidate_touched_event_group(group_id)
  );
