import type { Event } from '@/services/api'
import { getBiasLabel, getAdminPeriodShortLabel } from './utils'

/**
 * Generates markdown content for an event, optimized for Obsidian.
 */
export function generateEventMarkdown(event: Event): string {
  const lines: string[] = []

  // YAML frontmatter
  lines.push('---')
  lines.push(`date: ${event.eventDate}`)
  lines.push(`admin_period: ${event.adminPeriod}`)
  if (event.tags.length > 0) {
    lines.push(`tags: [${event.tags.map((t) => t.name).join(', ')}]`)
  }
  lines.push(`created: ${event.createdAt.split('T')[0]}`)
  lines.push(`updated: ${event.updatedAt.split('T')[0]}`)
  if (event.sources && event.sources.length > 0) {
    lines.push(`source_count: ${event.sources.length}`)
  }
  lines.push('---')
  lines.push('')

  // Title
  lines.push(`# ${event.title}`)
  lines.push('')

  // Metadata line
  lines.push(`**Date**: ${event.eventDate} | **Period**: ${getAdminPeriodShortLabel(event.adminPeriod)}`)
  lines.push('')

  // Tags as Obsidian hashtags
  if (event.tags.length > 0) {
    lines.push(event.tags.map((t) => `#${t.name}`).join(' '))
    lines.push('')
  }

  // Description
  if (event.description) {
    lines.push('## Description')
    lines.push('')
    lines.push(event.description)
    lines.push('')
  }

  // Sources
  if (event.sources && event.sources.length > 0) {
    lines.push('## Sources')
    lines.push('')
    for (const source of event.sources) {
      const title = source.articleTitle || 'Untitled'
      const bias = getBiasLabel(source.biasRating)
      const publication = source.publication?.name || 'Unknown'
      const archived = source.isArchived ? ' (archived)' : ''
      lines.push(`- [${title}](${source.url}) - ${bias}, ${publication}${archived}`)
    }
    lines.push('')
  }

  // Counter-narrative
  if (event.counterNarrative) {
    lines.push('## Counter-Narrative')
    lines.push('')
    lines.push("### Administration's Position")
    lines.push('')
    lines.push(event.counterNarrative.narrativeText)
    lines.push('')
    lines.push('### Analysis')
    lines.push('')
    lines.push(`| Perspective | Strength |`)
    lines.push(`|-------------|----------|`)
    lines.push(`| Administration Argument | ${event.counterNarrative.adminStrength} |`)
    lines.push(`| Concern Level | ${event.counterNarrative.concernStrength} |`)
    lines.push('')
    if (event.counterNarrative.sourceRefs) {
      lines.push('### Supporting References')
      lines.push('')
      lines.push(event.counterNarrative.sourceRefs)
      lines.push('')
    }
  }

  return lines.join('\n')
}

/**
 * Generates a safe filename from the event title.
 */
export function generateFilename(event: Event): string {
  const datePrefix = event.eventDate
  const slug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
  return `${datePrefix}-${slug}.md`
}

/**
 * Triggers a download of the markdown file.
 */
export function downloadMarkdown(event: Event): void {
  const content = generateEventMarkdown(event)
  const filename = generateFilename(event)

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Copies the markdown content to clipboard.
 */
export async function copyMarkdownToClipboard(event: Event): Promise<boolean> {
  const content = generateEventMarkdown(event)
  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch {
    return false
  }
}
