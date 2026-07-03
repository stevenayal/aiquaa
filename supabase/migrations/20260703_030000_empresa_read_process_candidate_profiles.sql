-- Empresa members viewing a hiring process's "Postulantes" table
-- (apps/frontend/src/app/empresa/procesos/[id]/page.tsx) resolve candidate
-- names for assessment_attempts rows by joining public.profiles client-side.
-- 20260702_000000_fix_profiles_pii_exposure.sql scoped profiles SELECT to
-- (a) the caller's own row or (b) candidates who opted into the public talent
-- directory (talent_visible_to_empresas = true). Candidates who applied to a
-- specific process without opting into the directory are invisible under
-- that policy, so the join silently returns nothing and the UI falls back to
-- "—" for their name/email — even though 20260625_020000 already grants the
-- empresa read access to the underlying assessment_attempts/exam_results row
-- itself.
--
-- Add a narrow carve-out mirroring 20260625_020000_empresa_read_assessment_attempts.sql:
-- an empresa member may read a candidate's profile if that candidate has an
-- assessment_attempts or exam_results row tied to a hiring_process owned by
-- that empresa (or created by the caller directly).

DROP POLICY IF EXISTS "profiles_select_empresa_process_candidates" ON public.profiles;

CREATE POLICY "profiles_select_empresa_process_candidates" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts aa
      JOIN public.hiring_processes hp
        ON hp.code = aa.metadata->>'processCode'
      WHERE aa.user_id = profiles.id
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
      WHERE er.user_id = profiles.id
        AND (
          hp.created_by = auth.uid()
          OR (
            hp.empresa_id IS NOT NULL
            AND public.is_active_empresa_member(hp.empresa_id)
          )
        )
    )
  );
