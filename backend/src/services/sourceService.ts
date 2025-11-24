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

  async create(eventId: string, input: CreateSourceInput) {
    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      throw new NotFoundError('Event', eventId)
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
        eventId,
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

  async update(eventId: string, sourceId: string, input: UpdateSourceInput) {
    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      throw new NotFoundError('Event', eventId)
    }

    // Verify source exists and belongs to event
    const existing = await prisma.source.findFirst({
      where: { id: sourceId, eventId },
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

  async delete(eventId: string, sourceId: string) {
    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      throw new NotFoundError('Event', eventId)
    }

    // Verify source exists and belongs to event
    const existing = await prisma.source.findFirst({
      where: { id: sourceId, eventId },
    })
    if (!existing) {
      throw new NotFoundError('Source', sourceId)
    }

    await prisma.source.delete({ where: { id: sourceId } })
  },
}
