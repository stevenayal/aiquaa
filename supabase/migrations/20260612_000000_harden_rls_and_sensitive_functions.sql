-- Harden public Supabase access reported by Advisors on 2026-06-10/11.
--
-- The QAC/challenge tables are accessed through Next.js API routes with the
-- service role key. Direct REST access by anon/authenticated must stay closed.

DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'qac_catalog',
    'qac_attempts',
    'qac_test_cases',
    'qac_bug_reports',
    'qac_scores',
    'challenge_users',
    'challenge_accounts',
    'challenge_sessions',
    'challenge_transfers',
    'challenge_movements',
    'talent_application_assessment_attempts',
    'talent_application_metric_snapshots',
    'talent_assessment_dimensions'
  ]
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      policy_name := table_name || '_service_role_all';

      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        policy_name,
        table_name
      );
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY (ARRAY[
        'award_xp',
        'change_user_role',
        'find_user_for_invite',
        'handle_new_user',
        'rls_auto_enable'
      ])
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn.signature);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', fn.signature);

    IF fn.proname = 'find_user_for_invite' THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', fn.signature);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regprocedure('public.get_leaderboard(text, integer)') IS NOT NULL THEN
    ALTER FUNCTION public.get_leaderboard(text, integer) SECURITY DEFINER;
    ALTER FUNCTION public.get_leaderboard(text, integer) SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.get_leaderboard(text, integer) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, integer) TO authenticated;
  END IF;
END $$;
