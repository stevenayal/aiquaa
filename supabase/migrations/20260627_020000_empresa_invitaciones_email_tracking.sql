-- #197 / #204 / #177: groundwork for tracking invitation email delivery.
-- Adds delivery-status columns so the app can record whether the candidate
-- email was sent and surface failures, WITHOUT yet wiring Resend or sending
-- any real email. Email sending stays behind the EMAIL_SENDING_ENABLED flag.
--
-- Additive only: ADD COLUMN IF NOT EXISTS. No drops, no data deletion.

ALTER TABLE public.empresa_invitaciones
  ADD COLUMN IF NOT EXISTS email_sent  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_error text;

COMMENT ON COLUMN public.empresa_invitaciones.email_sent IS
  'Whether the candidate notification email was successfully sent. False while EMAIL_SENDING_ENABLED is off.';
COMMENT ON COLUMN public.empresa_invitaciones.email_error IS
  'Last email delivery error message, when sending failed.';
