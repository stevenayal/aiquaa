-- Fix #319: handle_new_user() fell back to an empty string ('') for
-- display_name whenever raw_user_meta_data had no 'full_name' (email/password
-- signups with no name field, some OAuth providers). An empty string is not
-- NULL, so it silently reached profiles/ranking_candidatos and rendered as a
-- blank name on the public leaderboard. Confirmed in production: 8 profiles
-- affected since 2026-05-09, still occurring on new signups as of 2026-08-19.
--
-- This migration only changes the fallback for *future* signups (derive a
-- name from the email local-part instead of ''). It intentionally does not
-- backfill the 8 existing empty rows in public.profiles /
-- public.ranking_candidatos — that's a data change on production and should
-- go through human review separately, not ship inside a trigger fix.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_audience     audience_type;
  v_empresa_id   UUID;
  v_display_name TEXT;
BEGIN
  v_audience := coalesce(
    (new.raw_user_meta_data ->> 'audience')::audience_type,
    'candidato'
  );

  -- Prefer full_name from auth metadata; fall back to the email local-part
  -- (never an empty string) so the leaderboard/profile never render blank.
  v_display_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  IF v_display_name IS NULL THEN
    v_display_name := nullif(split_part(coalesce(new.email, ''), '@', 1), '');
  END IF;

  INSERT INTO public.profiles (id, display_name, email, audience, company_name)
  VALUES (
    new.id,
    v_display_name,
    new.email,
    v_audience,
    new.raw_user_meta_data ->> 'company_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = excluded.display_name,
    email        = excluded.email,
    audience     = excluded.audience,
    company_name = excluded.company_name;

  IF v_audience = 'empresa' THEN
    INSERT INTO public.empresas (ruc, razon_social, nombre_comercial)
    VALUES (
      NULLIF(trim(coalesce(new.raw_user_meta_data ->> 'ruc', '')), ''),
      coalesce(new.raw_user_meta_data ->> 'company_name', 'Empresa sin nombre'),
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
$function$;
