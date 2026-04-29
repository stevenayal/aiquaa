-- Fix: infinite recursion in profiles RLS + hiring_processes audience check
--
-- Root cause:
--   1. "admins_read_all_profiles" queries profiles FROM WITHIN a profiles SELECT policy → recursive loop
--   2. "employers_manage_own_processes" subqueries profiles (triggering that loop) and
--      checks role = 'employer', which empresa users never have (they have audience = 'empresa')

-- ── profiles ──────────────────────────────────────────────────────────────────

-- Drop the recursive policy; "profiles_select" (USING true) already covers reads
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.profiles;

-- ── hiring_processes ──────────────────────────────────────────────────────────

-- Replace the broken policy with a simple ownership check.
-- Audience is enforced by route middleware (/empresa), not by DB role lookup.
DROP POLICY IF EXISTS "employers_manage_own_processes" ON public.hiring_processes;

CREATE POLICY "hiring_processes_owner_all"
  ON public.hiring_processes
  FOR ALL
  TO authenticated
  USING     (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
