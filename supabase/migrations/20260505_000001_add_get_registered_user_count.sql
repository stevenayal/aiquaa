CREATE OR REPLACE FUNCTION public.get_registered_user_count()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*) FROM public.profiles;
$$;

GRANT EXECUTE ON FUNCTION public.get_registered_user_count() TO anon, authenticated;
