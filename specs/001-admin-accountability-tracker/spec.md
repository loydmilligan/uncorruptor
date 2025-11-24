# Feature Specification: Administration Accountability Tracker

**Feature Branch**: `001-admin-accountability-tracker`
**Created**: 2025-11-24
**Status**: Draft
**Input**: User description: "Web app to track, organize, and visualize political accountability events with multi-category tagging, rated sources, counter-narratives, self-challenge testing, Chrome extension, and comparative dashboard for Trump administrations."

## Overview

A personal knowledge base web application designed to combat information overload and "flood the zone" tactics by systematically tracking, categorizing, and analyzing political events. The system enables critical thinking by capturing multiple perspectives, testing assumptions, and providing visual tools for pattern recognition across administrations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Categorize an Event (Priority: P1)

As a user tracking political accountability, I want to quickly record a new event with relevant categories so I can build a comprehensive, organized record that I won't forget.

**Why this priority**: The core value proposition - without the ability to create and categorize events, the entire system has no purpose. This is the foundational capability that all other features depend upon.

**Independent Test**: Can be fully tested by creating a new event with title, description, date, and multiple tags, then verifying it appears in the event list and is searchable/filterable.

**Acceptance Scenarios**:

1. **Given** I am on the main application, **When** I create a new event with title "Cabinet nominee lacks qualifications", description, date, and tags ["corruption", "breaking-norms"], **Then** the event is saved and appears in my event list with all tags visible.
2. **Given** an event exists, **When** I add additional tags like "divergent-from-historical-gop", **Then** the event shows all associated tags and appears when filtering by any of them.
3. **Given** I am creating an event, **When** I select a date that occurred during either the first or second Trump administration, **Then** the system automatically associates it with the correct administration period.

---

### User Story 2 - Add and Rate Sources (Priority: P1)

As a user evaluating information credibility, I want to attach multiple sources to each event with bias ratings so I can assess the reliability of my information and demonstrate factual grounding.

**Why this priority**: Sources with bias ratings are essential for credibility and critical thinking. Without sources, events are merely opinions rather than documented facts.

**Independent Test**: Can be tested by adding 3 sources to an event with different bias ratings, then viewing the event to confirm all sources display with their ratings.

**Acceptance Scenarios**:

1. **Given** an event exists, **When** I add a source URL with publication name and select a bias rating (e.g., "left-leaning", "center", "right-leaning"), **Then** the source appears linked to the event with its bias clearly indicated.
2. **Given** an event has multiple sources, **When** I view the event details, **Then** I see all sources sorted by bias rating with visual indicators.
3. **Given** I am adding a source, **When** I provide just a URL, **Then** the system attempts to extract the publication name and suggests a bias rating based on known source directories.

---

### User Story 3 - Capture Counter-Narratives and Test Assumptions (Priority: P2)

As a critical thinker, I want to record the administration's official position and counter-arguments for each event so I can test my own assumptions and understand opposing viewpoints.

**Why this priority**: This differentiates the tool from a simple complaint list - it encourages intellectual honesty and stronger arguments by engaging with opposing views.

**Independent Test**: Can be tested by adding an event, then adding the administration's stated justification and a personal assessment of both sides.

**Acceptance Scenarios**:

1. **Given** an event exists, **When** I add a counter-narrative with the administration's stated position, **Then** the counter-narrative is saved and displayed alongside the main event description.
2. **Given** an event has a counter-narrative, **When** I add my assessment rating (e.g., "administration position: weak/moderate/strong", "my concern: weak/moderate/strong"), **Then** both ratings are captured for later analysis.
3. **Given** I am reviewing an event, **When** I view it in "critical analysis mode", **Then** I see side-by-side comparison of the concern, the counter-narrative, and my assessment.

---

### User Story 4 - Browse and Filter Events (Priority: P2)

As a user reviewing my knowledge base, I want to browse, search, and filter events by various criteria so I can quickly find relevant information during conversations or research.

