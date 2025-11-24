import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { sourceService } from '../services/sourceService.js'
import { createSourceSchema, updateSourceSchema } from '../models/source.js'
import { sendSuccess, sendCreated, sendNoContent } from '../lib/response.js'
import { handleError, ValidationError } from '../lib/errors.js'
import { ZodError } from 'zod'

interface SourceParams {
  eventId: string
  sourceId?: string
}

export async function sourceRoutes(fastify: FastifyInstance) {
  // GET /api/events/:eventId/sources - List sources for an event
  fastify.get('/:eventId/sources', async (request: FastifyRequest<{ Params: { eventId: string } }>, reply: FastifyReply) => {
    try {
      const sources = await sourceService.listByEvent(request.params.eventId)
      sendSuccess(reply, sources)
    } catch (error) {
      handleError(error, reply)
    }
  })

  // POST /api/events/:eventId/sources - Create new source
  fastify.post('/:eventId/sources', async (request: FastifyRequest<{ Params: { eventId: string } }>, reply: FastifyReply) => {
    try {
      const input = createSourceSchema.parse(request.body)
      const source = await sourceService.create(request.params.eventId, input)
      sendCreated(reply, source)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(new ValidationError('Invalid source data', formatZodErrors(error)), reply)
        return
      }
      handleError(error, reply)
    }
  })

  // PUT /api/events/:eventId/sources/:sourceId - Update source
  fastify.put('/:eventId/sources/:sourceId', async (request: FastifyRequest<{ Params: SourceParams }>, reply: FastifyReply) => {
    try {
      const input = updateSourceSchema.parse(request.body)
      const source = await sourceService.update(
        request.params.eventId,
        request.params.sourceId!,
        input
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

  // DELETE /api/events/:eventId/sources/:sourceId - Delete source
  fastify.delete('/:eventId/sources/:sourceId', async (request: FastifyRequest<{ Params: SourceParams }>, reply: FastifyReply) => {
    try {
      await sourceService.delete(request.params.eventId, request.params.sourceId!)
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
