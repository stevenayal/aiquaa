-- Let a candidate read the hiring_processes rows (code, exam_types) that
-- belong to an event (hiring_process_group) they've already rendered at
-- least one exam in — mirrors candidates_select_own_event_groups
-- (20260703_050000), which only granted read on the *group* itself.
--
-- Without this, getMyEventProgressAction's queries against
-- hiring_processes (to build the "required exam types" union and the set of
-- process codes belonging to the event) only had the
-- hiring_processes_empresa_access policy available, which is scoped to
-- empresa owners/members — so a plain candidate session could see none, or
-- only some, of the event's other processes/exam_types. That desynced the
-- student-facing progress card from the empresa "Eventos" view, which reads
-- the same tables under an empresa member's broader RLS visibility: a
-- candidate could see fewer required exam types and have already-graded
-- results excluded because the process they belong to fell outside what
-- their own query could see.

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
