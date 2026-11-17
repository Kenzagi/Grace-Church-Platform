-- =====================================================================
-- Grace Community Church Platform — production migration (Nov 2026 sync)
-- Applies the schema changes from the Nov 2026 progress sync to an
-- EXISTING PostgreSQL database (Supabase / Neon / Vercel Postgres).
--
-- For a FRESH database you do NOT need this file:
--   npx prisma migrate dev --name init   (or: npx prisma db push)
--
-- Safe to run while the old app version is live (backfills run first);
-- run it BEFORE or AFTER deploying the updated app code.
-- =====================================================================

-- ── 1. Backfill existing NULLs (required before the NOT NULL constraint) ──
--    Adjust the default values to suit your congregation if needed.
UPDATE "Member" SET gender = 'other' WHERE gender IS NULL;
UPDATE "Member" SET "maritalStatus" = 'single' WHERE "maritalStatus" IS NULL;

-- ── 2. Member.gender / maritalStatus now required (PRD v2.0 §7.1 #5) ──
-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "maritalStatus" SET NOT NULL;

-- ── 3. Per-event volunteer capacity overrides ──
-- CreateTable
CREATE TABLE "EventVolunteerNeed" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "EventVolunteerNeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventVolunteerNeed_roleId_idx" ON "EventVolunteerNeed"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "EventVolunteerNeed_eventId_roleId_key" ON "EventVolunteerNeed"("eventId", "roleId");

-- AddForeignKey
ALTER TABLE "EventVolunteerNeed" ADD CONSTRAINT "EventVolunteerNeed_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteerNeed" ADD CONSTRAINT "EventVolunteerNeed_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "VolunteerRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ── 4. Verification (both should return 0) ──
-- SELECT COUNT(*) FROM "Member" WHERE gender IS NULL;
-- SELECT COUNT(*) FROM "Member" WHERE "maritalStatus" IS NULL;
