# Feature Specification: AI-Enhanced Accountability Tracking

**Feature Branch**: `002-ai-features`
**Created**: 2025-11-25
**Status**: Draft
**Input**: User description: "Feature 002: AI Features Sprint - AI-powered tag suggestions, claim extraction, settings infrastructure with OpenRouter integration, dark mode, counter-narrative sources parity, and domain intelligence tracking"

## Overview

This feature enhances the accountability tracker with artificial intelligence capabilities to accelerate data entry, improve analysis quality, and provide intelligent assistance. It adds a foundation layer (settings infrastructure, theme support) and seven progressive AI-enhanced workflows that reduce manual effort while maintaining user control and critical thinking.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure AI Settings (Priority: P1)

As a user beginning to use AI features, I want to configure my AI preferences once so that the system can provide intelligent assistance throughout my workflow.

**Why this priority**: Foundation for all AI functionality. Without configuration, no AI features can operate. This must work first before any other AI capabilities are useful.

**Independent Test**: Can be fully tested by opening settings, entering an API key, selecting a model tier, saving preferences, closing the browser, and reopening to verify settings persist.

**Acceptance Scenarios**:

1. **Given** I am using the application, **When** I access the settings panel, **Then** I see fields for API key entry and model selection with clear labels explaining free vs paid tiers.
2. **Given** I have entered a valid API key, **When** I save my settings, **Then** the key is stored securely and the system confirms successful configuration.
3. **Given** I have configured AI settings, **When** I close and reopen my browser, **Then** my settings persist and I don't need to re-enter them.
4. **Given** I select the free model tier, **When** I use AI features, **Then** all AI operations use the free model (z-ai/glm-4.5-air:free).
5. **Given** I select the paid model tier, **When** I use AI features, **Then** all AI operations use the paid model (x-ai/grok-code-fast-1).

---

### User Story 2 - Toggle Dark Mode (Priority: P2)

As a user working in different lighting conditions, I want to switch between light and dark themes so that I can use the application comfortably without eye strain.

**Why this priority**: User experience enhancement that's independent of AI features. Improves accessibility and comfort for all users regardless of whether they use AI capabilities.

**Independent Test**: Can be tested by toggling the theme switch in settings and verifying all pages update immediately with proper contrast ratios and color consistency.

**Acceptance Scenarios**:

1. **Given** I am in light mode, **When** I toggle dark mode in settings, **Then** all pages immediately switch to dark theme with appropriate colors.
2. **Given** I am in dark mode, **When** I navigate between different pages, **Then** all pages maintain consistent dark theme styling.
3. **Given** I have selected dark mode, **When** I close and reopen my browser, **Then** dark mode remains active.
4. **Given** I am viewing any page in dark mode, **When** I check text contrast, **Then** all text meets WCAG AA contrast ratio standards for readability.

---

### User Story 3 - Manage AI Model Selection (Priority: P3)

As a user with budget considerations, I want to choose between free and paid AI models so that I can balance cost with performance based on my needs.

**Why this priority**: Provides user control over AI costs. Must come after settings infrastructure (P1) but before users actively use AI features.

**Independent Test**: Can be tested by switching between model options in settings and verifying the selection applies to subsequent AI operations.

**Acceptance Scenarios**:

1. **Given** I am in settings, **When** I view model options, **Then** I see a dropdown with clearly labeled free and paid tiers showing which model each uses.
2. **Given** I select a different model, **When** I save settings, **Then** all future AI operations use the newly selected model.
3. **Given** I am using the free tier model, **When** I trigger an AI operation, **Then** I can see confirmation that the free model is being used.

---

### User Story 4 - Get AI Tag Suggestions (Priority: P4)

As a user creating an event, I want the system to suggest relevant tags based on the event content so that I can categorize events faster and more consistently.

**Why this priority**: First practical AI feature that delivers immediate time savings. Depends on settings configuration (P1) but provides clear, measurable value (30% faster tagging).

**Independent Test**: Can be tested by creating an event with title and description, clicking "Suggest Tags", and verifying 3-5 relevant tag suggestions appear with confidence scores and one-click addition.

**Acceptance Scenarios**:

