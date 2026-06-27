-- Fix rankings prácticos sin perder ningún resultado.
--
-- Antes: get_leaderboard() tenía dos ramas EXCLUYENTES:
--   - assessment_attempts SOLO para 'database-fundamentals' / 'database-practice'
--   - exam_results (legacy) para todo lo demás
-- Efecto:
--   1) 'git-practico' devolvía 0 filas: la rama legacy filtra total_questions >= 10,
--      pero el examen práctico de Git tiene 5 preguntas → se excluía a todos.
--   2) 'api-testing-fundamentals' / 'api-banking' son assessments (datos en
--      assessment_attempts) pero caían en la rama legacy y leían exam_results
--      (datos viejos/incompletos).
--
-- Fix: una sola consulta que UNE ambas fuentes (legacy + assessment) para cualquier
-- p_exam_type y deduplica por usuario con su mejor intento. Así no se descarta ningún
-- resultado: los exámenes legacy puros y los assessments puros quedan igual, y los
-- 'api-*' combinan ambas tablas.

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
  WITH
  -- ── Sistema legacy (exam_results) ──────────────────────────────────────────
  legacy AS (
    SELECT
      er.user_id,
      er.score              AS best_score,
      er.total_questions,
      er.max_possible_score,
      er.percentage         AS best_percentage,
      er.passed,
      er.created_at         AS achieved_at
    FROM public.exam_results er
    WHERE er.exam_type        = p_exam_type
      AND er.exam_mode        = 'exam'
      AND er.user_id          IS NOT NULL
      AND er.percentage       <= 100
      -- El práctico de Git tiene 5 preguntas; el resto exige >= 10 para filtrar intentos parciales.
      AND (p_exam_type = 'git-practico' OR er.total_questions >= 10)
      AND er.score            <= COALESCE(er.max_possible_score, er.total_questions)
  ),
  -- ── Sistema de assessments (assessment_attempts) ───────────────────────────
  assess AS (
    SELECT
      aa.user_id,
      aa.total_score::integer AS best_score,
      aa.max_score::integer   AS total_questions,
      aa.max_score::integer   AS max_possible_score,
      aa.percentage           AS best_percentage,
      aa.passed,
      aa.submitted_at         AS achieved_at
    FROM public.assessment_attempts aa
    JOIN public.assessments a ON a.id = aa.assessment_id
    WHERE a.slug      = p_exam_type
      AND aa.status   = 'graded'
      AND aa.user_id  IS NOT NULL
      AND aa.percentage <= 100
  ),
  combined AS (
    SELECT * FROM legacy
    UNION ALL
    SELECT * FROM assess
  ),
  best_attempt AS (
    SELECT DISTINCT ON (c.user_id)
      c.user_id,
      c.best_score,
      c.total_questions,
      c.max_possible_score,
      c.best_percentage,
      c.passed,
      c.achieved_at
    FROM combined c
    ORDER BY c.user_id, c.best_percentage DESC, c.best_score DESC
  ),
  attempt_counts AS (
    SELECT c.user_id, COUNT(*) AS attempts
    FROM combined c
    GROUP BY c.user_id
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
        NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(u.raw_user_meta_data->>'username'),  ''),
        'Anónimo'
      ) AS dname,
      u.raw_user_meta_data->>'avatar_url' AS avatar_url
    FROM best_attempt ba
    JOIN auth.users u           ON u.id = ba.user_id
    JOIN attempt_counts ac      ON ac.user_id = ba.user_id
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
  LIMIT p_limit;
$function$;
