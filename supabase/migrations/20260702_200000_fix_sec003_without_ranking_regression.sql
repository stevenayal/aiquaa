-- ============================================================
-- SEC-003 follow-up: sensitive SECURITY DEFINER grants + unsafe INSERT RLS
-- ============================================================
-- Keep ranking public: this migration intentionally does not revoke
-- get_leaderboard/get_registered_user_count. It restores get_leaderboard
-- anon/authenticated EXECUTE in case older hardening migrations removed anon.

-- 1) Sensitive SECURITY DEFINER helpers must not be callable by anon/PUBLIC.
--    Keep authenticated only for helpers that are invoked by app code or RLS.
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
        'find_user_for_invite',
        'auth_user_empresa_role',
        'is_active_empresa_member',
        'my_empresa_role',
        'sync_profile_name_to_qac',
        'log_tool_error',
        'log_tool_usage',
        'increment_thread_replies',
        'increment_thread_views'
      ])
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn.signature);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', fn.signature);

    IF fn.proname = ANY (ARRAY[
      'find_user_for_invite',
      'auth_user_empresa_role',
      'is_active_empresa_member',
      'my_empresa_role',
      'log_tool_error',
      'log_tool_usage'
    ]) THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', fn.signature);
    END IF;
  END LOOP;
END $$;

-- 2) Ranking must remain publicly readable.
DO $$
BEGIN
  IF to_regprocedure('public.get_leaderboard(text, integer)') IS NOT NULL THEN
    ALTER FUNCTION public.get_leaderboard(text, integer) SECURITY DEFINER;
    ALTER FUNCTION public.get_leaderboard(text, integer) SET search_path = public;
    GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, integer) TO anon, authenticated;
  END IF;

  IF to_regprocedure('public.get_registered_user_count()') IS NOT NULL THEN
    ALTER FUNCTION public.get_registered_user_count() SET search_path = public;
    GRANT EXECUTE ON FUNCTION public.get_registered_user_count() TO anon, authenticated;
  END IF;
END $$;

-- 3) Replace unsafe authenticated INSERT policies that used WITH CHECK (true).
--    When a table has an obvious ownership column, allow only own inserts.
--    Otherwise, close direct client inserts and leave service_role access.
DO $$
BEGIN
  IF to_regclass('public.process_history') IS NOT NULL THEN
    ALTER TABLE public.process_history ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can insert history" ON public.process_history;
    DROP POLICY IF EXISTS "process_history_insert_own" ON public.process_history;
    DROP POLICY IF EXISTS "process_history_service_role_insert" ON public.process_history;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'process_history' AND column_name = 'user_id'
    ) THEN
      CREATE POLICY "process_history_insert_own"
        ON public.process_history
        FOR INSERT TO authenticated
        WITH CHECK (user_id = (SELECT auth.uid()));
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'process_history' AND column_name = 'created_by'
    ) THEN
      CREATE POLICY "process_history_insert_own"
        ON public.process_history
        FOR INSERT TO authenticated
        WITH CHECK (created_by = (SELECT auth.uid()));
    END IF;

    CREATE POLICY "process_history_service_role_insert"
      ON public.process_history
      FOR INSERT TO service_role
      WITH CHECK (true);
  END IF;

  IF to_regclass('public.process_variables') IS NOT NULL THEN
    ALTER TABLE public.process_variables ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can insert variables" ON public.process_variables;
    DROP POLICY IF EXISTS "process_variables_insert_own" ON public.process_variables;
    DROP POLICY IF EXISTS "process_variables_service_role_insert" ON public.process_variables;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'process_variables' AND column_name = 'user_id'
    ) THEN
      CREATE POLICY "process_variables_insert_own"
        ON public.process_variables
        FOR INSERT TO authenticated
        WITH CHECK (user_id = (SELECT auth.uid()));
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'process_variables' AND column_name = 'created_by'
    ) THEN
      CREATE POLICY "process_variables_insert_own"
        ON public.process_variables
        FOR INSERT TO authenticated
        WITH CHECK (created_by = (SELECT auth.uid()));
    END IF;

    CREATE POLICY "process_variables_service_role_insert"
      ON public.process_variables
      FOR INSERT TO service_role
      WITH CHECK (true);
  END IF;

  IF to_regclass('public.user_tasks') IS NOT NULL THEN
    ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can insert tasks" ON public.user_tasks;
    DROP POLICY IF EXISTS "user_tasks_insert_own" ON public.user_tasks;
    DROP POLICY IF EXISTS "user_tasks_service_role_insert" ON public.user_tasks;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_tasks' AND column_name = 'user_id'
    ) THEN
      CREATE POLICY "user_tasks_insert_own"
        ON public.user_tasks
        FOR INSERT TO authenticated
        WITH CHECK (user_id = (SELECT auth.uid()));
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_tasks' AND column_name = 'assigned_to'
    ) THEN
      CREATE POLICY "user_tasks_insert_own"
        ON public.user_tasks
        FOR INSERT TO authenticated
        WITH CHECK (assigned_to = (SELECT auth.uid()));
    END IF;

    CREATE POLICY "user_tasks_service_role_insert"
      ON public.user_tasks
      FOR INSERT TO service_role
      WITH CHECK (true);
  END IF;

  IF to_regclass('public.user_xp') IS NOT NULL THEN
    ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Service role can insert xp" ON public.user_xp;
    DROP POLICY IF EXISTS "Users can insert xp" ON public.user_xp;
    DROP POLICY IF EXISTS "user_xp_insert_own" ON public.user_xp;

    CREATE POLICY "Service role can insert xp"
      ON public.user_xp
      FOR INSERT TO service_role
      WITH CHECK (true);
  END IF;
END $$;
