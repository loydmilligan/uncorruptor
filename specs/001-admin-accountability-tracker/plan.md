# Implementation Plan: Administration Accountability Tracker

**Branch**: `001-admin-accountability-tracker` | **Date**: 2025-11-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-admin-accountability-tracker/spec.md`

## Summary

A personal knowledge base web application for tracking political accountability events with multi-category tagging, bias-rated sources, counter-narratives for critical analysis, and comparative visualizations across Trump administrations. Self-hosted with PostgreSQL backend, local-only access (no auth), includes Chrome extension for quick capture.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend + backend)
**Primary Dependencies**:
- Backend: Node.js, Fastify, Prisma ORM
- Frontend: React 18, TailwindCSS, Recharts (visualization)
- Extension: Chrome Extension Manifest V3

**Storage**: PostgreSQL (self-hosted, user's infrastructure)
**Testing**: Vitest (unit/integration), Playwright (E2E)
**Target Platform**: Linux server (local network), Chrome browser
**Project Type**: Web application (frontend + backend + browser extension)
**Performance Goals**:
- Dashboard loads within 3 seconds
- Search returns results in <1 second with 500+ events
- Extension sync completes within 5 seconds

**Constraints**:
- Local network only, no internet exposure
- No authentication required
- Single-user application
- 1,000+ events, 5,000+ sources capacity

**Scale/Scope**: Single user, ~1,000 events, ~5,000 sources, 8 default tags + custom

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is not yet configured (template placeholders only). Proceeding with standard best practices:

| Principle | Status | Notes |
|-----------|--------|-------|
| Modular Architecture | PASS | Separate backend, frontend, extension |
| Test Coverage | PASS | Unit, integration, E2E tests planned |
| Simple Start | PASS | MVP-first approach, P1 features before P2/P3 |
| Documentation | PASS | Spec, plan, data model, contracts |

No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-accountability-tracker/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI)
│   └── api.yaml
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # Prisma schema, types
│   ├── services/        # Business logic
│   ├── api/             # Route handlers
│   └── lib/             # Utilities (date handling, search)
├── prisma/
│   └── schema.prisma    # Database schema
└── tests/
    ├── unit/
    └── integration/

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route pages (Events, Dashboard, etc.)
│   ├── services/        # API client
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities
└── tests/
    ├── unit/
    └── e2e/

extension/
├── src/
│   ├── popup/           # Extension popup UI
│   ├── background/      # Service worker
│   └── content/         # Content scripts (page data extraction)
├── manifest.json        # Chrome Manifest V3
└── tests/
```

**Structure Decision**: Web application with three projects - backend API, frontend SPA, and Chrome extension. Backend serves REST API to both frontend and extension. PostgreSQL for persistence via Prisma ORM.

## Complexity Tracking

> No constitution violations to justify.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| 3 projects | Backend + Frontend + Extension | Required by spec: web app + Chrome extension |
| PostgreSQL | User requirement | Confirmed in clarifications |
| No auth | User requirement | Local network only, confirmed in clarifications |
