-- Fix: get_xp_ranking() (created by 20260702_235000_fix_ranking_regression)
-- referenced ranking_achievements.achievement_id / .unlocked_at, columns that
-- don't exist on that table (it stores ranking-position snapshots, not badge
-- unlocks). Every call errored with 42703 (undefined_column), so the
-- Comunidad XP ranking stayed broken even after that migration.
--
-- Badge/achievement-count logic already exists and works correctly in the
-- ranking_candidatos view (joins user_achievements + achievements), so this
-- sources from there instead of re-deriving the join. Keeps the p_page/
-- p_limit signature the frontend (getXpRankingAction) already calls.

DROP FUNCTION IF EXISTS public.get_xp_ranking(integer, integer);

CREATE OR REPLACE FUNCTION public.get_xp_ranking(
  p_page  integer DEFAULT 1,
  p_limit integer DEFAULT 20
)
RETURNS TABLE(
  user_id           uuid,
  display_name      text,
  avatar_url        text,
  total_xp          integer,
  level             integer,
  current_streak    integer,
  last_activity_at  timestamptz,
  achievement_count bigint,
  main_badge        text,
  total_count       bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    rc.user_id,
    rc.display_name,
    rc.avatar_url,
    rc.total_xp,
    rc.level,
    rc.current_streak,
    rc.last_activity_at,
    rc.achievement_count,
    rc.main_badge,
    COUNT(*) OVER () AS total_count
  FROM public.ranking_candidatos rc
  ORDER BY rc.total_xp DESC, rc.user_id
  LIMIT p_limit OFFSET (p_page - 1) * p_limit;
$function$;

REVOKE ALL ON FUNCTION public.get_xp_ranking(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_xp_ranking(integer, integer) TO anon, authenticated;
