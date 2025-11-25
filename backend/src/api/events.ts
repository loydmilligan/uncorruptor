import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { eventService } from '../services/eventService.js'
import { bulkImportService } from '../services/bulkImportService.js'
import { createEventSchema, updateEventSchema, eventQuerySchema } from '../models/event.js'
import { bulkImportSchema } from '../models/bulkImport.js'
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../lib/response.js'
import { handleError, ValidationError } from '../lib/errors.js'
import { ZodError } from 'zod'

export async function eventRoutes(fastify: FastifyInstance) {
  // GET /api/events - List events with filtering and pagination
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = eventQuerySchema.parse(request.query)
      const result = await eventService.list(query)
      sendPaginated(reply, result.data, result.page, result.pageSize, result.total)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(
          new ValidationError('Invalid query parameters', formatZodErrors(error)),
          reply
        )
        return
      }
      handleError(error, reply)
    }
  })

  // GET /api/events/check-duplicates - Check for potential duplicates
  fastify.get('/check-duplicates', async (
    request: FastifyRequest<{ Querystring: { title: string; startDate: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { title, startDate } = request.query
      if (!title || !startDate) {
        throw new ValidationError('Missing required parameters', {
          title: title ? undefined : ['Title is required'],
          startDate: startDate ? undefined : ['Start date is required'],
        })
      }
      const duplicates = await eventService.checkDuplicates(title, startDate)
      sendSuccess(reply, duplicates)
    } catch (error) {
      handleError(error, reply)
    }
  })

  // GET /api/events/:id - Get single event with details
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const event = await eventService.getById(request.params.id)
      sendSuccess(reply, event)
    } catch (error) {
      handleError(error, reply)
    }
  })

  // POST /api/events - Create new event
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = createEventSchema.parse(request.body)
      const event = await eventService.create(input)
      sendCreated(reply, event)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(
          new ValidationError('Invalid event data', formatZodErrors(error)),
          reply
        )
        return
      }
      handleError(error, reply)
    }
  })

  // PUT /api/events/:id - Update event
  fastify.put('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const input = updateEventSchema.parse(request.body)
      const event = await eventService.update(request.params.id, input)
      sendSuccess(reply, event)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(
          new ValidationError('Invalid event data', formatZodErrors(error)),
          reply
        )
        return
      }
      handleError(error, reply)
    }
  })

  // DELETE /api/events/:id - Delete event
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await eventService.delete(request.params.id)
      sendNoContent(reply)
    } catch (error) {
      handleError(error, reply)
    }
  })

  // POST /api/events/bulk - Bulk import events
  fastify.post('/bulk', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const bulkData = bulkImportSchema.parse(request.body)

      // Get options from query params
      const skipDuplicates = request.query?.['skipDuplicates'] !== 'false'
      const createTags = request.query?.['createTags'] !== 'false'

      const result = await bulkImportService.importEvents(bulkData, {
        skipDuplicates,
        createTags,
      })

      sendSuccess(reply, result)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(
          new ValidationError('Invalid bulk import data', formatZodErrors(error)),
          reply
        )
        return
      }
      handleError(error, reply)
    }
  })
}

// Helper to format Zod errors
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
