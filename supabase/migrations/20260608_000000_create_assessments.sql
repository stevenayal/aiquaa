CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL,
  type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  total_score INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessment_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assessment_id, slug),
  UNIQUE (assessment_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.assessment_sections(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (
    question_type IN (
      'multiple_choice',
      'true_false',
      'short_text',
      'doc_analysis',
      'test_case_matrix',
      'response_analysis',
      'bug_report'
    )
  ),
  prompt TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer JSONB,
  expected_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  scoring_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
  points INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'submitted', 'graded')) DEFAULT 'in_progress',
  current_section_slug TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  total_score INTEGER,
  max_score INTEGER NOT NULL DEFAULT 100,
  percentage INTEGER,
  passed BOOLEAN,
  candidate_level TEXT,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_correct BOOLEAN,
  score INTEGER NOT NULL DEFAULT 0,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.assessment_sections(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL,
  scoring_mode TEXT NOT NULL CHECK (scoring_mode IN ('automatic', 'heuristic')),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, section_id)
);

CREATE TABLE IF NOT EXISTS public.assessment_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  message TEXT NOT NULL,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, level)
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read assessments" ON public.assessments;
CREATE POLICY "Authenticated users can read assessments"
  ON public.assessments
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can read assessment sections" ON public.assessment_sections;
CREATE POLICY "Authenticated users can read assessment sections"
  ON public.assessment_sections
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can read assessment questions" ON public.assessment_questions;
CREATE POLICY "Authenticated users can read assessment questions"
  ON public.assessment_questions
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can read own assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Users can read own assessment attempts"
  ON public.assessment_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Users can create own assessment attempts"
  ON public.assessment_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Users can update own assessment attempts"
  ON public.assessment_attempts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own assessment answers" ON public.assessment_answers;
CREATE POLICY "Users can read own assessment answers"
  ON public.assessment_answers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_answers.attempt_id
        AND attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own assessment answers" ON public.assessment_answers;
CREATE POLICY "Users can create own assessment answers"
  ON public.assessment_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_answers.attempt_id
        AND attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own assessment answers" ON public.assessment_answers;
CREATE POLICY "Users can update own assessment answers"
  ON public.assessment_answers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_answers.attempt_id
        AND attempts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_answers.attempt_id
        AND attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can read own assessment scores" ON public.assessment_scores;
CREATE POLICY "Users can read own assessment scores"
  ON public.assessment_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_scores.attempt_id
        AND attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own assessment scores" ON public.assessment_scores;
CREATE POLICY "Users can create own assessment scores"
  ON public.assessment_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_scores.attempt_id
        AND attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own assessment scores" ON public.assessment_scores;
CREATE POLICY "Users can update own assessment scores"
  ON public.assessment_scores
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_scores.attempt_id
        AND attempts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_scores.attempt_id
        AND attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can read own assessment feedback" ON public.assessment_feedback;
CREATE POLICY "Users can read own assessment feedback"
  ON public.assessment_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_feedback.attempt_id
        AND attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own assessment feedback" ON public.assessment_feedback;
CREATE POLICY "Users can create own assessment feedback"
  ON public.assessment_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_feedback.attempt_id
        AND attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own assessment feedback" ON public.assessment_feedback;
CREATE POLICY "Users can update own assessment feedback"
  ON public.assessment_feedback
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_feedback.attempt_id
        AND attempts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assessment_attempts attempts
      WHERE attempts.id = assessment_feedback.attempt_id
        AND attempts.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_assessment_created_at
  ON public.assessment_attempts(user_id, assessment_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_attempt_question
  ON public.assessment_answers(attempt_id, question_id);

CREATE INDEX IF NOT EXISTS idx_assessment_scores_attempt_section
  ON public.assessment_scores(attempt_id, section_id);

CREATE INDEX IF NOT EXISTS idx_assessment_sections_assessment_order
  ON public.assessment_sections(assessment_id, order_index);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_section_order
  ON public.assessment_questions(section_id, order_index);

COMMENT ON TABLE public.assessments IS 'Catalogo de assessments tecnicos de AIQUAA.';
COMMENT ON TABLE public.assessment_sections IS 'Secciones o niveles de cada assessment.';
COMMENT ON TABLE public.assessment_questions IS 'Preguntas versionadas del assessment.';
COMMENT ON TABLE public.assessment_attempts IS 'Intentos de candidatos sobre assessments.';
COMMENT ON TABLE public.assessment_answers IS 'Respuestas guardadas por pregunta.';
COMMENT ON TABLE public.assessment_scores IS 'Puntajes agregados por seccion.';
COMMENT ON TABLE public.assessment_feedback IS 'Feedback final por nivel del assessment.';
