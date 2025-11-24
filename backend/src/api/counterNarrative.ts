import { FastifyPluginAsync } from 'fastify'
import { counterNarrativeService } from '../services/counterNarrativeService.js'
import { counterNarrativeSchema } from '../models/counterNarrative.js'
import { sendSuccess, sendNoContent } from '../lib/response.js'
import { ValidationError, handleError } from '../lib/errors.js'

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
}
