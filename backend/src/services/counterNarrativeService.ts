import { PrismaClient } from '@prisma/client'
import type { CounterNarrativeInput, CounterNarrativeResponse } from '../models/counterNarrative.js'
import { NotFoundError } from '../lib/errors.js'

const prisma = new PrismaClient()

function transformCounterNarrative(cn: {
  id: string
  eventId: string
  narrative: string
  adminPosition: string | null
  createdAt: Date
  updatedAt: Date
}): CounterNarrativeResponse {
  return {
    id: cn.id,
    eventId: cn.eventId,
    narrative: cn.narrative,
    adminPosition: cn.adminPosition,
    createdAt: cn.createdAt.toISOString(),
    updatedAt: cn.updatedAt.toISOString(),
  }
}

export const counterNarrativeService = {
  async getByEventId(eventId: string): Promise<CounterNarrativeResponse | null> {
    // First check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      throw new NotFoundError('Event', eventId)
    }

    const counterNarrative = await prisma.counterNarrative.findUnique({
      where: { eventId },
    })

    return counterNarrative ? transformCounterNarrative(counterNarrative) : null
  },

  async upsert(eventId: string, input: CounterNarrativeInput): Promise<CounterNarrativeResponse> {
    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      throw new NotFoundError('Event', eventId)
    }

    const counterNarrative = await prisma.counterNarrative.upsert({
      where: { eventId },
      create: {
        eventId,
        narrative: input.narrative,
        adminPosition: input.adminPosition,
      },
      update: {
        narrative: input.narrative,
        adminPosition: input.adminPosition,
      },
    })

    return transformCounterNarrative(counterNarrative)
  },

  async delete(eventId: string): Promise<void> {
    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      throw new NotFoundError('Event', eventId)
    }

    const counterNarrative = await prisma.counterNarrative.findUnique({
      where: { eventId },
    })

    if (!counterNarrative) {
      throw new NotFoundError('CounterNarrative for event', eventId)
    }

    await prisma.counterNarrative.delete({
      where: { eventId },
    })
  },
}
