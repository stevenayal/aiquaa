-- Issue #151 (continuación): Tablas talent_* con RLS habilitado sin políticas para authenticated/anon.
-- Estas tablas pertenecen al módulo Talent MVP que aún no está implementado.
-- No hay ningún código en frontend ni backend que acceda a estas tablas via JWT de usuario.
-- Se agregan políticas RESTRICTIVE USING (false) para documentar explícitamente
-- que ningún usuario autenticado o anónimo puede leer/escribir directamente.
-- El service role (createAdminClient) bypasea RLS y no se ve afectado.

CREATE POLICY "Acceso solo via service role" ON public.talent_application_assessment_attempts
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.talent_application_metric_snapshots
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.talent_assessment_dimensions
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.talent_assessment_questions
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.talent_assessment_responses
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.talent_assessment_scores
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.talent_assessment_templates
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.talent_process_assessments
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);
