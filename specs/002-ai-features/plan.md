# Implementation Plan: AI-Enhanced Accountability Tracking

**Branch**: `002-ai-features` | **Date**: 2025-11-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ai-features/spec.md`

## Summary

Enhances the accountability tracker with AI capabilities via OpenRouter integration, adding intelligent tag suggestions (30% faster tagging), claim extraction from articles (fact vs opinion categorization), dark mode theming, settings infrastructure with browser storage persistence, counter-narrative source parity, and domain intelligence tracking that learns from historical bias patterns to pre-fill ratings and improve AI accuracy by 15%.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend + backend, matching existing project)
**Primary Dependencies**:
- Backend: Node.js, Fastify (existing), Prisma ORM (existing), OpenRouter API client (new)
- Frontend: React 18 (existing), TailwindCSS (existing), Dark mode CSS variables (new), LocalStorage API (browser native)
- Shared: Article content extraction library (Readability or similar), URL parsing utilities

**Storage**:
- PostgreSQL (existing) - new tables: Domain, Claim; modified: Source (add counterNarrativeId), Event (add concernLevel), remove concernLevel from CounterNarrative
- Browser LocalStorage - AI settings (API key, model selection), theme preference

**Testing**: Vitest (existing), Playwright E2E (existing)
**Target Platform**: Linux server (backend), Chrome browser (frontend + extension)
**Project Type**: Web application (frontend + backend + browser extension) - extending existing

**Performance Goals**:
- AI tag suggestions: <5 seconds
- AI claim extraction: <30 seconds for 5000-word articles
- Theme toggle: <1 second with no flicker
- Domain stats computation: real-time on source add

**Constraints**:
- OpenRouter API key required (user-provided)
- Browser storage limited to ~5-10MB (sufficient for settings)
- Article fetching subject to CORS, paywalls, timeouts
- AI model context limits (~128k tokens for free tier)
- Local network only (existing constraint)

**Scale/Scope**:
- Existing base: ~1,000 events, ~5,000 sources
- New: ~100-500 domains tracked, ~10-50 claims per article
- Settings: <1KB per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is not yet configured (template placeholders only). Proceeding with standard best practices matching Feature 001:

| Principle | Status | Notes |
|-----------|--------|-------|
| Modular Architecture | PASS | Extends existing backend/frontend/extension structure |
| Test Coverage | PASS | Unit, integration, E2E tests planned for all new features |
| Simple Start | PASS | 7 independent user stories (P1-P7) allow incremental delivery |
| Documentation | PASS | Spec, plan, data model, contracts, research |
| Graceful Degradation | PASS | AI features fail gracefully, manual fallback always available |
| Privacy | PASS | API keys stored locally, article content sent to OpenRouter (user-controlled) |

No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/002-ai-features/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (OpenRouter integration patterns, article parsing, dark mode approaches)
├── data-model.md        # Phase 1 output (Domain, Claim entities; Source/Event/CounterNarrative modifications)
├── quickstart.md        # Phase 1 output (AI setup guide, testing with different models)
├── contracts/           # Phase 1 output (OpenAPI extensions)
│   ├── ai-api.yaml      # New AI endpoints (tag suggestions, claim extraction)
│   ├── domain-api.yaml  # Domain intelligence endpoints
│   └── settings.yaml    # Settings management (optional: may be frontend-only)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── domain.ts           # NEW: Domain intelligence entity
│   │   ├── claim.ts            # NEW: Extracted claim entity
│   │   ├── source.ts           # MODIFIED: Add counterNarrativeId field
│   │   ├── event.ts            # MODIFIED: Add concernLevel field
│   │   └── counterNarrative.ts # MODIFIED: Remove concernLevel field
│   ├── services/
│   │   ├── ai.ts               # NEW: OpenRouter API client
│   │   ├── tagSuggestion.ts    # NEW: AI tag suggestion logic
│   │   ├── claimExtraction.ts  # NEW: Article fetching + AI claim analysis
│   │   ├── domain.ts           # NEW: Domain intelligence aggregation
│   │   ├── articleParser.ts    # NEW: Article content extraction (Readability wrapper)
│   │   └── migration.ts        # NEW: Concern level migration script
│   ├── api/
│   │   ├── ai.ts               # NEW: /api/ai/suggest-tags, /api/ai/extract-claims
│   │   └── domain.ts           # NEW: /api/domains (stats, pre-fill suggestions)
│   └── lib/
│       └── urlParser.ts        # NEW: Domain normalization utilities
├── prisma/
│   └── schema.prisma           # MODIFIED: Add Domain, Claim models; modify Source, Event, CounterNarrative
└── tests/
    ├── unit/
    │   ├── domain.test.ts      # Domain normalization, stats calculation
    │   ├── tagSuggestion.test.ts
    │   └── claimExtraction.test.ts
    └── integration/
        ├── ai-api.test.ts      # End-to-end AI workflows
        └── migration.test.ts   # Concern level migration

frontend/
├── src/
│   ├── components/
│   │   ├── settings/
│   │   │   ├── SettingsPanel.tsx      # NEW: Settings modal/panel
│   │   │   ├── AISettings.tsx         # NEW: API key + model selection
│   │   │   └── ThemeToggle.tsx        # NEW: Dark mode toggle
│   │   ├── ai/
│   │   │   ├── TagSuggestions.tsx     # NEW: Tag suggestion UI + one-click add
│   │   │   └── ClaimExtractor.tsx     # NEW: Claim extraction UI + selective save
│   │   ├── sources/
│   │   │   └── SourceForm.tsx         # MODIFIED: Add domain context display
│   │   └── counterNarrative/
│   │       └── CounterNarrativeForm.tsx # MODIFIED: Add source management section
│   ├── pages/
│   │   ├── Events.tsx          # MODIFIED: Add settings access button
│   │   └── EventDetail.tsx     # MODIFIED: Add AI actions, counter-narrative sources section
│   ├── services/
│   │   ├── aiService.ts        # NEW: API client for AI endpoints
│   │   └── domainService.ts    # NEW: API client for domain endpoints
│   ├── hooks/
│   │   ├── useSettings.ts      # NEW: Settings persistence in localStorage
│   │   ├── useTheme.ts         # NEW: Dark mode state + CSS variable management
│   │   ├── useTagSuggestions.ts # NEW: AI tag suggestion with loading state
│   │   └── useClaimExtraction.ts # NEW: AI claim extraction with cancel
│   └── lib/
│       └── storage.ts          # NEW: LocalStorage abstraction for settings
├── styles/
│   ├── themes.css              # NEW: Dark mode CSS variables
│   └── globals.css             # MODIFIED: Add theme-aware color tokens
└── tests/
    ├── unit/
    │   ├── useSettings.test.ts
    │   └── useTheme.test.ts
    └── e2e/
        ├── ai-features.spec.ts # AI workflows end-to-end
        └── dark-mode.spec.ts   # Theme persistence and contrast

extension/
├── src/
│   ├── popup/
│   │   └── Popup.tsx           # MODIFIED: Add settings link (optional)
│   └── lib/
│       └── syncSettings.ts     # NEW: Sync settings from frontend to extension context
└── tests/
    └── settings-sync.test.ts   # NEW: Settings availability in extension
```

