-- "Members see own empresa" (added by an earlier migration) selects from
-- public.empresa_miembros inside its own USING clause without going through
-- a SECURITY DEFINER function. Because the policy applies to
-- empresa_miembros itself, evaluating the subquery re-triggers RLS on the
-- same table, which re-evaluates the policy, etc. — Postgres raises
-- "infinite recursion detected in policy for relation empresa_miembros" on
-- essentially every read of this table (visible in prod logs as constant
-- errors), which made getEmpresaDashboardStatsAction's membership lookup
-- fail silently and the empresa panel show all-zero stats.
--
-- "empresa_miembros_read" already grants the same access (own row via
-- user_id = auth.uid(), or same-company via profiles.empresa_id) without
-- self-referencing empresa_miembros, so the broken policy is redundant.

DROP POLICY IF EXISTS "Members see own empresa" ON public.empresa_miembros;
