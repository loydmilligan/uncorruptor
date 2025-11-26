/**
 * Article Parser Service
 * Extracts clean, readable content from web articles using Mozilla Readability
 */

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export interface ArticleContent {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline?: string;
  siteName?: string;
}

export interface FetchOptions {
  timeout?: number;
  userAgent?: string;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (compatible; AccountabilityTracker/1.0; +https://github.com/accountability-tracker)';

/**
 * Fetch article HTML with timeout and proper user agent
 */
export async function fetchArticle(
  url: string,
  options: FetchOptions = {}
): Promise<string> {
  const { timeout = DEFAULT_TIMEOUT, userAgent = DEFAULT_USER_AGENT } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403 || response.status === 402) {
        throw new PaywallError(`Article appears to be behind a paywall (${response.status})`);
      }
      throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Simple paywall detection
    if (detectPaywall(html)) {
      throw new PaywallError('Article appears to be behind a paywall (content detection)');
    }

    return html;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof PaywallError) {
      throw error;
    }

    if ((error as Error).name === 'AbortError') {
      throw new Error(`Article fetch timed out after ${timeout}ms`);
    }

    throw error;
  }
}

/**
 * Simple paywall detection heuristics
 */
function detectPaywall(html: string): boolean {
  const paywallIndicators = [
    /subscribe to (read|continue)/i,
    /subscription required/i,
    /sign up to unlock/i,
    /become a (member|subscriber)/i,
    /paywall/i,
    /limited access/i,
    /premium content/i,
  ];

  const lowerHtml = html.toLowerCase();
  return paywallIndicators.some((pattern) => pattern.test(lowerHtml));
}

/**
 * Extract clean content from article HTML using Readability
 */
export function extractContent(html: string, url: string): ArticleContent | null {
  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return null;
    }

    return {
      title: article.title || 'Untitled',
      content: article.content || '',
      textContent: article.textContent || '',
      length: article.length || 0,
      excerpt: article.excerpt || '',
      byline: article.byline || undefined,
      siteName: article.siteName || undefined,
    };
  } catch (error) {
    console.error('Failed to parse article:', error);
    return null;
  }
}

/**
 * Fetch and parse article in one operation
 */
export async function fetchAndParse(
  url: string,
  options: FetchOptions = {}
): Promise<ArticleContent> {
  const html = await fetchArticle(url, options);
  const content = extractContent(html, url);

  if (!content) {
    throw new Error('Failed to extract readable content from article');
  }

  return content;
}

/**
 * Summarize article content for large articles (>5000 words)
 * Returns either full content or truncated summary
 */
export function summarizeContent(content: string, maxWords: number = 5000): string {
  const words = content.split(/\s+/);

  if (words.length <= maxWords) {
    return content;
  }

  // Truncate to maxWords and add ellipsis
  const truncated = words.slice(0, maxWords).join(' ');
  return `${truncated}... [Content truncated for AI processing - ${words.length} total words]`;
}

/**
 * Custom error for paywall detection
 */
export class PaywallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaywallError';
  }
}
