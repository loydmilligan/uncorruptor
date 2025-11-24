-- Migration: Convert eventDate to startDate/endDate and add isPrimary to EventTag

-- Step 1: Add new columns to events table
ALTER TABLE "events" ADD COLUMN "start_date" DATE;
ALTER TABLE "events" ADD COLUMN "end_date" DATE;

-- Step 2: Migrate existing data - copy event_date to start_date
UPDATE "events" SET "start_date" = "event_date" WHERE "event_date" IS NOT NULL;

-- Step 3: Make start_date required (after data migration)
ALTER TABLE "events" ALTER COLUMN "start_date" SET NOT NULL;

-- Step 4: Drop old event_date column
ALTER TABLE "events" DROP COLUMN "event_date";

-- Step 5: Add isPrimary column to event_tags
ALTER TABLE "event_tags" ADD COLUMN "is_primary" BOOLEAN NOT NULL DEFAULT false;

-- Step 6: Create index on start_date (replacing event_date index)
DROP INDEX IF EXISTS "events_event_date_idx";
CREATE INDEX "events_start_date_idx" ON "events"("start_date");
CREATE INDEX "events_end_date_idx" ON "events"("end_date");
