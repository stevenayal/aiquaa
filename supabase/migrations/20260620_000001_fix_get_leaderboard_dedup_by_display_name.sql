-- Issue #139: get_leaderboard() deduplicaba por display_name con DISTINCT ON (dname).
-- Efecto: dos usuarios con el mismo nombre → uno desaparecía silenciosamente del ranking.
-- Nombres comunes en LATAM (Ana, María) y el fallback 'Anónimo' hacen esto probable a escala.
--
-- Fix: eliminar el CTE `deduped` en ambas ramas.
-- El DISTINCT ON (user_id) en best_attempt ya garantiza exactamente una fila por persona.

CREATE OR REPLACE FUNCTION public.get_leaderboard(p_exam_type text, p_limit integer DEFAULT 20)
RETURNS TABLE(
  rank               bigint,
  display_name       text,
  avatar_url         text,
  best_score         integer,
  total_questions    integer,
  max_possible_score integer,
  best_percentage    numeric,
  passed             boolean,
  attempts           bigint,
  achieved_at        timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- ── New assessment system ──────────────────────────────────────────────────
  SELECT *
  FROM (
    WITH asmnt AS (
      SELECT id FROM public.assessments WHERE slug = p_exam_type
    ),
    best_attempt AS (
      SELECT DISTINCT ON (aa.user_id)
        aa.user_id,
        aa.total_score::integer AS best_score,
        aa.max_score::integer   AS max_score,
        aa.percentage           AS best_percentage,
        aa.passed,
        aa.submitted_at         AS achieved_at
      FROM public.assessment_attempts aa
      JOIN asmnt ON aa.assessment_id = asmnt.id
      WHERE aa.status   = 'graded'
        AND aa.user_id  IS NOT NULL
        AND aa.percentage <= 100
      ORDER BY aa.user_id, aa.percentage DESC, aa.total_score DESC
    ),
    attempt_counts AS (
      SELECT aa.user_id, COUNT(*) AS attempts
      FROM public.assessment_attempts aa
      JOIN asmnt ON aa.assessment_id = asmnt.id
      WHERE aa.status   = 'graded'
        AND aa.user_id  IS NOT NULL
      GROUP BY aa.user_id
    ),
    with_display AS (
      SELECT
        ba.best_score,
        ba.max_score,
        ba.best_percentage,
        ba.passed,
        ba.achieved_at,
        ac.attempts,
        COALESCE(
          NULLIF(TRIM(u.raw_user_meta_data->>'full_name'),  ''),
          NULLIF(TRIM(u.raw_user_meta_data->>'username'),   ''),
          'Anónimo'
        ) AS dname,
        u.raw_user_meta_data->>'avatar_url' AS avatar_url
      FROM best_attempt ba
      JOIN auth.users u ON u.id = ba.user_id
      JOIN attempt_counts ac ON ac.user_id = ba.user_id
    )
    SELECT
      ROW_NUMBER() OVER (ORDER BY best_percentage DESC, best_score DESC) AS rank,
      dname           AS display_name,
      avatar_url,
      best_score,
      max_score       AS total_questions,
      max_score       AS max_possible_score,
      best_percentage,
      passed,
      attempts,
      achieved_at
    FROM with_display
    ORDER BY best_percentage DESC, best_score DESC
    LIMIT p_limit
  ) t
  WHERE p_exam_type IN ('database-fundamentals', 'database-practice')

  UNION ALL

  -- ── Legacy system ──────────────────────────────────────────────────────────
  SELECT *
  FROM (
    WITH best_attempt AS (
      SELECT DISTINCT ON (er.user_id)
        er.user_id,
        er.score           AS best_score,
        er.total_questions,
        er.max_possible_score,
        er.percentage      AS best_percentage,
        er.passed,
        er.created_at      AS achieved_at
      FROM public.exam_results er
      WHERE er.exam_type        = p_exam_type
        AND er.exam_mode        = 'exam'
        AND er.user_id          IS NOT NULL
        AND er.percentage       <= 100
        AND er.total_questions  >= 10
        AND er.score            <= COALESCE(er.max_possible_score, er.total_questions)
      ORDER BY er.user_id, er.percentage DESC, er.score DESC
    ),
    attempt_counts AS (
      SELECT user_id, COUNT(*) AS attempts
      FROM public.exam_results
      WHERE exam_type = p_exam_type
        AND exam_mode = 'exam'
        AND user_id   IS NOT NULL
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
          NULLIF(TRIM(u.raw_user_meta_data->>'username'),   ''),
          'Anónimo'
        ) AS dname,
        u.raw_user_meta_data->>'avatar_url' AS avatar_url
      FROM best_attempt ba
      JOIN auth.users u ON u.id = ba.user_id
      JOIN attempt_counts ac ON ac.user_id = ba.user_id
    )
    SELECT
      ROW_NUMBER() OVER (ORDER BY best_percentage DESC, best_score DESC) AS rank,
      dname           AS display_name,
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
    LIMIT p_limit
  ) t
  WHERE p_exam_type NOT IN ('database-fundamentals', 'database-practice');
$function$;
