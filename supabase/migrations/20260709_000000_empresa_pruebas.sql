-- =========================================
-- Empresa pruebas: company-owned technical tests
-- Fully additive — zero changes to assessments*/exam_results tables or policies.
-- Reuses existing public.is_active_empresa_member() / public.auth_user_empresa_role()
-- and public.set_updated_at() defined in 20260505_000000_add_empresas_ruc_multiuser.sql.
-- =========================================

-- 1. empresa_pruebas
CREATE TABLE IF NOT EXISTS public.empresa_pruebas (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id       UUID        NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_by       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  title            TEXT        NOT NULL,
  category         TEXT        NOT NULL,
  description      TEXT,
  level            TEXT,
  duration_minutes INT,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS empresa_pruebas_empresa_idx ON public.empresa_pruebas (empresa_id);

DROP TRIGGER IF EXISTS empresa_pruebas_updated_at ON public.empresa_pruebas;
CREATE TRIGGER empresa_pruebas_updated_at
  BEFORE UPDATE ON public.empresa_pruebas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. empresa_preguntas
CREATE TABLE IF NOT EXISTS public.empresa_preguntas (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  prueba_id         UUID        NOT NULL REFERENCES public.empresa_pruebas(id) ON DELETE CASCADE,
  position          INT         NOT NULL,
  question_type     TEXT        NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_text')),
  prompt            TEXT        NOT NULL,
  options           JSONB,
  correct_answer    JSONB       NOT NULL,
  expected_keywords TEXT[],
  points            NUMERIC     NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS empresa_preguntas_prueba_position_idx
  ON public.empresa_preguntas (prueba_id, position);

-- 3. empresa_prueba_invitaciones
-- Named distinctly from the pre-existing public.empresa_invitaciones table
-- (candidate invitations to hiring processes — a different domain).
CREATE TABLE IF NOT EXISTS public.empresa_prueba_invitaciones (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  prueba_id       UUID        NOT NULL REFERENCES public.empresa_pruebas(id) ON DELETE CASCADE,
  token           TEXT        NOT NULL UNIQUE,
  candidate_email TEXT,
  candidate_name  TEXT,
  expires_at      TIMESTAMPTZ,
  max_attempts    INT         NOT NULL DEFAULT 1,
  status          TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS empresa_prueba_invitaciones_prueba_idx
  ON public.empresa_prueba_invitaciones (prueba_id);

-- 4. empresa_intentos
-- No RLS write policies for `authenticated` on purpose — candidates never touch
-- this table directly. All reads/writes on the candidate side go through server
-- actions using the service-role client, validated by invitation token.
CREATE TABLE IF NOT EXISTS public.empresa_intentos (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  prueba_id      UUID        NOT NULL REFERENCES public.empresa_pruebas(id) ON DELETE CASCADE,
  invitacion_id  UUID        NOT NULL REFERENCES public.empresa_prueba_invitaciones(id) ON DELETE CASCADE,
  candidate_name TEXT,
  candidate_email TEXT,
  started_at     TIMESTAMPTZ,
  submitted_at   TIMESTAMPTZ,
  answers        JSONB,
  score          NUMERIC,
  max_score      NUMERIC,
  breakdown      JSONB,
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS empresa_intentos_prueba_idx ON public.empresa_intentos (prueba_id);
CREATE INDEX IF NOT EXISTS empresa_intentos_invitacion_idx ON public.empresa_intentos (invitacion_id);

-- 5. RLS
ALTER TABLE public.empresa_pruebas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_preguntas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_prueba_invitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_intentos            ENABLE ROW LEVEL SECURITY;

-- empresa_pruebas: any active member of the empresa can read; only owner/admin can write.
CREATE POLICY "empresa_pruebas_members_read" ON public.empresa_pruebas
  FOR SELECT TO authenticated
  USING (public.is_active_empresa_member(empresa_id));

CREATE POLICY "empresa_pruebas_admin_write" ON public.empresa_pruebas
  FOR ALL TO authenticated
  USING     (public.auth_user_empresa_role(empresa_id) IN ('owner', 'admin'))
  WITH CHECK (public.auth_user_empresa_role(empresa_id) IN ('owner', 'admin'));

-- empresa_preguntas: scoped through the parent prueba's empresa_id.
CREATE POLICY "empresa_preguntas_members_read" ON public.empresa_preguntas
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.empresa_pruebas ep
      WHERE ep.id = empresa_preguntas.prueba_id
        AND public.is_active_empresa_member(ep.empresa_id)
    )
  );

CREATE POLICY "empresa_preguntas_admin_write" ON public.empresa_preguntas
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.empresa_pruebas ep
      WHERE ep.id = empresa_preguntas.prueba_id
        AND public.auth_user_empresa_role(ep.empresa_id) IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.empresa_pruebas ep
      WHERE ep.id = empresa_preguntas.prueba_id
        AND public.auth_user_empresa_role(ep.empresa_id) IN ('owner', 'admin')
    )
  );

-- empresa_prueba_invitaciones: scoped through the parent prueba's empresa_id.
CREATE POLICY "empresa_prueba_invitaciones_members_read" ON public.empresa_prueba_invitaciones
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.empresa_pruebas ep
      WHERE ep.id = empresa_prueba_invitaciones.prueba_id
        AND public.is_active_empresa_member(ep.empresa_id)
    )
  );

CREATE POLICY "empresa_prueba_invitaciones_admin_write" ON public.empresa_prueba_invitaciones
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.empresa_pruebas ep
      WHERE ep.id = empresa_prueba_invitaciones.prueba_id
        AND public.auth_user_empresa_role(ep.empresa_id) IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.empresa_pruebas ep
      WHERE ep.id = empresa_prueba_invitaciones.prueba_id
        AND public.auth_user_empresa_role(ep.empresa_id) IN ('owner', 'admin')
    )
  );

-- empresa_intentos: read-only for empresa members, scoped through prueba's empresa_id.
-- No INSERT/UPDATE/DELETE policy for `authenticated` — candidate flow writes via
-- the service-role client (apps/frontend/src/lib/supabase/admin.ts), bypassing RLS.
CREATE POLICY "empresa_intentos_members_read" ON public.empresa_intentos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.empresa_pruebas ep
      WHERE ep.id = empresa_intentos.prueba_id
        AND public.is_active_empresa_member(ep.empresa_id)
    )
  );
