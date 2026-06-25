-- Ranking achievements for users that reach a Top 3 position in AIQUAA rankings.

CREATE TABLE IF NOT EXISTS public.ranking_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ranking_type    TEXT NOT NULL CHECK (ranking_type IN ('xp_global', 'exam')),
  ranking_slug    TEXT NOT NULL,
  ranking_label   TEXT NOT NULL,
  position        INT NOT NULL CHECK (position BETWEEN 1 AND 3),
  score           NUMERIC,
  score_label     TEXT,
  achieved_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at     TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, ranking_type, ranking_slug)
);

CREATE INDEX IF NOT EXISTS idx_ranking_achievements_user_created
  ON public.ranking_achievements (user_id, achieved_at DESC);

CREATE INDEX IF NOT EXISTS idx_ranking_achievements_unnotified
  ON public.ranking_achievements (user_id, notified_at)
  WHERE notified_at IS NULL;

ALTER TABLE public.ranking_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ranking_achievements_select_own" ON public.ranking_achievements;
CREATE POLICY "ranking_achievements_select_own"
  ON public.ranking_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE ALL ON public.ranking_achievements FROM PUBLIC;
GRANT SELECT ON public.ranking_achievements TO authenticated;
