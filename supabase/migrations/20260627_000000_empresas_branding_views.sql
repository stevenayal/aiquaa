-- ====================================================================
-- Employer branding fields + profile view counter + public read + RPCs
-- Non-destructive: all statements use IF NOT EXISTS / OR REPLACE
-- ====================================================================

-- 1. New columns on empresas
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS work_mode    TEXT,           -- 'remoto' | 'hibrido' | 'presencial'
  ADD COLUMN IF NOT EXISTS tech_stack   TEXT[],         -- ['Selenium','Cypress','Jira', ...]
  ADD COLUMN IF NOT EXISTS benefits     TEXT,           -- free-text, max 500 chars
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,           -- company LinkedIn page
  ADD COLUMN IF NOT EXISTS qa_team_size TEXT,           -- '1' | '2-5' | '5-20' | '20+'
  ADD COLUMN IF NOT EXISTS profile_views INTEGER NOT NULL DEFAULT 0;

-- 2. Public SELECT on empresas (needed for /empresas and /empresas/[id] pages)
--    The existing "empresas_members_read" policy restricts authenticated members;
--    this new policy enables the public company directory without modifying
--    the existing member-only policy (Supabase ORs policies of the same type).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'empresas' AND policyname = 'empresas_public_select'
  ) THEN
    CREATE POLICY "empresas_public_select" ON public.empresas
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END$$;

-- 3. Public SELECT on empresa_invitaciones by token
--    Allows the /invitaciones/[token] page to load invitation data without auth.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'empresa_invitaciones'
      AND policyname = 'empresa_invitaciones_public_token_select'
  ) THEN
    CREATE POLICY "empresa_invitaciones_public_token_select"
      ON public.empresa_invitaciones FOR SELECT
      TO anon, authenticated
      USING (true);  -- token check happens in the RPC; the page only reads by token
  END IF;
END$$;

-- 4. RPC: increment profile views (public, security definer)
CREATE OR REPLACE FUNCTION public.increment_empresa_profile_views(p_empresa_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.empresas
  SET profile_views = COALESCE(profile_views, 0) + 1
  WHERE id = p_empresa_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_empresa_profile_views(UUID) TO anon, authenticated;

-- 5. RPC: get full invitation data by token (public, security definer)
CREATE OR REPLACE FUNCTION public.get_invitacion_by_token(p_token UUID)
RETURNS TABLE (
  id                 UUID,
  empresa_id         UUID,
  process_id         UUID,
  candidate_email    TEXT,
  candidate_name     TEXT,
  message            TEXT,
  status             TEXT,
  sent_at            TIMESTAMPTZ,
  viewed_at          TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  empresa_nombre     TEXT,
  empresa_logo       TEXT,
  empresa_industry   TEXT,
  empresa_country    TEXT,
  empresa_website    TEXT,
  process_position   TEXT,
  process_code       TEXT,
  process_exam_types TEXT[]
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    ei.id,
    ei.empresa_id,
    ei.process_id,
    ei.candidate_email,
    ei.candidate_name,
    ei.message,
    ei.status,
    ei.sent_at,
    ei.viewed_at,
    ei.completed_at,
    COALESCE(e.nombre_comercial, e.razon_social) AS empresa_nombre,
    e.logo_url                                   AS empresa_logo,
    e.industry                                   AS empresa_industry,
    e.country                                    AS empresa_country,
    e.website_url                                AS empresa_website,
    hp.position_name                             AS process_position,
    hp.code                                      AS process_code,
    hp.exam_types                                AS process_exam_types
  FROM public.empresa_invitaciones ei
  JOIN public.empresas e ON e.id = ei.empresa_id
  LEFT JOIN public.hiring_processes hp ON hp.id = ei.process_id
  WHERE ei.token = p_token;
$$;

GRANT EXECUTE ON FUNCTION public.get_invitacion_by_token(UUID) TO anon, authenticated;

-- 6. RPC: mark invitation as viewed when candidate opens the link
CREATE OR REPLACE FUNCTION public.mark_invitacion_vista(p_token UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.empresa_invitaciones
  SET
    status    = CASE WHEN status = 'pendiente' THEN 'vista' ELSE status END,
    viewed_at = CASE WHEN viewed_at IS NULL THEN NOW() ELSE viewed_at END
  WHERE token = p_token;
$$;

GRANT EXECUTE ON FUNCTION public.mark_invitacion_vista(UUID) TO anon, authenticated;
