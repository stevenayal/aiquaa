-- Fix regression from SEC-003 hardening that broke the community XP ranking.
-- Two issues:
--   1. user_xp RLS enabled without a SELECT policy → ranking_candidatos view
--      returns 0 rows for authenticated users.
--   2. profiles RLS hardened to own-row only → display_name/avatar_url are NULL
--      for other users even if ranking_candidatos could read them.
--
-- Solution:
--   a. Add SELECT policy on user_xp for own-row reads (fixes getMyXpProfileAction).
--   b. Create SECURITY DEFINER function that bypasses RLS for the public ranking
--      (fixes getXpRankingAction and the Comunidad tab).

-- ── a) user_xp: allow authenticated users to read their own row ──────────────

DROP POLICY IF EXISTS "user_xp_select_own" ON public.user_xp;
CREATE POLICY "user_xp_select_own" ON public.user_xp
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_xp_select_service_role" ON public.user_xp;
CREATE POLICY "user_xp_select_service_role" ON public.user_xp
  FOR SELECT TO service_role
  USING (true);

-- ── b) SECURITY DEFINER function: public XP ranking ──────────────────────────
-- Bypasses RLS on user_xp and profiles so the Comunidad leaderboard works.
-- Excludes audience = 'empresa' (company accounts).

CREATE OR REPLACE FUNCTION public.get_xp_ranking(
  p_page integer DEFAULT 1,
  p_limit integer DEFAULT 20
)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  avatar_url text,
  total_xp bigint,
  level integer,
  current_streak integer,
  last_activity_at timestamptz,
  achievement_count bigint,
  main_badge text,
  total_count bigint
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_offset integer;
  v_total bigint;
BEGIN
  v_offset := (p_page - 1) * p_limit;

  -- Total count
  SELECT COUNT(*) INTO v_total
  FROM user_xp ux
  JOIN profiles p ON p.id = ux.user_id
  WHERE p.audience = 'candidato';

  RETURN QUERY
  SELECT
    ux.user_id,
    p.display_name,
    p.avatar_url,
    ux.total_xp,
    ux.level,
    ux.current_streak,
    ux.last_activity_at,
    COALESCE((
      SELECT COUNT(*)::bigint
      FROM ranking_achievements ra
      WHERE ra.user_id = ux.user_id
    ), 0) AS achievement_count,
    COALESCE((
      SELECT ra.achievement_id
      FROM ranking_achievements ra
      WHERE ra.user_id = ux.user_id
      ORDER BY ra.unlocked_at DESC
      LIMIT 1
    ), NULL) AS main_badge,
    v_total AS total_count
  FROM user_xp ux
  JOIN profiles p ON p.id = ux.user_id
  WHERE p.audience = 'candidato'
  ORDER BY ux.total_xp DESC
  LIMIT p_limit
  OFFSET v_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_xp_ranking(integer, integer) TO anon, authenticated;
