# Quickstart Guide: AI-Enhanced Features

**Feature**: 002-ai-features
**Date**: 2025-11-25
**Purpose**: Step-by-step guide to configure and test AI features

---

## Prerequisites

Before starting, ensure you have:
- Accountability Tracker running (backend + frontend)
- PostgreSQL database with Feature 001 schema
- Modern web browser (Chrome recommended)
- Internet connection for AI API calls

---

## Step 1: Obtain OpenRouter API Key

### 1.1 Create OpenRouter Account

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Click "Sign Up" and create an account
3. Verify your email address

### 1.2 Generate API Key

1. Navigate to **Settings → API Keys**
2. Click "Create New Key"
3. Name it: `Accountability Tracker`
4. Copy the key (format: `sk-or-v1-...`)
5. **Important**: Store this key securely - it won't be shown again

### 1.3 Add Credits (Optional for Paid Model)

- Free model (`z-ai/glm-4.5-air:free`) requires no credits
- Paid model (`x-ai/grok-code-fast-1`) requires prepaid credits
- Navigate to **Billing → Add Credits** if using paid tier

---

## Step 2: Configure AI Settings in Application

### 2.1 Open Settings Panel

1. Launch the Accountability Tracker frontend: `http://localhost:5173`
2. Click the **Settings** icon (gear/cog) in the navigation bar
3. Navigate to **AI Settings** tab

### 2.2 Enter API Key

1. Paste your OpenRouter API key into the **API Key** field
2. The key is stored securely in browser LocalStorage
3. Key is never sent to the backend (only used for frontend-initiated AI calls)

### 2.3 Select AI Model

1. Choose between:
   - **Free Tier**: `z-ai/glm-4.5-air:free` (no cost, good quality)
   - **Paid Tier**: `x-ai/grok-code-fast-1` (faster, higher accuracy)
2. Start with free tier for testing
3. Click **Save Settings**

### 2.4 Verify Configuration

- Settings panel shows "✓ API Key Configured"
- Selected model is highlighted
- Settings persist across browser sessions

---

## Step 3: Test AI Tag Suggestions

### 3.1 Create Sample Event

1. Navigate to **Events → New Event**
2. Enter the following test data:
   - **Title**: `Cabinet nominee lacks qualifications`
   - **Description**: `Presidential nominee for Secretary of Education has no prior experience in education policy or administration`
   - **Date**: Any date
   - **Admin Period**: Auto-selected

### 3.2 Request Tag Suggestions

1. Click **Suggest Tags** button (below description field)
2. Wait 3-5 seconds for AI analysis
3. Observe loading indicator

### 3.3 Review Suggestions

Expected suggestions should include:
- `breaking-norms` (confidence ~0.85)
- `corruption` (confidence ~0.70)
- `policy-harm` (confidence ~0.65)

Each suggestion shows:
- Tag name
- Confidence score (0-1)
- Badge indicating if tag already exists in database

### 3.4 Add Suggested Tags

1. Click any suggestion to add it to the event
2. Existing tags are applied immediately
3. New tags are created and applied
4. Verify tags appear in the event's tag list

### 3.5 Validate Accuracy

- Check if at least 3 of 5 suggestions are relevant (70% target)
- Tags should match the event's content semantically
- If accuracy is low, try paid model for better results

---

## Step 4: Test AI Claim Extraction

### 4.1 Add Source to Event

1. In the same event, scroll to **Sources** section
2. Click **Add Source**
3. Enter a publicly accessible news article URL:
   - Example: `https://www.bbc.com/news/` (any recent article)
   - **Note**: Use non-paywalled articles for testing

### 4.2 Extract Claims

1. Click **Extract Claims** button next to the URL field
2. Backend fetches article content (3-5 seconds)
3. AI analyzes content (15-25 seconds)
4. Loading indicator shows progress with cancel option

### 4.3 Review Extracted Claims

Expected output:
- 5-15 claims categorized as:
  - **Factual Assertion**: Verifiable facts with numbers, dates, quotes
  - **Opinion/Analysis**: Subjective interpretations or judgments
  - **Speculation**: Hypothetical or predictive statements
- Each claim shows confidence score

Example claim:
```
Text: "The nominee has served in state government for 8 years"
Category: FACTUAL_ASSERTION
Confidence: 0.92
```

### 4.4 Select Claims to Save

1. Review all extracted claims
2. Check boxes next to relevant claims
3. Click **Save Selected Claims**
4. Claims are stored in database linked to source

### 4.5 Validate Categorization

- Verify at least 80% of claims are correctly categorized
- Factual assertions should have verifiable data
- Opinions should have subjective language ("believes", "argues", "seems")

---

## Step 5: Test Dark Mode

### 5.1 Enable Dark Mode

1. Open **Settings → Appearance**
2. Toggle **Dark Mode** switch to ON
3. Entire application should transition to dark theme instantly (<1 second)

### 5.2 Verify Across Pages

Navigate to each page and verify dark theme:
- Events list
- Event detail
- Create event form
- Dashboard
- Settings panel

### 5.3 Check Contrast Ratios

1. Open Chrome DevTools (F12)
2. Navigate to **Elements** tab
3. Select text elements
4. Check **Accessibility** panel for contrast ratio
5. Verify all text meets WCAG AA standards:
   - Normal text: ≥4.5:1
   - Large text: ≥3:1

### 5.4 Test Tag Colors in Dark Mode

1. View events with colored tags
2. Verify tag colors are adjusted for dark background
3. Tags should remain distinct and readable

### 5.5 Verify Persistence

1. Close browser completely
2. Reopen application
3. Dark mode should still be enabled

---

## Step 6: Test Domain Intelligence