**Structure Decision**: Extends existing web application (backend + frontend + extension). Backend adds AI orchestration services and domain intelligence. Frontend adds settings infrastructure, dark mode theming, and AI-powered UI components. PostgreSQL schema extended with Domain and Claim entities. Browser LocalStorage used for client-side settings persistence (no backend storage needed for user preferences).

## Complexity Tracking

> No constitution violations to justify.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Third-party AI service | OpenRouter API | Required by spec for AI features; user provides API key |
| Browser LocalStorage | Settings persistence | Simplest solution for client-side preferences (no auth system) |
| Domain intelligence aggregation | Real-time stats on write | Better UX than batch processing; manageable with <500 domains |
| Concern level migration | One-time script | Data model improvement requires migration; backward compatibility maintained |

---

## Phase 0: Research

### Research Tasks

1. **OpenRouter Integration Patterns**
   - Research: OpenRouter API authentication, request/response formats
   - Research: Best practices for AI prompt engineering (tag suggestions, claim categorization)
   - Research: Error handling for AI API failures, rate limits, timeouts
   - Research: Model selection and cost optimization (free vs paid tiers)

2. **Article Content Extraction**
   - Research: Readability library vs alternatives (Mozilla Readability, newspaper3k equivalent for Node)
   - Research: Handling paywalls, CORS issues, JavaScript-rendered content
   - Research: Content summarization strategies for large articles (chunking, truncation)

3. **Dark Mode Implementation**
   - Research: CSS variable-based theming vs class-based approach
   - Research: WCAG AA contrast ratio requirements and testing tools
   - Research: Tailwind dark mode utilities and best practices
   - Research: Handling custom tag colors in dark mode

4. **LocalStorage Best Practices**
   - Research: LocalStorage size limits and quota management
   - Research: Sensitive data storage (API key encryption or obfuscation)
   - Research: Settings synchronization patterns across tabs

