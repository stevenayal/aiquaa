-- =============================================================================
-- AIQUAA Pro — Sistema de Sesiones y Lista de Espera
-- Migration: 20260510000000_waitlist_sessions.sql
-- PostgreSQL 15 / Supabase
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONES
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- para gen_random_uuid()

-- ---------------------------------------------------------------------------
-- TIPOS ENUM
-- ---------------------------------------------------------------------------

-- Tipo de sesión disponible en AIQUAA Pro
CREATE TYPE session_type AS ENUM ('cohort', 'workshop', 'mentorship', 'lab');

-- Modalidad de cursado
CREATE TYPE session_mode AS ENUM ('sync', 'async', 'hybrid');

-- Estado del ciclo de vida de una sesión
CREATE TYPE session_status AS ENUM (
  'draft',        -- en preparación, no visible al público
  'open',         -- inscripción abierta
  'full',         -- sin cupos disponibles
  'in_progress',  -- ya iniciada
  'completed',    -- finalizada
  'cancelled'     -- cancelada
);

-- Rol profesional declarado por el interesado
CREATE TYPE participant_role AS ENUM (
  'junior_tester',
  'senior_tester',
  'qa_lead',
  'developer',
  'student',
  'other'
);

-- Origen del registro en la lista de espera
CREATE TYPE entry_source AS ENUM (
  'organic',
  'linkedin',
  'youtube',
  'referral',
  'github',
  'other'
);

-- Estado del registro en la lista de espera
CREATE TYPE entry_status AS ENUM (
  'waiting',   -- en espera
  'invited',   -- invitación enviada, pendiente de respuesta
  'enrolled',  -- confirmó y está inscripto
  'declined',  -- rechazó la invitación
  'expired'    -- la invitación venció sin respuesta
);

-- Estado de una invitación individual
CREATE TYPE invitation_status AS ENUM (
  'pending',   -- enviada, sin respuesta
  'accepted',  -- aceptada por el interesado
  'declined',  -- rechazada por el interesado
  'expired'    -- venció sin respuesta
);

-- ---------------------------------------------------------------------------
-- TABLA: sessions
-- Representa una cohorte, taller, mentoría o lab disponible en AIQUAA Pro.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  -- Identificador único de la sesión
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Título descriptivo (ej: "Cohorte ISTQB CTFL v4.0 — Junio 2025")
  title             TEXT            NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),

  -- Tipo de sesión
  type              session_type    NOT NULL,

  -- Descripción larga en markdown o texto plano
  description       TEXT,

  -- Nombre del instructor responsable
  instructor_name   TEXT            NOT NULL,

  -- Email del instructor (para contacto interno, no se expone al público)
  instructor_email  TEXT            NOT NULL CHECK (instructor_email ~* '^[^@]+@[^@]+\.[^@]+$'),

  -- Modalidad de cursado
  mode              session_mode    NOT NULL DEFAULT 'sync',

  -- Idioma principal de la sesión
  language          CHAR(2)         NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),

  -- Cupos totales; NULL significa cupos ilimitados
  capacity          INTEGER         CHECK (capacity > 0),

  -- Contador de inscriptos actuales — lo mantiene un trigger automáticamente
  enrolled_count    INTEGER         NOT NULL DEFAULT 0 CHECK (enrolled_count >= 0),

  -- Estado actual de la sesión
  status            session_status  NOT NULL DEFAULT 'draft',

  -- Fecha y hora de inicio (NULL si todavía no está definida)
  starts_at         TIMESTAMPTZ,

  -- Fecha y hora estimada de fin
  ends_at           TIMESTAMPTZ,

  -- Precio en USD; 0 = gratuito
  price_usd         NUMERIC(10, 2)  NOT NULL DEFAULT 0 CHECK (price_usd >= 0),

  -- Etiquetas para filtrado y categorización (ej: ["ISTQB", "Playwright"])
  tags              TEXT[]          NOT NULL DEFAULT '{}',

  -- Campo libre JSONB para datos adicionales (syllabus, links, etc.)
  metadata          JSONB           NOT NULL DEFAULT '{}',

  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  -- enrolled_count nunca puede superar capacity cuando capacity está definida
  CONSTRAINT sessions_enrolled_lte_capacity
    CHECK (capacity IS NULL OR enrolled_count <= capacity)
);

