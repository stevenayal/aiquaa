-- Cuenta TODOS los usuarios registrados, no solo audience='candidato'.
-- En produccion la funcion habia derivado a un filtro WHERE audience='candidato',
-- devolviendo el conteo de candidatos (~36) en vez del total real de
-- registrados (~80). Esta migracion re-asegura el conteo completo de perfiles.
CREATE OR REPLACE FUNCTION public.get_registered_user_count()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.profiles;
$$;

GRANT EXECUTE ON FUNCTION public.get_registered_user_count() TO anon, authenticated;
