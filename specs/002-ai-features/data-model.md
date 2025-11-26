# Data Model: AI-Enhanced Accountability Tracking

**Feature**: 002-ai-features
**Date**: 2025-11-25
**Purpose**: Define database schema changes and entity relationships

---

## Schema Changes Overview

This feature introduces **2 new entities** (Domain, Claim) and modifies **3 existing entities** (Source, Event, CounterNarrative).

---

## New Entities

### Domain

**Purpose**: Track aggregated intelligence about news source domains to enable pre-filling bias ratings and enhance AI claim categorization.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| normalizedDomain | VARCHAR(253) | UNIQUE NOT NULL | Normalized domain name (lowercase, no www/protocol) |
| totalSources | INT | DEFAULT 0, NOT NULL | Count of sources from this domain |
| avgBiasRating | DECIMAL(4,2) | NULL | Average bias rating across all sources (-3.00 to +3.00) |
| usageFrequency | INT | DEFAULT 0, NOT NULL | Number of times domain has been used |
| firstSeen | TIMESTAMP | NOT NULL, DEFAULT NOW() | When domain was first encountered |
| lastUsed | TIMESTAMP | NOT NULL, DEFAULT NOW() | Most recent source addition from this domain |

**Relationships**:
- Computed relationship to Source (no explicit foreign key)
- Domain stats calculated from Source.url field

**Validation Rules**:
- `normalizedDomain` must be valid hostname format (no protocol, path, or query)
- `avgBiasRating` must be NULL or between -3.00 and +3.00
- `totalSources` must equal actual count of sources with matching domain
- `usageFrequency` must equal totalSources (incremented on each use)

**Indexes**:
```sql
CREATE INDEX idx_domains_normalized ON domains(normalized_domain);
CREATE INDEX idx_domains_last_used ON domains(last_used DESC);
```

---

### Claim

**Purpose**: Store AI-extracted verifiable statements from article sources, categorized by claim type (factual assertion, opinion, speculation).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| sourceId | UUID | FOREIGN KEY → Source.id, NOT NULL, ON DELETE CASCADE | Source article this claim was extracted from |
| claimText | TEXT | NOT NULL, MAX 1000 chars | The extracted claim statement |
| category | ENUM | NOT NULL | One of: FACTUAL_ASSERTION, OPINION_ANALYSIS, SPECULATION |
| confidenceScore | DECIMAL(3,2) | NOT NULL, CHECK (0.00 to 1.00) | AI confidence in categorization (0-1) |
| extractedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | When claim was extracted |

**Relationships**:
- **Many-to-One** with Source: Each claim belongs to one source; each source can have many claims

**Enum Definition**:
```sql
CREATE TYPE claim_category AS ENUM (
  'FACTUAL_ASSERTION',   -- Verifiable statement of fact
  'OPINION_ANALYSIS',    -- Subjective interpretation or judgment
  'SPECULATION'          -- Hypothetical or predictive statement
);
```

**Validation Rules**:
- `claimText` cannot be empty string (minimum 10 characters recommended)
- `confidenceScore` must be between 0.00 and 1.00 (inclusive)
- `sourceId` must reference an existing Source

**Indexes**:
```sql
CREATE INDEX idx_claims_source ON claims(source_id);
CREATE INDEX idx_claims_category ON claims(category);
CREATE INDEX idx_claims_confidence ON claims(confidence_score DESC);
```

---

## Modified Entities

### Source (Modified)

**Purpose**: Add support for associating sources with counter-narratives in addition to events.

**New Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| counterNarrativeId | UUID | FOREIGN KEY → CounterNarrative.id, NULL, ON DELETE CASCADE | Counter-narrative this source supports (mutually exclusive with eventId) |

**Modified Constraints**:
- **XOR Constraint**: Exactly one of `eventId` or `counterNarrativeId` must be set (not both, not neither)
- **Check Constraint**:
  ```sql
  CONSTRAINT source_association_check
  CHECK ((event_id IS NOT NULL AND counter_narrative_id IS NULL) OR
         (event_id IS NULL AND counter_narrative_id IS NOT NULL))
  ```

**Relationships (Updated)**:
- **Many-to-One** with Event (existing): Each source can belong to one event
- **Many-to-One** with CounterNarrative (NEW): Each source can belong to one counter-narrative
- **One-to-Many** with Claim (NEW): Each source can have multiple extracted claims

**Migration Notes**:
- All existing sources have `eventId` set, so `counterNarrativeId` starts as NULL
- No data loss during migration
- Add check constraint after migration to enforce XOR rule

