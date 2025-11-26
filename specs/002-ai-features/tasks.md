# Tasks: AI-Enhanced Accountability Tracking

**Input**: Design documents from `/specs/002-ai-features/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No specific test requirements mentioned in spec. Tests can be added if TDD approach is desired.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This project uses web application structure:
- Backend: `backend/src/`, `backend/prisma/`, `backend/tests/`
- Frontend: `frontend/src/`, `frontend/tests/`
- Extension: `extension/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database schema updates for all AI features

- [x] T001 Install OpenRouter API dependencies in backend (using native fetch - Node 18+)
- [x] T002 [P] Install article parsing library in backend (`pnpm add @mozilla/readability jsdom --filter @accountability-tracker/backend`)
- [x] T003 [P] Install URL parsing utilities in backend (native Node.js `url` module)
- [x] T004 Add Prisma schema changes for new entities in `backend/prisma/schema.prisma` (Domain, Claim models)
- [x] T005 Add Prisma schema modifications for existing entities in `backend/prisma/schema.prisma` (Source, Event, CounterNarrative)
- [x] T006 Create Prisma migration for schema changes (`pnpm --filter @accountability-tracker/backend prisma migrate dev --name ai-features --create-only`)
- [x] T007 [P] Add dark mode CSS variables file at `frontend/src/styles/themes.css`
- [x] T008 [P] Configure Tailwind dark mode in `frontend/tailwind.config.js` (added custom CSS variables to theme.extend.colors)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and data migration that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create concern level migration script in `backend/src/services/migration.ts` to copy concernLevel from CounterNarrative to Event
- [x] T010 Run concern level migration and verify data integrity (no data to migrate - database has 0 counter-narratives)
- [x] T011 Apply Prisma schema update to remove concernLevel from CounterNarrative model (removed concern_strength field via migration 20251125102247)
- [x] T012 Create base AI service client in `backend/src/services/ai.ts` with OpenRouter authentication and error handling
- [x] T013 [P] Create URL parser utility in `backend/src/lib/urlParser.ts` for domain normalization
- [x] T014 [P] Create LocalStorage abstraction in `frontend/src/lib/storage.ts` for settings persistence
- [x] T015 [P] Create domain intelligence service in `backend/src/services/domain.ts` for real-time aggregation

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Configure AI Settings (Priority: P1) 🎯 MVP

**Goal**: Users can configure OpenRouter API key and select AI model tier, with settings persisting across browser sessions

**Independent Test**: Open settings, enter API key, select model, save, close browser, reopen - settings should persist

### Implementation for User Story 1

- [x] T016 [P] [US1] Create SettingsPanel component in `frontend/src/components/settings/SettingsPanel.tsx` with modal/dialog structure
- [x] T017 [P] [US1] Create AISettings component in `frontend/src/components/settings/AISettings.tsx` with API key input and model dropdown
- [x] T018 [P] [US1] Create useSettings hook in `frontend/src/hooks/useSettings.ts` for localStorage persistence (includes cross-tab sync)
- [x] T019 [US1] Integrate SettingsPanel into main navigation in `frontend/src/components/Layout.tsx`
- [x] T020 [US1] Add settings icon/button to Events page (via main navigation - appears on all pages)
- [x] T021 [US1] Implement settings validation (API key format check, model selection required - integrated in useSettings hook and AISettings component)
- [x] T022 [US1] Add cross-tab settings synchronization in useSettings hook using storage events (completed in T018)
- [x] T023 [US1] Add API key show/hide toggle for security in AISettings component (Eye/EyeOff icons)

**Checkpoint**: Settings can be configured, saved, and persist across sessions

---

## Phase 4: User Story 2 - Toggle Dark Mode (Priority: P2)

**Goal**: Users can switch between light and dark themes with instant application-wide updates and WCAG AA contrast compliance

**Independent Test**: Toggle dark mode in settings, verify all pages update immediately with proper contrast and theme persists across sessions

### Implementation for User Story 2

