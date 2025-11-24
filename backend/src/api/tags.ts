import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { tagService } from '../services/tagService.js'
import { createTagSchema, updateTagSchema } from '../models/tag.js'
import { sendSuccess, sendCreated, sendNoContent } from '../lib/response.js'
import { handleError, ValidationError } from '../lib/errors.js'
import { ZodError } from 'zod'

export async function tagRoutes(fastify: FastifyInstance) {
  // GET /api/tags - List all tags
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tags = await tagService.list()
      sendSuccess(reply, tags)
    } catch (error) {
      handleError(error, reply)
    }
  })

  // GET /api/tags/:id - Get single tag
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const tag = await tagService.getById(request.params.id)
      sendSuccess(reply, tag)
    } catch (error) {
      handleError(error, reply)
    }
  })

  // POST /api/tags - Create new tag
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = createTagSchema.parse(request.body)
      const tag = await tagService.create(input)
      sendCreated(reply, tag)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(
          new ValidationError('Invalid tag data', formatZodErrors(error)),
          reply
        )
        return
      }
      handleError(error, reply)
    }
  })

  // PUT /api/tags/:id - Update tag
  fastify.put('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const input = updateTagSchema.parse(request.body)
      const tag = await tagService.update(request.params.id, input)
      sendSuccess(reply, tag)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(
          new ValidationError('Invalid tag data', formatZodErrors(error)),
          reply
        )
        return
      }
      handleError(error, reply)
    }
  })

  // DELETE /api/tags/:id - Delete tag
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await tagService.delete(request.params.id)
      sendNoContent(reply)
    } catch (error) {
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
