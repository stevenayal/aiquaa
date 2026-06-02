-- =============================================================
-- Empresa: campos de perfil ampliados + tabla de invitaciones
-- =============================================================

-- 1. Ampliar tabla empresas
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS logo_url    TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS industry    TEXT,
  ADD COLUMN IF NOT EXISTS country     TEXT DEFAULT 'PY',
  ADD COLUMN IF NOT EXISTS team_size   TEXT;

-- 2. Tabla de invitaciones directas a candidatos
CREATE TABLE IF NOT EXISTS public.empresa_invitaciones (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id       UUID        NOT NULL REFERENCES public.empresas(id)         ON DELETE CASCADE,
  process_id       UUID        REFERENCES public.hiring_processes(id)          ON DELETE SET NULL,
  invited_by       UUID        NOT NULL REFERENCES public.profiles(id),
  candidate_email  TEXT        NOT NULL,
  candidate_name   TEXT,
  message          TEXT,
  status           TEXT        NOT NULL DEFAULT 'pendiente',
  token            UUID        DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  sent_at          TIMESTAMPTZ DEFAULT now(),
  viewed_at        TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS empresa_invitaciones_empresa_idx  ON public.empresa_invitaciones (empresa_id);
CREATE INDEX IF NOT EXISTS empresa_invitaciones_process_idx  ON public.empresa_invitaciones (process_id);
CREATE INDEX IF NOT EXISTS empresa_invitaciones_token_idx    ON public.empresa_invitaciones (token);
CREATE INDEX IF NOT EXISTS empresa_invitaciones_email_idx    ON public.empresa_invitaciones (candidate_email);

-- 3. RLS para empresa_invitaciones
ALTER TABLE public.empresa_invitaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_invitaciones_member_read"
  ON public.empresa_invitaciones FOR SELECT
  USING (is_active_empresa_member(empresa_id));

CREATE POLICY "empresa_invitaciones_member_insert"
  ON public.empresa_invitaciones FOR INSERT
  WITH CHECK (is_active_empresa_member(empresa_id));

CREATE POLICY "empresa_invitaciones_admin_update"
  ON public.empresa_invitaciones FOR UPDATE
  USING (is_active_empresa_member(empresa_id));

CREATE POLICY "empresa_invitaciones_admin_delete"
  ON public.empresa_invitaciones FOR DELETE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM empresa_miembros
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin')
    )
  );

-- Acceso público por token para que el candidato vea la invitación
CREATE POLICY "empresa_invitaciones_public_token_read"
  ON public.empresa_invitaciones FOR SELECT
  USING (token IS NOT NULL AND status IN ('pendiente', 'vista'));

-- 4. Favoritos/shortlist de candidatos
CREATE TABLE IF NOT EXISTS public.empresa_favoritos (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id   UUID        NOT NULL REFERENCES public.empresas(id)   ON DELETE CASCADE,
  candidate_id UUID        NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT empresa_favoritos_unique UNIQUE (empresa_id, candidate_id)
);

ALTER TABLE public.empresa_favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_favoritos_member_all"
  ON public.empresa_favoritos FOR ALL
  USING (is_active_empresa_member(empresa_id))
  WITH CHECK (is_active_empresa_member(empresa_id));

-- 5. Supabase Storage bucket para logos de empresas
INSERT INTO storage.buckets (id, name, public)
VALUES ('empresa-logos', 'empresa-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "empresa_logos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'empresa-logos');

CREATE POLICY "empresa_logos_member_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'empresa-logos'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "empresa_logos_member_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'empresa-logos'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "empresa_logos_member_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'empresa-logos'
    AND auth.uid() IS NOT NULL
  );

-- 6. Ampliar getEmpresaDashboardStats: agregar campo pending_prospects
--    (se calcula en server action, no requiere función SQL)
