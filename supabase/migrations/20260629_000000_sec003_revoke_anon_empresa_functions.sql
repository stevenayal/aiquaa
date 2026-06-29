-- SEC-003 follow-up: properly revoke anon access to private empresa SECURITY DEFINER functions.
-- Cycle 2026-06-29: 5 functions still callable by anon despite partial fix on 2026-06-27.
-- Root cause: REVOKE FROM anon is insufficient when PUBLIC still holds the grant.
-- Fix: REVOKE FROM PUBLIC (which covers anon) then re-GRANT to authenticated only.
--
-- Intentionally NOT touched (needed for public/token-based flows):
--   get_invitacion_by_token        -- candidate reads invite via token link (no login required)
--   mark_invitacion_vista          -- candidate marks invitation viewed via token link
--   increment_empresa_profile_views -- anon visitor increments view counter on public empresa page
--   get_leaderboard / get_registered_user_count -- public landing data (intentional)

-- auth_user_empresa_role
REVOKE EXECUTE ON FUNCTION public.auth_user_empresa_role(p_empresa_id uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.auth_user_empresa_role(p_empresa_id uuid) TO authenticated;

-- is_active_empresa_member
REVOKE EXECUTE ON FUNCTION public.is_active_empresa_member(p_empresa_id uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_active_empresa_member(p_empresa_id uuid) TO authenticated;

-- my_empresa_role
REVOKE EXECUTE ON FUNCTION public.my_empresa_role(p_empresa_id uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.my_empresa_role(p_empresa_id uuid) TO authenticated;

-- sync_profile_name_to_qac (internal trigger; only service_role needs it)
REVOKE EXECUTE ON FUNCTION public.sync_profile_name_to_qac() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.sync_profile_name_to_qac() TO service_role;

-- increment_thread_replies (authenticated forum action; anon was a bot-manipulation vector)
REVOKE EXECUTE ON FUNCTION public.increment_thread_replies(thread_id uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.increment_thread_replies(thread_id uuid) TO authenticated;
