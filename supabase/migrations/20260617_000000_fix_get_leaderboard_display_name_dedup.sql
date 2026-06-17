-- Fix: get_leaderboard() was deduplicating by display_name, silently hiding real
-- users who share the same visible name (e.g. two "Ana Duarte" or multiple "Anónimo").
-- The root cause was a second DISTINCT ON (display_name) CTE added in migration
-- 20260603140959_dedup_leaderboard_by_display_name to avoid multiple "Anónimo" rows,
-- but with the unintended side-effect of dropping one of any pair of real users with
-- identical names. The fix removes that CTE entirely: best_attempt already guarantees
-- one row per user_id, so no second dedup is needed.
-- Ref: GitHub issue #139.

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_exam_type text,
  p_limit      integer DEFAULT 20
)
RETURNS TABLE(
  rank              bigint,
  display_name      text,
  avatar_url        text,
  best_score        integer,
  total_questions   integer,
  max_possible_score integer,
  best_percentage   numeric,
  passed            boolean,
  attempts          bigint,
  achieved_at       timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH best_attempt AS (
    SELECT DISTINCT ON (er.user_id)
      er.user_id,
      er.score            AS best_score,
      er.total_questions,
      er.max_possible_score,
      er.percentage       AS best_percentage,
      er.passed,
      er.created_at       AS achieved_at
    FROM public.exam_results er
    WHERE
      er.exam_type        = p_exam_type
      AND er.exam_mode    = 'exam'
      AND er.user_id      IS NOT NULL
      AND er.percentage   <= 100
      AND er.total_questions >= 10
      AND er.score        <= COALESCE(er.max_possible_score, er.total_questions)
    ORDER BY er.user_id, er.percentage DESC, er.score DESC
  ),
  attempt_counts AS (
    SELECT user_id, COUNT(*) AS attempts
    FROM public.exam_results
    WHERE exam_type = p_exam_type
      AND exam_mode = 'exam'
      AND user_id IS NOT NULL
    GROUP BY user_id
  ),
  with_display AS (
    SELECT
      ba.best_score,
      ba.total_questions,
      ba.max_possible_score,
      ba.best_percentage,
      ba.passed,
      ba.achieved_at,
      ac.attempts,
      COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data->>'full_name'),  ''),
        NULLIF(TRIM(u.raw_user_meta_data->>'username'), ''),
        'Anónimo'
      ) AS display_name,
      u.raw_user_meta_data->>'avatar_url' AS avatar_url
    FROM best_attempt ba
    JOIN auth.users      u  ON ba.user_id = u.id
    JOIN attempt_counts  ac ON ac.user_id = ba.user_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY best_percentage DESC, best_score DESC) AS rank,
    display_name,
    avatar_url,
    best_score,
    total_questions,
    max_possible_score,
    best_percentage,
    passed,
    attempts,
    achieved_at
  FROM with_display
  ORDER BY best_percentage DESC, best_score DESC
  LIMIT p_limit;
$$;

-- Re-apply access controls (preserve security posture from migration 20260614_000002).
REVOKE EXECUTE ON FUNCTION public.get_leaderboard(text, integer) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_leaderboard(text, integer) TO authenticated;