1. **Given** I am creating an event with title "Secretary nominee lacks experience" and description about qualifications, **When** I click "Suggest Tags", **Then** the system shows 3-5 relevant tag suggestions like "corruption", "breaking-norms" within 5 seconds.
2. **Given** AI has suggested tags, **When** I view the suggestions, **Then** each tag shows a confidence score indicating how relevant the AI thinks it is.
3. **Given** AI suggests a tag that already exists in my system, **When** I click to add it, **Then** the existing tag is applied to the event (no duplicate created).
4. **Given** AI suggests a new tag name that doesn't exist, **When** I click to add it, **Then** the system creates the new tag and applies it to the event.
5. **Given** AI is processing tag suggestions, **When** results are returned, **Then** at least 70% of suggestions match tags I would have chosen manually.

---

### User Story 5 - Extract Claims from Articles (Priority: P5)

As a user adding sources to events, I want AI to extract and categorize verifiable claims from articles so that I can distinguish facts from opinions and build stronger accountability documentation.

**Why this priority**: Advanced AI feature requiring article fetching and parsing. More complex than tag suggestions but provides high value for critical analysis.

**Independent Test**: Can be tested by adding a source URL to an event, clicking "Extract Claims", and verifying the system fetches the article, categorizes claims as factual/opinion/speculation with confidence scores, and allows selective saving.

**Acceptance Scenarios**:

1. **Given** I have added a news article URL to an event, **When** I click "Extract Claims" next to the URL, **Then** the system fetches the article content and begins AI analysis.
2. **Given** AI is analyzing an article, **When** processing completes within 30 seconds, **Then** I see a list of extracted claims categorized as "Factual Assertion", "Opinion/Analysis", or "Speculation".
3. **Given** AI has extracted claims, **When** I review them, **Then** each claim shows a confidence score indicating how certain the categorization is.
4. **Given** I review extracted claims, **When** I select specific claims to keep, **Then** only my selected claims are saved to the event record.
5. **Given** AI is processing a long article, **When** I see the loading indicator, **Then** I have the option to cancel the operation if it's taking too long.
6. **Given** the article is behind a paywall, **When** AI attempts to fetch it, **Then** the system gracefully handles the error and informs me the article couldn't be accessed.
7. **Given** AI has categorized claims, **When** I review a statistically significant sample, **Then** at least 80% of claims are categorized correctly (factual vs opinion vs speculation).

---

### User Story 6 - Add Sources to Counter-Narratives (Priority: P6)

As a user documenting opposing viewpoints, I want to attach sources directly to counter-narratives with the same capabilities as event sources so that alternative perspectives are equally well-documented and credible.

**Why this priority**: Data model enhancement that creates parity between events and counter-narratives. Required for balanced documentation but depends on existing source infrastructure.

**Independent Test**: Can be tested by creating a counter-narrative, adding sources to it with URLs and bias ratings, extracting claims from counter-narrative sources, and verifying clear visual distinction from event sources.

**Acceptance Scenarios**:

1. **Given** I am viewing a counter-narrative section, **When** I click "Add Source", **Then** I see a form identical to event source forms with URL, title, and bias rating fields.
2. **Given** I have added a source to a counter-narrative, **When** I view the event detail page, **Then** counter-narrative sources are visually distinct from event sources (different section, styling, or label).
3. **Given** I have a source attached to a counter-narrative, **When** I click "Extract Claims", **Then** AI analyzes the counter-narrative source just like event sources.
4. **Given** I want to use the same article URL for both an event and its counter-narrative, **When** I add it to both, **Then** the system allows this (same URL can represent different perspectives).
5. **Given** I am adding a source to a counter-narrative, **When** I complete the process, **Then** the entire workflow takes under 2 minutes.
6. **Given** a counter-narrative source exists in the database, **When** I query the data model, **Then** the source is clearly associated with the counter-narrative, not the event.

---

### User Story 7 - Leverage Domain Intelligence (Priority: P7)

As a user repeatedly citing sources from the same news outlets, I want the system to learn from my historical source data so that bias ratings are pre-filled and AI analysis improves over time.

**Why this priority**: Intelligence layer that enhances all source-related workflows. Requires historical data to be valuable, so it's most beneficial after users have entered multiple sources.