5. **Domain Intelligence Architecture**
   - Research: URL parsing libraries and domain normalization techniques
   - Research: Subdomain handling strategies (separate vs merged tracking)
   - Research: Real-time aggregation performance with PostgreSQL

**Output**: Consolidated findings in `research.md` with decisions, rationale, and alternatives.

---

## Phase 1: Design & Contracts

### Data Model Design (`data-model.md`)

**New Entities:**
- **Domain**: Normalized domain tracking with aggregated statistics
  - Fields: id, normalizedDomain, totalSources, avgBiasRating, usageFrequency, firstSeen, lastUsed
  - Relationships: One-to-many with Source (computed, not explicit FK)
  - Validation: Normalized domain must be valid hostname without protocol/www

- **Claim**: Extracted verifiable statement from articles
  - Fields: id, sourceId, claimText, category (enum: FACTUAL_ASSERTION | OPINION_ANALYSIS | SPECULATION), confidenceScore, extractedAt
  - Relationships: Many-to-one with Source
  - Validation: Confidence score 0-1, claim text max 1000 chars

**Modified Entities:**
- **Source**: Add optional counter-narrative association
  - New field: counterNarrativeId (nullable, exclusive with eventId)
  - Validation: Exactly one of eventId or counterNarrativeId must be set (XOR constraint)

- **Event**: Absorb concern level from CounterNarrative
  - New field: concernLevel (enum: weak | moderate | strong, nullable)
  - Migration: Copy concernLevel from associated CounterNarrative if exists

- **CounterNarrative**: Remove concern level field
  - Removed field: concernLevel
  - Migration: Move to Event entity before removing

### API Contracts (`contracts/`)

**New Endpoints (OpenAPI specs):**

1. **AI Tag Suggestions** (`POST /api/ai/suggest-tags`)
   - Request: `{ title: string, description: string, existingTags: string[] }`
   - Response: `{ suggestions: Array<{ tagName: string, confidence: number, isExisting: boolean }> }`
   - Errors: 400 (missing fields), 401 (invalid API key), 429 (rate limit), 503 (AI service unavailable)

2. **AI Claim Extraction** (`POST /api/ai/extract-claims`)
   - Request: `{ url: string, domainContext?: { avgBias: number, sourceCount: number } }`
   - Response: `{ claims: Array<{ text: string, category: ClaimCategory, confidence: number }>, articleTitle?: string }`
   - Errors: 400 (invalid URL), 403 (paywall detected), 408 (timeout), 500 (parsing failed), 503 (AI unavailable)

3. **Domain Intelligence** (`GET /api/domains/:normalizedDomain/stats`)
   - Response: `{ normalizedDomain: string, totalSources: number, avgBiasRating: number, usageFrequency: number, firstSeen: Date, lastUsed: Date }`
   - Errors: 404 (domain not found)

4. **Domain Pre-fill Suggestion** (`GET /api/domains/suggest-bias?url=...`)
   - Response: `{ suggestedBias: number, confidence: number, domainStats: DomainStats | null }`
   - Errors: 400 (invalid URL)

**Modified Endpoints:**
- `POST /api/sources`: Add optional `counterNarrativeId` field (mutually exclusive with `eventId`)
- `GET /api/events/:id`: Include `concernLevel` in Event response; include counter-narrative sources separately from event sources
- `POST /api/counter-narratives`: Remove `concernLevel` from request body

### Quickstart Guide (`quickstart.md`)

- How to obtain OpenRouter API key
- Configuring AI settings in the application
- Testing tag suggestions with sample events
- Testing claim extraction with publicly accessible articles
- Verifying dark mode across all pages
- Understanding domain intelligence pre-fills
- Running database migration for concern level move

---

## Phase 1: Agent Context Update

After generating all Phase 1 artifacts, run:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update the appropriate agent-specific context file with new technologies:
- OpenRouter API integration
- Dark mode CSS variables
- Browser LocalStorage patterns
- Domain intelligence aggregation

---

## Next Steps

After Phase 1 completion, the `/speckit.tasks` command will generate `tasks.md` with:
- Sequenced implementation tasks for all 7 user stories (P1-P7)
- Database migration tasks
- Testing requirements for each feature
- Deployment checklist

**Dependencies for /speckit.tasks:**
- ✅ spec.md (complete)
- ✅ plan.md (this file)
- 🔄 research.md (Phase 0 output - in progress)
- 🔄 data-model.md (Phase 1 output - in progress)
- 🔄 contracts/ (Phase 1 output - in progress)
- 🔄 quickstart.md (Phase 1 output - in progress)
