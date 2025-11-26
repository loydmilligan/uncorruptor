/**
 * URL Parser Utility
 * Domain normalization and URL parsing for domain intelligence tracking
 */

import { URL } from 'url';

/**
 * Normalized domain information
 */
export interface NormalizedDomainInfo {
  normalizedDomain: string;
  protocol: string;
  hostname: string;
  subdomain: string | null;
  rootDomain: string;
}

/**
 * Normalize a domain string by:
 * - Converting to lowercase
 * - Removing www prefix
 * - Removing protocol
 * - Removing trailing slashes and paths
 *
 * Examples:
 * - "https://www.NYTimes.com/article" → "nytimes.com"
 * - "HTTP://News.BBC.co.uk/" → "news.bbc.co.uk"
 * - "example.com" → "example.com"
 *
 * @param domain - Domain string to normalize
 * @returns Normalized domain (lowercase, no www, no protocol)
 */
export function normalizeDomain(domain: string): string {
  if (!domain || domain.trim() === '') {
    throw new Error('Domain cannot be empty');
  }

  let cleaned = domain.trim().toLowerCase();

  // Add protocol if missing (required for URL parser)
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const url = new URL(cleaned);
    let hostname = url.hostname;

    // Remove 'www.' prefix
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }

    // Validate domain has at least one dot (TLD required)
    if (!hostname.includes('.')) {
      throw new Error('Invalid domain: must include top-level domain');
    }

    return hostname;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid URL or domain: ${domain}`);
    }
    throw error;
  }
}

/**
 * Extract normalized domain from a full URL
 *
 * Examples:
 * - "https://www.nytimes.com/2025/01/article.html" → "nytimes.com"
 * - "http://news.bbc.co.uk/section?param=value" → "news.bbc.co.uk"
 *
 * @param url - Full URL string
 * @returns Normalized domain
 */
export function extractDomainFromUrl(url: string): string {
  if (!url || url.trim() === '') {
    throw new Error('URL cannot be empty');
  }

  let cleaned = url.trim();

  // Add protocol if missing
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const urlObj = new URL(cleaned);
    return normalizeDomain(urlObj.hostname);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid URL: ${url}`);
    }
    throw error;
  }
}

/**
 * Parse URL into normalized domain information
 *
 * Returns detailed information about the URL structure:
 * - normalizedDomain: Canonical domain (lowercase, no www)
 * - protocol: http or https
 * - hostname: Full hostname including subdomains
 * - subdomain: Subdomain part (null if none, excluding www)
 * - rootDomain: Root domain without subdomains
 *
 * Examples:
 * - "https://news.bbc.co.uk" → {
 *     normalizedDomain: "news.bbc.co.uk",
 *     protocol: "https:",
 *     hostname: "news.bbc.co.uk",
 *     subdomain: "news",
 *     rootDomain: "bbc.co.uk"
 *   }
 * - "http://www.example.com" → {
 *     normalizedDomain: "example.com",
 *     protocol: "http:",
 *     hostname: "www.example.com",
 *     subdomain: null,
 *     rootDomain: "example.com"
 *   }
 *
 * @param url - Full URL string
 * @returns Normalized domain information
 */
export function parseDomainInfo(url: string): NormalizedDomainInfo {
  if (!url || url.trim() === '') {
    throw new Error('URL cannot be empty');
  }

  let cleaned = url.trim();

  // Add protocol if missing
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const urlObj = new URL(cleaned);
    const hostname = urlObj.hostname.toLowerCase();

    // Remove www to get normalized domain
    const normalizedDomain = hostname.startsWith('www.')
      ? hostname.substring(4)
      : hostname;

    // Split domain into parts
    const parts = normalizedDomain.split('.');

    // Determine subdomain and root domain
    let subdomain: string | null = null;
    let rootDomain: string;

    if (parts.length > 2) {
      // Has subdomain (e.g., news.bbc.co.uk)
      // For UK domains (.co.uk), root is last 3 parts
      // For others, root is last 2 parts
      if (parts[parts.length - 2] === 'co' && parts.length > 3) {
        // UK domain: news.bbc.co.uk → subdomain=news, root=bbc.co.uk
        subdomain = parts.slice(0, -3).join('.');
        rootDomain = parts.slice(-3).join('.');
      } else {
        // Regular domain: news.example.com → subdomain=news, root=example.com
        subdomain = parts.slice(0, -2).join('.');
        rootDomain = parts.slice(-2).join('.');
      }
    } else {
      // No subdomain (e.g., example.com)
      subdomain = null;
      rootDomain = normalizedDomain;
    }

    return {
      normalizedDomain,
      protocol: urlObj.protocol,
      hostname,
      subdomain: subdomain || null,
      rootDomain,
    };
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid URL: ${url}`);
    }
    throw error;
  }
}

/**
 * Validate if a string is a valid URL
 *
 * @param url - String to validate
 * @returns true if valid URL, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }

  let cleaned = url.trim();

  // Add protocol if missing
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const urlObj = new URL(cleaned);
    // Must have a hostname with at least one dot
    return urlObj.hostname.includes('.');
  } catch {
    return false;
  }
}

/**
 * Validate if a string is a valid domain
 *
 * @param domain - String to validate
 * @returns true if valid domain, false otherwise
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || domain.trim() === '') {
    return false;
  }

  try {
    const normalized = normalizeDomain(domain);
    // Valid domain must:
    // 1. Contain at least one dot
    // 2. Not contain special characters (handled by URL parser)
    // 3. Not be empty after normalization
    return normalized.includes('.') && normalized.length >= 3;
  } catch {
    return false;
  }
}

/**
 * Check if two URLs are from the same domain
 *
 * @param url1 - First URL
 * @param url2 - Second URL
 * @returns true if both URLs are from the same normalized domain
 */
export function isSameDomain(url1: string, url2: string): boolean {
  try {
    const domain1 = extractDomainFromUrl(url1);
    const domain2 = extractDomainFromUrl(url2);
    return domain1 === domain2;
  } catch {
    return false;
  }
}

/**
 * Get root domain from a URL (without subdomains)
 *
 * Examples:
 * - "https://news.bbc.co.uk" → "bbc.co.uk"
 * - "https://www.nytimes.com" → "nytimes.com"
 *
 * @param url - Full URL string
 * @returns Root domain
 */
export function getRootDomain(url: string): string {
  const info = parseDomainInfo(url);
  return info.rootDomain;
}