**Independent Test**: Can be tested by adding 5+ sources from the same domain with bias ratings, then adding a new source from that domain and verifying the bias rating is pre-filled based on the average.

**Acceptance Scenarios**:

1. **Given** I add a source URL like "https://www.nytimes.com/article-path", **When** the system processes it, **Then** it extracts and normalizes the domain to "nytimes.com" (removing www and protocol).
2. **Given** I have previously added 10 sources from "nytimes.com" with an average bias rating of -1.2, **When** I add a new source from "nytimes.com", **Then** the bias rating field is pre-filled with -1.2.
3. **Given** I am adding a source, **When** I view the form, **Then** I see contextual information like "NYTimes: 15 sources, avg bias: -1.2" to inform my rating decision.
4. **Given** the system has domain intelligence data, **When** AI performs claim extraction, **Then** it uses historical bias patterns to improve categorization accuracy by at least 15%.
5. **Given** I have added sources from a known domain, **When** I add a new source from that domain, **Then** the workflow is 40% faster due to pre-filled data.
6. **Given** I view domain statistics, **When** I check aggregate data like total source count or average bias, **Then** the statistics are accurate within 5%.

---

### Edge Cases

- What happens when a user enters an invalid API key? System validates the key on first AI operation and provides clear error message with instructions to check settings.
- How does the system handle API rate limits or service unavailability? System shows user-friendly error message and suggests trying again later or using a different model.
- What if AI suggests tags that don't make sense for the event? User is always in control - they can ignore suggestions and manually enter their own tags.
- What happens when an article URL is paywalled or blocked? System gracefully handles fetch failures and informs user the article couldn't be accessed, allowing manual claim entry.
- How does the system handle very long articles that exceed AI context limits? System extracts key sections or summarizes content before sending to AI, or breaks into chunks if necessary.
- What if two users with different settings profiles use the same browser? Settings are stored per-browser session, so each user profile should have separate settings if using different browser profiles.
- What happens when a domain has only 1 source (insufficient data for average)? System uses that single source's bias rating or doesn't pre-fill if confidence is too low.
- How does the system handle subdomains (blog.nytimes.com vs nytimes.com)? System normalizes to root domain by default but tracks subdomains separately if patterns differ significantly.
- What if the same URL exists for both event and counter-narrative? This is allowed - the same article can be used to support both the event claim and the counter-narrative perspective.
- How does dark mode handle custom colors for tags? System adjusts tag colors to maintain contrast ratios in dark mode while preserving color identity.
- What happens during concern level migration if counter-narratives have different ratings? Migration script moves concernLevel from counter-narrative to event, using a default or average if multiple counter-narratives exist (edge case).
- How does the system handle network timeouts during article fetching? System implements reasonable timeout (10-15 seconds) and gracefully fails with clear error message.
- What if AI returns zero tag suggestions? System informs user that no confident suggestions were found and prompts manual tagging.
- How does the system handle claims that don't fit neatly into factual/opinion/speculation? AI uses confidence scores - low confidence claims prompt user review before categorization.
- What happens when the OpenRouter API changes model names? System should handle gracefully with fallback to default model and alert user to update settings.

## Requirements *(mandatory)*

### Functional Requirements

#### Settings Infrastructure
- **FR-001**: System MUST provide a settings panel accessible from all pages of the application
- **FR-002**: System MUST allow users to enter and store an OpenRouter API key securely
- **FR-003**: System MUST allow users to select between at least two AI model tiers: free (z-ai/glm-4.5-air:free) and paid (x-ai/grok-code-fast-1)
- **FR-004**: System MUST persist all user settings across browser sessions using browser storage
- **FR-005**: System MUST validate API keys on first use and provide clear feedback for invalid keys
- **FR-006**: System MUST allow users to update or change settings at any time

#### Theme Management
- **FR-007**: System MUST provide a dark mode toggle in the settings panel
- **FR-008**: System MUST apply theme selection across all pages and components immediately when toggled
- **FR-009**: System MUST maintain WCAG AA contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text) in both light and dark modes
- **FR-010**: System MUST persist theme preference across browser sessions
- **FR-011**: System MUST provide consistent visual styling in dark mode including backgrounds, text, borders, and interactive elements

