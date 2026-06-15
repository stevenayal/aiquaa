-- ============================================================
-- Endurecimiento de seguridad (advisors de Supabase)
-- ============================================================
-- Origen: el linter de seguridad de Supabase reporto:
--   * 10 tablas public con RLS deshabilitado (challenge_*, qac_*), expuestas via API.
--   * Funciones SECURITY DEFINER ejecutables por anon (via grant a PUBLIC).
--   * get_leaderboard con search_path mutable.
-- La app accede a challenge_*/qac_* SOLO via service-role (createAdminClient),
-- que bypassa RLS; por eso habilitar RLS sin policies no rompe la app y cierra
-- el acceso anonimo por PostgREST.

-- 1) Habilitar RLS en tablas publicas expuestas via API REST.
ALTER TABLE public.challenge_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qac_attempts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qac_catalog         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qac_test_cases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qac_bug_reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qac_scores          ENABLE ROW LEVEL SECURITY;

-- 2) award_xp recibe un user_id arbitrario y NO valida al llamador.
--    Solo debe ejecutarse desde triggers (corren como definer, no requieren EXECUTE).
REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;

-- 3) Funciones de trigger / event-trigger: nunca deben exponerse como RPC.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_exam_result_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_nueva_empresa()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()       FROM PUBLIC, anon, authenticated;

-- 4) Funciones sensibles: quitar PUBLIC/anon, conservar authenticated.
--    Las llaman server actions con la sesion del usuario (createClient SSR = rol
--    authenticated); ya validan admin / rol empresa internamente.
REVOKE EXECUTE ON FUNCTION public.change_user_role(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.change_user_role(uuid, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.find_user_for_invite(text)   FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.find_user_for_invite(text)   TO authenticated;

-- 5) Fijar search_path inmutable (advisor function_search_path_mutable).
ALTER FUNCTION public.get_leaderboard(text, integer) SET search_path = public;