COMMENT ON TABLE  public.sessions IS 'Sesiones abiertas disponibles en AIQUAA Pro (cohortes, talleres, mentorías, labs).';
COMMENT ON COLUMN public.sessions.id               IS 'PK UUID generado automáticamente.';
COMMENT ON COLUMN public.sessions.title            IS 'Nombre público de la sesión.';
COMMENT ON COLUMN public.sessions.type             IS 'Categoría: cohort | workshop | mentorship | lab.';
COMMENT ON COLUMN public.sessions.description      IS 'Descripción larga; acepta markdown.';
COMMENT ON COLUMN public.sessions.instructor_name  IS 'Nombre completo del instructor.';
COMMENT ON COLUMN public.sessions.instructor_email IS 'Email del instructor (uso interno).';
COMMENT ON COLUMN public.sessions.mode             IS 'Modalidad: sync | async | hybrid.';
COMMENT ON COLUMN public.sessions.language         IS 'Código ISO 639-1 del idioma principal.';
COMMENT ON COLUMN public.sessions.capacity         IS 'Cupos totales. NULL = sin límite.';
COMMENT ON COLUMN public.sessions.enrolled_count   IS 'Cantidad de inscriptos. Mantenido por trigger.';
COMMENT ON COLUMN public.sessions.status           IS 'Estado del ciclo de vida de la sesión.';
COMMENT ON COLUMN public.sessions.starts_at        IS 'Fecha/hora de inicio (puede ser NULL si no está definida aún).';
COMMENT ON COLUMN public.sessions.ends_at          IS 'Fecha/hora estimada de finalización.';
COMMENT ON COLUMN public.sessions.price_usd        IS 'Precio en USD. 0 = gratuito.';
COMMENT ON COLUMN public.sessions.tags             IS 'Array de etiquetas para filtros (ej: ISTQB, Playwright, Beginner).';
COMMENT ON COLUMN public.sessions.metadata         IS 'JSONB flexible para datos adicionales (syllabus, links, etc.).';
COMMENT ON COLUMN public.sessions.created_at       IS 'Timestamp de creación del registro.';
COMMENT ON COLUMN public.sessions.updated_at       IS 'Timestamp de última modificación (mantenido por trigger).';

-- ---------------------------------------------------------------------------
-- TABLA: waitlist_entries
-- Registro de una persona interesada en una sesión o en AIQUAA Pro en general.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  -- Identificador único del registro
  id                    UUID              PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FK a sessions; NULL indica lista de espera general de AIQUAA Pro
  session_id            UUID              REFERENCES public.sessions (id) ON DELETE SET NULL,

  -- Email del interesado — único activo por sesión (ver constraint parcial abajo)
  email                 TEXT              NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),

  -- Nombre completo del interesado
  full_name             TEXT              NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 150),

  -- País en formato ISO 3166-1 alpha-2 (ej: PY, AR, MX)
  country               CHAR(2)           NOT NULL,

  -- Ciudad (opcional)
  city                  TEXT,

  -- Rol profesional declarado
  current_role          participant_role  NOT NULL,

  -- Si ya posee alguna certificación ISTQB
  has_istqb             BOOLEAN           NOT NULL DEFAULT false,

  -- Años de experiencia en QA
  experience_years      INTEGER           NOT NULL DEFAULT 0 CHECK (experience_years >= 0),

  -- Motivación libre (máx. 500 caracteres)
  motivation            TEXT              CHECK (char_length(motivation) <= 500),

  -- Canal de origen del registro
  source                entry_source      NOT NULL DEFAULT 'organic',

  -- Código de referido si aplica
  referral_code         TEXT,

  -- Estado actual del registro
  status                entry_status      NOT NULL DEFAULT 'waiting',

  -- Timestamp cuando se envió la invitación
  invited_at            TIMESTAMPTZ,

  -- Timestamp cuando respondió la invitación (aceptó o rechazó)
  responded_at          TIMESTAMPTZ,

  -- Notas internas del equipo AIQUAA (no visible al interesado)
  notes                 TEXT,

  -- Campo libre JSONB para datos adicionales del formulario
  metadata              JSONB             NOT NULL DEFAULT '{}',

  -- Consentimiento de privacidad — requerido antes de enviar el formulario
  privacy_accepted      BOOLEAN           NOT NULL DEFAULT false,

  -- Timestamp del momento en que se registró el consentimiento
  privacy_accepted_at   TIMESTAMPTZ,

  created_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.waitlist_entries IS 'Lista de espera: personas interesadas en una sesión específica o en AIQUAA Pro en general.';
