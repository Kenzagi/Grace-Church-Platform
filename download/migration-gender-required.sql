-- =====================================================================
-- Grace Community Church Platform — Production migration patch
-- PRD v2.0 §7.1 fix #5: make Member.gender and Member.maritalStatus
-- required (NOT NULL) for group-assignment data quality.
--
-- Run this in your Supabase/Neon/Vercel Postgres SQL editor BEFORE or
-- AFTER deploying the updated app code (the app no longer writes NULLs,
-- so order does not matter for correctness of new rows).
--
-- If you prefer a full schema rebuild, regenerate migration.sql via
-- `prisma migrate diff --from-empty --to-schema-datamodel schema.prisma`
-- with the updated schema.prisma (gender/maritalStatus non-nullable).
-- =====================================================================

-- 1. Backfill existing NULL rows with sensible defaults.
--    Adjust values as appropriate for your congregation before running.
UPDATE "Member" SET gender = 'other' WHERE gender IS NULL;
UPDATE "Member" SET "maritalStatus" = 'single' WHERE "maritalStatus" IS NULL;

-- 2. Enforce NOT NULL.
ALTER TABLE "Member" ALTER COLUMN gender SET NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "maritalStatus" SET NOT NULL;

-- 3. Optional verification — should return 0 rows for both:
-- SELECT COUNT(*) FROM "Member" WHERE gender IS NULL;
-- SELECT COUNT(*) FROM "Member" WHERE "maritalStatus" IS NULL;
