-- =============================================================================
-- Webhook: notificación a admin cuando se crea una empresa nueva
-- Dispara la Edge Function `nueva-empresa-alert` en cada INSERT a `empresas`.
-- Requiere extensión pg_net (habilitada por defecto en Supabase Cloud).
-- =============================================================================

-- Función que dispara el webhook vía pg_net
CREATE OR REPLACE FUNCTION public.notify_nueva_empresa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url     TEXT;
  v_secret  TEXT;
  v_payload JSONB;
BEGIN
  -- URL de la Edge Function — reemplazar <PROJECT_REF> con el ref real de Supabase
  v_url := current_setting('app.supabase_functions_url', true);

  -- Si no está configurada la URL, salir silenciosamente (dev local sin edge functions)
  IF v_url IS NULL OR v_url = '' THEN
    RETURN NEW;
  END IF;

  v_secret := current_setting('app.webhook_secret', true);

  v_payload := jsonb_build_object(
    'type',       TG_OP,
    'table',      TG_TABLE_NAME,
    'record',     row_to_json(NEW)::jsonb,
    'old_record', NULL
  );

  PERFORM net.http_post(
    url     := v_url || '/nueva-empresa-alert',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || coalesce(v_secret, '')
    ),
    body    := v_payload::text
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- No fallar el INSERT si el webhook falla
  RAISE WARNING 'notify_nueva_empresa: %', SQLERRM;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.notify_nueva_empresa IS
  'Dispara la Edge Function nueva-empresa-alert al crear una empresa. '
  'Requiere app.supabase_functions_url configurado via ALTER DATABASE SET.';

-- Trigger: AFTER INSERT en empresas
DROP TRIGGER IF EXISTS trg_notify_nueva_empresa ON public.empresas;
CREATE TRIGGER trg_notify_nueva_empresa
  AFTER INSERT ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_nueva_empresa();
