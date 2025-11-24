# Data Model: Administration Accountability Tracker

**Date**: 2025-11-24
**Branch**: `001-admin-accountability-tracker`

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      Event      │       │    EventTag     │       │      Tag        │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────<│ event_id (FK)   │>──────│ id (PK)         │
│ title           │       │ tag_id (FK)     │       │ name            │
│ description     │       └─────────────────┘       │ description     │
│ event_date      │                                 │ color           │
│ admin_period    │                                 │ is_default      │
│ search_vector   │                                 │ created_at      │
│ created_at      │                                 └─────────────────┘
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│     Source      │       │  Publication    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ event_id (FK)   │       │ name            │
│ publication_id  │──────>│ domain          │
│ url             │       │ default_bias    │
│ article_title   │       │ credibility     │
│ bias_rating     │       └─────────────────┘
│ date_accessed   │
│ is_archived     │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│ CounterNarrative│
├─────────────────┤
│ id (PK)         │
│ event_id (FK)   │ ←── 1:1 with Event
│ narrative_text  │
│ admin_strength  │
│ concern_strength│
│ source_refs     │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│AdminPeriod (enum│
├─────────────────┤
│ TRUMP_1         │
│ TRUMP_2         │
│ OTHER           │
└─────────────────┘
```

---

## Entity Definitions

### Event

The core entity representing a political incident or action being tracked.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| title | VARCHAR(500) | NOT NULL | Event title/headline |
| description | TEXT | nullable | Detailed description of the event |
| event_date | DATE | NOT NULL | When the event occurred |
| admin_period | ENUM | NOT NULL, computed | Administration period (TRUMP_1, TRUMP_2, OTHER) |
| search_vector | TSVECTOR | indexed | Full-text search vector (auto-generated) |
| created_at | TIMESTAMP | NOT NULL, default NOW | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, auto-update | Last modification time |

**Validation Rules**:
- `title` must be non-empty, max 500 characters
- `event_date` must be a valid date (not in the future)
- `admin_period` is auto-computed from `event_date`:
  - Jan 20, 2017 - Jan 20, 2021 → TRUMP_1
  - Jan 20, 2025 - present → TRUMP_2
  - Otherwise → OTHER

**Indexes**:
- Primary key on `id`
- B-tree index on `event_date`
- B-tree index on `admin_period`
- GIN index on `search_vector`

---

### Tag

Classification labels for categorizing events.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Tag name (slug format) |
| description | VARCHAR(500) | nullable | Human-readable description |
| color | VARCHAR(7) | default '#6B7280' | Hex color for UI display |
| is_default | BOOLEAN | default FALSE | True for system-provided tags |
| created_at | TIMESTAMP | NOT NULL, default NOW | Record creation time |

**Validation Rules**:
- `name` must be lowercase, alphanumeric with hyphens only
- `name` max 100 characters
- `color` must be valid hex color (#RRGGBB)

**Default Tags** (seeded on initialization):
| name | description | color |
|------|-------------|-------|
| dishonesty | False or misleading statements | #EF4444 |
| divergent-from-historical-gop | Breaks with traditional Republican positions | #8B5CF6 |
| breaking-norms | Violates established political/democratic norms | #F59E0B |
| corruption | Self-dealing, conflicts of interest, abuse of power | #DC2626 |
| constitutional-concerns | Potential constitutional violations | #1D4ED8 |
| policy-harm | Policies causing measurable harm | #059669 |
| self-dealing | Personal financial benefit from office | #D97706 |
| nepotism | Favoritism toward family members | #7C3AED |

---

### EventTag (Junction Table)

Many-to-many relationship between Events and Tags.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| event_id | UUID | FK → Event.id, ON DELETE CASCADE | Event reference |
| tag_id | UUID | FK → Tag.id, ON DELETE CASCADE | Tag reference |

**Constraints**:
- Composite primary key on (event_id, tag_id)
- Unique constraint prevents duplicate assignments

---

### Source

References to external documentation supporting an event.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| event_id | UUID | FK → Event.id, ON DELETE CASCADE | Parent event |
| publication_id | UUID | FK → Publication.id, nullable | Known publication reference |
| url | VARCHAR(2048) | NOT NULL | Source URL |
| article_title | VARCHAR(500) | nullable | Article headline |
| bias_rating | INTEGER | CHECK (-3 to 3) | Political bias rating |
| date_accessed | DATE | NOT NULL, default TODAY | When source was added |
| is_archived | BOOLEAN | default FALSE | True if URL no longer accessible |
| created_at | TIMESTAMP | NOT NULL, default NOW | Record creation time |

**Validation Rules**:
- `url` must be valid URL format
- `bias_rating` must be integer from -3 (far left) to 3 (far right)
- If `publication_id` provided, use publication's default bias if `bias_rating` not specified

**Bias Rating Scale**:
| Value | Label |
|-------|-------|
| -3 | Far Left |
| -2 | Left |
| -1 | Center-Left |
| 0 | Center |
| 1 | Center-Right |
| 2 | Right |
| 3 | Far Right |

---

### Publication

Reference data for known news sources with default bias ratings.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| name | VARCHAR(200) | NOT NULL, UNIQUE | Publication name |
| domain | VARCHAR(253) | NOT NULL, UNIQUE | Primary domain (e.g., nytimes.com) |
| default_bias | INTEGER | CHECK (-3 to 3) | Default political bias rating |
| credibility | VARCHAR(20) | nullable | Credibility tier (high/mixed/low) |

**Seed Data**: Pre-populated with ~50-100 common publications (see research.md for examples).

---

### CounterNarrative

The administration's stated position or defense for an event.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| event_id | UUID | FK → Event.id, UNIQUE, ON DELETE CASCADE | Parent event (1:1) |
| narrative_text | TEXT | NOT NULL | Administration's stated position |
| admin_strength | VARCHAR(10) | CHECK (weak/moderate/strong) | User's rating of admin argument |
| concern_strength | VARCHAR(10) | CHECK (weak/moderate/strong) | User's rating of own concern |
| source_refs | TEXT | nullable | Supporting source references (freeform) |
| created_at | TIMESTAMP | NOT NULL, default NOW | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, auto-update | Last modification time |

**Validation Rules**:
- One counter-narrative per event (enforced by UNIQUE on event_id)
- `narrative_text` must be non-empty
- Strength ratings must be one of: weak, moderate, strong

---

## Prisma Schema

```prisma
// schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum AdminPeriod {
  TRUMP_1
  TRUMP_2
  OTHER
}

