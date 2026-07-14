-- Let a candidate read the hiring_processes rows (code, exam_types) that
-- belong to an event (hiring_process_group) they've already rendered at
-- least one exam in — mirrors candidates_select_own_event_groups
-- (20260703_050000), which only granted read on the *group* itself.
--
-- SUPERSEDED by 20260714234547_candidate_read_own_event_processes_fixed.sql:
-- this version's USING clause does its exam_results / assessment_attempts
-- checks directly, which triggers "infinite recursion detected in policy
-- for relation exam_results" the moment it's evaluated, because those
-- tables' own RLS policies reference hiring_processes back. It was live in
-- production for a few minutes before being replaced — kept here only so
-- the migration history matches what was actually applied.

DROP POLICY IF EXISTS "candidates_select_own_event_processes" ON public.hiring_processes;

CREATE POLICY "candidates_select_own_event_processes" ON public.hiring_processes
  FOR SELECT
  TO authenticated
  USING (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.hiring_processes hp_touched
      WHERE hp_touched.group_id = hiring_processes.group_id
        AND (
          EXISTS (
            SELECT 1 FROM public.exam_results er
            WHERE er.process_code = hp_touched.code AND er.user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM public.assessment_attempts aa
            WHERE aa.metadata->>'processCode' = hp_touched.code AND aa.user_id = auth.uid()
          )
        )
    )
  );
