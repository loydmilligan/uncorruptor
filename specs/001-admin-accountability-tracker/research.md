# Research: Administration Accountability Tracker

**Date**: 2025-11-24
**Branch**: `001-admin-accountability-tracker`

## Overview

This document captures technology decisions and research findings for implementing the Administration Accountability Tracker - a personal web application for tracking political events with sources, counter-narratives, and visualizations.

---

## Technology Decisions

### 1. Backend Framework

**Decision**: Fastify with TypeScript

**Rationale**:
- Faster than Express with built-in TypeScript support
- Schema-based validation with JSON Schema
- Excellent plugin ecosystem
- Low overhead for simple CRUD operations
- Built-in OpenAPI/Swagger documentation support

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Express | Slower, requires more middleware setup, less TypeScript-native |
| NestJS | Overkill for single-user app, adds unnecessary abstraction layers |
| Hono | Less mature ecosystem, fewer PostgreSQL/Prisma examples |

---

### 2. ORM / Database Access

**Decision**: Prisma ORM

**Rationale**:
- Type-safe database queries with auto-generated TypeScript types
- Excellent PostgreSQL support
- Built-in migration system
- Intuitive schema definition language
- Good performance for the expected scale (1,000 events, 5,000 sources)

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Drizzle | Newer, less documentation, steeper learning curve |
| TypeORM | More verbose, decorator-heavy, class-based approach |
| Raw SQL (pg) | No type safety, manual query building, migration management burden |

---

### 3. Frontend Framework

**Decision**: React 18 with Vite

**Rationale**:
- Mature ecosystem with extensive component libraries
- Vite provides fast development experience
- React Query (TanStack Query) for server state management
- Familiar patterns for CRUD applications
- Easy integration with charting libraries

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Next.js | SSR unnecessary for local-only app, adds complexity |
| Vue 3 | Smaller ecosystem for data visualization components |
| SvelteKit | Less mature for complex dashboard applications |

---

### 4. Styling

**Decision**: TailwindCSS with shadcn/ui components

**Rationale**:
- Rapid UI development with utility classes
- shadcn/ui provides accessible, customizable components
- Consistent design system without heavy framework
- Easy dark mode support if desired later
- Copy-paste components, not a dependency

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Material UI | Heavy bundle size, opinionated styling |
| Chakra UI | Additional runtime, less flexible |
| Plain CSS | Slower development, inconsistent styling |

---

### 5. Data Visualization

**Decision**: Recharts

**Rationale**:
- React-native, declarative API
- Good performance with moderate data sets
- Built-in responsive containers
- Supports bar charts, line charts, timelines needed for dashboard
- Easy customization and theming

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| D3.js | Lower-level, requires more code for basic charts |
| Chart.js | Canvas-based, less React-native |
| Victory | Less documentation, smaller community |
| Nivo | Heavier bundle, more complex API |

---

### 6. Full-Text Search

**Decision**: PostgreSQL native full-text search (tsvector/tsquery)

**Rationale**:
- No additional infrastructure required
- Built into PostgreSQL, well-supported by Prisma
- Sufficient for 1,000 events with 5,000 sources
- Supports ranking and highlighting
- Can add GIN index for performance

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Elasticsearch | Overkill for scale, additional infrastructure |
| Meilisearch | Additional service to maintain |
| Application-level LIKE | Poor performance, no ranking |

---

### 7. Chrome Extension Architecture

**Decision**: Manifest V3 with popup-only UI

**Rationale**:
- Manifest V3 is required for new Chrome extensions
- Popup provides quick access without page modification
- Service worker handles background sync/queue
- Content script only for page metadata extraction
- Minimal permissions required

**Key Patterns**:
- `chrome.storage.local` for offline queue
- `chrome.runtime.sendMessage` for popup-to-background communication
- Content script extracts `<title>`, `<meta>` tags, Open Graph data

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Sidebar panel | More complex, not needed for quick capture |
| Full page override | Unnecessary for use case |
| Manifest V2 | Deprecated, will stop working in Chrome |

