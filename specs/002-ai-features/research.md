# Research: AI-Enhanced Accountability Tracking

**Feature**: 002-ai-features
**Date**: 2025-11-25
**Purpose**: Technical research to resolve implementation unknowns from planning phase

---

## 1. OpenRouter Integration Patterns

### Decision: OpenRouter REST API with Bearer Token Authentication

**Rationale**:
- OpenRouter provides unified API for multiple AI models (GLM-4.5-Air free, Grok-Code paid)
- Standard REST API with JSON request/response simplifies integration
- Bearer token authentication is straightforward for backend-to-API communication
- No SDK required - direct HTTP calls with fetch/axios

**Implementation Approach**:
```typescript
// Backend service
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.APP_URL, // Required by OpenRouter
  },
  body: JSON.stringify({
    model: modelId, // 'z-ai/glm-4.5-air:free' or 'x-ai/grok-code-fast-1'
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 500
  })
});
```

**Prompt Engineering Best Practices**:
- **Tag Suggestions**: System prompt defines available tags and categorization rules; user prompt provides event context
- **Claim Extraction**: System prompt defines claim categories (factual/opinion/speculation) with examples; user prompt provides article text + domain bias context
- Use structured output format (JSON) for easy parsing
- Include confidence scores in prompts ("rate confidence 0-1")
- Provide examples (few-shot learning) for better categorization

**Error Handling**:
- 401 Unauthorized → Invalid API key, prompt user to check settings
- 429 Rate Limit → Exponential backoff (1s, 2s, 4s) up to 3 retries
- 500/503 Service Error → Display "AI service temporarily unavailable"
- Timeout (>10s) → Cancel request, allow manual workflow
- Network error → Fall back to manual tagging/claim entry

**Alternatives Considered**:
- Direct OpenAI API: More expensive, user must manage OpenAI account
- Local LLM (Ollama): Complex setup for users, performance constraints
- Anthropic Claude: Higher cost, OpenRouter provides multi-model flexibility

---

## 2. Article Content Extraction

### Decision: @mozilla/readability for Node.js Backend

**Rationale**:
- Mozilla Readability is battle-tested (Firefox Reader Mode uses it)
- Pure JavaScript, no native dependencies, easy to install
- Extracts clean article text while removing ads, navigation, footers
- Preserves article structure (headings, paragraphs) for better AI analysis
- MIT license, actively maintained

**Implementation Approach**:
```typescript
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

async function extractArticleContent(url: string): Promise<ArticleContent> {
  // Fetch HTML with user-agent to avoid bot blocking
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AccountabilityBot/1.0)' },
    timeout: 10000 // 10 second timeout
  });

  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error('Failed to extract article content');
  }

  return {
    title: article.title,
    content: article.textContent, // Plain text, no HTML
    excerpt: article.excerpt,
    length: article.length
  };
}
```

**Handling Edge Cases**:
- **Paywalls**: Detect HTTP 403 or subscription prompts in HTML; return error "Article behind paywall"
- **CORS Issues**: Backend fetches articles (not frontend) to avoid CORS restrictions
- **JavaScript-Rendered Content**: Readability works on static HTML; for JS-heavy sites, accept limitations or skip
- **Large Articles**: Truncate to first 5000 words before sending to AI (within context limits)

**Content Summarization Strategy**:
- If article >5000 words: Extract first 3 paragraphs + last 2 paragraphs (context + conclusion)
- Use article excerpt if available (Readability provides it)
- Preserve key quotes and factual statements (identify with regex patterns like numbers, dates, names)

**Alternatives Considered**:
- Puppeteer/Playwright: Renders JavaScript but adds complexity, slower, memory-intensive
- Cheerio + custom parsing: Less robust than Readability, would require maintenance
- Third-party API (Mercury, Diffbot): Costs money, adds external dependency

---

## 3. Dark Mode Implementation

### Decision: CSS Variables + Tailwind Dark Mode Utilities

