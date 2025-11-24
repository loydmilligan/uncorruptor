import { PrismaClient, Prisma } from '@prisma/client'
import type { CreateTagInput, UpdateTagInput } from '../models/tag.js'
import { NotFoundError, ConflictError, BadRequestError } from '../lib/errors.js'

const prisma = new PrismaClient()

// Transform Prisma tag to response format
function transformTag(tag: Prisma.TagGetPayload<{ include: { _count: { select: { events: true } } } }>) {
  return {
    id: tag.id,
    name: tag.name,
    description: tag.description,
    color: tag.color,
    isDefault: tag.isDefault,
    createdAt: tag.createdAt.toISOString(),
    _count: tag._count,
  }
}

function transformTagSimple(tag: Prisma.TagGetPayload<object>) {
  return {
    id: tag.id,
    name: tag.name,
    description: tag.description,
    color: tag.color,
    isDefault: tag.isDefault,
    createdAt: tag.createdAt.toISOString(),
  }
}

export const tagService = {
  async list() {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    })

    return tags.map(transformTag)
  },

  async getById(id: string) {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    })

    if (!tag) {
      throw new NotFoundError('Tag', id)
    }

    return transformTag(tag)
  },

  async create(input: CreateTagInput) {
    // Check if tag name already exists
    const existing = await prisma.tag.findUnique({
      where: { name: input.name },
    })

    if (existing) {
      throw new ConflictError(`Tag with name '${input.name}' already exists`)
    }

    const tag = await prisma.tag.create({
      data: {
        name: input.name,
        description: input.description,
        color: input.color,
        isDefault: false, // User-created tags are never default
      },
    })

    return transformTagSimple(tag)
  },

  async update(id: string, input: UpdateTagInput) {
    const existing = await prisma.tag.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError('Tag', id)
    }

    // Don't allow modifying default tags
    if (existing.isDefault) {
      throw new BadRequestError('Cannot modify default tags')
    }

    // Check name uniqueness if changing name
    if (input.name && input.name !== existing.name) {
      const nameConflict = await prisma.tag.findUnique({
        where: { name: input.name },
      })

      if (nameConflict) {
        throw new ConflictError(`Tag with name '${input.name}' already exists`)
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.color && { color: input.color }),
      },
    })

    return transformTagSimple(tag)
  },

  async delete(id: string) {
    const existing = await prisma.tag.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError('Tag', id)
    }

    // Don't allow deleting default tags
    if (existing.isDefault) {
      throw new BadRequestError('Cannot delete default tags')
    }

    await prisma.tag.delete({ where: { id } })
  },
}