#### AI Model Management
- **FR-012**: System MUST display clear labels for each model option showing cost tier (free/paid) and model identifier
- **FR-013**: System MUST apply the selected model to all AI operations (tag suggestions, claim extraction)
- **FR-014**: System MUST allow users to switch between models at any time without losing other settings
- **FR-015**: System MUST provide feedback about which model is being used during AI operations

#### AI Tag Suggestions
- **FR-016**: System MUST provide a "Suggest Tags" action in event creation and editing forms
- **FR-017**: System MUST send event title and description to the AI service for analysis when tag suggestions are requested
- **FR-018**: System MUST display 3-5 tag suggestions with confidence scores within 5 seconds of request
- **FR-019**: System MUST allow users to add suggested tags with a single click
- **FR-020**: System MUST match AI suggestions against existing tags in the database and apply existing tags when names match
- **FR-021**: System MUST allow creation of new tags when AI suggests tag names that don't exist in the database
- **FR-022**: System MUST handle AI service failures gracefully with clear error messages and fallback to manual tagging
- **FR-023**: System MUST include loading indicators during tag suggestion processing
- **FR-024**: System MUST allow users to cancel in-progress tag suggestion requests

#### AI Claim Extraction
- **FR-025**: System MUST provide an "Extract Claims" action next to each source URL in event and counter-narrative forms
- **FR-026**: System MUST fetch article content from the provided URL when claim extraction is requested
- **FR-027**: System MUST send article content to AI service for claim analysis
- **FR-028**: System MUST categorize each extracted claim as one of: Factual Assertion, Opinion/Analysis, or Speculation
- **FR-029**: System MUST display confidence scores for each claim and its categorization
- **FR-030**: System MUST allow users to selectively choose which extracted claims to save
- **FR-031**: System MUST complete claim extraction within 30 seconds for articles up to 5000 words
- **FR-032**: System MUST provide a loading indicator with cancel option during claim extraction
- **FR-033**: System MUST handle paywalled articles gracefully by detecting access restrictions and informing the user
- **FR-034**: System MUST handle CORS issues and network failures with appropriate error messages
- **FR-035**: System MUST handle article parsing failures by attempting multiple extraction methods or informing user of inability to parse

#### Counter-Narrative Sources
- **FR-036**: System MUST allow adding sources directly to counter-narratives in addition to events
- **FR-037**: System MUST associate each source with either an event OR a counter-narrative, but not both simultaneously
- **FR-038**: System MUST provide identical source fields for counter-narrative sources: URL, article title, bias rating, archive status
- **FR-039**: System MUST support AI claim extraction for counter-narrative sources with same functionality as event sources
- **FR-040**: System MUST visually distinguish counter-narrative sources from event sources in the user interface
- **FR-041**: System MUST allow the same URL to exist as both an event source and counter-narrative source (different source records)
- **FR-042**: System MUST migrate existing concern level field from counter-narrative entity to event entity
- **FR-043**: System MUST provide a data migration script that preserves existing concern level data during the migration
- **FR-044**: System MUST complete counter-narrative source entry workflow in under 2 minutes

#### Domain Intelligence
- **FR-045**: System MUST automatically extract domain name from every source URL added to the system
- **FR-046**: System MUST normalize domain names by removing www prefix, protocols, and standardizing format
- **FR-047**: System MUST create and maintain domain profiles tracking: total source count, average bias rating, usage frequency, first seen date, last used date
- **FR-048**: System MUST update domain statistics in real-time as new sources are added
- **FR-049**: System MUST pre-fill bias rating field based on domain's historical average when adding sources from known domains
- **FR-050**: System MUST display domain context in source forms showing aggregate statistics (e.g., "NYTimes: 15 sources, avg bias: -1.2")
- **FR-051**: System MUST provide domain intelligence data to AI service to enhance claim categorization accuracy
- **FR-052**: System MUST handle subdomains by normalizing to root domain unless subdomain patterns differ significantly
- **FR-053**: System MUST maintain accurate domain statistics within 5% margin of error
- **FR-054**: System MUST handle domain name changes and redirects by updating domain associations appropriately

### Key Entities

- **Settings**: User preferences for AI configuration and application behavior. Contains API key (securely stored), selected model tier (free/paid), model identifier, theme preference (light/dark), persistence timestamp. Stored per-browser session.