**Why this priority**: Discovery and retrieval make the tracked data useful. Without filtering, the database becomes unwieldy as it grows.

**Independent Test**: Can be tested by creating 10 events with varied tags and dates, then successfully filtering to find specific subsets.

**Acceptance Scenarios**:

1. **Given** I have 50+ events in the system, **When** I filter by tag "corruption", **Then** only events with that tag appear.
2. **Given** events span both administrations, **When** I filter by "Trump Admin 1" (2017-2021), **Then** only events from that period appear.
3. **Given** I am searching, **When** I enter free-text search "Ukraine", **Then** events containing that term in title, description, or sources appear.
4. **Given** I want complex filtering, **When** I combine tag filter + date range + text search, **Then** results satisfy all criteria.

---

### User Story 5 - Chrome Extension Quick Capture (Priority: P3)

As a user browsing news, I want to quickly capture an article as a new event or add it as a source to an existing event without leaving my browser.

**Why this priority**: Reduces friction for data entry, making it more likely I'll actually maintain the database. However, the core app must work first.

**Independent Test**: Can be tested by installing the extension, navigating to a news article, and using the extension to create a new event pre-populated with article data.

**Acceptance Scenarios**:

1. **Given** I am reading a news article, **When** I click the extension icon and select "New Event", **Then** a form appears pre-populated with the page title, URL, and publication.
2. **Given** I am reading an article relevant to an existing event, **When** I click the extension icon and select "Add Source", **Then** I can search for the event and add the current page as a source.
3. **Given** I use the extension, **When** I submit an event or source, **Then** it syncs to my main web application within 5 seconds.

---

### User Story 6 - Dashboard Visualization (Priority: P3)

As a user wanting to understand patterns, I want a dashboard with visualizations showing event distribution, category trends, and administration comparisons.

**Why this priority**: Visualization provides insight but requires substantial data first. This is valuable for analysis but not essential for initial data collection.

**Independent Test**: Can be tested by having 20+ events entered, then viewing dashboard to confirm charts render with accurate data.

**Acceptance Scenarios**:

1. **Given** I have events across multiple categories, **When** I view the dashboard, **Then** I see a breakdown of events by tag (bar chart or similar).
2. **Given** I have events from both administrations, **When** I view the comparison view, **Then** I see side-by-side metrics (event count by category) for each administration.
3. **Given** I view the timeline, **When** events are displayed chronologically, **Then** I can see density/frequency patterns over time.
4. **Given** I interact with a chart element, **When** I click on a category bar, **Then** I am taken to a filtered list of those events.

---

### Edge Cases

- What happens when a user tries to create an event without a title? System requires title as mandatory field.
- How does the system handle duplicate event entries? System warns user of potential duplicates based on similar titles/dates but allows creation.
- What happens when a source URL is no longer accessible? System preserves the original source data and marks it as "archived/unavailable" if link checking fails.
- How does the system handle events that span both administrations or the transition period? User can tag with both administration periods or mark as "transition".
- What happens when the Chrome extension is used while offline? Extension queues the submission and syncs when connection restored.

## Requirements *(mandatory)*

### Functional Requirements

#### Event Management
- **FR-001**: System MUST allow users to create events with title (required), description, and date
- **FR-002**: System MUST support assigning multiple tags/categories to each event
- **FR-003**: System MUST provide a default set of category tags: dishonesty, divergent-from-historical-gop, breaking-norms, corruption, constitutional-concerns, policy-harm, self-dealing, nepotism
- **FR-004**: System MUST allow users to create custom tags beyond the defaults
- **FR-005**: System MUST automatically associate events with an administration period based on event date (Trump Admin 1: Jan 2017 - Jan 2021, Trump Admin 2: Jan 2025 - present)
- **FR-006**: System MUST allow users to edit and delete their events