COMMENT ON COLUMN public.waitlist_entries.id                  IS 'PK UUID generado automáticamente.';
COMMENT ON COLUMN public.waitlist_entries.session_id          IS 'FK a sessions. NULL = lista general de AIQUAA Pro.';
COMMENT ON COLUMN public.waitlist_entries.email               IS 'Email del interesado. Único por sesión en estados activos.';
COMMENT ON COLUMN public.waitlist_entries.full_name           IS 'Nombre completo.';
COMMENT ON COLUMN public.waitlist_entries.country             IS 'País ISO 3166-1 alpha-2 (ej: PY, AR, MX, BR).';
COMMENT ON COLUMN public.waitlist_entries.city                IS 'Ciudad (opcional).';
COMMENT ON COLUMN public.waitlist_entries.current_role        IS 'Rol profesional autodeclarado.';
COMMENT ON COLUMN public.waitlist_entries.has_istqb           IS 'True si ya posee certificación ISTQB.';
COMMENT ON COLUMN public.waitlist_entries.experience_years    IS 'Años de experiencia en QA (>= 0).';
COMMENT ON COLUMN public.waitlist_entries.motivation          IS 'Texto libre: por qué quiere unirse. Máx. 500 chars.';
COMMENT ON COLUMN public.waitlist_entries.source              IS 'Canal de origen: organic | linkedin | youtube | referral | github | other.';
COMMENT ON COLUMN public.waitlist_entries.referral_code       IS 'Código de referido si aplica.';
COMMENT ON COLUMN public.waitlist_entries.status              IS 'Estado: waiting | invited | enrolled | declined | expired.';
COMMENT ON COLUMN public.waitlist_entries.invited_at          IS 'Timestamp del envío de la invitación.';
COMMENT ON COLUMN public.waitlist_entries.responded_at        IS 'Timestamp de la respuesta del interesado.';
COMMENT ON COLUMN public.waitlist_entries.notes               IS 'Notas internas del equipo AIQUAA. No visible al interesado.';
COMMENT ON COLUMN public.waitlist_entries.metadata            IS 'JSONB flexible para datos adicionales del formulario.';
COMMENT ON COLUMN public.waitlist_entries.privacy_accepted    IS 'True si el interesado aceptó el aviso de privacidad. Requerido para LATAM compliance.';
COMMENT ON COLUMN public.waitlist_entries.privacy_accepted_at IS 'Timestamp del consentimiento. Se setea al registrar.';
COMMENT ON COLUMN public.waitlist_entries.created_at          IS 'Timestamp de creación del registro.';
COMMENT ON COLUMN public.waitlist_entries.updated_at          IS 'Timestamp de última modificación (mantenido por trigger).';

-- Un mismo email no puede tener más de un registro activo (waiting | invited) por sesión
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_entries_unique_active_per_session
  ON public.waitlist_entries (session_id, lower(email))
  WHERE status IN ('waiting', 'invited');

