-- La revisión de empresa (saveExamReviewAction, /empresa/evaluar/[resultId])
-- nunca pudo persistir: exam_results solo tenía policy de UPDATE para el
-- dueño del examen (ver 20260703_000000), no para el empresa que revisa el
-- resultado de un candidato. Los 338 registros existentes seguían todos en
-- review_status='pending' pese a que la UI mostraba "revisión guardada".
-- Refleja la misma condición que "employers_view_process_results" (SELECT).

CREATE POLICY "employers_update_process_results"
  ON public.exam_results
  FOR UPDATE
  USING (
    process_code IN (
      SELECT hiring_processes.code
      FROM hiring_processes
      WHERE hiring_processes.created_by = auth.uid()
    )
    OR (
      SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()
    ) = 'admin'
  )
  WITH CHECK (
    process_code IN (
      SELECT hiring_processes.code
      FROM hiring_processes
      WHERE hiring_processes.created_by = auth.uid()
    )
    OR (
      SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()
    ) = 'admin'
  );