#### Source Management
- **FR-007**: System MUST allow attaching multiple sources to each event
- **FR-008**: System MUST capture source URL, publication name, and article title for each source
- **FR-009**: System MUST allow users to rate each source's political bias on a scale (e.g., far-left, left, center-left, center, center-right, right, far-right)
- **FR-010**: System MUST suggest bias ratings for known publications from a maintained directory of 50+ common news sources (user can override suggested rating)
- **FR-011**: System MUST display source credibility/bias visually when viewing events

#### Counter-Narratives & Critical Analysis
- **FR-012**: System MUST allow adding a counter-narrative field to each event capturing the administration's stated position or defense
- **FR-013**: System MUST allow users to rate the strength of both their concern and the counter-narrative (weak/moderate/strong)
- **FR-014**: System MUST provide a "critical analysis" view showing concern vs. counter-narrative side-by-side

#### Search & Discovery
- **FR-015**: System MUST support filtering events by one or more tags
- **FR-016**: System MUST support filtering events by administration period
- **FR-017**: System MUST support filtering events by date range
- **FR-018**: System MUST support free-text search across event title, description, and source content
- **FR-019**: System MUST support combining multiple filter criteria

#### Chrome Extension
- **FR-020**: Extension MUST allow creating a new event from the current webpage
- **FR-021**: Extension MUST pre-populate new events with page title, URL, and detected publication
- **FR-022**: Extension MUST allow adding current page as a source to an existing event
- **FR-023**: Extension MUST sync with the web application
- **FR-024**: Extension MUST queue submissions when offline and sync when connection restored

#### Dashboard & Visualization
- **FR-025**: System MUST display a dashboard with event count by category
- **FR-026**: System MUST display comparative metrics between Trump Admin 1 and Admin 2
- **FR-027**: System MUST display a timeline visualization showing event frequency over time
- **FR-028**: System MUST allow drilling down from visualizations to filtered event lists

### Key Entities

- **Event**: The core entity representing a political incident or action. Contains title, description, date, administration period, creation timestamp. Has many Tags, Sources, and one optional Counter-Narrative.

- **Tag/Category**: Classification labels for events. Contains name, description, color/icon. An event can have multiple tags; a tag can be applied to multiple events.

- **Source**: A reference to external documentation. Contains URL, publication name, article title, bias rating, date accessed. Belongs to one event; an event can have multiple sources.

- **Counter-Narrative**: The official or opposing position on an event. Contains narrative text, source references, user assessment ratings. Belongs to one event.

- **Publication**: Reference data for news sources. Contains name, default bias rating, credibility score. Used to suggest ratings when adding sources.

- **Administration Period**: Reference data defining date ranges. Contains name, start date, end date. Used to automatically categorize events.

## Clarifications

### Session 2025-11-24

- Q: Data persistence strategy? → A: Self-hosted server with PostgreSQL database
- Q: Authentication requirement? → A: No authentication (local network access only, not internet-exposed)

## Assumptions

- Data will be stored in a self-hosted PostgreSQL database on user's own infrastructure
- Application is accessed only on local network; no authentication required (network-level security)
- This is a single-user personal application; no multi-user or sharing features are needed
- User is comfortable with English-language interface
- Events are recorded retrospectively (user enters date event occurred, not discovery date)
- Bias ratings are subjective and reflect common media bias characterizations
- The application will be used primarily for personal reference and conversation preparation
- User has a Chrome browser for the extension feature
- Internet connection is available for primary use; offline support is limited to extension queuing

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a fully tagged event with sources in under 3 minutes
- **SC-002**: Users can find any specific event using search/filter in under 30 seconds when database contains 500+ events
- **SC-003**: Chrome extension captures page data and creates event with 2 clicks and under 30 seconds
- **SC-004**: Dashboard loads and displays all visualizations within 3 seconds
- **SC-005**: 100% of events are correctly auto-assigned to administration periods based on date
- **SC-006**: Users can recall and articulate specific events during conversations (qualitative: user self-reports improved recall)
- **SC-007**: System maintains usable performance with 1,000+ events and 5,000+ sources
- **SC-008**: User can complete critical analysis (event + counter-narrative + assessment) in under 5 minutes
