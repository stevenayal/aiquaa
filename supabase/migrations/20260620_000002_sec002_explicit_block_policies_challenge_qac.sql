-- Issue #151 (parcial): Tablas challenge_* y qac_* con RLS habilitado sin políticas.
-- Estas tablas son accedidas ÚNICAMENTE via createAdminClient() (service role key)
-- en las API routes de Next.js. El service role bypasea RLS, así que el
-- comportamiento de la app no cambia.
-- Se agregan políticas RESTRICTIVE USING (false) para documentar explícitamente
-- que ningún usuario autenticado o anónimo puede leer/escribir directamente.

CREATE POLICY "Acceso solo via service role" ON public.challenge_accounts
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.challenge_movements
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.challenge_sessions
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.challenge_transfers
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.challenge_users
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.qac_attempts
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.qac_bug_reports
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.qac_catalog
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.qac_scores
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);

CREATE POLICY "Acceso solo via service role" ON public.qac_test_cases
  AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false);