---

### 8. Testing Strategy

**Decision**: Vitest + Playwright

**Rationale**:
- Vitest: Fast, Vite-native, Jest-compatible API
- Playwright: Cross-browser E2E, excellent for SPA testing
- Shared TypeScript config across backend/frontend tests
- Good mocking capabilities for API tests

**Test Layers**:
| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit (services, utils) | Vitest | Core business logic |
| Integration (API routes) | Vitest + supertest | All endpoints |
| E2E (user flows) | Playwright | P1 user stories |
| Extension | Vitest + Chrome testing | Popup, sync queue |

---

### 9. API Design

**Decision**: RESTful JSON API with OpenAPI spec

**Rationale**:
- Simple CRUD operations map well to REST
- OpenAPI provides documentation and client generation
- Familiar patterns for frontend consumption
- Easy to test with standard tools

**URL Structure**:
```
GET    /api/events         - List events (with filtering)
POST   /api/events         - Create event
GET    /api/events/:id     - Get event detail
PUT    /api/events/:id     - Update event
DELETE /api/events/:id     - Delete event

POST   /api/events/:id/sources      - Add source to event
DELETE /api/events/:id/sources/:sid - Remove source

POST   /api/events/:id/counter-narrative - Add/update counter-narrative

GET    /api/tags           - List all tags
POST   /api/tags           - Create custom tag

GET    /api/dashboard/summary       - Dashboard aggregations
GET    /api/dashboard/timeline      - Timeline data

GET    /api/publications   - List known publications (for bias suggestions)
```

---

### 10. Bias Rating System

**Decision**: 7-point scale with known publication directory

**Rationale**:
- Matches common media bias characterizations (AllSides, Media Bias/Fact Check)
- Provides granularity without overwhelming options
- Pre-seeded directory reduces data entry burden

**Scale**:
| Value | Label | Example Publications |
|-------|-------|---------------------|
| -3 | Far Left | Jacobin, Daily Kos |
| -2 | Left | MSNBC, HuffPost |
| -1 | Center-Left | NYT, Washington Post, CNN |
| 0 | Center | AP, Reuters, BBC |
| 1 | Center-Right | WSJ (news), The Hill |
| 2 | Right | Fox News, NY Post |
| 3 | Far Right | Breitbart, OANN |

**Initial Publication Seed**: ~50-100 common sources with default ratings (user can override per-source).

---

## Implementation Notes

### Database Indexing Strategy

For performance with 1,000+ events:
- B-tree index on `Event.date` for date range queries
- GIN index on `Event.search_vector` for full-text search
- B-tree index on `Event.administration_period` for filtering
- Composite index on `EventTag(event_id, tag_id)` for tag filtering

### Offline Queue (Chrome Extension)

```typescript
interface QueuedItem {
  id: string;
  type: 'create_event' | 'add_source';
  payload: object;
  createdAt: number;
  retryCount: number;
}
```

- Store in `chrome.storage.local`
- Process queue on service worker activation
- Retry with exponential backoff (max 3 attempts)
- Show badge with queue count

### Administration Period Detection

```typescript
function getAdministrationPeriod(date: Date): 'trump-1' | 'trump-2' | 'other' {
  const timestamp = date.getTime();
  const TRUMP_1_START = new Date('2017-01-20').getTime();
  const TRUMP_1_END = new Date('2021-01-20').getTime();
  const TRUMP_2_START = new Date('2025-01-20').getTime();

  if (timestamp >= TRUMP_1_START && timestamp < TRUMP_1_END) return 'trump-1';
  if (timestamp >= TRUMP_2_START) return 'trump-2';
  return 'other';
}
```

---

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Database choice? | PostgreSQL (user confirmed) |
| Authentication needed? | No, local network only (user confirmed) |
| Framework preference? | Fastify + React (best fit for requirements) |
| Search approach? | PostgreSQL full-text (sufficient for scale) |

---

## References

- [Fastify Documentation](https://fastify.dev/)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Recharts API](https://recharts.org/en-US/api)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
