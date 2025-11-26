import { FastifyPluginAsync } from 'fastify'
import { counterNarrativeService } from '../services/counterNarrativeService.js'
import { counterNarrativeSchema } from '../models/counterNarrative.js'
import { sourceService } from '../services/sourceService.js'
import { createSourceSchema, updateSourceSchema } from '../models/source.js'
import { sendSuccess, sendCreated, sendNoContent } from '../lib/response.js'
import { ValidationError, handleError } from '../lib/errors.js'
import { ZodError } from 'zod'

export const counterNarrativeRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/events/:eventId/counter-narrative
  fastify.get<{
    Params: { eventId: string }
  }>('/:eventId/counter-narrative', {
    schema: {
      description: 'Get counter-narrative for an event',
      tags: ['Counter-Narratives'],
      params: {
        type: 'object',
        properties: {
          eventId: { type: 'string', format: 'uuid' },
        },
        required: ['eventId'],
      },
      response: {
        200: {
          description: 'Counter-narrative found',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                eventId: { type: 'string' },
                narrativeText: { type: 'string' },
                adminStrength: { type: 'string', enum: ['weak', 'moderate', 'strong'] },
                concernStrength: { type: 'string', enum: ['weak', 'moderate', 'strong'] },
                sourceRefs: { type: 'string', nullable: true },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const counterNarrative = await counterNarrativeService.getByEventId(request.params.eventId)
      sendSuccess(reply, counterNarrative)
    } catch (error) {
      handleError(error, reply)
    }
  })

  // PUT /api/events/:eventId/counter-narrative
  fastify.put<{
    Params: { eventId: string }
    Body: {
      narrativeText: string
      adminStrength: string
      concernStrength: string
      sourceRefs?: string
    }
  }>('/:eventId/counter-narrative', {
    schema: {
      description: 'Create or update counter-narrative for an event',
      tags: ['Counter-Narratives'],
      params: {
        type: 'object',
        properties: {
          eventId: { type: 'string', format: 'uuid' },
        },
        required: ['eventId'],
      },
      body: {
        type: 'object',
        properties: {
          narrativeText: { type: 'string', minLength: 1, maxLength: 10000 },
          adminStrength: { type: 'string', enum: ['weak', 'moderate', 'strong'] },
          concernStrength: { type: 'string', enum: ['weak', 'moderate', 'strong'] },
          sourceRefs: { type: 'string', maxLength: 5000 },
        },
        required: ['narrativeText', 'adminStrength', 'concernStrength'],
      },
      response: {
        200: {
          description: 'Counter-narrative created/updated',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                eventId: { type: 'string' },
                narrativeText: { type: 'string' },
                adminStrength: { type: 'string', enum: ['weak', 'moderate', 'strong'] },
                concernStrength: { type: 'string', enum: ['weak', 'moderate', 'strong'] },
                sourceRefs: { type: 'string', nullable: true },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const parsed = counterNarrativeSchema.safeParse(request.body)
      if (!parsed.success) {
        const details: Record<string, string[]> = {}
        parsed.error.errors.forEach((err) => {
          const field = err.path.join('.')
          if (!details[field]) details[field] = []
          details[field].push(err.message)
        })
        throw new ValidationError('Invalid input', details)
      }

      const counterNarrative = await counterNarrativeService.upsert(
        request.params.eventId,
        parsed.data
      )
      sendSuccess(reply, counterNarrative)
    } catch (error) {
      handleError(error, reply)
    }
  })

  // DELETE /api/events/:eventId/counter-narrative
  fastify.delete<{
    Params: { eventId: string }
  }>('/:eventId/counter-narrative', {
    schema: {
      description: 'Delete counter-narrative for an event',
      tags: ['Counter-Narratives'],
      params: {
        type: 'object',
        properties: {
          eventId: { type: 'string', format: 'uuid' },
        },
        required: ['eventId'],
      },
      response: {
        204: {
          description: 'Counter-narrative deleted',
          type: 'null',
        },
      },
    },
  }, async (request, reply) => {
    try {
      await counterNarrativeService.delete(request.params.eventId)
      sendNoContent(reply)
    } catch (error) {
      handleError(error, reply)
    }
  })

  // Source routes for counter-narratives
  // GET /api/events/:eventId/counter-narrative/:counterNarrativeId/sources
  fastify.get<{
    Params: { eventId: string; counterNarrativeId: string }
  }>('/:eventId/counter-narrative/:counterNarrativeId/sources', async (request, reply) => {
    try {
      const sources = await sourceService.listByCounterNarrative(request.params.counterNarrativeId)
      sendSuccess(reply, sources)
    } catch (error) {
      handleError(error, reply)
    }
  })

  // POST /api/events/:eventId/counter-narrative/:counterNarrativeId/sources
  fastify.post<{
    Params: { eventId: string; counterNarrativeId: string }
  }>('/:eventId/counter-narrative/:counterNarrativeId/sources', async (request, reply) => {
    try {
      const input = createSourceSchema.parse(request.body)
      const source = await sourceService.create(request.params.counterNarrativeId, input, 'counterNarrative')
      sendCreated(reply, source)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(new ValidationError('Invalid source data', formatZodErrors(error)), reply)
        return
      }
      handleError(error, reply)
    }
  })

  // PUT /api/events/:eventId/counter-narrative/:counterNarrativeId/sources/:sourceId
  fastify.put<{
    Params: { eventId: string; counterNarrativeId: string; sourceId: string }
  }>('/:eventId/counter-narrative/:counterNarrativeId/sources/:sourceId', async (request, reply) => {
    try {
      const input = updateSourceSchema.parse(request.body)
      const source = await sourceService.update(
        request.params.counterNarrativeId,
        request.params.sourceId,
        input,
        'counterNarrative'
      )
      sendSuccess(reply, source)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(new ValidationError('Invalid source data', formatZodErrors(error)), reply)
        return
      }
      handleError(error, reply)
    }
  })

  // DELETE /api/events/:eventId/counter-narrative/:counterNarrativeId/sources/:sourceId
  fastify.delete<{
    Params: { eventId: string; counterNarrativeId: string; sourceId: string }
  }>('/:eventId/counter-narrative/:counterNarrativeId/sources/:sourceId', async (request, reply) => {
    try {
      await sourceService.delete(request.params.counterNarrativeId, request.params.sourceId, 'counterNarrative')
      sendNoContent(reply)
    } catch (error) {
      handleError(error, reply)
    }
  })
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(issue.message)
  }
  return formatted
}
