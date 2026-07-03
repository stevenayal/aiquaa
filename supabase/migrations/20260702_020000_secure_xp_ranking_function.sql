-- Fix: "Nadie en el ranking aún" — XP community ranking always empty.
--
-- Root cause: ranking_candidatos is a `security_invoker = true` view that
-- JOINs profiles. profiles RLS only allows a user to read their OWN row
-- (profiles_select_own: auth.uid() = id) plus a narrow empresa-talent
-- exception. Queried as `authenticated`, the JOIN drops every profile row
-- except the caller's own, so the view returns at most 1 row per user.
--
-- Fix: expose the ranking through a SECURITY DEFINER function that returns
-- only the columns already shown on the public ranking UI (display_name,
-- avatar_url, xp/level/streak, achievement_count, main_badge) — mirroring
-- the existing get_leaderboard() pattern. profiles RLS is NOT loosened;
-- email/phone/company_name/empresa_id and other profiles columns remain
-- inaccessible to other users.

-- Drop first: an earlier, incompatible draft of this function (different
-- column order/types, p_page-based pagination) may already exist in some
-- environments and CREATE OR REPLACE cannot change a function's return
-- row type/order in place.
DROP FUNCTION IF EXISTS public.get_xp_ranking(integer, integer);

CREATE OR REPLACE FUNCTION public.get_xp_ranking(
  p_limit  integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  user_id            uuid,
  total_xp           integer,
  level              integer,
  current_streak     integer,
  last_activity_at   timestamptz,
  display_name       text,
  avatar_url         text,
  achievement_count  bigint,
  main_badge         text,
  total_count        bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    rc.user_id,
    rc.total_xp,
    rc.level,
    rc.current_streak,
    rc.last_activity_at,
    rc.display_name,
    rc.avatar_url,
    rc.achievement_count,
    rc.main_badge,
    COUNT(*) OVER () AS total_count
  FROM public.ranking_candidatos rc
  ORDER BY rc.total_xp DESC, rc.user_id
  LIMIT p_limit OFFSET p_offset;
$function$;

REVOKE ALL ON FUNCTION public.get_xp_ranking(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_xp_ranking(integer, integer) TO anon, authenticated;
