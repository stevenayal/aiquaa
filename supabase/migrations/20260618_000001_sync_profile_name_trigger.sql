-- When a user updates their profile display_name, propagate it to qac_attempts.
-- exam_results is handled at read time via JOIN with profiles in the candidatos page.

CREATE OR REPLACE FUNCTION public.sync_profile_name_to_qac()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.display_name IS DISTINCT FROM NEW.display_name AND NEW.display_name IS NOT NULL AND NEW.display_name != '' THEN
    UPDATE public.qac_attempts
      SET candidate_name = NEW.display_name
    WHERE aiquaa_user_id = NEW.id::text;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_qac_candidate_name
  AFTER UPDATE OF display_name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_name_to_qac();
