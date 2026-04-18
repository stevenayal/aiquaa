-- Initial migration: creates all base tables
-- Delta migrations that follow will ALTER these tables

-- Enums
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "ExamMode" AS ENUM ('EXAM', 'TRAINING');
CREATE TYPE "PerformanceExamPurpose" AS ENUM ('capacitacion', 'postulacion', 'practica', 'otro');
CREATE TYPE "IdeaStatus" AS ENUM ('PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateTable: users (base columns only — passwordHash/avatarUrl/emailVerifiedAt/twoFASecret/deletedAt added by later migrations)
CREATE TABLE "users" (
    "id"        SERIAL NOT NULL,
    "email"     TEXT NOT NULL,
    "name"      TEXT,
    "role"      "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable: categories (deletedAt added by later migration)
CREATE TABLE "categories" (
    "id"          SERIAL NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "slug"        TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateTable: thread_tags
CREATE TABLE "thread_tags" (
    "id"        SERIAL NOT NULL,
    "name"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "thread_tags_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "thread_tags_name_key" ON "thread_tags"("name");
CREATE INDEX "thread_tags_name_idx" ON "thread_tags"("name");

-- CreateTable: threads (deletedAt added by later migration)
CREATE TABLE "threads" (
    "id"         SERIAL NOT NULL,
    "title"      TEXT NOT NULL,
    "content"    TEXT NOT NULL,
    "slug"       TEXT NOT NULL,
    "isSticky"   BOOLEAN NOT NULL DEFAULT false,
    "isLocked"   BOOLEAN NOT NULL DEFAULT false,
    "viewCount"  INTEGER NOT NULL DEFAULT 0,
    "authorId"   INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "threads_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "threads_slug_key" ON "threads"("slug");
CREATE INDEX "threads_viewCount_idx" ON "threads"("viewCount" DESC);

-- Thread <-> ThreadTag join table (Prisma implicit m2m)
CREATE TABLE "_ThreadToThreadTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);
CREATE UNIQUE INDEX "_ThreadToThreadTag_AB_unique" ON "_ThreadToThreadTag"("A", "B");
CREATE INDEX "_ThreadToThreadTag_B_index" ON "_ThreadToThreadTag"("B");

-- CreateTable: posts (deletedAt added by later migration)
CREATE TABLE "posts" (
    "id"         SERIAL NOT NULL,
    "content"    TEXT NOT NULL,
    "isSolution" BOOLEAN NOT NULL DEFAULT false,
    "authorId"   INTEGER NOT NULL,
    "threadId"   INTEGER NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: courses (deletedAt added by later migration)
CREATE TABLE "courses" (
    "id"          SERIAL NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "slug"        TEXT NOT NULL,
    "price"       DECIMAL NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateTable: lessons (deletedAt added by later migration)
CREATE TABLE "lessons" (
    "id"        SERIAL NOT NULL,
    "title"     TEXT NOT NULL,
    "content"   TEXT,
    "order"     INTEGER NOT NULL,
    "courseId"  INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable: enrollments
CREATE TABLE "enrollments" (
    "id"         SERIAL NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"     INTEGER NOT NULL,
    "courseId"   INTEGER NOT NULL,
    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "enrollments_userId_courseId_key" ON "enrollments"("userId", "courseId");

-- CreateTable: purchases (deletedAt added by later migration)
CREATE TABLE "purchases" (
    "id"        SERIAL NOT NULL,
    "amount"    DECIMAL NOT NULL,
    "status"    "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "userId"    INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable: istqb_exam_results
CREATE TABLE "istqb_exam_results" (
    "id"                 SERIAL NOT NULL,
    "participantName"    TEXT NOT NULL,
    "participantEmail"   TEXT,
    "startTime"          TIMESTAMP(3) NOT NULL,
    "endTime"            TIMESTAMP(3) NOT NULL,
    "timeSpentSeconds"   INTEGER NOT NULL,
    "score"              INTEGER NOT NULL,
    "totalQuestions"     INTEGER NOT NULL,
    "percentage"         DECIMAL(5,2) NOT NULL,
    "passed"             BOOLEAN NOT NULL,
    "mode"               "ExamMode" NOT NULL DEFAULT 'EXAM',
    "answers"            JSONB NOT NULL,
    "learningObjectives" JSONB NOT NULL,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "istqb_exam_results_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "istqb_exam_results_participantEmail_idx" ON "istqb_exam_results"("participantEmail");
CREATE INDEX "istqb_exam_results_createdAt_idx" ON "istqb_exam_results"("createdAt");
CREATE INDEX "istqb_exam_results_passed_idx" ON "istqb_exam_results"("passed");

-- CreateTable: performance_exam_results
CREATE TABLE "performance_exam_results" (
    "id"                SERIAL NOT NULL,
    "participantName"   TEXT NOT NULL,
    "githubProfile"     TEXT NOT NULL,
    "examPurpose"       "PerformanceExamPurpose" NOT NULL,
    "companyName"       TEXT,
    "startTime"         TIMESTAMP(3) NOT NULL,
    "endTime"           TIMESTAMP(3) NOT NULL,
    "timeSpentSeconds"  INTEGER NOT NULL,
    "score"             INTEGER NOT NULL,
    "totalQuestions"    INTEGER NOT NULL,
    "percentage"        DECIMAL(5,2) NOT NULL,
    "passed"            BOOLEAN NOT NULL,
    "mode"              TEXT NOT NULL,
    "answers"           JSONB NOT NULL,
    "sectionAnalysis"   JSONB NOT NULL,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "performance_exam_results_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "performance_exam_results_githubProfile_idx" ON "performance_exam_results"("githubProfile");
CREATE INDEX "performance_exam_results_createdAt_idx" ON "performance_exam_results"("createdAt");
CREATE INDEX "performance_exam_results_passed_idx" ON "performance_exam_results"("passed");
CREATE INDEX "performance_exam_results_examPurpose_idx" ON "performance_exam_results"("examPurpose");

-- CreateTable: idea_categories
CREATE TABLE "idea_categories" (
    "id"          SERIAL NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "icon"        TEXT,
    "order"       INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt"   TIMESTAMP(3),
    CONSTRAINT "idea_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "idea_categories_name_key" ON "idea_categories"("name");
CREATE INDEX "idea_categories_deletedAt_idx" ON "idea_categories"("deletedAt");
CREATE INDEX "idea_categories_order_idx" ON "idea_categories"("order");

-- CreateTable: ideas
CREATE TABLE "ideas" (
    "id"          SERIAL NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "status"      "IdeaStatus" NOT NULL DEFAULT 'PENDING',
    "categoryId"  INTEGER NOT NULL,
    "authorId"    INTEGER NOT NULL,
    "viewCount"   INTEGER NOT NULL DEFAULT 0,
    "voteScore"   INTEGER NOT NULL DEFAULT 0,
    "upvotes"     INTEGER NOT NULL DEFAULT 0,
    "downvotes"   INTEGER NOT NULL DEFAULT 0,
    "tags"        TEXT[],
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt"   TIMESTAMP(3),
    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ideas_slug_key" ON "ideas"("slug");
CREATE INDEX "ideas_categoryId_voteScore_idx" ON "ideas"("categoryId", "voteScore" DESC);
CREATE INDEX "ideas_status_voteScore_idx" ON "ideas"("status", "voteScore" DESC);
CREATE INDEX "ideas_deletedAt_idx" ON "ideas"("deletedAt");
CREATE INDEX "ideas_authorId_idx" ON "ideas"("authorId");
CREATE INDEX "ideas_createdAt_idx" ON "ideas"("createdAt" DESC);

-- CreateTable: idea_votes
CREATE TABLE "idea_votes" (
    "id"        SERIAL NOT NULL,
    "ideaId"    INTEGER NOT NULL,
    "userId"    INTEGER NOT NULL,
    "value"     INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "idea_votes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "idea_votes_ideaId_userId_key" ON "idea_votes"("ideaId", "userId");
CREATE INDEX "idea_votes_ideaId_idx" ON "idea_votes"("ideaId");
CREATE INDEX "idea_votes_userId_idx" ON "idea_votes"("userId");

-- CreateTable: idea_comments
CREATE TABLE "idea_comments" (
    "id"        SERIAL NOT NULL,
    "content"   TEXT NOT NULL,
    "ideaId"    INTEGER NOT NULL,
    "authorId"  INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "idea_comments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idea_comments_ideaId_createdAt_idx" ON "idea_comments"("ideaId", "createdAt" DESC);
CREATE INDEX "idea_comments_deletedAt_idx" ON "idea_comments"("deletedAt");
CREATE INDEX "idea_comments_authorId_idx" ON "idea_comments"("authorId");

-- Foreign Keys
ALTER TABLE "threads"      ADD CONSTRAINT "threads_authorId_fkey"      FOREIGN KEY ("authorId")   REFERENCES "users"("id")           ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "threads"      ADD CONSTRAINT "threads_categoryId_fkey"    FOREIGN KEY ("categoryId") REFERENCES "categories"("id")      ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "_ThreadToThreadTag" ADD CONSTRAINT "_ThreadToThreadTag_A_fkey" FOREIGN KEY ("A") REFERENCES "threads"("id")    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ThreadToThreadTag" ADD CONSTRAINT "_ThreadToThreadTag_B_fkey" FOREIGN KEY ("B") REFERENCES "thread_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "posts"        ADD CONSTRAINT "posts_authorId_fkey"        FOREIGN KEY ("authorId")   REFERENCES "users"("id")           ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "posts"        ADD CONSTRAINT "posts_threadId_fkey"        FOREIGN KEY ("threadId")   REFERENCES "threads"("id")         ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lessons"      ADD CONSTRAINT "lessons_courseId_fkey"      FOREIGN KEY ("courseId")   REFERENCES "courses"("id")         ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollments"  ADD CONSTRAINT "enrollments_userId_fkey"    FOREIGN KEY ("userId")     REFERENCES "users"("id")           ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollments"  ADD CONSTRAINT "enrollments_courseId_fkey"  FOREIGN KEY ("courseId")   REFERENCES "courses"("id")         ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "purchases"    ADD CONSTRAINT "purchases_userId_fkey"      FOREIGN KEY ("userId")     REFERENCES "users"("id")           ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ideas"        ADD CONSTRAINT "ideas_categoryId_fkey"      FOREIGN KEY ("categoryId") REFERENCES "idea_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ideas"        ADD CONSTRAINT "ideas_authorId_fkey"        FOREIGN KEY ("authorId")   REFERENCES "users"("id")           ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "idea_votes"   ADD CONSTRAINT "idea_votes_ideaId_fkey"     FOREIGN KEY ("ideaId")     REFERENCES "ideas"("id")           ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "idea_votes"   ADD CONSTRAINT "idea_votes_userId_fkey"     FOREIGN KEY ("userId")     REFERENCES "users"("id")           ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "idea_comments" ADD CONSTRAINT "idea_comments_ideaId_fkey" FOREIGN KEY ("ideaId")    REFERENCES "ideas"("id")           ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "idea_comments" ADD CONSTRAINT "idea_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id")          ON DELETE RESTRICT ON UPDATE CASCADE;