**Rationale**:
- CSS variables provide dynamic theming without class duplication
- Tailwind's `dark:` variant simplifies component-level customization
- Matches existing TailwindCSS setup (already in project)
- One CSS class toggle (`<html class="dark">`) updates entire app
- Easy to test contrast ratios with browser dev tools

**Implementation Approach**:
```css
/* themes.css */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border: #e5e7eb;
  --accent: #3b82f6;
}

:root.dark {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border: #374151;
  --accent: #60a5fa;
}

/* Tailwind config: tailwind.config.js */
module.exports = {
  darkMode: 'class', // Use class-based dark mode
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'text-primary': 'var(--text-primary)',
        // ... map all CSS variables
      }
    }
  }
}
```

```typescript
// useTheme.ts hook
function useTheme() {
  const [isDark, setIsDark] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggleTheme: () => setIsDark(!isDark) };
}
```

**WCAG AA Contrast Requirements**:
- Normal text (16px): Minimum 4.5:1 contrast ratio
- Large text (24px+): Minimum 3:1 contrast ratio
- Test with Chrome DevTools Contrast Checker or axe DevTools
- Audit key pages: Events list, Event detail, Settings panel, Dashboard

**Handling Custom Tag Colors**:
- Store original tag colors in database
- Apply color transformation in dark mode:
  ```typescript
  function adjustColorForDarkMode(hexColor: string): string {
    // Increase lightness by 20% for dark backgrounds
    // Or use complementary color if contrast insufficient
    // Libraries: chroma-js, tinycolor2
  }
  ```
- Alternative: Use predefined dark-mode-safe color palette for tags

**Alternatives Considered**:
- Class-based theming (no CSS variables): Harder to customize, more code duplication
- Separate CSS files for light/dark: Causes flicker on load, bundle size increase
- System preference only (no toggle): Less user control, spec requires toggle

---

## 4. LocalStorage Best Practices

### Decision: LocalStorage with JSON Serialization, No Encryption

**Rationale**:
- LocalStorage is synchronous, simple API, supported in all modern browsers
- 5-10MB limit is sufficient for settings (~1KB total)
- API keys are *user-controlled* and *user-provided* - not system secrets
- Encryption adds complexity with limited security benefit (keys accessible via DevTools regardless)
- Settings are per-origin, isolated from other sites

**Implementation Approach**:
```typescript
// storage.ts
interface AppSettings {
  aiApiKey?: string;
  aiModel: 'free' | 'paid';
  theme: 'light' | 'dark';
}

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: JSON.stringify(value)
    }));
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  }
};
```

**Settings Synchronization Across Tabs**:
```typescript
// In React component
useEffect(() => {
  function handleStorageChange(e: StorageEvent) {
    if (e.key === 'appSettings' && e.newValue) {
      setSettings(JSON.parse(e.newValue));
    }
  }
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

**Size Limits and Quota Management**:
- Settings object: ~500 bytes (API key: ~200 bytes, model: 10 bytes, theme: 10 bytes)
- No quota concerns with current scope
- Monitor with: `navigator.storage.estimate()` (if needed)

**Security Considerations**:
- API key is user's responsibility (like any personal API key in a web app)
- No XSS vulnerabilities (React escapes output by default)
- Warn user not to share screenshots with API key visible
- Consider adding "Show/Hide API Key" toggle in settings UI

**Alternatives Considered**:
- IndexedDB: Overkill for small key-value storage, async API adds complexity
- SessionStorage: Settings wouldn't persist across browser sessions (spec requires persistence)
- Backend storage: Requires authentication (not in scope), adds server round-trip

---

## 5. Domain Intelligence Architecture

### Decision: Real-Time Aggregation with PostgreSQL Materialized Statistics

**Rationale**:
- PostgreSQL aggregation queries are fast for <500 domains
- Real-time computation on write provides instant feedback (better UX)
- No background job scheduler needed (simpler architecture)
- Aggregation query executes only when sources are added (not on every read)

**Implementation Approach**:

**URL Parsing and Normalization**:
```typescript
import { URL } from 'url';