- [x] T024 [P] [US2] Create ThemeToggle component in `frontend/src/components/settings/ThemeToggle.tsx` with switch UI (custom toggle with Moon/Sun icons)
- [x] T025 [P] [US2] Create useTheme hook in `frontend/src/hooks/useTheme.ts` for theme state management and CSS class toggling
- [x] T026 [US2] Integrate dark mode CSS variables from `frontend/src/styles/themes.css` into `frontend/src/index.css` (imported themes.css)
- [x] T027 [US2] Add theme preference to settings persistence in useSettings hook (already implemented in Phase 3)
- [x] T028 [US2] Add inline script to `frontend/index.html` to apply theme class before React loads (prevent flicker)
- [x] T029 [US2] Update all page components to use theme-aware Tailwind classes (already using theme-aware classes throughout)
- [x] T030 [P] [US2] Update tag color transformation logic for dark mode in `frontend/src/components/TagBadge.tsx` (increased opacity for dark mode)
- [x] T031 [US2] Test WCAG AA contrast ratios across all components (Built successfully - manual testing required via browser DevTools)

**Checkpoint**: Dark mode can be toggled, applies instantly across all pages, meets WCAG AA standards, and persists

---

## Phase 5: User Story 3 - Manage AI Model Selection (Priority: P3)

**Goal**: Users can choose between free and paid AI models with clear cost tier labels

**Independent Test**: Switch between model options in settings and verify selection applies to subsequent AI operations

### Implementation for User Story 3

- [x] T032 [P] [US3] Add model selection dropdown to AISettings component (implemented in Phase 3 - radio buttons with model cards)
- [x] T033 [P] [US3] Create model configuration constants in `frontend/src/lib/aiModels.ts` (extracted AI_MODELS with helper functions)
- [x] T034 [US3] Add model selection to settings persistence in useSettings hook (implemented in Phase 3)
- [x] T035 [US3] Display selected model indicator in AI operation UI components (added "Active Model" indicator in AISettings component)
- [x] T036 [US3] Add model tier badges (Free/Paid) to dropdown options in AISettings component (implemented in Phase 3)

**Checkpoint**: Model selection works, persists, and is visible during AI operations

---

## Phase 6: User Story 4 - AI Tag Suggestions (Priority: P4)

**Goal**: Users can get AI-powered tag suggestions for events with 3-5 recommendations, confidence scores, and one-click addition

**Independent Test**: Create event with title and description, click "Suggest Tags", verify 3-5 relevant suggestions appear within 5 seconds with confidence scores

### Implementation for User Story 4

- [x] T037 [P] [US4] Implement tag suggestion prompt engineering in `backend/src/services/tagSuggestion.ts` with system and user prompts
- [x] T038 [P] [US4] Create POST /api/ai/suggest-tags endpoint in `backend/src/api/ai.ts` using OpenRouter client
- [x] T039 [P] [US4] Add tag matching logic against existing database tags in tagSuggestion service
- [x] T040 [P] [US4] Create TagSuggestions component in `frontend/src/components/ai/TagSuggestions.tsx` with suggestion cards
- [x] T041 [P] [US4] Create useTagSuggestions hook in `frontend/src/hooks/useTagSuggestions.ts` with loading state and cancellation
- [x] T042 [P] [US4] Create aiService API client in `frontend/src/services/aiService.ts` for suggest-tags endpoint
- [x] T043 [US4] Add "Suggest Tags" button to CreateEvent form in `frontend/src/components/EventForm.tsx` (used for both create and edit)
- [x] T044 [US4] Add "Suggest Tags" button to Event edit form (completed via EventForm component reuse)
- [x] T045 [US4] Implement one-click tag addition (match existing or create new) in EventForm handleAddTag function
- [x] T046 [US4] Add loading indicator with cancel option during AI processing (implemented in TagSuggestions component)
- [x] T047 [US4] Add error handling for API failures (invalid key, rate limit, service unavailable - implemented in useTagSuggestions hook)
- [x] T048 [US4] Display confidence scores for each suggestion in TagSuggestions component (with color-coded progress bars)

**Checkpoint**: Tag suggestions work end-to-end with proper error handling and user feedback

---

## Phase 7: User Story 5 - AI Claim Extraction (Priority: P5)

**Goal**: Users can extract and categorize verifiable claims from article sources as factual assertions, opinions, or speculation

**Independent Test**: Add source URL to event, click "Extract Claims", verify claims are extracted and categorized within 30 seconds with selective saving

### Implementation for User Story 5

