import { PrismaClient } from '@prisma/client'
import { calculateAdminPeriod } from '../lib/adminPeriod.js'
import type { BulkImportData, BulkEventData, BulkImportResult, EventImportResult } from '../models/bulkImport.js'

const prisma = new PrismaClient()

export const bulkImportService = {
  async importEvents(data: BulkImportData, options: {
    skipDuplicates?: boolean
    createTags?: boolean
  } = {}): Promise<BulkImportResult> {
    const { skipDuplicates = true, createTags = true } = options

    const results: EventImportResult[] = []
    let successCount = 0
    let failureCount = 0
    let skippedCount = 0

    // Process each event
    for (const eventData of data.events) {
      try {
        const result = await this.importSingleEvent(eventData, { skipDuplicates, createTags })
        results.push(result)

        if (result.status === 'success') {
          successCount++
        } else if (result.status === 'skipped') {
          skippedCount++
        } else {
          failureCount++
        }
      } catch (error) {
        failureCount++
        results.push({
          eventTitle: eventData.title,
          status: 'failure',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return {
      success: failureCount === 0,
      totalEvents: data.events.length,
      successCount,
      failureCount,
      skippedCount,
      results,
    }
  },

  async importSingleEvent(
    eventData: BulkEventData,
    options: { skipDuplicates: boolean; createTags: boolean }
  ): Promise<EventImportResult> {
    const { skipDuplicates, createTags } = options

    // Check for duplicates
    if (skipDuplicates) {
      const existing = await prisma.event.findFirst({
        where: {
          title: eventData.title,
          startDate: new Date(eventData.startDate),
        },
      })

      if (existing) {
        return {
          eventTitle: eventData.title,
          status: 'skipped',
          details: 'Event with same title and start date already exists',
        }
      }
    }

    // Process tags
    const tagIds = await this.processEventTags(eventData.tags, createTags)
    if (tagIds.length === 0 && eventData.tags.length > 0) {
      return {
        eventTitle: eventData.title,
        status: 'failure',
        error: 'Could not find or create tags',
      }
    }

    // Validate primary tag
    let primaryTagId: string | undefined
    if (eventData.primaryTag) {
      const primaryTag = await prisma.tag.findFirst({
        where: { name: eventData.primaryTag },
      })
      if (primaryTag && tagIds.includes(primaryTag.id)) {
        primaryTagId = primaryTag.id
      }
    }

    // Calculate admin period
    const startDate = new Date(eventData.startDate)
    const endDate = eventData.endDate ? new Date(eventData.endDate) : null
    const adminPeriod = calculateAdminPeriod(startDate)

    // Create event with nested data
    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description || null,
        startDate,
        endDate,
        adminPeriod,
        tags: {
          create: tagIds.map((tagId) => ({
            tagId,
            isPrimary: tagId === primaryTagId,
          })),
        },
      },
    })

    // Add sources
    if (eventData.sources && eventData.sources.length > 0) {
      for (const sourceData of eventData.sources) {
        await this.addSource(event.id, sourceData)
      }
    }

    // Add counter-narrative
    if (eventData.counterNarrative) {
      await prisma.counterNarrative.create({
        data: {
          eventId: event.id,
          narrative: eventData.counterNarrative.narrative,
          adminPosition: eventData.counterNarrative.adminPosition || null,
        },
      })
    }

    // Store extended data in metadata (for future use)
    // This would require adding a metadata JSONB column to Event table
    // For now, we'll just track that we successfully imported

    return {
      eventTitle: eventData.title,
      status: 'success',
      eventId: event.id,
      details: `Created event with ${eventData.sources?.length || 0} sources`,
    }
  },

  async processEventTags(tagNames: string[], createIfMissing: boolean): Promise<string[]> {
    const tagIds: string[] = []

    for (const tagName of tagNames) {
      // Try to find existing tag
      let tag = await prisma.tag.findFirst({
        where: { name: tagName },
      })

      // Create if not found and allowed
      if (!tag && createIfMissing) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            description: `Auto-created from bulk import`,
            isDefault: false,
          },
        })
      }

      if (tag) {
        tagIds.push(tag.id)
      }
    }

    return tagIds
  },

  async addSource(eventId: string, sourceData: any): Promise<void> {
    // Try to find or create publication from URL
    let publicationId: string | undefined

    try {
      const url = new URL(sourceData.url)
      const domain = url.hostname.replace('www.', '')

      // Look up publication by domain
      let publication = await prisma.publication.findFirst({
        where: { domain },
      })

      if (publication) {
        publicationId = publication.id
      } else if (sourceData.publicationOverride) {
        // Create publication if override provided
        publication = await prisma.publication.create({
          data: {
            name: sourceData.publicationOverride,
            domain,
            defaultBias: sourceData.biasRating || 0,
          },
        })
        publicationId = publication.id
      }
    } catch (error) {
      // Invalid URL, continue without publication
    }

    // Create source
    await prisma.source.create({
      data: {
        eventId,
        publicationId: publicationId || null,
        url: sourceData.url,
        articleTitle: sourceData.articleTitle || null,
        biasRating: sourceData.biasRating,
        dateAccessed: sourceData.dateAccessed ? new Date(sourceData.dateAccessed) : new Date(),
      },
    })
  },
}
