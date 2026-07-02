-- SEC-CRITICAL (issue #224): profiles.email/phone readable by anyone with the
-- public anon key. Two duplicate always-true SELECT policies on public.profiles
-- ("Profiles public read", "profiles_select") exposed every column of every
-- profile row to unauthenticated visitors. Replace with row policies scoped to
-- the caller's own row, plus a narrow carve-out for empresa accounts to read
-- opted-in, visible candidate profiles (needed by /empresa/candidatos and
-- /talento/[id]).
--
-- Company vs. candidate accounts are distinguished by profiles.audience
-- ('empresa' | 'candidato'), not profiles.role (stale/inconsistent values —
-- see 20260428_000000_fix_profiles_rls.sql).

-- Columns referenced below were added by 20260625_020000_candidate_talent_directory.sql,
-- which had not reached this environment yet; add them defensively so this
-- migration is self-sufficient regardless of apply order.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS open_to_work BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS talent_visible_to_empresas BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS istqb_level TEXT,
  ADD COLUMN IF NOT EXISTS github_profile TEXT;

-- ── profiles ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Profiles public read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

CREATE OR REPLACE FUNCTION public.current_user_is_empresa()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND audience = 'empresa'
  );
$$;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_empresa_talent" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    audience = 'candidato'
    AND talent_visible_to_empresas = true
    AND public.current_user_is_empresa()
  );

-- ── tool_usage ────────────────────────────────────────────────────────────────
-- "tool_usage_select_own" (auth.uid() = user_id) already covers the only real
-- usage (apps/frontend/src/hooks/useToolUsage.ts only inserts via RPC).

DROP POLICY IF EXISTS "tool_usage_select_authenticated" ON public.tool_usage;

-- ── process_history / process_variables / user_tasks ─────────────────────────
-- INSERT policies allowed any authenticated user to insert arbitrary rows.
-- Mirror the invariants their own SELECT policies already encode. 0 rows in
-- all three tables today, so this only tightens future writes.

DROP POLICY IF EXISTS "Users can insert history" ON public.process_history;
CREATE POLICY "Users can insert history" ON public.process_history
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM process_instances pi
      WHERE pi.id = process_history.instance_id
      AND (pi.started_by = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = ANY (ARRAY['qa_lead','dev_lead'])
      ))
    )
  );

DROP POLICY IF EXISTS "Users can insert variables" ON public.process_variables;
CREATE POLICY "Users can insert variables" ON public.process_variables
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM process_instances pi
      WHERE pi.id = process_variables.instance_id
      AND (pi.started_by = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = ANY (ARRAY['qa_lead','dev_lead'])
      ))
    )
  );

DROP POLICY IF EXISTS "Users can insert tasks" ON public.user_tasks;
CREATE POLICY "Users can insert tasks" ON public.user_tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = ANY (ARRAY['qa_lead','dev_lead'])
    )
  );