-- Un email no puede tener más de un registro activo en la lista general (session_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_entries_unique_active_general
  ON public.waitlist_entries (lower(email))
  WHERE session_id IS NULL AND status IN ('waiting', 'invited');

-- ---------------------------------------------------------------------------
-- TABLA: waitlist_invitations
-- Invitaciones individuales emitidas desde la lista de espera hacia una sesión.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist_invitations (
  -- Identificador único de la invitación
  id           UUID               PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FK al registro de lista de espera que originó la invitación
  entry_id     UUID               NOT NULL REFERENCES public.waitlist_entries (id) ON DELETE CASCADE,

  -- FK a la sesión a la que se invita (puede diferir de entry.session_id si es lista general)
  session_id   UUID               NOT NULL REFERENCES public.sessions (id) ON DELETE CASCADE,

  -- Token único para el link de confirmación (page pública de aceptar/rechazar)
  token        UUID               NOT NULL UNIQUE DEFAULT gen_random_uuid(),

  -- Timestamp de envío de la invitación
  sent_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  -- Fecha/hora de vencimiento de la invitación
  expires_at   TIMESTAMPTZ        NOT NULL,

  -- Timestamp de aceptación
  accepted_at  TIMESTAMPTZ,

  -- Timestamp de rechazo
  declined_at  TIMESTAMPTZ,

  -- Estado de la invitación
  status       invitation_status  NOT NULL DEFAULT 'pending',

  created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  -- No puede aceptar y rechazar al mismo tiempo
  CONSTRAINT invitations_not_both_accepted_declined
    CHECK (NOT (accepted_at IS NOT NULL AND declined_at IS NOT NULL)),

  -- expires_at siempre posterior a sent_at
  CONSTRAINT invitations_expires_after_sent
    CHECK (expires_at > sent_at)
);

COMMENT ON TABLE  public.waitlist_invitations IS 'Invitaciones emitidas desde la lista de espera. Cada una tiene un token único para confirmar o rechazar.';
COMMENT ON COLUMN public.waitlist_invitations.id          IS 'PK UUID generado automáticamente.';
COMMENT ON COLUMN public.waitlist_invitations.entry_id    IS 'FK al registro de waitlist_entries que originó la invitación.';
COMMENT ON COLUMN public.waitlist_invitations.session_id  IS 'FK a la sesión a la que se invita.';
COMMENT ON COLUMN public.waitlist_invitations.token       IS 'UUID único para el link público de confirmación. No adivinar.';
COMMENT ON COLUMN public.waitlist_invitations.sent_at     IS 'Timestamp de envío del email de invitación.';
COMMENT ON COLUMN public.waitlist_invitations.expires_at  IS 'Fecha/hora de vencimiento. Tras esta fecha, la invitación expira.';
COMMENT ON COLUMN public.waitlist_invitations.accepted_at IS 'Timestamp de aceptación por parte del interesado.';
COMMENT ON COLUMN public.waitlist_invitations.declined_at IS 'Timestamp de rechazo por parte del interesado.';
COMMENT ON COLUMN public.waitlist_invitations.status      IS 'Estado: pending | accepted | declined | expired.';
COMMENT ON COLUMN public.waitlist_invitations.created_at  IS 'Timestamp de creación del registro.';
COMMENT ON COLUMN public.waitlist_invitations.updated_at  IS 'Timestamp de última modificación (mantenido por trigger).';

-- =============================================================================
-- ÍNDICES
-- =============================================================================

-- sessions: búsquedas frecuentes por estado, tipo y fecha de inicio
CREATE INDEX IF NOT EXISTS idx_sessions_status        ON public.sessions (status);
CREATE INDEX IF NOT EXISTS idx_sessions_type          ON public.sessions (type);
CREATE INDEX IF NOT EXISTS idx_sessions_starts_at     ON public.sessions (starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_tags          ON public.sessions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_sessions_status_starts ON public.sessions (status, starts_at)
  WHERE status IN ('open', 'full', 'in_progress');

-- waitlist_entries: búsquedas por sesión, email, estado y país
CREATE INDEX IF NOT EXISTS idx_waitlist_session_id    ON public.waitlist_entries (session_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_email         ON public.waitlist_entries (lower(email));
CREATE INDEX IF NOT EXISTS idx_waitlist_status        ON public.waitlist_entries (status);
CREATE INDEX IF NOT EXISTS idx_waitlist_country       ON public.waitlist_entries (country);
CREATE INDEX IF NOT EXISTS idx_waitlist_source        ON public.waitlist_entries (source);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at    ON public.waitlist_entries (created_at);

-- waitlist_invitations: búsqueda por token (página pública), entry y sesión
CREATE INDEX IF NOT EXISTS idx_invitations_token      ON public.waitlist_invitations (token);
CREATE INDEX IF NOT EXISTS idx_invitations_entry_id   ON public.waitlist_invitations (entry_id);
CREATE INDEX IF NOT EXISTS idx_invitations_session_id ON public.waitlist_invitations (session_id);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON public.waitlist_invitations (expires_at)
  WHERE status = 'pending';

-- =============================================================================
-- FUNCIONES Y TRIGGERS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Trigger genérico: actualiza updated_at en cada UPDATE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_waitlist_entries_updated_at
  BEFORE UPDATE ON public.waitlist_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_waitlist_invitations_updated_at
  BEFORE UPDATE ON public.waitlist_invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Función: privacy_accepted_at se setea automáticamente al aceptar privacidad
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_privacy_accepted_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si privacy_accepted cambia a true y aún no tiene timestamp, lo seteamos ahora
  IF NEW.privacy_accepted = true AND OLD.privacy_accepted = false AND NEW.privacy_accepted_at IS NULL THEN
    NEW.privacy_accepted_at = NOW();
  END IF;
  -- En INSERT con privacy_accepted = true
  IF TG_OP = 'INSERT' AND NEW.privacy_accepted = true AND NEW.privacy_accepted_at IS NULL THEN
    NEW.privacy_accepted_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_waitlist_privacy_accepted_at
  BEFORE INSERT OR UPDATE ON public.waitlist_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_privacy_accepted_at();

-- ---------------------------------------------------------------------------
-- 1. update_enrolled_count()
-- Mantiene sessions.enrolled_count sincronizado cuando cambia
-- waitlist_entries.status hacia o desde 'enrolled'.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_enrolled_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Determinar qué session_id afecta esta operación
  IF TG_OP = 'DELETE' THEN
    v_session_id := OLD.session_id;
  ELSE
    v_session_id := NEW.session_id;
  END IF;

  -- Solo actuar si hay sesión asociada
  IF v_session_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Recalcular el count directamente (más seguro que +1/-1 ante concurrencia)
  UPDATE public.sessions
  SET enrolled_count = (
    SELECT COUNT(*)
    FROM public.waitlist_entries
    WHERE session_id = v_session_id
      AND status = 'enrolled'
  )
  WHERE id = v_session_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.update_enrolled_count IS
  'Trigger: recalcula sessions.enrolled_count cuando cambia waitlist_entries.status.';

CREATE TRIGGER trg_update_enrolled_count
  AFTER INSERT OR UPDATE OF status OR DELETE
  ON public.waitlist_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_enrolled_count();

-- ---------------------------------------------------------------------------
-- 2. update_session_status()
-- Cambia sessions.status a 'full' cuando enrolled_count >= capacity,
-- o de vuelta a 'open' si baja y la sesión estaba 'full'.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_session_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo actuar cuando capacity está definida
  IF NEW.capacity IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.enrolled_count >= NEW.capacity AND NEW.status = 'open' THEN
    NEW.status := 'full';
  ELSIF NEW.enrolled_count < NEW.capacity AND NEW.status = 'full' THEN
    NEW.status := 'open';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_session_status IS
  'Trigger: ajusta sessions.status a full/open automáticamente según enrolled_count vs capacity.';

CREATE TRIGGER trg_update_session_status
  BEFORE UPDATE OF enrolled_count ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_session_status();

-- ---------------------------------------------------------------------------
-- 3. expire_invitations()
-- Marca como 'expired' las invitaciones vencidas con status 'pending'.
-- Ejecutar periódicamente con pg_cron o desde la app.
-- Ejemplo pg_cron: SELECT cron.schedule('expire-invitations', '*/15 * * * *',
--   'SELECT public.expire_invitations()');
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.expire_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH expired AS (
    UPDATE public.waitlist_invitations
    SET
      status     = 'expired',
      updated_at = NOW()
    WHERE
      status     = 'pending'
      AND expires_at < NOW()
    RETURNING entry_id
  ),
  -- Marcar también los entries correspondientes como expired si siguen en 'invited'
  entries_expired AS (
    UPDATE public.waitlist_entries we
    SET
      status     = 'expired',
      updated_at = NOW()
    FROM expired e
    WHERE we.id = e.entry_id
      AND we.status = 'invited'
    RETURNING we.id
  )
  SELECT COUNT(*) INTO v_count FROM expired;

  RETURN v_count; -- devuelve cuántas invitaciones se marcaron como expiradas
END;
$$;

COMMENT ON FUNCTION public.expire_invitations IS
  'Marca como expired las invitaciones vencidas (expires_at < NOW() y status = pending). '
  'Ejecutar con pg_cron cada 15 min o desde la app. Retorna cantidad de invitaciones expiradas.';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_invitations ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- sessions: lectura pública de sesiones visibles; escritura solo service role
-- ---------------------------------------------------------------------------
CREATE POLICY sessions_public_read
  ON public.sessions
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('open', 'full', 'in_progress'));

CREATE POLICY sessions_service_all
  ON public.sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- waitlist_entries: inserción pública; lectura/modificación solo service role
-- ---------------------------------------------------------------------------
CREATE POLICY waitlist_entries_public_insert
  ON public.waitlist_entries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY waitlist_entries_service_all
  ON public.waitlist_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- waitlist_invitations: lectura pública solo por token; resto solo service role
-- ---------------------------------------------------------------------------

-- Función helper para extraer el token desde el request (pasado como parámetro de app)
-- La app debe hacer: SET LOCAL app.invitation_token = '<uuid>';
CREATE POLICY waitlist_invitations_public_read_by_token
  ON public.waitlist_invitations
  FOR SELECT
  TO anon, authenticated
  USING (token = current_setting('app.invitation_token', true)::UUID);

CREATE POLICY waitlist_invitations_service_all
  ON public.waitlist_invitations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- SEED DATA — Datos de ejemplo
-- =============================================================================

-- Sesión 1: Cohorte ISTQB CTFL v4.0
INSERT INTO public.sessions (
  id, title, type, description, instructor_name, instructor_email,
  mode, language, capacity, status, starts_at, ends_at,
  price_usd, tags, metadata
) VALUES (
  '11111111-0000-0000-0000-000000000001',
  'Cohorte ISTQB CTFL v4.0 — Agosto 2026',
  'cohort',
  E'Preparación intensiva para el examen de certificación ISTQB Foundation Level v4.0.\n\n'
  '**Incluye:**\n- 8 semanas de clases en vivo (2 sesiones/semana)\n'
  '- Acceso a banco de preguntas con +500 ejercicios\n'
  '- Simulacro de examen oficial\n- Mentoría grupal\n\n'
  '**Requisito:** Ninguno. Ideal para quienes inician en QA.',
  'Lucía Martínez',
  'lucia.martinez@aiquaa.com',
  'sync',
  'es',
  30,
  'open',
  '2026-08-04 19:00:00-03',
  '2026-09-29 21:00:00-03',
  149.00,
  ARRAY['ISTQB', 'CTFL', 'Fundamentos', 'Certificación', 'Beginner'],
  '{"syllabus_url": "https://aiquaa.com/cursos/istqb-ctfl-v4", "platform": "Google Meet", "sessions_per_week": 2, "session_duration_minutes": 90}'
);

-- Sesión 2: Workshop de Automatización con Playwright
INSERT INTO public.sessions (
  id, title, type, description, instructor_name, instructor_email,
  mode, language, capacity, status, starts_at, ends_at,
  price_usd, tags, metadata
) VALUES (
  '22222222-0000-0000-0000-000000000002',
  'Workshop: Automatización Web con Playwright desde Cero',
  'workshop',
  E'Workshop intensivo de 3 días para aprender Playwright aplicado a proyectos reales.\n\n'
  '**Incluye:**\n- Setup del entorno (TypeScript + Playwright)\n'
  '- Page Object Model\n- CI/CD con GitHub Actions\n'
  '- Proyecto final evaluado\n\n'
  '**Requisito:** Conocimientos básicos de JavaScript o TypeScript.',
  'Carlos Ibáñez',
  'carlos.ibanez@aiquaa.com',
  'sync',
  'es',
  20,
  'open',
  '2026-07-18 09:00:00-03',
  '2026-07-20 18:00:00-03',
  79.00,
  ARRAY['Playwright', 'Automatización', 'TypeScript', 'CI/CD', 'Intermediate'],
  '{"repo_url": "https://github.com/aiquaa/playwright-workshop", "platform": "Zoom", "format": "hands-on"}'
);

-- Entradas de lista de espera de ejemplo
INSERT INTO public.waitlist_entries (
  id, session_id, email, full_name, country, city,
  current_role, has_istqb, experience_years,
  motivation, source, status,
  privacy_accepted, privacy_accepted_at,
  metadata
) VALUES

-- Entrada 1: Interesada en la cohorte ISTQB
(
  'aaaaaaaa-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  'maria.gonzalez@ejemplo.com',
  'María González',
  'AR',
  'Buenos Aires',
  'junior_tester',
  false,
  1,
  'Llevo un año haciendo QA manual y quiero certificarme para crecer profesionalmente.',
  'linkedin',
  'waiting',
  true,
  NOW(),
  '{"utm_campaign": "istqb-q2-2026"}'
),

-- Entrada 2: Interesado en el workshop de Playwright
(
  'bbbbbbbb-0000-0000-0000-000000000002',
  '22222222-0000-0000-0000-000000000002',
  'juan.perez@ejemplo.com',
  'Juan Pérez',
  'MX',
  'Ciudad de México',
  'senior_tester',
  true,
  5,
  'Ya tengo ISTQB, ahora quiero aprender automatización con Playwright para mi equipo.',
  'youtube',
  'waiting',
  true,
  NOW(),
  '{"utm_campaign": "playwright-workshop-2026"}'
),

-- Entrada 3: Lista de espera general de AIQUAA Pro (sin sesión específica)
(
  'cccccccc-0000-0000-0000-000000000003',
  NULL,
  'ana.silva@ejemplo.com',
  'Ana Silva',
  'BR',
  'São Paulo',
  'student',
  false,
  0,
  'Soy estudiante de sistemas y quiero iniciarme en QA con una formación seria en español.',
  'organic',
  'waiting',
  true,
  NOW(),
  '{"referrer": "google", "landing_page": "/pro"}'
);

-- =============================================================================
-- QUERY DE EJEMPLO
-- Sesiones abiertas con porcentaje de ocupación
-- =============================================================================

-- Ejecutar esta query para obtener las sesiones visibles con su % de ocupación:
/*
SELECT
  s.id,
  s.title,
  s.type,
  s.mode,
  s.starts_at,
  s.price_usd,
  s.capacity,
  s.enrolled_count,
  s.tags,
  -- Porcentaje de ocupación (NULL si capacity es ilimitada)
  CASE
    WHEN s.capacity IS NOT NULL
    THEN ROUND((s.enrolled_count::NUMERIC / s.capacity) * 100, 1)
    ELSE NULL
  END AS ocupacion_pct,
  -- Cupos restantes
  CASE
    WHEN s.capacity IS NOT NULL
    THEN GREATEST(s.capacity - s.enrolled_count, 0)
    ELSE NULL
  END AS cupos_disponibles,
  -- Personas en lista de espera (solo waiting) para esta sesión
  (
    SELECT COUNT(*)
    FROM public.waitlist_entries we
    WHERE we.session_id = s.id
      AND we.status = 'waiting'
  ) AS en_lista_espera
FROM public.sessions s
WHERE s.status IN ('open', 'full', 'in_progress')
ORDER BY s.starts_at ASC NULLS LAST;
*/
