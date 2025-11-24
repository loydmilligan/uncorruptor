# Tasks: Administration Accountability Tracker

**Input**: Design documents from `/specs/001-admin-accountability-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: Not explicitly requested. Implementation-focused tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/prisma/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Extension**: `extension/src/`, `extension/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and workspace structure

- [x] T001 Create monorepo structure with `backend/`, `frontend/`, `extension/` directories
- [x] T002 Initialize backend Node.js project with TypeScript in `backend/package.json`
- [x] T003 [P] Initialize frontend Vite+React project with TypeScript in `frontend/package.json`
- [x] T004 [P] Initialize Chrome extension project with TypeScript in `extension/package.json`
- [x] T005 [P] Create root `package.json` with workspace configuration for pnpm
- [x] T006 [P] Configure TypeScript base config in `tsconfig.base.json`
- [x] T007 [P] Configure ESLint and Prettier in root `eslint.config.js` and `.prettierrc`
- [x] T008 Create shared environment configuration with `.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Backend Core

- [x] T009 Install Prisma and configure in `backend/prisma/schema.prisma` with PostgreSQL datasource
- [x] T010 Define complete Prisma schema with all entities (Event, Tag, EventTag, Source, Publication, CounterNarrative) in `backend/prisma/schema.prisma`
- [x] T011 Create database seed file with default tags and sample publications in `backend/prisma/seed.ts`
- [x] T012 Generate Prisma client and run initial migration

### Backend API Framework

- [x] T013 Install Fastify with TypeScript support in `backend/`
- [x] T014 [P] Create Fastify server entry point with CORS config in `backend/src/index.ts`
- [x] T015 [P] Create error handling middleware in `backend/src/lib/errors.ts`
- [x] T016 [P] Create response formatting utilities in `backend/src/lib/response.ts`
- [x] T017 [P] Create date/admin-period calculation utility in `backend/src/lib/adminPeriod.ts`
- [x] T018 [P] Configure Swagger/OpenAPI documentation plugin in `backend/src/plugins/swagger.ts`

### Frontend Core

- [x] T019 Install React dependencies (React Query, React Router, TailwindCSS) in `frontend/`
- [x] T020 [P] Configure TailwindCSS in `frontend/tailwind.config.js` and `frontend/src/index.css`
- [x] T021 [P] Setup React Router with basic routes in `frontend/src/App.tsx`
- [x] T022 [P] Create API client base configuration in `frontend/src/services/api.ts`
- [x] T023 [P] Create base layout component in `frontend/src/components/Layout.tsx`
- [x] T024 Install and configure shadcn/ui components in `frontend/`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create and Categorize Events (Priority: P1) 🎯 MVP

**Goal**: Users can create events with title, description, date, and multiple tags

**Independent Test**: Create a new event with tags, verify it appears in the event list with correct admin period auto-assigned

### Backend Implementation for US1

- [x] T025 [P] [US1] Create Event types/interfaces in `backend/src/models/event.ts`
- [x] T026 [P] [US1] Create Tag types/interfaces in `backend/src/models/tag.ts`
- [x] T027 [US1] Implement EventService with CRUD operations in `backend/src/services/eventService.ts`
- [x] T028 [US1] Implement TagService with list/create operations in `backend/src/services/tagService.ts`
- [x] T029 [US1] Create GET /api/events endpoint with pagination in `backend/src/api/events.ts`
- [x] T030 [US1] Create POST /api/events endpoint in `backend/src/api/events.ts`
- [x] T031 [US1] Create GET /api/events/:id endpoint in `backend/src/api/events.ts`
- [x] T032 [US1] Create PUT /api/events/:id endpoint in `backend/src/api/events.ts`
- [x] T033 [US1] Create DELETE /api/events/:id endpoint in `backend/src/api/events.ts`
- [x] T034 [US1] Create GET /api/tags endpoint in `backend/src/api/tags.ts`
- [x] T035 [US1] Create POST /api/tags endpoint for custom tags in `backend/src/api/tags.ts`
- [x] T036 [US1] Create DELETE /api/tags/:id endpoint in `backend/src/api/tags.ts`
- [x] T037 [US1] Register event and tag routes in `backend/src/index.ts`

### Frontend Implementation for US1

- [x] T038 [P] [US1] Create useEvents hook with React Query in `frontend/src/hooks/useEvents.ts`
- [x] T039 [P] [US1] Create useTags hook with React Query in `frontend/src/hooks/useTags.ts`
- [x] T040 [P] [US1] Create TagBadge component in `frontend/src/components/TagBadge.tsx`
- [x] T041 [P] [US1] Create TagSelector multi-select component in `frontend/src/components/TagSelector.tsx`
- [x] T042 [US1] Create EventForm component (create/edit) in `frontend/src/components/EventForm.tsx`
- [x] T043 [US1] Create EventCard list item component in `frontend/src/components/EventCard.tsx`
- [x] T044 [US1] Create EventList page in `frontend/src/pages/EventsPage.tsx`
- [x] T045 [US1] Create EventDetail page in `frontend/src/pages/EventDetailPage.tsx`
- [x] T046 [US1] Create CreateEvent page/modal in `frontend/src/pages/CreateEventPage.tsx`
- [x] T047 [US1] Add routes for events pages in `frontend/src/App.tsx`
- [x] T048 [US1] Add navigation links to Layout in `frontend/src/components/Layout.tsx`

**Checkpoint**: Users can create, view, edit, and delete events with tags. MVP complete!

---

## Phase 4: User Story 2 - Add and Rate Sources (Priority: P1)

**Goal**: Users can attach multiple sources to events with bias ratings

**Independent Test**: Add 3 sources with different bias ratings to an event, verify they display with visual bias indicators

### Backend Implementation for US2

- [ ] T049 [P] [US2] Create Source types/interfaces in `backend/src/models/source.ts`
- [ ] T050 [P] [US2] Create Publication types/interfaces in `backend/src/models/publication.ts`
- [ ] T051 [US2] Implement SourceService with CRUD operations in `backend/src/services/sourceService.ts`
- [ ] T052 [US2] Implement PublicationService with lookup in `backend/src/services/publicationService.ts`
- [ ] T053 [US2] Create POST /api/events/:id/sources endpoint in `backend/src/api/sources.ts`
- [ ] T054 [US2] Create PUT /api/events/:id/sources/:sourceId endpoint in `backend/src/api/sources.ts`
- [ ] T055 [US2] Create DELETE /api/events/:id/sources/:sourceId endpoint in `backend/src/api/sources.ts`
- [ ] T056 [US2] Create GET /api/publications endpoint in `backend/src/api/publications.ts`
- [ ] T057 [US2] Create GET /api/publications/lookup endpoint in `backend/src/api/publications.ts`
- [ ] T058 [US2] Register source and publication routes in `backend/src/index.ts`
- [ ] T059 [US2] Add publication seed data (50+ sources) in `backend/prisma/seed.ts`

### Frontend Implementation for US2

- [ ] T060 [P] [US2] Create useSources hook in `frontend/src/hooks/useSources.ts`
- [ ] T061 [P] [US2] Create usePublications hook in `frontend/src/hooks/usePublications.ts`
- [ ] T062 [P] [US2] Create BiasRatingBadge component in `frontend/src/components/BiasRatingBadge.tsx`
- [ ] T063 [P] [US2] Create BiasRatingSelector component in `frontend/src/components/BiasRatingSelector.tsx`
- [ ] T064 [US2] Create SourceForm component in `frontend/src/components/SourceForm.tsx`
- [ ] T065 [US2] Create SourceList component in `frontend/src/components/SourceList.tsx`
- [ ] T066 [US2] Integrate SourceList into EventDetailPage in `frontend/src/pages/EventDetailPage.tsx`
- [ ] T067 [US2] Add source management UI to EventDetailPage in `frontend/src/pages/EventDetailPage.tsx`

**Checkpoint**: Users can add sources with bias ratings to events. Both P1 stories complete!

---

## Phase 5: User Story 3 - Counter-Narratives and Critical Analysis (Priority: P2)

**Goal**: Users can record admin's position and rate argument strength on both sides

**Independent Test**: Add counter-narrative to an event, view in critical analysis mode showing side-by-side comparison

### Backend Implementation for US3

- [ ] T068 [P] [US3] Create CounterNarrative types in `backend/src/models/counterNarrative.ts`
- [ ] T069 [US3] Implement CounterNarrativeService in `backend/src/services/counterNarrativeService.ts`
- [ ] T070 [US3] Create PUT /api/events/:id/counter-narrative endpoint in `backend/src/api/counterNarrative.ts`
- [ ] T071 [US3] Create DELETE /api/events/:id/counter-narrative endpoint in `backend/src/api/counterNarrative.ts`
- [ ] T072 [US3] Register counter-narrative routes in `backend/src/index.ts`

### Frontend Implementation for US3

- [ ] T073 [P] [US3] Create useCounterNarrative hook in `frontend/src/hooks/useCounterNarrative.ts`
- [ ] T074 [P] [US3] Create StrengthRatingSelector component in `frontend/src/components/StrengthRatingSelector.tsx`
- [ ] T075 [US3] Create CounterNarrativeForm component in `frontend/src/components/CounterNarrativeForm.tsx`
- [ ] T076 [US3] Create CriticalAnalysisView component (side-by-side) in `frontend/src/components/CriticalAnalysisView.tsx`
- [ ] T077 [US3] Integrate CounterNarrativeForm into EventDetailPage in `frontend/src/pages/EventDetailPage.tsx`
- [ ] T078 [US3] Add critical analysis mode toggle to EventDetailPage in `frontend/src/pages/EventDetailPage.tsx`

**Checkpoint**: Users can add counter-narratives and view critical analysis comparison

---

## Phase 6: User Story 4 - Browse and Filter Events (Priority: P2)

**Goal**: Users can search, filter by tags, date range, and admin period

**Independent Test**: Create 10 events with varied attributes, successfully filter to find specific subsets

### Backend Implementation for US4

- [ ] T079 [US4] Add full-text search to EventService in `backend/src/services/eventService.ts`
- [ ] T080 [US4] Add tag filtering to GET /api/events in `backend/src/api/events.ts`
- [ ] T081 [US4] Add date range filtering to GET /api/events in `backend/src/api/events.ts`
- [ ] T082 [US4] Add admin period filtering to GET /api/events in `backend/src/api/events.ts`
- [ ] T083 [US4] Add combined filter support to GET /api/events in `backend/src/api/events.ts`
- [ ] T084 [US4] Create database migration for full-text search index in `backend/prisma/migrations/`

### Frontend Implementation for US4

- [ ] T085 [P] [US4] Create SearchInput component in `frontend/src/components/SearchInput.tsx`
- [ ] T086 [P] [US4] Create DateRangeFilter component in `frontend/src/components/DateRangeFilter.tsx`
- [ ] T087 [P] [US4] Create AdminPeriodFilter component in `frontend/src/components/AdminPeriodFilter.tsx`
- [ ] T088 [US4] Create FilterPanel component combining all filters in `frontend/src/components/FilterPanel.tsx`
- [ ] T089 [US4] Integrate FilterPanel into EventsPage in `frontend/src/pages/EventsPage.tsx`
- [ ] T090 [US4] Update useEvents hook to support filter parameters in `frontend/src/hooks/useEvents.ts`
- [ ] T091 [US4] Add URL query param sync for filters in `frontend/src/pages/EventsPage.tsx`

**Checkpoint**: Users can search and filter events by multiple criteria

---

## Phase 7: User Story 5 - Chrome Extension (Priority: P3)

**Goal**: Quick capture from browser - create events or add sources

**Independent Test**: Install extension, navigate to news article, create event pre-populated with page data

### Extension Implementation for US5

- [ ] T092 [US5] Create manifest.json for Chrome Manifest V3 in `extension/manifest.json`
- [ ] T093 [P] [US5] Create popup HTML/CSS structure in `extension/src/popup/popup.html`
- [ ] T094 [P] [US5] Create content script for page data extraction in `extension/src/content/extractPageData.ts`
- [ ] T095 [P] [US5] Create background service worker in `extension/src/background/serviceWorker.ts`
- [ ] T096 [US5] Implement API client for extension in `extension/src/lib/api.ts`
- [ ] T097 [US5] Create popup React app entry in `extension/src/popup/index.tsx`
- [ ] T098 [US5] Create NewEventForm in popup in `extension/src/popup/components/NewEventForm.tsx`
- [ ] T099 [US5] Create AddSourceForm in popup in `extension/src/popup/components/AddSourceForm.tsx`
- [ ] T100 [US5] Create EventSearch component in popup in `extension/src/popup/components/EventSearch.tsx`
- [ ] T101 [US5] Implement offline queue in service worker in `extension/src/background/offlineQueue.ts`
- [ ] T102 [US5] Create settings page for API URL config in `extension/src/popup/components/Settings.tsx`
- [ ] T103 [US5] Create extension build configuration in `extension/vite.config.ts`
- [ ] T104 [US5] Add extension build script to `extension/package.json`

**Checkpoint**: Chrome extension can create events and add sources from any webpage

---

## Phase 8: User Story 6 - Dashboard Visualization (Priority: P3)

**Goal**: Visualizations showing event distribution and admin comparison

**Independent Test**: With 20+ events, view dashboard with working charts that respond to data

### Backend Implementation for US6

- [ ] T105 [P] [US6] Create DashboardService for aggregations in `backend/src/services/dashboardService.ts`
- [ ] T106 [US6] Create GET /api/dashboard/summary endpoint in `backend/src/api/dashboard.ts`
- [ ] T107 [US6] Create GET /api/dashboard/timeline endpoint in `backend/src/api/dashboard.ts`
- [ ] T108 [US6] Create GET /api/dashboard/comparison endpoint in `backend/src/api/dashboard.ts`
- [ ] T109 [US6] Register dashboard routes in `backend/src/index.ts`

### Frontend Implementation for US6

- [ ] T110 Install Recharts in `frontend/`
- [ ] T111 [P] [US6] Create useDashboard hook in `frontend/src/hooks/useDashboard.ts`
- [ ] T112 [P] [US6] Create EventsByTagChart component in `frontend/src/components/charts/EventsByTagChart.tsx`
- [ ] T113 [P] [US6] Create TimelineChart component in `frontend/src/components/charts/TimelineChart.tsx`
- [ ] T114 [P] [US6] Create AdminComparisonChart component in `frontend/src/components/charts/AdminComparisonChart.tsx`
- [ ] T115 [P] [US6] Create StatCard component for summary stats in `frontend/src/components/charts/StatCard.tsx`
- [ ] T116 [US6] Create DashboardPage in `frontend/src/pages/DashboardPage.tsx`
- [ ] T117 [US6] Add click-through from charts to filtered event list in `frontend/src/pages/DashboardPage.tsx`
- [ ] T118 [US6] Add Dashboard route and navigation in `frontend/src/App.tsx`

**Checkpoint**: Dashboard displays all visualizations with drill-down capability

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T119 [P] Add loading states to all pages in `frontend/src/components/`
- [ ] T120 [P] Add error boundaries and error states in `frontend/src/components/ErrorBoundary.tsx`
- [ ] T121 [P] Add empty states for lists in `frontend/src/components/EmptyState.tsx`
- [ ] T122 Add duplicate event detection warning in `backend/src/services/eventService.ts`
- [ ] T129 [P] Add source archive status toggle UI in `frontend/src/components/SourceList.tsx`
- [ ] T130 Implement manual source archive/restore in `backend/src/api/sources.ts`
- [ ] T123 [P] Add keyboard shortcuts for common actions in `frontend/src/hooks/useKeyboardShortcuts.ts`
- [ ] T124 Optimize database queries with proper includes/selects in `backend/src/services/`
- [ ] T125 Add pagination to all list endpoints in `backend/src/api/`
- [ ] T126 Create Docker Compose setup in `docker-compose.yml`
- [ ] T127 Update quickstart.md with final setup instructions in `specs/001-admin-accountability-tracker/quickstart.md`
- [ ] T128 Run full application validation per quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ──────────────────┐
                                 ▼
Phase 2: Foundational ───────────┤
         (BLOCKS ALL STORIES)    │
                                 ▼
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            Phase 3: US1   Phase 4: US2  (can parallel)
            (P1-Events)    (P1-Sources)
                    │            │
                    └────────────┤
                                 ▼
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            Phase 5: US3   Phase 6: US4  (can parallel)
            (P2-Counter)   (P2-Filter)
                    │            │
                    └────────────┤
                                 ▼
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            Phase 7: US5   Phase 8: US6  (can parallel)
            (P3-Extension) (P3-Dashboard)
                    │            │
                    └────────────┤
                                 ▼
                         Phase 9: Polish
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Events/Tags) | Phase 2 | Foundational complete |
| US2 (Sources) | Phase 2 | Foundational complete |
| US3 (Counter-Narrative) | US1 | Events exist to add to |
| US4 (Search/Filter) | US1 | Events exist to filter |
| US5 (Extension) | US1, US2 | Core API available |
| US6 (Dashboard) | US1 | Events exist to aggregate |

### Parallel Opportunities

**Within Phase 1 (Setup)**:
- T003, T004, T005, T006, T007 can all run in parallel

**Within Phase 2 (Foundational)**:
- T014, T015, T016, T017, T018 (backend utilities)
- T019, T020, T021, T022, T023 (frontend setup)

**User Stories in Parallel**:
- US1 and US2 can be developed simultaneously (both P1)
- US3 and US4 can be developed simultaneously (both P2)
- US5 and US6 can be developed simultaneously (both P3)

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# Launch backend models in parallel:
Task: "Create Event types/interfaces in backend/src/models/event.ts"
Task: "Create Tag types/interfaces in backend/src/models/tag.ts"

# Launch frontend hooks in parallel:
Task: "Create useEvents hook with React Query in frontend/src/hooks/useEvents.ts"
Task: "Create useTags hook with React Query in frontend/src/hooks/useTags.ts"

# Launch UI components in parallel:
Task: "Create TagBadge component in frontend/src/components/TagBadge.tsx"
Task: "Create TagSelector multi-select component in frontend/src/components/TagSelector.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T024)
3. Complete Phase 3: User Story 1 (T025-T048)
4. **STOP and VALIDATE**: Test event creation/editing independently
5. Deploy for personal use immediately

### Full P1 Scope (Stories 1 + 2)

1. Complete Setup + Foundational
2. Complete US1 (Events) → Validate
3. Complete US2 (Sources) → Validate
4. MVP with events and sources ready

### Incremental Delivery

| Milestone | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 | Create and tag events |
| MVP+ | US1, US2 | Events with rated sources |
| Core | US1-US4 | Full web app without extension |
| Complete | US1-US6 | Full system with extension and dashboard |

### Recommended Order (Solo Developer)

1. **Week 1**: Setup + Foundational + US1 → MVP!
2. **Week 2**: US2 + US3 → Sources and counter-narratives
3. **Week 3**: US4 + US6 → Search/filter and dashboard
4. **Week 4**: US5 + Polish → Chrome extension

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No authentication needed - local network only
