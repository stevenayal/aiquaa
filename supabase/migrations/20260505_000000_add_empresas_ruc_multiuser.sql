-- =========================================
-- Empresas: RUC + multi-user membership
-- =========================================

-- 1. empresas table
CREATE TABLE IF NOT EXISTS public.empresas (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ruc              TEXT,
  razon_social     TEXT        NOT NULL,
  nombre_comercial TEXT,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT empresas_ruc_unique UNIQUE (ruc)
);

-- 2. Enums for member role / status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'empresa_member_role') THEN
    CREATE TYPE empresa_member_role AS ENUM ('owner', 'admin', 'member');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'empresa_member_status') THEN
    CREATE TYPE empresa_member_status AS ENUM ('pending', 'active', 'disabled');
  END IF;
END $$;

-- 3. empresa_miembros join table
CREATE TABLE IF NOT EXISTS public.empresa_miembros (
  id          UUID                  DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id  UUID                  NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id     UUID                  NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  role        empresa_member_role   NOT NULL DEFAULT 'member',
  status      empresa_member_status NOT NULL DEFAULT 'pending',
  invited_by  UUID                  REFERENCES public.profiles(id),
  invited_at  TIMESTAMPTZ           DEFAULT now() NOT NULL,
  joined_at   TIMESTAMPTZ,
  CONSTRAINT empresa_miembros_unique UNIQUE (empresa_id, user_id)
);

CREATE INDEX IF NOT EXISTS empresa_miembros_empresa_idx ON public.empresa_miembros (empresa_id);
CREATE INDEX IF NOT EXISTS empresa_miembros_user_idx    ON public.empresa_miembros (user_id);

-- 4. Add empresa_id + email to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id),
  ADD COLUMN IF NOT EXISTS email      TEXT;

-- 5. Add empresa_id to hiring_processes
ALTER TABLE public.hiring_processes
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

CREATE INDEX IF NOT EXISTS profiles_empresa_idx          ON public.profiles (empresa_id);
CREATE INDEX IF NOT EXISTS profiles_email_idx            ON public.profiles (email);
CREATE INDEX IF NOT EXISTS hiring_processes_empresa_idx  ON public.hiring_processes (empresa_id);

-- 6. Migrate existing empresa users → create empresa row + owner member
DO $$
DECLARE
  r            RECORD;
  v_empresa_id UUID;
BEGIN
  FOR r IN
    SELECT id, company_name
    FROM   public.profiles
    WHERE  audience    = 'empresa'
    AND    empresa_id IS NULL
  LOOP
    INSERT INTO public.empresas (razon_social, nombre_comercial)
    VALUES (
      COALESCE(r.company_name, 'Empresa sin nombre'),
      r.company_name
    )
    RETURNING id INTO v_empresa_id;

    UPDATE public.profiles SET empresa_id = v_empresa_id WHERE id = r.id;

    INSERT INTO public.empresa_miembros (empresa_id, user_id, role, status, joined_at)
    VALUES (v_empresa_id, r.id, 'owner', 'active', now())
    ON CONFLICT (empresa_id, user_id) DO NOTHING;
  END LOOP;
END $$;

-- 7. Backfill hiring_processes.empresa_id from owner's profile
UPDATE public.hiring_processes hp
SET    empresa_id = p.empresa_id
FROM   public.profiles p
WHERE  hp.created_by  = p.id
AND    p.empresa_id  IS NOT NULL
AND    hp.empresa_id IS NULL;

-- 8. Security-definer helpers (bypass RLS for internal checks)

-- Role of calling user in a given empresa (NULL if not active member)
CREATE OR REPLACE FUNCTION public.auth_user_empresa_role(p_empresa_id UUID)
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT role::TEXT
  FROM   public.empresa_miembros
  WHERE  user_id    = auth.uid()
  AND    empresa_id = p_empresa_id
  AND    status     = 'active'
  LIMIT 1;
$$;

-- TRUE if calling user is active member of given empresa
CREATE OR REPLACE FUNCTION public.is_active_empresa_member(p_empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.empresa_miembros
    WHERE  user_id    = auth.uid()
    AND    empresa_id = p_empresa_id
    AND    status     = 'active'
  );
$$;