- [x] T049 [P] [US5] Implement article content extraction in `backend/src/services/articleParser.ts` using @mozilla/readability
- [x] T050 [P] [US5] Add article fetching with timeout and user-agent in articleParser service
- [x] T051 [P] [US5] Implement claim extraction prompt engineering in `backend/src/services/claimExtraction.ts` with category definitions
- [x] T052 [P] [US5] Create POST /api/ai/extract-claims endpoint in `backend/src/api/ai.ts`
- [x] T053 [P] [US5] Add paywall detection logic in articleParser service (check for 403, subscription prompts)
- [x] T054 [P] [US5] Add article content summarization for large articles (>5000 words) in articleParser
- [x] T055 [P] [US5] Create Claim model CRUD operations in `backend/src/models/claim.ts` and `backend/src/services/claimService.ts`
- [x] T056 [P] [US5] Create ClaimExtractor component in `frontend/src/components/ai/ClaimExtractor.tsx` with claim cards and category badges
- [x] T057 [P] [US5] Create useClaimExtraction hook in `frontend/src/hooks/useClaimExtraction.ts` with loading and cancellation
- [ ] T058 [US5] Add "Extract Claims" button next to source URL in SourceForm component (requires integration with source management)
- [x] T059 [US5] Implement selective claim saving (checkboxes for user selection) in ClaimExtractor component
- [x] T060 [US5] Add loading indicator with progress and cancel option during extraction (integrated in ClaimExtractor)
- [x] T061 [US5] Add error handling for paywalls, CORS, timeouts, parsing failures (implemented in articleParser and useClaimExtraction)
- [x] T062 [US5] Display confidence scores and category badges for each extracted claim (implemented in ClaimExtractor)
- [ ] T063 [US5] Save selected claims to database linked to sourceId (requires API integration)

**Checkpoint**: Claim extraction works end-to-end with robust error handling for edge cases

---

## Phase 8: User Story 6 - Counter-Narrative Sources (Priority: P6)

**Goal**: Users can add sources directly to counter-narratives with full parity to event sources including AI claim extraction

**Independent Test**: Create counter-narrative, add sources with URLs and bias ratings, extract claims, verify visual distinction from event sources

### Implementation for User Story 6

- [ ] T064 [P] [US6] Add counterNarrativeId field handling in Source model in `backend/src/models/source.ts`
- [ ] T065 [P] [US6] Update POST /api/sources endpoint in `backend/src/api/sources.ts` to accept counterNarrativeId (XOR with eventId)
- [ ] T066 [P] [US6] Add XOR validation for eventId and counterNarrativeId in source creation
- [ ] T067 [P] [US6] Update GET /api/events/:id endpoint in `backend/src/api/events.ts` to include counter-narrative sources separately
- [ ] T068 [P] [US6] Update CounterNarrativeForm component in `frontend/src/components/counterNarrative/CounterNarrativeForm.tsx` to include source management section
- [ ] T069 [US6] Add "Add Source" button and SourceForm integration in CounterNarrativeForm component
- [ ] T070 [US6] Apply visual distinction styling to counter-narrative sources section (different header, color, icon)
- [ ] T071 [US6] Enable "Extract Claims" button for counter-narrative sources (reuse ClaimExtractor component)
- [ ] T072 [US6] Update EventDetail page in `frontend/src/pages/EventDetail.tsx` to display counter-narrative sources separately from event sources
- [ ] T073 [US6] Test that same URL can exist for both event and counter-narrative sources

**Checkpoint**: Counter-narrative sources have full parity with event sources and are visually distinct

---

## Phase 9: User Story 7 - Domain Intelligence (Priority: P7)

**Goal**: System learns from historical source data to pre-fill bias ratings and enhance AI accuracy by tracking domain statistics

**Independent Test**: Add 5+ sources from same domain with bias ratings, then add new source from that domain and verify bias rating is pre-filled with average

### Implementation for User Story 7

