-- #205: Allow company members to read per-section scores (assessment_scores)
-- for attempts linked to their hiring processes, so recruiters can see the
-- section breakdown of a candidate's evaluation (not just pass/fail + total).
--
-- Mirrors the existing policy "Empresa members can read process assessment
-- attempts" (20260625_020000) but for the assessment_scores table.
-- Additive only: creates a SELECT policy, does not drop tables or delete data.

DROP POLICY IF EXISTS "Empresa members can read process assessment scores"
  ON public.assessment_scores;

CREATE POLICY "Empresa members can read process assessment scores"
  ON public.assessment_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts aa
      JOIN public.hiring_processes hp
        ON hp.code = aa.metadata->>'processCode'
      WHERE aa.id = assessment_scores.attempt_id
        AND (
          hp.created_by = auth.uid()
          OR (
            hp.empresa_id IS NOT NULL
            AND public.is_active_empresa_member(hp.empresa_id)
          )
        )
    )
  );
