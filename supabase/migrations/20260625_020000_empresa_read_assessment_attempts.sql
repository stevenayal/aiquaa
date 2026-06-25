-- Allow company members to read database assessment attempts linked to their
-- hiring processes via assessment_attempts.metadata->>'processCode'.

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_process_code
  ON public.assessment_attempts ((metadata->>'processCode'))
  WHERE metadata ? 'processCode';

DROP POLICY IF EXISTS "Empresa members can read process assessment attempts"
  ON public.assessment_attempts;

CREATE POLICY "Empresa members can read process assessment attempts"
  ON public.assessment_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.hiring_processes hp
      WHERE hp.code = assessment_attempts.metadata->>'processCode'
        AND (
          hp.created_by = auth.uid()
          OR (
            hp.empresa_id IS NOT NULL
            AND public.is_active_empresa_member(hp.empresa_id)
          )
        )
    )
  );
