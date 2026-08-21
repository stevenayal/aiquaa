-- =========================================
-- empresa_preguntas: allow question_type = 'multi_select'
-- Additive — widens the CHECK constraint, no data migration needed.
-- =========================================

ALTER TABLE public.empresa_preguntas
  DROP CONSTRAINT IF EXISTS empresa_preguntas_question_type_check;

ALTER TABLE public.empresa_preguntas
  ADD CONSTRAINT empresa_preguntas_question_type_check
  CHECK (question_type IN ('multiple_choice', 'multi_select', 'true_false', 'short_text'));