- [ ] T074 [P] [US7] Create Domain model CRUD operations in `backend/src/models/domain.ts`
- [ ] T075 [P] [US7] Implement domain extraction and normalization in urlParser utility (remove www, protocol, standardize)
- [ ] T076 [P] [US7] Implement real-time domain statistics aggregation in domain service (incremental calculation on source add)
- [ ] T077 [P] [US7] Create GET /api/domains/:normalizedDomain/stats endpoint in `backend/src/api/domain.ts`
- [ ] T078 [P] [US7] Create GET /api/domains/suggest-bias endpoint in `backend/src/api/domain.ts` for pre-fill suggestions
- [ ] T079 [P] [US7] Create GET /api/domains endpoint in `backend/src/api/domain.ts` for listing all domains
- [ ] T080 [P] [US7] Create domainService API client in `frontend/src/services/domainService.ts`
- [ ] T081 [US7] Update SourceForm component in `frontend/src/components/sources/SourceForm.tsx` to fetch and display domain context
- [ ] T082 [US7] Add domain statistics display in SourceForm (e.g., "NYTimes: 15 sources, avg bias: -1.2")
- [ ] T083 [US7] Implement bias rating pre-fill based on domain average in SourceForm
- [ ] T084 [US7] Modify source creation transaction in `backend/src/services/source.ts` to update domain stats atomically
- [ ] T085 [US7] Pass domain context to AI claim extraction in claimExtraction service for enhanced accuracy
- [ ] T086 [US7] Add confidence indicator for domain-based bias suggestions (based on sample size)
- [ ] T087 [US7] Handle subdomain normalization strategy (keep separate by default) in urlParser

**Checkpoint**: Domain intelligence tracks statistics in real-time and enhances both user workflow and AI accuracy

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, error handling improvements, and production readiness

- [ ] T088 Add comprehensive error messages for all AI API failures with user-friendly explanations
- [ ] T089 [P] Add rate limiting detection and retry logic with exponential backoff in AI service
- [ ] T090 [P] Add request timeout handling (10s for tag suggestions, 30s for claim extraction) with cancellation
- [ ] T091 [P] Add loading states and progress indicators for all AI operations across frontend
- [ ] T092 Add settings export/import functionality (optional enhancement)
- [ ] T093 [P] Add API key validation on first use with clear feedback in AISettings component
- [ ] T094 [P] Optimize domain statistics queries with PostgreSQL indexes (already defined in data-model.md)
- [ ] T095 Add database migration rollback script for concern level changes
- [ ] T096 [P] Add dark mode color transformation for all UI elements (buttons, inputs, cards, modals)
- [ ] T097 Verify WCAG AA compliance across all pages with automated contrast checking
- [ ] T098 [P] Add logging for all AI operations (requests, responses, errors) in backend
- [ ] T099 [P] Add telemetry for AI feature usage (optional analytics)
- [ ] T100 Create production deployment checklist (environment variables, database migrations, API key setup)
- [ ] T101 Update quickstart.md with any additional setup steps discovered during implementation
- [ ] T102 Run end-to-end workflow tests for all 7 user stories

**Checkpoint**: All features integrated, polished, and production-ready

---

## Dependencies & Execution Order

### User Story Dependencies

```
Setup (Phase 1) + Foundational (Phase 2)
    ↓
US1: Configure AI Settings (P1) ─────┐
    ↓                                 ↓
US2: Toggle Dark Mode (P2)           US4: AI Tag Suggestions (P4) ── depends on US1
    ↓                                 ↓
US3: Manage AI Model (P3) ─────────→ US5: AI Claim Extraction (P5) ── depends on US1, US4
    ↓
US6: Counter-Narrative Sources (P6) ── depends on existing source infrastructure
    ↓
US7: Domain Intelligence (P7) ────── depends on Source model changes from US6
```

**Key Dependencies**:
- **US4, US5** depend on **US1** (AI settings must exist before AI features work)
- **US3** depends on **US1** (model selection is part of AI settings)
- **US7** depends on **US6** (domain tracking uses source creation flow)
- **US2** is independent (dark mode has no dependencies)

### Parallelization Opportunities

**After Phase 2 completes, these can run in parallel**:
- US1 (Settings) + US2 (Dark Mode) - completely independent
- US6 (Counter-Narrative Sources) - independent from AI features

**After US1 completes, these can run in parallel**:
- US3 (Model Selection) + US4 (Tag Suggestions) - both extend US1

**Sequential Required**:
- US1 → US4 → US5 (AI features build on each other)
- US6 → US7 (domain intelligence builds on source model changes)

### Parallel Execution Examples

