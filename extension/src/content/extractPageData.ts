/**
 * Content script to extract page data from the current webpage
 */

export interface PageData {
  url: string
  title: string
  domain: string
  description?: string
  publicationName?: string
  datePublished?: string
  author?: string
}

/**
 * Extract metadata from the current page
 */
export function extractPageData(): PageData {
  const url = window.location.href
  const title = document.title
  const domain = window.location.hostname.replace('www.', '')

  // Try to extract article metadata
  const description = extractDescription()
  const publicationName = extractPublicationName(domain)
  const datePublished = extractPublicationDate()
  const author = extractAuthor()

  return {
    url,
    title,
    domain,
    description,
    publicationName,
    datePublished,
    author,
  }
}

/**
 * Extract article description from meta tags
 */
function extractDescription(): string | undefined {
  // Try Open Graph description
  const ogDesc = document.querySelector('meta[property="og:description"]')
  if (ogDesc) {
    return ogDesc.getAttribute('content') || undefined
  }

  // Try Twitter description
  const twitterDesc = document.querySelector('meta[name="twitter:description"]')
  if (twitterDesc) {
    return twitterDesc.getAttribute('content') || undefined
  }

  // Try standard meta description
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    return metaDesc.getAttribute('content') || undefined
  }

  // Fallback: get first paragraph
  const firstP = document.querySelector('article p, main p, .article p')
  if (firstP) {
    const text = firstP.textContent?.trim()
    if (text && text.length > 50) {
      return text.substring(0, 300) + (text.length > 300 ? '...' : '')
    }
  }

  return undefined
}

/**
 * Extract publication name from the page
 */
function extractPublicationName(domain: string): string | undefined {
  // Try Open Graph site name
  const ogSiteName = document.querySelector('meta[property="og:site_name"]')
  if (ogSiteName) {
    return ogSiteName.getAttribute('content') || undefined
  }

  // Try Twitter site
  const twitterSite = document.querySelector('meta[name="twitter:site"]')
  if (twitterSite) {
    const content = twitterSite.getAttribute('content')
    if (content) {
      return content.replace('@', '')
    }
  }

  // Fallback: capitalize domain
  return domain
    .split('.')[0]
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Extract publication date
 */
function extractPublicationDate(): string | undefined {
  // Try article:published_time
  const ogPublished = document.querySelector('meta[property="article:published_time"]')
  if (ogPublished) {
    const date = ogPublished.getAttribute('content')
    if (date) {
      try {
        return new Date(date).toISOString().split('T')[0]
      } catch {
        // Invalid date
      }
    }
  }

  // Try datePublished schema.org
  const schemaPublished = document.querySelector('[itemprop="datePublished"]')
  if (schemaPublished) {
    const date = schemaPublished.getAttribute('content') || schemaPublished.textContent
    if (date) {
      try {
        return new Date(date).toISOString().split('T')[0]
      } catch {
        // Invalid date
      }
    }
  }

  // Try time element
  const timeElement = document.querySelector('article time, .article time, time[datetime]')
  if (timeElement) {
    const datetime = timeElement.getAttribute('datetime') || timeElement.textContent
    if (datetime) {
      try {
        return new Date(datetime).toISOString().split('T')[0]
      } catch {
        // Invalid date
      }
    }
  }

  return undefined
}

/**
 * Extract author name
 */
function extractAuthor(): string | undefined {
  // Try article:author
  const ogAuthor = document.querySelector('meta[property="article:author"]')
  if (ogAuthor) {
    return ogAuthor.getAttribute('content') || undefined
  }

  // Try author meta tag
  const metaAuthor = document.querySelector('meta[name="author"]')
  if (metaAuthor) {
    return metaAuthor.getAttribute('content') || undefined
  }

  // Try schema.org author
  const schemaAuthor = document.querySelector('[itemprop="author"]')
  if (schemaAuthor) {
    return schemaAuthor.textContent?.trim() || undefined
  }

  // Try byline class
  const byline = document.querySelector('.byline, .author, .article-author')
  if (byline) {
    return byline.textContent?.trim() || undefined
  }

  return undefined
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractPageData') {
    const pageData = extractPageData()
    sendResponse(pageData)
  }
  return true // Keep the message channel open for async response
})
