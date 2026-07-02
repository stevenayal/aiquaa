-- Agrega columnas de revisión de evaluador a exam_results
-- Permite que reclutadores/HR revisen y califiquen exámenes manualmente

ALTER TABLE public.exam_results
  ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_data   JSONB;

COMMENT ON COLUMN public.exam_results.review_status
  IS 'Estado de revisión: pending | in_review | reviewed';
COMMENT ON COLUMN public.exam_results.review_data
  IS 'Evaluación detallada del reclutador: { bugs: { [bugId]: { approved, evaluatorNotes } }, overallNotes, adjustedScore }';

CREATE INDEX IF NOT EXISTS idx_exam_results_review_status
  ON public.exam_results (review_status)
  WHERE review_status = 'pending';
