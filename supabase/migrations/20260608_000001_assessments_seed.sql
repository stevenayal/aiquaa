-- =============================================================
-- Seed: QA API Challenge static data
-- Passwords = bcrypt hash of 'Test1234!' (cost 10)
-- =============================================================

INSERT INTO public.challenge_users (id, email, password_hash, display_name, internal_risk_score)
VALUES
  ('usr_001', 'user.a@aiquaa.test', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWq', 'Usuario A', 42),
  ('usr_002', 'user.b@aiquaa.test', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWq', 'Usuario B', 17)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.challenge_accounts (id, user_id, account_number, currency, balance, available_balance)
VALUES
  ('acc_001', 'usr_001', '0001-001-001', 'PYG', 5000000, 5000000),
  ('acc_002', 'usr_002', '0001-001-002', 'PYG', 2500000, 2500000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.qac_catalog (slug, title, description, level, duration_minutes, type)
VALUES (
  'api-banking',
  'QA API Challenge - Banking Transactions',
  'Prueba técnica de API Testing sobre un sistema bancario simulado. Analizá la documentación, diseñá casos de prueba, encontrá bugs intencionales y generá un reporte profesional.',
  'semi-senior',
  105,
  'api-testing'
)
ON CONFLICT (slug) DO NOTHING;