---

### Event (Modified)

**Purpose**: Move concern level field from CounterNarrative to Event for better data modeling.

**New Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| concernLevel | ENUM | NULL | User's assessment of concern severity |

**Enum Definition** (NEW):
```sql
CREATE TYPE strength_rating AS ENUM ('weak', 'moderate', 'strong');
```

**Relationships (Unchanged)**:
- Existing relationships remain the same

**Migration Notes**:
- Copy `concernLevel` from associated CounterNarrative if it exists
- If Event has multiple CounterNarratives with different concernLevels, use the highest severity (strong > moderate > weak)
- If Event has no CounterNarrative, concernLevel remains NULL

**Migration Script Logic**:
```sql
-- Add concernLevel column
ALTER TABLE events ADD COLUMN concern_level strength_rating;

-- Copy concern levels from counter_narratives
UPDATE events e
SET concern_level = (
  SELECT MAX(cn.concern_level) -- Use highest severity if multiple
  FROM counter_narratives cn
  WHERE cn.event_id = e.id
);
```

---

### CounterNarrative (Modified)

**Purpose**: Remove concern level field (moved to Event) and add source relationship.

**Removed Fields**:
- ~~`concernLevel`~~ (moved to Event entity)

**Relationships (Updated)**:
- **One-to-Many** with Source (NEW): Each counter-narrative can have multiple sources

**Migration Notes**:
- Concern levels must be migrated to Event **before** dropping this column
- Ensure all data is safely moved before ALTER TABLE DROP COLUMN

**Migration Script Logic**:
```sql
-- After concern levels are copied to events
ALTER TABLE counter_narratives DROP COLUMN concern_level;
```

---

## Entity Relationship Diagram

```
Event (1) ──┬─→ (M) Source ──→ (M) Claim
            │
            └─→ (M) EventTag ──→ (1) Tag
            │
            └─→ (0..1) CounterNarrative
                        │
                        └─→ (M) Source ──→ (M) Claim

Domain (1) ─── computed ───→ (M) Source
(no explicit FK, computed from Source.url)

Publication (1) ──→ (M) Source
```

**Key Relationships**:
1. Event → Source (one-to-many, existing)
2. CounterNarrative → Source (one-to-many, NEW)
3. Source → Claim (one-to-many, NEW)
4. Domain → Source (computed, no FK)
5. Source.eventId **XOR** Source.counterNarrativeId (mutually exclusive)

---

## Complete Prisma Schema

```prisma
// New enums
enum ClaimCategory {
  FACTUAL_ASSERTION
  OPINION_ANALYSIS
  SPECULATION
}

enum StrengthRating {
  weak
  moderate
  strong
}

// New models
model Domain {
  id               String   @id @default(uuid())
  normalizedDomain String   @unique @map("normalized_domain") @db.VarChar(253)
  totalSources     Int      @default(0) @map("total_sources")
  avgBiasRating    Decimal? @map("avg_bias_rating") @db.Decimal(4, 2)
  usageFrequency   Int      @default(0) @map("usage_frequency")
  firstSeen        DateTime @default(now()) @map("first_seen")
  lastUsed         DateTime @default(now()) @map("last_used") @updatedAt

  @@index([normalizedDomain])
  @@index([lastUsed(sort: Desc)])
  @@map("domains")
}

model Claim {
  id              String        @id @default(uuid())
  sourceId        String        @map("source_id")
  claimText       String        @map("claim_text") @db.Text
  category        ClaimCategory
  confidenceScore Decimal       @map("confidence_score") @db.Decimal(3, 2)
  extractedAt     DateTime      @default(now()) @map("extracted_at")

  source Source @relation(fields: [sourceId], references: [id], onDelete: Cascade)

  @@index([sourceId])
  @@index([category])
  @@index([confidenceScore(sort: Desc)])
  @@map("claims")
}

// Modified models
model Source {
  id                 String    @id @default(uuid())
  eventId            String?   @map("event_id")
  counterNarrativeId String?   @map("counter_narrative_id") // NEW
  publicationId      String?   @map("publication_id")
  url                String    @db.VarChar(2048)
  articleTitle       String?   @map("article_title") @db.VarChar(500)
  biasRating         Int       @map("bias_rating") @db.SmallInt
  dateAccessed       DateTime  @default(now()) @map("date_accessed") @db.Date
  isArchived         Boolean   @default(false) @map("is_archived")
  createdAt          DateTime  @default(now()) @map("created_at")

  event             Event?            @relation(fields: [eventId], references: [id], onDelete: Cascade)
  counterNarrative  CounterNarrative? @relation(fields: [counterNarrativeId], references: [id], onDelete: Cascade) // NEW
  publication       Publication?      @relation(fields: [publicationId], references: [id])
  claims            Claim[]           // NEW

  @@index([eventId])
  @@index([counterNarrativeId]) // NEW
  @@map("sources")
}

model Event {
  id          String      @id @default(uuid())
  title       String      @db.VarChar(500)
  description String?     @db.Text
  startDate   DateTime    @map("start_date") @db.Date
  endDate     DateTime?   @map("end_date") @db.Date
  adminPeriod AdminPeriod @map("admin_period")
  concernLevel StrengthRating? @map("concern_level") // NEW
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  tags             EventTag[]
  sources          Source[]
  counterNarrative CounterNarrative?

  @@index([startDate])
  @@index([endDate])
  @@index([adminPeriod])
  @@map("events")
}

model CounterNarrative {
  id              String  @id @default(uuid())
  eventId         String  @unique @map("event_id")
  narrative       String  @db.Text
  adminPosition   String? @map("admin_position") @db.Text
  // concernLevel removed
  adminRating     StrengthRating? @map("admin_rating")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  event   Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  sources Source[] // NEW

  @@map("counter_narratives")
}
```

