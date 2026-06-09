-- =============================================================
-- QA API Challenge - Banking Transactions
-- Prefix qac_ to avoid collision with existing assessment_* tables
-- =============================================================

DO $$ BEGIN
  CREATE TYPE qac_attempt_status AS ENUM ('in_progress','submitted','evaluated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE qac_test_case_type AS ENUM ('positive','negative','boundary','security','contract');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE qac_priority_level AS ENUM ('low','medium','high','critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Challenge catalog (separate from existing assessments table)
CREATE TABLE IF NOT EXISTS public.qac_catalog (
  id               SERIAL PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  level            TEXT NOT NULL CHECK (level IN ('junior','semi-senior','senior')),
  duration_minutes INT  NOT NULL,
  type             TEXT NOT NULL DEFAULT 'api-testing',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qac_attempts (
  id              SERIAL PRIMARY KEY,
  catalog_id      INT NOT NULL REFERENCES public.qac_catalog(id),
  aiquaa_user_id  TEXT,
  candidate_name  TEXT NOT NULL,
  candidate_email TEXT,
  status          qac_attempt_status NOT NULL DEFAULT 'in_progress',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at    TIMESTAMPTZ,
  total_score     NUMERIC(5,2),
  summary         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qac_test_cases (
  id              SERIAL PRIMARY KEY,
  attempt_id      INT NOT NULL REFERENCES public.qac_attempts(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  preconditions   TEXT,
  steps           TEXT NOT NULL,
  expected_result TEXT NOT NULL,
  type            qac_test_case_type NOT NULL,
  priority        qac_priority_level NOT NULL DEFAULT 'medium',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qac_bug_reports (
  id                  SERIAL PRIMARY KEY,
  attempt_id          INT NOT NULL REFERENCES public.qac_attempts(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  steps_to_reproduce  TEXT NOT NULL,
  actual_result       TEXT NOT NULL,
  expected_result     TEXT NOT NULL,
  severity            qac_priority_level NOT NULL,
  priority            qac_priority_level NOT NULL,
  endpoint            TEXT NOT NULL,
  evidence            TEXT,
  bug_tag             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qac_scores (
  id                      SERIAL PRIMARY KEY,
  attempt_id              INT UNIQUE NOT NULL REFERENCES public.qac_attempts(id) ON DELETE CASCADE,
  test_design_score       NUMERIC(5,2) NOT NULL DEFAULT 0,
  api_validation_score    NUMERIC(5,2) NOT NULL DEFAULT 0,
  security_score          NUMERIC(5,2) NOT NULL DEFAULT 0,
  bug_reporting_score     NUMERIC(5,2) NOT NULL DEFAULT 0,
  executive_summary_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_score             NUMERIC(5,2) NOT NULL DEFAULT 0,
  bugs_found              INT NOT NULL DEFAULT 0,
  bugs_total              INT NOT NULL DEFAULT 12,
  feedback                TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Challenge simulation tables
CREATE TABLE IF NOT EXISTS public.challenge_users (
  id                   TEXT PRIMARY KEY,
  email                TEXT UNIQUE NOT NULL,
  password_hash        TEXT NOT NULL,
  display_name         TEXT NOT NULL,
  internal_risk_score  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.challenge_accounts (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES public.challenge_users(id),
  account_number    TEXT NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'PYG',
  balance           NUMERIC(15,2) NOT NULL,
  available_balance NUMERIC(15,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.challenge_sessions (
  id          TEXT PRIMARY KEY,
  attempt_id  INT REFERENCES public.qac_attempts(id),
  user_id     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '3 hours'
);

CREATE TABLE IF NOT EXISTS public.challenge_transfers (
  id               TEXT PRIMARY KEY,
  session_id       TEXT NOT NULL REFERENCES public.challenge_sessions(id),
  from_account_id  TEXT NOT NULL,
  to_account_id    TEXT NOT NULL,
  amount           NUMERIC(15,2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'PYG',
  description      TEXT,
  idempotency_key  TEXT,
  status           TEXT NOT NULL DEFAULT 'completed',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenge_movements (
  id           TEXT PRIMARY KEY,
  session_id   TEXT NOT NULL REFERENCES public.challenge_sessions(id),
  account_id   TEXT NOT NULL,
  transfer_id  TEXT REFERENCES public.challenge_transfers(id),
  type         TEXT NOT NULL CHECK (type IN ('debit','credit')),
  amount       NUMERIC(15,2) NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'PYG',
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qac_attempts_catalog       ON public.qac_attempts(catalog_id);
CREATE INDEX IF NOT EXISTS idx_qac_attempts_user          ON public.qac_attempts(aiquaa_user_id);
CREATE INDEX IF NOT EXISTS idx_qac_test_cases_attempt     ON public.qac_test_cases(attempt_id);
CREATE INDEX IF NOT EXISTS idx_qac_bug_reports_attempt    ON public.qac_bug_reports(attempt_id);
CREATE INDEX IF NOT EXISTS idx_challenge_sessions_attempt  ON public.challenge_sessions(attempt_id);
CREATE INDEX IF NOT EXISTS idx_challenge_transfers_session ON public.challenge_transfers(session_id);
CREATE INDEX IF NOT EXISTS idx_challenge_movements_session ON public.challenge_movements(session_id, account_id);

-- RLS off (service role only)
ALTER TABLE public.qac_catalog        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qac_attempts       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qac_test_cases     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qac_bug_reports    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qac_scores         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_users     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_accounts  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_sessions  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_movements DISABLE ROW LEVEL SECURITY;