-- Find a registered user by email for invitation (only callable by active admins/owners)
-- Returns user_id + full_name if found and not already a member of caller's empresa
CREATE OR REPLACE FUNCTION public.find_user_for_invite(p_email TEXT)
RETURNS TABLE (user_id UUID, full_name TEXT, already_member BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
DECLARE
  v_caller_empresa UUID;
BEGIN
  -- Caller must be active owner or admin
  SELECT empresa_id INTO v_caller_empresa
  FROM   public.profiles
  WHERE  id = auth.uid();

  IF v_caller_empresa IS NULL THEN
    RETURN;
  END IF;

  IF public.auth_user_empresa_role(v_caller_empresa) NOT IN ('owner', 'admin') THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id                                                              AS user_id,
    p.full_name,
    EXISTS (
      SELECT 1 FROM public.empresa_miembros em
      WHERE  em.user_id    = p.id
      AND    em.empresa_id = v_caller_empresa
    )                                                                  AS already_member
  FROM public.profiles p
  WHERE p.email = lower(trim(p_email))
  LIMIT 1;
END;
$$;

-- 9. RLS: empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresas_members_read" ON public.empresas
  FOR SELECT TO authenticated
  USING (id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "empresas_owner_admin_update" ON public.empresas
  FOR UPDATE TO authenticated
  USING     (public.auth_user_empresa_role(id) IN ('owner', 'admin'))
  WITH CHECK (public.auth_user_empresa_role(id) IN ('owner', 'admin'));

-- 10. RLS: empresa_miembros
ALTER TABLE public.empresa_miembros ENABLE ROW LEVEL SECURITY;

-- Any active member of same empresa sees the full member list; also see your own pending invite
CREATE POLICY "empresa_miembros_read" ON public.empresa_miembros
  FOR SELECT TO authenticated
  USING (
    empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
    OR user_id = auth.uid()
  );

-- Owner/admin can invite (INSERT)
CREATE POLICY "empresa_miembros_admin_insert" ON public.empresa_miembros
  FOR INSERT TO authenticated
  WITH CHECK (public.auth_user_empresa_role(empresa_id) IN ('owner', 'admin'));

-- Owner/admin can update member status/role (but not touch the owner row)
CREATE POLICY "empresa_miembros_admin_update" ON public.empresa_miembros
  FOR UPDATE TO authenticated
  USING (
    public.auth_user_empresa_role(empresa_id) IN ('owner', 'admin')
    AND role != 'owner'
  )
  WITH CHECK (public.auth_user_empresa_role(empresa_id) IN ('owner', 'admin'));

-- Invited user accepts their own pending invite
CREATE POLICY "empresa_miembros_self_accept" ON public.empresa_miembros
  FOR UPDATE TO authenticated
  USING     (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'active');

-- Owner/admin can remove non-owner members
CREATE POLICY "empresa_miembros_admin_delete" ON public.empresa_miembros
  FOR DELETE TO authenticated
  USING (
    public.auth_user_empresa_role(empresa_id) IN ('owner', 'admin')
    AND role   != 'owner'
    AND user_id != auth.uid()
  );

-- 11. Update hiring_processes RLS for multi-member access
DROP POLICY IF EXISTS "hiring_processes_owner_all"       ON public.hiring_processes;
DROP POLICY IF EXISTS "hiring_processes_empresa_access"  ON public.hiring_processes;

CREATE POLICY "hiring_processes_empresa_access" ON public.hiring_processes
  FOR ALL TO authenticated
  USING (
    created_by = auth.uid()
    OR (
      empresa_id IS NOT NULL
      AND public.is_active_empresa_member(empresa_id)
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR (
      empresa_id IS NOT NULL
      AND public.is_active_empresa_member(empresa_id)
    )
  );

-- 12. Updated handle_new_user: creates empresa + owner member on empresa registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_audience   audience_type;
  v_empresa_id UUID;
BEGIN
  v_audience := coalesce(
    (new.raw_user_meta_data ->> 'audience')::audience_type,
    'candidato'
  );

  INSERT INTO public.profiles (id, full_name, email, audience, company_name)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    v_audience,
    new.raw_user_meta_data ->> 'company_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name    = excluded.full_name,
    email        = excluded.email,
    audience     = excluded.audience,
    company_name = excluded.company_name;

  IF v_audience = 'empresa' THEN
    INSERT INTO public.empresas (ruc, razon_social, nombre_comercial)
    VALUES (
      NULLIF(trim(coalesce(new.raw_user_meta_data ->> 'ruc', '')), ''),
      coalesce(new.raw_user_meta_data ->> 'company_name', ''),
      new.raw_user_meta_data ->> 'company_name'
    )
    RETURNING id INTO v_empresa_id;

    UPDATE public.profiles
    SET empresa_id = v_empresa_id
    WHERE id = new.id;

    INSERT INTO public.empresa_miembros (empresa_id, user_id, role, status, joined_at)
    VALUES (v_empresa_id, new.id, 'owner', 'active', now());
  END IF;

  RETURN new;
END;
$$;

-- 13. updated_at trigger for empresas
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS empresas_updated_at ON public.empresas;
CREATE TRIGGER empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
