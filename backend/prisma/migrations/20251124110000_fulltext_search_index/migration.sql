-- Add full-text search indexes for Event title and description
-- This improves search performance by using PostgreSQL's tsvector

-- Create GIN index on title for full-text search
CREATE INDEX IF NOT EXISTS "events_title_search_idx" ON "events" USING GIN (to_tsvector('english', "title"));

-- Create GIN index on description for full-text search (only non-null values)
CREATE INDEX IF NOT EXISTS "events_description_search_idx" ON "events" USING GIN (to_tsvector('english', COALESCE("description", '')));

-- Create a combined index for searching across both fields
CREATE INDEX IF NOT EXISTS "events_title_description_search_idx" ON "events" USING GIN (
  to_tsvector('english', "title" || ' ' || COALESCE("description", ''))
);
