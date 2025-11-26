import { PrismaClient, Prisma } from '@prisma/client'
import type { CreateSourceInput, UpdateSourceInput } from '../models/source.js'
import { NotFoundError } from '../lib/errors.js'

const prisma = new PrismaClient()

const sourceIncludes = {
  publication: true,
} satisfies Prisma.SourceInclude

function transformSource(source: Prisma.SourceGetPayload<{ include: typeof sourceIncludes }>) {
  return {
    id: source.id,
    eventId: source.eventId,
    counterNarrativeId: source.counterNarrativeId,
    publicationId: source.publicationId,
    url: source.url,
    articleTitle: source.articleTitle,
    biasRating: source.biasRating,
    dateAccessed: source.dateAccessed.toISOString().split('T')[0],
    isArchived: source.isArchived,
    createdAt: source.createdAt.toISOString(),
    publication: source.publication
      ? {
          id: source.publication.id,
          name: source.publication.name,
          domain: source.publication.domain,
          defaultBias: source.publication.defaultBias,
          credibility: source.publication.credibility,
        }
      : null,
  }
}

export const sourceService = {
  async listByEvent(eventId: string) {
    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      throw new NotFoundError('Event', eventId)
    }

    const sources = await prisma.source.findMany({
      where: { eventId },
      include: sourceIncludes,
      orderBy: { createdAt: 'desc' },
    })

    return sources.map(transformSource)
  },

  async listByCounterNarrative(counterNarrativeId: string) {
    // Verify counter-narrative exists
    const counterNarrative = await prisma.counterNarrative.findUnique({
      where: { id: counterNarrativeId }
    })
    if (!counterNarrative) {
      throw new NotFoundError('CounterNarrative', counterNarrativeId)
    }

    const sources = await prisma.source.findMany({
      where: { counterNarrativeId },
      include: sourceIncludes,
      orderBy: { createdAt: 'desc' },
    })

    return sources.map(transformSource)
  },

  async create(parentId: string, input: CreateSourceInput, parentType: 'event' | 'counterNarrative' = 'event') {
    // Verify parent exists (either event or counter-narrative)
    if (parentType === 'event') {
      const event = await prisma.event.findUnique({ where: { id: parentId } })
      if (!event) {
        throw new NotFoundError('Event', parentId)
      }
    } else {
      const counterNarrative = await prisma.counterNarrative.findUnique({ where: { id: parentId } })
      if (!counterNarrative) {
        throw new NotFoundError('CounterNarrative', parentId)
      }
    }

    // Verify publication exists if provided
    if (input.publicationId) {
      const publication = await prisma.publication.findUnique({
        where: { id: input.publicationId },
      })
      if (!publication) {
        throw new NotFoundError('Publication', input.publicationId)
      }
    }

    const source = await prisma.source.create({
      data: {
        eventId: parentType === 'event' ? parentId : null,
        counterNarrativeId: parentType === 'counterNarrative' ? parentId : null,
        url: input.url,
        articleTitle: input.articleTitle,
        biasRating: input.biasRating,
        publicationId: input.publicationId,
        dateAccessed: new Date(),
      },
      include: sourceIncludes,
    })

    return transformSource(source)
  },

  async update(parentId: string, sourceId: string, input: UpdateSourceInput, parentType: 'event' | 'counterNarrative' = 'event') {
    // Verify parent exists
    if (parentType === 'event') {
      const event = await prisma.event.findUnique({ where: { id: parentId } })
      if (!event) {
        throw new NotFoundError('Event', parentId)
      }
    } else {
      const counterNarrative = await prisma.counterNarrative.findUnique({ where: { id: parentId } })
      if (!counterNarrative) {
        throw new NotFoundError('CounterNarrative', parentId)
      }
    }

    // Verify source exists and belongs to parent
    const existing = await prisma.source.findFirst({
      where: {
        id: sourceId,
        ...(parentType === 'event' ? { eventId: parentId } : { counterNarrativeId: parentId }),
      },
    })
    if (!existing) {
      throw new NotFoundError('Source', sourceId)
    }

    const source = await prisma.source.update({
      where: { id: sourceId },
      data: {
        ...(input.url !== undefined && { url: input.url }),
        ...(input.articleTitle !== undefined && { articleTitle: input.articleTitle }),
        ...(input.biasRating !== undefined && { biasRating: input.biasRating }),
        ...(input.isArchived !== undefined && { isArchived: input.isArchived }),
      },
      include: sourceIncludes,
    })

    return transformSource(source)
  },

  async delete(parentId: string, sourceId: string, parentType: 'event' | 'counterNarrative' = 'event') {
    // Verify parent exists
    if (parentType === 'event') {
      const event = await prisma.event.findUnique({ where: { id: parentId } })
      if (!event) {
        throw new NotFoundError('Event', parentId)
      }
    } else {
      const counterNarrative = await prisma.counterNarrative.findUnique({ where: { id: parentId } })
      if (!counterNarrative) {
        throw new NotFoundError('CounterNarrative', parentId)
      }
    }

    // Verify source exists and belongs to parent
    const existing = await prisma.source.findFirst({
      where: {
        id: sourceId,
        ...(parentType === 'event' ? { eventId: parentId } : { counterNarrativeId: parentId }),
      },
    })
    if (!existing) {
      throw new NotFoundError('Source', sourceId)
    }

    await prisma.source.delete({ where: { id: sourceId } })
  },
}