function normalizeDomain(urlString: string): string {
  try {
    const url = new URL(urlString);
    let domain = url.hostname.toLowerCase();

    // Remove www prefix
    if (domain.startsWith('www.')) {
      domain = domain.slice(4);
    }

    return domain;
  } catch {
    throw new Error('Invalid URL');
  }
}

// Examples:
// 'https://www.nytimes.com/article' → 'nytimes.com'
// 'http://blog.example.org/post' → 'blog.example.org'
```

**Subdomain Handling Strategy**:
- **Default**: Keep subdomains separate (blog.example.com ≠ example.com)
- **Rationale**: Different subdomains may have different bias (e.g., opinion.nytimes.com vs nytimes.com)
- **Implementation**: Track as distinct domains, aggregate statistics separately
- **Future Enhancement**: Group by root domain if user requests it

**Domain Statistics Schema** (PostgreSQL):
```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY,
  normalized_domain VARCHAR(253) UNIQUE NOT NULL,
  total_sources INT DEFAULT 0,
  avg_bias_rating DECIMAL(3,2),
  usage_frequency INT DEFAULT 0, -- Number of times added
  first_seen TIMESTAMP NOT NULL DEFAULT NOW(),
  last_used TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_domains_normalized ON domains(normalized_domain);
```

**Real-Time Aggregation Logic**:
```typescript
// On source creation
async function createSource(sourceData: SourceInput) {
  const domain = normalizeDomain(sourceData.url);

  // Begin transaction
  await prisma.$transaction(async (tx) => {
    // Create source
    const source = await tx.source.create({ data: sourceData });

    // Update or create domain stats
    const existingDomain = await tx.domain.findUnique({
      where: { normalizedDomain: domain }
    });

    if (existingDomain) {
      // Incremental update (more efficient than full re-aggregation)
      const newTotal = existingDomain.totalSources + 1;
      const newAvgBias = (
        (existingDomain.avgBiasRating * existingDomain.totalSources) + sourceData.biasRating
      ) / newTotal;

      await tx.domain.update({
        where: { id: existingDomain.id },
        data: {
          totalSources: newTotal,
          avgBiasRating: newAvgBias,
          usageFrequency: { increment: 1 },
          lastUsed: new Date()
        }
      });
    } else {
      // First source for this domain
      await tx.domain.create({
        data: {
          normalizedDomain: domain,
          totalSources: 1,
          avgBiasRating: sourceData.biasRating,
          usageFrequency: 1,
          firstSeen: new Date(),
          lastUsed: new Date()
        }
      });
    }
  });
}
```

**Performance Considerations**:
- Transaction overhead: ~2-5ms per source creation (negligible)
- Aggregation query: O(1) with incremental calculation (no full table scan)
- Index on `normalized_domain` ensures fast lookups
- Suitable for single-user application with <1000 sources/year

**Alternatives Considered**:
- Batch aggregation (cron job): Delayed stats, adds complexity
- Separate aggregate table with triggers: PostgreSQL triggers add complexity, incremental logic is simpler
- Full re-aggregation on every read: Slower, wasteful for reads >> writes

---

## Summary of Technology Choices

| Component | Technology | Key Benefit |
|-----------|-----------|-------------|
| AI Integration | OpenRouter REST API | Multi-model access, simple HTTP |
| Article Parsing | @mozilla/readability | Battle-tested, clean extraction |
| Dark Mode | CSS Variables + Tailwind | Dynamic theming, no duplication |
| Settings Storage | LocalStorage + JSON | Simple, synchronous, sufficient |
| Domain Tracking | PostgreSQL real-time aggregation | Instant feedback, no jobs |

**All research complete. No NEEDS CLARIFICATION remaining.**
