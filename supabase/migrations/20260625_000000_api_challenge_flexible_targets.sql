-- Flexible API Testing Challenge targets

ALTER TABLE public.qac_attempts
  ADD COLUMN IF NOT EXISTS api_target TEXT NOT NULL DEFAULT 'rick-and-morty';

ALTER TABLE public.qac_attempts
  DROP CONSTRAINT IF EXISTS qac_attempts_api_target_check;

ALTER TABLE public.qac_attempts
  ADD CONSTRAINT qac_attempts_api_target_check
  CHECK (api_target IN ('chuck-norris', 'rick-and-morty', 'nasa'));

UPDATE public.qac_catalog
SET
  title = 'API Testing - Challenge practico',
  description = 'Prueba tecnica flexible de API Testing con APIs publicas. El candidato elige entre Chuck Norris, NASA o Rick and Morty, disena casos de prueba, documenta hallazgos reproducibles y recibe un score automatico de 100 pts.',
  duration_minutes = 105,
  updated_at = now()
WHERE slug = 'api-banking';

UPDATE public.xp_rules
SET description = 'Completar el API Testing Challenge practico'
WHERE event_type = 'API_BANKING_COMPLETED';

UPDATE public.xp_rules
SET description = 'Aprobar el API Testing Challenge practico (score >= 60)'
WHERE event_type = 'API_BANKING_PASSED';

UPDATE public.xp_rules
SET description = 'Score sobresaliente en API Testing Challenge practico (>= 90)'
WHERE event_type = 'API_BANKING_HIGH_SCORE';
