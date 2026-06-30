-- Backfill retroactivo de user_achievements para usuarios existentes (2026-06-30)
-- Implementa checkAndAwardAchievements() para todos los usuarios con actividad previa.
-- Idempotente: usa NOT EXISTS + ON CONFLICT DO NOTHING.

-- FIRST_SIMULATOR: cualquier exam completado
WITH ach AS (SELECT id, xp_bonus FROM achievements WHERE key = 'FIRST_SIMULATOR' AND is_active = true)
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, source, xp_awarded)
SELECT DISTINCT ON (er.user_id)
  er.user_id, ach.id,
  MIN(er.created_at) OVER (PARTITION BY er.user_id),
  'backfill-2026-06-30', COALESCE(ach.xp_bonus, 0)
FROM exam_results er, ach
WHERE er.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = er.user_id AND ua.achievement_id = ach.id)
ON CONFLICT DO NOTHING;

-- QA_ON_THE_RISE: level >= 5
WITH ach AS (SELECT id, xp_bonus FROM achievements WHERE key = 'QA_ON_THE_RISE' AND is_active = true)
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, source, xp_awarded)
SELECT ux.user_id, ach.id, ux.updated_at, 'backfill-2026-06-30', COALESCE(ach.xp_bonus, 0)
FROM user_xp ux, ach
WHERE ux.level >= 5
  AND NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = ux.user_id AND ua.achievement_id = ach.id)
ON CONFLICT DO NOTHING;

-- CERTIFICATION_ON_THE_WAY: 5+ exams passed
WITH ach AS (SELECT id, xp_bonus FROM achievements WHERE key = 'CERTIFICATION_ON_THE_WAY' AND is_active = true)
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, source, xp_awarded)
SELECT sq.user_id, ach.id, sq.first_pass_at, 'backfill-2026-06-30', COALESCE(ach.xp_bonus, 0)
FROM (
  SELECT user_id, MIN(created_at) as first_pass_at FROM exam_results
  WHERE passed = true AND user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*) >= 5
) sq, ach
WHERE NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = sq.user_id AND ua.achievement_id = ach.id)
ON CONFLICT DO NOTHING;

-- FIRST_ALLPAIRS: allpairs tool_usage >= 1
WITH ach AS (SELECT id, xp_bonus FROM achievements WHERE key = 'FIRST_ALLPAIRS' AND is_active = true)
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, source, xp_awarded)
SELECT sq.user_id, ach.id, sq.first_at, 'backfill-2026-06-30', COALESCE(ach.xp_bonus, 0)
FROM (
  SELECT user_id, MIN(created_at) as first_at FROM tool_usage
  WHERE tool_slug = 'allpairs' AND user_id IS NOT NULL GROUP BY user_id
) sq, ach
WHERE NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = sq.user_id AND ua.achievement_id = ach.id)
ON CONFLICT DO NOTHING;

-- ISTQB_MASTER: 20+ exams passed
WITH ach AS (SELECT id, xp_bonus FROM achievements WHERE key = 'ISTQB_MASTER' AND is_active = true)
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, source, xp_awarded)
SELECT sq.user_id, ach.id, sq.first_pass_at, 'backfill-2026-06-30', COALESCE(ach.xp_bonus, 0)
FROM (
  SELECT user_id, MIN(created_at) as first_pass_at FROM exam_results
  WHERE passed = true AND user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*) >= 20
) sq, ach
WHERE NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = sq.user_id AND ua.achievement_id = ach.id)
ON CONFLICT DO NOTHING;

-- CASE_EXPLORER: 10+ allpairs generates
WITH ach AS (SELECT id, xp_bonus FROM achievements WHERE key = 'CASE_EXPLORER' AND is_active = true)
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, source, xp_awarded)
SELECT sq.user_id, ach.id, sq.first_at, 'backfill-2026-06-30', COALESCE(ach.xp_bonus, 0)
FROM (
  SELECT user_id, MIN(created_at) as first_at FROM tool_usage
  WHERE tool_slug = 'allpairs' AND user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*) >= 10
) sq, ach
WHERE NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = sq.user_id AND ua.achievement_id = ach.id)
ON CONFLICT DO NOTHING;

-- TOP_10_COMMUNITY: level >= 10
WITH ach AS (SELECT id, xp_bonus FROM achievements WHERE key = 'TOP_10_COMMUNITY' AND is_active = true)
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, source, xp_awarded)
SELECT ux.user_id, ach.id, ux.updated_at, 'backfill-2026-06-30', COALESCE(ach.xp_bonus, 0)
FROM user_xp ux, ach
WHERE ux.level >= 10
  AND NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = ux.user_id AND ua.achievement_id = ach.id)
ON CONFLICT DO NOTHING;
