-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_at_idx" ON "audit_logs"("entity", "entityId", "at");

-- AlterTable
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "threads" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "posts" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "courses" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "categories_deletedAt_idx" ON "categories"("deletedAt");

-- CreateIndex
CREATE INDEX "threads_categoryId_createdAt_idx" ON "threads"("categoryId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "threads_deletedAt_idx" ON "threads"("deletedAt");

-- CreateIndex
CREATE INDEX "posts_threadId_createdAt_idx" ON "posts"("threadId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "posts_deletedAt_idx" ON "posts"("deletedAt");

-- CreateIndex
CREATE INDEX "courses_deletedAt_idx" ON "courses"("deletedAt");

-- CreateIndex
CREATE INDEX "lessons_deletedAt_idx" ON "lessons"("deletedAt");

-- CreateIndex
CREATE INDEX "purchases_deletedAt_idx" ON "purchases"("deletedAt");

-- Create extension for text search (if not exists)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create full-text search index for threads title (optional)
CREATE INDEX threads_title_fts_idx ON "threads" USING GIN (to_tsvector('spanish', coalesce("title", '')));
