-- Candidate opt-in fields for the empresa talent directory.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS open_to_work BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS talent_visible_to_empresas BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS istqb_level TEXT,
  ADD COLUMN IF NOT EXISTS github_profile TEXT;

CREATE INDEX IF NOT EXISTS profiles_talent_directory_idx
  ON public.profiles (talent_visible_to_empresas, open_to_work, audience, istqb_level);
