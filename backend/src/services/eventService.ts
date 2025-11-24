import { PrismaClient, AdminPeriod, Prisma } from '@prisma/client'
import { calculateAdminPeriod } from '../lib/adminPeriod.js'
import type { CreateEventInput, UpdateEventInput, EventQueryParams } from '../models/event.js'
import { NotFoundError, ValidationError } from '../lib/errors.js'

const prisma = new PrismaClient()

// Standard includes for event queries
const eventIncludes = {
  tags: {
    include: {
      tag: true,
    },
  },
  _count: {
    select: {
      sources: true,
    },
  },
} satisfies Prisma.EventInclude

const eventDetailIncludes = {
  tags: {
    include: {
      tag: true,
    },
  },
  sources: {
    include: {
      publication: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  counterNarrative: true,
} satisfies Prisma.EventInclude

// Transform Prisma event to response format
function transformEvent(event: Prisma.EventGetPayload<{ include: typeof eventIncludes }>) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.startDate.toISOString().split('T')[0],
    endDate: event.endDate ? event.endDate.toISOString().split('T')[0] : null,
    adminPeriod: event.adminPeriod,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    tags: event.tags.map((et) => ({
      id: et.tag.id,
      name: et.tag.name,
      description: et.tag.description,
      color: et.tag.color,
      isDefault: et.tag.isDefault,
      isPrimary: et.isPrimary,
    })),
    _count: event._count,
  }
}

function transformEventDetail(
  event: Prisma.EventGetPayload<{ include: typeof eventDetailIncludes }>
) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.startDate.toISOString().split('T')[0],
    endDate: event.endDate ? event.endDate.toISOString().split('T')[0] : null,
    adminPeriod: event.adminPeriod,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    tags: event.tags.map((et) => ({
      id: et.tag.id,
      name: et.tag.name,
      description: et.tag.description,
      color: et.tag.color,
      isDefault: et.tag.isDefault,
      isPrimary: et.isPrimary,
    })),
    sources: event.sources.map((s) => ({
      id: s.id,
      url: s.url,
      articleTitle: s.articleTitle,
      biasRating: s.biasRating,
      dateAccessed: s.dateAccessed.toISOString().split('T')[0],
      isArchived: s.isArchived,
      publication: s.publication
        ? {
            id: s.publication.id,
            name: s.publication.name,
            domain: s.publication.domain,
            defaultBias: s.publication.defaultBias,
            credibility: s.publication.credibility,
          }
        : null,
    })),
    counterNarrative: event.counterNarrative
      ? {
          id: event.counterNarrative.id,
          narrativeText: event.counterNarrative.narrativeText,
          adminStrength: event.counterNarrative.adminStrength,
          concernStrength: event.counterNarrative.concernStrength,
          sourceRefs: event.counterNarrative.sourceRefs,
        }
      : null,
  }
}

export const eventService = {
  async list(params: EventQueryParams) {
    const { page, pageSize, search, tags, adminPeriod, startDate, endDate, sortBy, sortOrder } =
      params

    const where: Prisma.EventWhereInput = {}

    // Search filter - using PostgreSQL full-text search
    if (search) {
      where.OR = [
        { title: { search: search } },
        { description: { search: search } },
      ]
    }

    // Tag filter
    if (tags) {
      const tagIds = tags.split(',').filter(Boolean)
      if (tagIds.length > 0) {
        where.tags = {
          some: {
            tagId: { in: tagIds },
          },
        }
      }
    }

    // Admin period filter
    if (adminPeriod) {
      where.adminPeriod = adminPeriod as AdminPeriod
    }

    // Date range filter - events that overlap with the filter range
    if (startDate || endDate) {
      const dateFilters: Prisma.EventWhereInput[] = []
      if (startDate) {
        // Event ends after filter start (or has no end date)
        dateFilters.push({
          OR: [
            { endDate: { gte: new Date(startDate) } },
            { endDate: null, startDate: { gte: new Date(startDate) } },
          ],
        })
      }
      if (endDate) {
        // Event starts before filter end
        dateFilters.push({ startDate: { lte: new Date(endDate) } })
      }
      if (dateFilters.length > 0) {
        where.AND = dateFilters
      }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: eventIncludes,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.event.count({ where }),
    ])

    return {
      data: events.map(transformEvent),
      total,
      page,
      pageSize,
    }
  },

  async getById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: eventDetailIncludes,
    })

    if (!event) {
      throw new NotFoundError('Event', id)
    }

    return transformEventDetail(event)
  },

  async create(input: CreateEventInput) {
    const startDate = new Date(input.startDate)
    const endDate = input.endDate ? new Date(input.endDate) : null
    const adminPeriod = calculateAdminPeriod(startDate)

    // Validate tags exist
    if (input.tagIds.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: input.tagIds } },
        select: { id: true },
      })

      const existingIds = new Set(existingTags.map((t) => t.id))
      const invalidIds = input.tagIds.filter((id) => !existingIds.has(id))

      if (invalidIds.length > 0) {
        throw new ValidationError('Invalid tag IDs provided', {
          tagIds: [`Tags not found: ${invalidIds.join(', ')}`],
        })
      }
    }

    // Validate primary tag is in tagIds
    if (input.primaryTagId && !input.tagIds.includes(input.primaryTagId)) {
      throw new ValidationError('Primary tag must be in the tag list', {
        primaryTagId: ['Primary tag ID must be included in tagIds'],
      })
    }

    const event = await prisma.event.create({
      data: {
        title: input.title,
        description: input.description,
        startDate,
        endDate,
        adminPeriod,
        tags: {
          create: input.tagIds.map((tagId) => ({
            tagId,
            isPrimary: tagId === input.primaryTagId,
          })),
        },
      },
      include: eventDetailIncludes,
    })

    return transformEventDetail(event)
  },

  async update(id: string, input: UpdateEventInput) {
    // Check event exists
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Event', id)
    }

    // Calculate admin period if start date changed
    let adminPeriod: AdminPeriod | undefined
    if (input.startDate) {
      adminPeriod = calculateAdminPeriod(new Date(input.startDate))
    }

    // Validate tags if provided
    if (input.tagIds && input.tagIds.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: input.tagIds } },
        select: { id: true },
      })

      const existingIds = new Set(existingTags.map((t) => t.id))
      const invalidIds = input.tagIds.filter((id) => !existingIds.has(id))

      if (invalidIds.length > 0) {
        throw new ValidationError('Invalid tag IDs provided', {
          tagIds: [`Tags not found: ${invalidIds.join(', ')}`],
        })
      }

      // Validate primary tag is in tagIds
      if (input.primaryTagId && !input.tagIds.includes(input.primaryTagId)) {
        throw new ValidationError('Primary tag must be in the tag list', {
          primaryTagId: ['Primary tag ID must be included in tagIds'],
        })
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.startDate && { startDate: new Date(input.startDate) }),
        ...(input.endDate !== undefined && { endDate: input.endDate ? new Date(input.endDate) : null }),
        ...(adminPeriod && { adminPeriod }),
        ...(input.tagIds && {
          tags: {
            deleteMany: {},
            create: input.tagIds.map((tagId) => ({
              tagId,
              isPrimary: tagId === input.primaryTagId,
            })),
          },
        }),
      },
      include: eventDetailIncludes,
    })

    return transformEventDetail(event)
  },

  async delete(id: string) {
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Event', id)
    }

    await prisma.event.delete({ where: { id } })
  },
}