### 6.1 Add Multiple Sources from Same Domain

1. Create or open an event
2. Add 3-5 sources from the same domain (e.g., all from `nytimes.com`)
3. Assign different bias ratings to each source:
   - Source 1: Bias = -1
   - Source 2: Bias = -2
   - Source 3: Bias = -1
   - Average: -1.33

### 6.2 Test Bias Pre-fill

1. Add a new source from the same domain
2. Observe bias rating field is pre-filled with `-1.33`
3. Domain context displays: `NYTimes: 3 sources, avg bias: -1.33`

### 6.3 Verify Domain Stats

1. Navigate to **Settings → Domain Intelligence** (if available)
2. Or query API directly: `GET /api/domains/nytimes.com/stats`
3. Verify:
   - `totalSources`: 3
   - `avgBiasRating`: -1.33
   - `usageFrequency`: 3
   - `firstSeen` and `lastUsed` timestamps are correct

### 6.4 Test AI Enhancement with Domain Context

1. Extract claims from a source with known domain bias
2. AI should use domain context to improve categorization accuracy
3. Compare accuracy with and without domain context (target: 15% improvement)

---

## Step 7: Test Counter-Narrative Sources

### 7.1 Create Counter-Narrative

1. Open an existing event
2. Scroll to **Counter-Narrative** section
3. Click **Add Counter-Narrative**
4. Enter:
   - **Narrative**: "Administration defends nominee's qualifications"
   - **Admin Position**: "Experience in state government demonstrates capability"

### 7.2 Add Source to Counter-Narrative

1. In counter-narrative section, click **Add Source**
2. Enter URL to article defending nominee
3. Add bias rating
4. Verify source is clearly labeled as "Counter-Narrative Source"

### 7.3 Verify Visual Distinction

1. Compare event sources section with counter-narrative sources section
2. Sections should be visually distinct (different headers, colors, or icons)
3. Same URL can exist in both sections (different perspectives)

### 7.4 Extract Claims from Counter-Narrative Source

1. Click **Extract Claims** on counter-narrative source
2. AI extracts claims from defensive article
3. Verify claims are associated with counter-narrative, not event

---

## Step 8: Run Database Migration

**Note**: This step is only needed if upgrading from Feature 001 with existing counter-narratives that have concernLevel data.

### 8.1 Backup Database

```bash
pg_dump accountability_tracker > backup_pre_migration.sql
```

### 8.2 Run Migration Script

```bash
cd backend
npm run migrate:concern-level
```

### 8.3 Verify Migration

```sql
-- Check events now have concernLevel
SELECT id, title, concern_level FROM events WHERE concern_level IS NOT NULL;

-- Check counter_narratives no longer have concernLevel column
\d counter_narratives  -- Should not show concern_level column
```

### 8.4 Test Migrated Data

1. Open events that previously had counter-narratives with concern levels
2. Verify `concernLevel` field is populated on event
3. Verify data integrity (no loss of concern ratings)

---

## Troubleshooting

### AI Features Not Working

**Symptom**: "API Key Invalid" error

**Solutions**:
1. Verify API key is correct (check for extra spaces)
2. Confirm API key has not expired
3. Check OpenRouter account status and credits
4. Test API key directly: `curl -H "Authorization: Bearer YOUR_KEY" https://openrouter.ai/api/v1/auth/key`

---

### Article Extraction Fails

**Symptom**: "Failed to extract article content"

**Solutions**:
1. **Paywall**: Try a non-paywalled article
2. **CORS**: Backend should handle fetching (not frontend)
3. **JavaScript-rendered**: Use articles with static HTML content
4. **Timeout**: Article may be too large or server too slow

---

### Dark Mode Flicker

**Symptom**: Brief flash of light mode before dark mode applies

**Solutions**:
1. Add inline script in `index.html` to apply theme class before React loads:
   ```html
   <script>
     if (localStorage.getItem('theme') === 'dark') {
       document.documentElement.classList.add('dark');
     }
   </script>
   ```

---

### Domain Stats Inaccurate

**Symptom**: Domain statistics don't match actual source counts

**Solutions**:
1. Check database transactions completed successfully
2. Run validation query from `data-model.md`
3. Rebuild domain stats:
   ```bash
   npm run rebuild:domain-stats
   ```

---

## Testing Checklist

- [ ] OpenRouter API key obtained and configured
- [ ] AI tag suggestions return 3-5 relevant tags in <5 seconds
- [ ] Tag suggestions have ≥70% accuracy
- [ ] Claim extraction completes in <30 seconds
- [ ] Claims are correctly categorized (≥80% accuracy)
- [ ] Dark mode applies instantly across all pages
- [ ] WCAG AA contrast ratios verified
- [ ] Dark mode persists across sessions
- [ ] Domain bias pre-fill works after 3+ sources
- [ ] Domain statistics are accurate within 5%
- [ ] Counter-narrative sources visually distinct from event sources
- [ ] Claim extraction works for counter-narrative sources
- [ ] Database migration completed successfully (if applicable)

---

## Next Steps

After verifying all features work:
1. Run `/speckit.tasks` to generate implementation task list
2. Begin development with P1 features (Settings + Dark Mode)
3. Implement features sequentially (P1 → P2 → P3 → P7)
4. Run tests after each feature completion

---

## Support

If issues persist:
1. Check browser console for JavaScript errors
2. Check backend logs for API errors
3. Verify PostgreSQL database schema matches `data-model.md`
4. Review OpenAPI contracts for request/response formats

**Common Issues**:
- Rate limiting: Wait 60 seconds and retry
- Model unavailable: Switch to alternate model
- Network errors: Check internet connectivity