enum StrengthRating {
  weak
  moderate
  strong
}

model Event {
  id              String            @id @default(uuid())
  title           String            @db.VarChar(500)
  description     String?           @db.Text
  eventDate       DateTime          @map("event_date") @db.Date
  adminPeriod     AdminPeriod       @map("admin_period")
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  tags            EventTag[]
  sources         Source[]
  counterNarrative CounterNarrative?

  @@index([eventDate])
  @@index([adminPeriod])
  @@map("events")
}

model Tag {
  id          String     @id @default(uuid())
  name        String     @unique @db.VarChar(100)
  description String?    @db.VarChar(500)
  color       String     @default("#6B7280") @db.VarChar(7)
  isDefault   Boolean    @default(false) @map("is_default")
  createdAt   DateTime   @default(now()) @map("created_at")

  events      EventTag[]

  @@map("tags")
}

model EventTag {
  eventId String @map("event_id")
  tagId   String @map("tag_id")

  event   Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  tag     Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([eventId, tagId])
  @@map("event_tags")
}

model Source {
  id            String      @id @default(uuid())
  eventId       String      @map("event_id")
  publicationId String?     @map("publication_id")
  url           String      @db.VarChar(2048)
  articleTitle  String?     @map("article_title") @db.VarChar(500)
  biasRating    Int         @map("bias_rating") @db.SmallInt
  dateAccessed  DateTime    @default(now()) @map("date_accessed") @db.Date
  isArchived    Boolean     @default(false) @map("is_archived")
  createdAt     DateTime    @default(now()) @map("created_at")

  event         Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)
  publication   Publication? @relation(fields: [publicationId], references: [id])

  @@index([eventId])
  @@map("sources")
}

model Publication {
  id          String   @id @default(uuid())
  name        String   @unique @db.VarChar(200)
  domain      String   @unique @db.VarChar(253)
  defaultBias Int      @map("default_bias") @db.SmallInt
  credibility String?  @db.VarChar(20)

  sources     Source[]

  @@map("publications")
}

model CounterNarrative {
  id              String         @id @default(uuid())
  eventId         String         @unique @map("event_id")
  narrativeText   String         @map("narrative_text") @db.Text
  adminStrength   StrengthRating @map("admin_strength")
  concernStrength StrengthRating @map("concern_strength")
  sourceRefs      String?        @map("source_refs") @db.Text
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  event           Event          @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@map("counter_narratives")
}
```

---

## State Transitions

### Event Lifecycle

```
[Draft] → [Published]
   ↓          ↓
   └──────────┴──→ [Deleted]
```

Note: For this single-user application, all events are effectively "published" on creation. No draft state is required.

### Source Archive State

```
[Active] → [Archived]
    ↑          │
    └──────────┘ (can be restored)
```

- Sources marked `is_archived = true` when URL check fails
- User can manually restore if URL becomes accessible again

---

## Query Patterns

### Full-Text Search

PostgreSQL tsvector for efficient searching across title and description:

```sql
-- Create search index (run in migration)
ALTER TABLE events ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX events_search_idx ON events USING GIN (search_vector);

-- Search query
SELECT * FROM events
WHERE search_vector @@ plainto_tsquery('english', 'ukraine corruption')
ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'ukraine corruption')) DESC;
```

### Dashboard Aggregations

```sql
-- Events by tag and admin period
SELECT t.name, e.admin_period, COUNT(*) as count
FROM events e
JOIN event_tags et ON e.id = et.event_id
JOIN tags t ON et.tag_id = t.id
GROUP BY t.name, e.admin_period;

-- Timeline (events per month)
SELECT DATE_TRUNC('month', event_date) as month, COUNT(*) as count
FROM events
GROUP BY month
ORDER BY month;
```