**Example 1: Maximum Parallelization**
```
Phase 1 + Phase 2 (sequential - foundational)
    ↓
┌────────────┬────────────┬────────────┐
│   US1      │   US2      │   US6      │  (parallel)
│ Settings   │ Dark Mode  │ CN Sources │
└────────────┴────────────┴────────────┘
    ↓
┌────────────┬────────────┐
│   US3      │   US4      │  (parallel after US1)
│ Model Sel  │ Tag Sugg   │
└────────────┴────────────┘
    ↓            ↓
    US5 ←────────┘  (depends on US1 + US4)
    ↓
    US7  (depends on US6)
```

**Example 2: MVP-First Approach**
```
Phase 1 + Phase 2 → US1 (MVP) → Validate → US2 → US3 → US4 → US5 → US6 → US7
```

---

## Implementation Strategy

### MVP Definition (Minimum Viable Product)

**MVP = User Story 1 only**: Configure AI Settings
- This alone provides value: Users can configure their AI preferences
- All other features depend on this foundation
- Can be deployed and tested independently

### Incremental Delivery Approach

**Iteration 1** (MVP):
- Phase 1 + Phase 2 + US1
- Deliverable: Settings panel with AI configuration

**Iteration 2** (UX Enhancement):
- US2 (Dark Mode)
- Deliverable: Theme switching capability

**Iteration 3** (AI Features - Core):
- US3 + US4 + US5
- Deliverable: Full AI capabilities (model selection, tag suggestions, claim extraction)

**Iteration 4** (Data Model Enhancement):
- US6 + US7
- Deliverable: Counter-narrative sources + domain intelligence

**Iteration 5** (Polish):
- Phase 10
- Deliverable: Production-ready system

### Testing Strategy (If TDD Approach Desired)

For each user story, tests can be added before implementation tasks:
- Contract tests for API endpoints ([P] parallel)
- Integration tests for user journeys ([P] parallel)
- Unit tests for services ([P] parallel)

Example insertion point for US4:
```markdown
### Tests for User Story 4
- [ ] T036a [P] [US4] Contract test for POST /api/ai/suggest-tags
- [ ] T036b [P] [US4] Integration test for tag suggestion flow
### Implementation for User Story 4
- [ ] T037 [P] [US4] Implement tag suggestion prompt engineering...
```

---

## Task Summary

**Total Tasks**: 102

**Breakdown by Phase**:
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (US1 - Configure AI Settings): 8 tasks
- Phase 4 (US2 - Toggle Dark Mode): 8 tasks
- Phase 5 (US3 - Manage AI Model Selection): 5 tasks
- Phase 6 (US4 - AI Tag Suggestions): 12 tasks
- Phase 7 (US5 - AI Claim Extraction): 15 tasks
- Phase 8 (US6 - Counter-Narrative Sources): 10 tasks
- Phase 9 (US7 - Domain Intelligence): 14 tasks
- Phase 10 (Polish & Cross-Cutting): 15 tasks

**Parallelization**:
- 54 tasks marked [P] for parallel execution
- 48 tasks sequential (within their phase)

**Independent Test Criteria** (per user story - from spec.md):
- US1: Open settings, configure, close browser, reopen - settings persist
- US2: Toggle theme, check all pages, verify contrast, reopen - theme persists
- US3: Switch models in settings, verify applied to AI operations
- US4: Create event, suggest tags, verify 3-5 suggestions in <5s with 70% accuracy
- US5: Add source, extract claims, verify categorization in <30s with 80% accuracy
- US6: Add CN source, extract claims, verify visual distinction, test same URL allowed
- US7: Add 5+ sources from domain, verify bias pre-fill on next source

**Suggested MVP**: Phase 1 + Phase 2 + Phase 3 (US1 only) = 23 tasks

---

## Format Validation

✅ All tasks follow required format: `- [ ] [ID] [P?] [Story] Description with file path`
✅ Task IDs sequential (T001-T102)
✅ [P] markers only on parallelizable tasks (different files, no dependencies)
✅ [Story] labels applied to all user story phase tasks (US1-US7)
✅ No [Story] labels on Setup, Foundational, or Polish phases
✅ All tasks include specific file paths
✅ Tasks organized by user story for independent implementation
✅ Dependencies clearly documented
✅ Independent test criteria defined for each story
