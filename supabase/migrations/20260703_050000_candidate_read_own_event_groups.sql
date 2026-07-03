-- Let a candidate read the name/description of a hiring_process_group (evento)
-- they've actually participated in, so their profile can show event progress
-- (% completado, pruebas faltantes) — mirrors the "Postulantes"/"Eventos"
-- macro report already built for empresa users.
--
-- hiring_process_groups previously only allowed empresa members to read (own
-- empresa_id). This mirrors the pattern already used for
-- profiles_select_empresa_process_candidates: grant read access scoped to
-- rows the candidate is provably connected to via their own exam_results /
-- assessment_attempts, not a blanket read.

DROP POLICY IF EXISTS "candidates_select_own_event_groups" ON public.hiring_process_groups;

CREATE POLICY "candidates_select_own_event_groups" ON public.hiring_process_groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.hiring_processes hp
      WHERE hp.group_id = hiring_process_groups.id
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
    )
  );
