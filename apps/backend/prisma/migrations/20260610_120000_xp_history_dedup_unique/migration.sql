-- Make XP grant idempotency atomic.
--
-- The application previously relied on a findFirst() check before inserting an
-- xp_history row, which left a race window: two concurrent requests (e.g. a
-- double-click) could both pass the check and grant XP twice. A unique
-- constraint on (userId, deduplicationKey) closes that window at the database
-- level. In Postgres, multiple NULLs are allowed in a unique index, so grants
-- without a deduplicationKey are unaffected.

-- The non-unique index is superseded by the unique constraint below.
DROP INDEX IF EXISTS "xp_history_userId_deduplicationKey_idx";

-- Defensive cleanup: collapse any pre-existing duplicate grants, keeping the
-- earliest row per (userId, deduplicationKey). NULL keys are never duplicates.
DELETE FROM "xp_history" a
USING "xp_history" b
WHERE a."deduplicationKey" IS NOT NULL
  AND a."userId" = b."userId"
  AND a."deduplicationKey" = b."deduplicationKey"
  AND a."id" > b."id";

-- CreateIndex (atomic idempotency)
CREATE UNIQUE INDEX "xp_history_userId_deduplicationKey_key"
  ON "xp_history" ("userId", "deduplicationKey");