---

## Migration Strategy

### Step 1: Add New Structures
```sql
-- Create enums
CREATE TYPE claim_category AS ENUM ('FACTUAL_ASSERTION', 'OPINION_ANALYSIS', 'SPECULATION');
CREATE TYPE strength_rating AS ENUM ('weak', 'moderate', 'strong');

-- Create new tables
CREATE TABLE domains (...);
CREATE TABLE claims (...);

-- Add new columns (nullable initially)
ALTER TABLE sources ADD COLUMN counter_narrative_id UUID REFERENCES counter_narratives(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN concern_level strength_rating;
```

### Step 2: Migrate Data
```sql
-- Copy concern levels from counter_narratives to events
UPDATE events e
SET concern_level = (
  SELECT MAX(cn.concern_level)::text::strength_rating
  FROM counter_narratives cn
  WHERE cn.event_id = e.id
);
```

### Step 3: Apply Constraints
```sql
-- Add XOR constraint to sources
ALTER TABLE sources ADD CONSTRAINT source_association_check
  CHECK ((event_id IS NOT NULL AND counter_narrative_id IS NULL) OR
         (event_id IS NULL AND counter_narrative_id IS NOT NULL));
```

### Step 4: Remove Old Structure
```sql
-- Drop concern_level from counter_narratives
ALTER TABLE counter_narratives DROP COLUMN concern_level;
```

### Rollback Plan
If migration fails:
1. Drop new tables: `DROP TABLE claims CASCADE; DROP TABLE domains CASCADE;`
2. Remove new columns: `ALTER TABLE sources DROP COLUMN counter_narrative_id;`
3. Restore from backup if data was corrupted

---

## Validation Queries

**Test Domain Aggregation**:
```sql
-- Verify domain stats match actual source counts
SELECT
  d.normalized_domain,
  d.total_sources,
  COUNT(s.id) AS actual_count,
  d.avg_bias_rating,
  AVG(s.bias_rating) AS actual_avg
FROM domains d
LEFT JOIN sources s ON LOWER(REGEXP_REPLACE(s.url, '^https?://(www\.)?', '')) LIKE d.normalized_domain || '%'
GROUP BY d.id;
```

**Test Source Association Constraint**:
```sql
-- Should return 0 rows (no sources with both or neither association)
SELECT * FROM sources
WHERE (event_id IS NULL AND counter_narrative_id IS NULL)
   OR (event_id IS NOT NULL AND counter_narrative_id IS NOT NULL);
```

**Test Concern Level Migration**:
```sql
-- Verify all migrated concern levels
SELECT
  e.id,
  e.concern_level,
  cn.id AS cn_id
FROM events e
LEFT JOIN counter_narratives cn ON cn.event_id = e.id
WHERE e.concern_level IS NOT NULL;
```

---

## Summary

- **2 new tables**: Domain (intelligence tracking), Claim (AI extraction results)
- **3 modified tables**: Source (add counter-narrative FK), Event (add concernLevel), CounterNarrative (remove concernLevel)
- **1 migration required**: Move concern levels from CounterNarrative to Event
- **1 new constraint**: XOR check on Source associations
- **Total complexity**: Low-medium (straightforward schema additions, one-time migration)