- **AIModel**: Reference data defining available AI models. Contains model identifier, display name, cost tier (free/paid), provider (OpenRouter), capabilities flags. Used to populate model selection dropdown.

- **TagSuggestion**: Temporary data structure for AI-suggested tags. Contains suggested tag name, confidence score (0-1), match status (existing/new). Not persisted after user decision.

- **Claim**: Extracted verifiable statement from a source article. Contains claim text, category (Factual Assertion/Opinion/Speculation), confidence score, source association (event source or counter-narrative source), extraction timestamp. Associated with either event or counter-narrative through source relationship.

- **Domain**: Aggregated intelligence about news source domains. Contains normalized domain name, total source count, average bias rating, usage frequency, first seen date, last used date. Automatically created and updated when sources are added.

- **Source** (Enhanced): Existing entity now supports association with counter-narratives in addition to events. Modified to include optional counter-narrative reference in addition to event reference (mutually exclusive - one or the other, not both).

- **Event** (Enhanced): Existing entity now includes concern level field (migrated from counter-narrative). Contains new concernLevel field with strength rating.

- **CounterNarrative** (Modified): Concern level field removed and migrated to Event entity. Maintains relationship with sources.

## Assumptions

- Users will obtain their own OpenRouter API keys from the OpenRouter service
- Browser local storage is available and reliable for settings persistence
- Users have stable internet connection for AI operations (graceful degradation for offline use)
- OpenRouter API endpoints and model names remain stable or changes are communicated in advance
- Article content is accessible via standard HTTP requests for most news sources
- Users understand that AI suggestions are assistance tools, not authoritative decisions
- Free AI model tier provides sufficient quality for basic tag suggestions and claim extraction
- Users are comfortable with article content being sent to third-party AI service (OpenRouter)
- Domain normalization rules (removing www, using root domain) work for 95%+ of news sources
- Migration from counter-narrative concern level to event concern level is a one-time operation
- The existing publication bias rating system uses a numeric scale (e.g., -3 to +3)
- Users will manually review AI-extracted claims before relying on them for accountability purposes
- Dark mode color adjustments maintain brand consistency while meeting accessibility standards
- Settings stored in browser storage are not synchronized across devices (single-device preference)

## Success Criteria *(mandatory)*

### Measurable Outcomes

#### Performance Metrics
- **SC-001**: Users can complete AI settings configuration in under 2 minutes including API key entry and model selection
- **SC-002**: Theme toggle applies across entire application in under 1 second with no visual flash or flicker
- **SC-003**: AI tag suggestions return results in under 5 seconds for events with up to 500 words of description
- **SC-004**: AI claim extraction completes in under 30 seconds for articles up to 5000 words
- **SC-005**: Counter-narrative source entry completes in under 2 minutes matching event source entry time

#### Accuracy Metrics
- **SC-006**: AI tag suggestions match user-selected tags with at least 70% accuracy across a sample of 100 events
- **SC-007**: AI claim categorization (factual/opinion/speculation) achieves at least 80% correct classification as verified by manual review
- **SC-008**: Domain intelligence statistics (source count, average bias) are accurate within 5% margin of error
- **SC-009**: Domain intelligence improves AI claim categorization accuracy by at least 15% compared to baseline without domain context

#### Efficiency Metrics
- **SC-010**: Users complete event tagging 30% faster when using AI tag suggestions compared to fully manual tagging
- **SC-011**: Users save at least 40% of AI-suggested claims on average, indicating high relevance
- **SC-012**: Source entry for known domains is 40% faster due to pre-filled bias ratings from domain intelligence

#### User Experience Metrics
- **SC-013**: Dark mode maintains WCAG AA contrast ratios (minimum 4.5:1) verified across all components
- **SC-014**: Users successfully configure AI settings on first attempt without requiring support in 95% of cases
- **SC-015**: System handles article fetch failures (paywalls, CORS, timeouts) gracefully without crashing in 100% of failure scenarios

#### Adoption Metrics
- **SC-016**: At least 60% of users who configure AI settings actively use tag suggestions within their first 10 events
- **SC-017**: At least 40% of users who add sources attempt claim extraction at least once
- **SC-018**: Dark mode is enabled by at least 30% of users indicating successful accessibility enhancement
